ALTER TABLE team_portal_members ADD COLUMN IF NOT EXISTS is_manager boolean DEFAULT false;
ALTER TABLE team_portal_members ADD COLUMN IF NOT EXISTS managed_member_ids uuid[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS team_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority text DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  due_date date,
  assignee_id uuid NOT NULL REFERENCES team_portal_members(id) ON DELETE CASCADE,
  assignee_name text DEFAULT '',
  created_by text DEFAULT '',
  labels text[] DEFAULT '{}',
  position integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_tasks_assignee ON team_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON team_tasks(status);
CREATE INDEX IF NOT EXISTS idx_team_tasks_due_date ON team_tasks(due_date);

ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to team_tasks"
  ON team_tasks FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Members can view own tasks"
  ON team_tasks FOR SELECT
  USING (
    assignee_id IN (
      SELECT id FROM team_portal_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert own tasks"
  ON team_tasks FOR INSERT
  WITH CHECK (
    assignee_id IN (
      SELECT id FROM team_portal_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update own tasks"
  ON team_tasks FOR UPDATE
  USING (
    assignee_id IN (
      SELECT id FROM team_portal_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    assignee_id IN (
      SELECT id FROM team_portal_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete own tasks"
  ON team_tasks FOR DELETE
  USING (
    assignee_id IN (
      SELECT id FROM team_portal_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can view managed member tasks"
  ON team_tasks FOR SELECT
  USING (
    assignee_id IN (
      SELECT unnest(managed_member_ids) FROM team_portal_members
      WHERE user_id = auth.uid() AND is_manager = true
    )
  );

CREATE POLICY "Managers can insert tasks for managed members"
  ON team_tasks FOR INSERT
  WITH CHECK (
    assignee_id IN (
      SELECT unnest(managed_member_ids) FROM team_portal_members
      WHERE user_id = auth.uid() AND is_manager = true
    )
  );

CREATE POLICY "Managers can update managed member tasks"
  ON team_tasks FOR UPDATE
  USING (
    assignee_id IN (
      SELECT unnest(managed_member_ids) FROM team_portal_members
      WHERE user_id = auth.uid() AND is_manager = true
    )
  )
  WITH CHECK (
    assignee_id IN (
      SELECT unnest(managed_member_ids) FROM team_portal_members
      WHERE user_id = auth.uid() AND is_manager = true
    )
  );

CREATE POLICY "Managers can delete managed member tasks"
  ON team_tasks FOR DELETE
  USING (
    assignee_id IN (
      SELECT unnest(managed_member_ids) FROM team_portal_members
      WHERE user_id = auth.uid() AND is_manager = true
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Managers can read managed members' AND tablename = 'team_portal_members'
  ) THEN
    EXECUTE 'CREATE POLICY "Managers can read managed members"
      ON team_portal_members FOR SELECT
      USING (
        id IN (
          SELECT unnest(managed_member_ids) FROM team_portal_members
          WHERE user_id = auth.uid() AND is_manager = true
        )
      )';
  END IF;
END $$;
