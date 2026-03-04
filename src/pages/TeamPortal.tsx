import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, KeyRound, LogOut, User, Shield,
  Clapperboard, UserCheck, UsersRound, Palette, CreditCard, Clock, Phone
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  accessCode: string;
  permissions: string[];
  createdAt: string;
}

const TEAM_KEY = "rmh_team_members";
const TEAM_SESSION_KEY = "rmh_team_session";

const colorClasses: Record<string, string> = {
  cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400",
  green: "from-green-500/20 to-green-600/20 border-green-500/30 text-green-400",
  emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400",
  orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400",
};

const CARD_CONFIG: Record<string, { label: string; icon: typeof Clapperboard; description: string; href: string; color: string }> = {
  "content-portal": { label: "Content Portal", icon: Clapperboard, description: "Shoots & video tracking", href: "/content-portal", color: "cyan" },
  "applicant-tracker": { label: "Applicant Tracker", icon: UserCheck, description: "AI-screened applications", href: "/applicant-tracker", color: "cyan" },
  "client-portal": { label: "Client Portal", icon: UsersRound, description: "Websites & funnels", href: "/client-portal", color: "green" },
  "build-website": { label: "Build Website", icon: Palette, description: "AI design tools", href: "/website-prompting", color: "green" },
  "subscriptions": { label: "Subscriptions", icon: CreditCard, description: "Billing management", href: "/subscriptions", color: "emerald" },
  "team-tracker": { label: "Team Tracker", icon: Clock, description: "Payroll & time", href: "/team-tracker", color: "emerald" },
  "call-center-kpi": { label: "Call Center KPI", icon: Phone, description: "Leads & analytics", href: "/call-center-kpi", color: "orange" },
};

export function getTeamSession(): TeamMember | null {
  try {
    const raw = sessionStorage.getItem(TEAM_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function hasTeamPermission(permId: string): boolean {
  const session = getTeamSession();
  if (!session) return false;
  return session.permissions.includes(permId);
}

export function clearTeamSession() {
  sessionStorage.removeItem(TEAM_SESSION_KEY);
}

const TeamPortal = () => {
  const [loggedIn, setLoggedIn] = useState<TeamMember | null>(null);
  const [accessInput, setAccessInput] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const existing = getTeamSession();
    if (existing) setLoggedIn(existing);
  }, []);

  const handleLogin = () => {
    try {
      const raw = localStorage.getItem(TEAM_KEY);
      const members: TeamMember[] = raw ? JSON.parse(raw) : [];
      const found = members.find(m => m.accessCode === accessInput.trim());
      if (found) {
        sessionStorage.setItem(TEAM_SESSION_KEY, JSON.stringify(found));
        setLoggedIn(found);
      } else {
        toast({ title: "Invalid code", description: "Please check your access code and try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    clearTeamSession();
    setLoggedIn(null);
    setAccessInput("");
  };

  const permittedCards = loggedIn
    ? loggedIn.permissions.map(p => CARD_CONFIG[p]).filter(Boolean)
    : [];

  return (
    <>
      <Helmet><title>Team Portal | Rank Me Higher</title></Helmet>
      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-4">
            <button
              onClick={() => {
                if (loggedIn) { handleLogout(); }
                else { navigate("/"); }
              }}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h1 className="font-orbitron font-bold text-base lg:text-lg">Team Portal</h1>
            </div>
            {loggedIn && (
              <div className="ml-auto flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  <User className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-bold">{loggedIn.name}</span>
                  <span className="text-[9px] text-muted-foreground px-1.5 py-0.5 rounded bg-white/5">{loggedIn.role}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-all">
                  <LogOut className="w-3 h-3" /> Exit
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6">
          {!loggedIn && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-full max-w-sm rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="font-orbitron font-bold text-lg mb-1">Team Portal</h2>
                <p className="text-xs text-muted-foreground mb-6">Enter your access code to get started</p>
                <Input
                  placeholder="Access code"
                  value={accessInput}
                  onChange={e => setAccessInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="bg-white/5 border-white/10 text-center font-mono font-bold tracking-widest mb-3"
                />
                <button onClick={handleLogin} className="w-full py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm hover:bg-cyan-500/30 transition-all">
                  Access Portal
                </button>
              </div>
            </div>
          )}

          {loggedIn && (
            <div>
              <div className="mb-6">
                <h2 className="font-orbitron font-bold text-xl">Welcome, {loggedIn.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{permittedCards.length} tool{permittedCards.length !== 1 ? "s" : ""} available to you</p>
              </div>

              {permittedCards.length === 0 ? (
                <div className="text-center py-16 rounded-xl bg-white/5 border border-white/10">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <p className="text-sm text-muted-foreground">No tools have been assigned to you yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Contact your admin to get access.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permittedCards.map(card => {
                    const Icon = card.icon;
                    return (
                      <Link
                        key={card.href}
                        to={card.href}
                        className="group relative bg-card/20 backdrop-blur-md border border-primary/10 rounded-2xl p-6 hover:border-primary/40 transition-all hover:translate-y-[-4px] overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                        <div className="relative z-10 space-y-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[card.color] || colorClasses.cyan} border flex items-center justify-center`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-orbitron font-bold text-lg text-foreground mb-2">{card.label}</h3>
                            <p className="text-sm text-muted-foreground">{card.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-primary text-sm font-orbitron font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Open <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Link>
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

export default TeamPortal;
