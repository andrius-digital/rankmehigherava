import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  MapPin, Search, Plus, Pencil, Trash2,
  CheckCircle2, Clock, FileWarning, Circle, AlertTriangle,
  ChevronLeft, ChevronDown, ChevronRight, X, Phone, Mail, Building2, Loader2,
  ClipboardList, Hash, Image, MessageSquare, Star, LinkIcon, StickyNote, Compass, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logActivity } from '@/utils/activityLog';

const SOPLibrary = lazy(() => import('@/components/SOPLibrary'));
const KanbanBoard = lazy(() => import('@/components/KanbanBoard'));
const ActivityLogModal = lazy(() => import('@/components/ActivityLogModal'));

interface GBPLocation {
  id: string;
  address: string;
  email: string;
  phone: string;
  status: 'verified' | 'pending' | 'processing' | 'not_started';
  notes: string;
  googleProfileUrl?: string;
}

interface SEOTaskRow {
  id: string;
  title: string;
  col: string;
  notes: string;
  due_date: string | null;
  location_id: string | null;
}

interface ParsedTaskData {
  count: number;
  entries: string[];
  freeNotes: string;
}

const DEFAULT_TASK_TITLES = [
  'Add Keywords to GBP',
  'Create GBP Posts',
  'Upload New Photos',
  'Write New Reviews',
];

const TASK_DETAIL_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }>; target: number; targetMin?: number; entryLabel: string; entryType: 'text' | 'url'; description: string }> = {
  'Add Keywords to GBP': { label: 'Services List Keywords', icon: Hash, target: 10, entryLabel: 'Keywords', entryType: 'text', description: '10 keywords with descriptions per week' },
  'Create GBP Posts': { label: 'Posts', icon: MessageSquare, target: 4, targetMin: 3, entryLabel: 'Post URLs', entryType: 'url', description: '3-4 posts per week' },
  'Upload New Photos': { label: 'Images Added', icon: Image, target: 2, targetMin: 1, entryLabel: 'Photo Details', entryType: 'text', description: '1-2 new images per week' },
  'Write New Reviews': { label: 'Reviews Added', icon: Star, target: 2, entryLabel: 'Review URLs', entryType: 'url', description: '2 reviews per month' },
};

function parseTaskNotes(notes: string): ParsedTaskData {
  if (!notes) return { count: 0, entries: [], freeNotes: '' };
  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === 'object' && 'count' in parsed) {
      return {
        count: parsed.count || 0,
        entries: Array.isArray(parsed.entries) ? parsed.entries : [],
        freeNotes: typeof parsed.freeNotes === 'string' ? parsed.freeNotes : '',
      };
    }
  } catch {}
  return { count: 0, entries: [], freeNotes: notes };
}

interface GBPCompany {
  id: string;
  name: string;
  locations: GBPLocation[];
}

const STATUS_CONFIG = {
  verified: { label: 'Verified', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Loader2 },
  not_started: { label: 'Not Started', color: 'bg-white/[0.04] text-gray-500 border-white/[0.06]', icon: Circle },
};

const EMPTY_LOCATION: Omit<GBPLocation, 'id'> = {
  address: '', email: '', phone: '', status: 'not_started', notes: '', googleProfileUrl: '',
};

function pad(n: number): string { return n < 10 ? `0${n}` : `${n}`; }
function toDateStr(d: Date): string { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function getMonday(): string {
  const d = new Date();
  const now = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = now.getDay();
  now.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
  return toDateStr(now);
}

const GBPManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gbp' | 'seo-hub'>('gbp');
  const [companies, setCompanies] = useState<GBPCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationParentId, setLocationParentId] = useState<string | null>(null);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locationForm, setLocationForm] = useState(EMPTY_LOCATION);

  const [seoTasksByLocation, setSeoTasksByLocation] = useState<Map<string, SEOTaskRow[]>>(new Map());
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [tasksModalLocationId, setTasksModalLocationId] = useState<string | null>(null);
  const [tasksModalAddress, setTasksModalAddress] = useState('');
  const [taskDetailOpen, setTaskDetailOpen] = useState<SEOTaskRow | null>(null);

  const [actionRequiredModalOpen, setActionRequiredModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesLocationId, setNotesLocationId] = useState<string | null>(null);
  const [notesLocationAddress, setNotesLocationAddress] = useState('');
  const [notesText, setNotesText] = useState('');
  const [activityLogOpen, setActivityLogOpen] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      const { data: comps, error: compErr } = await supabase
        .from('gbp_companies')
        .select('id, name')
        .order('name');
      if (compErr) throw compErr;

      const { data: locs, error: locErr } = await supabase
        .from('gbp_locations')
        .select('*');
      if (locErr) throw locErr;

      const locsByCompany = new Map<string, GBPLocation[]>();
      for (const loc of (locs || [])) {
        const mapped: GBPLocation = {
          id: loc.id,
          address: loc.address || '',
          email: loc.email || '',
          phone: loc.phone || '',
          status: (loc.status as GBPLocation['status']) || 'not_started',
          notes: loc.notes || '',
          googleProfileUrl: loc.google_profile_url || '',
        };
        const arr = locsByCompany.get(loc.company_id) || [];
        arr.push(mapped);
        locsByCompany.set(loc.company_id, arr);
      }

      const result: GBPCompany[] = (comps || []).map(c => ({
        id: c.id,
        name: c.name,
        locations: locsByCompany.get(c.id) || [],
      }));

      setCompanies(result);
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSeoTasks = useCallback(async () => {
    try {
      const currentWeek = getMonday();
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthDay = firstOfMonth.getDay();
      const monthDiff = monthDay === 0 ? 1 : monthDay === 1 ? 0 : 8 - monthDay;
      firstOfMonth.setDate(firstOfMonth.getDate() + monthDiff);
      const monthStart = toDateStr(firstOfMonth);

      const { data, error } = await supabase
        .from('seo_tasks')
        .select('id, title, col, notes, due_date, location_id, week_of')
        .or(`week_of.eq.${currentWeek},week_of.eq.${monthStart}`);
      if (error) throw error;

      const seen = new Set<string>();
      const map = new Map<string, SEOTaskRow[]>();
      for (const row of (data || [])) {
        if (!row.location_id) continue;
        const key = `${row.location_id}::${row.title}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const arr = map.get(row.location_id) || [];
        arr.push(row as SEOTaskRow);
        map.set(row.location_id, arr);
      }
      setSeoTasksByLocation(map);
    } catch {
      console.error('Failed to load SEO tasks');
    }
  }, []);

  useEffect(() => { fetchCompanies(); fetchSeoTasks(); }, [fetchCompanies, fetchSeoTasks]);

  const stats = useMemo(() => {
    const allLocs = companies.flatMap(c => c.locations);
    return {
      companies: companies.length,
      locations: allLocs.length,
      verified: allLocs.filter(l => l.status === 'verified').length,
      pending: allLocs.filter(l => l.status === 'pending').length,
      processing: allLocs.filter(l => l.status === 'processing').length,
      notStarted: allLocs.filter(l => l.status === 'not_started').length,
      actionRequired: allLocs.filter(l => l.status !== 'verified').length,
    };
  }, [companies]);

  const actionRequiredData = useMemo(() => {
    return companies
      .map(c => {
        const locs = c.locations.filter(l => l.status !== 'verified');
        if (locs.length === 0) return null;
        return { companyId: c.id, companyName: c.name, locations: locs };
      })
      .filter(Boolean) as { companyId: string; companyName: string; locations: GBPLocation[] }[];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return companies
      .map(c => {
        let locs = c.locations;
        if (statusFilter !== 'all') locs = locs.filter(l => l.status === statusFilter);
        if (q) {
          const nameMatch = c.name.toLowerCase().includes(q);
          const locMatch = locs.filter(l => l.address.toLowerCase().includes(q) || l.email.toLowerCase().includes(q));
          if (!nameMatch && locMatch.length === 0) return null;
          if (!nameMatch) locs = locMatch;
        }
        if (statusFilter !== 'all' && locs.length === 0) return null;
        return { ...c, locations: locs };
      })
      .filter(Boolean) as GBPCompany[];
  }, [companies, searchQuery, statusFilter]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getCompanyStatusSummary = (locs: GBPLocation[]) => {
    const v = locs.filter(l => l.status === 'verified').length;
    const total = locs.length;
    if (v === total) return { label: 'All Verified', color: 'text-emerald-400' };
    if (v === 0) return { label: 'None Verified', color: 'text-red-400' };
    return { label: `${v}/${total} Verified`, color: 'text-amber-400' };
  };

  const getCompanyStatusDots = (locs: GBPLocation[]) => {
    const counts = {
      verified: locs.filter(l => l.status === 'verified').length,
      pending: locs.filter(l => l.status === 'pending').length,
      processing: locs.filter(l => l.status === 'processing').length,
      not_started: locs.filter(l => l.status === 'not_started').length,
    };
    return [
      { key: 'verified', count: counts.verified, dot: 'bg-emerald-500' },
      { key: 'pending', count: counts.pending, dot: 'bg-amber-500' },
      { key: 'processing', count: counts.processing, dot: 'bg-blue-500' },
      { key: 'not_started', count: counts.not_started, dot: 'bg-gray-600' },
    ].filter(s => s.count > 0);
  };

  const openAddCompany = () => { setEditingCompanyId(null); setCompanyName(''); setCompanyModalOpen(true); };
  const openEditCompany = (c: GBPCompany) => { setEditingCompanyId(c.id); setCompanyName(c.name); setCompanyModalOpen(true); };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) { toast.error('Company name is required'); return; }
    try {
      if (editingCompanyId) {
        const { error } = await supabase.from('gbp_companies').update({ name: companyName.trim() }).eq('id', editingCompanyId);
        if (error) throw error;
        toast.success('Company updated');
        logActivity('update', 'company', companyName.trim(), `Updated company "${companyName.trim()}"`);
      } else {
        const { error } = await supabase.from('gbp_companies').insert({ name: companyName.trim() });
        if (error) throw error;
        toast.success('Company added');
        logActivity('create', 'company', companyName.trim(), `Added company "${companyName.trim()}"`);
      }
      setCompanyModalOpen(false);
      fetchCompanies();
    } catch { toast.error('Failed to save company'); }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}" and all its locations? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('gbp_companies').delete().eq('id', id);
      if (error) throw error;
      toast.success('Company deleted');
      logActivity('delete', 'company', name, `Deleted company "${name}" and all its locations`);
      fetchCompanies();
    } catch { toast.error('Failed to delete company'); }
  };

  const openAddLocation = (companyId: string) => {
    setLocationParentId(companyId);
    setEditingLocationId(null);
    setLocationForm(EMPTY_LOCATION);
    setLocationModalOpen(true);
  };

  const openEditLocation = (companyId: string, loc: GBPLocation) => {
    setLocationParentId(companyId);
    setEditingLocationId(loc.id);
    setLocationForm({ address: loc.address, email: loc.email, phone: loc.phone, status: loc.status, notes: loc.notes, googleProfileUrl: loc.googleProfileUrl || '' });
    setLocationModalOpen(true);
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationParentId) return;
    try {
      const row = {
        address: locationForm.address,
        email: locationForm.email,
        phone: locationForm.phone,
        status: locationForm.status,
        notes: locationForm.notes,
        google_profile_url: locationForm.googleProfileUrl || '',
      };
      const parentName = companies.find(c => c.id === locationParentId)?.name || 'Unknown';
      if (editingLocationId) {
        const { error } = await supabase.from('gbp_locations').update(row).eq('id', editingLocationId);
        if (error) throw error;
        toast.success('Location updated');
        logActivity('update', 'location', locationForm.address, `Updated location "${locationForm.address}" in "${parentName}"`);
      } else {
        const { error } = await supabase.from('gbp_locations').insert({ ...row, company_id: locationParentId });
        if (error) throw error;
        toast.success('Location added');
        logActivity('create', 'location', locationForm.address, `Added location "${locationForm.address}" to "${parentName}"`);
      }
      setLocationModalOpen(false);
      fetchCompanies();
    } catch { toast.error('Failed to save location'); }
  };

  const handleDeleteLocation = async (companyId: string, locationId: string) => {
    if (!window.confirm('Delete this location?')) return;
    const company = companies.find(c => c.id === companyId);
    const loc = company?.locations.find(l => l.id === locationId);
    try {
      const { error } = await supabase.from('gbp_locations').delete().eq('id', locationId);
      if (error) throw error;
      toast.success('Location deleted');
      logActivity('delete', 'location', loc?.address || 'Unknown', `Deleted location "${loc?.address || 'Unknown'}" from "${company?.name || 'Unknown'}"`);
      fetchCompanies();
    } catch { toast.error('Failed to delete location'); }
  };

  const openTasksSummary = (loc: GBPLocation) => {
    setTasksModalLocationId(loc.id);
    setTasksModalAddress(loc.address || 'Location');
    setTaskDetailOpen(null);
    setTasksModalOpen(true);
    fetchSeoTasks();
  };

  const openNotesModal = (loc: GBPLocation) => {
    setNotesLocationId(loc.id);
    setNotesLocationAddress(loc.address || 'Location');
    setNotesText(loc.notes || '');
    setNotesModalOpen(true);
  };

  const handleNotesSave = async () => {
    if (!notesLocationId) return;
    try {
      const { error } = await supabase.from('gbp_locations').update({
        notes: notesText,
      }).eq('id', notesLocationId);
      if (error) throw error;
      toast.success('Notes updated');
      logActivity('update', 'location', notesLocationAddress, `Updated notes for location "${notesLocationAddress}"`);
      setNotesModalOpen(false);
      fetchCompanies();
    } catch { toast.error('Failed to save notes'); }
  };


  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.not_started;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  const isFriday = new Date().getDay() === 5;

  const locationHasIncomplete = useCallback((locId: string): boolean => {
    const tasks = seoTasksByLocation.get(locId) || [];
    return DEFAULT_TASK_TITLES.some(title => !tasks.some(t => t.title === title && t.col === 'finished'));
  }, [seoTasksByLocation]);

  const companyHasIncomplete = useCallback((company: GBPCompany): boolean => {
    return company.locations.some(loc => locationHasIncomplete(loc.id));
  }, [locationHasIncomplete]);

  const TasksIndicator = ({ loc }: { loc: GBPLocation }) => {
    const tasks = seoTasksByLocation.get(loc.id) || [];
    const doneCount = DEFAULT_TASK_TITLES.filter(title => tasks.some(t => t.title === title && t.col === 'finished')).length;
    const total = DEFAULT_TASK_TITLES.length;
    const color = tasks.length === 0 || doneCount === 0 ? 'text-red-400 border-red-500/30 bg-red-500/10'
      : doneCount >= total ? 'text-green-400 border-green-500/30 bg-green-500/10'
      : 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${color}`}>
        {isFriday && doneCount < total && <AlertTriangle className="w-3 h-3 text-red-400 animate-blink" />}
        <ClipboardList className="w-3 h-3" />
        {doneCount}/{total}
      </span>
    );
  };

  return (
    <>
      <Helmet><title>{activeTab === 'gbp' ? 'GBP Management' : 'Local SEO Hub'} | Rank Me Higher</title></Helmet>
      <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden mobile-touch-zone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-6">
            <Link
              to={sessionStorage.getItem("rmh_team_session") ? "/team" : "/avaadminpanel"}
              className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white truncate">
                {activeTab === 'gbp' ? 'GBP Management' : 'Local SEO Hub'}
              </h1>
            </div>
            <button
              onClick={() => setActivityLogOpen(true)}
              className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-lg bg-white/5 border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-[#00e5cc] hover:bg-[#00e5cc]/5 hover:border-[#00e5cc]/20 transition-all shrink-0"
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-0.5 mb-6 bg-white/[0.03] rounded-lg p-0.5 w-fit">
            <button
              onClick={() => { setActiveTab('gbp'); fetchSeoTasks(); }}
              className={`px-4 py-2 text-xs font-medium transition-all rounded-md whitespace-nowrap min-h-[36px] ${activeTab === 'gbp' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              GBP Management
            </button>
            <button
              onClick={() => setActiveTab('seo-hub')}
              className={`px-4 py-2 text-xs font-medium transition-all rounded-md whitespace-nowrap min-h-[36px] ${activeTab === 'seo-hub' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Local SEO Hub
            </button>
          </div>

          {activeTab === 'gbp' && (<>
          <div className="bg-[#111118] border border-white/[0.04] rounded-xl p-4 sm:p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div className="flex items-baseline gap-3 flex-1">
                <span className="text-3xl font-bold tabular-nums text-white">{stats.locations}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Total Locations</span>
                <span className="text-xs text-gray-600 ml-auto sm:ml-0">across {stats.companies} companies</span>
              </div>
              {stats.actionRequired > 0 && (
                <button
                  onClick={() => setActionRequiredModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/8 border border-orange-500/20 text-orange-400 hover:bg-orange-500/15 transition-all text-xs font-medium shrink-0"
                >
                  <FileWarning className="w-3.5 h-3.5" />
                  {stats.actionRequired} need attention
                </button>
              )}
            </div>

            {stats.locations > 0 && (
              <div className="space-y-3">
                <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.04]">
                  {stats.verified > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.verified / stats.locations) * 100}%` }} />}
                  {stats.pending > 0 && <div className="bg-amber-500 transition-all" style={{ width: `${(stats.pending / stats.locations) * 100}%` }} />}
                  {stats.processing > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${(stats.processing / stats.locations) * 100}%` }} />}
                  {stats.notStarted > 0 && <div className="bg-gray-600 transition-all" style={{ width: `${(stats.notStarted / stats.locations) * 100}%` }} />}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1">
                  {[
                    { label: 'Verified', count: stats.verified, dot: 'bg-emerald-500' },
                    { label: 'Pending', count: stats.pending, dot: 'bg-amber-500' },
                    { label: 'Processing', count: stats.processing, dot: 'bg-blue-500' },
                    { label: 'Not Started', count: stats.notStarted, dot: 'bg-gray-600' },
                  ].filter(s => s.count > 0).map(s => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className="text-[11px] text-gray-400">{s.label}</span>
                      <span className="text-[11px] text-gray-300 font-medium tabular-nums">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
              <Input
                placeholder="Search companies or addresses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 min-h-[44px] bg-white/[0.03] border-white/[0.06] text-white text-sm placeholder:text-gray-600 focus:border-white/20 focus:ring-0 rounded-lg"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="compact-select w-full sm:w-auto rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 min-h-[44px] text-sm text-gray-400 focus:border-white/20 focus:ring-0 focus:outline-none transition-colors [&>option]:bg-[#111118] [&>option]:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="not_started">Not Started</option>
            </select>
            <Button onClick={openAddCompany} className="w-full sm:w-auto min-h-[44px] h-9 bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/10 text-sm gap-1.5 rounded-lg transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Company
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-xs">Loading...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No companies found</div>
          ) : (
            <div className="space-y-1">
              {filteredCompanies.map(company => {
                const isExpanded = expandedIds.has(company.id);
                const summary = getCompanyStatusSummary(company.locations);
                const statusDots = getCompanyStatusDots(company.locations);
                return (
                  <div key={company.id} id={`company-${company.id}`} className={`border rounded-xl overflow-hidden transition-all ${isExpanded ? 'border-white/[0.08] bg-[#111118]' : 'border-white/[0.04] bg-[#111118]/60 hover:bg-[#111118]'}`}>
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                      onClick={() => toggleExpand(company.id)}
                    >
                      <ChevronRight className={`w-4 h-4 text-gray-600 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      {isFriday && companyHasIncomplete(company) && <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-blink shrink-0" />}
                      <span className="font-medium text-sm text-white flex-1 truncate">{company.name}</span>
                      <div className="hidden sm:flex items-center gap-1.5 mr-2">
                        {statusDots.map(s => (
                          <div key={s.key} className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            <span className="text-[10px] text-gray-500 tabular-nums">{s.count}</span>
                          </div>
                        ))}
                      </div>
                      <span className="sm:hidden text-[10px] text-gray-500">{company.locations.length} loc</span>
                      <span className={`text-[10px] font-medium ${summary.color} hidden sm:inline`}>{summary.label}</span>
                      <div className="flex items-center gap-0.5 ml-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-7 sm:w-7 text-gray-600 hover:text-white" onClick={() => openEditCompany(company)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-11 w-11 sm:h-7 sm:w-7 text-gray-600 hover:text-red-400" onClick={() => handleDeleteCompany(company.id, company.name)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-white/[0.04]">
                        <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/[0.04]">
                                <th className="text-left px-4 py-2 text-gray-600 font-normal text-[10px] uppercase tracking-widest">Address</th>
                                <th className="text-left px-4 py-2 text-gray-600 font-normal text-[10px] uppercase tracking-widest hidden md:table-cell">Email</th>
                                <th className="text-left px-4 py-2 text-gray-600 font-normal text-[10px] uppercase tracking-widest">Phone</th>
                                <th className="text-left px-4 py-2 text-gray-600 font-normal text-[10px] uppercase tracking-widest">Status</th>
                                <th className="text-left px-4 py-2 text-gray-600 font-normal text-[10px] uppercase tracking-widest">Tasks</th>
                                <th className="text-left px-4 py-2 text-gray-600 font-normal text-[10px] uppercase tracking-widest hidden sm:table-cell">Notes</th>
                                <th className="px-4 py-2 w-16"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {company.locations.map(loc => (
                                <tr key={loc.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                  <td className="px-4 py-2.5 whitespace-nowrap">
                                    {loc.googleProfileUrl ? (
                                      <a href={loc.googleProfileUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#00e5cc] text-xs flex items-center gap-1.5 transition-colors">
                                        {loc.address || '—'}
                                        <LinkIcon className="w-2.5 h-2.5 opacity-40" />
                                      </a>
                                    ) : (
                                      <span className="text-gray-300 text-xs">{loc.address || '—'}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 whitespace-nowrap hidden md:table-cell">
                                    <span className="text-gray-500 text-xs">{loc.email || '—'}</span>
                                  </td>
                                  <td className="px-4 py-2.5 whitespace-nowrap">
                                    <span className="text-gray-400 text-xs">{loc.phone || '—'}</span>
                                  </td>
                                  <td className="px-4 py-2.5 whitespace-nowrap"><StatusBadge status={loc.status} /></td>
                                  <td className="px-4 py-2.5 whitespace-nowrap">
                                    <button onClick={() => openTasksSummary(loc)} className="hover:opacity-80 transition-opacity"><TasksIndicator loc={loc} /></button>
                                  </td>
                                  <td className="px-4 py-2.5 whitespace-nowrap hidden sm:table-cell">
                                    <button onClick={() => openNotesModal(loc)} className="text-left hover:opacity-80 transition-opacity group">
                                      {loc.notes ? (
                                        <span className="text-xs text-gray-500 italic group-hover:text-gray-300">{loc.notes}</span>
                                      ) : (
                                        <span className="text-gray-700 text-xs group-hover:text-gray-500">+ note</span>
                                      )}
                                    </button>
                                  </td>
                                  <td className="px-4 py-2.5 whitespace-nowrap">
                                    <div className="flex items-center gap-0.5">
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:text-white" onClick={() => openEditLocation(company.id, loc)}>
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-600 hover:text-red-400" onClick={() => handleDeleteLocation(company.id, loc.id)}>
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="sm:hidden divide-y divide-white/[0.03]">
                          {company.locations.map(loc => (
                            <div key={loc.id} className="px-4 py-3 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  {loc.googleProfileUrl ? (
                                    <a href={loc.googleProfileUrl} target="_blank" rel="noopener noreferrer" className="text-white text-sm font-medium truncate hover:text-[#00e5cc] flex items-center gap-1 transition-colors">
                                      {loc.address || '—'} <LinkIcon className="w-2.5 h-2.5 opacity-40" />
                                    </a>
                                  ) : (
                                    <span className="text-white text-sm font-medium truncate block">{loc.address || '—'}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-11 w-11 text-gray-600 hover:text-gray-300" onClick={() => openNotesModal(loc)} title="Notes">
                                    <StickyNote className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-11 w-11 text-gray-600 hover:text-white" onClick={() => openEditLocation(company.id, loc)}>
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-11 w-11 text-gray-600 hover:text-red-400" onClick={() => handleDeleteLocation(company.id, loc.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center flex-wrap gap-2">
                                <StatusBadge status={loc.status} />
                                <button onClick={() => openTasksSummary(loc)} className="hover:opacity-80 transition-opacity"><TasksIndicator loc={loc} /></button>
                                {loc.phone && (
                                  <span className="text-[10px] text-gray-500">{loc.phone}</span>
                                )}
                              </div>
                              {loc.notes && (
                                <p className="text-xs text-gray-500 italic">{loc.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="px-4 py-2 border-t border-white/[0.04]">
                          <button className="min-h-[44px] text-gray-500 hover:text-white text-xs flex items-center gap-1.5 transition-colors" onClick={() => openAddLocation(company.id)}>
                            <Plus className="w-3 h-3" /> Add Location
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </>)}

          {activeTab === 'seo-hub' && (
            <Suspense fallback={<div className="text-center py-10"><div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-2"></div><p className="text-gray-600 text-xs">Loading...</p></div>}>
              <div className="space-y-8">
                <SOPLibrary />
                <KanbanBoard />
              </div>
            </Suspense>
          )}
        </div>
      </div>

      {actionRequiredModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-mobile-full-wrapper bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="action-required-title"
          onClick={() => setActionRequiredModalOpen(false)}
          onKeyDown={e => { if (e.key === 'Escape') setActionRequiredModalOpen(false); }}
        >
          <div className="modal-mobile-full bg-[#111118] border border-white/[0.06] rounded-xl w-full max-w-lg p-5 sm:p-6 relative max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActionRequiredModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h2 id="action-required-title" className="text-sm font-semibold mb-1 flex items-center gap-2">
              Action Required
            </h2>
            <p className="text-[11px] text-gray-500 mb-4">{stats.actionRequired} location{stats.actionRequired !== 1 ? 's' : ''} need attention</p>
            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {actionRequiredData.map(group => (
                <div key={group.companyId}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-400">{group.companyName}</span>
                    <span className="text-[10px] text-gray-600">{group.locations.length}</span>
                  </div>
                  <div className="space-y-1">
                    {group.locations.map(loc => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                          setExpandedIds(prev => { const next = new Set(prev); next.add(group.companyId); return next; });
                          setActionRequiredModalOpen(false);
                          setTimeout(() => {
                            document.getElementById(`company-${group.companyId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 150);
                        }}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-all group w-full text-left"
                      >
                        <span className="text-xs text-gray-400 truncate group-hover:text-white transition-colors">{loc.address}</span>
                        <StatusBadge status={loc.status} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {actionRequiredData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-400/60" />
                  <p className="text-xs">All locations verified</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {companyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-mobile-full-wrapper bg-black/70 backdrop-blur-sm">
          <div className="modal-mobile-full bg-[#111118] border border-white/[0.06] rounded-xl w-full max-w-md p-5 sm:p-6 relative">
            <button onClick={() => setCompanyModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold mb-4">{editingCompanyId ? 'Edit Company' : 'Add Company'}</h2>
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Company Name</label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="bg-white/[0.03] border-white/[0.06] text-white focus:border-white/20 focus:ring-0 rounded-lg" />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" className="text-gray-500 hover:text-white" onClick={() => setCompanyModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-white/[0.08] border border-white/[0.1] text-white hover:bg-white/[0.12] text-sm transition-all">{editingCompanyId ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-mobile-full-wrapper bg-black/70 backdrop-blur-sm">
          <div className="modal-mobile-full bg-[#111118] border border-white/[0.06] rounded-xl w-full max-w-lg p-5 sm:p-6 relative overflow-y-auto">
            <button onClick={() => setLocationModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold mb-4">{editingLocationId ? 'Edit Location' : 'Add Location'}</h2>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Address</label>
                <Input value={locationForm.address} onChange={e => setLocationForm(f => ({ ...f, address: e.target.value }))} className="bg-white/[0.03] border-white/[0.06] text-white focus:border-white/20 focus:ring-0 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Email</label>
                  <Input value={locationForm.email} onChange={e => setLocationForm(f => ({ ...f, email: e.target.value }))} className="bg-white/[0.03] border-white/[0.06] text-white focus:border-white/20 focus:ring-0 rounded-lg" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Phone</label>
                  <Input value={locationForm.phone} onChange={e => setLocationForm(f => ({ ...f, phone: e.target.value }))} className="bg-white/[0.03] border-white/[0.06] text-white focus:border-white/20 focus:ring-0 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Status</label>
                  <select
                    value={locationForm.status}
                    onChange={e => setLocationForm(f => ({ ...f, status: e.target.value as GBPLocation['status'] }))}
                    className="modal-select w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:border-white/20 focus:ring-0 focus:outline-none transition-colors [&>option]:bg-[#111118] [&>option]:text-white"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="not_started">Not Started</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Notes</label>
                  <Input value={locationForm.notes} onChange={e => setLocationForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/[0.03] border-white/[0.06] text-white focus:border-white/20 focus:ring-0 rounded-lg" placeholder="e.g. Next office" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> Google Profile URL
                </label>
                <Input
                  type="url"
                  value={locationForm.googleProfileUrl || ''}
                  onChange={e => setLocationForm(f => ({ ...f, googleProfileUrl: e.target.value }))}
                  className="bg-white/[0.03] border-white/[0.06] text-white focus:border-white/20 focus:ring-0 rounded-lg"
                  placeholder="https://business.google.com/..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" className="text-gray-500 hover:text-white" onClick={() => setLocationModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-white/[0.08] border border-white/[0.1] text-white hover:bg-white/[0.12] text-sm transition-all">{editingLocationId ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tasksModalOpen && !taskDetailOpen && (() => {
        const tasks = tasksModalLocationId ? (seoTasksByLocation.get(tasksModalLocationId) || []) : [];
        const currentWeek = getMonday();
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-mobile-full-wrapper bg-black/70 backdrop-blur-sm">
            <div className="modal-mobile-full bg-[#111118] border border-white/[0.06] rounded-xl w-full max-w-md p-5 sm:p-6 relative overflow-y-auto">
              <button onClick={() => setTasksModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white">
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-semibold mb-1">Weekly Tasks</h2>
              <p className="text-[10px] text-gray-500 mb-1 truncate">{tasksModalAddress}</p>
              <p className="text-[10px] text-gray-600 mb-4">Week of {currentWeek}</p>

              <div className="space-y-2">
                {DEFAULT_TASK_TITLES.map(title => {
                  const task = tasks.find(t => t.title === title);
                  const isDone = task?.col === 'finished';
                  const inProgress = task?.col === 'in_progress';
                  const config = TASK_DETAIL_CONFIG[title];
                  const Icon = config?.icon || ClipboardList;
                  const parsed = task ? parseTaskNotes(task.notes || '') : null;
                  const statusColor = isDone ? 'text-green-400 border-green-500/30 bg-green-500/10'
                    : inProgress ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                    : 'text-red-400 border-red-500/30 bg-red-500/10';
                  const statusLabel = isDone ? 'Done' : inProgress ? 'In Progress' : task ? 'To Do' : 'Not Started';

                  return (
                    <button
                      key={title}
                      onClick={() => task && setTaskDetailOpen(task)}
                      className={`w-full border rounded-lg p-3 text-left transition-colors ${statusColor} ${task ? 'hover:bg-white/5 cursor-pointer' : 'opacity-60 cursor-default'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isDone ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Circle className="w-4 h-4 text-gray-500" />}
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium text-white">{config?.label || title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {parsed && parsed.count > 0 && (
                            <span className="text-[10px] text-gray-400">{parsed.count}/{config?.targetMin ? `${config.targetMin}-` : ''}{config?.target || '?'}</span>
                          )}
                          {isFriday && !isDone && <AlertTriangle className="w-3 h-3 text-red-400 animate-blink" />}
                          <span className="text-[10px] font-medium">{statusLabel}</span>
                          {task && <ChevronRight className="w-3 h-3 text-gray-500" />}
                        </div>
                      </div>
                      {config && <p className="text-[10px] text-gray-500 mt-1">{config.description}</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {taskDetailOpen && (() => {
        const task = taskDetailOpen;
        const config = TASK_DETAIL_CONFIG[task.title];
        const Icon = config?.icon || ClipboardList;
        const parsed = parseTaskNotes(task.notes || '');
        const isDone = task.col === 'finished';
        const inProgress = task.col === 'in_progress';
        const statusLabel = isDone ? 'Done' : inProgress ? 'In Progress' : 'To Do';
        const statusColor = isDone ? 'text-green-400' : inProgress ? 'text-amber-400' : 'text-red-400';
        const targetLabel = config?.targetMin ? `${config.targetMin}-${config.target}` : `${config?.target || '?'}`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-mobile-full-wrapper bg-black/70 backdrop-blur-sm">
            <div className="modal-mobile-full bg-[#111118] border border-white/[0.06] rounded-xl w-full max-w-md p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => { setTaskDetailOpen(null); }} className="absolute top-4 right-4 text-gray-600 hover:text-white">
                <X className="w-4 h-4" />
              </button>
              <button onClick={() => setTaskDetailOpen(null)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white mb-3">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold">{config?.label || task.title}</h2>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                {config && (
                  <span className="text-xs text-gray-400">
                    {parsed.count}/{targetLabel} completed
                  </span>
                )}
                {config && (
                  <div className="flex-1 bg-white/5 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${isDone ? 'bg-green-500' : parsed.count > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (parsed.count / (config.target || 1)) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {task.due_date && (
                <p className="text-xs text-gray-400 mb-4">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Due: {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              )}

              {parsed.entries.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {config?.entryType === 'url' ? <LinkIcon className="w-3 h-3 text-gray-500" /> : <Hash className="w-3 h-3 text-gray-500" />}
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">{config?.entryLabel || 'Entries'}</span>
                  </div>
                  <div className="space-y-1.5">
                    {parsed.entries.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-600 w-4 text-right shrink-0">{i + 1}.</span>
                        {config?.entryType === 'url' && entry ? (
                          <a href={entry} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 truncate flex-1">
                            {entry}
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300 flex-1">{entry || '—'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsed.freeNotes && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    <StickyNote className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">Notes</span>
                  </div>
                  <p className="text-xs text-gray-300 bg-white/5 border border-white/10 rounded-lg p-3 whitespace-pre-wrap">{parsed.freeNotes}</p>
                </div>
              )}

              {!parsed.entries.length && !parsed.freeNotes && parsed.count === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No data recorded yet for this task.</p>
              )}
            </div>
          </div>
        );
      })()}

      {notesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-mobile-full-wrapper bg-black/70 backdrop-blur-sm">
          <div className="modal-mobile-full bg-[#111118] border border-white/[0.06] rounded-xl w-full max-w-md p-5 sm:p-6 relative">
            <button onClick={() => setNotesModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold mb-1">Notes</h2>
            <p className="text-[10px] text-gray-500 mb-4 truncate">{notesLocationAddress}</p>
            <textarea
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              placeholder="Add notes about this location..."
              rows={6}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-white/20 focus:outline-none resize-none"
            />
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="ghost" className="text-gray-500 hover:text-white" onClick={() => setNotesModalOpen(false)}>Cancel</Button>
              <Button onClick={handleNotesSave} className="bg-white/[0.08] border border-white/[0.1] text-white hover:bg-white/[0.12] text-sm transition-all">Save</Button>
            </div>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <ActivityLogModal open={activityLogOpen} onClose={() => setActivityLogOpen(false)} />
      </Suspense>
    </>
  );
};

export default GBPManagement;
