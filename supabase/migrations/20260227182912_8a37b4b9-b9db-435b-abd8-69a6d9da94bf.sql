
-- Create materials storage bucket (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('materials', 'materials', true, 5242880, ARRAY['text/html']);

-- RLS: anyone can read (public bucket)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'materials');

-- RLS: only super_admin can upload
CREATE POLICY "Admins can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'materials'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- RLS: only super_admin can update
CREATE POLICY "Admins can update materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'materials'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- RLS: only super_admin can delete
CREATE POLICY "Admins can delete materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'materials'
  AND public.has_role(auth.uid(), 'super_admin'::public.app_role)
);
