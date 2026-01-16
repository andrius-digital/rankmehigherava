import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Coffee,
  Calendar,
  TrendingUp,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useActiveSession, useClockIn, useClockOut, useTodaySessions } from '@/hooks/useTimeSessions';
import { useSessionBreaks, useActiveBreak, useStartBreak, useEndBreak } from '@/hooks/useTimeBreaks';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, differenceInSeconds } from 'date-fns';
import GridOverlay from '@/components/agency/GridOverlay';

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface TimeSession {
  id: string;
  clock_in: string;
  clock_out: string | null;
  total_work_seconds: number;
  total_break_seconds: number;
  status: string;
}

export default function AgentHoursTracker() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: members = [], isLoading: membersLoading } = useTeamMembers();
  
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [currentWorkTime, setCurrentWorkTime] = useState(0);
  const [currentBreakTime, setCurrentBreakTime] = useState(0);
  const [weekSessions, setWeekSessions] = useState<TimeSession[]>([]);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);
  
  const { data: activeSession } = useActiveSession(selectedMemberId);
  const { data: todaySessions = [] } = useTodaySessions(selectedMemberId);
  const { data: breaks = [] } = useSessionBreaks(activeSession?.id);
  const { data: activeBreak } = useActiveBreak(activeSession?.id);
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const startBreak = useStartBreak();
  const endBreak = useEndBreak();

  const isOnBreak = !!activeBreak;

  // Auto-select first member
  useEffect(() => {
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].id);
    }
  }, [members, selectedMemberId]);

  // Fetch week sessions
  useEffect(() => {
    if (!selectedMemberId) return;
    
    const fetchWeekSessions = async () => {
      setIsLoadingWeek(true);
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const { data, error } = await supabase
        .from('time_sessions')
        .select('*')
        .eq('team_member_id', selectedMemberId)
        .gte('clock_in', weekStart.toISOString())
        .lte('clock_in', weekEnd.toISOString())
        .order('clock_in', { ascending: false });
      
      if (!error && data) {
        setWeekSessions(data);
      }
      setIsLoadingWeek(false);
    };
    
    fetchWeekSessions();
  }, [selectedMemberId]);

  // Live timer
  useEffect(() => {
    if (!activeSession) {
      setCurrentWorkTime(0);
      setCurrentBreakTime(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const clockInTime = new Date(activeSession.clock_in);
      const totalElapsed = differenceInSeconds(now, clockInTime);
      
      let breakSeconds = activeSession.total_break_seconds || 0;
      if (activeBreak) {
        breakSeconds += differenceInSeconds(now, new Date(activeBreak.break_start));
      }
      
      setCurrentWorkTime(totalElapsed - breakSeconds);
      setCurrentBreakTime(breakSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, activeBreak]);

  const handleClockIn = () => {
    if (!selectedMemberId) return;
    clockIn.mutate(selectedMemberId);
  };

  const handleClockOut = () => {
    if (!activeSession) return;
    clockOut.mutate({
      sessionId: activeSession.id,
      totalWorkSeconds: currentWorkTime,
      totalBreakSeconds: currentBreakTime,
    });
  };

  const handleBreakToggle = () => {
    if (!activeSession) return;
    
    if (isOnBreak && activeBreak) {
      endBreak.mutate({ 
        breakId: activeBreak.id, 
        sessionId: activeSession.id,
        durationSeconds: differenceInSeconds(new Date(), new Date(activeBreak.break_start))
      });
    } else {
      startBreak.mutate(activeSession.id);
    }
  };

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const todayStats = useMemo(() => {
    const totalWork = todaySessions.reduce((sum, s) => sum + s.total_work_seconds, 0) + 
      (activeSession ? currentWorkTime : 0);
    const totalBreak = todaySessions.reduce((sum, s) => sum + s.total_break_seconds, 0) +
      (activeSession ? currentBreakTime : 0);
    return { totalWork, totalBreak, sessions: todaySessions.length + (activeSession ? 1 : 0) };
  }, [todaySessions, activeSession, currentWorkTime, currentBreakTime]);

  const weekStats = useMemo(() => {
    const totalWork = weekSessions.reduce((sum, s) => sum + s.total_work_seconds, 0) +
      (activeSession ? currentWorkTime : 0);
    const totalBreak = weekSessions.reduce((sum, s) => sum + s.total_break_seconds, 0) +
      (activeSession ? currentBreakTime : 0);
    return { totalWork, totalBreak, sessions: weekSessions.length };
  }, [weekSessions, activeSession, currentWorkTime, currentBreakTime]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Agent Hours Tracker | Track Your Time</title>
        <meta name="description" content="Track your work hours and breaks" />
      </Helmet>

      <GridOverlay />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Agent Hours Tracker</h1>
                <p className="text-muted-foreground">Track and manage your work hours</p>
              </div>
            </div>
          </div>

          {/* Member Selection */}
          <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-muted-foreground">Select Agent:</label>
                <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedMember && (
                  <Badge variant="outline" className="ml-2">
                    {selectedMember.account}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedMemberId && (
            <>
              {/* Timer Section */}
              <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/30">
                <CardContent className="pt-6">
                  <div className="text-center space-y-6">
                    {/* Main Timer Display */}
                    <div className="relative">
                      <div className={`text-7xl font-mono font-bold tracking-wider ${
                        activeSession 
                          ? isOnBreak 
                            ? 'text-amber-400' 
                            : 'text-emerald-400' 
                          : 'text-muted-foreground'
                      }`}>
                        {formatTime(activeSession ? currentWorkTime : 0)}
                      </div>
                      {activeSession && (
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <Badge variant={isOnBreak ? "secondary" : "default"} className="text-sm">
                            {isOnBreak ? (
                              <>
                                <Coffee className="w-3 h-3 mr-1" />
                                On Break: {formatTime(currentBreakTime)}
                              </>
                            ) : (
                              <>
                                <Timer className="w-3 h-3 mr-1" />
                                Working
                              </>
                            )}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-center gap-4">
                      {!activeSession ? (
                        <Button 
                          size="lg" 
                          onClick={handleClockIn}
                          disabled={clockIn.isPending}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Clock In
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={handleBreakToggle}
                            disabled={startBreak.isPending || endBreak.isPending}
                            className={isOnBreak ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10' : 'border-amber-500 text-amber-500 hover:bg-amber-500/10'}
                          >
                            {isOnBreak ? (
                              <>
                                <Play className="w-5 h-5 mr-2" />
                                Resume Work
                              </>
                            ) : (
                              <>
                                <Coffee className="w-5 h-5 mr-2" />
                                Take Break
                              </>
                            )}
                          </Button>
                          <Button
                            size="lg"
                            variant="destructive"
                            onClick={handleClockOut}
                            disabled={clockOut.isPending}
                          >
                            <Square className="w-5 h-5 mr-2" />
                            Clock Out
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Today's Work
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatTime(todayStats.totalWork)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Coffee className="w-4 h-4" />
                      Today's Breaks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-400">
                      {formatTime(todayStats.totalBreak)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {formatTime(weekStats.totalWork)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{weekStats.sessions}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Sessions Table */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/30">
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingWeek ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : weekSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No sessions this week</p>
                      <p className="text-sm">Clock in to start tracking your hours</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Clock In</TableHead>
                          <TableHead>Clock Out</TableHead>
                          <TableHead>Work Time</TableHead>
                          <TableHead>Break Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weekSessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              {format(new Date(session.clock_in), 'EEE, MMM d')}
                            </TableCell>
                            <TableCell>
                              {format(new Date(session.clock_in), 'h:mm a')}
                            </TableCell>
                            <TableCell>
                              {session.clock_out 
                                ? format(new Date(session.clock_out), 'h:mm a')
                                : '-'
                              }
                            </TableCell>
                            <TableCell className="text-emerald-400 font-medium">
                              {formatTime(session.total_work_seconds)}
                            </TableCell>
                            <TableCell className="text-amber-400">
                              {formatTime(session.total_break_seconds)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                                {session.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
