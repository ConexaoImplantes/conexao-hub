
-- 1) invite_tokens: remove blanket SELECT policies
DROP POLICY IF EXISTS "Anon can validate tokens" ON public.invite_tokens;
DROP POLICY IF EXISTS "Authenticated can validate tokens" ON public.invite_tokens;

-- Secure RPC: returns minimal info for a single token if active
CREATE OR REPLACE FUNCTION public.validate_invite_token(_token text)
RETURNS TABLE(id uuid, role public.app_role, expires_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.role, t.expires_at
  FROM public.invite_tokens t
  WHERE t.token = _token
    AND t.status = 'active'
    AND t.used_at IS NULL
    AND t.expires_at > now()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.validate_invite_token(text) FROM public;
GRANT EXECUTE ON FUNCTION public.validate_invite_token(text) TO anon, authenticated;

-- 2) trail-covers: require super_admin for mutations
DROP POLICY IF EXISTS "Authenticated users can upload trail covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update trail covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete trail covers" ON storage.objects;

CREATE POLICY "Super admins can upload trail covers"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trail-covers' AND public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Super admins can update trail covers"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'trail-covers' AND public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Super admins can delete trail covers"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'trail-covers' AND public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- 3) Recreate system_config_public with SECURITY INVOKER
DROP VIEW IF EXISTS public.system_config_public;
CREATE VIEW public.system_config_public
WITH (security_invoker = true) AS
SELECT id, app_name, logo_url, theme_light, theme_dark, theme_mode, environment_themes, updated_at
FROM public.system_config;

GRANT SELECT ON public.system_config_public TO anon, authenticated;
