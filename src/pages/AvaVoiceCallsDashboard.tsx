import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Phone, Clock, ChevronDown, ArrowLeft } from 'lucide-react';
import { useAvaVoiceStorage } from '@/hooks/useAvaVoiceStorage';
import { AvaVoiceCall } from '@/types/ava-voice';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { AvaAudioPlayer } from '@/components/AvaAudioPlayer';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

// Dashboard for viewing Ava voice calls
export default function AvaVoiceCallsDashboard() {
  const { getRecentCalls } = useAvaVoiceStorage();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [isTimeFilterOpen, setIsTimeFilterOpen] = useState(false);

  // Fetch recent calls
  const { data: recentCalls = [], isLoading: isLoadingCalls } = useQuery({
    queryKey: ['ava-voice-calls'],
    queryFn: () => getRecentCalls(100), // Get more calls for filtering
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Filter calls by time
  const getFilteredCalls = () => {
    const now = new Date();
    const calls = recentCalls as AvaVoiceCall[];
    
    switch (timeFilter) {
      case 'today':
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        return calls.filter(call => new Date(call.started_at) >= startOfDay);
      
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        return calls.filter(call => new Date(call.started_at) >= startOfWeek);
      
      case 'month':
        const startOfMonth = new Date(now);
        startOfMonth.setDate(now.getDate() - 30);
        return calls.filter(call => new Date(call.started_at) >= startOfMonth);
      
      default:
        return calls;
    }
  };

  const displayedCalls = getFilteredCalls();

  // Calculate stats
  const totalCalls = displayedCalls.length;
  const avgDuration = displayedCalls.length > 0
    ? Math.round(displayedCalls.reduce((sum, call) => sum + call.call_duration_seconds, 0) / displayedCalls.length)
    : 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'active': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    }
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Time';
    }
  };

  return (
    <>
      <Helmet>
        <title>Ava Voice Calls Dashboard | Rank Me Higher</title>
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/avaadminpanel"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 backdrop-blur-md border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all font-orbitron text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to AVA Admin Panel
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black font-orbitron text-cyan-400 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 backdrop-blur-md border-2 border-cyan-500/30 flex items-center justify-center">
                <Phone className="w-6 h-6 text-cyan-400" />
              </div>
              Ava Voice Calls Dashboard
            </h1>
            <p className="text-cyan-400/60 font-orbitron text-sm">
              Track and manage all voice interactions with Ava
            </p>
          </div>

          {/* Stats Grid - Only 2 KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-cyan-500/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="pb-3">
                <div className="text-sm font-medium text-cyan-400/60 flex items-center gap-2 font-orbitron">
                  <Phone className="w-4 h-4" />
                  Total Calls
                </div>
              </div>
              <div className="text-3xl font-black font-orbitron text-cyan-400">{totalCalls}</div>
            </div>

            <div className="bg-cyan-500/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
              <div className="pb-3">
                <div className="text-sm font-medium text-cyan-400/60 flex items-center gap-2 font-orbitron">
                  <Clock className="w-4 h-4" />
                  Avg Duration
                </div>
              </div>
              <div className="text-3xl font-black font-orbitron text-cyan-400">{formatDuration(avgDuration)}</div>
            </div>
          </div>

          {/* Time Filter Dropdown */}
          <div className="mb-6">
            <div className="relative inline-block">
              <button
                onClick={() => setIsTimeFilterOpen(!isTimeFilterOpen)}
                className="px-6 py-3 rounded-xl font-orbitron text-sm transition-all backdrop-blur-md bg-cyan-500/20 border-2 border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/20 hover:bg-cyan-500/30 flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                {getTimeFilterLabel()}
                <ChevronDown className={`w-4 h-4 transition-transform ${isTimeFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isTimeFilterOpen && (
                <div className="absolute top-full mt-2 left-0 bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden shadow-xl shadow-cyan-500/20 min-w-[160px] z-10">
                  {(['all', 'today', 'week', 'month'] as TimeFilter[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setTimeFilter(filter);
                        setIsTimeFilterOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left font-orbitron text-sm transition-all ${
                        timeFilter === filter
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-cyan-400/60 hover:bg-cyan-500/10 hover:text-cyan-400'
                      }`}
                    >
                      {filter === 'all' && 'All Time'}
                      {filter === 'today' && 'Today'}
                      {filter === 'week' && 'This Week'}
                      {filter === 'month' && 'This Month'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calls List */}
          <div className="space-y-4">
            {isLoadingCalls ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-cyan-400/60 font-orbitron">Loading calls...</p>
              </div>
            ) : displayedCalls.length === 0 ? (
              <div className="bg-cyan-500/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-12 text-center">
                <Phone className="w-12 h-12 mx-auto mb-4 text-cyan-400/40" />
                <p className="text-cyan-400/60 font-orbitron">No calls yet</p>
              </div>
            ) : (
              displayedCalls.map((call: AvaVoiceCall) => (
                <div key={call.id} className="bg-cyan-500/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all">
                  <div className="space-y-4">
                    {/* Call Info Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Basic Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={`${getStatusColor(call.call_status)} border backdrop-blur-md`}>
                            {call.call_status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {call.caller_name && (
                            <div>
                              <span className="text-cyan-400/60 font-orbitron">Caller:</span>{' '}
                              <span className="text-cyan-400 font-semibold">{call.caller_name}</span>
                            </div>
                          )}
                          {call.business_name && (
                            <div>
                              <span className="text-cyan-400/60 font-orbitron">Business:</span>{' '}
                              <span className="text-cyan-400 font-semibold">{call.business_name}</span>
                            </div>
                          )}
                          {call.caller_email && (
                            <div>
                              <span className="text-cyan-400/60 font-orbitron">Email:</span>{' '}
                              <span className="text-cyan-400">{call.caller_email}</span>
                            </div>
                          )}
                          {call.caller_phone && (
                            <div>
                              <span className="text-cyan-400/60 font-orbitron">Phone:</span>{' '}
                              <span className="text-cyan-400">{call.caller_phone}</span>
                            </div>
                          )}
                        </div>

                        {call.summary && (
                          <div className="text-sm text-cyan-400/60 italic">
                            "{call.summary}"
                          </div>
                        )}
                      </div>

                      {/* Right: Time & Duration */}
                      <div className="text-right space-y-2">
                        <div className="text-xs text-cyan-400/60 font-orbitron">
                          {new Date(call.started_at).toLocaleString()}
                        </div>
                        <div className="text-lg font-bold font-orbitron text-cyan-400">
                          {formatDuration(call.call_duration_seconds)}
                        </div>
                      </div>
                    </div>

                    {/* Audio Player */}
                    <AvaAudioPlayer audioUrl={call.call_recording_url} callId={call.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
