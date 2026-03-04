import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Plus, X, Users, Trash2, Copy, KeyRound, Shield,
  Clapperboard, UserCheck, UsersRound, Palette, CreditCard, Clock, Phone,
  ChevronDown, RefreshCw, User, Lock, Eye, EyeOff
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  username: string;
  password: string;
  permissions: string[];
  createdAt: string;
}

const TEAM_KEY = "rmh_team_members";

const AVAILABLE_PERMISSIONS = [
  { id: "content-portal", label: "Content Portal", icon: Clapperboard, description: "Shoots & video tracking" },
  { id: "applicant-tracker", label: "Applicant Tracker", icon: UserCheck, description: "AI-screened applications" },
  { id: "client-portal", label: "Client Portal", icon: UsersRound, description: "Websites & funnels" },
  { id: "build-website", label: "Build Website", icon: Palette, description: "AI design tools" },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, description: "Billing management" },
  { id: "team-tracker", label: "Team Tracker", icon: Clock, description: "Payroll & time" },
  { id: "call-center-kpi", label: "Call Center KPI", icon: Phone, description: "Leads & analytics" },
];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function generateUsername(name: string, existingUsernames: string[]): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
  if (!base) return "user" + Math.floor(Math.random() * 9000 + 1000);
  let candidate = base;
  let counter = 1;
  while (existingUsernames.includes(candidate)) {
    candidate = base + counter;
    counter++;
  }
  return candidate;
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const special = "!@#$%";
  let pwd = "";
  for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  pwd += Math.floor(Math.random() * 90 + 10);
  return pwd;
}

function loadTeam(): TeamMember[] {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    let needsSave = false;
    const existingUsernames: string[] = parsed.filter(m => m.username).map(m => m.username);
    const migrated = parsed.map(m => {
      if (!m.username || !m.password) {
        needsSave = true;
        const username = generateUsername(m.name || "user", existingUsernames);
        existingUsernames.push(username);
        return { ...m, username, password: generatePassword() };
      }
      return m;
    });
    if (needsSave) localStorage.setItem(TEAM_KEY, JSON.stringify(migrated));
    return migrated;
  } catch { return []; }
}
function saveTeam(members: TeamMember[]) { localStorage.setItem(TEAM_KEY, JSON.stringify(members)); }

const TeamAccess = () => {
  const [members, setMembers] = useState<TeamMember[]>(loadTeam);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "" });
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const persist = (updated: TeamMember[]) => { setMembers(updated); saveTeam(updated); };

  const addMember = () => {
    if (!newMember.name || !newMember.email) return;
    const existingUsernames = members.map(m => m.username);
    const username = generateUsername(newMember.name, existingUsernames);
    const password = generatePassword();
    const member: TeamMember = {
      id: generateId(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role || "Team Member",
      username,
      password,
      permissions: selectedPerms,
      createdAt: new Date().toISOString(),
    };
    persist([...members, member]);
    setNewMember({ name: "", email: "", role: "" });
    setSelectedPerms([]);
    setShowAdd(false);
    toast({ title: "Team member added", description: `Login: ${username}` });
  };

  const deleteMember = (id: string) => { persist(members.filter(m => m.id !== id)); toast({ title: "Member removed" }); };

  const togglePerm = (memberId: string, permId: string) => {
    persist(members.map(m => {
      if (m.id !== memberId) return m;
      const perms = m.permissions.includes(permId)
        ? m.permissions.filter(p => p !== permId)
        : [...m.permissions, permId];
      return { ...m, permissions: perms };
    }));
  };

  const regeneratePassword = (id: string) => {
    const newPwd = generatePassword();
    persist(members.map(m => m.id === id ? { ...m, password: newPwd } : m));
    toast({ title: "New password generated" });
  };

  const copyCredentials = (member: TeamMember) => {
    const text = `Username: ${member.username}\nPassword: ${member.password}\nLogin at: /team-portal`;
    navigator.clipboard.writeText(text);
    toast({ title: "Login credentials copied!" });
  };

  return (
    <>
      <Helmet><title>Team Access | Rank Me Higher</title></Helmet>
      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-4">
            <Link to="/avaadminpanel" className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h1 className="font-orbitron font-bold text-base lg:text-lg">Team Access</h1>
            </div>
            <div className="ml-auto">
              <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/30 transition-all">
                <Plus className="w-3.5 h-3.5" /> Add Member
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
          <div className="mb-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
            <p className="text-xs text-cyan-400">Team members can log in at <Link to="/team-portal" className="font-mono font-bold underline underline-offset-2 hover:text-cyan-300">/team-portal</Link> using their generated username and password. They'll only see the cards you've enabled for them.</p>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-sm text-muted-foreground">No team members yet. Add your first team member above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                  <div
                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-all cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setExpandedId(expandedId === member.id ? null : member.id); }}
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-orbitron font-bold text-sm text-cyan-400">{member.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm truncate">{member.name}</p>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/5 border border-white/10 text-muted-foreground">{member.role}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{member.email} · {member.permissions.length} permission{member.permissions.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10">
                        <User className="w-3 h-3 text-cyan-400" />
                        <span className="text-xs font-mono font-bold">{member.username}</span>
                        <button onClick={e => { e.stopPropagation(); copyCredentials(member); }} className="ml-1 hover:text-cyan-400 transition-colors">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === member.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {expandedId === member.id && (
                    <div className="border-t border-white/10 p-4">
                      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/10">
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Username</p>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <input
                              type="text"
                              value={member.username}
                              onChange={e => {
                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
                                persist(members.map(m => m.id === member.id ? { ...m, username: val } : m));
                              }}
                              className="bg-transparent text-sm font-mono font-bold w-full outline-none border-b border-transparent focus:border-cyan-500/40 transition-colors"
                            />
                          </div>
                        </div>
                        <div className="w-px h-10 bg-white/10 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Password</p>
                          <div className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                            <input
                              type={showPasswords[member.id] ? "text" : "password"}
                              value={member.password}
                              onChange={e => persist(members.map(m => m.id === member.id ? { ...m, password: e.target.value } : m))}
                              className="bg-transparent text-sm font-mono font-bold w-full outline-none border-b border-transparent focus:border-cyan-500/40 transition-colors"
                            />
                            <button
                              onClick={() => setShowPasswords(p => ({ ...p, [member.id]: !p[member.id] }))}
                              className="hover:text-cyan-400 transition-colors flex-shrink-0"
                            >
                              {showPasswords[member.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => copyCredentials(member)}
                          className="px-2 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-bold hover:bg-cyan-500/20 transition-all flex items-center gap-1 flex-shrink-0"
                        >
                          <Copy className="w-3 h-3" /> Copy Login
                        </button>
                      </div>

                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Access Permissions</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                        {AVAILABLE_PERMISSIONS.map(perm => {
                          const Icon = perm.icon;
                          const enabled = member.permissions.includes(perm.id);
                          return (
                            <button
                              key={perm.id}
                              onClick={() => togglePerm(member.id, perm.id)}
                              className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left ${
                                enabled
                                  ? "bg-cyan-500/10 border-cyan-500/30 text-foreground"
                                  : "bg-white/[0.02] border-white/10 text-muted-foreground hover:border-white/20"
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                                enabled ? "bg-cyan-500/20" : "bg-white/5"
                              }`}>
                                <Icon className={`w-3.5 h-3.5 ${enabled ? "text-cyan-400" : "text-muted-foreground"}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate">{perm.label}</p>
                                <p className="text-[9px] text-muted-foreground truncate">{perm.description}</p>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-auto ${
                                enabled ? "border-cyan-400 bg-cyan-400" : "border-white/20"
                              }`}>
                                {enabled && <div className="w-1.5 h-1.5 rounded-full bg-background" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button onClick={() => regeneratePassword(member.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
                          <RefreshCw className="w-3 h-3" /> Reset Password
                        </button>
                        <button onClick={() => deleteMember(member.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 transition-all ml-auto">
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative w-full max-w-lg rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron font-bold">Add Team Member</h3>
                <button onClick={() => setShowAdd(false)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><X className="w-3.5 h-3.5" /></button>
              </div>
              <div className="space-y-3 mb-5">
                <Input placeholder="Full name *" value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} className="bg-white/5 border-white/10" />
                <Input placeholder="Email *" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} className="bg-white/5 border-white/10" />
                <Input placeholder="Role (e.g. Editor, Manager)" value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))} className="bg-white/5 border-white/10" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Grant Access To</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
                {AVAILABLE_PERMISSIONS.map(perm => {
                  const Icon = perm.icon;
                  const selected = selectedPerms.includes(perm.id);
                  return (
                    <button
                      key={perm.id}
                      onClick={() => setSelectedPerms(prev => selected ? prev.filter(p => p !== perm.id) : [...prev, perm.id])}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                        selected ? "bg-cyan-500/10 border-cyan-500/30" : "bg-white/[0.02] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${selected ? "text-cyan-400" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-bold ${selected ? "text-foreground" : "text-muted-foreground"}`}>{perm.label}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={addMember} className="w-full py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm hover:bg-cyan-500/30 transition-all">
                Add Member & Generate Login
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeamAccess;
