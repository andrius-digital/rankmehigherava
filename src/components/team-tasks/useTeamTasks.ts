import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TeamTask, TeamMember, TaskStatus } from './types';

function getTeamSession(): { id: string; name: string; email: string; role: string; permissions: string[] } | null {
  try {
    const raw = sessionStorage.getItem('rmh_team_session');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

interface TeamPortalMemberRow {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  is_manager: boolean;
  managed_member_ids: string[];
  created_at: string;
}

interface TeamTaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  assignee_id: string;
  assignee_name: string;
  created_by: string;
  labels: string[];
  position: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

function rowToTask(row: TeamTaskRow): TeamTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    status: (row.status || 'todo') as TaskStatus,
    priority: row.priority || 'medium',
    due_date: row.due_date,
    assignee_id: row.assignee_id,
    assignee_name: row.assignee_name || '',
    created_by: row.created_by || '',
    labels: row.labels || [],
    position: row.position || 0,
    notes: row.notes || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  } as TeamTask;
}

function rowToMember(row: TeamPortalMemberRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role || 'Team Member',
    is_manager: row.is_manager || false,
    managed_member_ids: row.managed_member_ids || [],
  };
}

export function useTeamTasks() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [currentMemberRole, setCurrentMemberRole] = useState<'member' | 'manager' | 'admin'>('member');
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);

  const teamSession = getTeamSession();

  const loadMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('team_portal_members')
        .select('id, user_id, name, email, role, permissions, is_manager, managed_member_ids, created_at')
        .order('name');
      if (error) throw error;
      setMembers((data || []).map(row => rowToMember(row as TeamPortalMemberRow)));
    } catch (err) {
      console.error('Failed to load team members:', err);
      setMembers([]);
    }
  }, []);

  const identifyCurrentUser = useCallback(() => {
    if (isAdmin) {
      setCurrentMemberRole('admin');
      const adminMatch = user?.email ? members.find(m => m.email === user.email) : null;
      setCurrentMemberId(adminMatch?.id || null);
      return;
    }

    if (teamSession) {
      const match = members.find(m => m.email === teamSession.email);
      if (match) {
        setCurrentMemberId(match.id);
        setCurrentMemberRole(match.is_manager ? 'manager' : 'member');
        if (!viewingMemberId) setViewingMemberId(match.id);
        return;
      }
    }

    if (user?.email) {
      const match = members.find(m => m.email === user.email);
      if (match) {
        setCurrentMemberId(match.id);
        setCurrentMemberRole(match.is_manager ? 'manager' : 'member');
        if (!viewingMemberId) setViewingMemberId(match.id);
      }
    }
  }, [isAdmin, user, teamSession, members, viewingMemberId]);

  const loadTasks = useCallback(async (memberId?: string | null) => {
    try {
      let query = supabase.from('team_tasks').select('*').order('position', { ascending: true });

      if (memberId) {
        query = query.eq('assignee_id', memberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTasks((data || []).map(row => rowToTask(row as TeamTaskRow)));
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllTasks = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('team_tasks').select('*').order('position', { ascending: true });
      if (error) throw error;
      setTasks((data || []).map(row => rowToTask(row as TeamTaskRow)));
    } catch (err) {
      console.error('Failed to load all tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task: Partial<TeamTask>) => {
    const maxPos = tasks.filter(t => t.status === (task.status || 'todo')).reduce((max, t) => Math.max(max, t.position), 0);
    const assigneeId = task.assignee_id || viewingMemberId || currentMemberId;
    if (!assigneeId) {
      throw new Error('Please select a team member to assign this task to.');
    }

    const assigneeMember = members.find(m => m.id === assigneeId);
    const insertPayload = {
      title: task.title || 'Untitled Task',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.due_date || null,
      assignee_id: assigneeId,
      assignee_name: task.assignee_name || assigneeMember?.name || '',
      created_by: currentMemberId || '',
      labels: task.labels || [],
      position: maxPos + 1,
      notes: task.notes || '',
    };

    try {
      const { data, error } = await supabase.from('team_tasks').insert([insertPayload]).select().single();
      if (error) throw error;
      if (data) {
        const row = data as TeamTaskRow;
        const created = rowToTask(row);
        setTasks(prev => [...prev, created]);
        return created;
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      throw err;
    }
  }, [tasks, viewingMemberId, currentMemberId, members]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<TeamTask>) => {
    try {
      const updatePayload: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      delete updatePayload.id;
      delete updatePayload.created_at;

      const { error } = await supabase.from('team_tasks').update(updatePayload).eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase.from('team_tasks').delete().eq('id', taskId);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  }, []);

  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const maxPos = tasks.filter(t => t.status === newStatus).reduce((max, t) => Math.max(max, t.position), 0);

    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus, position: maxPos + 1 } : t
    ));

    try {
      const { error } = await supabase.from('team_tasks').update({
        status: newStatus,
        position: maxPos + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', taskId);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to move task:', err);
      setTasks(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: task.status, position: task.position } : t
      ));
    }
  }, [tasks]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (members.length > 0) {
      identifyCurrentUser();
    }
  }, [members, identifyCurrentUser]);

  useEffect(() => {
    if (isAdmin && !viewingMemberId) {
      loadAllTasks();
    } else if (viewingMemberId) {
      loadTasks(viewingMemberId);
    } else if (currentMemberId) {
      loadTasks(currentMemberId);
    }
  }, [viewingMemberId, currentMemberId, isAdmin, loadTasks, loadAllTasks]);

  const getViewableMembers = useCallback(() => {
    if (isAdmin) return members;
    const current = members.find(m => m.id === currentMemberId);
    if (current?.is_manager) {
      return members.filter(m => m.id === currentMemberId || current.managed_member_ids.includes(m.id));
    }
    return members.filter(m => m.id === currentMemberId);
  }, [members, currentMemberId, isAdmin]);

  return {
    tasks,
    members,
    loading,
    currentMemberId,
    currentMemberRole,
    viewingMemberId,
    setViewingMemberId,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    loadTasks,
    loadAllTasks,
    getViewableMembers,
    refresh: () => {
      if (isAdmin && !viewingMemberId) loadAllTasks();
      else loadTasks(viewingMemberId || currentMemberId);
    },
  };
}
