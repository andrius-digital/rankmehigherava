-- Create agents table for VAs
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads/bookings table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create call_logs table for tracking calls (can be manual or from RingCentral later)
CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  calls_made INTEGER NOT NULL DEFAULT 0,
  calls_answered INTEGER NOT NULL DEFAULT 0,
  call_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, call_date)
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

-- For now, allow public access (no auth required) - can be locked down later
CREATE POLICY "Allow public read access on agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Allow public insert on agents" ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on agents" ON public.agents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on agents" ON public.agents FOR DELETE USING (true);

CREATE POLICY "Allow public read access on leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert on leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on leads" ON public.leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on leads" ON public.leads FOR DELETE USING (true);

CREATE POLICY "Allow public read access on call_logs" ON public.call_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on call_logs" ON public.call_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on call_logs" ON public.call_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on call_logs" ON public.call_logs FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX idx_leads_agent_id ON public.leads(agent_id);
CREATE INDEX idx_leads_booked_at ON public.leads(booked_at);
CREATE INDEX idx_call_logs_agent_id ON public.call_logs(agent_id);
CREATE INDEX idx_call_logs_call_date ON public.call_logs(call_date);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_call_logs_updated_at
  BEFORE UPDATE ON public.call_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();