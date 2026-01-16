import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Coffee, ChevronDown, Monitor, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useTimeSessions } from '@/hooks/useTimeSessions';
import { useWeeklyStats, useDailyStats } from '@/hooks/useTimeStats';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfWeek, addDays } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface Screenshot {
  id: string;
  screenshot_url: string;
  captured_at: string;
  session_id: string;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const formatTimeShort = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const MemberHoursDetail = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [screenshotsLoading, setScreenshotsLoading] = useState(false);

  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers();
  const { data: sessions, isLoading: sessionsLoading } = useTimeSessions(memberId);
  const { data: weeklyStats, isLoading: weeklyLoading } = useWeeklyStats(memberId || '');
  const { data: todayStats } = useDailyStats(memberId || '');

  const member = teamMembers?.find(m => m.id === memberId);

  // Fetch screenshots for this member
  useEffect(() => {
    if (!memberId) return;

    const fetchScreenshots = async () => {
      setScreenshotsLoading(true);
      const { data, error } = await supabase
        .from('activity_screenshots')
        .select('id, screenshot_url, captured_at, session_id')
        .eq('team_member_id', memberId)
        .order('captured_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setScreenshots(data);
      }
      setScreenshotsLoading(false);
    };

    fetchScreenshots();
  }, [memberId]);

  // Group sessions by day
  const sessionsByDay = useMemo(() => {
    if (!sessions) return new Map();
    
    const grouped = new Map<string, typeof sessions>();
    sessions.forEach((session) => {
      const day = format(new Date(session.clock_in), 'yyyy-MM-dd');
      const existing = grouped.get(day) || [];
      grouped.set(day, [...existing, session]);
    });
    
    return grouped;
  }, [sessions]);

  // Group screenshots by session
  const screenshotsBySession = useMemo(() => {
    const grouped = new Map<string, Screenshot[]>();
    screenshots.forEach((screenshot) => {
      const existing = grouped.get(screenshot.session_id) || [];
      grouped.set(screenshot.session_id, [...existing, screenshot]);
    });
    return grouped;
  }, [screenshots]);

  // Get week days
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      return {
        date,
        dayName: format(date, 'EEE'),
        dateStr: format(date, 'yyyy-MM-dd'),
        displayDate: format(date, 'MMM d'),
      };
    });
  }, []);

  const toggleDay = (dateStr: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr);
    } else {
      newExpanded.add(dateStr);
    }
    setExpandedDays(newExpanded);
  };

  const totalWeekSeconds = weeklyStats?.reduce((acc, d) => acc + d.totalWorkSeconds, 0) || 0;
  const totalBreakSeconds = weeklyStats?.reduce((acc, d) => acc + d.totalBreakSeconds, 0) || 0;

  if (membersLoading || !member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 bg-slate-700 mb-4" />
          <Skeleton className="h-64 w-full bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/hours-tracked')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-700 rounded-full flex items-center justify-center text-white font-medium text-lg">
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{member.name}</h1>
              <p className="text-slate-400">{member.account}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Today</p>
                  <p className="text-xl font-bold text-white">{formatTime(todayStats?.totalWorkSeconds || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">This Week</p>
                  {weeklyLoading ? (
                    <Skeleton className="h-6 w-16 bg-slate-700" />
                  ) : (
                    <p className="text-xl font-bold text-white">{formatTime(totalWeekSeconds)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Coffee className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Break Time</p>
                  {weeklyLoading ? (
                    <Skeleton className="h-6 w-16 bg-slate-700" />
                  ) : (
                    <p className="text-xl font-bold text-white">{formatTime(totalBreakSeconds)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Monitor className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Screenshots</p>
                  {screenshotsLoading ? (
                    <Skeleton className="h-6 w-16 bg-slate-700" />
                  ) : (
                    <p className="text-xl font-bold text-white">{screenshots.length}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Breakdown */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">Weekly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const dayStat = weeklyStats?.find(s => s.date === day.dateStr);
                const hours = (dayStat?.totalWorkSeconds || 0) / 3600;
                const maxHours = 10;
                const heightPercent = Math.min((hours / maxHours) * 100, 100);
                const isToday = day.dateStr === format(new Date(), 'yyyy-MM-dd');

                return (
                  <div key={day.dateStr} className="text-center">
                    <div className="h-24 bg-slate-700/30 rounded-lg relative overflow-hidden mb-2">
                      <div
                        className={`absolute bottom-0 left-0 right-0 ${isToday ? 'bg-blue-500' : 'bg-emerald-500'} transition-all duration-300`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <p className={`text-xs font-medium ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>{day.dayName}</p>
                    <p className="text-xs text-slate-500">{day.displayDate}</p>
                    <p className="text-sm font-mono text-white mt-1">{formatTime(dayStat?.totalWorkSeconds || 0)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Sessions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Session History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {sessionsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-slate-700" />
                ))}
              </div>
            ) : sessionsByDay.size > 0 ? (
              <div className="divide-y divide-slate-700">
                {Array.from(sessionsByDay.entries())
                  .sort((a, b) => b[0].localeCompare(a[0]))
                  .slice(0, 14)
                  .map(([dateStr, daySessions]) => {
                    const totalSeconds = daySessions.reduce((acc, s) => acc + (s.total_work_seconds || 0), 0);
                    const totalBreaks = daySessions.reduce((acc, s) => acc + (s.total_break_seconds || 0), 0);
                    const isExpanded = expandedDays.has(dateStr);

                    return (
                      <Collapsible key={dateStr} open={isExpanded} onOpenChange={() => toggleDay(dateStr)}>
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              <div>
                                <p className="font-medium text-white text-left">{format(new Date(dateStr), 'EEEE, MMM d')}</p>
                                <p className="text-sm text-slate-400">{daySessions.length} session{daySessions.length > 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-lg text-white">{formatTime(totalSeconds)}</p>
                              {totalBreaks > 0 && (
                                <p className="text-xs text-yellow-400">{formatTime(totalBreaks)} break</p>
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-3">
                            {daySessions.map((session) => {
                              const sessionScreenshots = screenshotsBySession.get(session.id) || [];
                              
                              return (
                                <div key={session.id} className="bg-slate-700/30 rounded-lg p-3 ml-7">
                                  <div className="flex justify-between items-center mb-2">
                                    <div>
                                      <p className="text-sm text-white">
                                        {format(new Date(session.clock_in), 'HH:mm')}
                                        {session.clock_out && ` - ${format(new Date(session.clock_out), 'HH:mm')}`}
                                      </p>
                                      <span className={`text-xs px-2 py-0.5 rounded ${session.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                                        {session.status}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-mono text-sm text-white">{formatTimeShort(session.total_work_seconds)}</p>
                                      {session.total_break_seconds > 0 && (
                                        <p className="text-xs text-yellow-400">{formatTimeShort(session.total_break_seconds)} break</p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Screenshots for this session */}
                                  {sessionScreenshots.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-600">
                                      <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                                        <Monitor className="h-3 w-3" />
                                        {sessionScreenshots.length} screenshot{sessionScreenshots.length > 1 ? 's' : ''}
                                      </p>
                                      <div className="flex gap-2 overflow-x-auto pb-2">
                                        {sessionScreenshots.map((screenshot) => (
                                          <button
                                            key={screenshot.id}
                                            onClick={() => setSelectedScreenshot(screenshot)}
                                            className="relative flex-shrink-0 group"
                                          >
                                            <img
                                              src={screenshot.screenshot_url}
                                              alt="Activity screenshot"
                                              className="h-16 w-28 object-cover rounded border border-slate-600 hover:border-blue-500 transition-colors"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                              <span className="text-xs text-white">{format(new Date(screenshot.captured_at), 'HH:mm')}</span>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                No sessions recorded yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Screenshot Modal */}
      <Dialog open={!!selectedScreenshot} onOpenChange={() => setSelectedScreenshot(null)}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 p-0">
          {selectedScreenshot && (
            <div className="relative">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedScreenshot(null)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <img
                src={selectedScreenshot.screenshot_url}
                alt="Activity screenshot"
                className="w-full h-auto rounded-lg"
              />
              <div className="p-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">
                  Captured at {format(new Date(selectedScreenshot.captured_at), 'EEEE, MMM d, yyyy HH:mm:ss')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberHoursDetail;
