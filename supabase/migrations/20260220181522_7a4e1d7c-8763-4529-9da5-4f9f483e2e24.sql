-- Create a secure view for system_config that hides webhook_url from non-admins
CREATE OR REPLACE VIEW public.system_config_public
WITH (security_invoker=on) AS
  SELECT id, app_name, logo_url, theme_light, theme_dark, updated_at
  FROM public.system_config;

-- Allow anyone to read the public view
GRANT SELECT ON public.system_config_public TO anon, authenticated;