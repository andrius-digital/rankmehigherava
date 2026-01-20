import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Building2, TrendingUp, UserPlus, CalendarDays, Phone, MapPin, Calendar } from "lucide-react";
import CampaignCountdown from "./CampaignCountdown";
import ClientOnboarding from "./ClientOnboarding";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, eachDayOfInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface Client {
  id: string;
  name: string;
  daily_rate: number;
  campaign_length: number;
  campaign_start_date: string;
  campaign_budget: number;
}

interface Lead {
  id: string;
  client_id: string | null;
  job_name: string;
  client_name: string;
  client_phone: string | null;
  client_address: string | null;
  status: string;
  booked_at: string;
}

type TimeFilter = 'today' | 'this_week' | 'last_week' | 'custom';

interface WorkDay {
  id: string;
  client_id: string;
  work_date: string;
  worked: boolean;
}

interface ClientStats {
  client_id: string;
  client_name: string;
  daily_rate: number;
  total_leads: number;
  days_worked: number;
  total_spent: number;
  cost_per_lead: number;
  campaign_length: number;
  campaign_start_date: string;
  campaign_budget: number;
  budget_remaining: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(199, 89%, 48%)",
  "hsl(0, 84%, 60%)",
];

const KPIDashboard = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this_week');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedClient, setSelectedClient] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [clientsRes, leadsRes, workDaysRes] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("leads").select("*, agents(name)").order("booked_at", { ascending: false }),
      supabase.from("work_days").select("*").eq("worked", true),
    ]);

    if (clientsRes.data) setClients(clientsRes.data);
    if (leadsRes.data) setLeads(leadsRes.data);
    if (workDaysRes.data) setWorkDays(workDaysRes.data);

    setLoading(false);
  };

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
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      default:
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    }
  };

  const { start: filterStart, end: filterEnd } = getDateRange();

  const filteredLeads = useMemo(() => {
    let filtered = leads.filter((lead) =>
      isWithinInterval(new Date(lead.booked_at), { start: filterStart, end: filterEnd })
    );
    if (selectedClient !== 'all') {
      filtered = filtered.filter((lead) => lead.client_id === selectedClient);
    }
    return filtered;
  }, [leads, filterStart, filterEnd, selectedClient]);

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

  // Calculate stats per client
  const clientStats: ClientStats[] = clients.map((client) => {
    const clientLeads = leads.filter((l) => l.client_id === client.id);
    const clientWorkDays = workDays.filter((w) => w.client_id === client.id);
    const daysWorked = clientWorkDays.length;
    const totalSpent = daysWorked * client.daily_rate;
    const costPerLead = clientLeads.length > 0 ? totalSpent / clientLeads.length : 0;
    const budgetRemaining = client.campaign_budget - totalSpent;

    return {
      client_id: client.id,
      client_name: client.name,
      daily_rate: client.daily_rate,
      total_leads: clientLeads.length,
      days_worked: daysWorked,
      total_spent: totalSpent,
      cost_per_lead: costPerLead,
      campaign_length: client.campaign_length,
      campaign_start_date: client.campaign_start_date,
      campaign_budget: client.campaign_budget,
      budget_remaining: budgetRemaining,
    };
  });

  // Chart data - last 14 days
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dataPoint: Record<string, string | number> = {
        date: format(day, "MMM d"),
      };

      clients.forEach((client) => {
        const count = leads.filter((lead) => {
          const leadDate = format(startOfDay(new Date(lead.booked_at)), "yyyy-MM-dd");
          return lead.client_id === client.id && leadDate === dayStr;
        }).length;
        dataPoint[client.name] = count;
      });

      return dataPoint;
    });
  }, [clients, leads]);

  // Totals
  const totalLeads = clientStats.reduce((sum, c) => sum + c.total_leads, 0);
  const totalSpent = clientStats.reduce((sum, c) => sum + c.total_spent, 0);
  const totalBudget = clientStats.reduce((sum, c) => sum + c.campaign_budget, 0);
  const totalBudgetRemaining = totalBudget - totalSpent;
  const avgCostPerLead = totalLeads > 0 ? totalSpent / totalLeads : 0;

  return (
    <div className="space-y-4">
      {/* Header with Onboard Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Overview</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 transition-all">
              <UserPlus className="h-4 w-4" />
              Onboard New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <ClientOnboarding />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary row - AVA Style */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/30 transition-colors">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-2xl font-bold text-foreground">${totalBudget.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/30 transition-colors">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Current Spend</p>
            <p className="text-2xl font-bold text-emerald-400">${totalSpent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/30 transition-colors">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Budget Remaining</p>
            <p className={`text-2xl font-bold ${totalBudgetRemaining < 0 ? 'text-red-400' : 'text-amber-400'}`}>
              ${totalBudgetRemaining.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/30 transition-colors">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Leads</p>
            <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
          </CardContent>
        </Card>
        <Card className="bg-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/30 transition-colors">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Avg Cost/Lead</p>
            <p className="text-2xl font-bold text-cyan-400">${avgCostPerLead.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Chart */}
      {clients.length > 0 && (
        <Card className="bg-cyan-500/5 border-cyan-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-cyan-400">
              <TrendingUp className="h-5 w-5" />
              Leads Over Time (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    allowDecimals={false}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Legend />
                  {clients.map((client, index) => (
                    <Line
                      key={client.id}
                      type="monotone"
                      dataKey={client.name}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients table */}
      <Card className="bg-cyan-500/5 border-cyan-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-cyan-400">
            <Building2 className="h-5 w-5" />
            All Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="text-center">Days Left</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">Cost/Lead</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : clientStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : (
                clientStats.map((stat) => (
                  <TableRow key={stat.client_id}>
                    <TableCell className="font-medium">{stat.client_name}</TableCell>
                    <TableCell className="text-center">
                      <CampaignCountdown 
                        campaignStartDate={stat.campaign_start_date} 
                        campaignLength={stat.campaign_length}
                        compact
                      />
                    </TableCell>
                    <TableCell className="text-right">${stat.campaign_budget.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">${stat.total_spent.toLocaleString()}</TableCell>
                    <TableCell className={`text-right ${stat.budget_remaining < 0 ? 'text-destructive' : 'text-amber-600'}`}>
                      ${stat.budget_remaining.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{stat.total_leads}</TableCell>
                    <TableCell className="text-right text-blue-600">
                      {stat.total_leads > 0 ? `$${stat.cost_per_lead.toFixed(2)}` : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Leads Table with Date Filter */}
      <Card className="bg-cyan-500/5 border-cyan-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-cyan-400">
            <Calendar className="h-5 w-5" />
            Leads ({getTimeFilterLabel()})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setTimeFilter('today')}
                className={timeFilter === 'today' 
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-300' 
                  : 'hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30'}
              >
                Today
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setTimeFilter('this_week')}
                className={timeFilter === 'this_week' 
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-300' 
                  : 'hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30'}
              >
                This Week
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setTimeFilter('last_week')}
                className={timeFilter === 'last_week' 
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-300' 
                  : 'hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30'}
              >
                Last Week
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline"
                    size="sm"
                    className={`gap-2 ${timeFilter === 'custom' 
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-300' 
                      : 'hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30'}`}
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
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leads Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Client</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No leads for {getTimeFilterLabel().toLowerCase()}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead: any) => {
                  const bookedDate = new Date(lead.booked_at);
                  const clientName = clients.find(c => c.id === lead.client_id)?.name || '-';
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{format(bookedDate, 'EEEE')}</TableCell>
                      <TableCell>{format(bookedDate, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.client_name}</div>
                          {lead.client_address && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {lead.client_address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{lead.job_name}</TableCell>
                      <TableCell>
                        {lead.client_phone ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {lead.client_phone}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{lead.agents?.name || '-'}</TableCell>
                      <TableCell>{clientName}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPIDashboard;
