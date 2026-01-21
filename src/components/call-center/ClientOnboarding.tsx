import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Copy, Check } from "lucide-react";

export default function ClientOnboarding() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    daily_rate: "",
    campaign_length: "",
    campaign_budget: "",
  });

  // Auto-calculate budget when daily rate and campaign length change
  const calculatedBudget = formData.daily_rate && formData.campaign_length
    ? (parseFloat(formData.daily_rate) * parseInt(formData.campaign_length)).toFixed(2)
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.daily_rate || !formData.campaign_length) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }

    const budget = formData.campaign_budget 
      ? parseFloat(formData.campaign_budget) 
      : parseFloat(formData.daily_rate) * parseInt(formData.campaign_length);

    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        daily_rate: parseFloat(formData.daily_rate),
        campaign_length: parseInt(formData.campaign_length),
        campaign_budget: budget,
        campaign_start_date: new Date().toISOString().split("T")[0],
        weeks_paid: 0,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    const link = `${window.location.origin}/agent-onboard/${data.id}`;
    setGeneratedLink(link);
    toast({ title: "Success", description: "Client created! Share the agent link below." });
    setFormData({ name: "", email: "", phone: "", daily_rate: "", campaign_length: "", campaign_budget: "" });
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Link copied to clipboard" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Add New Client
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="company@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily_rate">Daily Rate ($) *</Label>
              <Input
                id="daily_rate"
                type="number"
                step="0.01"
                value={formData.daily_rate}
                onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_length">Campaign Length (days) *</Label>
              <Input
                id="campaign_length"
                type="number"
                value={formData.campaign_length}
                onChange={(e) => setFormData({ ...formData, campaign_length: e.target.value })}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_budget">
                Total Campaign Budget ($)
                {calculatedBudget && !formData.campaign_budget && (
                  <span className="text-muted-foreground ml-2">= ${calculatedBudget}</span>
                )}
              </Label>
              <Input
                id="campaign_budget"
                type="number"
                step="0.01"
                value={formData.campaign_budget}
                onChange={(e) => setFormData({ ...formData, campaign_budget: e.target.value })}
                placeholder={calculatedBudget || "Auto-calculated"}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Client & Generate Agent Link"}
          </Button>
        </form>

        {generatedLink && (
          <div className="mt-6 p-4 bg-muted rounded-lg border-2 border-primary">
            <p className="text-sm font-medium mb-2">Agent Onboarding Link:</p>
            <div className="flex items-center gap-2">
              <Input value={generatedLink} readOnly className="flex-1 text-sm" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Send this link to VAs to onboard as agents for this client.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
