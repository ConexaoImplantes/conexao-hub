DROP VIEW IF EXISTS public.system_config_public;
CREATE VIEW public.system_config_public AS
  SELECT id, app_name, logo_url, theme_light, theme_dark, theme_mode, updated_at
  FROM public.system_config;