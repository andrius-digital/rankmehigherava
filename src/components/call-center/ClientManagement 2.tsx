import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAdminOperations } from "@/hooks/useAdminOperations";
import { Building2, Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Client {
  id: string;
  name: string;
  daily_rate: number;
  weeks_paid: number;
  created_at: string;
}

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    daily_rate: "",
    weeks_paid: ""
  });
  const { toast } = useToast();
  const { createClient, updateClient, deleteClient: deleteClientApi, getClients } = useAdminOperations();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const { data, error } = await getClients();
    
    if (error) {
      toast({
        title: "Error fetching clients",
        description: error,
        variant: "destructive"
      });
    } else if (data) {
      setClients(data as Client[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter the client name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      daily_rate: parseFloat(formData.daily_rate) || 0,
      weeks_paid: parseInt(formData.weeks_paid) || 0
    };

    if (editingClient) {
      const { error } = await updateClient(editingClient.id, payload);

      if (error) {
        toast({ title: "Error updating client", description: error, variant: "destructive" });
      } else {
        toast({ title: "Client updated!" });
        fetchClients();
        resetForm();
      }
    } else {
      const { error } = await createClient(payload);

      if (error) {
        toast({ title: "Error adding client", description: error, variant: "destructive" });
      } else {
        toast({ title: "Client added!" });
        fetchClients();
        resetForm();
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: "", daily_rate: "", weeks_paid: "" });
    setEditingClient(null);
    setDialogOpen(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      daily_rate: client.daily_rate.toString(),
      weeks_paid: client.weeks_paid.toString()
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    const { error } = await deleteClientApi(id);

    if (error) {
      toast({ title: "Error deleting client", description: error, variant: "destructive" });
    } else {
      toast({ title: "Client deleted" });
      fetchClients();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Client Management
            </CardTitle>
            <CardDescription>Manage clients and their weekly payment rates</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Client Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ABC Plumbing Co."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daily_rate">Daily Rate ($)</Label>
                    <Input
                      id="daily_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.daily_rate}
                      onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                      placeholder="100.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeks_paid">Weeks Paid</Label>
                    <Input
                      id="weeks_paid"
                      type="number"
                      min="0"
                      value={formData.weeks_paid}
                      onChange={(e) => setFormData({ ...formData, weeks_paid: e.target.value })}
                      placeholder="10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : (editingClient ? "Update Client" : "Add Client")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead className="text-right">Daily Rate</TableHead>
              <TableHead className="text-right">Weeks Paid</TableHead>
              <TableHead className="text-right">Total Paid</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No clients yet. Add your first client above.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-right">
                    <span className="flex items-center justify-end gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {client.daily_rate.toFixed(2)}/day
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{client.weeks_paid}</TableCell>
                  <TableCell className="text-right">
                    <span className="flex items-center justify-end gap-1 font-medium text-green-600">
                      <DollarSign className="h-4 w-4" />
                      {(client.daily_rate * client.weeks_paid * 7).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(client)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ClientManagement;
