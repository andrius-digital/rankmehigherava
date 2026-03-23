import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Video, Film, ChevronDown, ChevronUp,
  User, KeyRound, LogOut, Calendar, MapPin
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type EditStatus = "not-started" | "editing" | "review" | "done";
type ContentType = "short-form" | "vsl" | "value-added" | "youtube";

interface ShootVideo {
  id: string;
  title: string;
  contentType: ContentType;
  editor: string;
  editStatus: EditStatus;
}

interface Shoot {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  videos: ShootVideo[];
  dropboxFootage: string;
  dropboxDeliverables: string;
  notes: string;
}

interface Client {
  id: string;
  name: string;
  business: string;
  shoots: Shoot[];
}

interface Editor {
  id: string;
  name: string;
  email: string;
  accessCode: string;
}

const CP_TABLE = "content_portal_data" as any;

const editStatusLabel: Record<EditStatus, string> = { "not-started": "Not Started", "editing": "Editing", "review": "In Review", "done": "Done" };
const editStatusColor: Record<EditStatus, string> = {
  "not-started": "text-gray-400 bg-gray-500/10 border-gray-500/20",
  "editing": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "review": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "done": "text-green-400 bg-green-500/10 border-green-500/20",
};
const contentTypeLabel: Record<ContentType, string> = { "short-form": "Short Form", "vsl": "VSL", "value-added": "Value Added", "youtube": "YouTube" };

const EditorPortal = () => {
  const [loggedInEditor, setLoggedInEditor] = useState<Editor | null>(null);
  const [accessInput, setAccessInput] = useState("");
  const [cpData, setCpData] = useState<{ clients: Client[]; editors: Editor[] }>({ clients: [], editors: [] });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<EditStatus | "all">("all");
  const [expandedShoot, setExpandedShoot] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from(CP_TABLE).select("*").eq("id", 1).maybeSingle().then(({ data, error }) => {
      if (error) {
        toast({ title: "Connection error", description: "Could not load data. Please try again.", variant: "destructive" });
      } else if (data) {
        setCpData({ clients: (data as any).clients || [], editors: (data as any).editors || [] });
      }
      setDataLoaded(true);
    });
  }, []);

  const normalizeCode = (code: string) => code.toUpperCase().replace(/O/g, '0').replace(/I/g, '1').replace(/L/g, '1');
  const handleLogin = () => {
    const input = normalizeCode(accessInput.trim());
    const found = cpData.editors.find(e => normalizeCode(e.accessCode || '') === input);
    if (found) { setLoggedInEditor(found); }
    else { toast({ title: "Invalid code", description: "Please check your access code and try again.", variant: "destructive" }); }
  };

  const getAssignedVideos = () => {
    if (!loggedInEditor) return [];
    return cpData.clients.flatMap(c =>
      c.shoots.flatMap(s =>
        s.videos
          .filter(v => v.editor === loggedInEditor.name)
          .map(v => ({ ...v, clientName: c.name, shootName: s.name, shootId: s.id, shootDate: s.date, shootLocation: s.location }))
      )
    );
  };

  const getAssignedByShoot = () => {
    if (!loggedInEditor) return [];
    const result: { shoot: Shoot; client: Client; videos: ShootVideo[] }[] = [];
    cpData.clients.forEach(c => {
      c.shoots.forEach(s => {
        const assigned = s.videos.filter(v => v.editor === loggedInEditor.name);
        if (assigned.length > 0) {
          result.push({ shoot: s, client: c, videos: assigned });
        }
      });
    });
    return result.sort((a, b) => new Date(b.shoot.date).getTime() - new Date(a.shoot.date).getTime());
  };

  const allVideos = loggedInEditor ? getAssignedVideos() : [];
  const shootGroups = loggedInEditor ? getAssignedByShoot() : [];
  const filteredVideos = statusFilter === "all" ? allVideos : allVideos.filter(v => v.editStatus === statusFilter);

  const stats = {
    total: allVideos.length,
    notStarted: allVideos.filter(v => v.editStatus === "not-started").length,
    editing: allVideos.filter(v => v.editStatus === "editing").length,
    review: allVideos.filter(v => v.editStatus === "review").length,
    done: allVideos.filter(v => v.editStatus === "done").length,
  };
  const completionPct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <>
      <Helmet><title>Editor Portal | Content Portal</title></Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-4">
            <button
              onClick={() => {
                if (loggedInEditor) { setLoggedInEditor(null); setAccessInput(""); setStatusFilter("all"); }
                else { window.location.href = "/"; }
              }}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-400" />
              <h1 className="font-orbitron font-bold text-base lg:text-lg">Editor Portal</h1>
            </div>
            {loggedInEditor && (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground"><User className="w-3 h-3 inline mr-1" />{loggedInEditor.name}</span>
                <button onClick={() => { setLoggedInEditor(null); setAccessInput(""); setStatusFilter("all"); }} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-all">
                  <LogOut className="w-3 h-3" /> Exit
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
          {!loggedInEditor && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-purple-400" />
                </div>
                <h2 className="font-orbitron font-bold text-lg mb-1">Editor Portal</h2>
                <p className="text-xs text-muted-foreground mb-6">Enter your access code to view your assigned videos</p>
                <Input
                  placeholder="Access code"
                  value={accessInput}
                  onChange={e => setAccessInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="bg-white/5 border-white/10 text-center font-mono font-bold tracking-widest mb-3"
                />
                <button onClick={handleLogin} className="w-full py-2.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 font-bold text-sm hover:bg-purple-500/30 transition-all">
                  Access My Videos
                </button>
              </div>
            </div>
          )}

          {loggedInEditor && (
            <div>
              <div className="mb-6">
                <h2 className="font-orbitron font-bold text-xl">My Assigned Videos</h2>
                <p className="text-xs text-muted-foreground mt-1">{stats.total} video{stats.total !== 1 ? "s" : ""} assigned to you</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                {([
                  { label: "Total", value: stats.total, color: "text-foreground", border: "border-white/10", filterVal: "all" as const },
                  { label: "Not Started", value: stats.notStarted, color: "text-gray-400", border: "border-gray-500/20", filterVal: "not-started" as const },
                  { label: "Editing", value: stats.editing, color: "text-yellow-400", border: "border-yellow-500/20", filterVal: "editing" as const },
                  { label: "In Review", value: stats.review, color: "text-blue-400", border: "border-blue-500/20", filterVal: "review" as const },
                  { label: "Done", value: stats.done, color: "text-green-400", border: "border-green-500/20", filterVal: "done" as const },
                ] as const).map(s => (
                  <button
                    key={s.label}
                    onClick={() => setStatusFilter(s.filterVal)}
                    className={`p-3 rounded-xl bg-white/5 border text-left transition-all ${statusFilter === s.filterVal ? s.border.replace("/20", "") + " bg-white/10" : s.border}`}
                  >
                    <p className="text-[10px] text-muted-foreground uppercase font-orbitron">{s.label}</p>
                    <p className={`text-xl font-black font-orbitron ${s.color}`}>{s.value}</p>
                  </button>
                ))}
              </div>

              {stats.total > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Overall completion</span>
                    <span className="text-xs font-bold text-muted-foreground">{completionPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${completionPct === 100 ? "bg-green-400" : "bg-purple-400"}`}
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              )}

              {allVideos.length === 0 ? (
                <div className="text-center py-16">
                  <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-sm text-muted-foreground">No videos assigned to you yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shootGroups.map(({ shoot, client, videos }) => {
                    const shootVids = statusFilter === "all" ? videos : videos.filter(v => v.editStatus === statusFilter);
                    if (shootVids.length === 0) return null;
                    const isOpen = expandedShoot === shoot.id;
                    const shootDone = videos.filter(v => v.editStatus === "done").length;
                    return (
                      <div key={shoot.id} className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
                        <button
                          onClick={() => setExpandedShoot(isOpen ? null : shoot.id)}
                          className="w-full text-left p-4 hover:bg-white/[0.03] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm">{client.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                                <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" />{new Date(shoot.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                {shoot.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{shoot.location}</span>}
                                <span>{shootVids.length} video{shootVids.length !== 1 ? "s" : ""}</span>
                                <span className="text-green-400">{shootDone}/{videos.length} done</span>
                              </div>
                            </div>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 space-y-2">
                            {shootVids.map(video => (
                              <div key={video.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
                                <div>
                                  <p className="text-sm font-bold">{video.title}</p>
                                  <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded border border-white/10 bg-white/5 font-bold">{contentTypeLabel[video.contentType]}</span>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${editStatusColor[video.editStatus]}`}>
                                  {editStatusLabel[video.editStatus]}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditorPortal;
