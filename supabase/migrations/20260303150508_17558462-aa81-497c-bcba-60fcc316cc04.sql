-- Create storage bucket for trail cover images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trail-covers', 'trail-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to trail covers
CREATE POLICY "Trail covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'trail-covers');

-- Allow authenticated users (admins) to upload trail covers
CREATE POLICY "Authenticated users can upload trail covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trail-covers');

-- Allow authenticated users to update trail covers
CREATE POLICY "Authenticated users can update trail covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'trail-covers');

-- Allow authenticated users to delete trail covers
CREATE POLICY "Authenticated users can delete trail covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'trail-covers');