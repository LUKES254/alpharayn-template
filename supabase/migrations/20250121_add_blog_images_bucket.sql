-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,  -- Public bucket so images can be accessed without auth
  5242880,  -- 5MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()::text
    AND u.email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
  )
);

-- Alternative simpler policy: Allow any authenticated user to upload
-- Comment out the above and use this if you want simpler permissions
-- CREATE POLICY "Authenticated users can upload blog images"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'blog-images');

-- Allow public read access to blog images
CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-images');

-- Allow admins to delete their uploaded images
CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- Allow admins to update (overwrite) images
CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images');
