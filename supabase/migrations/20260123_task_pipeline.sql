-- Task Pipeline System - Enhanced QA Workflow
-- Upgrades client_requests to full pipeline tracking

-- Add new columns to existing client_requests table
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS task_id TEXT UNIQUE;
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS client_company TEXT DEFAULT '';
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS client_email TEXT DEFAULT '';
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS assigned_manager TEXT DEFAULT '';
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS assigned_manager_avatar TEXT DEFAULT '';
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS qa_manager TEXT DEFAULT '';
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS qa_manager_avatar TEXT DEFAULT '';
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS qa_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS qa_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS revision_count INTEGER DEFAULT 0;
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS qa_feedback TEXT DEFAULT '';
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]';

-- Update status check constraint to include new statuses
ALTER TABLE client_requests DROP CONSTRAINT IF EXISTS client_requests_status_check;
ALTER TABLE client_requests ADD CONSTRAINT client_requests_status_check
    CHECK (status IN ('pending', 'in_progress', 'ready_for_qa', 'in_qa', 'qa_failed', 'qa_passed', 'delivered', 'completed', 'cancelled'));

-- Create sequence for task IDs
CREATE SEQUENCE IF NOT EXISTS task_id_seq START 1;

-- Function to generate task ID
CREATE OR REPLACE FUNCTION generate_task_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.task_id IS NULL THEN
        NEW.task_id := 'TSK-' || LPAD(nextval('task_id_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate task ID
DROP TRIGGER IF EXISTS set_task_id ON client_requests;
CREATE TRIGGER set_task_id
    BEFORE INSERT ON client_requests
    FOR EACH ROW
    EXECUTE FUNCTION generate_task_id();

-- Task notes/comments table (separate from client_request_messages for better organization)
CREATE TABLE IF NOT EXISTS task_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL CHECK (user_role IN ('client', 'manager', 'qa_manager', 'admin')),
    user_avatar TEXT DEFAULT '',
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to client
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task files/attachments table
CREATE TABLE IF NOT EXISTS task_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT DEFAULT '',
    file_size INTEGER DEFAULT 0,
    uploaded_by TEXT NOT NULL,
    uploaded_by_role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task status history for timeline tracking
CREATE TABLE IF NOT EXISTS task_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES client_requests(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by TEXT NOT NULL,
    changed_by_role TEXT NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_notes
CREATE POLICY "Task notes are viewable by everyone" ON task_notes
    FOR SELECT USING (true);

CREATE POLICY "Task notes are insertable by authenticated users" ON task_notes
    FOR INSERT WITH CHECK (true);

-- RLS policies for task_files
CREATE POLICY "Task files are viewable by everyone" ON task_files
    FOR SELECT USING (true);

CREATE POLICY "Task files are insertable by authenticated users" ON task_files
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Task files are deletable by authenticated users" ON task_files
    FOR DELETE USING (true);

-- RLS policies for task_status_history
CREATE POLICY "Task status history is viewable by everyone" ON task_status_history
    FOR SELECT USING (true);

CREATE POLICY "Task status history is insertable by authenticated users" ON task_status_history
    FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_notes_task_id ON task_notes(task_id);
CREATE INDEX IF NOT EXISTS idx_task_files_task_id ON task_files(task_id);
CREATE INDEX IF NOT EXISTS idx_task_status_history_task_id ON task_status_history(task_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_task_id ON client_requests(task_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);

-- Function to log status changes automatically
CREATE OR REPLACE FUNCTION log_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO task_status_history (task_id, from_status, to_status, changed_by, changed_by_role)
        VALUES (NEW.id, OLD.status, NEW.status, 'System', 'system');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic status logging
DROP TRIGGER IF EXISTS log_status_change ON client_requests;
CREATE TRIGGER log_status_change
    AFTER UPDATE ON client_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_task_status_change();
