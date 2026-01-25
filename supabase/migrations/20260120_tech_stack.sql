-- Global tech stack items table (shared across all clients)
-- When items are added/edited here, they sync to all client profiles
CREATE TABLE IF NOT EXISTS global_tech_stack_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Per-client tech stack status (toggle state per client)
CREATE TABLE IF NOT EXISTS client_tech_stack_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    tech_stack_item_id UUID NOT NULL REFERENCES global_tech_stack_items(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, tech_stack_item_id)
);

-- Enable RLS
ALTER TABLE global_tech_stack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_tech_stack_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for global_tech_stack_items (readable by all authenticated, writable by authenticated)
CREATE POLICY "Global tech stack items are viewable by everyone" ON global_tech_stack_items
    FOR SELECT USING (true);

CREATE POLICY "Global tech stack items are insertable by authenticated users" ON global_tech_stack_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Global tech stack items are updatable by authenticated users" ON global_tech_stack_items
    FOR UPDATE USING (true);

CREATE POLICY "Global tech stack items are deletable by authenticated users" ON global_tech_stack_items
    FOR DELETE USING (true);

-- RLS policies for client_tech_stack_status
CREATE POLICY "Client tech stack status is viewable by everyone" ON client_tech_stack_status
    FOR SELECT USING (true);

CREATE POLICY "Client tech stack status is insertable by authenticated users" ON client_tech_stack_status
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Client tech stack status is updatable by authenticated users" ON client_tech_stack_status
    FOR UPDATE USING (true);

CREATE POLICY "Client tech stack status is deletable by authenticated users" ON client_tech_stack_status
    FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_tech_stack_status_client_id ON client_tech_stack_status(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tech_stack_status_item_id ON client_tech_stack_status(tech_stack_item_id);
CREATE INDEX IF NOT EXISTS idx_global_tech_stack_items_order ON global_tech_stack_items(display_order);

-- Triggers for updated_at (reuse the existing function)
DROP TRIGGER IF EXISTS update_global_tech_stack_items_updated_at ON global_tech_stack_items;
CREATE TRIGGER update_global_tech_stack_items_updated_at
    BEFORE UPDATE ON global_tech_stack_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_tech_stack_status_updated_at ON client_tech_stack_status;
CREATE TRIGGER update_client_tech_stack_status_updated_at
    BEFORE UPDATE ON client_tech_stack_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Per-client fixed tech stack choices (Framework and Hosting selections)
CREATE TABLE IF NOT EXISTS client_tech_stack_choices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL UNIQUE,
    framework TEXT DEFAULT NULL CHECK (framework IN ('react', 'html', NULL)),
    hosting TEXT DEFAULT NULL CHECK (hosting IN ('vercel', 'namecheap', NULL)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for client_tech_stack_choices
ALTER TABLE client_tech_stack_choices ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_tech_stack_choices
CREATE POLICY "Client tech stack choices are viewable by everyone" ON client_tech_stack_choices
    FOR SELECT USING (true);

CREATE POLICY "Client tech stack choices are insertable by authenticated users" ON client_tech_stack_choices
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Client tech stack choices are updatable by authenticated users" ON client_tech_stack_choices
    FOR UPDATE USING (true);

CREATE POLICY "Client tech stack choices are deletable by authenticated users" ON client_tech_stack_choices
    FOR DELETE USING (true);

-- Index for client_tech_stack_choices
CREATE INDEX IF NOT EXISTS idx_client_tech_stack_choices_client_id ON client_tech_stack_choices(client_id);

-- Trigger for updated_at on client_tech_stack_choices
DROP TRIGGER IF EXISTS update_client_tech_stack_choices_updated_at ON client_tech_stack_choices;
CREATE TRIGGER update_client_tech_stack_choices_updated_at
    BEFORE UPDATE ON client_tech_stack_choices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
