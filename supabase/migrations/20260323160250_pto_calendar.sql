CREATE TABLE IF NOT EXISTS pto_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name TEXT NOT NULL,
  member_email TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'vacation' CHECK (type IN ('vacation', 'sick', 'personal', 'holiday', 'other')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'denied')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pto_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access on pto_entries"
  ON pto_entries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon read pto_entries"
  ON pto_entries FOR SELECT
  USING (true);
