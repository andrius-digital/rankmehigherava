-- Add 'reseller' to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'reseller';

-- Add reseller_id column to profiles table
-- This links a user account to their reseller client record
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reseller_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_reseller_id ON profiles(reseller_id);

-- RLS policy: Reseller users can view their own reseller record and their child clients
CREATE POLICY "Resellers can view own clients"
ON clients FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'reseller'::app_role) AND (
    -- Can see their own reseller account record
    id = (SELECT reseller_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
    OR
    -- Can see clients that belong to their reseller
    notes::jsonb->>'reseller_parent_id' = (
      SELECT reseller_id::text FROM profiles WHERE user_id = auth.uid() LIMIT 1
    )
  )
);
