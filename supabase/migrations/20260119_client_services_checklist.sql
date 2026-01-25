-- Global client services items table (shared across all clients)
-- When items are added/edited here, they sync to all client profiles
CREATE TABLE IF NOT EXISTS global_client_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Per-client service status (toggle state and notes per client)
CREATE TABLE IF NOT EXISTS client_services_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    service_item_id UUID NOT NULL REFERENCES global_client_services(id) ON DELETE CASCADE,
    checked BOOLEAN DEFAULT false,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, service_item_id)
);

-- Insert default client service items
INSERT INTO global_client_services (id, label, description, display_order, is_default) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Active Website Subscription', 'Monthly website hosting & maintenance', 1, true),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Monthly Website Upgrades', 'Opt-in for regular feature updates & enhancements', 2, true),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'SMS/Phone Automations', 'Active SMS & call automations', 3, true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE global_client_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_services_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for global_client_services
CREATE POLICY "Global client services are viewable by everyone" ON global_client_services
    FOR SELECT USING (true);

CREATE POLICY "Global client services are insertable by authenticated users" ON global_client_services
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Global client services are updatable by authenticated users" ON global_client_services
    FOR UPDATE USING (true);

CREATE POLICY "Global client services are deletable by authenticated users" ON global_client_services
    FOR DELETE USING (is_default = false);

-- RLS policies for client_services_status
CREATE POLICY "Client services status is viewable by everyone" ON client_services_status
    FOR SELECT USING (true);

CREATE POLICY "Client services status is insertable by authenticated users" ON client_services_status
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Client services status is updatable by authenticated users" ON client_services_status
    FOR UPDATE USING (true);

CREATE POLICY "Client services status is deletable by authenticated users" ON client_services_status
    FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_services_status_client_id ON client_services_status(client_id);
CREATE INDEX IF NOT EXISTS idx_client_services_status_item_id ON client_services_status(service_item_id);
CREATE INDEX IF NOT EXISTS idx_global_client_services_order ON global_client_services(display_order);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_global_client_services_updated_at ON global_client_services;
CREATE TRIGGER update_global_client_services_updated_at
    BEFORE UPDATE ON global_client_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_services_status_updated_at ON client_services_status;
CREATE TRIGGER update_client_services_status_updated_at
    BEFORE UPDATE ON client_services_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
