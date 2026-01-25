-- Create a table to store hourly rates for team members
CREATE TABLE public.team_member_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clockify_user_id TEXT NOT NULL UNIQUE,
  hourly_rate NUMERIC NOT NULL DEFAULT 25,
  member_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_member_rates ENABLE ROW LEVEL SECURITY;

-- Admins can view all rates
CREATE POLICY "Admins can view team_member_rates"
ON public.team_member_rates
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert rates
CREATE POLICY "Admins can insert team_member_rates"
ON public.team_member_rates
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update rates
CREATE POLICY "Admins can update team_member_rates"
ON public.team_member_rates
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete rates
CREATE POLICY "Admins can delete team_member_rates"
ON public.team_member_rates
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_member_rates_updated_at
BEFORE UPDATE ON public.team_member_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();