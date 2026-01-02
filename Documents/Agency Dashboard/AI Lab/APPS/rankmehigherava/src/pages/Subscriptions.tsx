import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    CreditCard,
    Calendar,
    Wallet,
    Plus,
    Pencil,
    Trash2,
    ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Subscription {
    id: string;
    name: string;
    amount: number;
    billing_cycle: 'Monthly' | 'Yearly';
    billing_date: string | null;
    email_login: string | null;
    description: string | null;
}

const Subscriptions = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        billing_cycle: "Monthly",
        billing_date: "",
        email_login: "",
        description: "",
    });

    const { data: subscriptions = [], isLoading } = useQuery({
        queryKey: ["subscriptions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("subscriptions")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Subscription[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (newSub: any) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { error } = await supabase
                .from("subscriptions")
                .insert({ ...newSub, user_id: user.id });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
            toast({ title: "Success", description: "Subscription added successfully" });
            setIsModalOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (sub: any) => {
            const { error } = await supabase
                .from("subscriptions")
                .update(sub)
                .eq("id", editingSubscription?.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
            toast({ title: "Success", description: "Subscription updated successfully" });
            setIsModalOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("subscriptions")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
            toast({ title: "Success", description: "Subscription deleted" });
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            amount: "",
            billing_cycle: "Monthly",
            billing_date: "",
            email_login: "",
            description: "",
        });
        setEditingSubscription(null);
    };

    const handleEdit = (sub: Subscription) => {
        setEditingSubscription(sub);
        setFormData({
            name: sub.name,
            amount: sub.amount.toString(),
            billing_cycle: sub.billing_cycle,
            billing_date: sub.billing_date ? sub.billing_date.split('T')[0] : "",
            email_login: sub.email_login || "",
            description: sub.description || "",
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            amount: parseFloat(formData.amount),
            billing_cycle: formData.billing_cycle,
            billing_date: formData.billing_date ? new Date(formData.billing_date).toISOString() : null,
            email_login: formData.email_login,
            description: formData.description,
        };

        if (editingSubscription) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    // Calculations
    const monthlyTotal = subscriptions
        .filter(s => s.billing_cycle === 'Monthly')
        .reduce((sum, s) => sum + Number(s.amount), 0);

    const yearlyTotal = subscriptions
        .filter(s => s.billing_cycle === 'Yearly')
        .reduce((sum, s) => sum + Number(s.amount), 0);

    const totalMonthlyCost = monthlyTotal + (yearlyTotal / 12);

    return (
        <div className="min-h-screen bg-background p-6 space-y-8">
            <Helmet>
                <title>Subscriptions | Operations</title>
            </Helmet>

            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/avaadminpanel">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-heading font-bold">Subscriptions</h1>
                    </div>
                    <p className="text-muted-foreground mt-1 ml-14">Track your SaaS and recurring costs</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 border-primary/20 backdrop-blur-sm">
                    <CardContent className="p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Calendar className="w-24 h-24 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Monthly Subscriptions</p>
                        <h3 className="text-3xl font-bold text-primary">
                            ${monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <Calendar className="absolute top-6 right-6 w-5 h-5 text-primary" />
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-purple-500/20 backdrop-blur-sm">
                    <CardContent className="p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CreditCard className="w-24 h-24 text-purple-500" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Yearly Subscriptions</p>
                        <h3 className="text-3xl font-bold text-purple-500">
                            ${yearlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <CreditCard className="absolute top-6 right-6 w-5 h-5 text-purple-500" />
                    </CardContent>
                </Card>

                <Card className="bg-card/50 border-green-500/20 backdrop-blur-sm">
                    <CardContent className="p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Wallet className="w-24 h-24 text-green-500" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Total Monthly Cost</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-green-500">
                                ${totalMonthlyCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                            <span className="text-muted-foreground">/mo</span>
                        </div>
                        <span className="text-green-500 absolute top-6 right-6">$</span>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary rounded-lg">
                            <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Subscriptions</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {subscriptions.length} active subscriptions
                            </p>
                        </div>
                    </div>

                    <Dialog open={isModalOpen} onOpenChange={(open) => {
                        setIsModalOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Subscription
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingSubscription ? "Edit Subscription" : "Add Subscription"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Service Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Netflix"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cycle">Billing Cycle</Label>
                                        <Select
                                            value={formData.billing_cycle}
                                            onValueChange={(v) => setFormData({ ...formData, billing_cycle: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Monthly">Monthly</SelectItem>
                                                <SelectItem value="Yearly">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="date">Next Billing Date</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formData.billing_date}
                                        onChange={(e) => setFormData({ ...formData, billing_date: e.target.value })}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email / Login</Label>
                                    <Input
                                        id="email"
                                        value={formData.email_login}
                                        onChange={(e) => setFormData({ ...formData, email_login: e.target.value })}
                                        placeholder="user@example.com"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Notes about this subscription"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="submit">
                                        {editingSubscription ? "Update Subscription" : "Add Subscription"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subscription</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Cycle</TableHead>
                                <TableHead>Billing Date</TableHead>
                                <TableHead>Email / Login</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : subscriptions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No subscriptions found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subscriptions.map((sub) => (
                                    <TableRow key={sub.id} className="group">
                                        <TableCell className="font-medium">{sub.name}</TableCell>
                                        <TableCell className={sub.amount > 100 ? "text-primary font-bold" : "text-blue-400 font-bold"}>
                                            ${Number(sub.amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-secondary/50 text-xs">
                                                {sub.billing_cycle}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {sub.billing_date ? format(new Date(sub.billing_date), "MMM d, yyyy") : "-"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {sub.email_login || "-"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {sub.description || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => handleEdit(sub)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this subscription?')) {
                                                            deleteMutation.mutate(sub.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default Subscriptions;
