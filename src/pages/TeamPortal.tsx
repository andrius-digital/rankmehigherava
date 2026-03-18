import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, LogOut, User, Shield, Lock, Mail,
  Clapperboard, UserCheck, UsersRound, Palette, CreditCard, Clock, Phone, Loader2, LogIn, MapPin
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
  "gbp-management": { label: "GBP Management", icon: MapPin, description: "Local SEO Hub", href: "/gbpmanagement", color: "cyan" },
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
              <Card className="w-full max-w-md relative z-10 border-cyan-400/30 overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-cyan-900/30 to-blue-950/40 backdrop-blur-xl" />

                <svg className="absolute inset-0 w-full h-full opacity-10 blur-sm" viewBox="0 0 400 600">
                  <defs>
                    <linearGradient id="teamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                    </linearGradient>
                    <filter id="teamGlow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <circle cx="200" cy="100" r="8" fill="url(#teamGradient)" filter="url(#teamGlow)" className="animate-pulse" />
                  <circle cx="120" cy="150" r="6" fill="url(#teamGradient)" filter="url(#teamGlow)" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <circle cx="280" cy="150" r="6" fill="url(#teamGradient)" filter="url(#teamGlow)" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <circle cx="80" cy="250" r="7" fill="url(#teamGradient)" filter="url(#teamGlow)" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                  <circle cx="200" cy="250" r="9" fill="url(#teamGradient)" filter="url(#teamGlow)" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
                  <circle cx="320" cy="250" r="7" fill="url(#teamGradient)" filter="url(#teamGlow)" className="animate-pulse" style={{ animationDelay: '1s' }} />
                  <circle cx="150" cy="350" r="6" fill="url(#teamGradient)" filter="url(#teamGlow)" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
                  <circle cx="250" cy="350" r="6" fill="url(#teamGradient)" filter="url(#teamGlow)" className="animate-pulse" style={{ animationDelay: '1.4s' }} />
                  <line x1="200" y1="100" x2="120" y2="150" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.4" filter="url(#teamGlow)" />
                  <line x1="200" y1="100" x2="280" y2="150" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.4" filter="url(#teamGlow)" />
                  <line x1="120" y1="150" x2="80" y2="250" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.4" filter="url(#teamGlow)" />
                  <line x1="120" y1="150" x2="200" y2="250" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.4" filter="url(#teamGlow)" />
                  <line x1="280" y1="150" x2="200" y2="250" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.4" filter="url(#teamGlow)" />
                  <line x1="280" y1="150" x2="320" y2="250" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.4" filter="url(#teamGlow)" />
                  <line x1="80" y1="250" x2="150" y2="350" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.4" filter="url(#teamGlow)" />
                  <line x1="200" y1="250" x2="150" y2="350" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.4" filter="url(#teamGlow)" />
                  <line x1="200" y1="250" x2="250" y2="350" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.4" filter="url(#teamGlow)" />
                  <line x1="320" y1="250" x2="250" y2="350" stroke="url(#teamGradient)" strokeWidth="2" opacity="0.4" filter="url(#teamGlow)" />
                </svg>

                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent animate-scan" />
                </div>

                <div className="absolute inset-0 rounded-lg border-2 border-cyan-400/20 shadow-[inset_0_0_60px_rgba(6,182,212,0.1)]" />

                <CardHeader className="text-center space-y-6 pb-8 relative z-10">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                        <Shield className="w-8 h-8 text-cyan-300" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-ping" style={{ animationDuration: '3s' }} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-orbitron font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                      Team Portal
                    </CardTitle>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                      <span className="text-xs font-orbitron tracking-[0.2em] text-cyan-300 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">Secure Team Access</span>
                    </div>
                    <CardDescription className="text-cyan-100/80 font-orbitron text-sm">
                      Sign in with your team credentials
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4 pb-8">
                  <div className="space-y-2">
                    <Label htmlFor="team-email" className="font-orbitron text-xs tracking-wider text-cyan-200">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-300/80" />
                      <Input
                        id="team-email"
                        placeholder="you@example.com"
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && document.getElementById("team-pwd")?.focus()}
                        className="pl-10 bg-blue-950/30 border-cyan-400/30 focus:border-cyan-300/60 font-orbitron text-cyan-100 placeholder:text-cyan-300/40 backdrop-blur-sm"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team-pwd" className="font-orbitron text-xs tracking-wider text-cyan-200">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/60" />
                      <Input
                        id="team-pwd"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleLogin()}
                        className="pl-10 bg-background/50 border-cyan-400/20 focus:border-cyan-400/50 font-orbitron"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-orbitron tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <LogIn className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>

                  <Link to="/auth" className="block text-center text-[11px] text-cyan-300/50 mt-2 hover:text-cyan-300 transition-colors font-orbitron tracking-wider">
                    Admin Sign In
                  </Link>
                </CardContent>
              </Card>
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
