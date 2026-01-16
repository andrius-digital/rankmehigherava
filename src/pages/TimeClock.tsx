import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Square, Coffee, Clock, Calendar, Monitor, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useActiveSession, useClockIn, useClockOut, useTodaySessions } from '@/hooks/useTimeSessions';
import { useActiveBreak, useStartBreak, useEndBreak, useSessionBreaks } from '@/hooks/useTimeBreaks';
import { useScreenCapture } from '@/hooks/useScreenCapture';
import { format } from 'date-fns';
import { toast } from 'sonner';

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimeClock = () => {
  const navigate = useNavigate();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [pendingClockIn, setPendingClockIn] = useState(false);
  const [screenCaptureReady, setScreenCaptureReady] = useState(false);

  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers();
  const { data: activeSession } = useActiveSession(selectedMemberId);
  const { data: activeBreak } = useActiveBreak(activeSession?.id);
  const { data: sessionBreaks } = useSessionBreaks(activeSession?.id);
  const { data: todaySessions } = useTodaySessions(selectedMemberId);

  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const startBreak = useStartBreak();
  const endBreak = useEndBreak();

  // Screen capture - pass pending session info for pre-clock-in setup
  const screenCapture = useScreenCapture(
    (activeSession || pendingClockIn) && selectedMemberId
      ? { sessionId: activeSession?.id || 'pending', teamMemberId: selectedMemberId }
      : null
  );

  // Track when screen capture is ready for clock-in
  useEffect(() => {
    if (screenCapture.isCapturing && pendingClockIn) {
      setScreenCaptureReady(true);
    }
  }, [screenCapture.isCapturing, pendingClockIn]);

  // Automatically clock in once screen capture is enabled
  useEffect(() => {
    if (screenCaptureReady && pendingClockIn && selectedMemberId) {
      clockIn.mutate(selectedMemberId);
      setPendingClockIn(false);
      setScreenCaptureReady(false);
    }
  }, [screenCaptureReady, pendingClockIn, selectedMemberId, clockIn]);

  // Calculate total break time from completed breaks
  const completedBreakSeconds = useMemo(() => {
    if (!sessionBreaks) return 0;
    return sessionBreaks
      .filter(b => b.break_end)
      .reduce((acc, b) => acc + b.duration_seconds, 0);
  }, [sessionBreaks]);

  // Timer effect
  useEffect(() => {
    if (!activeSession) {
      setCurrentTime(0);
      setBreakTime(0);
      return;
    }

    const interval = setInterval(() => {
      const clockInTime = new Date(activeSession.clock_in).getTime();
      const now = Date.now();
      const totalSeconds = Math.floor((now - clockInTime) / 1000);

      // Calculate current break time
      let currentBreakSeconds = completedBreakSeconds;
      if (activeBreak) {
        const breakStartTime = new Date(activeBreak.break_start).getTime();
        currentBreakSeconds += Math.floor((now - breakStartTime) / 1000);
      }

      setBreakTime(currentBreakSeconds);
      setCurrentTime(totalSeconds - currentBreakSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, activeBreak, completedBreakSeconds]);

  const handleClockIn = async () => {
    if (!selectedMemberId) return;
    
    // Set pending state and prompt for screen capture
    setPendingClockIn(true);
    const success = await screenCapture.startCapture();
    
    if (!success) {
      setPendingClockIn(false);
      toast.error('Screen capture is required to clock in. Please enable screen sharing to start working.');
    }
  };

  const handleClockOut = () => {
    if (activeSession) {
      // Stop screen capture first
      if (screenCapture.isCapturing) {
        screenCapture.stopCapture();
      }
      
      clockOut.mutate({
        sessionId: activeSession.id,
        totalWorkSeconds: currentTime,
        totalBreakSeconds: breakTime,
      });
    }
  };

  const handleBreakToggle = () => {
    if (!activeSession) return;

    if (activeBreak) {
      const breakStartTime = new Date(activeBreak.break_start).getTime();
      const durationSeconds = Math.floor((Date.now() - breakStartTime) / 1000);
      endBreak.mutate({
        breakId: activeBreak.id,
        sessionId: activeSession.id,
        durationSeconds,
      });
    } else {
      startBreak.mutate(activeSession.id);
    }
  };

  const todayTotalSeconds = useMemo(() => {
    if (!todaySessions) return 0;
    return todaySessions.reduce((acc, s) => acc + (s.total_work_seconds || 0), 0) + currentTime;
  }, [todaySessions, currentTime]);

  const selectedMember = teamMembers?.find(m => m.id === selectedMemberId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/team-tracker')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Time Clock</h1>
            <p className="text-slate-400">Track your work hours</p>
          </div>
        </div>

        {/* Member Selection */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">Select Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Choose your name..." />
              </SelectTrigger>
              <SelectContent>
                {teamMembers?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.account}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedMemberId && (
          <>
            {/* Timer Display */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  {/* Status indicator */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {activeSession ? (
                      activeBreak ? (
                        <span className="flex items-center gap-2 text-yellow-400">
                          <Coffee className="h-5 w-5" />
                          On Break
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-green-400">
                          <span className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
                          Working
                        </span>
                      )
                    ) : (
                      <span className="flex items-center gap-2 text-slate-400">
                        <Clock className="h-5 w-5" />
                        Not Clocked In
                      </span>
                    )}
                  </div>

                  {/* Main Timer */}
                  <div className="text-6xl font-mono font-bold text-white mb-2">
                    {formatTime(currentTime)}
                  </div>
                  <p className="text-slate-400 text-sm mb-2">Work Time</p>

                  {/* Break Time */}
                  {activeSession && (
                    <div className="text-2xl font-mono text-yellow-400 mb-4">
                      <Coffee className="h-4 w-4 inline mr-2" />
                      {formatTime(breakTime)} break
                    </div>
                  )}

                  {/* Screen Capture Status */}
                  {activeSession && screenCapture.isCapturing && (
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">
                        <Monitor className="h-4 w-4" />
                        <span>Screen capture active</span>
                        <span className="text-blue-300">• {screenCapture.screenshotCount} screenshots</span>
                      </div>
                    </div>
                  )}

                  {/* Pending Clock In - Waiting for screen share */}
                  {pendingClockIn && !activeSession && (
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-sm animate-pulse">
                        <Camera className="h-4 w-4" />
                        <span>Waiting for screen share permission...</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-4">
                    {!activeSession ? (
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
                        onClick={handleClockIn}
                        disabled={clockIn.isPending}
                      >
                        <Play className="h-6 w-6 mr-2" />
                        Clock In
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="lg"
                          variant={activeBreak ? 'default' : 'outline'}
                          className={activeBreak 
                            ? 'bg-green-600 hover:bg-green-700 text-white px-6 py-6' 
                            : 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 px-6 py-6'}
                          onClick={handleBreakToggle}
                          disabled={startBreak.isPending || endBreak.isPending}
                        >
                          <Coffee className="h-5 w-5 mr-2" />
                          {activeBreak ? 'End Break' : 'Take Break'}
                        </Button>
                        <Button
                          size="lg"
                          variant="destructive"
                          className="px-8 py-6 text-lg"
                          onClick={handleClockOut}
                          disabled={clockOut.isPending || !!activeBreak}
                        >
                          <Square className="h-6 w-6 mr-2" />
                          Clock Out
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Summary */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Total Work</p>
                    <p className="text-2xl font-mono text-white">{formatTime(todayTotalSeconds)}</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Sessions</p>
                    <p className="text-2xl font-mono text-white">{(todaySessions?.length || 0) + (activeSession ? 1 : 0)}</p>
                  </div>
                </div>

                {/* Session List */}
                {todaySessions && todaySessions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-slate-400 mb-2">Previous Sessions</p>
                    {todaySessions.filter(s => s.status === 'completed').map((session) => (
                      <div key={session.id} className="bg-slate-700/30 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-white">
                            {format(new Date(session.clock_in), 'HH:mm')} - {session.clock_out ? format(new Date(session.clock_out), 'HH:mm') : 'Active'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-white">{formatTime(session.total_work_seconds)}</p>
                          {session.total_break_seconds > 0 && (
                            <p className="text-xs text-yellow-400">{formatTime(session.total_break_seconds)} break</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default TimeClock;
