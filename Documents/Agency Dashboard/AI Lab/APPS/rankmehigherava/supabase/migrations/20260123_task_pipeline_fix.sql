-- ===========================================
-- FIX: Update client_requests status constraint to allow pipeline statuses
-- ===========================================

-- Drop the existing constraint
ALTER TABLE client_requests DROP CONSTRAINT IF EXISTS client_requests_status_check;

-- Add new constraint with all pipeline statuses
ALTER TABLE client_requests ADD CONSTRAINT client_requests_status_check
    CHECK (status IN ('pending', 'in_progress', 'ready_for_qa', 'in_qa', 'qa_failed', 'qa_passed', 'delivered', 'completed', 'cancelled'));

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Task ID for tracking (TSK-0001 format)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_requests' AND column_name = 'task_id') THEN
        ALTER TABLE client_requests ADD COLUMN task_id TEXT;
    END IF;

    -- Assigned manager
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_requests' AND column_name = 'assigned_manager') THEN
        ALTER TABLE client_requests ADD COLUMN assigned_manager TEXT DEFAULT '';
    END IF;

    -- QA manager
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_requests' AND column_name = 'qa_manager') THEN
        ALTER TABLE client_requests ADD COLUMN qa_manager TEXT DEFAULT '';
    END IF;

    -- QA timestamps
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_requests' AND column_name = 'qa_started_at') THEN
        ALTER TABLE client_requests ADD COLUMN qa_started_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_requests' AND column_name = 'qa_completed_at') THEN
        ALTER TABLE client_requests ADD COLUMN qa_completed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_requests' AND column_name = 'delivered_at') THEN
        ALTER TABLE client_requests ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- QA feedback
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_requests' AND column_name = 'qa_feedback') THEN
        ALTER TABLE client_requests ADD COLUMN qa_feedback TEXT DEFAULT '';
    END IF;

    -- Revision count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_requests' AND column_name = 'revision_count') THEN
        ALTER TABLE client_requests ADD COLUMN revision_count INTEGER DEFAULT 0;
    END IF;

    -- Client info for display
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_requests' AND column_name = 'client_company') THEN
        ALTER TABLE client_requests ADD COLUMN client_company TEXT DEFAULT '';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_requests' AND column_name = 'client_email') THEN
        ALTER TABLE client_requests ADD COLUMN client_email TEXT DEFAULT '';
    END IF;
END $$;

-- ===========================================
-- Create task_id sequence and auto-generation
-- ===========================================

-- Create sequence for task IDs
CREATE SEQUENCE IF NOT EXISTS task_id_seq START WITH 1;

-- Function to generate task_id
CREATE OR REPLACE FUNCTION generate_task_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.task_id IS NULL OR NEW.task_id = '' THEN
        NEW.task_id := 'TSK-' || LPAD(nextval('task_id_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto task_id
DROP TRIGGER IF EXISTS set_task_id ON client_requests;
CREATE TRIGGER set_task_id
    BEFORE INSERT ON client_requests
    FOR EACH ROW
    EXECUTE FUNCTION generate_task_id();

-- ===========================================
-- Create task_status_history table
-- ===========================================

CREATE TABLE IF NOT EXISTS task_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by TEXT DEFAULT 'System',
    changed_by_role TEXT DEFAULT 'admin',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE task_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Status history is viewable by everyone" ON task_status_history
    FOR SELECT USING (true);

CREATE POLICY "Status history is insertable by authenticated users" ON task_status_history
    FOR INSERT WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_task_status_history_task_id ON task_status_history(task_id);

-- ===========================================
-- Create task_notes table
-- ===========================================

CREATE TABLE IF NOT EXISTS task_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL DEFAULT 'Unknown',
    user_role TEXT NOT NULL DEFAULT 'client',
    user_avatar TEXT DEFAULT '',
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Task notes are viewable by everyone" ON task_notes
    FOR SELECT USING (true);

CREATE POLICY "Task notes are insertable by authenticated users" ON task_notes
    FOR INSERT WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_task_notes_task_id ON task_notes(task_id);

-- ===========================================
-- Create task_files table
-- ===========================================

CREATE TABLE IF NOT EXISTS task_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT DEFAULT 'application/octet-stream',
    file_size INTEGER DEFAULT 0,
    uploaded_by TEXT NOT NULL DEFAULT 'Unknown',
    uploaded_by_role TEXT DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE task_files ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Task files are viewable by everyone" ON task_files
    FOR SELECT USING (true);

CREATE POLICY "Task files are insertable by authenticated users" ON task_files
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Task files are deletable by authenticated users" ON task_files
    FOR DELETE USING (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_task_files_task_id ON task_files(task_id);

-- ===========================================
-- Auto-record status changes in history
-- ===========================================

CREATE OR REPLACE FUNCTION record_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO task_status_history (task_id, from_status, to_status, changed_by, changed_by_role)
        VALUES (NEW.id, OLD.status, NEW.status, 'System', 'admin');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS track_status_change ON client_requests;
CREATE TRIGGER track_status_change
    AFTER UPDATE ON client_requests
    FOR EACH ROW
    EXECUTE FUNCTION record_status_change();

-- ===========================================
-- Update existing tasks with task_id if missing
-- ===========================================

UPDATE client_requests
SET task_id = 'TSK-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
WHERE task_id IS NULL OR task_id = '';
