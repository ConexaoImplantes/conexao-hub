-- Create storage bucket for branding assets (logos, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read branding files (public logos)
CREATE POLICY "Public read access for branding"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

-- Only super_admin can upload branding files
CREATE POLICY "Super admins can upload branding"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'branding' 
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- Only super_admin can update branding files
CREATE POLICY "Super admins can update branding"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'branding' 
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- Only super_admin can delete branding files
CREATE POLICY "Super admins can delete branding"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'branding' 
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);