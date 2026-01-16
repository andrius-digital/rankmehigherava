-- Add new fields to clients table for onboarding
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS campaign_length integer NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS campaign_start_date date NOT NULL DEFAULT CURRENT_DATE;

-- Add client_id to agents table to link agents to specific clients
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;