-- Add reseller_id column to clients table
-- This links website/funnel clients to their parent reseller account
ALTER TABLE clients ADD COLUMN IF NOT EXISTS reseller_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_reseller_id ON clients(reseller_id);

-- Insert "Rank Me Higher" reseller account
INSERT INTO clients (name, company_name, email, brand_voice, status, primary_services, notes)
VALUES (
  'Rank Me Higher',
  'Rank Me Higher',
  'admin@rankmehigher.com',
  'Reseller Account',
  'ACTIVE',
  ARRAY['Reseller'],
  '{"is_reseller": true, "submission_type": "reseller-account", "reseller_type": "agency", "submitted_at": "2026-02-17T00:00:00.000Z"}'
);

-- Assign all existing non-reseller, non-archived website clients to "Rank Me Higher"
UPDATE clients
SET reseller_id = (SELECT id FROM clients WHERE company_name = 'Rank Me Higher' AND brand_voice = 'Reseller Account' LIMIT 1)
WHERE reseller_id IS NULL
  AND brand_voice != 'Reseller Account'
  AND (status != 'ARCHIVED' OR status IS NULL);

-- Insert "D&G" reseller account
INSERT INTO clients (name, company_name, brand_voice, status, primary_services, notes)
VALUES (
  'D&G',
  'D&G',
  'Reseller Account',
  'ACTIVE',
  ARRAY['Reseller'],
  '{"is_reseller": true, "submission_type": "reseller-account", "reseller_type": "agency", "submitted_at": "2026-02-17T00:00:00.000Z"}'
);

-- Insert chicagodeckdoc.com website under D&G reseller
INSERT INTO clients (name, company_name, website_url, brand_voice, status, notes, reseller_id)
VALUES (
  'Chicago Deck Doc',
  'Chicago Deck Doc',
  'chicagodeckdoc.com',
  'Website Client',
  'PENDING',
  '{"submission_type": "website", "submitted_at": "2026-02-17T00:00:00.000Z"}',
  (SELECT id FROM clients WHERE company_name = 'D&G' AND brand_voice = 'Reseller Account' LIMIT 1)
);
