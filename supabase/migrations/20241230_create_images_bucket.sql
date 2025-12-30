-- Create images bucket for file uploads
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Allow anyone to upload files to the images bucket
CREATE POLICY "Allow public uploads to images bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- 3. Allow anyone to read files from the images bucket
CREATE POLICY "Allow public read from images bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 4. Allow anyone to update their uploaded files
CREATE POLICY "Allow public update in images bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');

-- 5. Allow anyone to delete files from the images bucket
CREATE POLICY "Allow public delete from images bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');
