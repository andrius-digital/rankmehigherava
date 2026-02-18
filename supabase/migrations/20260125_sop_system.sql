-- SOP Documentation System - Database Schema
-- Full CRUD support for editable SOP documentation

-- Create enum types for SOP
DO $$ BEGIN
    CREATE TYPE sop_content_block_type AS ENUM (
        'paragraph', 'heading', 'code', 'table', 'list', 'checklist', 'alert', 'divider'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sop_alert_type AS ENUM ('warning', 'info', 'success', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- SOP Tabs table
CREATE TABLE IF NOT EXISTS sop_tabs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tab_id TEXT NOT NULL UNIQUE, -- 'technical', 'design', 'quickref', 'troubleshooting', or custom
    label TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'FileText', -- lucide icon name
    description TEXT DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOP Documents table (one per tab)
CREATE TABLE IF NOT EXISTS sop_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tab_id UUID NOT NULL REFERENCES sop_tabs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    version TEXT DEFAULT '1.0',
    last_updated DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tab_id)
);

-- SOP Sections table (supports nested sections via parent_section_id)
CREATE TABLE IF NOT EXISTS sop_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES sop_documents(id) ON DELETE CASCADE,
    section_id TEXT NOT NULL, -- For compatibility with existing code (e.g., 'tech-stack', 'phase-1')
    parent_section_id UUID REFERENCES sop_sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 3),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_expanded BOOLEAN DEFAULT true, -- Default state for sidebar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(document_id, section_id)
);

-- SOP Content Blocks table
CREATE TABLE IF NOT EXISTS sop_content_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES sop_sections(id) ON DELETE CASCADE,
    block_type TEXT NOT NULL CHECK (block_type IN ('paragraph', 'heading', 'code', 'table', 'list', 'checklist', 'alert', 'divider')),
    content TEXT, -- Main text content
    language TEXT, -- For code blocks (e.g., 'bash', 'javascript', 'text')
    alert_type TEXT CHECK (alert_type IS NULL OR alert_type IN ('warning', 'info', 'success', 'critical')),
    is_ordered BOOLEAN DEFAULT false, -- For list blocks
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOP List Items table (for list and ordered list blocks)
CREATE TABLE IF NOT EXISTS sop_list_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_block_id UUID NOT NULL REFERENCES sop_content_blocks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOP Checklist Items table
CREATE TABLE IF NOT EXISTS sop_checklist_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_block_id UUID NOT NULL REFERENCES sop_content_blocks(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL, -- For localStorage persistence compatibility (e.g., 'p7-check-1')
    text TEXT NOT NULL,
    default_checked BOOLEAN DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_block_id, item_id)
);

-- SOP Table Data table (for table blocks)
CREATE TABLE IF NOT EXISTS sop_table_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_block_id UUID NOT NULL REFERENCES sop_content_blocks(id) ON DELETE CASCADE,
    headers JSONB NOT NULL DEFAULT '[]', -- Array of header strings
    rows JSONB NOT NULL DEFAULT '[]', -- Array of arrays (rows and cells)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_block_id)
);

-- User checklist progress (persists user's checklist state per user)
CREATE TABLE IF NOT EXISTS sop_user_checklist_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Optional: can be null for anonymous/local storage fallback
    checklist_item_id UUID NOT NULL REFERENCES sop_checklist_items(id) ON DELETE CASCADE,
    is_checked BOOLEAN DEFAULT false,
    checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, checklist_item_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sop_tabs_display_order ON sop_tabs(display_order);
CREATE INDEX IF NOT EXISTS idx_sop_tabs_tab_id ON sop_tabs(tab_id);
CREATE INDEX IF NOT EXISTS idx_sop_documents_tab_id ON sop_documents(tab_id);
CREATE INDEX IF NOT EXISTS idx_sop_sections_document_id ON sop_sections(document_id);
CREATE INDEX IF NOT EXISTS idx_sop_sections_parent_id ON sop_sections(parent_section_id);
CREATE INDEX IF NOT EXISTS idx_sop_sections_display_order ON sop_sections(document_id, display_order);
CREATE INDEX IF NOT EXISTS idx_sop_content_blocks_section_id ON sop_content_blocks(section_id);
CREATE INDEX IF NOT EXISTS idx_sop_content_blocks_display_order ON sop_content_blocks(section_id, display_order);
CREATE INDEX IF NOT EXISTS idx_sop_list_items_block_id ON sop_list_items(content_block_id);
CREATE INDEX IF NOT EXISTS idx_sop_checklist_items_block_id ON sop_checklist_items(content_block_id);
CREATE INDEX IF NOT EXISTS idx_sop_user_progress_user ON sop_user_checklist_progress(user_id);

-- Enable Row Level Security
ALTER TABLE sop_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_table_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_user_checklist_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Read access for all authenticated users
CREATE POLICY "SOP tabs are viewable by everyone" ON sop_tabs
    FOR SELECT USING (true);

CREATE POLICY "SOP documents are viewable by everyone" ON sop_documents
    FOR SELECT USING (true);

CREATE POLICY "SOP sections are viewable by everyone" ON sop_sections
    FOR SELECT USING (true);

CREATE POLICY "SOP content blocks are viewable by everyone" ON sop_content_blocks
    FOR SELECT USING (true);

CREATE POLICY "SOP list items are viewable by everyone" ON sop_list_items
    FOR SELECT USING (true);

CREATE POLICY "SOP checklist items are viewable by everyone" ON sop_checklist_items
    FOR SELECT USING (true);

CREATE POLICY "SOP table data is viewable by everyone" ON sop_table_data
    FOR SELECT USING (true);

CREATE POLICY "SOP user progress is viewable by everyone" ON sop_user_checklist_progress
    FOR SELECT USING (true);

-- RLS Policies - Write access (INSERT, UPDATE, DELETE) for authenticated users
-- In production, you might want to restrict this to admin roles only

CREATE POLICY "SOP tabs are insertable by authenticated users" ON sop_tabs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "SOP tabs are updatable by authenticated users" ON sop_tabs
    FOR UPDATE USING (true);

CREATE POLICY "SOP tabs are deletable by authenticated users" ON sop_tabs
    FOR DELETE USING (true);

CREATE POLICY "SOP documents are insertable by authenticated users" ON sop_documents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "SOP documents are updatable by authenticated users" ON sop_documents
    FOR UPDATE USING (true);

CREATE POLICY "SOP documents are deletable by authenticated users" ON sop_documents
    FOR DELETE USING (true);

CREATE POLICY "SOP sections are insertable by authenticated users" ON sop_sections
    FOR INSERT WITH CHECK (true);

CREATE POLICY "SOP sections are updatable by authenticated users" ON sop_sections
    FOR UPDATE USING (true);

CREATE POLICY "SOP sections are deletable by authenticated users" ON sop_sections
    FOR DELETE USING (true);

CREATE POLICY "SOP content blocks are insertable by authenticated users" ON sop_content_blocks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "SOP content blocks are updatable by authenticated users" ON sop_content_blocks
    FOR UPDATE USING (true);

CREATE POLICY "SOP content blocks are deletable by authenticated users" ON sop_content_blocks
    FOR DELETE USING (true);

CREATE POLICY "SOP list items are insertable by authenticated users" ON sop_list_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "SOP list items are updatable by authenticated users" ON sop_list_items
    FOR UPDATE USING (true);

CREATE POLICY "SOP list items are deletable by authenticated users" ON sop_list_items
    FOR DELETE USING (true);

CREATE POLICY "SOP checklist items are insertable by authenticated users" ON sop_checklist_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "SOP checklist items are updatable by authenticated users" ON sop_checklist_items
    FOR UPDATE USING (true);

CREATE POLICY "SOP checklist items are deletable by authenticated users" ON sop_checklist_items
    FOR DELETE USING (true);

CREATE POLICY "SOP table data is insertable by authenticated users" ON sop_table_data
    FOR INSERT WITH CHECK (true);

CREATE POLICY "SOP table data is updatable by authenticated users" ON sop_table_data
    FOR UPDATE USING (true);

CREATE POLICY "SOP table data is deletable by authenticated users" ON sop_table_data
    FOR DELETE USING (true);

CREATE POLICY "SOP user progress is insertable by authenticated users" ON sop_user_checklist_progress
    FOR INSERT WITH CHECK (true);

CREATE POLICY "SOP user progress is updatable by authenticated users" ON sop_user_checklist_progress
    FOR UPDATE USING (true);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sop_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all SOP tables
DROP TRIGGER IF EXISTS update_sop_tabs_updated_at ON sop_tabs;
CREATE TRIGGER update_sop_tabs_updated_at
    BEFORE UPDATE ON sop_tabs
    FOR EACH ROW
    EXECUTE FUNCTION update_sop_updated_at();

DROP TRIGGER IF EXISTS update_sop_documents_updated_at ON sop_documents;
CREATE TRIGGER update_sop_documents_updated_at
    BEFORE UPDATE ON sop_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_sop_updated_at();

DROP TRIGGER IF EXISTS update_sop_sections_updated_at ON sop_sections;
CREATE TRIGGER update_sop_sections_updated_at
    BEFORE UPDATE ON sop_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_sop_updated_at();

DROP TRIGGER IF EXISTS update_sop_content_blocks_updated_at ON sop_content_blocks;
CREATE TRIGGER update_sop_content_blocks_updated_at
    BEFORE UPDATE ON sop_content_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_sop_updated_at();

DROP TRIGGER IF EXISTS update_sop_list_items_updated_at ON sop_list_items;
CREATE TRIGGER update_sop_list_items_updated_at
    BEFORE UPDATE ON sop_list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_sop_updated_at();

DROP TRIGGER IF EXISTS update_sop_checklist_items_updated_at ON sop_checklist_items;
CREATE TRIGGER update_sop_checklist_items_updated_at
    BEFORE UPDATE ON sop_checklist_items
    FOR EACH ROW
    EXECUTE FUNCTION update_sop_updated_at();

DROP TRIGGER IF EXISTS update_sop_table_data_updated_at ON sop_table_data;
CREATE TRIGGER update_sop_table_data_updated_at
    BEFORE UPDATE ON sop_table_data
    FOR EACH ROW
    EXECUTE FUNCTION update_sop_updated_at();

DROP TRIGGER IF EXISTS update_sop_user_progress_updated_at ON sop_user_checklist_progress;
CREATE TRIGGER update_sop_user_progress_updated_at
    BEFORE UPDATE ON sop_user_checklist_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_sop_updated_at();

-- Function to update document last_updated when sections or content change
CREATE OR REPLACE FUNCTION update_document_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE sop_documents
    SET last_updated = CURRENT_DATE, updated_at = NOW()
    WHERE id = (
        SELECT document_id FROM sop_sections WHERE id = COALESCE(NEW.section_id, OLD.section_id)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_doc_on_content_change ON sop_content_blocks;
CREATE TRIGGER update_doc_on_content_change
    AFTER INSERT OR UPDATE OR DELETE ON sop_content_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_document_last_updated();
