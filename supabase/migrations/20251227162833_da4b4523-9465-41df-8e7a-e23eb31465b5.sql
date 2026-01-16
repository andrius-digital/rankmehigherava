-- Create storage bucket for website submission files
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-submissions-files', 'website-submissions-files', true);

-- Allow public uploads to the bucket
CREATE POLICY "Allow public uploads to website-submissions-files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'website-submissions-files');

-- Allow public read access
CREATE POLICY "Allow public read on website-submissions-files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'website-submissions-files');

-- Allow public delete (for replacing files)
CREATE POLICY "Allow public delete on website-submissions-files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'website-submissions-files');