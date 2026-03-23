import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Eye } from 'lucide-react';
import type { TeamTask } from './types';

interface SummaryBarProps {
  tasks: TeamTask[];
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'done') return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(dueDate + 'T00:00:00') < now;
}

const SummaryBar: React.FC<SummaryBarProps> = ({ tasks }) => {
  const todo = tasks.filter(t => t.status === 'todo').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const inReview = tasks.filter(t => t.status === 'in_review').length;
  const done = tasks.filter(t => t.status === 'done').length;
  const overdue = tasks.filter(t => isOverdue(t.due_date, t.status)).length;

  const items = [
    { label: 'To Do', value: todo, icon: ListTodo, color: 'text-blue-400' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-400' },
    { label: 'In Review', value: inReview, icon: Eye, color: 'text-purple-400' },
    { label: 'Done', value: done, icon: CheckCircle2, color: 'text-green-400' },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Icon className={`w-3.5 h-3.5 ${item.color}`} />
            <span className="text-xs font-bold text-foreground">{item.value}</span>
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        );
      })}
      {overdue > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-bold text-red-400">{overdue}</span>
          <span className="text-[10px] text-red-400/70">Overdue</span>
        </div>
      )}
    </div>
  );
};

export default SummaryBar;
