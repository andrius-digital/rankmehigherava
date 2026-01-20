import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import KPIDashboard from "@/components/call-center/KPIDashboard";
import AgentManagement from "@/components/call-center/AgentManagement";
import LeadEntry from "@/components/call-center/LeadEntry";
import CallLogEntry from "@/components/call-center/CallLogEntry";
import ClientDashboard from "@/components/call-center/ClientDashboard";
import ClientManagement from "@/components/call-center/ClientManagement";
import WorkDayManager from "@/components/call-center/WorkDayManager";
import ClientOnboarding from "@/components/call-center/ClientOnboarding";
import AgentViewDashboard from "@/components/call-center/AgentViewDashboard";
import { Shield, Eye, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ViewMode = 'admin' | 'client' | 'agent';

const CallCenterKPI = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [agents, setAgents] = useState<{ id: string; name: string; client_id: string | null }[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  useEffect(() => {
    const fetchAgents = async () => {
      const { data } = await supabase
        .from('agents')
        .select('id, name, client_id')
        .eq('is_active', true)
        .order('name');
      if (data) setAgents(data);
    };
    fetchAgents();
  }, []);

  const getViewTitle = () => {
    switch (viewMode) {
      case 'admin': return "Call Center Admin";
      case 'client': return "Performance Dashboard";
      case 'agent': return "Agent Dashboard";
    }
  };

  const getViewDescription = () => {
    switch (viewMode) {
      case 'admin': return "Manage agents, clients, track calls, and enter leads";
      case 'client': return "View your campaign performance and booked leads";
      case 'agent': return "Book leads and track your performance";
    }
  };

  return (
    <>
      <Helmet>
        <title>Call Center KPI Tracker | CDL Agency</title>
        <meta name="description" content="Track call center performance, manage agents, and monitor leads booked by virtual assistants." />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* AVA-Style Header with View Toggle */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              {/* AVA Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                <Phone className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground font-orbitron">
                  {getViewTitle()}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {getViewDescription()}
                </p>
              </div>
            </div>
            
            {/* View Toggle - AVA Style */}
            <div className="flex items-center gap-1 p-1 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
              <button
                onClick={() => setViewMode('client')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'client' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm' 
                    : 'text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Client</span>
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'admin' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm' 
                    : 'text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Admin</span>
              </button>
              <button
                onClick={() => setViewMode('agent')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'agent' 
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm' 
                    : 'text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10'
                }`}
              >
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Agent</span>
              </button>
            </div>
          </div>
          
          {viewMode === 'admin' && (
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 gap-1 h-auto p-1 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                <TabsTrigger value="dashboard" className="py-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/30 rounded-lg">Dashboard</TabsTrigger>
                <TabsTrigger value="onboard" className="py-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/30 rounded-lg">Add Client</TabsTrigger>
                <TabsTrigger value="clients" className="py-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/30 rounded-lg">Clients</TabsTrigger>
                <TabsTrigger value="workdays" className="py-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/30 rounded-lg">Work Days</TabsTrigger>
                <TabsTrigger value="agents" className="py-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/30 rounded-lg">Agents</TabsTrigger>
                <TabsTrigger value="leads" className="py-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/30 rounded-lg">Add Lead</TabsTrigger>
                <TabsTrigger value="calls" className="py-2 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-500/30 rounded-lg">Log Calls</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <KPIDashboard />
              </TabsContent>

              <TabsContent value="onboard">
                <ClientOnboarding />
              </TabsContent>

              <TabsContent value="clients">
                <ClientManagement />
              </TabsContent>

              <TabsContent value="workdays">
                <WorkDayManager />
              </TabsContent>
              
              <TabsContent value="agents">
                <AgentManagement />
              </TabsContent>
              
              <TabsContent value="leads">
                <LeadEntry />
              </TabsContent>
              
              <TabsContent value="calls">
                <CallLogEntry />
              </TabsContent>
            </Tabs>
          )}

          {viewMode === 'client' && <ClientDashboard />}

          {viewMode === 'agent' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Label>Select Agent:</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedAgentId ? (
                <AgentViewDashboard agentId={selectedAgentId} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Select an agent to view their dashboard
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default CallCenterKPI;
