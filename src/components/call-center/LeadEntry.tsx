import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  is_active: boolean;
}

interface Client {
  id: string;
  name: string;
}

const LeadEntry = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    agent_id: "",
    client_id: "",
    job_name: "",
    client_name: "",
    client_phone: "",
    client_address: "",
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [agentsRes, clientsRes] = await Promise.all([
      supabase.from("agents").select("id, name, is_active").eq("is_active", true).order("name"),
      supabase.from("clients").select("id, name").order("name")
    ]);
    
    if (agentsRes.data) setAgents(agentsRes.data);
    if (clientsRes.data) setClients(clientsRes.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agent_id) {
      toast({
        title: "Select an agent",
        description: "Please select the agent who booked this lead",
        variant: "destructive"
      });
      return;
    }

    if (!formData.job_name.trim() || !formData.client_name.trim()) {
      toast({
        title: "Missing information",
        description: "Job name and client name are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("leads")
      .insert({
        agent_id: formData.agent_id,
        client_id: formData.client_id || null,
        job_name: formData.job_name.trim(),
        client_name: formData.client_name.trim(),
        client_phone: formData.client_phone.trim() || null,
        client_address: formData.client_address.trim() || null,
        notes: formData.notes.trim() || null
      });

    if (error) {
      toast({
        title: "Error saving lead",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({ 
        title: "Lead added successfully!",
        description: `${formData.job_name} for ${formData.client_name} has been booked.`
      });
      // Reset form but keep agent and client selected
      setFormData({
        ...formData,
        job_name: "",
        client_name: "",
        client_phone: "",
        client_address: "",
        notes: ""
      });
    }

    setLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Add New Lead
        </CardTitle>
        <CardDescription>
          Enter the details of the job you just booked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent & Client Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent">Your Name (Agent) *</Label>
              <Select 
                value={formData.agent_id} 
                onValueChange={(value) => setFormData({ ...formData, agent_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your name" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {agents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No agents found. Please add agents first.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client Company</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job Details */}
          <div className="space-y-2">
            <Label htmlFor="job_name">Job Name / Type *</Label>
            <Input
              id="job_name"
              value={formData.job_name}
              onChange={(e) => setFormData({ ...formData, job_name: e.target.value })}
              placeholder="e.g., AC Repair, Plumbing Service"
              required
            />
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Customer Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_phone">Customer Phone</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_address">Customer Address</Label>
              <Input
                id="client_address"
                value={formData.client_address}
                onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about the job..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Add Lead"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadEntry;
