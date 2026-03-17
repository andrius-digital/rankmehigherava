import { supabase } from '@/integrations/supabase/client';

export type ActionType = 'create' | 'update' | 'delete' | 'move' | 'status_change';
export type EntityType = 'company' | 'location' | 'task' | 'sop';

export interface ActivityLogEntry {
  id: string;
  user_name: string;
  user_email: string;
  action_type: ActionType;
  entity_type: EntityType;
  entity_name: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

async function getCurrentUser(): Promise<{ name: string; email: string }> {
  const teamRaw = sessionStorage.getItem('rmh_team_session');
  if (teamRaw) {
    try {
      const team = JSON.parse(teamRaw);
      return {
        name: team.name || team.email || 'Team Member',
        email: team.email || '',
      };
    } catch {}
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
      };
    }
  } catch {}

  return { name: 'Unknown', email: '' };
}

export async function logActivity(
  actionType: ActionType,
  entityType: EntityType,
  entityName: string,
  description: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const user = await getCurrentUser();
    await supabase.from('gbp_activity_log').insert({
      user_name: user.name,
      user_email: user.email,
      action_type: actionType,
      entity_type: entityType,
      entity_name: entityName,
      description,
      metadata,
    });
  } catch {
    console.error('Failed to log activity');
  }
}

export async function fetchActivityLog(
  limit = 100,
  entityType?: EntityType,
  search?: string
): Promise<ActivityLogEntry[]> {
  try {
    let query = supabase
      .from('gbp_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query;
    if (error) throw error;

    let entries = (data || []) as ActivityLogEntry[];

    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter(
        e =>
          e.description.toLowerCase().includes(q) ||
          e.entity_name.toLowerCase().includes(q) ||
          e.user_name.toLowerCase().includes(q)
      );
    }

    return entries;
  } catch {
    console.error('Failed to fetch activity log');
    return [];
  }
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
