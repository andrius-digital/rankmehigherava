import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns';

export interface DailyStats {
  date: string;
  totalWorkSeconds: number;
  totalBreakSeconds: number;
  sessionsCount: number;
}

export interface MemberStats {
  teamMemberId: string;
  memberName: string;
  account: string;
  todaySeconds: number;
  weekSeconds: number;
  monthSeconds: number;
  isActive: boolean;
}

export const useDailyStats = (teamMemberId: string, date: Date = new Date()) => {
  return useQuery({
    queryKey: ['daily-stats', teamMemberId, format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const dayStart = startOfDay(date).toISOString();
      const dayEnd = endOfDay(date).toISOString();

      const { data, error } = await supabase
        .from('time_sessions')
        .select('*')
        .eq('team_member_id', teamMemberId)
        .gte('clock_in', dayStart)
        .lte('clock_in', dayEnd);

      if (error) throw error;

      const totalWorkSeconds = data.reduce((acc, s) => acc + (s.total_work_seconds || 0), 0);
      const totalBreakSeconds = data.reduce((acc, s) => acc + (s.total_break_seconds || 0), 0);

      return {
        date: format(date, 'yyyy-MM-dd'),
        totalWorkSeconds,
        totalBreakSeconds,
        sessionsCount: data.length,
      } as DailyStats;
    },
  });
};

export const useWeeklyStats = (teamMemberId: string, date: Date = new Date()) => {
  return useQuery({
    queryKey: ['weekly-stats', teamMemberId, format(startOfWeek(date), 'yyyy-MM-dd')],
    queryFn: async () => {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }).toISOString();
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 }).toISOString();

      const { data, error } = await supabase
        .from('time_sessions')
        .select('*')
        .eq('team_member_id', teamMemberId)
        .gte('clock_in', weekStart)
        .lte('clock_in', weekEnd);

      if (error) throw error;

      const dailyMap = new Map<string, DailyStats>();

      data.forEach((session) => {
        const day = format(new Date(session.clock_in), 'yyyy-MM-dd');
        const existing = dailyMap.get(day) || {
          date: day,
          totalWorkSeconds: 0,
          totalBreakSeconds: 0,
          sessionsCount: 0,
        };

        dailyMap.set(day, {
          ...existing,
          totalWorkSeconds: existing.totalWorkSeconds + (session.total_work_seconds || 0),
          totalBreakSeconds: existing.totalBreakSeconds + (session.total_break_seconds || 0),
          sessionsCount: existing.sessionsCount + 1,
        });
      });

      return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    },
  });
};

export const useAllMembersStats = () => {
  return useQuery({
    queryKey: ['all-members-stats'],
    queryFn: async () => {
      // Get all team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .order('name');

      if (membersError) throw membersError;

      // Get all sessions
      const today = startOfDay(new Date());
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: sessions, error: sessionsError } = await supabase
        .from('time_sessions')
        .select('*')
        .gte('clock_in', monthStart.toISOString());

      if (sessionsError) throw sessionsError;

      // Check for active sessions
      const { data: activeSessions, error: activeError } = await supabase
        .from('time_sessions')
        .select('team_member_id')
        .eq('status', 'active');

      if (activeError) throw activeError;

      const activeMembers = new Set(activeSessions?.map(s => s.team_member_id));

      // Calculate stats per member
      const stats: MemberStats[] = members.map((member) => {
        const memberSessions = sessions.filter(s => s.team_member_id === member.id);

        const todaySeconds = memberSessions
          .filter(s => new Date(s.clock_in) >= today)
          .reduce((acc, s) => acc + (s.total_work_seconds || 0), 0);

        const weekSeconds = memberSessions
          .filter(s => new Date(s.clock_in) >= weekStart)
          .reduce((acc, s) => acc + (s.total_work_seconds || 0), 0);

        const monthSeconds = memberSessions
          .reduce((acc, s) => acc + (s.total_work_seconds || 0), 0);

        return {
          teamMemberId: member.id,
          memberName: member.name,
          account: member.account,
          todaySeconds,
          weekSeconds,
          monthSeconds,
          isActive: activeMembers.has(member.id),
        };
      });

      return stats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
