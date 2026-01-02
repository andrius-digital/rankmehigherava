-- Fix storage bucket policies to allow public uploads for website submission forms
-- while keeping file reading restricted to admins

-- Drop the overly restrictive authenticated-only upload policy
DROP POLICY IF EXISTS "Authenticated users can upload to website-submissions-files" ON storage.objects;

-- Allow both authenticated and anonymous users to upload to the bucket
-- This is necessary for the public website submission form
CREATE POLICY "Anyone can upload to website-submissions-files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'website-submissions-files');

-- Keep the admin-only read policy (already exists, but ensure it's there)
-- Note: We don't need to recreate if it exists, just verify

-- Keep the admin-only delete policy (already exists, but ensure it's there)
-- Note: We don't need to recreate if it exists, just verify