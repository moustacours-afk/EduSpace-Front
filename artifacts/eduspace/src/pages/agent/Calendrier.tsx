import { useState } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Download } from "lucide-react";
import { calendarEvents } from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

type EventType = "green" | "blue" | "red" | "yellow";
type CalEvent = {
  id: string; date: string; titre: string; type: EventType; description: string;
};

const typeConfig: Record<EventType, { label: string; dot: string; badge: string }> = {
  green:  { label: "Début de période",          dot: "bg-green-500",  badge: "bg-green-100 text-green-800 border-green-200"  },
  blue:   { label: "Échéance administrative",   dot: "bg-blue-500",   badge: "bg-blue-100 text-blue-800 border-blue-200"    },
  red:    { label: "Clôture / Publication",      dot: "bg-red-500",    badge: "bg-red-100 text-red-800 border-red-200"      },
  yellow: { label: "Note personnelle",           dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-800 border-yellow-200" },
};

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR   = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

function daysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function firstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }

function pad(n: number) { return String(n).padStart(2, "0"); }
function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export default function AgentCalendrier() {
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalEvent[]>(calendarEvents as CalEvent[]);

  // Multi-select: track selection range
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [rangeStart, setRangeStart] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newNoteType] = useState<EventType>("blue");
  const [newNoteDesc, setNewNoteDesc] = useState("");

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const days     = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  function getEventsForDate(d: number) {
    const dateStr = toDateStr(year, month, d);
    return events.filter(e => e.date === dateStr);
  }

  function handleDayClick(dateStr: string) {
    if (!rangeStart) {
      setRangeStart(dateStr);
      setSelectedDates(new Set([dateStr]));
    } else if (rangeStart === dateStr) {
      setRangeStart(null);
      setSelectedDates(new Set());
    } else {
      const start = rangeStart < dateStr ? rangeStart : dateStr;
      const end   = rangeStart < dateStr ? dateStr   : rangeStart;
      const range = new Set<string>();
      const [sy, sm, sd] = start.split("-").map(Number);
      const [ey, em, ed] = end.split("-").map(Number);
      let cur = new Date(sy, sm - 1, sd);
      const endDate = new Date(ey, em - 1, ed);
      while (cur <= endDate) {
        range.add(toDateStr(cur.getFullYear(), cur.getMonth(), cur.getDate()));
        cur.setDate(cur.getDate() + 1);
      }
      setSelectedDates(range);
      setRangeStart(null);
    }
  }

  function clearSelection() { setSelectedDates(new Set()); setRangeStart(null); }

  const selectedList = [...selectedDates].sort();
  const selectedEvents = selectedList.flatMap(d => events.filter(e => e.date === d));

  function addNote() {
    if (!newNote.trim() || selectedList.length === 0) return;
    const newEvts: CalEvent[] = selectedList.map(d => ({
      id: `note-${Date.now()}-${d}`,
      date: d,
      titre: newNote,
      type: newNoteType,
      description: newNoteDesc.trim() || "Note personnelle",
    }));
    setEvents(prev => [...prev, ...newEvts]);
    setNewNote(""); setNewNoteDesc("");
    setShowAddModal(false);
  }

  function exportCalendar() {
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    const allFuture = events.filter(e => e.date >= today.toISOString().split("T")[0])
      .sort((a, b) => a.date.localeCompare(b.date));
    const rows = allFuture.map(e => `
      <tr style="border-bottom:1px solid #eee">
        <td style="padding:8px 12px">${new Date(e.date+"T00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</td>
        <td style="padding:8px 12px">${e.titre}</td>
        <td style="padding:8px 12px;color:#666">${e.description}</td>
        <td style="padding:8px 12px">${typeConfig[e.type].label}</td>
      </tr>`).join("");
    w.document.write(`
      <html><head><title>Calendrier Académique 2025-2026</title>
      <style>body{font-family:Arial,sans-serif;padding:30px}table{width:100%;border-collapse:collapse}th{background:#f0f0f0;padding:10px 12px;text-align:left;font-size:12px;border-bottom:2px solid #ddd}@media print{button{display:none}}</style></head>
      <body>
        <h2 style="margin:0 0 4px">Université Oran 1 Ahmed Ben Bella</h2>
        <p style="color:#666;margin:0 0 20px">Calendrier Académique — Département Informatique — 2025-2026</p>
        <button onclick="window.print()" style="margin-bottom:16px;padding:8px 16px;background:#4f46e5;color:white;border:none;border-radius:6px;cursor:pointer">Imprimer</button>
        <table><thead><tr><th>Date</th><th>Événement</th><th>Description</th><th>Type</th></tr></thead>
        <tbody>${rows}</tbody></table>
      </body></html>`);
    w.document.close();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Calendrier académique</h1>
              <p className="text-muted-foreground mt-1">Consultez et annotez les événements pédagogiques 2025-2026.</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={exportCalendar}>
              <Download className="w-4 h-4" />Exporter
            </Button>
          </motion.div>

          {/* Legend */}
          <motion.div variants={item} className="flex flex-wrap gap-3">
            {(Object.entries(typeConfig) as [EventType, typeof typeConfig.green][]).map(([, cfg]) => (
              <div key={cfg.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </div>
            ))}
            <div className="text-xs text-muted-foreground ml-4">
              Cliquez sur une date pour sélectionner, cliquez une seconde date pour une plage.
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Calendar grid */}
            <motion.div variants={item} className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                  <h2 className="font-semibold">{MONTHS_FR[month]} {year}</h2>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
                </div>

                <div className="grid grid-cols-7 border-b border-border">
                  {DAYS_FR.map(d => (
                    <div key={d} className="text-center py-2 text-xs font-medium text-muted-foreground">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`empty-${i}`} className="border-b border-r border-border/30 min-h-[72px]" />
                  ))}
                  {Array.from({ length: days }, (_, i) => {
                    const d = i + 1;
                    const dateStr = toDateStr(year, month, d);
                    const dayEvents = getEventsForDate(d);
                    const isToday    = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const isSelected = selectedDates.has(dateStr);
                    const isRangeStart = rangeStart === dateStr;

                    return (
                      <div
                        key={d}
                        onClick={() => handleDayClick(dateStr)}
                        className={`border-b border-r border-border/30 min-h-[72px] p-1.5 cursor-pointer transition-colors ${
                          isSelected ? "bg-primary/10 border-primary/30" : isRangeStart ? "bg-primary/20" : "hover:bg-muted/20"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                          isToday ? "bg-primary text-white" : isSelected ? "bg-primary/30 text-primary font-bold" : ""
                        }`}>
                          {d}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map(ev => (
                            <div key={ev.id} className={`w-full h-1 rounded-full ${typeConfig[ev.type].dot}`} />
                          ))}
                          {dayEvents.length > 2 && <p className="text-[9px] text-muted-foreground">+{dayEvents.length - 2}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Side panel */}
            <motion.div variants={item} className="space-y-4">
              {selectedList.length > 0 ? (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">
                      {selectedList.length === 1
                        ? new Date(selectedList[0]+"T00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})
                        : `${selectedList.length} jours sélectionnés`}
                    </h3>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => setShowAddModal(true)}>
                        <Plus className="w-3.5 h-3.5" />Annoter
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={clearSelection}><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>

                  {selectedList.length > 1 && (
                    <div className="mb-3 p-2 bg-muted/20 rounded text-xs text-muted-foreground">
                      Du {new Date(selectedList[0]+"T00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} au {new Date(selectedList[selectedList.length-1]+"T00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}
                    </div>
                  )}

                  {selectedEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Aucun événement</p>
                      <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs" onClick={() => setShowAddModal(true)}>
                        <Plus className="w-3 h-3" />Ajouter une note
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedEvents.map(ev => (
                        <div key={ev.id} className={`p-3 rounded-lg border ${typeConfig[ev.type].badge}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              {selectedList.length > 1 && (
                                <p className="text-[10px] font-mono opacity-70 mb-0.5">
                                  {new Date(ev.date+"T00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}
                                </p>
                              )}
                              <p className="font-medium text-sm">{ev.titre}</p>
                              <p className="text-xs mt-0.5 opacity-80">{ev.description}</p>
                            </div>
                            {ev.type === "yellow" && (
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-60 hover:opacity-100 flex-shrink-0"
                                onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))}>
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-4">
                  <div className="text-center py-6">
                    <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Cliquez sur une date pour voir les événements.<br/>Cliquez sur une seconde date pour sélectionner une plage.</p>
                  </div>
                </Card>
              )}

              {/* Upcoming events */}
              <Card className="p-4">
                <h3 className="font-semibold text-sm mb-3">Prochains événements</h3>
                <div className="space-y-2">
                  {events
                    .filter(e => e.date >= today.toISOString().split("T")[0])
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .slice(0, 5)
                    .map(ev => (
                      <div key={ev.id} className="flex items-start gap-2.5 py-2 border-b border-border/50 last:border-0">
                        <div className={`w-2 h-2 rounded-full ${typeConfig[ev.type].dot} mt-1.5 flex-shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{ev.titre}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(ev.date+"T00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </motion.div>
          </div>

        </motion.div>
      </main>

      {/* Add note modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
            <Card className="p-5 max-w-sm w-full">
              <h3 className="font-bold text-sm mb-1">Annoter la sélection</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {selectedList.length === 1
                  ? new Date(selectedList[0]+"T00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long"})
                  : `${selectedList.length} jours sélectionnés`}
              </p>
              <Input placeholder="Titre de la note…" value={newNote} onChange={e => setNewNote(e.target.value)} className="mb-2" />
              <Input placeholder="Description (facultatif)…" value={newNoteDesc} onChange={e => setNewNoteDesc(e.target.value)} className="mb-3" />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-sm" onClick={() => setShowAddModal(false)}>Annuler</Button>
                <Button className="flex-1 text-sm" disabled={!newNote.trim()} onClick={addNote}>Ajouter</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
