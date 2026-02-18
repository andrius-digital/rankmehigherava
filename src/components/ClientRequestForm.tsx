import React, { useState } from 'react';
import {
    Send,
    Loader2,
    FileText,
    Palette,
    Code,
    Bug,
    Sparkles,
    HelpCircle,
    Clock,
    DollarSign,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface ClientRequestFormProps {
    clientId: string;
    freeHoursRemaining?: number;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

const requestTypes = [
    { value: 'content_update', label: 'Change text or images', icon: FileText, emoji: '📝' },
    { value: 'design_change', label: 'Change how it looks', icon: Palette, emoji: '🎨' },
    { value: 'new_feature', label: 'Add something new', icon: Sparkles, emoji: '✨' },
    { value: 'bug_fix', label: 'Something is broken', icon: Bug, emoji: '🐛' },
    { value: 'adjustment', label: 'Small tweak', icon: Code, emoji: '🔧' },
    { value: 'other', label: 'Something else', icon: HelpCircle, emoji: '💬' },
];

const priorityOptions = [
    { value: 'low', label: 'No rush', description: 'Whenever you get to it', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    { value: 'normal', label: 'Normal', description: 'Within a few days', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { value: 'high', label: 'Important', description: 'As soon as possible', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { value: 'urgent', label: 'Urgent', description: 'Needs immediate attention', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
];

const ClientRequestForm: React.FC<ClientRequestFormProps> = ({
    clientId,
    freeHoursRemaining = 1,
    onSuccess,
    trigger
}) => {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        request_type: '',
        priority: 'normal'
    });
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast({ title: 'Please add a title', variant: 'destructive' });
            return;
        }
        if (!formData.request_type) {
            toast({ title: 'Please pick a type', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await (supabase as any)
                .from('client_requests')
                .insert({
                    client_id: clientId,
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    request_type: formData.request_type,
                    priority: formData.priority,
                    status: 'pending'
                });

            if (error) throw error;

            toast({ title: 'Request sent!', description: "We'll get on it shortly." });

            queryClient.invalidateQueries({ queryKey: ['all-pending-requests'] });
            queryClient.invalidateQueries({ queryKey: ['all-pending-requests-client-portal'] });
            queryClient.invalidateQueries({ queryKey: ['pending-requests-count', clientId] });
            queryClient.invalidateQueries({ queryKey: ['client-requests', clientId] });
            queryClient.invalidateQueries({ queryKey: ['client-requests-count', clientId] });

            setFormData({ title: '', description: '', request_type: '', priority: 'normal' });
            setOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error submitting request:', error);
            toast({ title: 'Error', description: 'Something went wrong. Try again.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">
                        <Send className="w-4 h-4 mr-2" />
                        New Request
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md bg-gradient-to-br from-slate-950 to-slate-900 border-orange-500/30 p-0 overflow-hidden">
                <div className="p-5">
                    <DialogHeader className="mb-5">
                        <DialogTitle className="text-lg font-semibold text-white">
                            What do you need?
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Tell us what you'd like changed and we'll take care of it.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">What kind of change?</p>
                            <div className="grid grid-cols-2 gap-2">
                                {requestTypes.map((type) => {
                                    const isSelected = formData.request_type === type.value;
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, request_type: type.value })}
                                            className={cn(
                                                "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                                                isSelected
                                                    ? "bg-orange-500/15 border-orange-500/40 ring-1 ring-orange-500/20"
                                                    : "bg-white/3 border-white/8 hover:border-white/15"
                                            )}
                                        >
                                            <span className="text-lg">{type.emoji}</span>
                                            <span className={cn("text-xs font-medium", isSelected ? "text-orange-400" : "text-foreground")}>
                                                {type.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Title</p>
                            <Input
                                placeholder="e.g. Update the homepage banner"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-orange-500/50 h-10"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Details <span className="text-white/30 normal-case">(optional)</span></p>
                            <Textarea
                                placeholder="Tell us exactly what you want changed..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-orange-500/50 min-h-[80px] resize-none"
                            />
                        </div>

                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">How urgent?</p>
                            <div className="grid grid-cols-2 gap-2">
                                {priorityOptions.map((opt) => {
                                    const isSelected = formData.priority === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: opt.value })}
                                            className={cn(
                                                "p-2.5 rounded-xl border text-left transition-all",
                                                isSelected
                                                    ? `${opt.bg} ${opt.border} ring-1 ring-white/5`
                                                    : "bg-white/3 border-white/8 hover:border-white/15"
                                            )}
                                        >
                                            <p className={cn("text-xs font-semibold", isSelected ? opt.color : "text-foreground")}>{opt.label}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{opt.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-sm rounded-xl"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Request
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                <div className={cn(
                    "px-5 py-3 border-t flex items-center justify-between",
                    freeHoursRemaining > 0
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-amber-500/5 border-amber-500/20"
                )}>
                    <div className="flex items-center gap-2">
                        <Clock className={cn("w-3.5 h-3.5", freeHoursRemaining > 0 ? "text-emerald-400" : "text-amber-400")} />
                        <span className="text-xs text-muted-foreground">
                            {freeHoursRemaining > 0 ? (
                                <><span className="font-semibold text-emerald-400">{freeHoursRemaining}hr</span> free this month</>
                            ) : (
                                <>Free hour used</>
                            )}
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">$100/hr after</span>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ClientRequestForm;
