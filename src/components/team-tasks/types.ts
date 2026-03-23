export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface TeamTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string;
  assignee_name: string;
  created_by: string;
  labels: string[];
  position: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_manager: boolean;
  managed_member_ids: string[];
}

export const STATUS_COLUMNS: { key: TaskStatus; label: string; color: string; bgColor: string }[] = [
  { key: 'todo', label: 'To Do', color: 'border-blue-500/50', bgColor: 'bg-blue-500/10' },
  { key: 'in_progress', label: 'In Progress', color: 'border-amber-500/50', bgColor: 'bg-amber-500/10' },
  { key: 'in_review', label: 'In Review', color: 'border-purple-500/50', bgColor: 'bg-purple-500/10' },
  { key: 'done', label: 'Done', color: 'border-green-500/50', bgColor: 'bg-green-500/10' },
];

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; dot: string }> = {
  urgent: { label: 'Urgent', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
  medium: { label: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
  low: { label: 'Low', color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400' },
};

export const LABEL_PRESETS = ['Bug', 'Feature', 'Design', 'Content', 'SEO', 'Dev', 'Marketing', 'Urgent', 'Client Work'];
