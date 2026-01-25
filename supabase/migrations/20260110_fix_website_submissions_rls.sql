-- Fix website_submissions RLS to allow public inserts
-- The form is public-facing and anyone should be able to submit

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Allow public insert on website_submissions" ON public.website_submissions;

-- Create policy that allows anyone (including anonymous) to insert
CREATE POLICY "Allow public insert on website_submissions"
ON public.website_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Also ensure the clients table allows inserts from the form submission
DROP POLICY IF EXISTS "Allow insert from website submission" ON public.clients;

CREATE POLICY "Allow insert from website submission"
ON public.clients
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
