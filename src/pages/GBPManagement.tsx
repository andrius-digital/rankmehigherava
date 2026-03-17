import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  MapPin, Search, Plus, Pencil, Trash2,
  CheckCircle2, Clock, FileWarning, Circle, AlertTriangle,
  ChevronLeft, ChevronDown, ChevronRight, X, Phone, Mail, Building2, Loader2,
  ClipboardList, Hash, Image, MessageSquare, Star, LinkIcon, StickyNote, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SOPLibrary = lazy(() => import('@/components/SOPLibrary'));
const KanbanBoard = lazy(() => import('@/components/KanbanBoard'));

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
  verified: { label: 'Verified', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Loader2 },
  not_started: { label: 'Not Started', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Circle },
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

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesLocationId, setNotesLocationId] = useState<string | null>(null);
  const [notesLocationAddress, setNotesLocationAddress] = useState('');
  const [notesText, setNotesText] = useState('');

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
      const { data, error } = await supabase
        .from('seo_tasks')
        .select('id, title, col, notes, due_date, location_id')
        .eq('week_of', currentWeek);
      if (error) throw error;
      const map = new Map<string, SEOTaskRow[]>();
      for (const row of (data || [])) {
        if (!row.location_id) continue;
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
      actionRequired: allLocs.filter(l => l.status !== 'verified').length,
    };
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
    if (v === total) return { label: 'All Verified', color: 'text-green-400' };
    if (v === 0) return { label: 'None Verified', color: 'text-red-400' };
    return { label: `${v}/${total} Verified`, color: 'text-amber-400' };
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
      } else {
        const { error } = await supabase.from('gbp_companies').insert({ name: companyName.trim() });
        if (error) throw error;
        toast.success('Company added');
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
      if (editingLocationId) {
        const { error } = await supabase.from('gbp_locations').update(row).eq('id', editingLocationId);
        if (error) throw error;
        toast.success('Location updated');
      } else {
        const { error } = await supabase.from('gbp_locations').insert({ ...row, company_id: locationParentId });
        if (error) throw error;
        toast.success('Location added');
      }
      setLocationModalOpen(false);
      fetchCompanies();
    } catch { toast.error('Failed to save location'); }
  };

  const handleDeleteLocation = async (_companyId: string, locationId: string) => {
    if (!window.confirm('Delete this location?')) return;
    try {
      const { error } = await supabase.from('gbp_locations').delete().eq('id', locationId);
      if (error) throw error;
      toast.success('Location deleted');
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
      <Helmet><title>GBP Management | Rank Me Higher</title></Helmet>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/avaadminpanel">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-orbitron bg-gradient-to-r from-red-500 to-cyan-400 bg-clip-text text-transparent">
                GBP Management
              </h1>
              <p className="text-sm text-gray-400 mt-1">Google Business Profile verification tracker</p>
            </div>
          </div>

          <div className="flex gap-1 mb-6 border-b border-white/10">
            <button
              onClick={() => { setActiveTab('gbp'); fetchSeoTasks(); }}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${activeTab === 'gbp' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                GBP Management
              </div>
              {activeTab === 'gbp' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t" />}
            </button>
            <button
              onClick={() => setActiveTab('seo-hub')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${activeTab === 'seo-hub' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Local SEO Hub
              </div>
              {activeTab === 'seo-hub' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-t" />}
            </button>
          </div>

          {activeTab === 'gbp' && (<>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              { label: 'Companies', value: stats.companies, icon: Building2, color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30' },
              { label: 'Locations', value: stats.locations, icon: MapPin, color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30' },
              { label: 'Verified', value: stats.verified, icon: CheckCircle2, color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
              { label: 'Action Required', value: stats.actionRequired, icon: FileWarning, color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br ${s.color} border rounded-xl p-4 backdrop-blur-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">{s.label}</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search companies or addresses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="not_started">Not Started</option>
            </select>
            <Button onClick={openAddCompany} className="bg-red-600 hover:bg-red-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Company
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading...</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No companies found</div>
          ) : (
            <div className="space-y-2">
              {filteredCompanies.map(company => {
                const isExpanded = expandedIds.has(company.id);
                const summary = getCompanyStatusSummary(company.locations);
                return (
                  <div key={company.id} className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] backdrop-blur-sm">
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => toggleExpand(company.id)}
                    >
                      {isExpanded
                        ? <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                        : <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                      }
                      <Building2 className="w-5 h-5 text-cyan-400 shrink-0" />
                      {isFriday && companyHasIncomplete(company) && <AlertTriangle className="w-4 h-4 text-red-400 animate-blink shrink-0" />}
                      <span className="font-semibold text-white flex-1 truncate">{company.name}</span>
                      <span className="text-xs text-gray-500 hidden sm:inline">{company.locations.length} location{company.locations.length !== 1 ? 's' : ''}</span>
                      <span className={`text-xs font-medium ${summary.color}`}>{summary.label}</span>
                      <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEditCompany(company)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => handleDeleteCompany(company.id, company.name)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-white/10 bg-white/[0.01]">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10">
                                <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Address</th>
                                <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Email</th>
                                <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Phone</th>
                                <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Tasks</th>
                                <th className="text-left px-4 py-2 text-gray-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Notes</th>
                                <th className="px-4 py-2 w-20"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {company.locations.map(loc => (
                                <tr key={loc.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                      {loc.googleProfileUrl ? (
                                        <a
                                          href={loc.googleProfileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-cyan-400 hover:text-cyan-300 text-xs sm:text-sm flex items-center gap-1 hover:underline"
                                        >
                                          {loc.address || '—'}
                                          <LinkIcon className="w-3 h-3 shrink-0 opacity-60" />
                                        </a>
                                      ) : (
                                        <span className="text-gray-300 text-xs sm:text-sm">{loc.address || '—'}</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5 hidden md:table-cell">
                                    {loc.email ? (
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                        <span className="text-gray-400 text-xs">{loc.email}</span>
                                      </div>
                                    ) : <span className="text-gray-600">—</span>}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                      <span className="text-gray-300 text-xs sm:text-sm">{loc.phone}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <StatusBadge status={loc.status} />
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <button
                                      onClick={() => openTasksSummary(loc)}
                                      className="hover:opacity-80 transition-opacity"
                                    >
                                      <TasksIndicator loc={loc} />
                                    </button>
                                  </td>
                                  <td className="px-4 py-2.5 hidden sm:table-cell">
                                    <button
                                      onClick={() => openNotesModal(loc)}
                                      className="text-left hover:opacity-80 transition-opacity group max-w-[200px]"
                                    >
                                      {loc.notes ? (
                                        <span className="text-xs text-amber-400/80 italic truncate block group-hover:text-amber-300">{loc.notes}</span>
                                      ) : (
                                        <span className="text-gray-600 text-xs group-hover:text-gray-400 flex items-center gap-1">
                                          <StickyNote className="w-3 h-3" /> Add note
                                        </span>
                                      )}
                                    </button>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-amber-400 sm:hidden" onClick={() => openNotesModal(loc)} title="Notes">
                                        <StickyNote className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => openEditLocation(company.id, loc)}>
                                        <Pencil className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-400" onClick={() => handleDeleteLocation(company.id, loc.id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-4 py-2 border-t border-white/5">
                          <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 gap-1.5 text-xs" onClick={() => openAddLocation(company.id)}>
                            <Plus className="w-3.5 h-3.5" /> Add Location
                          </Button>
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
            <Suspense fallback={<div className="text-center py-10 text-gray-500">Loading...</div>}>
              <div className="space-y-8">
                <SOPLibrary />
                <KanbanBoard />
              </div>
            </Suspense>
          )}
        </div>
      </div>

      {companyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setCompanyModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">{editingCompanyId ? 'Edit Company' : 'Add Company'}</h2>
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Company Name</label>
                <Input value={companyName} onChange={e => setCompanyName(e.target.value)} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setCompanyModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">{editingCompanyId ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setLocationModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">{editingLocationId ? 'Edit Location' : 'Add Location'}</h2>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Address</label>
                <Input value={locationForm.address} onChange={e => setLocationForm(f => ({ ...f, address: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email</label>
                  <Input value={locationForm.email} onChange={e => setLocationForm(f => ({ ...f, email: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Phone</label>
                  <Input value={locationForm.phone} onChange={e => setLocationForm(f => ({ ...f, phone: e.target.value }))} className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select
                    value={locationForm.status}
                    onChange={e => setLocationForm(f => ({ ...f, status: e.target.value as GBPLocation['status'] }))}
                    className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="not_started">Not Started</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Notes</label>
                  <Input value={locationForm.notes} onChange={e => setLocationForm(f => ({ ...f, notes: e.target.value }))} className="bg-white/5 border-white/10 text-white" placeholder="e.g. Next office" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> Google Profile URL
                </label>
                <Input
                  type="url"
                  value={locationForm.googleProfileUrl || ''}
                  onChange={e => setLocationForm(f => ({ ...f, googleProfileUrl: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="https://business.google.com/..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="ghost" onClick={() => setLocationModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">{editingLocationId ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tasksModalOpen && !taskDetailOpen && (() => {
        const tasks = tasksModalLocationId ? (seoTasksByLocation.get(tasksModalLocationId) || []) : [];
        const currentWeek = getMonday();
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
              <button onClick={() => setTasksModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold">Weekly Tasks</h2>
              </div>
              <p className="text-xs text-gray-500 mb-1 truncate">{tasksModalAddress}</p>
              <p className="text-xs text-gray-400 mb-4">Week of {currentWeek}</p>

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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => { setTaskDetailOpen(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <button onClick={() => setTaskDetailOpen(null)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-3">
                <ChevronLeft className="w-3 h-3" /> Back to summary
              </button>

              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold">{config?.label || task.title}</h2>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setNotesModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <StickyNote className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold">Location Notes</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4 truncate">{notesLocationAddress}</p>
            <textarea
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              placeholder="Add notes about this location..."
              rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/50 focus:outline-none resize-none"
            />
            <div className="flex gap-3 justify-end mt-4">
              <Button type="button" variant="ghost" onClick={() => setNotesModalOpen(false)}>Cancel</Button>
              <Button onClick={handleNotesSave} className="bg-red-600 hover:bg-red-700">Save</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GBPManagement;
