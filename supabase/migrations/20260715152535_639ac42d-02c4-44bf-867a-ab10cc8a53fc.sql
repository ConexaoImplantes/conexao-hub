
-- Utility: normalize a person's name to Title Case (PT-BR aware).
CREATE OR REPLACE FUNCTION public.normalize_person_name(_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  parts text[];
  result text := '';
  w text;
  lw text;
  i int;
  particles text[] := ARRAY['de','da','do','dos','das','e','di','du','del','la','van','von','y'];
BEGIN
  IF _name IS NULL THEN RETURN NULL; END IF;
  _name := btrim(regexp_replace(_name, '\s+', ' ', 'g'));
  IF _name = '' THEN RETURN ''; END IF;
  parts := string_to_array(_name, ' ');
  FOR i IN 1..array_length(parts, 1) LOOP
    w := parts[i];
    lw := lower(w);
    IF i > 1 AND lw = ANY(particles) THEN
      result := result || CASE WHEN result = '' THEN '' ELSE ' ' END || lw;
    ELSE
      -- Title-case each hyphen-separated segment
      result := result || CASE WHEN result = '' THEN '' ELSE ' ' END || (
        SELECT string_agg(initcap(seg), '-')
        FROM unnest(string_to_array(lw, '-')) AS seg
      );
    END IF;
  END LOOP;
  RETURN result;
END;
$$;

-- Update handle_new_user to normalize the name on account creation.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, whatsapp, cro, status, preferences)
  VALUES (
    NEW.id,
    NEW.email,
    public.normalize_person_name(COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário')),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
    NEW.raw_user_meta_data->>'cro',
    'pending',
    '{"language":"pt-br"}'::jsonb
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.app_role,
      'client'
    )
  );

  RETURN NEW;
END;
$$;

-- One-shot backfill: normalize every existing profile name.
UPDATE public.profiles
   SET name = public.normalize_person_name(name)
 WHERE name IS NOT NULL
   AND name <> public.normalize_person_name(name);
