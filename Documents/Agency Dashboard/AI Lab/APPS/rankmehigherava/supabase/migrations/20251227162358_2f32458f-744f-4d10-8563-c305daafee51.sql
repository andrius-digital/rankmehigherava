-- Create website_submissions table
CREATE TABLE public.website_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  company_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  form_data JSONB NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.website_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public insert access (anyone can submit the form)
CREATE POLICY "Allow public insert on website_submissions"
ON public.website_submissions
FOR INSERT
WITH CHECK (true);

-- Allow public read for confirmation page
CREATE POLICY "Allow public read on website_submissions"
ON public.website_submissions
FOR SELECT
USING (true);