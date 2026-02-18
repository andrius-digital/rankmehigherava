import React, { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle2,
    Loader2,
    Play,
    MessageSquare,
    Circle,
    MoreVertical,
    Trash2,
    Search,
    Eye,
    AlertTriangle,
    Truck,
    RotateCcw,
    ChevronRight,
    Sparkles,
    Timer,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface ClientRequest {
    id: string;
    client_id: string;
    task_id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'ready_for_qa' | 'in_qa' | 'qa_failed' | 'qa_passed' | 'delivered' | 'completed' | 'cancelled';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    request_type: string;
    estimated_hours: number;
    actual_hours: number;
    billable: boolean;
    hourly_rate: number;
    agency_notes: string;
    assigned_to: string;
    assigned_manager: string;
    qa_manager: string;
    revision_count: number;
    created_at: string;
    updated_at: string;
    started_at: string | null;
    completed_at: string | null;
    qa_started_at: string | null;
    qa_completed_at: string | null;
    delivered_at: string | null;
}

interface ClientRequestsTrackerProps {
    clientId: string;
    clientName: string;
    isAgencyView?: boolean;
    defaultView?: 'compact' | 'pipeline';
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

const getTypeIcon = (type: string) => {
    const map: Record<string, { icon: typeof Sparkles; color: string }> = {
        bug_fix: { icon: AlertTriangle, color: 'text-red-400' },
        new_feature: { icon: Sparkles, color: 'text-purple-400' },
        design_change: { icon: Eye, color: 'text-pink-400' },
        content_update: { icon: MessageSquare, color: 'text-cyan-400' },
        adjustment: { icon: Timer, color: 'text-orange-400' },
        other: { icon: Circle, color: 'text-slate-400' },
    };
    return map[type] ?? map.other;
};

const priorityConfig: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
    low: { label: 'Low', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-slate-500/20', glow: '' },
    normal: { label: 'Normal', color: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/20', glow: '' },
    high: { label: 'High', color: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-orange-500/5 shadow-sm' },
    urgent: { label: 'Urgent', color: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-500/25', glow: 'shadow-red-500/10 shadow-md' },
};

const kanbanColumns = [
    {
        key: 'waiting' as const,
        title: 'Waiting',
        subtitle: 'Queued up',
        icon: Clock,
        gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
        headerColor: 'text-amber-300',
        accentColor: 'amber',
        dotColor: 'bg-amber-400',
        countBg: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30',
        cardBorder: 'hover:border-amber-500/30',
        cardGlow: 'hover:shadow-amber-500/5',
        emptyIcon: Clock,
    },
    {
        key: 'working' as const,
        title: 'In Progress',
        subtitle: 'Being worked on',
        icon: Play,
        gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
        headerColor: 'text-blue-300',
        accentColor: 'blue',
        dotColor: 'bg-blue-400',
        countBg: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30',
        cardBorder: 'hover:border-blue-500/30',
        cardGlow: 'hover:shadow-blue-500/5',
        emptyIcon: Play,
    },
    {
        key: 'done' as const,
        title: 'Completed',
        subtitle: 'All wrapped up',
        icon: CheckCircle2,
        gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
        headerColor: 'text-emerald-300',
        accentColor: 'emerald',
        dotColor: 'bg-emerald-400',
        countBg: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30',
        cardBorder: 'hover:border-emerald-500/30',
        cardGlow: 'hover:shadow-emerald-500/5',
        emptyIcon: CheckCircle2,
    },
];

const ClientRequestsTracker: React.FC<ClientRequestsTrackerProps> = ({
    clientId,
    clientName,
    isAgencyView = true,
    defaultView = 'pipeline'
}) => {
    const [requests, setRequests] = useState<ClientRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [agencyNote, setAgencyNote] = useState('');
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const fetchRequests = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('client_requests')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests((data || []) as ClientRequest[]);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [clientId]);

    const invalidateAllQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['all-pending-requests'] });
        queryClient.invalidateQueries({ queryKey: ['all-pending-requests-client-portal'] });
        queryClient.invalidateQueries({ queryKey: ['pending-requests-count', clientId] });
        queryClient.invalidateQueries({ queryKey: ['client-requests-count', clientId] });
        queryClient.invalidateQueries({ queryKey: ['pipeline-tasks', clientId] });
    };

    const updateStatus = async (requestId: string, newStatus: string) => {
        try {
            const updates: any = { status: newStatus };
            if (newStatus === 'in_progress') updates.started_at = new Date().toISOString();
            if (newStatus === 'in_qa') updates.qa_started_at = new Date().toISOString();
            if (newStatus === 'qa_passed' || newStatus === 'qa_failed') updates.qa_completed_at = new Date().toISOString();
            if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString();
            if (newStatus === 'completed') updates.completed_at = new Date().toISOString();

            const { error } = await (supabase as any)
                .from('client_requests')
                .update(updates)
                .eq('id', requestId);

            if (error) throw error;

            toast({ title: 'Updated', description: `Task moved to ${getStatusLabel(newStatus)}` });
            invalidateAllQueries();
            fetchRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
        }
    };

    const addNote = async (requestId: string) => {
        if (!agencyNote.trim()) return;
        try {
            const { error } = await (supabase as any)
                .from('task_notes')
                .insert({
                    task_id: requestId,
                    user_name: 'Manager',
                    user_role: 'manager',
                    message: agencyNote,
                    is_internal: false
                });

            if (error) throw error;
            toast({ title: 'Note Added' });
            setAgencyNote('');
            invalidateAllQueries();
            fetchRequests();
        } catch (error) {
            try {
                const request = requests.find(r => r.id === requestId);
                const existingNotes = request?.agency_notes || '';
                const timestamp = new Date().toLocaleString();
                const newNote = existingNotes
                    ? `${existingNotes}\n\n[${timestamp}]\n${agencyNote}`
                    : `[${timestamp}]\n${agencyNote}`;

                const { error: updateError } = await (supabase as any)
                    .from('client_requests')
                    .update({ agency_notes: newNote })
                    .eq('id', requestId);

                if (updateError) throw updateError;
                toast({ title: 'Note Added' });
                setAgencyNote('');
                fetchRequests();
            } catch (fallbackError) {
                toast({ title: 'Error', description: 'Failed to add note', variant: 'destructive' });
            }
        }
    };

    const deleteRequest = async (requestId: string) => {
        try {
            const { error } = await (supabase as any)
                .from('client_requests')
                .delete()
                .eq('id', requestId);

            if (error) throw error;
            toast({ title: 'Request Deleted' });
            invalidateAllQueries();
            fetchRequests();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
        }
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-blue-400 animate-spin" />
                </div>
                <span className="text-xs text-slate-500">Loading requests...</span>
            </div>
        );
    }

    const tasksByColumn = {
        waiting: requests.filter(r => getSimpleStatus(r.status) === 'waiting'),
        working: requests.filter(r => getSimpleStatus(r.status) === 'working'),
        done: requests.filter(r => getSimpleStatus(r.status) === 'done'),
    };

    const renderCard = (request: ClientRequest, col: typeof kanbanColumns[0]) => {
        const priority = priorityConfig[request.priority] || priorityConfig.normal;
        const statusLabel = getStatusLabel(request.status);
        const simpleStatus = getSimpleStatus(request.status);
        const isExpanded = expandedId === request.id;
        const typeInfo = getTypeIcon(request.request_type);
        const TypeIcon = typeInfo.icon;

        return (
            <div
                key={request.id}
                className={cn(
                    "group rounded-xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-sm",
                    "border border-white/[0.08] transition-all duration-300",
                    col.cardBorder, col.cardGlow,
                    isExpanded && "ring-1 ring-white/15 border-white/20 shadow-lg",
                    !isExpanded && "hover:translate-y-[-1px] hover:shadow-lg",
                    priority.glow
                )}
            >
                <button
                    onClick={() => setExpandedId(isExpanded ? null : request.id)}
                    className="w-full text-left p-4"
                >
                    {/* Top row: type icon + task ID + priority */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className={cn("w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center", typeInfo.color)}>
                                <TypeIcon className="w-4 h-4" />
                            </div>
                            {request.task_id && (
                                <span className="text-[11px] font-mono text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded-md">
                                    {request.task_id}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider",
                                priority.bg, priority.color, priority.border
                            )}>
                                {priority.label}
                            </span>
                            <ChevronRight className={cn(
                                "w-4 h-4 text-slate-600 transition-transform duration-200",
                                isExpanded && "rotate-90"
                            )} />
                        </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-semibold text-sm text-white/90 leading-relaxed mb-1.5 line-clamp-2 group-hover:text-white transition-colors">
                        {request.title}
                    </h4>

                    {/* Description */}
                    {request.description && (
                        <p className="text-xs text-slate-400/80 line-clamp-2 mb-3 leading-relaxed">
                            {request.description}
                        </p>
                    )}

                    {/* Bottom row: date + status + revision */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {formatDate(request.created_at)}
                        </span>
                        <div className="flex items-center gap-2">
                            {request.revision_count > 0 && (
                                <span className="text-[10px] text-amber-400/80 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    Rev {request.revision_count}
                                </span>
                            )}
                            {simpleStatus === 'working' && (
                                <span className={cn(
                                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                    `bg-${col.accentColor}-500/10 ${col.headerColor}`
                                )}>
                                    {statusLabel}
                                </span>
                            )}
                        </div>
                    </div>
                </button>

                {/* Expanded actions panel */}
                {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06]">
                        <div className="pt-3" />
                        {isAgencyView && simpleStatus !== 'done' && (
                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Add a note for this task..."
                                    value={agencyNote}
                                    onChange={(e) => setAgencyNote(e.target.value)}
                                    className="text-sm min-h-[60px] bg-white/[0.04] border-white/[0.08] resize-none rounded-lg placeholder:text-slate-600 focus:border-white/20 focus:ring-1 focus:ring-white/10"
                                />
                                <div className="flex items-center gap-2 flex-wrap">
                                    {agencyNote.trim() && (
                                        <Button size="sm" variant="outline" onClick={() => addNote(request.id)}
                                            className="text-xs h-8 px-3 rounded-lg bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08]">
                                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Add Note
                                        </Button>
                                    )}
                                    {request.status === 'pending' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'in_progress')}
                                            className="text-xs h-8 px-3 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/25 hover:border-blue-500/40">
                                            <Play className="w-3.5 h-3.5 mr-1.5" /> Start Work
                                        </Button>
                                    )}
                                    {request.status === 'in_progress' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'ready_for_qa')}
                                            className="text-xs h-8 px-3 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/25 hover:border-purple-500/40">
                                            <Search className="w-3.5 h-3.5 mr-1.5" /> Send to Review
                                        </Button>
                                    )}
                                    {request.status === 'ready_for_qa' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'in_qa')}
                                            className="text-xs h-8 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/25 hover:border-amber-500/40">
                                            <Eye className="w-3.5 h-3.5 mr-1.5" /> Start QA
                                        </Button>
                                    )}
                                    {request.status === 'in_qa' && (
                                        <>
                                            <Button size="sm" onClick={() => updateStatus(request.id, 'qa_passed')}
                                                className="text-xs h-8 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/25 hover:border-emerald-500/40">
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Pass QA
                                            </Button>
                                            <Button size="sm" onClick={() => updateStatus(request.id, 'qa_failed')}
                                                className="text-xs h-8 px-3 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/25 hover:border-red-500/40">
                                                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Fail QA
                                            </Button>
                                        </>
                                    )}
                                    {request.status === 'qa_failed' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'in_progress')}
                                            className="text-xs h-8 px-3 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/25 hover:border-blue-500/40">
                                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Redo
                                        </Button>
                                    )}
                                    {request.status === 'qa_passed' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'delivered')}
                                            className="text-xs h-8 px-3 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/25 hover:border-cyan-500/40">
                                            <Truck className="w-3.5 h-3.5 mr-1.5" /> Deliver
                                        </Button>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-white/[0.06]">
                                                <MoreVertical className="w-4 h-4 text-slate-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                                            <DropdownMenuItem onClick={() => updateStatus(request.id, 'pending')} className="text-sm">
                                                <Circle className="w-4 h-4 mr-2" /> Move to Waiting
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/5" />
                                            <DropdownMenuItem onClick={() => deleteRequest(request.id)} className="text-red-400 focus:text-red-300">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete Request
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        )}

                        {isAgencyView && simpleStatus === 'done' && (
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => updateStatus(request.id, 'pending')}
                                    className="text-xs h-8 px-3 rounded-lg bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08]">
                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reopen
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => deleteRequest(request.id)}
                                    className="text-xs h-8 px-3 rounded-lg text-red-400/70 hover:text-red-300 hover:bg-red-500/10">
                                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 min-h-[300px]">
            {kanbanColumns.map((col) => {
                const ColIcon = col.icon;
                const colTasks = tasksByColumn[col.key];
                const EmptyIcon = col.emptyIcon;

                return (
                    <div
                        key={col.key}
                        className="rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col bg-white/[0.02]"
                    >
                        {/* Column header with gradient */}
                        <div className={cn("relative px-5 py-4 border-b border-white/[0.06]")}>
                            <div className={cn("absolute inset-0 bg-gradient-to-b", col.gradient)} />
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-9 h-9 rounded-xl flex items-center justify-center",
                                        `bg-${col.accentColor}-500/15 ring-1 ring-${col.accentColor}-500/20`
                                    )}>
                                        <ColIcon className={cn("w-4.5 h-4.5", col.headerColor)} />
                                    </div>
                                    <div>
                                        <h3 className={cn("text-sm font-bold tracking-tight", col.headerColor)}>
                                            {col.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{col.subtitle}</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-xs font-bold min-w-[28px] h-7 px-2 rounded-full flex items-center justify-center",
                                    col.countBg
                                )}>
                                    {colTasks.length}
                                </span>
                            </div>
                        </div>

                        {/* Cards area */}
                        <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[450px] scrollbar-thin">
                            {colTasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                                        <EmptyIcon className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500 font-medium">No tasks here</p>
                                        <p className="text-[11px] text-slate-600 mt-0.5">Tasks will appear as they come in</p>
                                    </div>
                                </div>
                            ) : (
                                colTasks.map((request) => renderCard(request, col))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ClientRequestsTracker;
