
-- 1) Invite tokens: replace user UPDATE policy with secure RPC
DROP POLICY IF EXISTS "Users can mark token as used" ON public.invite_tokens;

CREATE OR REPLACE FUNCTION public.consume_invite_token(_token text, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rows int;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.invite_tokens
     SET used_by = _user_id,
         used_at = now(),
         status  = 'used'
   WHERE token = _token
     AND status = 'active'
     AND used_at IS NULL
     AND expires_at > now();

  GET DIAGNOSTICS _rows = ROW_COUNT;
  RETURN _rows > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_invite_token(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_invite_token(text, uuid) TO authenticated;

-- 2) system_config: restrict raw table SELECT to admins; keep public view readable
DROP POLICY IF EXISTS "Anyone can read system config" ON public.system_config;

CREATE POLICY "Admins can read system config"
ON public.system_config
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Recreate the public view as SECURITY DEFINER so it bypasses RLS on the base table
DROP VIEW IF EXISTS public.system_config_public;
CREATE VIEW public.system_config_public
WITH (security_invoker = false) AS
SELECT id, app_name, logo_url, theme_dark, environment_themes, updated_at
FROM public.system_config;

GRANT SELECT ON public.system_config_public TO anon, authenticated;
