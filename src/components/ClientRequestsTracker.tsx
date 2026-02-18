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
    RotateCcw
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

const kanbanColumns = [
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
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
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

        return (
            <div
                key={request.id}
                className={cn(
                    "rounded-lg bg-slate-900/60 border border-white/8 transition-all overflow-hidden",
                    "border-l-2",
                    col.cardAccent,
                    isExpanded ? "ring-1 ring-white/10 border-white/15" : "hover:border-white/15 hover:bg-slate-800/60",
                    "shadow-sm"
                )}
            >
                <button
                    onClick={() => setExpandedId(isExpanded ? null : request.id)}
                    className="w-full text-left p-3"
                >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">{getTypeEmoji(request.request_type)}</span>
                            {request.task_id && (
                                <span className="text-[9px] font-mono text-slate-500">{request.task_id}</span>
                            )}
                        </div>
                        <span className={cn(
                            "text-[9px] font-semibold px-1.5 py-0.5 rounded-full border",
                            priority.bg, priority.color, priority.border
                        )}>
                            {priority.label}
                        </span>
                    </div>

                    <h4 className="font-medium text-[13px] text-white leading-snug mb-1 line-clamp-2">
                        {request.title}
                    </h4>

                    {request.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                            {request.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                            {formatDate(request.created_at)}
                        </span>
                        {simpleStatus === 'working' && (
                            <span className={cn("text-[10px] font-medium", col.headerColor)}>
                                {statusLabel}
                            </span>
                        )}
                        {request.revision_count > 0 && (
                            <span className="text-[10px] text-amber-400 font-medium">
                                Rev {request.revision_count}
                            </span>
                        )}
                    </div>
                </button>

                {isExpanded && (
                    <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-2">
                        {isAgencyView && simpleStatus !== 'done' && (
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Add a note..."
                                    value={agencyNote}
                                    onChange={(e) => setAgencyNote(e.target.value)}
                                    className="text-xs min-h-[40px] bg-white/5 border-white/10 resize-none"
                                />
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {agencyNote.trim() && (
                                        <Button size="sm" variant="outline" onClick={() => addNote(request.id)} className="text-[10px] h-6 px-2">
                                            <MessageSquare className="w-3 h-3 mr-1" /> Note
                                        </Button>
                                    )}
                                    {request.status === 'pending' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'in_progress')} className="text-[10px] h-6 px-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
                                            <Play className="w-3 h-3 mr-1" /> Start
                                        </Button>
                                    )}
                                    {request.status === 'in_progress' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'ready_for_qa')} className="text-[10px] h-6 px-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30">
                                            <Search className="w-3 h-3 mr-1" /> Review
                                        </Button>
                                    )}
                                    {request.status === 'ready_for_qa' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'in_qa')} className="text-[10px] h-6 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30">
                                            <Eye className="w-3 h-3 mr-1" /> QA
                                        </Button>
                                    )}
                                    {request.status === 'in_qa' && (
                                        <>
                                            <Button size="sm" onClick={() => updateStatus(request.id, 'qa_passed')} className="text-[10px] h-6 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Pass
                                            </Button>
                                            <Button size="sm" onClick={() => updateStatus(request.id, 'qa_failed')} className="text-[10px] h-6 px-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30">
                                                <AlertTriangle className="w-3 h-3 mr-1" /> Fail
                                            </Button>
                                        </>
                                    )}
                                    {request.status === 'qa_failed' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'in_progress')} className="text-[10px] h-6 px-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
                                            <RotateCcw className="w-3 h-3 mr-1" /> Redo
                                        </Button>
                                    )}
                                    {request.status === 'qa_passed' && (
                                        <Button size="sm" onClick={() => updateStatus(request.id, 'delivered')} className="text-[10px] h-6 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30">
                                            <Truck className="w-3 h-3 mr-1" /> Ship
                                        </Button>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                                <MoreVertical className="w-3 h-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => updateStatus(request.id, 'pending')}>
                                                <Circle className="w-4 h-4 mr-2" /> Move to Waiting
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => deleteRequest(request.id)} className="text-red-400">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        )}

                        {isAgencyView && simpleStatus === 'done' && (
                            <div className="flex items-center gap-1.5">
                                <Button size="sm" variant="outline" onClick={() => updateStatus(request.id, 'pending')} className="text-[10px] h-6 px-2">
                                    <RotateCcw className="w-3 h-3 mr-1" /> Reopen
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => deleteRequest(request.id)} className="text-[10px] h-6 px-2 text-red-400 hover:text-red-300">
                                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-3 gap-3 min-h-[250px]">
            {kanbanColumns.map((col) => {
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

                        <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[380px]">
                            {colTasks.length === 0 ? (
                                <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50">
                                    No tasks
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
