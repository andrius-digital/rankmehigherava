-- Make the storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'website-submissions-files';

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow public uploads to website-submissions-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete on website-submissions-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read on website-submissions-files" ON storage.objects;

-- Create secure policies - only authenticated users can upload
CREATE POLICY "Authenticated users can upload to website-submissions-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'website-submissions-files');

-- Only admins can read files
CREATE POLICY "Admins can read website-submissions-files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'website-submissions-files' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Only admins can delete files
CREATE POLICY "Admins can delete website-submissions-files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'website-submissions-files' 
  AND public.has_role(auth.uid(), 'admin')
);