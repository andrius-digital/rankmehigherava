-- Create clients table to track payment info
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  weekly_payment DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (same as other tables)
CREATE POLICY "Allow public read access on clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert on clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on clients" ON public.clients FOR DELETE USING (true);

-- Add client_id to leads table to link leads to clients
ALTER TABLE public.leads ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Create trigger for updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();