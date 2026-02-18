import React, { useState, memo, useCallback } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  Search,
  AlertTriangle,
  Eye,
  Plus,
  Calendar,
  User,
  Flag,
  MoreHorizontal,
  Paperclip,
  MessageSquare,
  Timer,
  Loader2,
  GripVertical,
  X,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Kanban column configuration matching ClickUp style
const KANBAN_COLUMNS = [
  { id: 'pending', label: 'TO DO', icon: Clock, color: 'slate', bgGradient: 'from-slate-500/20 to-slate-600/10', borderColor: 'border-slate-500/40' },
  { id: 'in_progress', label: 'IN PROGRESS', icon: Play, color: 'blue', bgGradient: 'from-blue-500/20 to-blue-600/10', borderColor: 'border-blue-500/40' },
  { id: 'in_qa', label: 'IN QA', icon: Eye, color: 'amber', bgGradient: 'from-amber-500/20 to-amber-600/10', borderColor: 'border-amber-500/40' },
  { id: 'qa_failed', label: 'ISSUES FOUND', icon: AlertTriangle, color: 'red', bgGradient: 'from-red-500/20 to-red-600/10', borderColor: 'border-red-500/40' },
  { id: 'completed', label: 'COMPLETED', icon: CheckCircle2, color: 'emerald', bgGradient: 'from-emerald-500/20 to-emerald-600/10', borderColor: 'border-emerald-500/40' },
] as const;

type ColumnId = typeof KANBAN_COLUMNS[number]['id'];

interface Task {
  id: string;
  task_id: string;
  title: string;
  description: string;
  request_type: string;
  priority: string;
  status: string;
  client_id: string;
  actual_hours: number;
  estimated_hours: number;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  attachments_count?: number;
  comments_count?: number;
}

interface KanbanTaskBoardProps {
  clientId: string;
  isAgencyView?: boolean;
}

// Priority colors
const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
  urgent: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Urgent' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'High' },
  normal: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Normal' },
  low: { color: 'text-slate-400', bg: 'bg-slate-500/20', label: 'Low' },
};

// Memoized Task Card
const TaskCard = memo(({
  task,
  onDragStart,
  onClick,
  isAgencyView,
}: {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onClick: () => void;
  isAgencyView: boolean;
}) => {
  const priority = priorityConfig[task.priority] || priorityConfig.normal;

  return (
    <div
      draggable={isAgencyView}
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg bg-slate-800/80 border border-white/10 cursor-pointer",
        "hover:border-orange-500/40 hover:bg-slate-800 transition-all",
        "group"
      )}
    >
      {/* Header with title and menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {task.task_id && (
            <span className="text-[10px] font-mono text-slate-500 block mb-0.5">
              {task.task_id}
            </span>
          )}
          <h4 className="font-medium text-sm text-white line-clamp-2">
            {task.title}
          </h4>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            {isAgencyView && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-400">Delete</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Footer with metadata */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded", priority.bg, priority.color)}>
            {priority.label}
          </span>

          {/* Time tracked */}
          {task.actual_hours > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Timer className="w-3 h-3" />
              {task.actual_hours}h
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Attachments */}
          {(task.attachments_count || 0) > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Paperclip className="w-3 h-3" />
              {task.attachments_count}
            </span>
          )}
          {/* Comments */}
          {(task.comments_count || 0) > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <MessageSquare className="w-3 h-3" />
              {task.comments_count}
            </span>
          )}
          {/* Assignee avatar */}
          {task.assigned_to && (
            <div className="w-5 h-5 rounded-full bg-orange-500/30 flex items-center justify-center">
              <span className="text-[9px] font-bold text-orange-400">
                {task.assigned_to.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
TaskCard.displayName = 'TaskCard';

// Column Component
const KanbanColumn = memo(({
  column,
  tasks,
  onDragOver,
  onDrop,
  onDragStart,
  onTaskClick,
  onAddTask,
  isAgencyView,
}: {
  column: typeof KANBAN_COLUMNS[number];
  tasks: Task[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
  isAgencyView: boolean;
}) => {
  const Icon = column.icon;
  const colorClasses: Record<string, string> = {
    slate: 'text-slate-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
  };

  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] rounded-xl border",
        `bg-gradient-to-b ${column.bgGradient}`,
        column.borderColor
      )}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", colorClasses[column.color])} />
            <span className={cn("font-semibold text-sm", colorClasses[column.color])}>
              {column.label}
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-white/10">
              {tasks.length}
            </Badge>
          </div>
          {isAgencyView && (
            <button
              onClick={() => onAddTask(column.id)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <Plus className={cn("w-4 h-4", colorClasses[column.color])} />
            </button>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[500px] min-h-[100px]">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onClick={() => onTaskClick(task)}
              isAgencyView={isAgencyView}
            />
          ))
        )}
      </div>

      {/* Add Task Button */}
      {isAgencyView && (
        <button
          onClick={() => onAddTask(column.id)}
          className="m-2 p-2 rounded-lg border border-dashed border-white/20 text-slate-400 text-sm hover:border-white/40 hover:text-white transition-all flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      )}
    </div>
  );
});
KanbanColumn.displayName = 'KanbanColumn';

// Add Task Modal
const AddTaskModal = memo(({
  isOpen,
  onClose,
  onSubmit,
  initialStatus,
  clientId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => Promise<void>;
  initialStatus: string;
  clientId: string;
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [hours, setHours] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        status: initialStatus,
        actual_hours: parseFloat(hours) || 0,
        client_id: clientId,
      });
      setTitle('');
      setDescription('');
      setPriority('normal');
      setHours('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="bg-slate-800 border-white/10"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description..."
              className="bg-slate-800 border-white/10 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-slate-800 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Hours Spent</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="bg-slate-800 border-white/10"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Task'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
AddTaskModal.displayName = 'AddTaskModal';

// Main Kanban Board Component
const KanbanTaskBoard: React.FC<KanbanTaskBoardProps> = ({
  clientId,
  isAgencyView = true,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalStatus, setAddModalStatus] = useState('pending');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch tasks
  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['kanban-tasks', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_requests')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Task[];
    },
  });

  // Map status to column (merge some statuses)
  const getColumnId = (status: string): ColumnId => {
    if (status === 'ready_for_qa') return 'in_progress';
    if (status === 'qa_passed' || status === 'delivered') return 'completed';
    if (KANBAN_COLUMNS.some(c => c.id === status)) return status as ColumnId;
    return 'pending';
  };

  // Group tasks by column
  const tasksByColumn = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => getColumnId(task.status) === column.id);
    return acc;
  }, {} as Record<ColumnId, Task[]>);

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === columnId) {
      setDraggedTask(null);
      return;
    }

    try {
      const updates: Record<string, unknown> = { status: columnId };

      // Add timestamps for specific transitions
      if (columnId === 'in_progress') {
        updates.started_at = new Date().toISOString();
      }
      if (columnId === 'in_qa') {
        updates.qa_started_at = new Date().toISOString();
      }
      if (columnId === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('client_requests')
        .update(updates)
        .eq('id', draggedTask.id);

      if (error) throw error;

      toast({
        title: 'Task Moved',
        description: `Task moved to ${KANBAN_COLUMNS.find(c => c.id === columnId)?.label}`,
      });

      refetch();
      queryClient.invalidateQueries({ queryKey: ['pipeline-tasks'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to move task',
        variant: 'destructive',
      });
    }

    setDraggedTask(null);
  }, [draggedTask, toast, refetch, queryClient]);

  // Add task handler
  const handleAddTask = useCallback((columnId: string) => {
    setAddModalStatus(columnId);
    setAddModalOpen(true);
  }, []);

  const handleSubmitTask = useCallback(async (taskData: Partial<Task>) => {
    const taskId = `TSK-${Date.now().toString(36).toUpperCase()}`;

    const { error } = await supabase
      .from('client_requests')
      .insert({
        ...taskData,
        task_id: taskId,
        request_type: 'other',
        billable: true,
        hourly_rate: 0,
        estimated_hours: 0,
        revision_count: 0,
      });

    if (error) throw error;

    toast({
      title: 'Task Created',
      description: 'New task has been added',
    });

    refetch();
    queryClient.invalidateQueries({ queryKey: ['pipeline-tasks'] });
  }, [toast, refetch, queryClient]);

  // Stats
  const stats = {
    total: tasks.length,
    pending: tasksByColumn.pending?.length || 0,
    inProgress: (tasksByColumn.in_progress?.length || 0) + (tasksByColumn.in_qa?.length || 0),
    completed: tasksByColumn.completed?.length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-3 rounded-lg bg-slate-800/50 border border-white/10">
          <div className="text-2xl font-bold font-orbitron text-white">{stats.total}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Total Tasks</div>
        </div>
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <div className="text-2xl font-bold font-orbitron text-amber-400">{stats.pending}</div>
          <div className="text-[10px] uppercase tracking-wider text-amber-400/70">Pending</div>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="text-2xl font-bold font-orbitron text-blue-400">{stats.inProgress}</div>
          <div className="text-[10px] uppercase tracking-wider text-blue-400/70">In Progress</div>
        </div>
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <div className="text-2xl font-bold font-orbitron text-emerald-400">{stats.completed}</div>
          <div className="text-[10px] uppercase tracking-wider text-emerald-400/70">Completed</div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] || []}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onTaskClick={setSelectedTask}
            onAddTask={handleAddTask}
            isAgencyView={isAgencyView}
          />
        ))}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleSubmitTask}
        initialStatus={addModalStatus}
        clientId={clientId}
      />
    </div>
  );
};

export default KanbanTaskBoard;
