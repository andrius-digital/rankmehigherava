import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Phone, MapPin, DollarSign, TrendingUp, ArrowUpDown, CalendarDays, Target, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks, subDays, isWithinInterval, eachDayOfInterval, isWeekend } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import CampaignCountdown from "./CampaignCountdown";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

type SortField = 'booked_at' | 'client_name' | 'job_name';
type SortOrder = 'asc' | 'desc';
type TimeFilter = 'today' | 'this_week' | 'last_week' | 'custom';

const ClientDashboard = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this_week');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('booked_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*, agents(name), clients(name, daily_rate)')
        .order('booked_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: workDays = [] } = useQuery({
    queryKey: ['work_days'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_days')
        .select('*')
        .eq('worked', true);
      if (error) throw error;
      return data;
    },
  });

  const updateLeadStatus = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: "Lead status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    },
  });

  // Calculate date range based on filter
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

  // Get business days (Mon-Fri) in range
  const allDaysInRange = eachDayOfInterval({ start: filterStart, end: filterEnd });
  const businessDaysInRange = allDaysInRange.filter(day => !isWeekend(day));

  // Count worked days based on work_days table
  const getWorkedDaysCount = () => {
    if (selectedClient === 'all') {
      // For all clients, count unique worked dates across all
      const workedDates = new Set<string>();
      workDays.forEach((wd: any) => {
        const wdDate = new Date(wd.work_date);
        if (isWithinInterval(wdDate, { start: filterStart, end: filterEnd })) {
          workedDates.add(wd.work_date);
        }
      });
      return workedDates.size;
    }
    
    // For specific client
    return workDays.filter((wd: any) => {
      const wdDate = new Date(wd.work_date);
      return wd.client_id === selectedClient && 
             isWithinInterval(wdDate, { start: filterStart, end: filterEnd });
    }).length;
  };

  const workedDaysCount = getWorkedDaysCount();

  // Filter leads based on time selection and client
  let displayLeads = leads.filter((lead: any) => 
    isWithinInterval(new Date(lead.booked_at), { start: filterStart, end: filterEnd })
  );

  if (selectedClient !== 'all') {
    displayLeads = displayLeads.filter((lead: any) => lead.client_id === selectedClient);
  }

  // Sort leads
  displayLeads = [...displayLeads].sort((a: any, b: any) => {
    let comparison = 0;
    if (sortField === 'booked_at') {
      comparison = new Date(a.booked_at).getTime() - new Date(b.booked_at).getTime();
    } else if (sortField === 'client_name') {
      comparison = a.client_name.localeCompare(b.client_name);
    } else if (sortField === 'job_name') {
      comparison = a.job_name.localeCompare(b.job_name);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalBookings = displayLeads.length;
  const completedLeads = displayLeads.filter((l: any) => l.status === 'completed').length;
  const notConvertedLeads = displayLeads.filter((l: any) => l.status === 'not_converted').length;
  const pendingLeads = displayLeads.filter((l: any) => l.status === 'booked').length;
  const conversionRate = totalBookings > 0 ? (completedLeads / totalBookings) * 100 : 0;

  // Calculate cost metrics based on daily rate and WORKED days only
  const getDailyRate = () => {
    if (selectedClient === 'all') {
      return clients.reduce((sum: number, c: any) => sum + (c.daily_rate || 0), 0);
    }
    return clients.find((c: any) => c.id === selectedClient)?.daily_rate || 0;
  };

  const getCampaignBudget = () => {
    if (selectedClient === 'all') {
      return clients.reduce((sum: number, c: any) => sum + (c.campaign_budget || 0), 0);
    }
    return clients.find((c: any) => c.id === selectedClient)?.campaign_budget || 0;
  };

  const dailyRate = getDailyRate();
  const campaignBudget = getCampaignBudget();
  const totalSpent = dailyRate * workedDaysCount;
  const budgetRemaining = campaignBudget - totalSpent;
  const avgLeadCost = totalBookings > 0 ? totalSpent / totalBookings : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Converted</Badge>;
      case 'not_converted':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />Not Converted</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

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

  // Get selected client data for countdown
  const selectedClientData = selectedClient !== 'all' 
    ? clients.find((c: any) => c.id === selectedClient) 
    : null;

  // Chart data - last 14 days for selected client or all
  const chartData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });

    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const count = leads.filter((lead: any) => {
        const leadDate = format(startOfDay(new Date(lead.booked_at)), "yyyy-MM-dd");
        const matchesClient = selectedClient === 'all' || lead.client_id === selectedClient;
        return matchesClient && leadDate === dayStr;
      }).length;

      return {
        date: format(day, "MMM d"),
        leads: count,
      };
    });
  }, [leads, selectedClient]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
        
        <div className="flex items-center gap-4">
          {selectedClientData?.campaign_start_date && selectedClientData?.campaign_length && (
            <CampaignCountdown 
              campaignStartDate={selectedClientData.campaign_start_date} 
              campaignLength={selectedClientData.campaign_length}
            />
          )}
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client: any) => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Campaign Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${campaignBudget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Current Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{workedDaysCount} days worked</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${budgetRemaining < 0 ? 'text-destructive' : 'text-amber-600'}`}>
              ${budgetRemaining.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Booked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">{getTimeFilterLabel()}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Cost/Lead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">${avgLeadCost.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{pendingLeads}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold text-green-600">{completedLeads}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Not Converted</p>
                <p className="text-2xl font-bold text-red-600">{notConvertedLeads}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-primary">{conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Trend Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Leads Trend (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
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
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bookings ({getTimeFilterLabel()})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('client_name')} className="h-auto p-0 font-medium">
                    Customer <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('job_name')} className="h-auto p-0 font-medium">
                    Job <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </Button>
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={() => toggleSort('booked_at')} className="h-auto p-0 font-medium">
                    Booked <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No bookings for {getTimeFilterLabel().toLowerCase()}
                  </TableCell>
                </TableRow>
              ) : (
                displayLeads.map((lead: any) => {
                  const bookedDate = new Date(lead.booked_at);
                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.client_name}</div>
                          {lead.client_address && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {lead.client_address}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{lead.job_name}</TableCell>
                      <TableCell>
                        {lead.client_phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {lead.client_phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{format(bookedDate, 'EEEE')}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(bookedDate, 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {lead.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => updateLeadStatus.mutate({ leadId: lead.id, status: 'completed' })}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {lead.status !== 'not_converted' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => updateLeadStatus.mutate({ leadId: lead.id, status: 'not_converted' })}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {lead.status !== 'booked' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              onClick={() => updateLeadStatus.mutate({ leadId: lead.id, status: 'booked' })}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
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

export default ClientDashboard;