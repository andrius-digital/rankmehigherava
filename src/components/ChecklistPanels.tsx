import React, { useState, useEffect } from 'react';
import {
    Globe, Server, Mail, Shield, Link2, Plus, Trash2, ExternalLink,
    Send, Zap, CheckCircle2, XCircle, AlertCircle, Search, FileText,
    ChevronDown, ChevronRight, X
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// ═══════════════════════════════════════════
// JSON Helpers
// ═══════════════════════════════════════════

export function parseChecklistNotes<T>(notes: string, defaultValue: T): T {
    if (!notes) return defaultValue;
    try {
        const parsed = JSON.parse(notes);
        return { ...defaultValue, ...parsed };
    } catch {
        return defaultValue;
    }
}

export function serializeChecklistNotes<T>(data: T): string {
    return JSON.stringify(data);
}

// ═══════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════

export interface DnsAccessData {
    nameservers_pointing_to_agency: boolean;
    has_domain_access: boolean;
    access_email: string;
    access_type: string;
    registrar: string;
    notes: string;
}

export interface UpgradesRateData {
    hourly_rate: number;
    notes: string;
}

export interface AiUsageEntry {
    id: string;
    month: string;
    cumulative_total: number;
    monthly_increment: number;
    cc_fee: number;
    amount_to_charge: number;
    paid: boolean;
}

export interface AiUsageData {
    entries: AiUsageEntry[];
    notes: string;
}

export interface TelegramLeadChannel {
    id: string;
    name: string;
    type: string;
    telegram_channel: string;
}

export interface TelegramLeadsData {
    channels: TelegramLeadChannel[];
    notes: string;
}

export interface N8NAutomation {
    id: string;
    name: string;
    description: string;
    status: string;
    url: string;
}

export interface N8NAutomationsData {
    automations: N8NAutomation[];
    notes: string;
}

export interface SeoPageChecklist {
    id: string;
    page_url: string;
    page_name: string;
    title_tag: boolean;
    meta_description: boolean;
    h1_tag: boolean;
    image_alt_texts: boolean;
    open_graph_tags: boolean;
    canonical_url: boolean;
    internal_links: boolean;
}

export interface TechnicalSeoData {
    global: {
        schema_markup: boolean;
        robots_txt: boolean;
        xml_sitemap: boolean;
        core_web_vitals: boolean;
        mobile_responsive: boolean;
        https_ssl: boolean;
        no_broken_links: boolean;
        custom_404: boolean;
        hreflang_tags: boolean;
        search_console: boolean;
        google_analytics: boolean;
        favicon: boolean;
    };
    pages: SeoPageChecklist[];
    notes: string;
}

// ═══════════════════════════════════════════
// Shared Styles
// ═══════════════════════════════════════════

const inputClass = "w-full px-3 py-2 text-sm bg-zinc-900/50 border border-white/10 rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyan-500/50";
const selectClass = "w-full px-3 py-2 text-sm bg-zinc-900/50 border border-white/10 rounded-lg text-foreground focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer";
const labelClass = "text-[10px] font-orbitron text-muted-foreground uppercase tracking-wider mb-1 block";
const addBtnClass = "w-full py-2 px-3 rounded-lg border border-cyan-500/20 border-dashed bg-cyan-500/[0.04] hover:bg-cyan-500/[0.1] hover:border-cyan-500/40 transition-all flex items-center justify-center gap-2 text-cyan-400 text-xs";
const pillClass = "text-[9px] px-2 py-0.5 rounded-full font-medium";

function genId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
}

// ═══════════════════════════════════════════
// 1. DNS ACCESS PANEL
// ═══════════════════════════════════════════

const DNS_DEFAULT: DnsAccessData = {
    nameservers_pointing_to_agency: false,
    has_domain_access: false,
    access_email: '',
    access_type: '',
    registrar: '',
    notes: '',
};

export const DnsAccessPanel: React.FC<{ data: DnsAccessData; onSave: (d: DnsAccessData) => void }> = ({ data, onSave }) => {
    const [local, setLocal] = useState<DnsAccessData>({ ...DNS_DEFAULT, ...data });

    useEffect(() => { setLocal({ ...DNS_DEFAULT, ...data }); }, [data]);

    const save = (patch: Partial<DnsAccessData>) => {
        const updated = { ...local, ...patch };
        setLocal(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-3">
            <span className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-wider">DNS Configuration</span>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Domain Registrar</label>
                    <select className={selectClass} value={local.registrar} onChange={e => save({ registrar: e.target.value })}>
                        <option value="">— Select —</option>
                        <option value="godaddy">GoDaddy</option>
                        <option value="namecheap">Namecheap</option>
                        <option value="hostinger">Hostinger</option>
                        <option value="google_domains">Google Domains</option>
                        <option value="cloudflare">Cloudflare</option>
                        <option value="porkbun">Porkbun</option>
                        <option value="name_com">Name.com</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div>
                        <p className="text-sm font-medium text-foreground">Nameservers</p>
                        <p className="text-[10px] text-muted-foreground">Pointing to Agency Hostinger</p>
                    </div>
                    <Switch checked={local.nameservers_pointing_to_agency} onCheckedChange={v => save({ nameservers_pointing_to_agency: v })} />
                </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div>
                    <p className="text-sm font-medium text-foreground">Domain Access Info</p>
                    <p className="text-[10px] text-muted-foreground">Store domain registrar login credentials</p>
                </div>
                <Switch checked={local.has_domain_access} onCheckedChange={v => save({ has_domain_access: v })} />
            </div>

            {local.has_domain_access && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClass}>Access Email / Login</label>
                        <input className={inputClass} value={local.access_email} onChange={e => setLocal(p => ({ ...p, access_email: e.target.value }))} onBlur={() => onSave(local)} placeholder="admin@domain.com" />
                    </div>
                    <div>
                        <label className={labelClass}>Access Type</label>
                        <select className={selectClass} value={local.access_type} onChange={e => save({ access_type: e.target.value })}>
                            <option value="">— Select —</option>
                            <option value="registrar_login">Registrar Login</option>
                            <option value="dns_panel">DNS Panel Access</option>
                            <option value="nameserver_delegation">Nameserver Delegation</option>
                            <option value="api_access">API Access</option>
                        </select>
                    </div>
                </div>
            )}

            <div>
                <label className={labelClass}>Additional Notes</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={local.notes} onChange={e => setLocal(p => ({ ...p, notes: e.target.value }))} onBlur={() => onSave(local)} placeholder="Any extra DNS info..." />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════
// 2. TELEGRAM LEADS PANEL
// ═══════════════════════════════════════════

const LEADS_DEFAULT: TelegramLeadsData = { channels: [], notes: '' };

const channelTypes = [
    { value: 'lead_form', label: 'Lead Form', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    { value: 'newsletter', label: 'Newsletter', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'magnet', label: 'Lead Magnet', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { value: 'funnel', label: 'Funnel', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { value: 'other', label: 'Other', color: 'bg-white/10 text-white/60 border-white/20' },
];

export const TelegramLeadsPanel: React.FC<{ data: TelegramLeadsData; onSave: (d: TelegramLeadsData) => void }> = ({ data, onSave }) => {
    const [local, setLocal] = useState<TelegramLeadsData>({ ...LEADS_DEFAULT, ...data, channels: data.channels || [] });
    const [showAdd, setShowAdd] = useState(false);
    const [newChannel, setNewChannel] = useState({ name: '', type: 'lead_form', telegram_channel: '' });

    useEffect(() => { setLocal({ ...LEADS_DEFAULT, ...data, channels: data.channels || [] }); }, [data]);

    const saveChannels = (channels: TelegramLeadChannel[]) => {
        const updated = { ...local, channels };
        setLocal(updated);
        onSave(updated);
    };

    const addChannel = () => {
        if (!newChannel.name.trim()) return;
        const channel: TelegramLeadChannel = { id: genId(), ...newChannel };
        saveChannels([...local.channels, channel]);
        setNewChannel({ name: '', type: 'lead_form', telegram_channel: '' });
        setShowAdd(false);
    };

    const removeChannel = (id: string) => {
        saveChannels(local.channels.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-wider">Lead Channels</span>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[9px]">{local.channels.length} channels</Badge>
            </div>

            {local.channels.length === 0 && !showAdd && (
                <p className="text-xs text-muted-foreground/50 italic text-center py-2">No channels added yet</p>
            )}

            {local.channels.map(ch => {
                const typeInfo = channelTypes.find(t => t.value === ch.type) || channelTypes[4];
                return (
                    <div key={ch.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 group">
                        <Send className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{ch.name}</p>
                            {ch.telegram_channel && <p className="text-[10px] text-muted-foreground truncate">@{ch.telegram_channel}</p>}
                        </div>
                        <span className={`${pillClass} border ${typeInfo.color}`}>{typeInfo.label}</span>
                        <button onClick={() => removeChannel(ch.id)} className="p-1 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3 text-red-400" />
                        </button>
                    </div>
                );
            })}

            {showAdd && (
                <div className="p-3 rounded-lg bg-cyan-500/[0.03] border border-cyan-500/20 space-y-2">
                    <input className={inputClass} value={newChannel.name} onChange={e => setNewChannel(p => ({ ...p, name: e.target.value }))} placeholder="Channel name (e.g. Main Contact Form)" autoFocus />
                    <div className="grid grid-cols-2 gap-2">
                        <select className={selectClass} value={newChannel.type} onChange={e => setNewChannel(p => ({ ...p, type: e.target.value }))}>
                            {channelTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <input className={inputClass} value={newChannel.telegram_channel} onChange={e => setNewChannel(p => ({ ...p, telegram_channel: e.target.value }))} placeholder="Telegram channel name" />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowAdd(false)} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                        <button onClick={addChannel} disabled={!newChannel.name.trim()} className="px-3 py-1 text-xs bg-cyan-500/[0.1] text-cyan-400 rounded hover:bg-cyan-500/[0.2] disabled:opacity-40">Add</button>
                    </div>
                </div>
            )}

            {!showAdd && (
                <button onClick={() => setShowAdd(true)} className={addBtnClass}>
                    <Plus className="w-3 h-3" /> Add Channel
                </button>
            )}

            <div>
                <label className={labelClass}>Notes</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={local.notes} onChange={e => setLocal(p => ({ ...p, notes: e.target.value }))} onBlur={() => onSave(local)} placeholder="Additional notes about lead channels..." />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════
// 3. N8N AUTOMATIONS PANEL
// ═══════════════════════════════════════════

const N8N_DEFAULT: N8NAutomationsData = { automations: [], notes: '' };

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
    inactive: { label: 'Inactive', color: 'bg-white/10 text-white/50 border-white/20', icon: XCircle },
    draft: { label: 'Draft', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertCircle },
    error: { label: 'Error', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

export const N8NAutomationsPanel: React.FC<{ data: N8NAutomationsData; onSave: (d: N8NAutomationsData) => void }> = ({ data, onSave }) => {
    const [local, setLocal] = useState<N8NAutomationsData>({ ...N8N_DEFAULT, ...data, automations: data.automations || [] });
    const [showAdd, setShowAdd] = useState(false);
    const [newAuto, setNewAuto] = useState({ name: '', description: '', status: 'active', url: '' });

    useEffect(() => { setLocal({ ...N8N_DEFAULT, ...data, automations: data.automations || [] }); }, [data]);

    const saveAutomations = (automations: N8NAutomation[]) => {
        const updated = { ...local, automations };
        setLocal(updated);
        onSave(updated);
    };

    const addAutomation = () => {
        if (!newAuto.name.trim()) return;
        const automation: N8NAutomation = { id: genId(), ...newAuto };
        saveAutomations([...local.automations, automation]);
        setNewAuto({ name: '', description: '', status: 'active', url: '' });
        setShowAdd(false);
    };

    const removeAutomation = (id: string) => {
        saveAutomations(local.automations.filter(a => a.id !== id));
    };

    const toggleStatus = (id: string) => {
        saveAutomations(local.automations.map(a =>
            a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
        ));
    };

    const activeCount = local.automations.filter(a => a.status === 'active').length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-wider">Automations</span>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[9px]">{activeCount}/{local.automations.length} active</Badge>
            </div>

            {local.automations.length === 0 && !showAdd && (
                <p className="text-xs text-muted-foreground/50 italic text-center py-2">No automations configured yet</p>
            )}

            {local.automations.map(auto => {
                const st = statusConfig[auto.status] || statusConfig.draft;
                const StIcon = st.icon;
                return (
                    <div key={auto.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 group">
                        <button onClick={() => toggleStatus(auto.id)} className="shrink-0" title="Toggle status">
                            <StIcon className={`w-4 h-4 ${auto.status === 'active' ? 'text-emerald-400' : 'text-white/30'}`} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{auto.name}</p>
                            {auto.description && <p className="text-[10px] text-muted-foreground truncate">{auto.description}</p>}
                        </div>
                        <span className={`${pillClass} border ${st.color}`}>{st.label}</span>
                        {auto.url && (
                            <a href={auto.url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-cyan-500/10 rounded" title="Open in n8n">
                                <ExternalLink className="w-3 h-3 text-cyan-400" />
                            </a>
                        )}
                        <button onClick={() => removeAutomation(auto.id)} className="p-1 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3 text-red-400" />
                        </button>
                    </div>
                );
            })}

            {showAdd && (
                <div className="p-3 rounded-lg bg-cyan-500/[0.03] border border-cyan-500/20 space-y-2">
                    <input className={inputClass} value={newAuto.name} onChange={e => setNewAuto(p => ({ ...p, name: e.target.value }))} placeholder="Automation name (e.g. Lead to Telegram)" autoFocus />
                    <input className={inputClass} value={newAuto.description} onChange={e => setNewAuto(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" />
                    <div className="grid grid-cols-2 gap-2">
                        <select className={selectClass} value={newAuto.status} onChange={e => setNewAuto(p => ({ ...p, status: e.target.value }))}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="draft">Draft</option>
                        </select>
                        <input className={inputClass} value={newAuto.url} onChange={e => setNewAuto(p => ({ ...p, url: e.target.value }))} placeholder="n8n workflow URL (optional)" />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowAdd(false)} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                        <button onClick={addAutomation} disabled={!newAuto.name.trim()} className="px-3 py-1 text-xs bg-cyan-500/[0.1] text-cyan-400 rounded hover:bg-cyan-500/[0.2] disabled:opacity-40">Add</button>
                    </div>
                </div>
            )}

            {!showAdd && (
                <button onClick={() => setShowAdd(true)} className={addBtnClass}>
                    <Plus className="w-3 h-3" /> Add Automation
                </button>
            )}

            <div>
                <label className={labelClass}>Notes</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={local.notes} onChange={e => setLocal(p => ({ ...p, notes: e.target.value }))} onBlur={() => onSave(local)} placeholder="Additional automation notes..." />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════
// 4. TECHNICAL SEO PANEL
// ═══════════════════════════════════════════

const SEO_DEFAULT: TechnicalSeoData = {
    global: {
        schema_markup: false,
        robots_txt: false,
        xml_sitemap: false,
        core_web_vitals: false,
        mobile_responsive: false,
        https_ssl: false,
        no_broken_links: false,
        custom_404: false,
        hreflang_tags: false,
        search_console: false,
        google_analytics: false,
        favicon: false,
    },
    pages: [],
    notes: '',
};

const globalSeoItems: { key: keyof TechnicalSeoData['global']; label: string }[] = [
    { key: 'schema_markup', label: 'Schema Markup / Structured Data' },
    { key: 'robots_txt', label: 'robots.txt Configured' },
    { key: 'xml_sitemap', label: 'XML Sitemap Present' },
    { key: 'core_web_vitals', label: 'Core Web Vitals Pass' },
    { key: 'mobile_responsive', label: 'Mobile Responsive' },
    { key: 'https_ssl', label: 'HTTPS / SSL Active' },
    { key: 'no_broken_links', label: 'No Broken Links (404s)' },
    { key: 'custom_404', label: 'Custom 404 Page' },
    { key: 'hreflang_tags', label: 'Hreflang Tags (if multilingual)' },
    { key: 'search_console', label: 'Google Search Console Connected' },
    { key: 'google_analytics', label: 'Google Analytics Installed' },
    { key: 'favicon', label: 'Favicon Set' },
];

const pageSeoItems: { key: keyof Omit<SeoPageChecklist, 'id' | 'page_url' | 'page_name'>; label: string }[] = [
    { key: 'title_tag', label: 'Title Tag' },
    { key: 'meta_description', label: 'Meta Description' },
    { key: 'h1_tag', label: 'H1 Tag' },
    { key: 'image_alt_texts', label: 'Image Alt Texts' },
    { key: 'open_graph_tags', label: 'Open Graph Tags' },
    { key: 'canonical_url', label: 'Canonical URL' },
    { key: 'internal_links', label: 'Internal Links' },
];

export const TechnicalSeoPanel: React.FC<{ data: TechnicalSeoData; onSave: (d: TechnicalSeoData) => void }> = ({ data, onSave }) => {
    const [local, setLocal] = useState<TechnicalSeoData>({ ...SEO_DEFAULT, ...data, global: { ...SEO_DEFAULT.global, ...(data.global || {}) }, pages: data.pages || [] });
    const [showAddPage, setShowAddPage] = useState(false);
    const [newPage, setNewPage] = useState({ page_name: '', page_url: '' });
    const [expandedPage, setExpandedPage] = useState<string | null>(null);

    useEffect(() => {
        setLocal({ ...SEO_DEFAULT, ...data, global: { ...SEO_DEFAULT.global, ...(data.global || {}) }, pages: data.pages || [] });
    }, [data]);

    const saveAll = (updated: TechnicalSeoData) => {
        setLocal(updated);
        onSave(updated);
    };

    const toggleGlobal = (key: keyof TechnicalSeoData['global']) => {
        const updated = { ...local, global: { ...local.global, [key]: !local.global[key] } };
        saveAll(updated);
    };

    const addPage = () => {
        if (!newPage.page_name.trim()) return;
        const page: SeoPageChecklist = {
            id: genId(),
            page_url: newPage.page_url,
            page_name: newPage.page_name,
            title_tag: false,
            meta_description: false,
            h1_tag: false,
            image_alt_texts: false,
            open_graph_tags: false,
            canonical_url: false,
            internal_links: false,
        };
        saveAll({ ...local, pages: [...local.pages, page] });
        setNewPage({ page_name: '', page_url: '' });
        setShowAddPage(false);
    };

    const removePage = (id: string) => {
        saveAll({ ...local, pages: local.pages.filter(p => p.id !== id) });
    };

    const togglePageItem = (pageId: string, key: keyof Omit<SeoPageChecklist, 'id' | 'page_url' | 'page_name'>) => {
        saveAll({
            ...local,
            pages: local.pages.map(p => p.id === pageId ? { ...p, [key]: !(p as any)[key] } : p),
        });
    };

    const globalChecked = Object.values(local.global).filter(Boolean).length;
    const globalTotal = globalSeoItems.length;

    return (
        <div className="space-y-4">
            {/* Global Site-Wide Checks */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-wider">Site-Wide Checks</span>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[9px]">{globalChecked}/{globalTotal}</Badge>
                </div>
                <div className="space-y-1">
                    {globalSeoItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => toggleGlobal(item.key)}
                            className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors text-left"
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                local.global[item.key]
                                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-400'
                                    : 'border-white/20 text-transparent'
                            }`}>
                                {local.global[item.key] && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span className={`text-sm ${local.global[item.key] ? 'text-foreground line-through opacity-60' : 'text-foreground'}`}>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Per-Page Checks */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-wider">Per-Page Checks</span>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[9px]">{local.pages.length} pages</Badge>
                </div>

                {local.pages.length === 0 && !showAddPage && (
                    <p className="text-xs text-muted-foreground/50 italic text-center py-2">No pages added yet</p>
                )}

                {local.pages.map(page => {
                    const pageChecked = pageSeoItems.filter(i => (page as any)[i.key]).length;
                    const isExpanded = expandedPage === page.id;

                    return (
                        <div key={page.id} className="rounded-lg bg-white/[0.02] border border-white/5 mb-2 overflow-hidden">
                            <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpandedPage(isExpanded ? null : page.id)}>
                                {isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{page.page_name}</p>
                                    {page.page_url && <p className="text-[10px] text-muted-foreground truncate">{page.page_url}</p>}
                                </div>
                                <Badge className={`text-[9px] ${pageChecked === pageSeoItems.length ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 text-white/50 border-white/20'}`}>
                                    {pageChecked}/{pageSeoItems.length}
                                </Badge>
                                <button onClick={e => { e.stopPropagation(); removePage(page.id); }} className="p-1 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-3 h-3 text-red-400" />
                                </button>
                            </div>

                            {isExpanded && (
                                <div className="px-3 pb-3 border-t border-white/5 pt-2 space-y-1">
                                    {pageSeoItems.map(item => (
                                        <button
                                            key={item.key}
                                            onClick={() => togglePageItem(page.id, item.key)}
                                            className="w-full flex items-center gap-3 py-1.5 px-2 rounded hover:bg-white/[0.03] transition-colors text-left"
                                        >
                                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                                (page as any)[item.key]
                                                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-400'
                                                    : 'border-white/20 text-transparent'
                                            }`}>
                                                {(page as any)[item.key] && <CheckCircle2 className="w-2.5 h-2.5" />}
                                            </div>
                                            <span className={`text-xs ${(page as any)[item.key] ? 'text-foreground line-through opacity-60' : 'text-foreground'}`}>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {showAddPage && (
                    <div className="p-3 rounded-lg bg-cyan-500/[0.03] border border-cyan-500/20 space-y-2">
                        <input className={inputClass} value={newPage.page_name} onChange={e => setNewPage(p => ({ ...p, page_name: e.target.value }))} placeholder="Page name (e.g. Homepage, About)" autoFocus />
                        <input className={inputClass} value={newPage.page_url} onChange={e => setNewPage(p => ({ ...p, page_url: e.target.value }))} placeholder="URL path (e.g. /, /about)" />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowAddPage(false)} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                            <button onClick={addPage} disabled={!newPage.page_name.trim()} className="px-3 py-1 text-xs bg-cyan-500/[0.1] text-cyan-400 rounded hover:bg-cyan-500/[0.2] disabled:opacity-40">Add Page</button>
                        </div>
                    </div>
                )}

                {!showAddPage && (
                    <button onClick={() => setShowAddPage(true)} className={addBtnClass}>
                        <Plus className="w-3 h-3" /> Add Page
                    </button>
                )}
            </div>

            <div>
                <label className={labelClass}>Notes</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={local.notes} onChange={e => setLocal(p => ({ ...p, notes: e.target.value }))} onBlur={() => onSave(local)} placeholder="Additional SEO notes..." />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════
// 5. MONTHLY WEBSITE UPGRADES RATE PANEL
// ═══════════════════════════════════════════

const UPGRADES_DEFAULT: UpgradesRateData = { hourly_rate: 100, notes: '' };

export const UpgradesRatePanel: React.FC<{ data: UpgradesRateData; onSave: (d: UpgradesRateData) => void }> = ({ data, onSave }) => {
    const [local, setLocal] = useState<UpgradesRateData>({ ...UPGRADES_DEFAULT, ...data });

    useEffect(() => { setLocal({ ...UPGRADES_DEFAULT, ...data }); }, [data]);

    const save = (patch: Partial<UpgradesRateData>) => {
        const updated = { ...local, ...patch };
        setLocal(updated);
        onSave(updated);
    };

    return (
        <div className="space-y-3">
            <span className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-wider">Client Rate Configuration</span>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex-1">
                    <label className={labelClass}>Hourly Rate ($)</label>
                    <input
                        className={inputClass}
                        type="number"
                        step="1"
                        min="0"
                        value={local.hourly_rate}
                        onChange={e => setLocal(p => ({ ...p, hourly_rate: parseFloat(e.target.value) || 0 }))}
                        onBlur={() => onSave(local)}
                        placeholder="100"
                    />
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-cyan-500/[0.06] border border-cyan-500/20">
                    <p className="text-[9px] text-muted-foreground uppercase">Rate</p>
                    <p className="text-lg font-bold text-cyan-400">${local.hourly_rate}/hr</p>
                </div>
            </div>

            <div>
                <label className={labelClass}>Notes</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={local.notes} onChange={e => setLocal(p => ({ ...p, notes: e.target.value }))} onBlur={() => onSave(local)} placeholder="Rate notes (e.g. partner discount applied)..." />
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════
// 6. AI USAGE PANEL
// ═══════════════════════════════════════════

const AI_USAGE_DEFAULT: AiUsageData = { entries: [], notes: '' };

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(m: string): string {
    const [year, month] = m.split('-');
    return `${monthLabels[parseInt(month, 10) - 1]} ${year}`;
}

function generateMonthOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 12; i >= -2; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        options.push({ value: val, label: formatMonth(val) });
    }
    return options;
}

export const AiUsagePanel: React.FC<{ data: AiUsageData; onSave: (d: AiUsageData) => void }> = ({ data, onSave }) => {
    const [local, setLocal] = useState<AiUsageData>({ ...AI_USAGE_DEFAULT, ...data, entries: data.entries || [] });
    const [showAdd, setShowAdd] = useState(false);
    const [newMonth, setNewMonth] = useState('');
    const [newTotal, setNewTotal] = useState('');

    useEffect(() => { setLocal({ ...AI_USAGE_DEFAULT, ...data, entries: data.entries || [] }); }, [data]);

    const saveEntries = (entries: AiUsageEntry[]) => {
        const updated = { ...local, entries };
        setLocal(updated);
        onSave(updated);
    };

    const getPreviousTotal = (month: string, currentEntries: AiUsageEntry[]): number => {
        const earlier = currentEntries
            .filter(e => e.month < month)
            .sort((a, b) => b.month.localeCompare(a.month));
        return earlier.length > 0 ? earlier[0].cumulative_total : 0;
    };

    const addEntry = () => {
        if (!newMonth || !newTotal) return;
        const cumTotal = parseFloat(newTotal);
        if (isNaN(cumTotal)) return;

        const prevTotal = getPreviousTotal(newMonth, local.entries);
        const increment = Math.max(0, cumTotal - prevTotal);
        const fee = Math.round(increment * 0.03 * 100) / 100;
        const charge = Math.round((increment + fee) * 100) / 100;

        const entry: AiUsageEntry = {
            id: genId(),
            month: newMonth,
            cumulative_total: cumTotal,
            monthly_increment: Math.round(increment * 100) / 100,
            cc_fee: fee,
            amount_to_charge: charge,
            paid: false,
        };

        const updated = [...local.entries.filter(e => e.month !== newMonth), entry].sort((a, b) => a.month.localeCompare(b.month));
        saveEntries(updated);
        setNewMonth('');
        setNewTotal('');
        setShowAdd(false);
    };

    const removeEntry = (id: string) => {
        saveEntries(local.entries.filter(e => e.id !== id));
    };

    const togglePaid = (id: string) => {
        saveEntries(local.entries.map(e => e.id === id ? { ...e, paid: !e.paid } : e));
    };

    const totalCharged = local.entries.filter(e => e.paid).reduce((sum, e) => sum + e.amount_to_charge, 0);
    const sorted = [...local.entries].sort((a, b) => a.month.localeCompare(b.month));
    const monthOptions = generateMonthOptions();
    const usedMonths = new Set(local.entries.map(e => e.month));

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-orbitron text-muted-foreground uppercase tracking-wider">AI Usage Tracking</span>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[9px]">${totalCharged.toFixed(2)} charged</Badge>
            </div>

            {sorted.length === 0 && !showAdd && (
                <p className="text-xs text-muted-foreground/50 italic text-center py-2">No usage entries yet</p>
            )}

            {sorted.length > 0 && (
                <div className="rounded-lg border border-white/5 overflow-hidden">
                    {/* Table header */}
                    <div className="grid grid-cols-6 gap-1 px-3 py-2 bg-white/[0.03] text-[9px] font-orbitron text-muted-foreground uppercase tracking-wider">
                        <span>Month</span>
                        <span className="text-right">Replit Total</span>
                        <span className="text-right">Usage</span>
                        <span className="text-right">CC Fee</span>
                        <span className="text-right">Charge</span>
                        <span className="text-center">Paid</span>
                    </div>
                    {/* Table rows */}
                    {sorted.map(entry => (
                        <div key={entry.id} className="grid grid-cols-6 gap-1 px-3 py-2 border-t border-white/5 items-center group hover:bg-white/[0.02]">
                            <span className="text-xs text-foreground font-medium">{formatMonth(entry.month)}</span>
                            <span className="text-xs text-muted-foreground text-right">${entry.cumulative_total.toFixed(2)}</span>
                            <span className="text-xs text-cyan-400 text-right font-medium">${entry.monthly_increment.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground text-right">${entry.cc_fee.toFixed(2)}</span>
                            <span className="text-xs text-foreground text-right font-bold">${entry.amount_to_charge.toFixed(2)}</span>
                            <div className="flex items-center justify-center gap-1">
                                <button onClick={() => togglePaid(entry.id)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${entry.paid ? 'bg-emerald-500/30 border-emerald-400 text-emerald-400' : 'border-white/20 text-transparent hover:border-white/40'}`}>
                                    {entry.paid && <CheckCircle2 className="w-3 h-3" />}
                                </button>
                                <button onClick={() => removeEntry(entry.id)} className="p-0.5 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-3 h-3 text-red-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAdd && (
                <div className="p-3 rounded-lg bg-cyan-500/[0.03] border border-cyan-500/20 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className={labelClass}>Month</label>
                            <select className={selectClass} value={newMonth} onChange={e => setNewMonth(e.target.value)}>
                                <option value="">— Select —</option>
                                {monthOptions.filter(o => !usedMonths.has(o.value)).map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Cumulative Replit Total ($)</label>
                            <input className={inputClass} type="number" step="0.01" min="0" value={newTotal} onChange={e => setNewTotal(e.target.value)} placeholder="e.g. 87.13" />
                        </div>
                    </div>
                    {newMonth && newTotal && !isNaN(parseFloat(newTotal)) && (() => {
                        const cum = parseFloat(newTotal);
                        const prev = getPreviousTotal(newMonth, local.entries);
                        const inc = Math.max(0, cum - prev);
                        const fee = Math.round(inc * 0.03 * 100) / 100;
                        const charge = Math.round((inc + fee) * 100) / 100;
                        return (
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded bg-white/[0.03] border border-white/5 text-center">
                                    <p className="text-[9px] text-muted-foreground uppercase">Monthly Usage</p>
                                    <p className="text-sm font-bold text-cyan-400">${inc.toFixed(2)}</p>
                                </div>
                                <div className="p-2 rounded bg-white/[0.03] border border-white/5 text-center">
                                    <p className="text-[9px] text-muted-foreground uppercase">CC Fee (3%)</p>
                                    <p className="text-sm font-bold text-amber-400">${fee.toFixed(2)}</p>
                                </div>
                                <div className="p-2 rounded bg-white/[0.03] border border-white/5 text-center">
                                    <p className="text-[9px] text-muted-foreground uppercase">Amount to Charge</p>
                                    <p className="text-sm font-bold text-emerald-400">${charge.toFixed(2)}</p>
                                </div>
                            </div>
                        );
                    })()}
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => { setShowAdd(false); setNewMonth(''); setNewTotal(''); }} className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                        <button onClick={addEntry} disabled={!newMonth || !newTotal || isNaN(parseFloat(newTotal))} className="px-3 py-1 text-xs bg-cyan-500/[0.1] text-cyan-400 rounded hover:bg-cyan-500/[0.2] disabled:opacity-40">Add Entry</button>
                    </div>
                </div>
            )}

            {!showAdd && (
                <button onClick={() => setShowAdd(true)} className={addBtnClass}>
                    <Plus className="w-3 h-3" /> Add Month
                </button>
            )}

            <div>
                <label className={labelClass}>Notes</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={local.notes} onChange={e => setLocal(p => ({ ...p, notes: e.target.value }))} onBlur={() => onSave(local)} placeholder="Additional AI usage notes..." />
            </div>
        </div>
    );
};
