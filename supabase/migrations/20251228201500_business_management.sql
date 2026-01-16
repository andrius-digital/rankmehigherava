-- Box 1: For storing subscriptions (like Netflix, Spotify)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  billing_cycle TEXT DEFAULT 'Monthly',
  billing_date TEXT,
  email TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Box 2: For storing team members (your workers)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  account TEXT NOT NULL,
  payment_type TEXT NOT NULL,
  hourly_rate NUMERIC DEFAULT 0,
  hours_worked NUMERIC DEFAULT 0,
  monthly_salary NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Box 3: For tracking when people clock in/out
CREATE TABLE IF NOT EXISTS public.time_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  clock_in TIMESTAMPTZ DEFAULT now(),
  clock_out TIMESTAMPTZ,
  total_work_seconds INTEGER DEFAULT 0,
  total_break_seconds INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Box 4: For tracking breaks
CREATE TABLE IF NOT EXISTS public.time_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.time_sessions(id) ON DELETE CASCADE,
  break_start TIMESTAMPTZ DEFAULT now(),
  break_end TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_breaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for auth" ON public.subscriptions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth" ON public.team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth" ON public.time_sessions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for auth" ON public.time_breaks FOR ALL USING (auth.role() = 'authenticated');
