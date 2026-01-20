-- Global checklist items table (shared across all clients)
-- When items are added/edited here, they sync to all client profiles
CREATE TABLE IF NOT EXISTS global_checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Per-client checklist status (toggle state and notes per client)
CREATE TABLE IF NOT EXISTS client_checklist_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    checklist_item_id UUID NOT NULL REFERENCES global_checklist_items(id) ON DELETE CASCADE,
    checked BOOLEAN DEFAULT false,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, checklist_item_id)
);

-- Insert default checklist items
INSERT INTO global_checklist_items (id, label, description, display_order, is_default) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Telegram Group', 'Telegram group has been created with the client', 1, true),
    ('22222222-2222-2222-2222-222222222222', 'Github Repository Active', 'In Rank Me Higher Websites org', 2, true),
    ('33333333-3333-3333-3333-333333333333', 'DNS Pointing to Our NameServers', 'DNS configured & live - UPDATED', 3, true),
    ('44444444-4444-4444-4444-444444444444', 'Auto VPS Updates', 'Automatic deploys via Github', 4, true),
    ('55555555-5555-5555-5555-555555555555', 'Lead Form Submissions', 'Telegram Channel & Email Notifications', 5, true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE global_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_checklist_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for global_checklist_items (readable by all authenticated, writable by authenticated)
CREATE POLICY "Global checklist items are viewable by everyone" ON global_checklist_items
    FOR SELECT USING (true);

CREATE POLICY "Global checklist items are insertable by authenticated users" ON global_checklist_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Global checklist items are updatable by authenticated users" ON global_checklist_items
    FOR UPDATE USING (true);

CREATE POLICY "Global checklist items are deletable by authenticated users" ON global_checklist_items
    FOR DELETE USING (is_default = false);

-- RLS policies for client_checklist_status
CREATE POLICY "Client checklist status is viewable by everyone" ON client_checklist_status
    FOR SELECT USING (true);

CREATE POLICY "Client checklist status is insertable by authenticated users" ON client_checklist_status
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Client checklist status is updatable by authenticated users" ON client_checklist_status
    FOR UPDATE USING (true);

CREATE POLICY "Client checklist status is deletable by authenticated users" ON client_checklist_status
    FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_checklist_status_client_id ON client_checklist_status(client_id);
CREATE INDEX IF NOT EXISTS idx_client_checklist_status_item_id ON client_checklist_status(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_global_checklist_items_order ON global_checklist_items(display_order);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_global_checklist_items_updated_at ON global_checklist_items;
CREATE TRIGGER update_global_checklist_items_updated_at
    BEFORE UPDATE ON global_checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_checklist_status_updated_at ON client_checklist_status;
CREATE TRIGGER update_client_checklist_status_updated_at
    BEFORE UPDATE ON client_checklist_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
