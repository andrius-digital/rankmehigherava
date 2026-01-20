-- Add missing columns to clients table for website/funnel submissions
-- These columns are needed for the ClientPortal to display clients properly

-- Company details
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Status for tracking client lifecycle (PENDING, ACTIVE, ARCHIVED)
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';

-- Branding and marketing info
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS brand_voice TEXT;

ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS target_audience TEXT;

-- Services offered by the client
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS primary_services TEXT[];

-- Notes field for storing form submission data as JSON
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- Create index for website_url to help with filtering website vs funnel clients
CREATE INDEX IF NOT EXISTS idx_clients_website_url ON public.clients(website_url);
