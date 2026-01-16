import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useDateRangeStats } from '@/hooks/useDateRangeStats';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfDay,
  endOfDay,
  addWeeks, 
  subWeeks, 
  addMonths, 
  subMonths,
  addDays,
  subDays,
  format,
  isSameDay,
  isBefore,
  isAfter
} from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

type ViewMode = 'day' | 'week' | 'month' | 'custom';

const formatTime = (seconds: number): string => {
  if (seconds === 0) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

const HoursTracked = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Custom range state for range selection
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [anchorDate, setAnchorDate] = useState<Date | undefined>(undefined);

  // Calculate date range based on view mode
  const { startDate, endDate } = useMemo(() => {
    if (viewMode === 'custom' && customRange?.from) {
      return {
        startDate: startOfDay(customRange.from),
        endDate: endOfDay(customRange.to || customRange.from)
      };
    }
    
    switch (viewMode) {
      case 'day':
        return { 
          startDate: startOfDay(selectedDate), 
          endDate: endOfDay(selectedDate) 
        };
      case 'week':
        return { 
          startDate: startOfWeek(selectedDate, { weekStartsOn: 1 }), 
          endDate: endOfWeek(selectedDate, { weekStartsOn: 1 }) 
        };
      case 'month':
        return { 
          startDate: startOfMonth(selectedDate), 
          endDate: endOfMonth(selectedDate) 
        };
      default:
        return { 
          startDate: startOfWeek(selectedDate, { weekStartsOn: 1 }), 
          endDate: endOfWeek(selectedDate, { weekStartsOn: 1 }) 
        };
    }
  }, [viewMode, selectedDate, customRange]);

  const { data: membersStats, isLoading } = useDateRangeStats(startDate, endDate);

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(current => {
      switch (viewMode) {
        case 'day':
          return direction === 'prev' ? subDays(current, 1) : addDays(current, 1);
        case 'week':
          return direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1);
        case 'month':
          return direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1);
        default:
          return direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1);
      }
    });
  };

  const getDateRangeLabel = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, 'MMM d, yyyy');
      case 'week':
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      case 'custom':
        if (customRange?.from && customRange?.to && !isSameDay(customRange.from, customRange.to)) {
          return `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'd, yyyy')}`;
        } else if (customRange?.from) {
          return format(customRange.from, 'MMM d, yyyy');
        }
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
      default:
        return `${format(startDate, 'MMM d')} - ${format(endDate, 'd, yyyy')}`;
    }
  };

  const handleRangeSelect = (range: DateRange | undefined, selectedDay: Date) => {
    // If we already have a completed range (both from and to), reset to new single date
    if (customRange?.from && customRange?.to) {
      setAnchorDate(selectedDay);
      setCustomRange({ from: selectedDay, to: undefined });
      return;
    }
    
    if (!anchorDate) {
      // First click: set anchor date
      setAnchorDate(selectedDay);
      setCustomRange({ from: selectedDay, to: undefined });
      setViewMode('custom');
    } else if (isAfter(selectedDay, anchorDate)) {
      // Second click on future date: complete range from anchor to selected
      setCustomRange({ from: anchorDate, to: selectedDay });
      setAnchorDate(undefined);
      // Calendar stays open - user clicks away to close
    } else {
      // Clicked on same day or earlier date: reset to new anchor
      setAnchorDate(selectedDay);
      setCustomRange({ from: selectedDay, to: undefined });
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode !== 'custom') {
      setCustomRange(undefined);
      setAnchorDate(undefined);
    }
  };

  const toggleMemberExpansion = (memberId: string) => {
    setExpandedMemberId(current => current === memberId ? null : memberId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/team-tracker')}
              className="text-foreground hover:bg-secondary"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Hours Tracked</h1>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDate(new Date());
                setViewMode('week');
                setCustomRange(undefined);
                setAnchorDate(undefined);
              }}
              className="text-xs text-muted-foreground hover:text-foreground border border-border hover:border-primary/50"
            >
              Today
            </Button>
            
            {viewMode !== 'custom' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigateDate('prev')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-foreground font-medium min-w-[180px]"
                >
                  {getDateRangeLabel()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="range"
                  selected={customRange}
                  onSelect={(range, selectedDay) => handleRangeSelect(range, selectedDay)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  classNames={{
                    day_today: customRange?.from ? "" : "bg-accent/20 text-accent-foreground border border-primary/50",
                    day_range_start: "bg-primary text-primary-foreground rounded-l-full rounded-r-none hover:bg-primary/90 focus:bg-primary",
                    day_range_end: "bg-primary text-primary-foreground rounded-r-full rounded-l-none hover:bg-primary/90 focus:bg-primary",
                    day_range_middle: "bg-primary/20 text-foreground rounded-none hover:bg-primary/30",
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary",
                  }}
                />
              </PopoverContent>
            </Popover>

            {viewMode !== 'custom' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigateDate('next')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {/* View Mode Tabs */}
            <div className="flex items-center ml-4 border-l border-border pl-4">
              {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewModeChange(mode)}
                  className={cn(
                    "uppercase text-xs font-medium px-3",
                    viewMode === mode 
                      ? "text-primary border-b-2 border-primary rounded-none" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode}
                </Button>
              ))}
              {viewMode === 'custom' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="uppercase text-xs font-medium px-3 text-primary border-b-2 border-primary rounded-none"
                >
                  custom
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>View by: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</span>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Settings className="h-4 w-4 mr-2" />
              Display Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Time Type Legend */}
      <div className="border-b border-border bg-card/50 px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-sm text-muted-foreground">Computer Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-yellow-500" />
            <span className="text-sm text-muted-foreground">Manual Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span className="text-sm text-muted-foreground">Mobile Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gray-400" />
            <span className="text-sm text-muted-foreground">Break Time</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Users Table */}
        <div className={cn(
          "flex-1 transition-all duration-300",
          expandedMemberId ? "max-w-md" : "w-full"
        )}>
          {/* Table Header */}
          <div className="grid grid-cols-2 gap-4 px-6 py-3 border-b border-border bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground">Users</span>
            <span className="text-sm font-medium text-muted-foreground text-center">Time Tracked</span>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : membersStats && membersStats.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {membersStats.map((member) => (
                  <div
                    key={member.teamMemberId}
                    onClick={() => toggleMemberExpansion(member.teamMemberId)}
                    className={cn(
                      "grid grid-cols-2 gap-4 px-6 py-4 cursor-pointer transition-colors hover:bg-muted/50",
                      expandedMemberId === member.teamMemberId && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight 
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expandedMemberId === member.teamMemberId && "rotate-90"
                        )} 
                      />
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-medium text-blue-400 uppercase">
                          {member.memberName.charAt(0)}
                        </div>
                        {member.isActive && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">{member.memberName}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm text-foreground">{formatTime(member.totalSeconds)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Summary Row */}
              <div className="grid grid-cols-2 gap-4 px-6 py-4 border-t-2 border-primary/30 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4" />
                  <span className="text-sm font-semibold text-foreground">
                    Total ({membersStats.length} {membersStats.length === 1 ? 'member' : 'members'})
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {formatTime(membersStats.reduce((acc, m) => acc + m.totalSeconds, 0))}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No team members found
            </div>
          )}
        </div>

        {/* Expanded Member Panel */}
        {expandedMemberId && membersStats && (
          <MemberDetailPanel
            member={membersStats.find(m => m.teamMemberId === expandedMemberId)!}
            startDate={startDate}
            endDate={endDate}
            onClose={() => setExpandedMemberId(null)}
          />
        )}
      </div>
    </div>
  );
};

interface MemberDetailPanelProps {
  member: {
    teamMemberId: string;
    memberName: string;
    totalSeconds: number;
    dailyBreakdown: {
      date: Date;
      formattedDate: string;
      dayName: string;
      totalSeconds: number;
    }[];
  };
  startDate: Date;
  endDate: Date;
  onClose: () => void;
}

const MemberDetailPanel = ({ member, startDate, endDate, onClose }: MemberDetailPanelProps) => {
  return (
    <div className="flex-1 border-l border-border bg-card animate-fade-in">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-lg font-medium text-blue-400 uppercase">
            {member.memberName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{member.memberName}</h2>
            <p className="text-sm text-muted-foreground">{formatTime(member.totalSeconds)}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Time Table */}
      <div className="px-6">
        {/* Table Header */}
        <div className="grid grid-cols-2 gap-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-muted-foreground">Date</span>
          <span className="text-sm font-medium text-muted-foreground">Time Tracked</span>
        </div>

        {/* Week Summary Row */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-border bg-muted/20">
          <span className="text-sm font-semibold text-foreground">
            {format(startDate, 'MMM d')} - {format(endDate, 'd, yyyy')}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {formatTime(member.totalSeconds)}
          </span>
        </div>

        {/* Daily Breakdown */}
        <div className="divide-y divide-border">
          {member.dailyBreakdown.map((day, index) => (
            <div 
              key={index} 
              className="grid grid-cols-2 gap-4 py-4 hover:bg-muted/30 transition-colors"
            >
              <span className="text-sm text-foreground">
                {day.dayName}, {day.formattedDate}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">{formatTime(day.totalSeconds)}</span>
                {day.totalSeconds > 0 && (
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-32">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ 
                        width: `${Math.min((day.totalSeconds / 28800) * 100, 100)}%` 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HoursTracked;
