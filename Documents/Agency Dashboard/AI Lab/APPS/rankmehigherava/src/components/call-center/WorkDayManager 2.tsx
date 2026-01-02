import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWeekend, addWeeks, subWeeks } from "date-fns";

interface Client {
  id: string;
  name: string;
}

interface WorkDay {
  id: string;
  client_id: string;
  work_date: string;
  worked: boolean;
}

const WorkDayManager = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchWorkDays();
    }
  }, [selectedClient, currentWeekStart]);

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("id, name").order("name");
    if (data) {
      setClients(data);
      if (data.length > 0 && !selectedClient) {
        setSelectedClient(data[0].id);
      }
    }
  };

  const fetchWorkDays = async () => {
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const { data } = await supabase
      .from("work_days")
      .select("*")
      .eq("client_id", selectedClient)
      .gte("work_date", format(currentWeekStart, "yyyy-MM-dd"))
      .lte("work_date", format(weekEnd, "yyyy-MM-dd"));
    
    if (data) setWorkDays(data);
  };

  const toggleWorkDay = async (date: Date) => {
    if (!selectedClient) return;
    
    setLoading(true);
    const dateStr = format(date, "yyyy-MM-dd");
    const existing = workDays.find(wd => wd.work_date === dateStr);

    if (existing) {
      // Toggle existing
      const { error } = await supabase
        .from("work_days")
        .update({ worked: !existing.worked })
        .eq("id", existing.id);
      
      if (error) {
        toast({ title: "Error updating", description: error.message, variant: "destructive" });
      } else {
        fetchWorkDays();
      }
    } else {
      // Create new (marking as worked)
      const { error } = await supabase
        .from("work_days")
        .insert({ client_id: selectedClient, work_date: dateStr, worked: true });
      
      if (error) {
        toast({ title: "Error saving", description: error.message, variant: "destructive" });
      } else {
        fetchWorkDays();
      }
    }
    setLoading(false);
  };

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn: 1 })
  }).filter(day => !isWeekend(day)); // Only Mon-Fri

  const isWorked = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const workDay = workDays.find(wd => wd.work_date === dateStr);
    return workDay?.worked ?? false;
  };

  const workedCount = weekDays.filter(day => isWorked(day)).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              Work Day Tracker
            </CardTitle>
            <CardDescription>
              Toggle days when agents called for this client. Only worked days count towards cost.
            </CardDescription>
          </div>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous Week
          </Button>
          <span className="font-medium">
            {format(currentWeekStart, "MMM d")} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}>
            Next Week <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {weekDays.map(day => {
            const worked = isWorked(day);
            return (
              <div 
                key={day.toISOString()} 
                className={`p-4 rounded-lg border text-center transition-colors ${
                  worked 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="text-sm font-medium text-muted-foreground">
                  {format(day, "EEE")}
                </div>
                <div className="text-2xl font-bold my-2">
                  {format(day, "d")}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Switch
                    checked={worked}
                    onCheckedChange={() => toggleWorkDay(day)}
                    disabled={loading}
                  />
                  <span className="text-xs text-muted-foreground">
                    {worked ? "Worked" : "Off"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-center">
          <span className="text-muted-foreground">This week: </span>
          <span className="font-bold text-green-600">{workedCount}</span>
          <span className="text-muted-foreground"> of 5 days worked</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkDayManager;