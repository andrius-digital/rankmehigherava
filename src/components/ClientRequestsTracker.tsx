import React, { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Play,
    MessageSquare,
    ChevronDown,
    ChevronRight,
    FileText,
    Palette,
    Code,
    Bug,
    Sparkles,
    HelpCircle,
    Check,
    Circle,
    Timer,
    Calendar,
    MoreVertical,
    Trash2,
    Search,
    Eye,
    AlertTriangle,
    Truck,
    LayoutGrid,
    List,
    RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const getProgressPercent = (status: string): number => {
    const map: Record<string, number> = {
        pending: 0,
        in_progress: 25,
        ready_for_qa: 50,
        in_qa: 65,
        qa_failed: 40,
        qa_passed: 85,
        delivered: 95,
        completed: 100,
        cancelled: 100,
    };
    return map[status] ?? 0;
};

const getProgressLabel = (status: string): string => {
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

const priorityDisplay: Record<string, { label: string; dot: string }> = {
    low: { label: 'Low', dot: 'bg-slate-400' },
    normal: { label: 'Normal', dot: 'bg-blue-400' },
    high: { label: 'High', dot: 'bg-orange-400' },
    urgent: { label: 'Urgent', dot: 'bg-red-400' },
};

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

            toast({
                title: 'Updated',
                description: `Task moved to ${getProgressLabel(newStatus)}`,
            });

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

    const waitingRequests = requests.filter(r => getSimpleStatus(r.status) === 'waiting');
    const workingRequests = requests.filter(r => getSimpleStatus(r.status) === 'working');
    const doneRequests = requests.filter(r => getSimpleStatus(r.status) === 'done');

    const statusGroups = [
        { key: 'waiting', label: 'Waiting', count: waitingRequests.length, items: waitingRequests, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400', icon: Clock },
        { key: 'working', label: 'Working on it', count: workingRequests.length, items: workingRequests, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400', icon: Play },
        { key: 'done', label: 'Done', count: doneRequests.length, items: doneRequests, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400', icon: CheckCircle2 },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                {statusGroups.map(g => (
                    <div key={g.key} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl", g.bg, "border", g.border)}>
                        <div className={cn("w-2 h-2 rounded-full", g.dot)} />
                        <span className={cn("text-sm font-semibold", g.color)}>{g.count}</span>
                        <span className="text-xs text-muted-foreground">{g.label}</span>
                    </div>
                ))}
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {requests.length === 0 ? (
                    <div className="text-center py-10">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400/30" />
                        <p className="text-muted-foreground text-sm">No requests yet</p>
                    </div>
                ) : (
                    statusGroups.filter(g => g.items.length > 0).map((group) => (
                        <div key={group.key} className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <div className={cn("w-2 h-2 rounded-full", group.dot)} />
                                <span className={cn("text-xs font-semibold uppercase tracking-wide", group.color)}>{group.label}</span>
                                <span className="text-[10px] text-muted-foreground">({group.count})</span>
                            </div>
                            {group.items.map((request) => {
                        const simpleStatus = getSimpleStatus(request.status);
                        const progress = getProgressPercent(request.status);
                        const progressLabel = getProgressLabel(request.status);
                        const priority = priorityDisplay[request.priority] || priorityDisplay.normal;
                        const isExpanded = expandedId === request.id;

                        const progressBarColor =
                            simpleStatus === 'done' ? 'bg-emerald-400'
                            : simpleStatus === 'working' ? 'bg-blue-400'
                            : 'bg-amber-400';

                        return (
                            <div
                                key={request.id}
                                className={cn(
                                    "rounded-xl border bg-card/40 transition-all overflow-hidden",
                                    isExpanded ? "border-white/20 ring-1 ring-white/5" : "border-white/8 hover:border-white/15"
                                )}
                            >
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : request.id)}
                                    className="w-full p-4 text-left"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm text-foreground leading-snug mb-1 truncate">
                                                {request.title}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{formatDate(request.created_at)}</span>
                                                <span className="text-white/20">|</span>
                                                <div className="flex items-center gap-1">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", priority.dot)} />
                                                    <span>{priority.label}</span>
                                                </div>
                                                {request.task_id && (
                                                    <>
                                                        <span className="text-white/20">|</span>
                                                        <span className="font-mono text-[10px]">{request.task_id}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-4 h-4 text-muted-foreground transition-transform shrink-0 mt-1",
                                            isExpanded && "rotate-90"
                                        )} />
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

                                {isExpanded && (
                                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                                        {request.description && (
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {request.description}
                                            </p>
                                        )}

                                        {isAgencyView && simpleStatus !== 'done' && (
                                            <div className="space-y-2">
                                                <Textarea
                                                    placeholder="Add a note..."
                                                    value={agencyNote}
                                                    onChange={(e) => setAgencyNote(e.target.value)}
                                                    className="text-xs min-h-[50px] bg-white/5 border-white/10 resize-none"
                                                />

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {agencyNote.trim() && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => addNote(request.id)}
                                                            className="text-xs h-7"
                                                        >
                                                            <MessageSquare className="w-3 h-3 mr-1" />
                                                            Add Note
                                                        </Button>
                                                    )}

                                                    {request.status === 'pending' && (
                                                        <Button size="sm" onClick={() => updateStatus(request.id, 'in_progress')} className="text-xs h-7 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
                                                            <Play className="w-3 h-3 mr-1" /> Start
                                                        </Button>
                                                    )}
                                                    {request.status === 'in_progress' && (
                                                        <Button size="sm" onClick={() => updateStatus(request.id, 'ready_for_qa')} className="text-xs h-7 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30">
                                                            <Search className="w-3 h-3 mr-1" /> Send to Review
                                                        </Button>
                                                    )}
                                                    {request.status === 'ready_for_qa' && (
                                                        <Button size="sm" onClick={() => updateStatus(request.id, 'in_qa')} className="text-xs h-7 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30">
                                                            <Eye className="w-3 h-3 mr-1" /> Start Review
                                                        </Button>
                                                    )}
                                                    {request.status === 'in_qa' && (
                                                        <>
                                                            <Button size="sm" onClick={() => updateStatus(request.id, 'qa_passed')} className="text-xs h-7 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30">
                                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                                                            </Button>
                                                            <Button size="sm" onClick={() => updateStatus(request.id, 'qa_failed')} className="text-xs h-7 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30">
                                                                <AlertTriangle className="w-3 h-3 mr-1" /> Needs Fix
                                                            </Button>
                                                        </>
                                                    )}
                                                    {request.status === 'qa_failed' && (
                                                        <Button size="sm" onClick={() => updateStatus(request.id, 'in_progress')} className="text-xs h-7 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
                                                            <RotateCcw className="w-3 h-3 mr-1" /> Restart
                                                        </Button>
                                                    )}
                                                    {request.status === 'qa_passed' && (
                                                        <Button size="sm" onClick={() => updateStatus(request.id, 'delivered')} className="text-xs h-7 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30">
                                                            <Truck className="w-3 h-3 mr-1" /> Deliver
                                                        </Button>
                                                    )}

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                                                <MoreVertical className="w-3.5 h-3.5" />
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
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="outline" onClick={() => updateStatus(request.id, 'pending')} className="text-xs h-7">
                                                    <RotateCcw className="w-3 h-3 mr-1" /> Reopen
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => deleteRequest(request.id)} className="text-xs h-7 text-red-400 hover:text-red-300">
                                                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ClientRequestsTracker;
