import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Video, Camera, MapPin, ChevronRight, Clapperboard,
  User, KeyRound, LogOut, Calendar, Clock, FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type ShootStatus = "scheduled" | "in-progress" | "completed" | "cancelled";
type EditStatus = "not-started" | "editing" | "review" | "done";
type ContentType = "short-form" | "vsl" | "value-added";
type ScriptStatus = "draft" | "ai-generated" | "approved";

interface ShootVideo {
  id: string;
  title: string;
  contentType: ContentType;
  editor: string;
  editStatus: EditStatus;
  script: string;
  scriptStatus: ScriptStatus;
}

interface Shoot {
  id: string;
  clientId: string;
  name: string;
  date: string;
  location: string;
  status: ShootStatus;
  managerName: string;
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
  industry: string;
  email: string;
  phone: string;
  dropboxFolder: string;
  onboardedAt: string;
  shoots: Shoot[];
}

interface VideoManager {
  id: string;
  name: string;
  email: string;
  accessCode: string;
  createdAt: string;
}

const STORAGE_KEY = "rmh_content_portal";
const MANAGERS_KEY = "rmh_video_managers";

const editStatusLabel: Record<EditStatus, string> = { "not-started": "Not Started", "editing": "Editing", "review": "In Review", "done": "Done" };
const editStatusColor: Record<EditStatus, string> = {
  "not-started": "text-gray-400 bg-gray-500/10 border-gray-500/20",
  "editing": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "review": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "done": "text-green-400 bg-green-500/10 border-green-500/20",
};
const contentTypeLabel: Record<ContentType, string> = { "short-form": "Short Form Ad", "vsl": "VSL", "value-added": "Value Added" };

const ManagerPortal = () => {
  const [loggedInManager, setLoggedInManager] = useState<VideoManager | null>(null);
  const [accessInput, setAccessInput] = useState("");
  const [selectedShootData, setSelectedShootData] = useState<{ shoot: Shoot; client: Client } | null>(null);
  const { toast } = useToast();

  const getClients = (): Client[] => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
  };
  const getManagers = (): VideoManager[] => {
    try { const raw = localStorage.getItem(MANAGERS_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
  };

  const handleLogin = () => {
    const managers = getManagers();
    const found = managers.find(m => m.accessCode === accessInput.trim());
    if (found) { setLoggedInManager(found); }
    else { toast({ title: "Invalid code", description: "Please check your access code and try again.", variant: "destructive" }); }
  };

  const getManagerShoots = () => {
    if (!loggedInManager) return [];
    const clients = getClients();
    return clients.flatMap(c =>
      c.shoots
        .filter(s => s.managerName === loggedInManager.name)
        .map(s => ({ shoot: s, client: c }))
    ).sort((a, b) => new Date(a.shoot.date).getTime() - new Date(b.shoot.date).getTime());
  };

  const managerShoots = loggedInManager ? getManagerShoots() : [];

  const pipeline: { label: string; status: ShootStatus; color: string; dotColor: string }[] = [
    { label: "Scheduled", status: "scheduled", color: "border-blue-500/30", dotColor: "bg-blue-400" },
    { label: "In Progress", status: "in-progress", color: "border-yellow-500/30", dotColor: "bg-yellow-400 animate-pulse" },
    { label: "Completed", status: "completed", color: "border-green-500/30", dotColor: "bg-green-400" },
  ];

  return (
    <>
      <Helmet><title>Manager Portal | Content Portal</title></Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-4">
            <button
              onClick={() => {
                if (selectedShootData) { setSelectedShootData(null); }
                else if (loggedInManager) { setLoggedInManager(null); setAccessInput(""); }
                else { window.location.href = "/"; }
              }}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-red-400" />
              <h1 className="font-orbitron font-bold text-base lg:text-lg">Manager Portal</h1>
            </div>
            {loggedInManager && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground"><User className="w-3 h-3 inline mr-1" />{loggedInManager.name}</span>
                <button onClick={() => { setLoggedInManager(null); setSelectedShootData(null); setAccessInput(""); }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-all">
                  <LogOut className="w-3 h-3" /> Exit
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          {!loggedInManager && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="font-orbitron font-bold text-lg mb-1">Manager Portal</h2>
                <p className="text-xs text-muted-foreground mb-6">Enter your access code to view your assigned shoots</p>
                <Input
                  placeholder="Access code"
                  value={accessInput}
                  onChange={e => setAccessInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="bg-white/5 border-white/10 text-center font-mono font-bold tracking-widest mb-3"
                />
                <button onClick={handleLogin} className="w-full py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm hover:bg-cyan-500/30 transition-all">
                  Access My Shoots
                </button>
              </div>
            </div>
          )}

          {loggedInManager && !selectedShootData && (
            <div>
              <div className="mb-6">
                <h2 className="font-orbitron font-bold text-xl">My Shoots</h2>
                <p className="text-xs text-muted-foreground mt-1">{managerShoots.length} shoot{managerShoots.length !== 1 ? "s" : ""} assigned to you</p>
              </div>

              {managerShoots.length === 0 ? (
                <div className="text-center py-16">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-sm text-muted-foreground">No shoots assigned to you yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
                  {pipeline.map(col => {
                    const colShoots = managerShoots.filter(s => s.shoot.status === col.status);
                    return (
                      <div key={col.status} className={`rounded-xl bg-white/[0.03] border ${col.color} p-3`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase font-orbitron text-muted-foreground">{col.label}</span>
                          <span className="text-[10px] text-muted-foreground">{colShoots.length}</span>
                        </div>
                        <div className="space-y-2">
                          {colShoots.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-3">None</p>}
                          {colShoots.map(({ shoot, client }) => (
                            <button
                              key={shoot.id}
                              onClick={() => setSelectedShootData({ shoot, client })}
                              className="w-full flex items-center gap-2.5 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.07] transition-all text-left group"
                            >
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dotColor}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{shoot.name || client.name}</p>
                                <p className="text-[10px] text-muted-foreground">{client.name} — {client.business}</p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                                  <span>{new Date(shoot.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                                  <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{shoot.location}</span>
                                  <span>{shoot.videos.length} video{shoot.videos.length !== 1 ? "s" : ""}</span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {loggedInManager && selectedShootData && (() => {
            const { shoot, client } = selectedShootData;
            return (
              <div>
                <div className="mb-6">
                  <h2 className="font-orbitron font-bold text-xl">{shoot.name || client.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{new Date(shoot.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                    <span>·</span>
                    <MapPin className="w-3 h-3" /> {shoot.location}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{client.name} — {client.business}</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Videos</p>
                    <p className="text-lg font-bold text-cyan-400">{shoot.videos.length}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Done</p>
                    <p className="text-lg font-bold text-green-400">{shoot.videos.filter(v => v.editStatus === "done").length}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">In Progress</p>
                    <p className="text-lg font-bold text-yellow-400">{shoot.videos.filter(v => v.editStatus === "editing" || v.editStatus === "review").length}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Not Started</p>
                    <p className="text-lg font-bold text-gray-400">{shoot.videos.filter(v => v.editStatus === "not-started").length}</p>
                  </div>
                </div>

                {shoot.notes && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Notes</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{shoot.notes}</p>
                  </div>
                )}

                {shoot.dropboxFootage || shoot.dropboxDeliverables ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                    {shoot.dropboxFootage && (
                      <a href={shoot.dropboxFootage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all text-sm">
                        <Video className="w-4 h-4 text-cyan-400" /> Footage Folder
                      </a>
                    )}
                    {shoot.dropboxDeliverables && (
                      <a href={shoot.dropboxDeliverables} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all text-sm">
                        <FileText className="w-4 h-4 text-green-400" /> Deliverables Folder
                      </a>
                    )}
                  </div>
                ) : null}

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center gap-1.5"><Video className="w-4 h-4 text-red-400" /> Videos ({shoot.videos.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {shoot.videos.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No videos yet</p>}
                    {shoot.videos.map(video => (
                      <div key={video.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-bold">{video.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border border-white/10 bg-white/5">{contentTypeLabel[video.contentType]}</span>
                              {video.editor && <span>Editor: {video.editor}</span>}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${editStatusColor[video.editStatus]}`}>
                          {editStatusLabel[video.editStatus]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
};

export default ManagerPortal;
