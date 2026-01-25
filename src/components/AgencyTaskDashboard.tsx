import React, { useState } from 'react';
import {
    Clock,
    Play,
    CheckCircle2,
    Search,
    AlertTriangle,
    Truck,
    Eye,
    ChevronDown,
    ChevronRight,
    User,
    Calendar,
    Filter,
    RotateCcw,
    ArrowRight,
    Loader2,
    Building2,
    Users,
    LayoutDashboard,
    ClipboardCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import TaskDetailModal from './TaskDetailModal';

// Pipeline stage configuration
const PIPELINE_STAGES = [
    { id: 'pending', label: 'Pending', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' },
    { id: 'in_progress', label: 'In Progress', icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
    { id: 'ready_for_qa', label: 'Ready for QA', icon: Search, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
    { id: 'in_qa', label: 'In QA', icon: Eye, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
    { id: 'qa_failed', label: 'QA Failed', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
    { id: 'qa_passed', label: 'QA Passed', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
    { id: 'delivered', label: 'Delivered', icon: Truck, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' },
] as const;

type PipelineStatus = typeof PIPELINE_STAGES[number]['id'];
type UserRole = 'manager' | 'qa_manager' | 'admin';

interface Task {
    id: string;
    task_id: string;
    title: string;
    description: string;
    request_type: string;
    priority: string;
    status: PipelineStatus;
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

interface Client {
    id: string;
    company_name: string;
    contact_name: string;
}

interface AgencyTaskDashboardProps {
    userRole?: UserRole;
    defaultTab?: 'all' | 'my_tasks' | 'qa_tasks';
}

const AgencyTaskDashboard: React.FC<AgencyTaskDashboardProps> = ({
    userRole = 'admin',
    defaultTab = 'all'
}) => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [clientFilter, setClientFilter] = useState<string>('all');
    const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(['pending', 'in_progress', 'ready_for_qa', 'in_qa']));
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Fetch all tasks
    const { data: tasks = [], isLoading, refetch } = useQuery({
        queryKey: ['all-agency-tasks'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('client_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []) as Task[];
        }
    });

    // Fetch clients for filter
    const { data: clients = [] } = useQuery({
        queryKey: ['clients-for-filter'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('clients')
                .select('id, company_name, contact_name')
                .order('company_name');

            if (error) throw error;
            return (data || []) as Client[];
        }
    });

    // Filter tasks based on tab and filters
    const getFilteredTasks = () => {
        let filtered = tasks;

        // Tab-based filtering
        if (activeTab === 'my_tasks') {
            // Show tasks where user is assigned manager
            filtered = filtered.filter(task =>
                task.assigned_manager || task.status === 'in_progress'
            );
        } else if (activeTab === 'qa_tasks') {
            // Show only QA-related tasks
            filtered = filtered.filter(task =>
                ['ready_for_qa', 'in_qa', 'qa_failed', 'qa_passed'].includes(task.status)
            );
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.task_id?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(task => task.status === statusFilter);
        }

        // Client filter
        if (clientFilter !== 'all') {
            filtered = filtered.filter(task => task.client_id === clientFilter);
        }

        return filtered;
    };

    const filteredTasks = getFilteredTasks();

    // Group tasks by stage
    const tasksByStage = PIPELINE_STAGES.reduce((acc, stage) => {
        acc[stage.id] = filteredTasks.filter(task => task.status === stage.id);
        return acc;
    }, {} as Record<PipelineStatus, Task[]>);

    // Calculate stats
    const stats = {
        total: filteredTasks.length,
        pending: tasksByStage.pending?.length || 0,
        inProgress: (tasksByStage.in_progress?.length || 0),
        inQa: (tasksByStage.ready_for_qa?.length || 0) + (tasksByStage.in_qa?.length || 0),
        qaFailed: tasksByStage.qa_failed?.length || 0,
        completed: (tasksByStage.qa_passed?.length || 0) + (tasksByStage.delivered?.length || 0),
    };

    const toggleStage = (stageId: string) => {
        const newExpanded = new Set(expandedStages);
        if (newExpanded.has(stageId)) {
            newExpanded.delete(stageId);
        } else {
            newExpanded.add(stageId);
        }
        setExpandedStages(newExpanded);
    };

    const openTaskDetail = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'normal': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'bug_fix': return '🐛';
            case 'new_feature': return '✨';
            case 'design_change': return '🎨';
            case 'content_update': return '📝';
            default: return '📋';
        }
    };

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.company_name || 'Unknown Client';
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
            {/* Header with Role Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full sm:w-auto">
                    <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                        <TabsTrigger value="all" className="gap-1.5">
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">All Tasks</span>
                            <span className="sm:hidden">All</span>
                        </TabsTrigger>
                        <TabsTrigger value="my_tasks" className="gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">My Tasks</span>
                            <span className="sm:hidden">Mine</span>
                        </TabsTrigger>
                        <TabsTrigger value="qa_tasks" className="gap-1.5">
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">QA Queue</span>
                            <span className="sm:hidden">QA</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetch()}
                    className="h-9"
                >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Refresh
                </Button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-white/10">
                    <div className="text-xl font-bold font-orbitron text-white">{stats.total}</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">Total</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-500/10 border border-slate-500/30">
                    <div className="text-xl font-bold font-orbitron text-slate-400">{stats.pending}</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400/70">Pending</div>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="text-xl font-bold font-orbitron text-blue-400">{stats.inProgress}</div>
                    <div className="text-[9px] uppercase tracking-wider text-blue-400/70">In Progress</div>
                </div>
                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <div className="text-xl font-bold font-orbitron text-purple-400">{stats.inQa}</div>
                    <div className="text-[9px] uppercase tracking-wider text-purple-400/70">QA Queue</div>
                </div>
                {stats.qaFailed > 0 && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="text-xl font-bold font-orbitron text-red-400">{stats.qaFailed}</div>
                        <div className="text-[9px] uppercase tracking-wider text-red-400/70">Failed</div>
                    </div>
                )}
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-xl font-bold font-orbitron text-emerald-400">{stats.completed}</div>
                    <div className="text-[9px] uppercase tracking-wider text-emerald-400/70">Done</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-slate-800/50 border-white/10 h-9"
                    />
                </div>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-[160px] h-9 bg-slate-800/50 border-white/10">
                        <Building2 className="w-3 h-3 mr-1" />
                        <SelectValue placeholder="Client" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Clients</SelectItem>
                        {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.company_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-9 bg-slate-800/50 border-white/10">
                        <Filter className="w-3 h-3 mr-1" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {PIPELINE_STAGES.map(stage => (
                            <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Pipeline Stages */}
            <div className="space-y-2">
                {PIPELINE_STAGES.map((stage) => {
                    const stageTasks = tasksByStage[stage.id] || [];
                    const isExpanded = expandedStages.has(stage.id);
                    const StageIcon = stage.icon;

                    // Skip empty stages in filtered views
                    if (stageTasks.length === 0 && activeTab !== 'all') {
                        return null;
                    }

                    return (
                        <Collapsible
                            key={stage.id}
                            open={isExpanded}
                            onOpenChange={() => toggleStage(stage.id)}
                        >
                            <CollapsibleTrigger className="w-full">
                                <div className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                                    stage.bg,
                                    stage.border,
                                    isExpanded && "rounded-b-none"
                                )}>
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? (
                                            <ChevronDown className={cn("w-4 h-4", stage.color)} />
                                        ) : (
                                            <ChevronRight className={cn("w-4 h-4", stage.color)} />
                                        )}
                                        <div className={cn(
                                            "w-7 h-7 rounded-md flex items-center justify-center",
                                            stage.bg
                                        )}>
                                            <StageIcon className={cn("w-4 h-4", stage.color)} />
                                        </div>
                                        <span className={cn("font-orbitron text-sm font-bold", stage.color)}>
                                            {stage.label}
                                        </span>
                                    </div>
                                    <Badge className={cn("font-orbitron", stage.bg, stage.color, stage.border)}>
                                        {stageTasks.length}
                                    </Badge>
                                </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className={cn(
                                    "border border-t-0 rounded-b-lg p-2 space-y-2",
                                    stage.border,
                                    "bg-slate-900/50"
                                )}>
                                    {stageTasks.length === 0 ? (
                                        <div className="text-center py-4 text-sm text-slate-500">
                                            No tasks in this stage
                                        </div>
                                    ) : (
                                        stageTasks.map((task) => (
                                            <button
                                                key={task.id}
                                                onClick={() => openTaskDetail(task)}
                                                className="w-full text-left p-3 rounded-lg bg-slate-800/50 border border-white/10 hover:border-orange-500/30 transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="text-[10px] font-mono text-slate-500">
                                                                {task.task_id || 'TSK-????'}
                                                            </span>
                                                            <Badge className="text-[8px] px-1.5 py-0 bg-slate-700/50 text-slate-300 border-slate-600">
                                                                {getClientName(task.client_id)}
                                                            </Badge>
                                                            <Badge className={cn("text-[9px] px-1.5 py-0", getPriorityColor(task.priority))}>
                                                                {task.priority}
                                                            </Badge>
                                                            <span className="text-sm">{getTypeIcon(task.request_type)}</span>
                                                        </div>
                                                        <h4 className="font-medium text-sm text-white truncate">
                                                            {task.title}
                                                        </h4>
                                                        {task.description && (
                                                            <p className="text-xs text-slate-400 truncate mt-0.5">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                                                </div>
                                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 flex-wrap">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(task.created_at)}
                                                    </div>
                                                    {task.assigned_manager && (
                                                        <div className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {task.assigned_manager}
                                                        </div>
                                                    )}
                                                    {task.revision_count > 0 && (
                                                        <div className="flex items-center gap-1 text-amber-400">
                                                            <RotateCcw className="w-3 h-3" />
                                                            Rev {task.revision_count}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTask(null);
                    }}
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

export default AgencyTaskDashboard;
