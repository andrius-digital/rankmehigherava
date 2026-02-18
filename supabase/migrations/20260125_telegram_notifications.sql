-- Migration: Telegram Notifications System
-- Stores Telegram bot credentials per client (secure, not exposed to frontend)

-- Table to store client Telegram settings
CREATE TABLE IF NOT EXISTS client_telegram_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    telegram_chat_id TEXT NOT NULL,
    telegram_bot_token TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notify_task_completed BOOLEAN DEFAULT true,
    notify_task_started BOOLEAN DEFAULT false,
    notify_qa_status BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE client_telegram_settings ENABLE ROW LEVEL SECURITY;

-- Only allow agency users (admins/managers) to manage telegram settings
-- Clients should NOT see their own telegram tokens
CREATE POLICY "Agency can manage telegram settings"
    ON client_telegram_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Create index for faster lookups
CREATE INDEX idx_telegram_settings_client_id ON client_telegram_settings(client_id);

-- Notification log table (for debugging/tracking)
CREATE TABLE IF NOT EXISTS telegram_notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    task_id UUID REFERENCES client_requests(id) ON DELETE SET NULL,
    notification_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, sent, failed
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on log
ALTER TABLE telegram_notification_log ENABLE ROW LEVEL SECURITY;

-- Only agency can view logs
CREATE POLICY "Agency can view notification logs"
    ON telegram_notification_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'manager')
        )
    );

-- Function to queue telegram notification (called by trigger)
CREATE OR REPLACE FUNCTION queue_telegram_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_client_name TEXT;
    v_telegram_settings RECORD;
    v_message TEXT;
BEGIN
    -- Only proceed if status changed to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

        -- Get client name
        SELECT name INTO v_client_name
        FROM clients
        WHERE id = NEW.client_id;

        -- Get telegram settings for this client
        SELECT * INTO v_telegram_settings
        FROM client_telegram_settings
        WHERE client_id = NEW.client_id
        AND is_active = true
        AND notify_task_completed = true;

        -- If telegram is configured, log the notification for the edge function to process
        IF v_telegram_settings.id IS NOT NULL THEN
            -- Create the message
            v_message := '✅ *Task Completed*' || chr(10) || chr(10) ||
                        '📋 *' || COALESCE(NEW.title, 'Untitled Task') || '*' || chr(10) ||
                        CASE WHEN NEW.description IS NOT NULL AND NEW.description != ''
                             THEN chr(10) || NEW.description || chr(10)
                             ELSE '' END ||
                        chr(10) || '⏱ Time Spent: ' || COALESCE(NEW.actual_hours::TEXT, '0') || ' hours' || chr(10) ||
                        '🏷 Task ID: `' || COALESCE(NEW.task_id, 'N/A') || '`' || chr(10) ||
                        chr(10) || '_Completed on ' || TO_CHAR(NOW(), 'Mon DD, YYYY at HH:MI AM') || '_';

            -- Insert into notification log (edge function will pick this up)
            INSERT INTO telegram_notification_log (
                client_id,
                task_id,
                notification_type,
                message,
                status
            ) VALUES (
                NEW.client_id,
                NEW.id,
                'task_completed',
                v_message,
                'pending'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on client_requests
DROP TRIGGER IF EXISTS trigger_telegram_task_completed ON client_requests;
CREATE TRIGGER trigger_telegram_task_completed
    AFTER UPDATE ON client_requests
    FOR EACH ROW
    EXECUTE FUNCTION queue_telegram_notification();

-- Grant necessary permissions
GRANT SELECT ON client_telegram_settings TO authenticated;
GRANT INSERT ON telegram_notification_log TO authenticated;
GRANT SELECT ON telegram_notification_log TO authenticated;
