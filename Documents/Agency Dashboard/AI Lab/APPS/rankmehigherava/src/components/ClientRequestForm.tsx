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
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    { value: 'content_update', label: 'Content Update', icon: FileText, description: 'Text, images, or content changes' },
    { value: 'design_change', label: 'Design Change', icon: Palette, description: 'Visual or layout adjustments' },
    { value: 'new_feature', label: 'New Feature', icon: Sparkles, description: 'Add new functionality' },
    { value: 'bug_fix', label: 'Bug Fix', icon: Bug, description: 'Something not working correctly' },
    { value: 'adjustment', label: 'Small Adjustment', icon: Code, description: 'Minor tweaks or fixes' },
    { value: 'other', label: 'Other', icon: HelpCircle, description: 'Something else' },
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
        request_type: 'adjustment',
        priority: 'normal'
    });
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast({
                title: 'Title required',
                description: 'Please enter a title for your request',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
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

            toast({
                title: 'Request Submitted!',
                description: 'We\'ll review your request and get back to you soon.',
            });

            // Invalidate all relevant queries to update badges everywhere
            queryClient.invalidateQueries({ queryKey: ['all-pending-requests'] });
            queryClient.invalidateQueries({ queryKey: ['all-pending-requests-client-portal'] });
            queryClient.invalidateQueries({ queryKey: ['pending-requests-count', clientId] });
            queryClient.invalidateQueries({ queryKey: ['client-requests', clientId] });
            queryClient.invalidateQueries({ queryKey: ['client-requests-count', clientId] });

            setFormData({ title: '', description: '', request_type: 'adjustment', priority: 'normal' });
            setOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error submitting request:', error);
            toast({
                title: 'Error',
                description: 'Failed to submit request. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedType = requestTypes.find(t => t.value === formData.request_type);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">
                        <Send className="w-4 h-4 mr-2" />
                        Request Adjustment
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-gradient-to-br from-slate-950 to-slate-900 border-orange-500/30">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 font-orbitron text-lg">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                            <Send className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="text-orange-400">Request Adjustment</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Submit a request for changes to your website
                    </DialogDescription>
                </DialogHeader>

                {/* Free Hours Banner */}
                <div className={cn(
                    "p-3 rounded-lg border flex items-center justify-between",
                    freeHoursRemaining > 0
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-amber-500/10 border-amber-500/30"
                )}>
                    <div className="flex items-center gap-2">
                        <Clock className={cn("w-4 h-4", freeHoursRemaining > 0 ? "text-emerald-400" : "text-amber-400")} />
                        <span className="text-sm">
                            {freeHoursRemaining > 0 ? (
                                <><span className="font-bold">{freeHoursRemaining} hour</span> free this month</>
                            ) : (
                                <>Free hour used this month</>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <DollarSign className="w-3 h-3" />
                        <span>$100/hr after free hour</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {/* Request Type */}
                    <div className="space-y-2">
                        <Label className="text-xs font-orbitron uppercase tracking-wider text-muted-foreground">
                            Request Type
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            {requestTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = formData.request_type === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, request_type: type.value })}
                                        className={cn(
                                            "p-2 rounded-lg border text-left transition-all",
                                            isSelected
                                                ? "bg-orange-500/20 border-orange-500/50"
                                                : "bg-card/30 border-white/10 hover:border-orange-500/30"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4 mb-1", isSelected ? "text-orange-400" : "text-muted-foreground")} />
                                        <p className={cn("text-[10px] font-medium", isSelected ? "text-orange-400" : "text-foreground")}>
                                            {type.label}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label className="text-xs font-orbitron uppercase tracking-wider text-muted-foreground">
                            Title
                        </Label>
                        <Input
                            placeholder="Brief description of what you need..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-background/50 border-white/10 focus:border-orange-500/50"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-xs font-orbitron uppercase tracking-wider text-muted-foreground">
                            Details
                        </Label>
                        <Textarea
                            placeholder="Provide more details about your request. Include specific pages, sections, or examples if possible..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-background/50 border-white/10 focus:border-orange-500/50 min-h-[100px]"
                        />
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label className="text-xs font-orbitron uppercase tracking-wider text-muted-foreground">
                            Priority
                        </Label>
                        <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value })}
                        >
                            <SelectTrigger className="bg-background/50 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low - When you have time</SelectItem>
                                <SelectItem value="normal">Normal - Within a few days</SelectItem>
                                <SelectItem value="high">High - As soon as possible</SelectItem>
                                <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-orbitron"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Request
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ClientRequestForm;
