import React, { useState } from 'react';
import {
    Clock,
    Play,
    CheckCircle2,
    Search,
    AlertTriangle,
    Truck,
    ChevronRight,
    Calendar,
    RotateCcw,
    Loader2,
    Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

const getProgressPercent = (status: string): number => {
    const map: Record<string, number> = {
        pending: 0, in_progress: 25, ready_for_qa: 50, in_qa: 65,
        qa_failed: 40, qa_passed: 85, delivered: 95, completed: 100, cancelled: 100,
    };
    return map[status] ?? 0;
};

const getProgressLabel = (status: string): string => {
    const map: Record<string, string> = {
        pending: 'In queue', in_progress: 'Being worked on', ready_for_qa: 'Under review',
        in_qa: 'Quality check', qa_failed: 'Needs revision', qa_passed: 'Approved',
        delivered: 'Delivered', completed: 'All done', cancelled: 'Cancelled',
    };
    return map[status] ?? status;
};

const priorityDisplay: Record<string, { label: string; dot: string }> = {
    low: { label: 'Low', dot: 'bg-slate-400' },
    normal: { label: 'Normal', dot: 'bg-blue-400' },
    high: { label: 'High', dot: 'bg-orange-400' },
    urgent: { label: 'Urgent', dot: 'bg-red-400' },
};

const TaskPipelineDashboard: React.FC<TaskPipelineDashboardProps> = ({
    clientId,
    userRole = 'admin',
    showAllClients = true
}) => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'waiting' | 'working' | 'done'>('all');

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
        const matchesSearch = searchQuery === '' ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.task_id?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = activeFilter === 'all' || getSimpleStatus(task.status) === activeFilter;

        return matchesSearch && matchesFilter;
    });

    const waitingCount = tasks.filter(t => getSimpleStatus(t.status) === 'waiting').length;
    const workingCount = tasks.filter(t => getSimpleStatus(t.status) === 'working').length;
    const doneCount = tasks.filter(t => getSimpleStatus(t.status) === 'done').length;

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
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                        activeFilter === 'all' ? "bg-white/10 border-white/20" : "bg-white/3 border-white/8 hover:border-white/15"
                    )}
                >
                    <span className={cn("text-sm font-semibold", activeFilter === 'all' ? "text-white" : "text-muted-foreground")}>{tasks.length}</span>
                    <span className="text-xs text-muted-foreground">All</span>
                </button>
                <button
                    onClick={() => setActiveFilter('waiting')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                        activeFilter === 'waiting' ? "bg-amber-500/15 border-amber-500/30" : "bg-amber-500/5 border-amber-500/15 hover:border-amber-500/25"
                    )}
                >
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">{waitingCount}</span>
                    <span className="text-xs text-muted-foreground">Waiting</span>
                </button>
                <button
                    onClick={() => setActiveFilter('working')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                        activeFilter === 'working' ? "bg-blue-500/15 border-blue-500/30" : "bg-blue-500/5 border-blue-500/15 hover:border-blue-500/25"
                    )}
                >
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-sm font-semibold text-blue-400">{workingCount}</span>
                    <span className="text-xs text-muted-foreground">Working</span>
                </button>
                <button
                    onClick={() => setActiveFilter('done')}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                        activeFilter === 'done' ? "bg-emerald-500/15 border-emerald-500/30" : "bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/25"
                    )}
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">{doneCount}</span>
                    <span className="text-xs text-muted-foreground">Done</span>
                </button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white/5 border-white/10 h-9"
                    />
                </div>
                <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-9 w-9 p-0">
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-10">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400/30" />
                        <p className="text-muted-foreground text-sm">No tasks found</p>
                    </div>
                ) : (
                    filteredTasks.map((task) => {
                        const simpleStatus = getSimpleStatus(task.status);
                        const progress = getProgressPercent(task.status);
                        const progressLabel = getProgressLabel(task.status);
                        const priority = priorityDisplay[task.priority] || priorityDisplay.normal;

                        const progressBarColor =
                            simpleStatus === 'done' ? 'bg-emerald-400'
                            : simpleStatus === 'working' ? 'bg-blue-400'
                            : 'bg-amber-400';

                        return (
                            <button
                                key={task.id}
                                onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                                className="w-full text-left p-4 rounded-xl bg-card/40 border border-white/8 hover:border-white/15 transition-all"
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-white leading-snug mb-1 truncate">
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{formatDate(task.created_at)}</span>
                                            <span className="text-white/20">|</span>
                                            <div className="flex items-center gap-1">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", priority.dot)} />
                                                <span>{priority.label}</span>
                                            </div>
                                            {task.task_id && (
                                                <>
                                                    <span className="text-white/20">|</span>
                                                    <span className="font-mono text-[10px]">{task.task_id}</span>
                                                </>
                                            )}
                                            {task.assigned_manager && (
                                                <>
                                                    <span className="text-white/20">|</span>
                                                    <span>{task.assigned_manager}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "text-xs font-medium",
                                            simpleStatus === 'done' ? 'text-emerald-400'
                                            : simpleStatus === 'working' ? 'text-blue-400'
                                            : 'text-amber-400'
                                        )}>
                                            {progressLabel}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">{progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500", progressBarColor)}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
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
