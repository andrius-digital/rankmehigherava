-- Management Checklist Overhaul
-- Final 9 items: Telegram Group Chat, Github Repository, DNS Access,
-- Telegram Leads, N8N Automation Set Up, GHL Sub Account,
-- Technical SEO, All Pages Are Indexed, Speed Optimization

-- 1. Delete removed items
DELETE FROM global_checklist_items WHERE id = 'b6db7902-19ab-4c6e-902e-da15f89839eb'; -- Resend.com Email To Client
DELETE FROM global_checklist_items WHERE id = '833fa8cc-91b1-4a7b-b21c-c5ab480edf10'; -- We Own The Domain
DELETE FROM global_checklist_items WHERE id = 'abed2f6e-d8cf-47f0-af3c-677940384baf'; -- Local SEO is Done

-- 2. Update existing items
UPDATE global_checklist_items SET description = 'Group chat name in the notes', display_order = 1
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE global_checklist_items SET label = 'Github Repository', description = 'In Organization', display_order = 2
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE global_checklist_items SET label = 'DNS Access', description = 'Nameservers, domain registrar & access info', display_order = 3
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE global_checklist_items SET label = 'Telegram Leads', description = 'Lead channels, funnels & newsletter bots', display_order = 4
WHERE id = '55555555-5555-5555-5555-555555555555';

UPDATE global_checklist_items SET label = 'GHL Sub Account', description = 'GoHighLevel sub-account created & linked', display_order = 6
WHERE id = 'ce0d4313-358c-4f2a-bc6d-98fc5fe369d3';

UPDATE global_checklist_items SET label = 'Technical SEO', description = 'Site-wide & per-page SEO checklist', display_order = 7
WHERE id = '81bf9f6d-448b-4f2f-a1cb-2fa359edff41';

UPDATE global_checklist_items SET display_order = 9
WHERE id = 'd7b6416d-27db-45af-a63a-15bdb66025bb';

-- 3. Insert new items
INSERT INTO global_checklist_items (id, label, description, display_order, is_default) VALUES
    ('66666666-6666-6666-6666-666666666666', 'N8N Automation Set Up', 'Active automations & workflow tracking', 5, true),
    ('77777777-7777-7777-7777-777777777777', 'All Pages Are Indexed', 'All website pages indexed by Google', 8, true)
ON CONFLICT DO NOTHING;
