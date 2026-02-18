-- Migration: Telegram Dual Channels (Client Comms + Leads)
-- Drop old table and recreate with dual channel support

-- Drop old table if exists (backup data first if needed)
DROP TABLE IF EXISTS telegram_notification_log;
DROP TABLE IF EXISTS client_telegram_settings;

-- New table with dual channel support
CREATE TABLE client_telegram_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    -- Channel 1: Client Communications (task updates, QA status)
    client_chat_id TEXT,
    client_bot_token TEXT,
    client_notifications_active BOOLEAN DEFAULT false,
    notify_task_completed BOOLEAN DEFAULT true,
    notify_task_started BOOLEAN DEFAULT false,
    notify_qa_status BOOLEAN DEFAULT false,

    -- Channel 2: Leads/Sales (form submissions, new inquiries)
    leads_chat_id TEXT,
    leads_bot_token TEXT,
    leads_notifications_active BOOLEAN DEFAULT false,
    notify_new_lead BOOLEAN DEFAULT true,
    notify_form_submission BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id)
);

CREATE INDEX idx_telegram_settings_client_id ON client_telegram_settings(client_id);

-- Notification log table
CREATE TABLE telegram_notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    task_id UUID REFERENCES client_requests(id) ON DELETE SET NULL,
    channel_type TEXT NOT NULL, -- 'client' or 'leads'
    notification_type TEXT NOT NULL, -- 'task_completed', 'new_lead', etc.
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to queue telegram notification for task completion
CREATE OR REPLACE FUNCTION queue_telegram_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_telegram_settings RECORD;
    v_message TEXT;
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        SELECT * INTO v_telegram_settings FROM client_telegram_settings
        WHERE client_id = NEW.client_id
        AND client_notifications_active = true
        AND notify_task_completed = true;

        IF v_telegram_settings.id IS NOT NULL AND v_telegram_settings.client_chat_id IS NOT NULL THEN
            v_message := '✅ *Task Completed*' || chr(10) || chr(10) ||
                        '📋 *' || COALESCE(NEW.title, 'Untitled Task') || '*' || chr(10) ||
                        CASE WHEN NEW.description IS NOT NULL AND NEW.description != ''
                             THEN chr(10) || NEW.description || chr(10) ELSE '' END ||
                        chr(10) || '⏱ Time Spent: ' || COALESCE(NEW.actual_hours::TEXT, '0') || ' hours' || chr(10) ||
                        '🏷 Task ID: `' || COALESCE(NEW.task_id, 'N/A') || '`';

            INSERT INTO telegram_notification_log (client_id, task_id, channel_type, notification_type, message, status)
            VALUES (NEW.client_id, NEW.id, 'client', 'task_completed', v_message, 'pending');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_telegram_task_completed ON client_requests;
CREATE TRIGGER trigger_telegram_task_completed
    AFTER UPDATE ON client_requests
    FOR EACH ROW
    EXECUTE FUNCTION queue_telegram_notification();
