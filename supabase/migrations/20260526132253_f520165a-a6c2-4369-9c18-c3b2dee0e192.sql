
-- 1) Recreate public view without theme_light / theme_mode
DROP VIEW IF EXISTS public.system_config_public;
CREATE VIEW public.system_config_public
WITH (security_invoker = true) AS
SELECT id, app_name, logo_url, theme_dark, environment_themes, updated_at
FROM public.system_config;

GRANT SELECT ON public.system_config_public TO anon, authenticated;

-- 2) Drop legacy columns
ALTER TABLE public.system_config DROP COLUMN IF EXISTS theme_light;
ALTER TABLE public.system_config DROP COLUMN IF EXISTS theme_mode;

-- 3) Profiles: remove theme key + adjust default
ALTER TABLE public.profiles
  ALTER COLUMN preferences SET DEFAULT '{"language":"pt-br"}'::jsonb;

UPDATE public.profiles
SET preferences = preferences - 'theme'
WHERE preferences ? 'theme';

-- 4) Update handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, whatsapp, cro, status, preferences)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
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
$function$;
