import React from 'react';
import { Calendar, GripVertical, Trash2, CheckCircle2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TeamTask } from './types';
import { PRIORITY_CONFIG } from './types';

interface TaskCardProps {
  task: TeamTask;
  onEdit: (task: TeamTask) => void;
  onDelete: (taskId: string) => void;
  onToggleDone: (task: TeamTask) => void;
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  return due < now;
}

function formatDate(date: string | null): string {
  if (!date) return '';
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleDone }) => {
  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = task.status !== 'done' && isOverdue(task.due_date);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-card/40 backdrop-blur-sm border rounded-xl p-3 cursor-pointer transition-all hover:border-white/20 ${
        isDragging ? 'opacity-50 scale-95 z-50' : ''
      } ${overdue ? 'border-red-500/40' : 'border-white/10'}`}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start gap-2">
        <div
          className="pt-0.5 opacity-0 group-hover:opacity-50 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className={`text-sm font-semibold truncate ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h4>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleDone(task); }}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                task.status === 'done'
                  ? 'border-green-400 bg-green-400/20 text-green-400'
                  : 'border-white/20 hover:border-green-400/50'
              }`}
            >
              {task.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
            </button>
          </div>

          {task.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
          )}

          <div className="flex items-center flex-wrap gap-1.5">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${priority.color}`}>
              {priority.label}
            </span>

            {task.labels.map((label, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 border border-white/10 text-muted-foreground">
                {label}
              </span>
            ))}

            {task.due_date && (
              <span className={`flex items-center gap-0.5 text-[10px] ml-auto ${
                overdue ? 'text-red-400 font-bold' : 'text-muted-foreground'
              }`}>
                <Calendar className="w-2.5 h-2.5" />
                {formatDate(task.due_date)}
              </span>
            )}
          </div>

          {task.assignee_name && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[8px] font-bold text-cyan-400">{task.assignee_name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-[10px] text-muted-foreground truncate">{task.assignee_name}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};

export default TaskCard;
