
ALTER TABLE public.system_config
  ADD COLUMN IF NOT EXISTS environment_maintenance jsonb NOT NULL DEFAULT '{}'::jsonb;

DROP VIEW IF EXISTS public.system_config_public;
CREATE VIEW public.system_config_public AS
  SELECT id, app_name, logo_url, theme_dark, environment_themes, environment_maintenance, updated_at
  FROM public.system_config;

GRANT SELECT ON public.system_config_public TO anon, authenticated;
