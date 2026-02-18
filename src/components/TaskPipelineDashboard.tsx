import React, { useState } from 'react';
import {
    Clock,
    Play,
    CheckCircle2,
    Search,
    RotateCcw,
    Loader2,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TaskDetailModal from './TaskDetailModal';

type UserRole = 'client' | 'manager' | 'qa_manager' | 'admin';

interface Task {
    id: string;
    task_id: string;
    title: string;
    description: string;
    request_type: string;
    priority: string;
    status: string;
    client_id: string;
    client_company: string;
    client_email: string;
    assigned_manager: string;
    assigned_manager_avatar: string;
    qa_manager: string;
    qa_manager_avatar: string;
    created_at: string;
    updated_at: string;
    qa_started_at: string | null;
    qa_completed_at: string | null;
    delivered_at: string | null;
    revision_count: number;
    qa_feedback: string;
}

interface TaskPipelineDashboardProps {
    clientId?: string;
    userRole?: UserRole;
    showAllClients?: boolean;
}

const getSimpleStatus = (status: string): 'waiting' | 'working' | 'done' => {
    if (['pending'].includes(status)) return 'waiting';
    if (['in_progress', 'ready_for_qa', 'in_qa', 'qa_failed'].includes(status)) return 'working';
    return 'done';
};

const getStatusLabel = (status: string): string => {
    const map: Record<string, string> = {
        pending: 'In queue',
        in_progress: 'Being worked on',
        ready_for_qa: 'Under review',
        in_qa: 'Quality check',
        qa_failed: 'Needs revision',
        qa_passed: 'Approved',
        delivered: 'Delivered',
        completed: 'All done',
        cancelled: 'Cancelled',
    };
    return map[status] ?? status;
};

const getTypeEmoji = (type: string): string => {
    const map: Record<string, string> = {
        bug_fix: '🐛', new_feature: '✨', design_change: '🎨',
        content_update: '📝', adjustment: '🔧', other: '💬',
    };
    return map[type] ?? '📋';
};

const priorityConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    low: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/25' },
    normal: { label: 'Normal', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/25' },
    high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/25' },
    urgent: { label: 'Urgent', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/25' },
};

const columns = [
    {
        key: 'waiting' as const,
        title: 'Waiting',
        icon: Clock,
        headerBg: 'bg-amber-500/10',
        headerBorder: 'border-amber-500/25',
        headerColor: 'text-amber-400',
        dotColor: 'bg-amber-400',
        columnBg: 'bg-amber-500/[0.03]',
        cardAccent: 'border-l-amber-400',
    },
    {
        key: 'working' as const,
        title: 'Working on it',
        icon: Play,
        headerBg: 'bg-blue-500/10',
        headerBorder: 'border-blue-500/25',
        headerColor: 'text-blue-400',
        dotColor: 'bg-blue-400',
        columnBg: 'bg-blue-500/[0.03]',
        cardAccent: 'border-l-blue-400',
    },
    {
        key: 'done' as const,
        title: 'Done',
        icon: CheckCircle2,
        headerBg: 'bg-emerald-500/10',
        headerBorder: 'border-emerald-500/25',
        headerColor: 'text-emerald-400',
        dotColor: 'bg-emerald-400',
        columnBg: 'bg-emerald-500/[0.03]',
        cardAccent: 'border-l-emerald-400',
    },
];

const TaskPipelineDashboard: React.FC<TaskPipelineDashboardProps> = ({
    clientId,
    userRole = 'admin',
    showAllClients = true
}) => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: tasks = [], isLoading, refetch } = useQuery({
        queryKey: ['pipeline-tasks', clientId, showAllClients],
        queryFn: async () => {
            let query = (supabase as any)
                .from('client_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (clientId && !showAllClients) {
                query = query.eq('client_id', clientId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as Task[];
        }
    });

    const filteredTasks = tasks.filter(task => {
        if (searchQuery === '') return true;
        return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.task_id?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const tasksByColumn = {
        waiting: filteredTasks.filter(t => getSimpleStatus(t.status) === 'waiting'),
        working: filteredTasks.filter(t => getSimpleStatus(t.status) === 'working'),
        done: filteredTasks.filter(t => getSimpleStatus(t.status) === 'done'),
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 h-9 text-sm"
                    />
                </div>
                <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-9 w-9 p-0 shrink-0">
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 min-h-[300px]">
                {columns.map((col) => {
                    const ColIcon = col.icon;
                    const colTasks = tasksByColumn[col.key];

                    return (
                        <div
                            key={col.key}
                            className={cn(
                                "rounded-xl border border-white/8 overflow-hidden flex flex-col",
                                col.columnBg
                            )}
                        >
                            <div className={cn(
                                "flex items-center justify-between px-3 py-2.5 border-b",
                                col.headerBg,
                                col.headerBorder
                            )}>
                                <div className="flex items-center gap-2">
                                    <ColIcon className={cn("w-4 h-4", col.headerColor)} />
                                    <span className={cn("text-xs font-bold uppercase tracking-wide", col.headerColor)}>
                                        {col.title}
                                    </span>
                                </div>
                                <span className={cn(
                                    "text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center",
                                    col.headerBg, col.headerColor
                                )}>
                                    {colTasks.length}
                                </span>
                            </div>

                            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[400px]">
                                {colTasks.length === 0 ? (
                                    <div className="flex items-center justify-center h-24 text-xs text-muted-foreground/50">
                                        No tasks
                                    </div>
                                ) : (
                                    colTasks.map((task) => {
                                        const priority = priorityConfig[task.priority] || priorityConfig.normal;
                                        const statusLabel = getStatusLabel(task.status);

                                        return (
                                            <button
                                                key={task.id}
                                                onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                                className={cn(
                                                    "w-full text-left p-3 rounded-lg bg-slate-900/60 border border-white/8",
                                                    "hover:border-white/20 hover:bg-slate-800/60 transition-all",
                                                    "border-l-2",
                                                    col.cardAccent,
                                                    "shadow-sm hover:shadow-md"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-1 mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm">{getTypeEmoji(task.request_type)}</span>
                                                        {task.task_id && (
                                                            <span className="text-[9px] font-mono text-slate-500">{task.task_id}</span>
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "text-[9px] font-semibold px-1.5 py-0.5 rounded-full border",
                                                        priority.bg, priority.color, priority.border
                                                    )}>
                                                        {priority.label}
                                                    </span>
                                                </div>

                                                <h4 className="font-medium text-[13px] text-white leading-snug mb-1.5 line-clamp-2">
                                                    {task.title}
                                                </h4>

                                                {task.description && (
                                                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                                                        {task.description}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] text-slate-500">
                                                        {formatDate(task.created_at)}
                                                    </span>
                                                    {col.key === 'working' && (
                                                        <span className={cn("text-[10px] font-medium", col.headerColor)}>
                                                            {statusLabel}
                                                        </span>
                                                    )}
                                                    {task.revision_count > 0 && (
                                                        <span className="text-[10px] text-amber-400 font-medium">
                                                            Rev {task.revision_count}
                                                        </span>
                                                    )}
                                                </div>

                                                {task.assigned_manager && (
                                                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                                                        <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-300">
                                                            {task.assigned_manager.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-[10px] text-slate-500">{task.assigned_manager}</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
                    userRole={userRole}
                    onUpdate={() => {
                        refetch();
                        queryClient.invalidateQueries({ queryKey: ['all-pending-requests'] });
                        queryClient.invalidateQueries({ queryKey: ['all-pending-requests-client-portal'] });
                    }}
                />
            )}
        </div>
    );
};

export default TaskPipelineDashboard;
