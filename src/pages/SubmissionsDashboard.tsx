import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileEdit, Home, CalendarDays, FileText, Clock, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { SubmissionsList } from "@/components/SubmissionsList";
import { SubmissionDetail } from "@/components/SubmissionDetail";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

type TimeFilter = 'today' | 'this_week' | 'last_week' | 'all' | 'custom';

interface Submission {
  id: string;
  company_name: string;
  business_email: string;
  created_at: string;
  form_data: any;
}

const SubmissionsDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const isMobile = useIsMobile();

  const { data: allSubmissions = [], isLoading } = useQuery({
    queryKey: ["website-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("website_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Submission[];
    },
  });

  // Calculate date range based on filter
  const getDateRange = (): { start: Date; end: Date } | null => {
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
        return null;
      case 'all':
      default:
        return null;
    }
  };

  const filterRange = getDateRange();

  // Filter submissions by date
  const submissions = useMemo(() => {
    if (!filterRange) return allSubmissions;
    return allSubmissions.filter((s) =>
      isWithinInterval(new Date(s.created_at), { start: filterRange.start, end: filterRange.end })
    );
  }, [allSubmissions, filterRange]);

  // Stats
  const stats = useMemo(() => {
    const total = allSubmissions.length;
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const thisWeek = allSubmissions.filter(s => 
      isWithinInterval(new Date(s.created_at), { start: weekStart, end: weekEnd })
    ).length;
    const lastSubmission = allSubmissions[0]?.created_at;
    return { total, thisWeek, lastSubmission };
  }, [allSubmissions]);

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const handleBack = () => {
    setSelectedSubmission(null);
  };

  // Date filter component
  const DateFilters = ({ className = "" }: { className?: string }) => (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button 
        variant={timeFilter === 'all' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setTimeFilter('all')}
      >
        All
      </Button>
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
              : 'Custom'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
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
  );

  // Stats cards component
  const StatsCards = ({ className = "" }: { className?: string }) => (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-foreground">{stats.thisWeek}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm md:text-base font-semibold text-foreground truncate">
                {stats.lastSubmission 
                  ? format(new Date(stats.lastSubmission), 'MMM d')
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Latest</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Mobile view - show detail or list
  if (isMobile) {
    return (
      <>
        <Helmet>
          <title>Submissions Dashboard</title>
        </Helmet>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <div className="border-b border-border p-4 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <Link to="/client-portal" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Portal</span>
              </Link>
              <h1 className="text-lg font-bold text-foreground">Submissions</h1>
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <Home className="w-5 h-5" />
              </Link>
            </div>
            <StatsCards />
            <DateFilters />
            <Link to="/website-submissions" className="w-full block">
              <Button variant="outline" size="sm" className="w-full">
                <FileEdit className="w-4 h-4 mr-2" />
                Open Website Onboarding Form
              </Button>
            </Link>
          </div>

          {selectedSubmission ? (
            <SubmissionDetail
              submission={selectedSubmission}
              onBack={handleBack}
              showBackButton
            />
          ) : (
            <SubmissionsList
              submissions={submissions}
              selectedId={null}
              onSelect={handleSelectSubmission}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isLoading={isLoading}
            />
          )}
        </div>
      </>
    );
  }

  // Desktop view - split layout
  return (
    <>
      <Helmet>
        <title>Submissions Dashboard</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 bg-card shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/client-portal" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Portal</span>
              </Link>
              <h1 className="text-xl font-bold text-foreground">Submissions Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/website-submissions">
                <Button variant="outline" size="sm">
                  <FileEdit className="w-4 h-4 mr-2" />
                  Website Form
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <DateFilters />
            <StatsCards className="w-auto grid-cols-3 gap-4" />
          </div>
        </div>

        {/* Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-80 shrink-0">
            <SubmissionsList
              submissions={submissions}
              selectedId={selectedSubmission?.id || null}
              onSelect={handleSelectSubmission}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isLoading={isLoading}
            />
          </div>

          {/* Right Panel */}
          <SubmissionDetail submission={selectedSubmission} />
        </div>
      </div>
    </>
  );
};

export default SubmissionsDashboard;
