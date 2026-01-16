import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';

export interface DailyTimeData {
  date: Date;
  formattedDate: string;
  dayName: string;
  totalSeconds: number;
}

export interface MemberDateRangeStats {
  teamMemberId: string;
  memberName: string;
  account: string;
  totalSeconds: number;
  dailyBreakdown: DailyTimeData[];
  isActive: boolean;
}

export const useDateRangeStats = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['date-range-stats', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      // Get all team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .order('name');

      if (membersError) throw membersError;

      // Get all sessions in the date range
      const rangeStart = startOfDay(startDate).toISOString();
      const rangeEnd = endOfDay(endDate).toISOString();

      const { data: sessions, error: sessionsError } = await supabase
        .from('time_sessions')
        .select('*')
        .gte('clock_in', rangeStart)
        .lte('clock_in', rangeEnd);

      if (sessionsError) throw sessionsError;

      // Check for active sessions
      const { data: activeSessions, error: activeError } = await supabase
        .from('time_sessions')
        .select('team_member_id')
        .eq('status', 'active');

      if (activeError) throw activeError;

      const activeMembers = new Set(activeSessions?.map(s => s.team_member_id));

      // Get all days in the range
      const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });

      // Calculate stats per member
      const stats: MemberDateRangeStats[] = members.map((member) => {
        const memberSessions = sessions.filter(s => s.team_member_id === member.id);

        const dailyBreakdown: DailyTimeData[] = daysInRange.map((day) => {
          const dayStart = startOfDay(day);
          const dayEnd = endOfDay(day);
          
          const daySeconds = memberSessions
            .filter(s => {
              const clockIn = new Date(s.clock_in);
              return clockIn >= dayStart && clockIn <= dayEnd;
            })
            .reduce((acc, s) => acc + (s.total_work_seconds || 0), 0);

          return {
            date: day,
            formattedDate: format(day, 'MMM d'),
            dayName: format(day, 'EEE'),
            totalSeconds: daySeconds,
          };
        });

        const totalSeconds = dailyBreakdown.reduce((acc, d) => acc + d.totalSeconds, 0);

        return {
          teamMemberId: member.id,
          memberName: member.name,
          account: member.account,
          totalSeconds,
          dailyBreakdown,
          isActive: activeMembers.has(member.id),
        };
      });

      return stats;
    },
    refetchInterval: 30000,
  });
};
