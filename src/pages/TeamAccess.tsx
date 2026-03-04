import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Plus, X, Users, Trash2, Copy, Shield,
  Clapperboard, UserCheck, UsersRound, Palette, CreditCard, Clock, Phone,
  ChevronDown, RefreshCw, User, Lock, Eye, EyeOff, Briefcase, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  created_at: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "content-portal", label: "Content Portal", icon: Clapperboard, description: "Shoots & video tracking" },
  { id: "applicant-tracker", label: "Applicant Tracker", icon: UserCheck, description: "AI-screened applications" },
  { id: "client-portal", label: "Client Portal", icon: UsersRound, description: "Websites & funnels" },
  { id: "build-website", label: "Build Website", icon: Palette, description: "AI design tools" },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, description: "Billing management" },
  { id: "team-tracker", label: "Team Tracker", icon: Clock, description: "Payroll & time" },
  { id: "call-center-kpi", label: "Call Center KPI", icon: Phone, description: "Leads & analytics" },
];

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const special = "!@#$%";
  let pwd = "";
  for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  pwd += Math.floor(Math.random() * 90 + 10);
  return pwd;
}

async function adminAction(action: string, data: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  const resp = await supabase.functions.invoke("admin-operations", {
    body: { action, data },
  });
  if (resp.error) throw new Error(resp.error.message || "Request failed");
  if (resp.data?.error) throw new Error(resp.data.error);
  return resp.data?.data;
}

const TeamAccess = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "", password: "" });
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const loadMembers = useCallback(async () => {
    try {
      const result = await adminAction("list_team_portal_members", {});
      setMembers(result || []);
    } catch (err: any) {
      toast({ title: "Failed to load team members", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const addMember = async () => {
    if (!newMember.name || !newMember.email) return;
    const password = newMember.password || generatePassword();
    setSaving(true);
    try {
      await adminAction("create_team_portal_member", {
        name: newMember.name,
        email: newMember.email,
        password,
        role: newMember.role || "Team Member",
        permissions: selectedPerms,
      });
      await loadMembers();
      const text = `Email: ${newMember.email}\nPassword: ${password}\nLogin at: /team`;
      navigator.clipboard.writeText(text);
      setNewMember({ name: "", email: "", role: "", password: "" });
      setSelectedPerms([]);
      setShowAdd(false);
      toast({ title: "Team member created!", description: "Login credentials copied to clipboard." });
    } catch (err: any) {
      toast({ title: "Failed to create member", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await adminAction("delete_team_portal_member", { id });
      setMembers(prev => prev.filter(m => m.id !== id));
      toast({ title: "Member removed" });
    } catch (err: any) {
      toast({ title: "Failed to remove member", description: err.message, variant: "destructive" });
    }
  };

  const updateMember = async (id: string, updates: Record<string, unknown>) => {
    try {
      const result = await adminAction("update_team_portal_member", { id, ...updates });
      setMembers(prev => prev.map(m => m.id === id ? { ...m, ...result } : m));
      setSavedId(id);
      setTimeout(() => setSavedId(prev => prev === id ? null : prev), 1500);
    } catch (err: any) {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    }
  };

  const togglePerm = async (memberId: string, permId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    const perms = member.permissions.includes(permId)
      ? member.permissions.filter(p => p !== permId)
      : [...member.permissions, permId];
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, permissions: perms } : m));
    await updateMember(memberId, { permissions: perms });
  };

  const resetPassword = async (id: string) => {
    const pwd = newPassword[id] || generatePassword();
    try {
      await adminAction("update_team_portal_member", { id, password: pwd });
      setNewPassword(prev => ({ ...prev, [id]: pwd }));
      setShowPasswords(prev => ({ ...prev, [id]: true }));
      toast({ title: "Password updated" });
    } catch (err: any) {
      toast({ title: "Failed to reset password", description: err.message, variant: "destructive" });
    }
  };

  const copyCredentials = (member: TeamMember) => {
    const pwd = newPassword[member.id] || "(use existing password)";
    const text = `Email: ${member.email}\nPassword: ${pwd}\nLogin at: /team`;
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
            <p className="text-xs text-cyan-400">Team members can log in at <Link to="/team" className="font-mono font-bold underline underline-offset-2 hover:text-cyan-300">/team</Link> using their email and password. They'll only see the cards you've enabled for them.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : members.length === 0 ? (
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
                      <button onClick={e => { e.stopPropagation(); copyCredentials(member); }} className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <Copy className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-bold text-muted-foreground">Copy</span>
                      </button>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === member.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {expandedId === member.id && (
                    <div className="border-t border-white/10 p-4">
                      <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-white/[0.02] border border-white/10">
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Position / Role</p>
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            <input
                              type="text"
                              value={member.role}
                              onChange={e => {
                                const val = e.target.value;
                                setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: val } : m));
                              }}
                              onBlur={() => updateMember(member.id, { role: member.role })}
                              className="bg-transparent text-sm font-bold w-full outline-none border-b border-transparent focus:border-cyan-500/40 transition-colors"
                              placeholder="e.g. Content Manager"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/10">
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Email</p>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span className="text-sm font-mono font-bold">{member.email}</span>
                          </div>
                        </div>
                        <div className="w-px h-10 bg-white/10 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-muted-foreground uppercase font-bold mb-1">New Password</p>
                          <div className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                            <input
                              type={showPasswords[member.id] ? "text" : "password"}
                              value={newPassword[member.id] || ""}
                              onChange={e => setNewPassword(prev => ({ ...prev, [member.id]: e.target.value }))}
                              placeholder="Enter new password"
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
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {savedId === member.id && (
                            <span className="text-[10px] text-green-400 font-bold animate-in fade-in">Saved</span>
                          )}
                          <button
                            onClick={() => copyCredentials(member)}
                            className="px-2 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-bold hover:bg-cyan-500/20 transition-all flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> Copy Login
                          </button>
                        </div>
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
                        <button onClick={() => resetPassword(member.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all">
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
                <Input placeholder="Email *" type="email" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} className="bg-white/5 border-white/10" />
                <Input placeholder="Password (auto-generated if empty)" type="text" value={newMember.password} onChange={e => setNewMember(p => ({ ...p, password: e.target.value }))} className="bg-white/5 border-white/10" />
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
              <button
                onClick={addMember}
                disabled={saving || !newMember.name || !newMember.email}
                className="w-full py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Creating Account..." : "Create Account & Copy Login"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeamAccess;
