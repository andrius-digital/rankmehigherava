import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  MapPin, Search, Plus, Pencil, Trash2,
  CheckCircle2, Clock, Circle, AlertTriangle,
  ChevronLeft, ChevronRight, X, Phone, Building2, Loader2,
  ClipboardList, Hash, Image, MessageSquare, Star, LinkIcon, StickyNote, Activity,
  Layout, RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logActivity } from '@/utils/activityLog';
import HUDOverlay from '@/components/ui/HUDOverlay';

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
  not_started: { label: 'Not Started', color: 'bg-slate-500/[0.03] text-slate-500 border-slate-500/15', icon: Circle },
};

const EMPTY_LOCATION: Omit<GBPLocation, 'id'> = {
  address: '', email: '', phone: '', status: 'not_started', notes: '', googleProfileUrl: '',
};

const StatusBadge: React.FC<{
  status: string;
  locationId?: string;
  editable?: boolean;
  onStatusChange?: (locationId: string, newStatus: GBPLocation['status']) => void;
}> = ({ status, locationId, editable = false, onStatusChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.not_started;
  const Icon = cfg.icon;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!editable || !locationId || !onStatusChange) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-orbitron font-medium uppercase tracking-widest border ${cfg.color}`}>
        <Icon className="w-2.5 h-2.5" />
        {cfg.label}
      </span>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-orbitron font-medium uppercase tracking-widest border cursor-pointer hover:opacity-80 transition-opacity ${cfg.color}`}
      >
        <Icon className="w-2.5 h-2.5" />
        {cfg.label}
        <ChevronLeft className={`w-2 h-2 transition-transform ${open ? '-rotate-90' : 'rotate-0'}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 left-0 w-36 bg-[#1a1a24] border border-white/10 rounded-lg shadow-xl shadow-black/40 overflow-hidden">
          {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(key => {
            const c = STATUS_CONFIG[key];
            const Ic = c.icon;
            const active = key === status;
            return (
              <button
                key={key}
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (key !== status) onStatusChange(locationId, key);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-[9px] font-orbitron uppercase tracking-wider transition-colors text-left ${active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Ic className="w-3 h-3" />
                {c.label}
                {active && <CheckCircle2 className="w-3 h-3 text-cyan-400 ml-auto" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const companyScrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) ref.current.scrollBy({ left: -320, behavior: 'smooth' });
  };
  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) ref.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

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


  const handleStatusChange = useCallback(async (locationId: string, newStatus: GBPLocation['status']) => {
    try {
      const { error } = await supabase.from('gbp_locations').update({ status: newStatus }).eq('id', locationId);
      if (error) throw error;
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
      fetchCompanies();
    } catch { toast.error('Failed to update status'); }
  }, [fetchCompanies]);

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
    const color = tasks.length === 0 || doneCount === 0 ? 'text-red-400 border-red-500/20 bg-red-500/[0.03]'
      : doneCount >= total ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.03]'
      : 'text-amber-400 border-amber-500/20 bg-amber-500/[0.03]';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-orbitron font-medium uppercase tracking-widest border ${color}`}>
        {isFriday && doneCount < total && <AlertTriangle className="w-2.5 h-2.5 text-red-400 animate-blink" />}
        <ClipboardList className="w-2.5 h-2.5" />
        {doneCount}/{total}
      </span>
    );
  };

  return (
    <>
      <Helmet><title>{activeTab === 'gbp' ? 'GBP Management' : 'Local SEO Hub'} | Rank Me Higher</title></Helmet>
      <div className="min-h-screen bg-background relative overflow-hidden mobile-touch-zone">
        <HUDOverlay />
        <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-orbitron text-[10px] tracking-[0.2em] text-cyan-400 uppercase">
                    {activeTab === 'gbp' ? 'Verification Tracker' : 'SEO Operations'}
                  </span>
                </div>
                <h1 className="font-orbitron text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {activeTab === 'gbp' ? 'GBP MANAGEMENT' : 'LOCAL SEO HUB'}
                </h1>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <Link
                  to={sessionStorage.getItem("rmh_team_session") ? "/team" : "/avaadminpanel"}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.15] transition-all font-orbitron text-[8px] uppercase tracking-widest text-slate-400 hover:text-white"
                >
                  <Layout className="w-2.5 h-2.5" />
                  AVA Admin
                </Link>
                <button
                  onClick={() => { fetchCompanies(); fetchSeoTasks(); }}
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.15] transition-all text-slate-500 hover:text-white"
                  title="Refresh"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setActivityLogOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] hover:bg-cyan-500/[0.12] hover:border-cyan-500/30 transition-all font-orbitron text-[8px] uppercase tracking-widest text-cyan-400"
                >
                  <Activity className="w-2.5 h-2.5" />
                  Activity
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-0.5 mb-6 rounded-lg bg-white/[0.03] border border-white/[0.06] p-0.5 w-fit">
            <button
              onClick={() => { setActiveTab('gbp'); fetchSeoTasks(); }}
              className={`px-3 py-1.5 font-orbitron text-[8px] uppercase tracking-widest transition-all rounded-md whitespace-nowrap min-h-[32px] ${activeTab === 'gbp' ? 'bg-cyan-500/[0.12] border border-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
            >
              GBP Management
            </button>
            <button
              onClick={() => setActiveTab('seo-hub')}
              className={`px-3 py-1.5 font-orbitron text-[8px] uppercase tracking-widest transition-all rounded-md whitespace-nowrap min-h-[32px] ${activeTab === 'seo-hub' ? 'bg-cyan-500/[0.12] border border-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
            >
              Local SEO Hub
            </button>
          </div>

          {activeTab === 'gbp' && (<>
          <div className="mb-6 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {[
                { label: 'Companies', value: stats.companies, icon: Building2, filterKey: 'all', card: 'border-cyan-500/15 bg-cyan-500/[0.03] hover:border-cyan-500/30', activeBorder: 'ring-2 ring-cyan-400/60 border-cyan-400/60', iconCls: 'text-cyan-400/60', valCls: 'text-cyan-400' },
                { label: 'Locations', value: stats.locations, icon: MapPin, filterKey: 'all', card: 'border-cyan-500/15 bg-cyan-500/[0.03] hover:border-cyan-500/30', activeBorder: 'ring-2 ring-cyan-400/60 border-cyan-400/60', iconCls: 'text-cyan-400/60', valCls: 'text-cyan-400' },
                { label: 'Verified', value: stats.verified, icon: CheckCircle2, filterKey: 'verified', card: 'border-emerald-500/15 bg-emerald-500/[0.03] hover:border-emerald-500/30', activeBorder: 'ring-2 ring-emerald-400/60 border-emerald-400/60', iconCls: 'text-emerald-400/60', valCls: 'text-emerald-400' },
                { label: 'Pending', value: stats.pending, icon: Clock, filterKey: 'pending', card: 'border-amber-500/15 bg-amber-500/[0.03] hover:border-amber-500/30', activeBorder: 'ring-2 ring-amber-400/60 border-amber-400/60', iconCls: 'text-amber-400/60', valCls: 'text-amber-400' },
                { label: 'Processing', value: stats.processing, icon: Loader2, filterKey: 'processing', card: 'border-blue-500/15 bg-blue-500/[0.03] hover:border-blue-500/30', activeBorder: 'ring-2 ring-blue-400/60 border-blue-400/60', iconCls: 'text-blue-400/60', valCls: 'text-blue-400' },
                { label: 'Not Started', value: stats.notStarted, icon: Circle, filterKey: 'not_started', card: 'border-slate-500/15 bg-slate-500/[0.03] hover:border-slate-500/30', activeBorder: 'ring-2 ring-slate-400/60 border-slate-400/60', iconCls: 'text-slate-400/60', valCls: 'text-slate-400' },
              ].map(({ label, value, icon: Icon, filterKey, card, activeBorder, iconCls, valCls }) => {
                const isActive = filterKey === 'all' ? statusFilter === 'all' : statusFilter === filterKey;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (filterKey === 'all') {
                        setStatusFilter('all');
                      } else {
                        setStatusFilter(prev => prev === filterKey ? 'all' : filterKey);
                      }
                    }}
                    className={`rounded-xl border p-2.5 transition-all text-left cursor-pointer ${card} ${isActive ? activeBorder : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-3 h-3 ${iconCls}`} />
                      <span className={`font-orbitron text-base font-bold ${valCls}`}>{value}</span>
                    </div>
                    <p className="text-[7px] font-orbitron text-slate-500 uppercase tracking-widest">{label}</p>
                  </button>
                );
              })}
            </div>

            {stats.locations > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-orbitron text-slate-500 uppercase tracking-widest">Verification Progress</span>
                  {stats.actionRequired > 0 && (
                    <button
                      onClick={() => setActionRequiredModalOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-orange-500/20 bg-orange-500/[0.06] hover:bg-orange-500/[0.12] hover:border-orange-500/30 transition-all font-orbitron text-[8px] uppercase tracking-widest text-orange-400"
                    >
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {stats.actionRequired} Need Attention
                    </button>
                  )}
                </div>
                <div className="flex h-1.5 rounded-full overflow-hidden bg-white/[0.04] mb-2">
                  {stats.verified > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.verified / stats.locations) * 100}%` }} />}
                  {stats.pending > 0 && <div className="bg-amber-500 transition-all" style={{ width: `${(stats.pending / stats.locations) * 100}%` }} />}
                  {stats.processing > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${(stats.processing / stats.locations) * 100}%` }} />}
                  {stats.notStarted > 0 && <div className="bg-slate-600 transition-all" style={{ width: `${(stats.notStarted / stats.locations) * 100}%` }} />}
                </div>
                <div className="flex items-center gap-4">
                  {[
                    { label: 'Verified', count: stats.verified, dotCls: 'bg-emerald-500', valCls: 'text-emerald-400' },
                    { label: 'Pending', count: stats.pending, dotCls: 'bg-amber-500', valCls: 'text-amber-400' },
                    { label: 'Processing', count: stats.processing, dotCls: 'bg-blue-500', valCls: 'text-blue-400' },
                    { label: 'Not Started', count: stats.notStarted, dotCls: 'bg-slate-600', valCls: 'text-slate-400' },
                  ].filter(s => s.count > 0).map(s => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.dotCls}`} />
                      <span className="text-[8px] font-orbitron text-slate-500 uppercase tracking-wider">{s.label}</span>
                      <span className={`text-[9px] font-orbitron font-bold ${s.valCls}`}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search companies or addresses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-9 min-h-[44px] bg-card/40 border-cyan-500/30 focus:border-cyan-400/60 font-orbitron text-xs placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="compact-select w-full sm:w-auto rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2 min-h-[44px] text-xs font-orbitron text-slate-400 focus:border-cyan-500/30 focus:ring-0 focus:outline-none transition-colors [&>option]:bg-card [&>option]:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="not_started">Not Started</option>
            </select>
            <button onClick={openAddCompany} className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] hover:bg-cyan-500/[0.12] hover:border-cyan-500/30 transition-all font-orbitron text-[8px] uppercase tracking-widest text-cyan-400">
              <Plus className="w-2.5 h-2.5" /> Add Company
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-xs font-orbitron">Loading...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-20 text-slate-500 font-orbitron text-xs">No companies found</div>
          ) : (<>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h2 className="font-orbitron text-lg font-bold text-foreground">Companies</h2>
                  <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-orbitron text-[8px] px-1.5 py-0.5 rounded-md">
                    {filteredCompanies.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Scroll companies left"
                    onClick={() => scrollLeft(companyScrollRef)}
                    className="p-1.5 rounded-lg bg-card/40 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button
                    aria-label="Scroll companies right"
                    onClick={() => scrollRight(companyScrollRef)}
                    className="p-1.5 rounded-lg bg-card/40 border border-cyan-500/20 hover:border-cyan-500/50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>

              <div
                ref={companyScrollRef}
                className="flex gap-4 overflow-x-auto pt-4 pl-4 pb-2 -ml-4 -mt-2 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredCompanies.map(company => {
                  const summary = getCompanyStatusSummary(company.locations);
                  const statusDots = getCompanyStatusDots(company.locations);
                  const isSelected = selectedCompanyId === company.id;
                  return (
                    <div key={company.id} id={`company-${company.id}`} className={`relative group flex-shrink-0 w-[280px] snap-start ${isSelected ? 'ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-background rounded-xl' : ''}`}>
                      {isFriday && companyHasIncomplete(company) && (
                        <div className="absolute -top-2 -left-2 z-20 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50 border-2 border-background">
                          !
                        </div>
                      )}
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${company.name} locations`}
                        onClick={() => setSelectedCompanyId(isSelected ? null : company.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedCompanyId(isSelected ? null : company.id); } }}
                        className={`block h-full bg-gradient-to-br from-card/40 via-card/20 to-transparent backdrop-blur-xl border rounded-xl p-4 hover:border-cyan-400/60 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer ${isSelected ? 'border-cyan-400/60 shadow-lg shadow-cyan-500/20' : 'border-cyan-500/30'}`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-[8px] font-orbitron font-medium uppercase tracking-widest ${summary.color}`}>{summary.label}</span>
                            <h3 className="font-orbitron font-bold text-sm text-foreground truncate">
                              {company.name}
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {statusDots.map(s => (
                            <span key={s.key} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-orbitron text-muted-foreground">
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                              {s.count} {s.key}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                            {company.locations.length} location{company.locations.length !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1 text-cyan-400 font-orbitron font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            View <ChevronRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          aria-label={`Edit ${company.name}`}
                          onClick={(e) => { e.stopPropagation(); openEditCompany(company); }}
                          className="p-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
                        >
                          <Pencil className="w-3 h-3 text-slate-400" />
                        </button>
                        <button
                          aria-label={`Delete ${company.name}`}
                          onClick={(e) => { e.stopPropagation(); handleDeleteCompany(company.id, company.name); }}
                          className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedCompanyId && (() => {
              const company = filteredCompanies.find(c => c.id === selectedCompanyId);
              if (!company) return null;
              return (
                <div className="rounded-xl border border-cyan-500/20 bg-card/40 overflow-hidden mb-6">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/10">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-orbitron font-bold text-sm text-foreground">{company.name}</h3>
                      <span className="text-[8px] font-orbitron text-slate-500">{company.locations.length} location{company.locations.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openAddLocation(company.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] hover:bg-cyan-500/[0.12] hover:border-cyan-500/30 transition-all font-orbitron text-[8px] uppercase tracking-widest text-cyan-400"
                      >
                        <Plus className="w-2.5 h-2.5" /> Add Location
                      </button>
                      <button onClick={() => setSelectedCompanyId(null)} className="p-1 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-white transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.04]">
                          <th className="text-left px-4 py-2 text-[7px] font-orbitron text-slate-500 uppercase tracking-widest">Address</th>
                          <th className="text-left px-4 py-2 text-[7px] font-orbitron text-slate-500 uppercase tracking-widest hidden md:table-cell">Email</th>
                          <th className="text-left px-4 py-2 text-[7px] font-orbitron text-slate-500 uppercase tracking-widest">Phone</th>
                          <th className="text-left px-4 py-2 text-[7px] font-orbitron text-slate-500 uppercase tracking-widest">Status</th>
                          <th className="text-left px-4 py-2 text-[7px] font-orbitron text-slate-500 uppercase tracking-widest">Tasks</th>
                          <th className="text-left px-4 py-2 text-[7px] font-orbitron text-slate-500 uppercase tracking-widest hidden lg:table-cell">Notes</th>
                          <th className="px-3 py-2 w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.locations.map(loc => (
                          <tr key={loc.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-2 whitespace-nowrap">
                              {loc.googleProfileUrl ? (
                                <a href={loc.googleProfileUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors">
                                  {loc.address || '—'}
                                  <LinkIcon className="w-2.5 h-2.5 opacity-50" />
                                </a>
                              ) : (
                                <span className="text-foreground text-xs">{loc.address || '—'}</span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap hidden md:table-cell">
                              <span className="text-muted-foreground text-xs">{loc.email || '—'}</span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className="text-muted-foreground text-xs">{loc.phone || '—'}</span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap"><StatusBadge status={loc.status} locationId={loc.id} editable onStatusChange={handleStatusChange} /></td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <button onClick={() => openTasksSummary(loc)} className="hover:opacity-80 transition-opacity"><TasksIndicator loc={loc} /></button>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap hidden lg:table-cell">
                              <button onClick={() => openNotesModal(loc)} className="text-left hover:opacity-80 transition-opacity group">
                                {loc.notes ? (
                                  <span className="text-xs text-muted-foreground italic group-hover:text-foreground">{loc.notes}</span>
                                ) : (
                                  <span className="text-slate-700 text-xs group-hover:text-slate-500">+ note</span>
                                )}
                              </button>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center gap-0.5">
                                <button className="p-1 rounded hover:bg-white/[0.05] text-slate-600 hover:text-white transition-all" onClick={() => openEditLocation(company.id, loc)}>
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button className="p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all" onClick={() => handleDeleteLocation(company.id, loc.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="sm:hidden divide-y divide-white/[0.03]">
                    {company.locations.map(loc => (
                      <div key={loc.id} className="px-4 py-2.5 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            {loc.googleProfileUrl ? (
                              <a href={loc.googleProfileUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs font-medium truncate hover:text-cyan-300 flex items-center gap-1 transition-colors">
                                {loc.address || '—'} <LinkIcon className="w-2.5 h-2.5 opacity-50" />
                              </a>
                            ) : (
                              <span className="text-foreground text-xs font-medium truncate block">{loc.address || '—'}</span>
                            )}
                          </div>
                          <div className="flex items-center shrink-0">
                            <button className="p-1.5 rounded hover:bg-white/[0.05] text-slate-600 hover:text-slate-300 transition-all" onClick={() => openNotesModal(loc)}>
                              <StickyNote className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-white/[0.05] text-slate-600 hover:text-white transition-all" onClick={() => openEditLocation(company.id, loc)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all" onClick={() => handleDeleteLocation(company.id, loc.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5">
                          <StatusBadge status={loc.status} locationId={loc.id} editable onStatusChange={handleStatusChange} />
                          <button onClick={() => openTasksSummary(loc)} className="hover:opacity-80 transition-opacity"><TasksIndicator loc={loc} /></button>
                          {loc.phone && <span className="text-[8px] font-orbitron text-slate-500">{loc.phone}</span>}
                        </div>
                        {loc.notes && <p className="text-xs text-muted-foreground italic">{loc.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
          )}
          </>)}

          {activeTab === 'seo-hub' && (
            <Suspense fallback={<div className="text-center py-10"><RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" /><p className="text-slate-500 text-xs font-orbitron">Loading...</p></div>}>
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
          <div className="modal-mobile-full bg-card border border-cyan-500/20 rounded-xl w-full max-w-lg p-5 sm:p-6 relative max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActionRequiredModalOpen(false)} className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 id="action-required-title" className="font-orbitron text-sm font-bold text-foreground mb-1 flex items-center gap-2">
              Action Required
            </h2>
            <p className="text-[9px] font-orbitron text-slate-500 uppercase tracking-widest mb-4">{stats.actionRequired} location{stats.actionRequired !== 1 ? 's' : ''} need attention</p>
            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {actionRequiredData.map(group => (
                <div key={group.companyId}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-orbitron font-bold text-foreground">{group.companyName}</span>
                    <span className="text-[9px] font-orbitron text-slate-500">{group.locations.length}</span>
                  </div>
                  <div className="space-y-1">
                    {group.locations.map(loc => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                          setSelectedCompanyId(group.companyId);
                          setActionRequiredModalOpen(false);
                          setTimeout(() => {
                            document.getElementById(`company-${group.companyId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 150);
                        }}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-white/[0.04] hover:border-cyan-500/20 hover:bg-white/[0.03] cursor-pointer transition-all group w-full text-left"
                      >
                        <span className="text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">{loc.address}</span>
                        <StatusBadge status={loc.status} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {actionRequiredData.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-400/60" />
                  <p className="text-xs font-orbitron text-slate-500">All locations verified</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {companyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-mobile-full-wrapper bg-black/70 backdrop-blur-sm">
          <div className="modal-mobile-full bg-card border border-cyan-500/20 rounded-xl w-full max-w-md p-5 sm:p-6 relative">
            <button onClick={() => setCompanyModalOpen(false)} className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-orbitron text-sm font-bold text-foreground mb-4">{editingCompanyId ? 'Edit Company' : 'Add Company'}</h2>
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-[7px] font-orbitron text-slate-500 uppercase tracking-widest mb-1">Company Name</label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="bg-card/40 border-cyan-500/30 focus:border-cyan-400/60 text-foreground rounded-lg" />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-all font-orbitron text-[8px] uppercase tracking-widest text-slate-400 hover:text-white" onClick={() => setCompanyModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] hover:bg-cyan-500/[0.12] hover:border-cyan-500/30 transition-all font-orbitron text-[8px] uppercase tracking-widest text-cyan-400">{editingCompanyId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-mobile-full-wrapper bg-black/70 backdrop-blur-sm">
          <div className="modal-mobile-full bg-card border border-cyan-500/20 rounded-xl w-full max-w-lg p-5 sm:p-6 relative overflow-y-auto">
            <button onClick={() => setLocationModalOpen(false)} className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-orbitron text-sm font-bold text-foreground mb-4">{editingLocationId ? 'Edit Location' : 'Add Location'}</h2>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="block text-[7px] font-orbitron text-slate-500 uppercase tracking-widest mb-1">Address</label>
                <Input value={locationForm.address} onChange={e => setLocationForm(f => ({ ...f, address: e.target.value }))} className="bg-card/40 border-cyan-500/30 focus:border-cyan-400/60 text-foreground rounded-lg" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[7px] font-orbitron text-slate-500 uppercase tracking-widest mb-1">Email</label>
                  <Input value={locationForm.email} onChange={e => setLocationForm(f => ({ ...f, email: e.target.value }))} className="bg-card/40 border-cyan-500/30 focus:border-cyan-400/60 text-foreground rounded-lg" />
                </div>
                <div>
                  <label className="block text-[7px] font-orbitron text-slate-500 uppercase tracking-widest mb-1">Phone</label>
                  <Input value={locationForm.phone} onChange={e => setLocationForm(f => ({ ...f, phone: e.target.value }))} className="bg-card/40 border-cyan-500/30 focus:border-cyan-400/60 text-foreground rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[7px] font-orbitron text-slate-500 uppercase tracking-widest mb-1">Status</label>
                  <select
                    value={locationForm.status}
                    onChange={e => setLocationForm(f => ({ ...f, status: e.target.value as GBPLocation['status'] }))}
                    className="modal-select w-full bg-card/40 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-foreground focus:border-cyan-400/60 focus:ring-0 focus:outline-none transition-colors [&>option]:bg-card [&>option]:text-foreground"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="not_started">Not Started</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[7px] font-orbitron text-slate-500 uppercase tracking-widest mb-1">Notes</label>
                  <Input value={locationForm.notes} onChange={e => setLocationForm(f => ({ ...f, notes: e.target.value }))} className="bg-card/40 border-cyan-500/30 focus:border-cyan-400/60 text-foreground rounded-lg" placeholder="e.g. Next office" />
                </div>
              </div>
              <div>
                <label className="block text-[7px] font-orbitron text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> Google Profile URL
                </label>
                <Input
                  type="url"
                  value={locationForm.googleProfileUrl || ''}
                  onChange={e => setLocationForm(f => ({ ...f, googleProfileUrl: e.target.value }))}
                  className="bg-card/40 border-cyan-500/30 focus:border-cyan-400/60 text-foreground rounded-lg"
                  placeholder="https://business.google.com/..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-all font-orbitron text-[8px] uppercase tracking-widest text-slate-400 hover:text-white" onClick={() => setLocationModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] hover:bg-cyan-500/[0.12] hover:border-cyan-500/30 transition-all font-orbitron text-[8px] uppercase tracking-widest text-cyan-400">{editingLocationId ? 'Update' : 'Add'}</button>
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
            <div className="modal-mobile-full bg-card border border-cyan-500/20 rounded-xl w-full max-w-md p-5 sm:p-6 relative overflow-y-auto">
              <button onClick={() => setTasksModalOpen(false)} className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              <h2 className="font-orbitron text-sm font-bold text-foreground mb-1">Weekly Tasks</h2>
              <p className="text-[9px] font-orbitron text-slate-500 mb-1 truncate">{tasksModalAddress}</p>
              <p className="text-[9px] font-orbitron text-slate-600 uppercase tracking-widest mb-4">Week of {currentWeek}</p>

              <div className="space-y-2">
                {DEFAULT_TASK_TITLES.map(title => {
                  const task = tasks.find(t => t.title === title);
                  const isDone = task?.col === 'finished';
                  const inProgress = task?.col === 'in_progress';
                  const config = TASK_DETAIL_CONFIG[title];
                  const Icon = config?.icon || ClipboardList;
                  const parsed = task ? parseTaskNotes(task.notes || '') : null;
                  const statusColor = isDone ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.03]'
                    : inProgress ? 'text-amber-400 border-amber-500/20 bg-amber-500/[0.03]'
                    : 'text-red-400 border-red-500/20 bg-red-500/[0.03]';
                  const statusLabel = isDone ? 'Done' : inProgress ? 'In Progress' : task ? 'To Do' : 'Not Started';

                  return (
                    <button
                      key={title}
                      onClick={() => task && setTaskDetailOpen(task)}
                      className={`w-full border rounded-xl p-3 text-left transition-all ${statusColor} ${task ? 'hover:bg-white/[0.03] cursor-pointer' : 'opacity-60 cursor-default'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Circle className="w-3.5 h-3.5 text-slate-600" />}
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-xs font-orbitron font-bold text-foreground">{config?.label || title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {parsed && parsed.count > 0 && (
                            <span className="text-[9px] font-orbitron text-slate-500">{parsed.count}/{config?.targetMin ? `${config.targetMin}-` : ''}{config?.target || '?'}</span>
                          )}
                          {isFriday && !isDone && <AlertTriangle className="w-3 h-3 text-red-400 animate-blink" />}
                          <span className="text-[8px] font-orbitron font-medium uppercase tracking-widest">{statusLabel}</span>
                          {task && <ChevronRight className="w-3 h-3 text-slate-600" />}
                        </div>
                      </div>
                      {config && <p className="text-[8px] font-orbitron text-slate-500 mt-1 uppercase tracking-wider">{config.description}</p>}
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
            <div className="modal-mobile-full bg-card border border-cyan-500/20 rounded-xl w-full max-w-md p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => { setTaskDetailOpen(null); }} className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              <button onClick={() => setTaskDetailOpen(null)} className="flex items-center gap-1 text-[8px] font-orbitron text-slate-500 hover:text-white uppercase tracking-widest mb-3 transition-colors">
                <ChevronLeft className="w-3 h-3" /> Back
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-cyan-400/60" />
                <h2 className="font-orbitron text-sm font-bold text-foreground">{config?.label || task.title}</h2>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[9px] font-orbitron font-medium uppercase tracking-widest ${statusColor}`}>{statusLabel}</span>
                {config && (
                  <span className="text-[9px] font-orbitron text-slate-500">
                    {parsed.count}/{targetLabel} completed
                  </span>
                )}
                {config && (
                  <div className="flex-1 bg-white/[0.04] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${isDone ? 'bg-emerald-500' : parsed.count > 0 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, (parsed.count / (config.target || 1)) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {task.due_date && (
                <p className="text-[9px] font-orbitron text-slate-500 mb-4">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Due: {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              )}

              {parsed.entries.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {config?.entryType === 'url' ? <LinkIcon className="w-3 h-3 text-slate-500" /> : <Hash className="w-3 h-3 text-slate-500" />}
                    <span className="text-[7px] font-orbitron text-slate-500 uppercase tracking-widest">{config?.entryLabel || 'Entries'}</span>
                  </div>
                  <div className="space-y-1.5">
                    {parsed.entries.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[9px] font-orbitron text-slate-600 w-4 text-right shrink-0">{i + 1}.</span>
                        {config?.entryType === 'url' && entry ? (
                          <a href={entry} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 truncate flex-1">
                            {entry}
                          </a>
                        ) : (
                          <span className="text-xs text-foreground/70 flex-1">{entry || '—'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsed.freeNotes && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    <StickyNote className="w-3 h-3 text-slate-500" />
                    <span className="text-[7px] font-orbitron text-slate-500 uppercase tracking-widest">Notes</span>
                  </div>
                  <p className="text-xs text-foreground/70 bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 whitespace-pre-wrap">{parsed.freeNotes}</p>
                </div>
              )}

              {!parsed.entries.length && !parsed.freeNotes && parsed.count === 0 && (
                <p className="text-xs font-orbitron text-slate-500 text-center py-4">No data recorded yet for this task.</p>
              )}
            </div>
          </div>
        );
      })()}

      {notesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-mobile-full-wrapper bg-black/70 backdrop-blur-sm">
          <div className="modal-mobile-full bg-card border border-cyan-500/20 rounded-xl w-full max-w-md p-5 sm:p-6 relative">
            <button onClick={() => setNotesModalOpen(false)} className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
            <h2 className="font-orbitron text-sm font-bold text-foreground mb-1">Notes</h2>
            <p className="text-[9px] font-orbitron text-slate-500 mb-4 truncate">{notesLocationAddress}</p>
            <textarea
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              placeholder="Add notes about this location..."
              rows={6}
              className="w-full bg-card/40 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-400/60 focus:outline-none resize-none"
            />
            <div className="flex gap-3 justify-end mt-4">
              <button type="button" className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] transition-all font-orbitron text-[8px] uppercase tracking-widest text-slate-400 hover:text-white" onClick={() => setNotesModalOpen(false)}>Cancel</button>
              <button onClick={handleNotesSave} className="px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] hover:bg-cyan-500/[0.12] hover:border-cyan-500/30 transition-all font-orbitron text-[8px] uppercase tracking-widest text-cyan-400">Save</button>
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
