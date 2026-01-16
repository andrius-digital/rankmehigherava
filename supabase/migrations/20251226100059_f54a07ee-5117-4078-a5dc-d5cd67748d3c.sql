-- Rename weekly_payment to daily_rate for easier calculation
ALTER TABLE public.clients RENAME COLUMN weekly_payment TO daily_rate;