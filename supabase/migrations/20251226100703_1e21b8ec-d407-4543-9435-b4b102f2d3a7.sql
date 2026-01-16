-- Create work_days table to track which days were worked per client
CREATE TABLE public.work_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  worked BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, work_date)
);

-- Enable RLS
ALTER TABLE public.work_days ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on work_days" ON public.work_days FOR SELECT USING (true);
CREATE POLICY "Allow public insert on work_days" ON public.work_days FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on work_days" ON public.work_days FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on work_days" ON public.work_days FOR DELETE USING (true);