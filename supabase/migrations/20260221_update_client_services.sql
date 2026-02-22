-- Add "AI Usage" as a default service
INSERT INTO global_client_services (id, label, description, display_order, is_default) VALUES
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'AI Usage', 'AI-powered tools & automations', 3, true)
ON CONFLICT DO NOTHING;

-- Update SMS/Phone Automations display order to come after AI Usage
UPDATE global_client_services
SET display_order = 4
WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Remove non-default services "Emails" and "Blog Writing N8n" if they exist
-- (These were added manually via the UI and are not default services)
DELETE FROM global_client_services
WHERE is_default = false
AND (label ILIKE '%emails%' OR label ILIKE '%blog writing%');
