import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Plus, X, Video, Camera, FileText, Users, MapPin,
  Clock, DollarSign, ExternalLink, ChevronRight,
  Trash2, CheckCircle2, Clapperboard,
  Building2, Link2, Search, Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type ContentType = "short-form" | "vsl" | "value-added";
type EditStatus = "not-started" | "editing" | "review" | "done";
type ShootStatus = "scheduled" | "in-progress" | "completed" | "cancelled";

interface ShootVideo {
  id: string;
  title: string;
  contentType: ContentType;
  editStatus: EditStatus;
  editor: string;
  price: number;
  script: string;
}

interface Shoot {
  id: string;
  clientId: string;
  date: string;
  location: string;
  status: ShootStatus;
  actorMinutes: number;
  filmerMinutes: number;
  shortFormCount: number;
  vslCount: number;
  valueAddedCount: number;
  videos: ShootVideo[];
  dropboxFootage: string;
  dropboxDeliverables: string;
  notes: string;
}

interface Client {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  onboardedAt: string;
  shoots: Shoot[];
}

const ACTOR_COST = 75;
const FILMER_COST = 75;
const ACTOR_CHARGE = 150;
const FILMER_CHARGE = 150;
const SHORT_FORM_PRICE = 30;
const VSL_PRICE = 150;
const EDITOR_COST_PER_VIDEO = 7;
const MANAGER_FEE_PERCENT = 0.10;

const contentTypeLabel: Record<ContentType, string> = {
  "short-form": "Short Form Ad",
  "vsl": "VSL",
  "value-added": "Value Added Content",
};

const contentTypeColor: Record<ContentType, string> = {
  "short-form": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "vsl": "text-red-400 bg-red-500/10 border-red-500/20",
  "value-added": "text-green-400 bg-green-500/10 border-green-500/20",
};

const editStatusLabel: Record<EditStatus, string> = {
  "not-started": "Not Started",
  "editing": "Editing",
  "review": "In Review",
  "done": "Done",
};

const editStatusColor: Record<EditStatus, string> = {
  "not-started": "text-gray-400 bg-gray-500/10 border-gray-500/20",
  "editing": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "review": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "done": "text-green-400 bg-green-500/10 border-green-500/20",
};

const shootStatusColor: Record<ShootStatus, string> = {
  "scheduled": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "in-progress": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "completed": "text-green-400 bg-green-500/10 border-green-500/20",
  "cancelled": "text-red-400 bg-red-500/10 border-red-500/20",
};

const VALUE_ADDED_PRICE = 30;

const getVideoPrice = (type: ContentType) => type === "vsl" ? VSL_PRICE : type === "short-form" ? SHORT_FORM_PRICE : VALUE_ADDED_PRICE;

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const STORAGE_KEY = "rmh_content_portal";

function loadData(): Client[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveData(clients: Client[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

const ContentPortal = () => {
  const [clients, setClients] = useState<Client[]>(loadData);
  const [view, setView] = useState<"clients" | "client-detail" | "shoot-detail">("clients");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedShootId, setSelectedShootId] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddShoot, setShowAddShoot] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const persist = (updated: Client[]) => {
    setClients(updated);
    saveData(updated);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;
  const selectedShoot = selectedClient?.shoots.find(s => s.id === selectedShootId) || null;

  const [newClient, setNewClient] = useState({ name: "", business: "", email: "", phone: "" });
  const [newShoot, setNewShoot] = useState({ date: "", location: "", notes: "" });
  const [newVideo, setNewVideo] = useState<{ title: string; contentType: ContentType; editor: string; script: string }>({ title: "", contentType: "short-form", editor: "", script: "" });

  const addClient = () => {
    if (!newClient.name || !newClient.business) return;
    const client: Client = {
      id: generateId(),
      ...newClient,
      onboardedAt: new Date().toISOString(),
      shoots: [],
    };
    persist([client, ...clients]);
    setNewClient({ name: "", business: "", email: "", phone: "" });
    setShowAddClient(false);
    toast({ title: "Client added", description: `${client.name} has been onboarded.` });
  };

  const deleteClient = (id: string) => {
    persist(clients.filter(c => c.id !== id));
    if (selectedClientId === id) { setSelectedClientId(null); setView("clients"); }
    toast({ title: "Client removed" });
  };

  const addShoot = () => {
    if (!newShoot.date || !newShoot.location || !selectedClientId) return;
    const shoot: Shoot = {
      id: generateId(),
      clientId: selectedClientId,
      date: newShoot.date,
      location: newShoot.location,
      status: "scheduled",
      actorMinutes: 0,
      filmerMinutes: 0,
      shortFormCount: 0,
      vslCount: 0,
      valueAddedCount: 0,
      videos: [],
      dropboxFootage: "",
      dropboxDeliverables: "",
      notes: newShoot.notes,
    };
    const updated = clients.map(c =>
      c.id === selectedClientId ? { ...c, shoots: [shoot, ...c.shoots] } : c
    );
    persist(updated);
    setNewShoot({ date: "", location: "", notes: "" });
    setShowAddShoot(false);
    toast({ title: "Shoot scheduled" });
  };

  const updateShoot = (field: string, value: any) => {
    if (!selectedClientId || !selectedShootId) return;
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? { ...c, shoots: c.shoots.map(s => s.id === selectedShootId ? { ...s, [field]: value } : s) }
        : c
    );
    persist(updated);
  };

  const deleteShoot = (shootId: string) => {
    if (!selectedClientId) return;
    const updated = clients.map(c =>
      c.id === selectedClientId ? { ...c, shoots: c.shoots.filter(s => s.id !== shootId) } : c
    );
    persist(updated);
    if (selectedShootId === shootId) { setSelectedShootId(null); setView("client-detail"); }
    toast({ title: "Shoot deleted" });
  };

  const addVideo = () => {
    if (!newVideo.title || !selectedClientId || !selectedShootId) return;
    const video: ShootVideo = {
      id: generateId(),
      title: newVideo.title,
      contentType: newVideo.contentType,
      editStatus: "not-started",
      editor: newVideo.editor,
      price: getVideoPrice(newVideo.contentType),
      script: newVideo.script,
    };
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? { ...c, shoots: c.shoots.map(s => s.id === selectedShootId ? { ...s, videos: [...s.videos, video] } : s) }
        : c
    );
    persist(updated);
    setNewVideo({ title: "", contentType: "short-form", editor: "", script: "" });
    setShowAddVideo(false);
    toast({ title: "Video added" });
  };

  const updateVideoStatus = (videoId: string, editStatus: EditStatus) => {
    if (!selectedClientId || !selectedShootId) return;
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? {
          ...c, shoots: c.shoots.map(s =>
            s.id === selectedShootId
              ? { ...s, videos: s.videos.map(v => v.id === videoId ? { ...v, editStatus } : v) }
              : s
          )
        }
        : c
    );
    persist(updated);
  };

  const deleteVideo = (videoId: string) => {
    if (!selectedClientId || !selectedShootId) return;
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? { ...c, shoots: c.shoots.map(s => s.id === selectedShootId ? { ...s, videos: s.videos.filter(v => v.id !== videoId) } : s) }
        : c
    );
    persist(updated);
    toast({ title: "Video removed" });
  };

  const updateVideoScript = (videoId: string, script: string) => {
    if (!selectedClientId || !selectedShootId) return;
    const updated = clients.map(c =>
      c.id === selectedClientId
        ? {
          ...c, shoots: c.shoots.map(s =>
            s.id === selectedShootId
              ? { ...s, videos: s.videos.map(v => v.id === videoId ? { ...v, script } : v) }
              : s
          )
        }
        : c
    );
    persist(updated);
  };

  const calcShootFinancials = (shoot: Shoot) => {
    const actorCost = (shoot.actorMinutes / 60) * ACTOR_COST;
    const filmerCost = (shoot.filmerMinutes / 60) * FILMER_COST;
    const actorRevenue = (shoot.actorMinutes / 60) * ACTOR_CHARGE;
    const filmerRevenue = (shoot.filmerMinutes / 60) * FILMER_CHARGE;
    const videoRevenue = shoot.videos.reduce((sum, v) => sum + v.price, 0);
    const totalVideoCount = (shoot.shortFormCount || 0) + (shoot.vslCount || 0) + (shoot.valueAddedCount || 0);
    const shootVideoRevenue = (shoot.shortFormCount || 0) * SHORT_FORM_PRICE + (shoot.vslCount || 0) * VSL_PRICE + (shoot.valueAddedCount || 0) * VALUE_ADDED_PRICE;
    const editorCost = totalVideoCount * EDITOR_COST_PER_VIDEO;
    const totalRevenue = actorRevenue + filmerRevenue + shootVideoRevenue;
    const managerFee = totalRevenue * MANAGER_FEE_PERCENT;
    const totalCost = actorCost + filmerCost + editorCost + managerFee;
    const profit = totalRevenue - totalCost;
    return { actorCost, filmerCost, editorCost, managerFee, actorRevenue, filmerRevenue, videoRevenue: shootVideoRevenue, totalVideoCount, totalCost, totalRevenue, profit };
  };

  const calcClientTotals = (client: Client) => {
    let totalRevenue = 0, totalCost = 0, totalVideos = 0;
    client.shoots.forEach(s => {
      const f = calcShootFinancials(s);
      totalRevenue += f.totalRevenue;
      totalCost += f.totalCost;
      totalVideos += f.totalVideoCount;
    });
    let totalProfit = 0;
    client.shoots.forEach(s2 => { totalProfit += calcShootFinancials(s2).profit; });
    return { totalRevenue, totalCost, profit: totalProfit, totalVideos, totalShoots: client.shoots.length };
  };

  const filteredClients = searchQuery
    ? clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.business.toLowerCase().includes(searchQuery.toLowerCase()))
    : clients;

  return (
    <>
      <Helmet>
        <title>Content Portal | Rank Me Higher</title>
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-4">
            <button
              onClick={() => {
                if (view === "shoot-detail") { setSelectedShootId(null); setView("client-detail"); }
                else if (view === "client-detail") { setSelectedClientId(null); setView("clients"); }
                else { window.location.href = "/avaadminpanel"; }
              }}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-red-400" />
              <h1 className="font-orbitron font-bold text-base lg:text-lg">Content Portal</h1>
            </div>

            {view !== "clients" && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                <button onClick={() => { setView("clients"); setSelectedClientId(null); setSelectedShootId(null); }} className="hover:text-foreground transition-colors">Clients</button>
                {selectedClient && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <button onClick={() => { setView("client-detail"); setSelectedShootId(null); }} className="hover:text-foreground transition-colors">{selectedClient.name}</button>
                  </>
                )}
                {selectedShoot && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground">{new Date(selectedShoot.date).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          {view === "clients" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-orbitron font-bold text-xl">Clients</h2>
                  <p className="text-xs text-muted-foreground mt-1">{clients.length} client{clients.length !== 1 ? "s" : ""} onboarded</p>
                </div>
                <button onClick={() => setShowAddClient(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all">
                  <Plus className="w-4 h-4" /> Onboard Client
                </button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10"
                />
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {(() => {
                  let totalRev = 0, totalCost = 0, totalVids = 0, totalShoots = 0;
                  clients.forEach(c => { const t = calcClientTotals(c); totalRev += t.totalRevenue; totalCost += t.totalCost; totalVids += t.totalVideos; totalShoots += t.totalShoots; });
                  return [
                    { label: "Total Revenue", value: `$${totalRev.toLocaleString()}`, icon: DollarSign, color: "text-green-400" },
                    { label: "Total Profit", value: `$${(totalRev - totalCost).toLocaleString()}`, icon: DollarSign, color: "text-cyan-400" },
                    { label: "Total Videos", value: totalVids, icon: Video, color: "text-red-400" },
                    { label: "Total Shoots", value: totalShoots, icon: Camera, color: "text-yellow-400" },
                  ].map(s => (
                    <div key={s.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                        <span className="text-[10px] text-muted-foreground uppercase font-orbitron">{s.label}</span>
                      </div>
                      <p className={`text-xl font-black font-orbitron ${s.color}`}>{s.value}</p>
                    </div>
                  ));
                })()}
              </div>

              {/* Upcoming Shoots */}
              {(() => {
                const upcomingShoots = clients.flatMap(c =>
                  c.shoots
                    .filter(s => s.status === "scheduled" || s.status === "in-progress")
                    .map(s => ({ ...s, clientName: c.name, clientId: c.id }))
                ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                if (upcomingShoots.length === 0) return null;

                return (
                  <div className="mb-6">
                    <h3 className="font-orbitron font-bold text-sm mb-2 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-cyan-400" /> Upcoming Shoots
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {upcomingShoots.map(shoot => (
                        <button
                          key={shoot.id}
                          onClick={() => { setSelectedClientId(shoot.clientId); setSelectedShootId(shoot.id); setView("shoot-detail"); }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.07] transition-all text-left group"
                        >
                          <div className={`w-2 h-2 rounded-full ${shoot.status === "in-progress" ? "bg-yellow-400 animate-pulse" : "bg-blue-400"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold truncate">{shoot.clientName}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${shootStatusColor[shoot.status]}`}>
                                {shoot.status === "in-progress" ? "LIVE" : "SCHEDULED"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span>{new Date(shoot.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                              <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{shoot.location}</span>
                              <span>{(shoot.shortFormCount || 0) + (shoot.vslCount || 0) + (shoot.valueAddedCount || 0)} video{((shoot.shortFormCount || 0) + (shoot.vslCount || 0) + (shoot.valueAddedCount || 0)) !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="grid gap-3">
                {filteredClients.map(client => {
                  const totals = calcClientTotals(client);
                  return (
                    <button
                      key={client.id}
                      onClick={() => { setSelectedClientId(client.id); setView("client-detail"); }}
                      className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-white/[0.07] transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.business}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="text-right hidden sm:block">
                            <p className="text-green-400 font-bold">${totals.totalRevenue.toLocaleString()}</p>
                            <p>{totals.totalShoots} shoot{totals.totalShoots !== 1 ? "s" : ""} · {totals.totalVideos} video{totals.totalVideos !== 1 ? "s" : ""}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-red-400 transition-colors" />
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filteredClients.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{searchQuery ? "No clients match your search" : "No clients yet. Onboard your first client."}</p>
                  </div>
                )}
              </div>

              {showAddClient && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAddClient(false)}>
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                  <div className="relative w-full max-w-md rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 p-6" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-orbitron font-bold">Onboard Client</h3>
                      <button onClick={() => setShowAddClient(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="space-y-3">
                      <Input placeholder="Client name *" value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} className="bg-white/5 border-white/10" />
                      <Input placeholder="Business name *" value={newClient.business} onChange={e => setNewClient(p => ({ ...p, business: e.target.value }))} className="bg-white/5 border-white/10" />
                      <Input placeholder="Email" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} className="bg-white/5 border-white/10" />
                      <Input placeholder="Phone" value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} className="bg-white/5 border-white/10" />
                      <button onClick={addClient} className="w-full py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/30 transition-all">
                        Onboard Client
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {view === "client-detail" && selectedClient && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-orbitron font-bold text-xl">{selectedClient.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1">{selectedClient.business} · Onboarded {new Date(selectedClient.onboardedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowAddShoot(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all">
                    <Plus className="w-4 h-4" /> New Shoot
                  </button>
                  <button onClick={() => deleteClient(selectedClient.id)} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-all">
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                  </button>
                </div>
              </div>

              {/* Client summary cards */}
              {(() => {
                const t = calcClientTotals(selectedClient);
                return (
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                    {[
                      { label: "Revenue", value: `$${t.totalRevenue.toLocaleString()}`, color: "text-green-400" },
                      { label: "Cost", value: `$${t.totalCost.toLocaleString()}`, color: "text-red-400" },
                      { label: "Profit", value: `$${t.profit.toLocaleString()}`, color: "text-cyan-400" },
                      { label: "Videos", value: t.totalVideos, color: "text-yellow-400" },
                      { label: "Shoots", value: t.totalShoots, color: "text-blue-400" },
                    ].map(s => (
                      <div key={s.label} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-orbitron">{s.label}</p>
                        <p className={`text-lg font-black font-orbitron ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {selectedClient.email && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  {selectedClient.email && <span>{selectedClient.email}</span>}
                  {selectedClient.phone && <span>{selectedClient.phone}</span>}
                </div>
              )}

              <h3 className="font-orbitron font-bold text-sm mb-3">Shoots</h3>
              <div className="grid gap-3">
                {selectedClient.shoots.map(shoot => {
                  const fin = calcShootFinancials(shoot);
                  const doneCount = shoot.videos.filter(v => v.editStatus === "done").length;
                  return (
                    <button
                      key={shoot.id}
                      onClick={() => { setSelectedShootId(shoot.id); setView("shoot-detail"); }}
                      className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.07] transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <Camera className="w-4 h-4 text-cyan-400" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{new Date(shoot.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" /> {shoot.location}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${shootStatusColor[shoot.status]}`}>
                            {shoot.status.replace("-", " ").toUpperCase()}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {fin.totalVideoCount} video{fin.totalVideoCount !== 1 ? "s" : ""} shot</span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-400" /> {doneCount}/{shoot.videos.length} edited</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {shoot.actorMinutes + shoot.filmerMinutes}min on site</span>
                        <span className="flex items-center gap-1 text-green-400 font-bold"><DollarSign className="w-3 h-3" /> ${fin.totalRevenue.toFixed(2)}</span>
                      </div>
                    </button>
                  );
                })}
                {selectedClient.shoots.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No shoots yet. Schedule your first shoot.</p>
                  </div>
                )}
              </div>

              {showAddShoot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAddShoot(false)}>
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                  <div className="relative w-full max-w-md rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 p-6" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-orbitron font-bold">Schedule Shoot</h3>
                      <button onClick={() => setShowAddShoot(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="space-y-3">
                      <Input type="date" value={newShoot.date} onChange={e => setNewShoot(p => ({ ...p, date: e.target.value }))} className="bg-white/5 border-white/10" />
                      <Input placeholder="Location *" value={newShoot.location} onChange={e => setNewShoot(p => ({ ...p, location: e.target.value }))} className="bg-white/5 border-white/10" />
                      <textarea
                        placeholder="Notes (optional)"
                        value={newShoot.notes}
                        onChange={e => setNewShoot(p => ({ ...p, notes: e.target.value }))}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none focus:border-red-500/40"
                      />
                      <button onClick={addShoot} className="w-full py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/30 transition-all">
                        Schedule Shoot
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {view === "shoot-detail" && selectedShoot && selectedClient && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-orbitron font-bold text-lg">
                    {new Date(selectedShoot.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" /> {selectedShoot.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedShoot.status}
                    onChange={e => updateShoot("status", e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => deleteShoot(selectedShoot.id)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-all">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Financials */}
              {(() => {
                const fin = calcShootFinancials(selectedShoot);
                return (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase font-orbitron mb-3 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-green-400" /> Financials
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Actor Minutes on Site</label>
                        <Input
                          type="number" min="0" step="5"
                          value={selectedShoot.actorMinutes || ""}
                          onChange={e => updateShoot("actorMinutes", parseFloat(e.target.value) || 0)}
                          onBlur={e => { if (e.target.value === "") updateShoot("actorMinutes", 0); }}
                          placeholder="0"
                          className="bg-white/5 border-white/10 h-8 text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Cost: ${fin.actorCost.toFixed(2)} · Charge: ${fin.actorRevenue.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Filmer Minutes on Site</label>
                        <Input
                          type="number" min="0" step="5"
                          value={selectedShoot.filmerMinutes || ""}
                          onChange={e => updateShoot("filmerMinutes", parseFloat(e.target.value) || 0)}
                          onBlur={e => { if (e.target.value === "") updateShoot("filmerMinutes", 0); }}
                          placeholder="0"
                          className="bg-white/5 border-white/10 h-8 text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Cost: ${fin.filmerCost.toFixed(2)} · Charge: ${fin.filmerRevenue.toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Short Form Ads Shot</label>
                        <Input
                          type="number" min="0" step="1"
                          value={selectedShoot.shortFormCount || ""}
                          onChange={e => updateShoot("shortFormCount", parseInt(e.target.value) || 0)}
                          onBlur={e => { if (e.target.value === "") updateShoot("shortFormCount", 0); }}
                          placeholder="0"
                          className="bg-white/5 border-white/10 h-8 text-sm"
                        />
                        <p className="text-[10px] text-cyan-400 mt-0.5">${SHORT_FORM_PRICE} each · Rev: ${((selectedShoot.shortFormCount || 0) * SHORT_FORM_PRICE).toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">VSLs Shot</label>
                        <Input
                          type="number" min="0" step="1"
                          value={selectedShoot.vslCount || ""}
                          onChange={e => updateShoot("vslCount", parseInt(e.target.value) || 0)}
                          onBlur={e => { if (e.target.value === "") updateShoot("vslCount", 0); }}
                          placeholder="0"
                          className="bg-white/5 border-white/10 h-8 text-sm"
                        />
                        <p className="text-[10px] text-red-400 mt-0.5">${VSL_PRICE} each · Rev: ${((selectedShoot.vslCount || 0) * VSL_PRICE).toFixed(2)}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Value Added Shot</label>
                        <Input
                          type="number" min="0" step="1"
                          value={selectedShoot.valueAddedCount || ""}
                          onChange={e => updateShoot("valueAddedCount", parseInt(e.target.value) || 0)}
                          onBlur={e => { if (e.target.value === "") updateShoot("valueAddedCount", 0); }}
                          placeholder="0"
                          className="bg-white/5 border-white/10 h-8 text-sm"
                        />
                        <p className="text-[10px] text-green-400 mt-0.5">${VALUE_ADDED_PRICE} each · Rev: ${((selectedShoot.valueAddedCount || 0) * VALUE_ADDED_PRICE).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 pt-2 border-t border-white/5">
                      <div className="flex flex-col justify-center text-center">
                        <p className="text-[10px] text-muted-foreground uppercase">Video Revenue</p>
                        <p className="text-lg font-black font-orbitron text-green-400">${fin.videoRevenue.toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">{fin.totalVideoCount} video{fin.totalVideoCount !== 1 ? "s" : ""} total</p>
                      </div>
                      <div className="flex flex-col justify-center text-center">
                        <p className="text-[10px] text-muted-foreground uppercase">Editor Cost</p>
                        <p className="text-lg font-black font-orbitron text-orange-400">${fin.editorCost.toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">${EDITOR_COST_PER_VIDEO}/video × {fin.totalVideoCount}</p>
                      </div>
                      <div className="flex flex-col justify-center text-center">
                        <p className="text-[10px] text-muted-foreground uppercase">Total Cost</p>
                        <p className="text-lg font-black font-orbitron text-red-400">${fin.totalCost.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col justify-center text-center">
                        <p className="text-[10px] text-muted-foreground uppercase">Total Profit</p>
                        <p className={`text-lg font-black font-orbitron ${fin.profit >= 0 ? "text-cyan-400" : "text-red-400"}`}>${fin.profit.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="border-t border-white/5 pt-3">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-orbitron mb-1.5">Revenue Breakdown</p>
                          <div className="space-y-1">
                            <div className="flex justify-between"><span className="text-muted-foreground">Actor charge ({selectedShoot.actorMinutes || 0}min × ${ACTOR_CHARGE}/hr)</span><span className="text-green-400 font-bold">${fin.actorRevenue.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Filmer charge ({selectedShoot.filmerMinutes || 0}min × ${FILMER_CHARGE}/hr)</span><span className="text-green-400 font-bold">${fin.filmerRevenue.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Video revenue ({fin.totalVideoCount} videos)</span><span className="text-green-400 font-bold">${fin.videoRevenue.toFixed(2)}</span></div>
                            <div className="flex justify-between border-t border-white/5 pt-1 mt-1"><span className="font-bold">Total Revenue</span><span className="text-green-400 font-black">${fin.totalRevenue.toFixed(2)}</span></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-orbitron mb-1.5">Cost Breakdown</p>
                          <div className="space-y-1">
                            <div className="flex justify-between"><span className="text-muted-foreground">Actor cost ({selectedShoot.actorMinutes || 0}min × ${ACTOR_COST}/hr)</span><span className="text-red-400 font-bold">${fin.actorCost.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Filmer cost ({selectedShoot.filmerMinutes || 0}min × ${FILMER_COST}/hr)</span><span className="text-red-400 font-bold">${fin.filmerCost.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Editor cost ({fin.totalVideoCount} × ${EDITOR_COST_PER_VIDEO})</span><span className="text-red-400 font-bold">${fin.editorCost.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Manager's fee (10% of revenue)</span><span className="text-orange-400 font-bold">${fin.managerFee.toFixed(2)}</span></div>
                            <div className="flex justify-between border-t border-white/5 pt-1 mt-1"><span className="font-bold">Total Cost</span><span className="text-red-400 font-black">${fin.totalCost.toFixed(2)}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Dropbox Folder Links */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase font-orbitron mb-3 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-400" /> Dropbox Folder Links
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">Footage</label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Paste footage folder link..."
                        value={selectedShoot.dropboxFootage || ""}
                        onChange={e => updateShoot("dropboxFootage", e.target.value)}
                        className="bg-white/5 border-white/10 text-sm flex-1"
                      />
                      {selectedShoot.dropboxFootage && (
                        <a href={selectedShoot.dropboxFootage} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/20 transition-all">
                          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">Deliverables</label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Paste deliverables folder link..."
                        value={selectedShoot.dropboxDeliverables || ""}
                        onChange={e => updateShoot("dropboxDeliverables", e.target.value)}
                        className="bg-white/5 border-white/10 text-sm flex-1"
                      />
                      {selectedShoot.dropboxDeliverables && (
                        <a href={selectedShoot.dropboxDeliverables} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/20 transition-all">
                          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedShoot.notes && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase font-orbitron mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedShoot.notes}</p>
                </div>
              )}

              {/* Videos */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase font-orbitron flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-red-400" /> Videos ({selectedShoot.videos.length})
                  </h3>
                  <button onClick={() => setShowAddVideo(true)} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedShoot.videos.map(video => (
                    <div key={video.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 group">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-sm truncate">{video.title}</p>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${contentTypeColor[video.contentType]}`}>
                              {contentTypeLabel[video.contentType]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {video.editor && <span>Editor: {video.editor}</span>}
                            <span className="text-green-400 font-bold">${video.price}</span>
                            <button
                              onClick={() => setExpandedVideoId(video.id)}
                              className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              <FileText className="w-3 h-3" />
                              {video.script ? "Script" : "Add Script"}
                            </button>
                          </div>
                        </div>
                        <select
                          value={video.editStatus}
                          onChange={e => updateVideoStatus(video.id, e.target.value as EditStatus)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border focus:outline-none ${editStatusColor[video.editStatus]}`}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="editing">Editing</option>
                          <option value="review">In Review</option>
                          <option value="done">Done</option>
                        </select>
                        <button onClick={() => deleteVideo(video.id)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all">
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedShoot.videos.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">No videos added yet</p>
                  )}
                </div>
              </div>

              {showAddVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAddVideo(false)}>
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                  <div className="relative w-full max-w-md rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 p-6" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-orbitron font-bold">Add Video</h3>
                      <button onClick={() => setShowAddVideo(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="space-y-3">
                      <Input placeholder="Video title *" value={newVideo.title} onChange={e => setNewVideo(p => ({ ...p, title: e.target.value }))} className="bg-white/5 border-white/10" />
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Content Type</label>
                        <div className="flex gap-2">
                          {(["short-form", "vsl", "value-added"] as ContentType[]).map(ct => (
                            <button
                              key={ct}
                              onClick={() => setNewVideo(p => ({ ...p, contentType: ct }))}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${newVideo.contentType === ct ? contentTypeColor[ct] : "bg-white/5 border-white/10 text-muted-foreground"}`}
                            >
                              {contentTypeLabel[ct]}
                              <span className="block text-[10px] opacity-70">${getVideoPrice(ct)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <Input placeholder="Editor name (optional)" value={newVideo.editor} onChange={e => setNewVideo(p => ({ ...p, editor: e.target.value }))} className="bg-white/5 border-white/10" />
                      <textarea
                        placeholder="Paste script (optional)..."
                        value={newVideo.script}
                        onChange={e => setNewVideo(p => ({ ...p, script: e.target.value }))}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground resize-none h-24 focus:outline-none focus:border-yellow-500/40"
                      />
                      <button onClick={addVideo} className="w-full py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/30 transition-all">
                        Add Video
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {expandedVideoId && (() => {
                const video = selectedShoot.videos.find(v => v.id === expandedVideoId);
                if (!video) return null;
                return (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setExpandedVideoId(null)}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative w-full max-w-lg rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 p-6" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-orbitron font-bold flex items-center gap-2">
                            <FileText className="w-4 h-4 text-yellow-400" /> Script
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{video.title}</p>
                        </div>
                        <button onClick={() => setExpandedVideoId(null)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        placeholder="Paste script here..."
                        value={video.script || ""}
                        onChange={e => updateVideoScript(video.id, e.target.value)}
                        className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground resize-y min-h-[200px] h-[300px] focus:outline-none focus:border-yellow-500/40"
                      />
                    </div>
                  </div>
                );
              })()}

            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentPortal;
