-- Allow public read of non-sensitive config columns only
CREATE POLICY "Anyone can read public config"
ON public.system_config
FOR SELECT
TO anon, authenticated
USING (true);

REVOKE SELECT ON public.system_config FROM anon, authenticated;

GRANT SELECT (id, app_name, logo_url, theme_dark, environment_themes, environment_maintenance, updated_at)
ON public.system_config TO anon, authenticated;

GRANT SELECT ON public.system_config TO service_role;

-- View now enforces the querying user's permissions (no SECURITY DEFINER behavior)
ALTER VIEW public.system_config_public SET (security_invoker = true);

GRANT SELECT ON public.system_config_public TO anon, authenticated;