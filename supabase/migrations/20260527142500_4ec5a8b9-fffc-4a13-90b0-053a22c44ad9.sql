
-- Restore the public-readable invoker view
DROP VIEW IF EXISTS public.system_config_public;
CREATE VIEW public.system_config_public
WITH (security_invoker = true) AS
SELECT id, app_name, logo_url, theme_dark, environment_themes, updated_at
FROM public.system_config;
GRANT SELECT ON public.system_config_public TO anon, authenticated;

-- Restore broad SELECT on the table (for the view to work under security_invoker)
DROP POLICY IF EXISTS "Admins can read system config" ON public.system_config;
CREATE POLICY "Anyone can read system config"
ON public.system_config
FOR SELECT
TO anon, authenticated
USING (true);

-- Use column-level grants to hide webhook_url from anon/authenticated.
REVOKE SELECT ON public.system_config FROM anon, authenticated;
GRANT SELECT (id, app_name, logo_url, theme_dark, environment_themes, updated_at)
  ON public.system_config TO anon, authenticated;
GRANT INSERT, UPDATE ON public.system_config TO authenticated;
GRANT ALL ON public.system_config TO service_role;
