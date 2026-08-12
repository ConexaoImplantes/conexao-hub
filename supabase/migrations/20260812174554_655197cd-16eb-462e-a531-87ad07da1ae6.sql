-- Remove overly permissive public read on the full table
DROP POLICY IF EXISTS "Anyone can read public config" ON public.system_config;

REVOKE SELECT ON public.system_config FROM anon, authenticated;
GRANT SELECT ON public.system_config TO authenticated;

-- Safe, column-limited accessor
CREATE OR REPLACE FUNCTION public.get_public_config()
RETURNS TABLE (
  id integer,
  app_name text,
  logo_url text,
  theme_dark jsonb,
  environment_themes jsonb,
  environment_maintenance jsonb,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sc.id, sc.app_name, sc.logo_url, sc.theme_dark,
         sc.environment_themes, sc.environment_maintenance, sc.updated_at
  FROM public.system_config sc
  WHERE sc.id = 1
$$;

GRANT EXECUTE ON FUNCTION public.get_public_config() TO anon, authenticated, service_role;

DROP VIEW IF EXISTS public.system_config_public;
CREATE VIEW public.system_config_public
WITH (security_invoker = true) AS
SELECT * FROM public.get_public_config();

GRANT SELECT ON public.system_config_public TO anon, authenticated, service_role;