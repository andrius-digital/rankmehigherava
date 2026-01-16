import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Monitor, Users, Clock, Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { format, formatDistanceToNow } from 'date-fns';

interface ActiveSession {
  id: string;
  team_member_id: string;
  clock_in: string;
  status: string;
}

interface Screenshot {
  id: string;
  screenshot_url: string;
  captured_at: string;
  session_id: string;
  team_member_id: string;
}

const ActivityMonitor = () => {
  const navigate = useNavigate();
  const { data: teamMembers } = useTeamMembers();
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [latestScreenshots, setLatestScreenshots] = useState<Record<string, Screenshot>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active sessions
  const fetchActiveSessions = async () => {
    const { data, error } = await supabase
      .from('time_sessions')
      .select('id, team_member_id, clock_in, status')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching active sessions:', error);
      return;
    }

    setActiveSessions(data || []);
  };

  // Fetch latest screenshot for each active session
  const fetchLatestScreenshots = async (sessions: ActiveSession[]) => {
    if (sessions.length === 0) {
      setLatestScreenshots({});
      return;
    }

    const sessionIds = sessions.map(s => s.id);
    
    // Get the latest screenshot for each session
    const { data, error } = await supabase
      .from('activity_screenshots')
      .select('*')
      .in('session_id', sessionIds)
      .order('captured_at', { ascending: false });

    if (error) {
      console.error('Error fetching screenshots:', error);
      return;
    }

    // Group by session_id and keep only the latest
    const latestBySession: Record<string, Screenshot> = {};
    data?.forEach(screenshot => {
      if (!latestBySession[screenshot.session_id]) {
        latestBySession[screenshot.session_id] = screenshot;
      }
    });

    setLatestScreenshots(latestBySession);
  };

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchActiveSessions();
      setIsLoading(false);
    };
    init();
  }, []);

  // Fetch screenshots when sessions change
  useEffect(() => {
    fetchLatestScreenshots(activeSessions);
  }, [activeSessions]);

  // Real-time subscription for new screenshots
  useEffect(() => {
    const channel = supabase
      .channel('activity-screenshots-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_screenshots'
        },
        (payload) => {
          const newScreenshot = payload.new as Screenshot;
          setLatestScreenshots(prev => ({
            ...prev,
            [newScreenshot.session_id]: newScreenshot
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Real-time subscription for session changes
  useEffect(() => {
    const channel = supabase
      .channel('time-sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_sessions'
        },
        () => {
          fetchActiveSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getMemberName = (memberId: string) => {
    return teamMembers?.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const getSessionDuration = (clockIn: string) => {
    return formatDistanceToNow(new Date(clockIn), { addSuffix: false });
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchActiveSessions();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/team-tracker')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Monitor className="h-6 w-6 text-blue-400" />
                Activity Monitor
              </h1>
              <p className="text-slate-400">Real-time screen capture monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-400 border-green-400/50 px-3 py-1">
              <Users className="h-4 w-4 mr-1" />
              {activeSessions.length} Active
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* No Active Sessions */}
        {activeSessions.length === 0 && !isLoading && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-16 text-center">
              <Monitor className="h-16 w-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No Active Sessions</h3>
              <p className="text-slate-500">No team members are currently clocked in with screen capture enabled.</p>
            </CardContent>
          </Card>
        )}

        {/* Active Sessions Grid */}
        {activeSessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeSessions.map(session => {
              const screenshot = latestScreenshots[session.id];
              const memberName = getMemberName(session.team_member_id);
              
              return (
                <Card 
                  key={session.id} 
                  className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-blue-500/50 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-white flex items-center gap-2">
                        <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                        {memberName}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                        <Clock className="h-3 w-3 mr-1" />
                        {getSessionDuration(session.clock_in)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Started: {format(new Date(session.clock_in), 'h:mm a')}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    {screenshot ? (
                      <div 
                        className="relative aspect-video bg-slate-900 cursor-pointer group"
                        onClick={() => setSelectedImage(screenshot.screenshot_url)}
                      >
                        <img
                          src={screenshot.screenshot_url}
                          alt={`${memberName}'s screen`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm font-medium">Click to enlarge</span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-slate-300 flex items-center gap-1">
                          <Camera className="h-3 w-3" />
                          {format(new Date(screenshot.captured_at), 'h:mm:ss a')}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-900 flex items-center justify-center">
                        <div className="text-center text-slate-500">
                          <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Waiting for screenshot...</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Full-size Image Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-6xl bg-slate-900 border-slate-700 p-0">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle className="text-white">Screen Capture</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="p-4">
                <img
                  src={selectedImage}
                  alt="Full screen capture"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ActivityMonitor;
