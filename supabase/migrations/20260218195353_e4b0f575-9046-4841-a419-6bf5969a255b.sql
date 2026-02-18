
-- Fix materials RLS: drop restrictive policies and recreate as permissive (default)
DROP POLICY IF EXISTS "Admins can manage materials" ON public.materials;
DROP POLICY IF EXISTS "Users can view allowed materials" ON public.materials;

CREATE POLICY "Admins can manage materials"
ON public.materials
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view allowed materials"
ON public.materials
FOR SELECT
TO authenticated
USING (
  (active = true) AND (get_user_role(auth.uid()) = ANY (allowed_roles))
);

-- Fix material_assets RLS: same issue
DROP POLICY IF EXISTS "Admins can manage material assets" ON public.material_assets;
DROP POLICY IF EXISTS "Users can view assets of allowed materials" ON public.material_assets;

CREATE POLICY "Admins can manage material assets"
ON public.material_assets
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Users can view assets of allowed materials"
ON public.material_assets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.materials m
    WHERE m.id = material_assets.material_id
      AND m.active = true
      AND (get_user_role(auth.uid()) = ANY (m.allowed_roles))
  )
);
