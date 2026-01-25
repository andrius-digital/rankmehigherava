-- Create admin_panel_projects table
CREATE TABLE IF NOT EXISTS public.admin_panel_projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    icon TEXT NOT NULL, -- Lucide icon name
    color TEXT NOT NULL, -- purple, cyan, blue, orange, green, emerald
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_panel_cards table
CREATE TABLE IF NOT EXISTS public.admin_panel_cards (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    href TEXT NOT NULL,
    icon TEXT NOT NULL, -- Lucide icon name
    color TEXT NOT NULL, -- purple, cyan, blue, orange, green, emerald
    project_id TEXT NOT NULL REFERENCES public.admin_panel_projects(id) ON DELETE CASCADE,
    archived BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_panel_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_panel_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (same as other tables)
CREATE POLICY "Allow public read access on admin_panel_projects" ON public.admin_panel_projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert on admin_panel_projects" ON public.admin_panel_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on admin_panel_projects" ON public.admin_panel_projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on admin_panel_projects" ON public.admin_panel_projects FOR DELETE USING (true);

CREATE POLICY "Allow public read access on admin_panel_cards" ON public.admin_panel_cards FOR SELECT USING (true);
CREATE POLICY "Allow public insert on admin_panel_cards" ON public.admin_panel_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on admin_panel_cards" ON public.admin_panel_cards FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on admin_panel_cards" ON public.admin_panel_cards FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_panel_projects_updated_at
    BEFORE UPDATE ON public.admin_panel_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_panel_cards_updated_at
    BEFORE UPDATE ON public.admin_panel_cards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default projects
INSERT INTO public.admin_panel_projects (id, title, icon, color, order_index) VALUES
    ('agency', 'Agency', 'Building2', 'cyan', 1),
    ('ai-lab', 'AI Lab', 'Brain', 'purple', 2),
    ('websites', 'Websites', 'Globe', 'green', 3),
    ('accounting', 'Accounting', 'DollarSign', 'emerald', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert default cards (based on current AgencyDashboard)
INSERT INTO public.admin_panel_cards (title, description, href, icon, color, project_id, order_index) VALUES
    -- Agency cards
    ('AVA Voice Calls', 'Voice chat analytics', '/ava-voice-calls', 'Mic', 'cyan', 'agency', 1),
    ('Task Flow', 'Project management', '/task-flow', 'Layers', 'cyan', 'agency', 2),
    -- AI Lab cards
    ('AVA Training', 'Train AVA AI', '/ava-training', 'GraduationCap', 'purple', 'ai-lab', 1),
    ('AVA SEO', 'AI SEO autopilot', '/avaseo', 'Brain', 'cyan', 'ai-lab', 2),
    ('CDL Agency Onboard', 'Driver brokerage', '/cdl-agency-portal', 'Users', 'blue', 'ai-lab', 3),
    ('Drum Kit Bazaar', 'Sample packs AI', '#', 'Music', 'orange', 'ai-lab', 4),
    -- Websites cards
    ('Client Portal', 'Manage Active Websites & Funnels - Agency View', '/client-portal', 'UsersRound', 'green', 'websites', 1),
    ('Build Website', 'AI design', '/website-prompting', 'Palette', 'green', 'websites', 2),
    -- Accounting cards
    ('Subscriptions', 'Manage billing', '/subscriptions', 'CreditCard', 'emerald', 'accounting', 1),
    ('Team Tracker', 'Payroll & time', '/team-tracker', 'Clock', 'emerald', 'accounting', 2)
ON CONFLICT DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_panel_cards_project_id ON public.admin_panel_cards(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_panel_cards_archived ON public.admin_panel_cards(archived);
CREATE INDEX IF NOT EXISTS idx_admin_panel_cards_order ON public.admin_panel_cards(project_id, order_index);
