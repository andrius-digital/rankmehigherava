-- Add campaign_budget to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS campaign_budget numeric NOT NULL DEFAULT 0;