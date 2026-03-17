import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Pencil, Trash2, X, Calendar, GripVertical,
  Building2, Archive, LayoutDashboard, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SEOTaskRow = Database['public']['Tables']['seo_tasks']['Row'];
type TaskPriority = 'high' | 'medium' | 'low';
type TaskCategory = 'gbp' | 'citations' | 'reviews' | 'on-page' | 'reporting';
type TaskCol = 'new' | 'in_progress' | 'finished';

interface SEOTask extends Omit<SEOTaskRow, 'priority' | 'category' | 'col'> {
  priority: TaskPriority;
  category: TaskCategory;
  col: TaskCol;
}

interface Company { id: string; name: string; }
interface Location { id: string; company_id: string; address: string; }

interface ArchivedTask {
  id: string;
  title: string;
  client: string;
  company_id: string | null;
  location_id: string | null;
  week_of: string;
  due_date: string | null;
  priority: string;
  category: string;
  notes: string;
  col: string;
  archived_at: string;
}

const COLUMNS: { key: TaskCol; label: string; color: string }[] = [
  { key: 'new', label: 'New Task', color: 'border-blue-500/40' },
  { key: 'in_progress', label: 'In Progress', color: 'border-amber-500/40' },
  { key: 'finished', label: 'Finished', color: 'border-green-500/40' },
];

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: 'High', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  medium: { label: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  low: { label: 'Low', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  gbp: { label: 'GBP', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  citations: { label: 'Citations', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  reviews: { label: 'Reviews', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  'on-page': { label: 'On-Page', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  reporting: { label: 'Reporting', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];
const CATEGORIES: TaskCategory[] = ['gbp', 'citations', 'reviews', 'on-page', 'reporting'];

const DEFAULT_WEEKLY_TASKS: { title: string; category: TaskCategory; priority: TaskPriority; hasWeekDeadline: boolean }[] = [
  { title: 'Add Keywords to GBP', category: 'gbp', priority: 'high', hasWeekDeadline: true },
  { title: 'Create GBP Posts', category: 'gbp', priority: 'high', hasWeekDeadline: true },
  { title: 'Upload New Photos', category: 'gbp', priority: 'medium', hasWeekDeadline: true },
  { title: 'Write New Reviews', category: 'reviews', priority: 'high', hasWeekDeadline: false },
];

function pad(n: number) { return n < 10 ? '0' + n : '' + n; }
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return toDateStr(d);
}

function getWeekEnd(weekStart: string): string {
  const p = weekStart.split('-').map(Number);
  return toDateStr(new Date(p[0], p[1] - 1, p[2] + 6));
}

function formatWeekLabel(weekStart: string): string {
  const p = weekStart.split('-').map(Number);
  const s = new Date(p[0], p[1] - 1, p[2]);
  const e = new Date(p[0], p[1] - 1, p[2] + 6);
  const o: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${s.toLocaleDateString('en-US', o)} – ${e.toLocaleDateString('en-US', o)}`;
}

function shortAddress(addr: string): string {
  if (!addr) return 'Unknown';
  const parts = addr.split(',');
  return parts[0].trim();
}

const KanbanBoard: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<SEOTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', client: '', due_date: '', priority: 'medium' as TaskPriority, category: 'gbp' as TaskCategory, notes: '', col: 'new' as TaskCol, location_id: '' });
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveWeeks, setArchiveWeeks] = useState<string[]>([]);
  const [selectedArchiveWeek, setSelectedArchiveWeek] = useState<string>('all');

  const currentWeek = getWeekStart();

  const fetchCompanies = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('gbp_companies').select('id, name').order('name');
      if (error) throw error;
      const list = (data || []) as Company[];
      setCompanies(list);
      if (list.length > 0) {
        setSelectedCompanyId(prev => prev || list[0].id);
      }
    } catch {
      toast.error('Failed to load companies');
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!selectedCompanyId) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('seo_tasks')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .eq('week_of', currentWeek)
        .not('location_id', 'is', null)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const validCols = COLUMNS.map(c => c.key as string);
      setTasks((data || []).map(row => ({
        ...row,
        priority: (PRIORITIES as readonly string[]).includes(row.priority) ? row.priority as TaskPriority : 'medium',
        category: (CATEGORIES as readonly string[]).includes(row.category) ? row.category as TaskCategory : 'gbp',
        col: validCols.includes(row.col) ? row.col as TaskCol : 'new',
      })));
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId, currentWeek]);

  const fetchArchive = useCallback(async () => {
    if (!selectedCompanyId) return;
    setArchiveLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_tasks_archive')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('week_of', { ascending: false });
      if (error) throw error;
      const rows = (data || []) as ArchivedTask[];
      setArchivedTasks(rows);
      setArchiveWeeks([...new Set(rows.map(r => r.week_of))]);
    } catch {
      toast.error('Failed to load archive');
    } finally {
      setArchiveLoading(false);
    }
  }, [selectedCompanyId]);

  const autoProcessingRef = useRef<string | null>(null);

  const autoProcessWeekTransition = useCallback(async (companyId: string, locs: Location[]) => {
    if (autoProcessingRef.current === companyId) return;
    autoProcessingRef.current = companyId;
    try {
      const { data: oldTasks, error: oldErr } = await supabase
        .from('seo_tasks')
        .select('*')
        .eq('company_id', companyId)
        .lt('week_of', currentWeek);
      if (oldErr) throw oldErr;

      if (oldTasks && oldTasks.length > 0) {
        const finished = oldTasks.filter(t => t.col === 'finished');
        const unfinished = oldTasks.filter(t => t.col !== 'finished');

        if (finished.length > 0) {
          const archiveRows = finished.map(t => ({
            original_task_id: t.id,
            title: t.title,
            client: t.client,
            company_id: t.company_id,
            location_id: t.location_id,
            week_of: t.week_of,
            due_date: t.due_date,
            priority: t.priority,
            category: t.category,
            notes: t.notes,
            col: t.col,
          }));
          const { error: archiveErr } = await supabase.from('seo_tasks_archive').insert(archiveRows);
          if (archiveErr) throw archiveErr;
          const finishedIds = finished.map(t => t.id);
          const { error: delErr } = await supabase.from('seo_tasks').delete().in('id', finishedIds);
          if (delErr) throw delErr;
        }

        if (unfinished.length > 0) {
          const unfinishedIds = unfinished.map(t => t.id);
          const { error: carryErr } = await supabase
            .from('seo_tasks')
            .update({ week_of: currentWeek })
            .in('id', unfinishedIds);
          if (carryErr) throw carryErr;
        }
      }

      if (locs.length === 0) return;

      const { data: existing, error: checkErr } = await supabase
        .from('seo_tasks')
        .select('title, location_id')
        .eq('company_id', companyId)
        .eq('week_of', currentWeek);
      if (checkErr) throw checkErr;

      const existingKeys = new Set((existing || []).map(t => `${t.location_id}::${t.title}`));
      const weekEnd = getWeekEnd(currentWeek);

      const newTasks: Array<{
        title: string; client: string; company_id: string; location_id: string;
        week_of: string; due_date: string | null; priority: string; category: string;
        notes: string; col: string;
      }> = [];

      for (const loc of locs) {
        for (const tmpl of DEFAULT_WEEKLY_TASKS) {
          const key = `${loc.id}::${tmpl.title}`;
          if (!existingKeys.has(key)) {
            newTasks.push({
              title: tmpl.title,
              client: shortAddress(loc.address),
              company_id: companyId,
              location_id: loc.id,
              week_of: currentWeek,
              due_date: tmpl.hasWeekDeadline ? weekEnd : null,
              priority: tmpl.priority,
              category: tmpl.category,
              notes: '',
              col: 'new',
            });
          }
        }
      }

      if (newTasks.length > 0) {
        const { error } = await supabase.from('seo_tasks').insert(newTasks);
        if (error) throw error;
      }
    } catch {
      toast.error('Failed to process weekly tasks');
    } finally {
      autoProcessingRef.current = null;
    }
  }, [currentWeek]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  useEffect(() => {
    if (!selectedCompanyId) return;
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from('gbp_locations')
          .select('id, company_id, address')
          .eq('company_id', selectedCompanyId)
          .order('address');
        if (error) throw error;
        const locs = (data || []) as Location[];
        setLocations(locs);
        await autoProcessWeekTransition(selectedCompanyId, locs);
        await fetchTasks();
      } catch {
        toast.error('Failed to load data');
        setLoading(false);
      }
    })();
  }, [selectedCompanyId, autoProcessWeekTransition, fetchTasks]);

  useEffect(() => {
    if (showArchive && selectedCompanyId) fetchArchive();
  }, [showArchive, selectedCompanyId, fetchArchive]);

  const openAdd = (col: TaskCol = 'new') => {
    setEditingId(null);
    setForm({ title: '', client: '', due_date: '', priority: 'medium', category: 'gbp', notes: '', col, location_id: locations.length > 0 ? locations[0].id : '' });
    setModalOpen(true);
  };

  const openEdit = (t: SEOTask) => {
    setEditingId(t.id);
    setForm({
      title: t.title, client: t.client, due_date: t.due_date || '',
      priority: t.priority, category: t.category, notes: t.notes, col: t.col,
      location_id: t.location_id || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.location_id) { toast.error('Please select a location'); return; }
    try {
      const loc = locations.find(l => l.id === form.location_id);
      const row = {
        title: form.title.trim(),
        client: loc ? shortAddress(loc.address) : form.client.trim(),
        company_id: selectedCompanyId,
        location_id: form.location_id,
        week_of: currentWeek,
        due_date: form.due_date || null,
        priority: form.priority,
        category: form.category,
        notes: form.notes.trim(),
        col: form.col,
      };
      if (editingId) {
        const { error } = await supabase.from('seo_tasks').update(row).eq('id', editingId);
        if (error) throw error;
        toast.success('Task updated');
      } else {
        const { error } = await supabase.from('seo_tasks').insert(row);
        if (error) throw error;
        toast.success('Task added');
      }
      setModalOpen(false);
      fetchTasks();
    } catch { toast.error('Failed to save task'); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      const { error } = await supabase.from('seo_tasks').delete().eq('id', id);
      if (error) throw error;
      toast.success('Task deleted');
      fetchTasks();
    } catch { toast.error('Failed to delete task'); }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(col);
  };

  const handleDrop = async (e: React.DragEvent, targetCol: TaskCol) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedId;
    if (!taskId) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.col === targetCol) { setDraggedId(null); return; }
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, col: targetCol } : t));
    setDraggedId(null);
    try {
      const { error } = await supabase.from('seo_tasks').update({ col: targetCol }).eq('id', taskId);
      if (error) throw error;
    } catch {
      toast.error('Failed to move task');
      fetchTasks();
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return null;
    try {
      const parts = d.split('-').map(Number);
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return d; }
  };

  const isOverdue = (d: string | null, col: string) => {
    if (!d || col === 'finished') return false;
    const parts = d.split('-').map(Number);
    const due = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
    return due < new Date();
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const filteredArchive = selectedArchiveWeek === 'all'
    ? archivedTasks
    : archivedTasks.filter(t => t.week_of === selectedArchiveWeek);

  const locationMap = new Map(locations.map(l => [l.id, l]));

  const tasksByLocation = new Map<string, SEOTask[]>();
  for (const t of tasks) {
    if (!t.location_id) continue;
    if (!tasksByLocation.has(t.location_id)) tasksByLocation.set(t.location_id, []);
    tasksByLocation.get(t.location_id)!.push(t);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Weekly Task Board</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline" size="sm"
            className={`gap-1.5 text-xs border-white/10 ${showArchive ? 'bg-amber-500/10 text-amber-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setShowArchive(!showArchive)}
          >
            <Archive className="w-3.5 h-3.5" /> {showArchive ? 'Hide Archive' : 'View Archive'}
          </Button>
          {selectedCompanyId && (
            <Button onClick={() => openAdd('new')} className="bg-red-600 hover:bg-red-700 text-white gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" /> Add Task
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
          <select
            value={selectedCompanyId || ''}
            onChange={e => setSelectedCompanyId(e.target.value || null)}
            className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white flex-1 min-w-0"
          >
            {companies.length === 0 && <option value="">No companies</option>}
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-400">{locations.length} location(s)</span>
          </div>
          <span className="text-xs text-cyan-400 font-medium bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded">
            {formatWeekLabel(currentWeek)}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading tasks...</div>
      ) : !selectedCompanyId ? (
        <div className="text-center py-10 text-gray-500">Select a company to view tasks</div>
      ) : tasksByLocation.size > 0 ? (
        <div className="space-y-6">
          {Array.from(tasksByLocation.entries()).map(([locId, locTasks]) => {
            const loc = locationMap.get(locId);
            return (
              <div key={locId}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-sm font-semibold text-white">
                    {loc ? shortAddress(loc.address) : 'Unknown Location'}
                  </span>
                  {loc && (
                    <span className="text-[10px] text-gray-500 truncate">{loc.address}</span>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {COLUMNS.map(column => {
                    const colTasks = locTasks.filter(t => t.col === column.key);
                    const isDragOver = dragOverCol === `${locId}::${column.key}`;
                    return (
                      <div
                        key={column.key}
                        className={`border-t-2 ${column.color} rounded-xl bg-white/[0.02] backdrop-blur-sm transition-all ${isDragOver ? 'ring-2 ring-cyan-500/30 bg-cyan-500/5' : ''}`}
                        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCol(`${locId}::${column.key}`); }}
                        onDragLeave={() => setDragOverCol(null)}
                        onDrop={e => handleDrop(e, column.key)}
                      >
                        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">{column.label}</span>
                          <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                        </div>
                        <div className="p-1.5 space-y-1.5 min-h-[80px]">
                          {colTasks.map(task => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={e => handleDragStart(e, task.id)}
                              onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                              className={`border border-white/10 rounded-lg p-2.5 bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-grab active:cursor-grabbing ${draggedId === task.id ? 'opacity-40' : ''}`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-1 min-w-0">
                                  <GripVertical className="w-3 h-3 text-gray-600 shrink-0" />
                                  <span className="text-xs font-medium text-white truncate">{task.title}</span>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white" onClick={() => openEdit(task)}>
                                    <Pencil className="w-2.5 h-2.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-red-400" onClick={() => handleDelete(task.id, task.title)}>
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${PRIORITY_CONFIG[task.priority]?.color || ''}`}>
                                  {PRIORITY_CONFIG[task.priority]?.label || task.priority}
                                </span>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${CATEGORY_CONFIG[task.category]?.color || ''}`}>
                                  {CATEGORY_CONFIG[task.category]?.label || task.category}
                                </span>
                                {task.due_date && (
                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${isOverdue(task.due_date, task.col) ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                                    <Calendar className="w-2.5 h-2.5" />
                                    {formatDate(task.due_date)}
                                  </span>
                                )}
                                {!task.due_date && task.category === 'reviews' && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border bg-white/5 text-gray-500 border-white/10">
                                    No deadline
                                  </span>
                                )}
                              </div>
                              {task.notes && (
                                <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 italic">{task.notes}</p>
                              )}
                            </div>
                          ))}
                          {colTasks.length === 0 && (
                            <div className="text-center py-4 text-gray-600 text-[10px]">
                              {isDragOver ? 'Drop here' : 'Empty'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

        </div>
      ) : selectedCompanyId && locations.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          No locations for this company. Add locations in the GBP Management tab first.
        </div>
      ) : null}

      {showArchive && selectedCompanyId && (
        <div className="mt-6 border border-white/10 rounded-xl bg-white/[0.02] backdrop-blur-sm">
          <div className="px-4 py-3 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">Archived Weeks</span>
              <span className="text-xs text-gray-500">({archivedTasks.length} tasks)</span>
            </div>
            {archiveWeeks.length > 1 && (
              <select
                value={selectedArchiveWeek}
                onChange={e => setSelectedArchiveWeek(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white"
              >
                <option value="all">All Weeks</option>
                {archiveWeeks.map(w => (
                  <option key={w} value={w}>{formatWeekLabel(w)}</option>
                ))}
              </select>
            )}
          </div>
          <div className="p-3">
            {archiveLoading ? (
              <div className="text-center py-6 text-gray-500 text-xs">Loading archive...</div>
            ) : filteredArchive.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">No archived tasks</div>
            ) : (
              <div className="space-y-1.5">
                {filteredArchive.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${task.col === 'finished' ? 'bg-green-500' : task.col === 'in_progress' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className="text-xs text-white truncate flex-1">{task.title}</span>
                    <span className="text-[10px] text-gray-500 truncate max-w-[100px]">{task.client}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${CATEGORY_CONFIG[task.category]?.color || 'bg-white/5 text-gray-400 border-white/10'}`}>
                      {CATEGORY_CONFIG[task.category]?.label || task.category}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.col === 'finished' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {task.col === 'finished' ? 'Done' : task.col === 'in_progress' ? 'Incomplete' : 'Not started'}
                    </span>
                    <span className="text-[10px] text-gray-600 shrink-0">{formatWeekLabel(task.week_of)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Task' : 'Add Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Task Title</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Location</label>
                <select
                  value={form.location_id}
                  onChange={e => setForm(f => ({ ...f, location_id: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                >
                  {locations.length === 0 && <option value="">No locations available</option>}
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{shortAddress(l.address)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Due Date</label>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white">
                    {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TaskCategory }))} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white">
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_CONFIG[c].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Column</label>
                  <select value={form.col} onChange={e => setForm(f => ({ ...f, col: e.target.value as TaskCol }))} className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white">
                    {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:outline-none resize-none"
                  placeholder="Optional notes..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">{editingId ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
