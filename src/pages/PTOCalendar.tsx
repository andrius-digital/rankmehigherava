import { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Plus, X, ChevronLeft, ChevronRight, Trash2,
  Palmtree, Thermometer, User, Star, CalendarDays, Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import HUDOverlay from "@/components/ui/HUDOverlay";

interface PTOEntry {
  id: string;
  member_name: string;
  member_email: string | null;
  start_date: string;
  end_date: string;
  type: string;
  notes: string | null;
  status: string;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: typeof Palmtree; bg: string }> = {
  vacation: { label: "Vacation", color: "text-cyan-400", icon: Palmtree, bg: "bg-cyan-500/20 border-cyan-500/40" },
  sick: { label: "Sick Day", color: "text-red-400", icon: Thermometer, bg: "bg-red-500/20 border-red-500/40" },
  personal: { label: "Personal", color: "text-violet-400", icon: User, bg: "bg-violet-500/20 border-violet-500/40" },
  holiday: { label: "Holiday", color: "text-amber-400", icon: Star, bg: "bg-amber-500/20 border-amber-500/40" },
  other: { label: "Other", color: "text-gray-400", icon: Clock, bg: "bg-gray-500/20 border-gray-500/40" },
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysBetween(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

const PTOCalendar = () => {
  const [entries, setEntries] = useState<PTOEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [form, setForm] = useState({ member_name: "", start_date: "", end_date: "", type: "vacation", notes: "" });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const { toast } = useToast();

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pto_entries")
      .select("*")
      .order("start_date", { ascending: true });
    if (error) {
      console.error("Error loading PTO entries:", error);
    } else {
      setEntries((data as PTOEntry[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const addEntry = async () => {
    if (!form.member_name || !form.start_date || !form.end_date) {
      toast({ title: "Missing fields", description: "Name, start date, and end date are required.", variant: "destructive" });
      return;
    }
    if (form.end_date < form.start_date) {
      toast({ title: "Invalid dates", description: "End date must be on or after start date.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("pto_entries").insert({
      member_name: form.member_name,
      start_date: form.start_date,
      end_date: form.end_date,
      type: form.type,
      notes: form.notes || null,
      status: "approved",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "PTO added!" });
      setForm({ member_name: "", start_date: "", end_date: "", type: "vacation", notes: "" });
      setShowAdd(false);
      await loadEntries();
    }
    setSaving(false);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("pto_entries").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  const getEntriesForDay = useCallback((day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return entries.filter(e => e.start_date <= dateStr && e.end_date >= dateStr);
  }, [entries, year, month]);

  const selectedDayEntries = useMemo(() => {
    if (!selectedDay) return [];
    return entries.filter(e => e.start_date <= selectedDay && e.end_date >= selectedDay);
  }, [selectedDay, entries]);

  const upcomingEntries = useMemo(() => {
    const today = toDateStr(new Date());
    return entries.filter(e => e.end_date >= today).slice(0, 10);
  }, [entries]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToday = () => setCurrentMonth(new Date());

  const backPath = (() => {
    try {
      const s = sessionStorage.getItem("rmh_team_session");
      if (s) return "/team";
    } catch {}
    return "/avaadminpanel";
  })();

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <Helmet><title>PTO Calendar | Rank Me Higher</title></Helmet>
      <HUDOverlay />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to={backPath} className="p-2 rounded-lg bg-card/30 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
              <ArrowLeft className="w-5 h-5 text-cyan-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                PTO Calendar
              </h1>
              <p className="text-sm text-muted-foreground">Paid Time Off Tracker</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" /> Add PTO
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-card/30 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <ChevronLeft className="w-5 h-5 text-cyan-400" />
              </button>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-orbitron font-bold text-foreground">
                  {MONTHS[month]} {year}
                </h2>
                <button onClick={goToday} className="text-xs px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors">
                  Today
                </button>
              </div>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <ChevronRight className="w-5 h-5 text-cyan-400" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2 uppercase tracking-wider">
                  {d}
                </div>
              ))}
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEntries = getEntriesForDay(day);
                const isToday = dateStr === toDateStr(new Date());
                const isSelected = dateStr === selectedDay;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                    className={`aspect-square p-1 rounded-lg border transition-all text-left flex flex-col ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/10"
                        : isToday
                        ? "border-cyan-500/30 bg-cyan-500/5"
                        : "border-transparent hover:border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-xs font-medium ${isToday ? "text-cyan-400 font-bold" : "text-muted-foreground"}`}>
                      {day}
                    </span>
                    <div className="flex flex-wrap gap-0.5 mt-auto">
                      {dayEntries.slice(0, 3).map(e => {
                        const cfg = TYPE_CONFIG[e.type] || TYPE_CONFIG.other;
                        return (
                          <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace("text-", "bg-")}`} title={`${e.member_name} - ${cfg.label}`} />
                        );
                      })}
                      {dayEntries.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{dayEntries.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5">
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${cfg.color.replace("text-", "bg-")}`} />
                  <span className="text-xs text-muted-foreground">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Selected Day Detail */}
            {selectedDay && (
              <div className="bg-card/30 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-4">
                <h3 className="font-orbitron font-bold text-sm text-cyan-400 mb-3">
                  {new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                {selectedDayEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No PTO scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayEntries.map(e => {
                      const cfg = TYPE_CONFIG[e.type] || TYPE_CONFIG.other;
                      const Icon = cfg.icon;
                      return (
                        <div key={e.id} className={`p-3 rounded-lg border ${cfg.bg} flex items-start justify-between gap-2`}>
                          <div className="flex items-start gap-2 min-w-0">
                            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{e.member_name}</p>
                              <p className="text-xs text-muted-foreground">{cfg.label} · {daysBetween(e.start_date, e.end_date)}d</p>
                              <p className="text-xs text-muted-foreground">{formatDate(e.start_date)} – {formatDate(e.end_date)}</p>
                              {e.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{e.notes}"</p>}
                            </div>
                          </div>
                          <button onClick={() => deleteEntry(e.id)} className="p-1 rounded hover:bg-red-500/20 transition-colors flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming PTO */}
            <div className="bg-card/30 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-4">
              <h3 className="font-orbitron font-bold text-sm text-cyan-400 mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Upcoming PTO
              </h3>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : upcomingEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming time off</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEntries.map(e => {
                    const cfg = TYPE_CONFIG[e.type] || TYPE_CONFIG.other;
                    const Icon = cfg.icon;
                    const isActive = e.start_date <= toDateStr(new Date());
                    return (
                      <div key={e.id} className={`p-2.5 rounded-lg border transition-all ${isActive ? cfg.bg : "border-white/5 bg-white/[0.02]"} flex items-center justify-between gap-2`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{e.member_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(e.start_date)} – {formatDate(e.end_date)}
                              {isActive && <span className="ml-1 text-cyan-400">(now)</span>}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => deleteEntry(e.id)} className="p-1 rounded hover:bg-red-500/20 transition-colors flex-shrink-0 opacity-50 hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add PTO Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-card/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-orbitron font-bold text-lg text-foreground">Add PTO</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Team Member</label>
                <input
                  value={form.member_name}
                  onChange={e => setForm(f => ({ ...f, member_name: e.target.value }))}
                  placeholder="Name"
                  className="w-full bg-card/40 border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value, end_date: f.end_date < e.target.value ? e.target.value : f.end_date }))}
                    className="w-full bg-card/40 border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-cyan-500/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    min={form.start_date}
                    className="w-full bg-card/40 border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm text-foreground focus:border-cyan-500/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const active = form.type === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setForm(f => ({ ...f, type: key }))}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                          active ? `${cfg.bg} ${cfg.color}` : "border-white/10 text-muted-foreground hover:border-white/20"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wider">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Reason, trip details, coverage plan..."
                  className="w-full bg-card/40 border border-cyan-500/20 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500/50 focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                onClick={addEntry}
                disabled={saving || !form.member_name || !form.start_date || !form.end_date}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {saving ? "Saving..." : "Add Time Off"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PTOCalendar;
