import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Brain,
  Globe,
  Phone,
  Bug,
  BarChart3,
  LogOut,
  Settings,
  Zap,
  Cog,
  Workflow,
  FileText,
  CreditCard,
  Kanban,
  UsersRound,
  Activity,
  Search,
  Wallet,
  Cpu,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import AgencyCard from '@/components/agency/AgencyCard';
import StatusIndicator from '@/components/agency/StatusIndicator';
import HUDOverlay from '@/components/ui/HUDOverlay';
import MissionClock from '@/components/agency/MissionClock';
import CommandCenterGrid from '@/components/agency/CommandCenterGrid';
import AvaAvatar from '@/components/agency/AvaAvatar';

const ClientProfile: React.FC = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Client Profile | AVA Command Center</title>
        <meta name="description" content="AVA - Advanced Virtual Assistant. Your AI-powered spaceship brain managing all marketing operations from a single futuristic interface." />
      </Helmet>

      {/* HUD Background effects */}
      <HUDOverlay />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-primary/20 bg-card/30 backdrop-blur-xl sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left side - AVA Avatar & Title */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <AvaAvatar />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="font-orbitron text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                      AVA
                    </h1>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-orbitron tracking-widest text-cyan-400 uppercase">Online</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground hidden sm:block font-orbitron tracking-wider">
                    Rank Me Higher's AI Command Center
                  </p>
                </div>
              </div>

              {/* Right side - Status & User */}
              <div className="flex items-center gap-4">
                {/* System status */}
                <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-lg bg-card/50 border border-primary/20">
                  <StatusIndicator status="online" label="All Systems" />
                  <div className="w-px h-4 bg-border" />
                  <MissionClock />
                </div>

                {/* User actions */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="hidden sm:flex">
                    <Settings className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-3 pl-3 border-l border-border/50">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-foreground">{user?.email?.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={signOut}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 container mx-auto px-4 py-4 overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-8">
            <CommandCenterGrid>
              {/* SECTION: WEBSITES */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-orbitron text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">Websites</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <AgencyCard
                    title="Client Portal"
                    description="Profile Setup & Data Submission"
                    icon={UsersRound}
                    href="/client-portal"
                    accentColor="websites"
                    actionLabel="Open Portal"
                    size="compact"
                    delay={100}
                  />
                  <AgencyCard
                    title="Build New Website"
                    description="AI Design & Deployment"
                    icon={Palette}
                    href="/website-prompting"
                    accentColor="websites"
                    actionLabel="Launch Builder"
                    size="compact"
                    delay={150}
                  />
                </div>
              </div>

              {/* SECTION: SEO */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-orbitron text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">SEO</h2>
                </div>
                <AgencyCard
                  title="Local Map Booster"
                  description="Optimize your GMB rankings"
                  icon={Activity}
                  href="/localmapbooster"
                  accentColor="ai"
                  actionLabel="Boost Map"
                  size="medium"
                  delay={200}
                />
              </div>

              {/* SECTION: CALL CENTERS */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Phone className="w-4 h-4 text-orange-400" />
                  <h2 className="font-orbitron text-xs font-bold tracking-[0.2em] text-orange-400 uppercase">Call Centers</h2>
                </div>
                <AgencyCard
                  title="Call Center KPI"
                  description="Leads, metrics & analytics"
                  icon={BarChart3}
                  href="/call-center-kpi"
                  accentColor="calls"
                  actionLabel="View KPIs"
                  size="medium"
                  delay={250}
                />
              </div>

              {/* SECTION: AI LAB */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <h2 className="font-orbitron text-xs font-bold tracking-[0.2em] text-purple-400 uppercase">AI Lab</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <AgencyCard
                    title="AVA SEO"
                    description="AI SEO Analysis"
                    icon={Bug}
                    href="/avaseo"
                    accentColor="ai"
                    actionLabel="Search"
                    size="compact"
                    delay={300}
                  />
                  <AgencyCard
                    title="Drum Kit Bazaar"
                    description="Digital Asset Hub"
                    icon={Zap}
                    href="#"
                    accentColor="operations"
                    actionLabel="Open"
                    size="compact"
                    delay={350}
                  />
                  <AgencyCard
                    title="CDL Agency"
                    description="Logistics & Dispatch"
                    icon={Workflow}
                    href="#"
                    accentColor="operations"
                    actionLabel="Launch"
                    size="compact"
                    delay={400}
                  />
                </div>
              </div>

              {/* SECTION: ACCOUNTING */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <h2 className="font-orbitron text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">Accounting</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <AgencyCard
                    title="Subscriptions"
                    description="Costs & Billing"
                    icon={CreditCard}
                    href="/subscriptions"
                    accentColor="operations"
                    actionLabel="Manage"
                    size="compact"
                    delay={450}
                  />
                  <AgencyCard
                    title="Payroll"
                    description="Team Compensation"
                    icon={UsersRound}
                    href="#"
                    accentColor="operations"
                    actionLabel="Run Payroll"
                    size="compact"
                    delay={500}
                  />
                </div>
              </div>
            </CommandCenterGrid>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-primary/20 bg-card/10 backdrop-blur-sm py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
              <p className="font-orbitron">© {new Date().getFullYear()} AVA AI Spaceship. All systems operational.</p>
              <div className="flex items-center gap-4">
                <StatusIndicator status="online" label="v2.0" />
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="font-orbitron text-xs bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">AVA BRAIN ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ClientProfile;
