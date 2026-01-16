-- Add weeks_paid column to clients
ALTER TABLE public.clients ADD COLUMN weeks_paid INTEGER NOT NULL DEFAULT 0;