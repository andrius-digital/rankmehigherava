import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Phone, MapPin, FileText, Building2, User, Clock, DollarSign, TrendingUp, Target, CalendarDays } from "lucide-react";
import { format, differenceInDays, addDays, startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface AgentViewDashboardProps {
  agentId: string;
}

interface Agent {
  id: string;
  name: string;
  client_id: string | null;
}

interface Client {
  id: string;
  name: string;
  campaign_length: number;
  campaign_start_date: string;
  daily_rate: number;
  campaign_budget: number;
}

interface Lead {
  id: string;
  job_name: string;
  client_name: string;
  client_phone: string | null;
  client_address: string | null;
  notes: string | null;
  booked_at: string;
}

interface WorkDay {
  id: string;
  client_id: string;
  work_date: string;
  worked: boolean;
}

type TimeFilter = 'today' | 'this_week' | 'last_week' | 'custom';

export default function AgentViewDashboard({ agentId }: AgentViewDashboardProps) {
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formData, setFormData] = useState({
    job_name: "",
    client_name: "",
    client_phone: "",
    client_address: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!agentId) return;
      setLoading(true);

      const { data: agentData, error: agentError } = await supabase
        .from("agents")
        .select("id, name, client_id")
        .eq("id", agentId)
        .maybeSingle();

      if (agentError || !agentData) {
        setLoading(false);
        return;
      }
      setAgent(agentData);

      if (agentData.client_id) {
        const { data: clientData } = await supabase
          .from("clients")
          .select("id, name, campaign_length, campaign_start_date, daily_rate, campaign_budget")
          .eq("id", agentData.client_id)
          .maybeSingle();

        if (clientData) setClient(clientData);

        const { data: workDaysData } = await supabase
          .from("work_days")
          .select("*")
          .eq("client_id", agentData.client_id)
          .eq("worked", true);

        if (workDaysData) setWorkDays(workDaysData);
      }

      const { data: leadsData } = await supabase
        .from("leads")
        .select("id, job_name, client_name, client_phone, client_address, notes, booked_at")
        .eq("agent_id", agentId)
        .order("booked_at", { ascending: false });

      if (leadsData) setLeads(leadsData);
      setLoading(false);
    };

    fetchData();
  }, [agentId]);

  // Date filtering
  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'this_week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'last_week':
        const lastWeek = subWeeks(now, 1);
        return { start: startOfWeek(lastWeek, { weekStartsOn: 1 }), end: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
      case 'custom':
        if (dateRange?.from && dateRange?.to) {
          return { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) };
        }
        return { start: startOfDay(now), end: endOfDay(now) };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  };

  const { start: filterStart, end: filterEnd } = getDateRange();

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) =>
      isWithinInterval(new Date(lead.booked_at), { start: filterStart, end: filterEnd })
    );
  }, [leads, filterStart, filterEnd]);

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return "Today";
      case 'this_week': return "This Week";
      case 'last_week': return "Last Week";
      case 'custom':
        if (dateRange?.from && dateRange?.to) {
          return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`;
        }
        return "Custom Range";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_name || !formData.client_name) {
      toast({ title: "Error", description: "Job name and customer name are required", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from("leads")
      .insert({
        agent_id: agentId,
        client_id: client?.id || null,
        job_name: formData.job_name,
        client_name: formData.client_name,
        client_phone: formData.client_phone || null,
        client_address: formData.client_address || null,
        notes: formData.notes || null,
        status: "booked",
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setLeads([data, ...leads]);
    setFormData({ job_name: "", client_name: "", client_phone: "", client_address: "", notes: "" });
    toast({ title: "Success", description: "Lead booked successfully!" });
  };

  const getDaysRemaining = () => {
    if (!client) return null;
    const endDate = addDays(new Date(client.campaign_start_date), client.campaign_length);
    const remaining = differenceInDays(endDate, new Date());
    return remaining;
  };

  const daysRemaining = getDaysRemaining();
  const daysWorked = workDays.length;
  const currentSpend = client ? daysWorked * client.daily_rate : 0;
  const campaignBudget = client?.campaign_budget || 0;
  const budgetRemaining = campaignBudget - currentSpend;
  const totalLeads = leads.length;
  const avgCostPerLead = totalLeads > 0 ? currentSpend / totalLeads : 0;
  const leadsToday = leads.filter(l => 
    isWithinInterval(new Date(l.booked_at), { start: startOfDay(new Date()), end: endOfDay(new Date()) })
  ).length;

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!agent) {
    return <div className="text-center py-8 text-destructive">Agent not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            {agent.name}
          </h2>
          {client && (
            <p className="text-muted-foreground flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {client.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Calendar className="h-4 w-4 mr-2" />
            {leadsToday} booked today
          </Badge>
          {daysRemaining !== null && (
            <Badge 
              variant={daysRemaining <= 5 ? "destructive" : "secondary"} 
              className="text-lg px-4 py-2 flex items-center gap-2"
            >
              <Clock className="h-5 w-5" />
              {daysRemaining > 0 ? `${daysRemaining} days left` : "Campaign ended"}
            </Badge>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      {client && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-sm">Campaign Budget</span>
              </div>
              <p className="text-2xl font-bold">${campaignBudget.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Current Spend</span>
              </div>
              <p className="text-2xl font-bold text-green-600">${currentSpend.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Budget Remaining</span>
              </div>
              <p className={`text-2xl font-bold ${budgetRemaining < 0 ? 'text-destructive' : 'text-amber-600'}`}>
                ${budgetRemaining.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Total Leads</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{totalLeads}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Avg Cost/Lead</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">${avgCostPerLead.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Book Lead Form */}
      <Card>
        <CardHeader>
          <CardTitle>Book New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_name">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Job Name *
                </Label>
                <Input
                  id="job_name"
                  value={formData.job_name}
                  onChange={(e) => setFormData({ ...formData, job_name: e.target.value })}
                  placeholder="e.g. Window Replacement"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_name">
                  <User className="inline h-4 w-4 mr-1" />
                  Customer Name *
                </Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="Customer's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Customer Phone
                </Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_address">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Customer Address
                </Label>
                <Input
                  id="client_address"
                  value={formData.client_address}
                  onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Booking..." : "Book Lead"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Date Filter */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={timeFilter === 'today' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setTimeFilter('today')}
        >
          Today
        </Button>
        <Button 
          variant={timeFilter === 'this_week' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setTimeFilter('this_week')}
        >
          This Week
        </Button>
        <Button 
          variant={timeFilter === 'last_week' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setTimeFilter('last_week')}
        >
          Last Week
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant={timeFilter === 'custom' ? 'default' : 'outline'} 
              size="sm"
              className="gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              {timeFilter === 'custom' && dateRange?.from && dateRange?.to 
                ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                : 'Custom Range'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range);
                if (range?.from && range?.to) {
                  setTimeFilter('custom');
                }
              }}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leads ({getTimeFilterLabel()}) - {filteredLeads.length} total
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No leads for {getTimeFilterLabel().toLowerCase()}.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{format(new Date(lead.booked_at), "EEEE")}</TableCell>
                    <TableCell>{format(new Date(lead.booked_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium">{lead.job_name}</TableCell>
                    <TableCell>{lead.client_name}</TableCell>
                    <TableCell>{lead.client_phone || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
