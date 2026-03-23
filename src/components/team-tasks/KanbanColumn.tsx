import React from 'react';
import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TeamTask, TaskStatus } from './types';
import { STATUS_COLUMNS } from './types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: TeamTask[];
  onEditTask: (task: TeamTask) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleDone: (task: TeamTask) => void;
  onAddTask: (status: TaskStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status, tasks, onEditTask, onDeleteTask, onToggleDone, onAddTask
}) => {
  const column = STATUS_COLUMNS.find(c => c.key === status)!;

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: 'column', status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] max-w-[320px] flex-1 rounded-xl border-t-2 ${column.color} ${
        isOver ? 'bg-white/5' : 'bg-white/[0.02]'
      } transition-colors`}
    >
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h3 className="font-orbitron text-xs font-bold uppercase tracking-wide text-foreground">{column.label}</h3>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${column.bgColor} text-foreground`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 px-2 pb-2 space-y-2 overflow-y-auto min-h-[100px]">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onToggleDone={onToggleDone}
            />
          ))}

          {tasks.length === 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground/30">
              <p className="text-xs">Drop tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
