import { useState, useEffect, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Trash2, Check, X,
  Palmtree, Thermometer, User, Star, Clock, CalendarDays
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

const TYPE_CONFIG: Record<string, { label: string; color: string; dot: string; icon: typeof Palmtree; bg: string }> = {
  vacation: { label: "Vacation", color: "text-cyan-400", dot: "bg-cyan-400", icon: Palmtree, bg: "bg-cyan-500/20 border-cyan-500/40" },
  sick: { label: "Sick", color: "text-red-400", dot: "bg-red-400", icon: Thermometer, bg: "bg-red-500/20 border-red-500/40" },
  personal: { label: "Personal", color: "text-violet-400", dot: "bg-violet-400", icon: User, bg: "bg-violet-500/20 border-violet-500/40" },
  holiday: { label: "Holiday", color: "text-amber-400", dot: "bg-amber-400", icon: Star, bg: "bg-amber-500/20 border-amber-500/40" },
  other: { label: "Other", color: "text-gray-400", dot: "bg-gray-400", icon: Clock, bg: "bg-gray-500/20 border-gray-500/40" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}
function makeDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function formatShort(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function dayCount(a: string, b: string) {
  return Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000) + 1;
}

const PTOCalendar = () => {
  const [entries, setEntries] = useState<PTOEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [rangeStart, setRangeStart] = useState<string | null>(null);
  const [rangeEnd, setRangeEnd] = useState<string | null>(null);
  const [form, setForm] = useState({ member_name: "", type: "vacation", notes: "" });
  const [viewDay, setViewDay] = useState<string | null>(null);
  const { toast } = useToast();

  const today = toDateStr(new Date());
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isSelecting = rangeStart !== null;
  const selStart = rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeStart : rangeEnd) : rangeStart;
  const selEnd = rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeEnd : rangeStart) : rangeStart;

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("pto_entries").select("*").order("start_date", { ascending: true });
    if (error) console.error(error);
    else setEntries((data as PTOEntry[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handleDayClick = (dateStr: string) => {
    if (!isSelecting) {
      setRangeStart(dateStr);
      setRangeEnd(dateStr);
    } else {
      setRangeEnd(dateStr);
    }
  };

  const confirmRange = async () => {
    if (!selStart || !selEnd || !form.member_name) {
      toast({ title: "Enter a name", description: "Type the team member's name to continue.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("pto_entries").insert({
      member_name: form.member_name,
      start_date: selStart,
      end_date: selEnd,
      type: form.type,
      notes: form.notes || null,
      status: "approved",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "PTO added!" });
      setForm({ member_name: "", type: "vacation", notes: "" });
      cancelRange();
      await loadEntries();
    }
    setSaving(false);
  };

  const cancelRange = () => {
    setRangeStart(null);
    setRangeEnd(null);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("pto_entries").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setEntries(prev => prev.filter(e => e.id !== id));
  };

  const getEntriesForDay = useCallback((dateStr: string) => {
    return entries.filter(e => e.start_date <= dateStr && e.end_date >= dateStr);
  }, [entries]);

  const upcomingEntries = useMemo(() => entries.filter(e => e.end_date >= today).slice(0, 8), [entries, today]);

  const viewDayEntries = useMemo(() => {
    if (!viewDay) return [];
    return entries.filter(e => e.start_date <= viewDay && e.end_date >= viewDay);
  }, [viewDay, entries]);

  const backPath = (() => {
    try { if (sessionStorage.getItem("rmh_team_session")) return "/team"; } catch {}
    return "/avaadminpanel";
  })();

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [firstDow, daysInMonth]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <Helmet><title>PTO Calendar | Rank Me Higher</title></Helmet>
      <HUDOverlay />

      <div className="relative z-10 max-w-6xl mx-auto px-3 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link to={backPath} className="p-1.5 rounded-lg bg-card/30 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
          </Link>
          <h1 className="text-lg font-orbitron font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            PTO Calendar
          </h1>
          {!isSelecting && (
            <span className="text-xs text-muted-foreground ml-auto">Click a date to start selecting</span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Calendar — takes 3 cols */}
          <div className="lg:col-span-3 bg-card/30 backdrop-blur-md border border-cyan-500/20 rounded-xl p-3">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-white/5">
                <ChevronLeft className="w-4 h-4 text-cyan-400" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-orbitron font-bold">{MONTHS[month]} {year}</span>
                <button onClick={() => setCurrentMonth(new Date())} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20">
                  Today
                </button>
              </div>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-white/5">
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_SHORT.map((d, i) => (
                <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-[2px]">
              {calendarCells.map((day, i) => {
                if (day === null) return <div key={`e${i}`} className="h-10" />;
                const dateStr = makeDateStr(year, month, day);
                const dayEntries = getEntriesForDay(dateStr);
                const isToday = dateStr === today;
                const inRange = selStart && selEnd && dateStr >= selStart && dateStr <= selEnd;
                const isRangeEdge = dateStr === selStart || dateStr === selEnd;
                const isViewing = dateStr === viewDay && !isSelecting;

                return (
                  <button
                    key={dateStr}
                    onClick={() => isSelecting ? handleDayClick(dateStr) : (rangeStart ? null : handleDayClick(dateStr))}
                    onDoubleClick={() => { if (!isSelecting) { setViewDay(dateStr === viewDay ? null : dateStr); } }}
                    className={`h-10 rounded-md flex flex-col items-center justify-center relative transition-all ${
                      isRangeEdge
                        ? "bg-cyan-500/30 border border-cyan-400"
                        : inRange
                        ? "bg-cyan-500/15 border border-cyan-500/30"
                        : isViewing
                        ? "bg-white/10 border border-white/20"
                        : isToday
                        ? "border border-cyan-500/30"
                        : "border border-transparent hover:bg-white/5"
                    }`}
                  >
                    <span className={`text-xs leading-none ${isToday ? "text-cyan-400 font-bold" : isRangeEdge ? "text-cyan-300 font-bold" : "text-muted-foreground"}`}>
                      {day}
                    </span>
                    {dayEntries.length > 0 && (
                      <div className="flex gap-[2px] mt-0.5">
                        {dayEntries.slice(0, 4).map(e => (
                          <div key={e.id} className={`w-1 h-1 rounded-full ${(TYPE_CONFIG[e.type] || TYPE_CONFIG.other).dot}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend row */}
            <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-white/5">
              {Object.entries(TYPE_CONFIG).map(([k, c]) => (
                <div key={k} className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  <span className="text-[10px] text-muted-foreground">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — takes 2 cols */}
          <div className="lg:col-span-2 space-y-3">
            {/* Selection form — shown when range is picked */}
            {isSelecting && (
              <div className="bg-card/40 backdrop-blur-md border border-cyan-400/40 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-orbitron font-bold text-cyan-400">
                    {selStart === selEnd ? formatShort(selStart!) : `${formatShort(selStart!)} – ${formatShort(selEnd!)}`}
                    <span className="text-muted-foreground ml-1">({dayCount(selStart!, selEnd!)}d)</span>
                  </span>
                  <button onClick={cancelRange} className="p-1 rounded hover:bg-white/10"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                </div>

                {rangeEnd && rangeEnd !== rangeStart && (
                  <p className="text-[10px] text-muted-foreground">Click another date to adjust the end, or fill in details below.</p>
                )}

                <input
                  value={form.member_name}
                  onChange={e => setForm(f => ({ ...f, member_name: e.target.value }))}
                  placeholder="Team member name"
                  className="w-full bg-card/40 border border-cyan-500/20 rounded-lg px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500/50 focus:outline-none"
                />

                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(TYPE_CONFIG).map(([k, c]) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={k}
                        onClick={() => setForm(f => ({ ...f, type: k }))}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition-all ${
                          form.type === k ? `${c.bg} ${c.color}` : "border-white/10 text-muted-foreground hover:border-white/20"
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Notes (optional)"
                  className="w-full bg-card/40 border border-cyan-500/20 rounded-lg px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan-500/50 focus:outline-none resize-none"
                />

                <button
                  onClick={confirmRange}
                  disabled={saving || !form.member_name}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  <Check className="w-4 h-4" />
                  {saving ? "Saving..." : "Confirm PTO"}
                </button>
              </div>
            )}

            {/* Day detail on double-click */}
            {viewDay && !isSelecting && (
              <div className="bg-card/30 backdrop-blur-md border border-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-orbitron font-bold text-cyan-400">
                    {new Date(viewDay + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <button onClick={() => setViewDay(null)} className="p-0.5 rounded hover:bg-white/10"><X className="w-3 h-3 text-muted-foreground" /></button>
                </div>
                {viewDayEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No PTO this day</p>
                ) : (
                  <div className="space-y-1.5">
                    {viewDayEntries.map(e => {
                      const cfg = TYPE_CONFIG[e.type] || TYPE_CONFIG.other;
                      const Icon = cfg.icon;
                      return (
                        <div key={e.id} className={`p-2 rounded-lg border ${cfg.bg} flex items-start justify-between gap-2`}>
                          <div className="flex items-start gap-1.5 min-w-0">
                            <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{e.member_name}</p>
                              <p className="text-[10px] text-muted-foreground">{cfg.label} · {formatShort(e.start_date)}–{formatShort(e.end_date)}</p>
                              {e.notes && <p className="text-[10px] text-muted-foreground italic mt-0.5">"{e.notes}"</p>}
                            </div>
                          </div>
                          <button onClick={() => deleteEntry(e.id)} className="p-0.5 rounded hover:bg-red-500/20 flex-shrink-0">
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming PTO list */}
            <div className="bg-card/30 backdrop-blur-md border border-cyan-500/20 rounded-xl p-3">
              <h3 className="font-orbitron font-bold text-xs text-cyan-400 mb-2 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Upcoming
              </h3>
              {loading ? (
                <p className="text-xs text-muted-foreground">Loading...</p>
              ) : upcomingEntries.length === 0 ? (
                <p className="text-xs text-muted-foreground">No upcoming time off</p>
              ) : (
                <div className="space-y-1.5">
                  {upcomingEntries.map(e => {
                    const cfg = TYPE_CONFIG[e.type] || TYPE_CONFIG.other;
                    const Icon = cfg.icon;
                    const active = e.start_date <= today && e.end_date >= today;
                    return (
                      <div key={e.id} className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${active ? cfg.bg : "border-white/5 bg-white/[0.02]"}`}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{e.member_name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatShort(e.start_date)}–{formatShort(e.end_date)}
                              {active && <span className="text-cyan-400 ml-1">(now)</span>}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => deleteEntry(e.id)} className="p-0.5 rounded hover:bg-red-500/20 opacity-40 hover:opacity-100 flex-shrink-0">
                          <Trash2 className="w-3 h-3 text-red-400" />
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
    </div>
  );
};

export default PTOCalendar;
