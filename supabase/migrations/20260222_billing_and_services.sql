-- 1. Add completed_by column to client_requests
ALTER TABLE client_requests ADD COLUMN IF NOT EXISTS completed_by TEXT DEFAULT NULL;

-- 2. Reorder services: AI Usage moves to position 2, Monthly Website Upgrades to position 3
UPDATE global_client_services SET display_order = 2 WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
UPDATE global_client_services SET display_order = 3 WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- 3. Auto-toggle trigger: when a new client is created, auto-enable 3 core services
CREATE OR REPLACE FUNCTION auto_toggle_default_services()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO client_services_status (client_id, service_item_id, checked)
    VALUES
        (NEW.id, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),
        (NEW.id, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
        (NEW.id, 'dddddddd-dddd-dddd-dddd-dddddddddddd', true)
    ON CONFLICT (client_id, service_item_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_toggle_default_services ON clients;
CREATE TRIGGER trigger_auto_toggle_default_services
    AFTER INSERT ON clients
    FOR EACH ROW
    EXECUTE FUNCTION auto_toggle_default_services();
