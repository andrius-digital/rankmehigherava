import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, LogOut, User, Shield, Lock,
  Clapperboard, UserCheck, UsersRound, Palette, CreditCard, Clock, Phone, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TeamSession {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

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

export function getTeamSession(): TeamSession | null {
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
  const [loggedIn, setLoggedIn] = useState<TeamSession | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const existing = getTeamSession();
    if (existing) {
      setLoggedIn(existing);
      setCheckingSession(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const teamData = await fetchTeamData(session.user.id);
        if (teamData) {
          sessionStorage.setItem(TEAM_SESSION_KEY, JSON.stringify(teamData));
          setLoggedIn(teamData);
        }
      }
      setCheckingSession(false);
    });
  }, []);

  async function fetchTeamData(userId: string): Promise<TeamSession | null> {
    const { data, error } = await supabase
      .from("team_portal_members" as any)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      id: (data as any).id,
      user_id: (data as any).user_id,
      name: (data as any).name,
      email: (data as any).email,
      role: (data as any).role,
      permissions: (data as any).permissions || [],
    };
  }

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.trim(),
        password: passwordInput,
      });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (!data.user) {
        toast({ title: "Login failed", description: "No user returned", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      const teamData = await fetchTeamData(data.user.id);
      if (!teamData) {
        await supabase.auth.signOut();
        toast({ title: "Access denied", description: "This account is not a team portal member. Use the admin login instead.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      sessionStorage.setItem(TEAM_SESSION_KEY, JSON.stringify(teamData));
      setLoggedIn(teamData);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    clearTeamSession();
    await supabase.auth.signOut();
    setLoggedIn(null);
    setEmailInput("");
    setPasswordInput("");
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  <Shield className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="font-orbitron font-bold text-lg mb-1">Team Portal</h2>
                <p className="text-xs text-muted-foreground mb-6">Sign in with your team credentials</p>
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && document.getElementById("team-pwd")?.focus()}
                      className="bg-white/5 border-white/10 pl-9"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="team-pwd"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      className="bg-white/5 border-white/10 pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm hover:bg-cyan-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>
                <Link to="/auth" className="block text-center text-[11px] text-muted-foreground mt-4 hover:text-cyan-400 transition-colors">
                  Admin Sign In
                </Link>
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
