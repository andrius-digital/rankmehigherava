-- Create tasks table for the Task Pipeline
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT DEFAULT 'normal',
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  order_index INTEGER DEFAULT 0,
  labels JSONB DEFAULT '[]'::jsonb,
  project TEXT DEFAULT 'general',
  estimated_hours NUMERIC,
  attachments_count INTEGER DEFAULT 0,
  subtasks_count INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Authenticated users can view all tasks
CREATE POLICY "Authenticated users can view tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create tasks
CREATE POLICY "Authenticated users can create tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update tasks
CREATE POLICY "Authenticated users can update tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (true);

-- Only admins/moderators can delete tasks
CREATE POLICY "Admins can delete tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (public.is_admin_or_moderator(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;