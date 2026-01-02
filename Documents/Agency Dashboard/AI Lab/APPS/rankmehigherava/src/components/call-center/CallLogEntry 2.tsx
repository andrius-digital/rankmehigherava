import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Phone, Plus } from "lucide-react";
import { format } from "date-fns";

interface Agent {
  id: string;
  name: string;
  is_active: boolean;
}

interface CallLog {
  id: string;
  agent_id: string;
  calls_made: number;
  calls_answered: number;
  call_date: string;
  agents?: Agent;
}

const CallLogEntry = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recentLogs, setRecentLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agent_id: "",
    calls_made: "",
    calls_answered: "",
    call_date: format(new Date(), "yyyy-MM-dd")
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
    fetchRecentLogs();
  }, []);

  const fetchAgents = async () => {
    const { data } = await supabase
      .from("agents")
      .select("id, name, is_active")
      .eq("is_active", true)
      .order("name");
    
    if (data) setAgents(data);
  };

  const fetchRecentLogs = async () => {
    const { data } = await supabase
      .from("call_logs")
      .select("*, agents(id, name, is_active)")
      .order("call_date", { ascending: false })
      .limit(10);
    
    if (data) setRecentLogs(data as CallLog[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agent_id) {
      toast({
        title: "Select an agent",
        description: "Please select the agent for this call log",
        variant: "destructive"
      });
      return;
    }

    const callsMade = parseInt(formData.calls_made) || 0;
    const callsAnswered = parseInt(formData.calls_answered) || 0;

    if (callsMade <= 0) {
      toast({
        title: "Invalid calls made",
        description: "Please enter the number of calls made",
        variant: "destructive"
      });
      return;
    }

    if (callsAnswered > callsMade) {
      toast({
        title: "Invalid data",
        description: "Calls answered cannot be more than calls made",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Use upsert to handle duplicate date entries for same agent
    const { error } = await supabase
      .from("call_logs")
      .upsert({
        agent_id: formData.agent_id,
        calls_made: callsMade,
        calls_answered: callsAnswered,
        call_date: formData.call_date
      }, {
        onConflict: "agent_id,call_date"
      });

    if (error) {
      toast({
        title: "Error saving call log",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({ 
        title: "Call log saved!",
        description: `${callsMade} calls logged for ${formData.call_date}`
      });
      // Reset form but keep agent and date
      setFormData({
        ...formData,
        calls_made: "",
        calls_answered: ""
      });
      fetchRecentLogs();
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Log Daily Calls
          </CardTitle>
          <CardDescription>
            Record the number of calls made and answered for each day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Agent Selection */}
            <div className="space-y-2">
              <Label htmlFor="agent">Agent *</Label>
              <Select 
                value={formData.agent_id} 
                onValueChange={(value) => setFormData({ ...formData, agent_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="call_date">Date *</Label>
              <Input
                id="call_date"
                type="date"
                value={formData.call_date}
                onChange={(e) => setFormData({ ...formData, call_date: e.target.value })}
                max={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>

            {/* Call Numbers */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calls_made">Calls Made *</Label>
                <Input
                  id="calls_made"
                  type="number"
                  min="0"
                  value={formData.calls_made}
                  onChange={(e) => setFormData({ ...formData, calls_made: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calls_answered">Calls Answered</Label>
                <Input
                  id="calls_answered"
                  type="number"
                  min="0"
                  value={formData.calls_answered}
                  onChange={(e) => setFormData({ ...formData, calls_answered: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Log Calls"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Call Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Calls Made</TableHead>
                <TableHead className="text-right">Answered</TableHead>
                <TableHead className="text-right">Answer Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No call logs yet
                  </TableCell>
                </TableRow>
              ) : (
                recentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.call_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{log.agents?.name || "Unknown"}</TableCell>
                    <TableCell className="text-right">{log.calls_made}</TableCell>
                    <TableCell className="text-right">{log.calls_answered}</TableCell>
                    <TableCell className="text-right">
                      {log.calls_made > 0 
                        ? `${((log.calls_answered / log.calls_made) * 100).toFixed(0)}%` 
                        : "-"
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CallLogEntry;
