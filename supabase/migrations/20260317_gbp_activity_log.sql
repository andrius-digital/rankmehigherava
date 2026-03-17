CREATE TABLE IF NOT EXISTS gbp_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL DEFAULT 'Unknown',
  user_email TEXT NOT NULL DEFAULT '',
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'move', 'status_change')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'location', 'task', 'sop')),
  entity_name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gbp_activity_log_created_at ON gbp_activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gbp_activity_log_entity_type ON gbp_activity_log (entity_type);

ALTER TABLE gbp_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users full access to activity log"
  ON gbp_activity_log
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can read and insert activity log"
  ON gbp_activity_log
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
