import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Clock, X, Edit, Check } from "lucide-react";
import { seances } from "@/data/mockData";

const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Samedi"];
const creneaux = [
  { debut: "08:00", fin: "10:00" },
  { debut: "10:00", fin: "12:00" },
  { debut: "14:00", fin: "16:00" },
  { debut: "16:00", fin: "18:00" },
];

const typeColors: Record<string, string> = {
  CM: "bg-blue-100 text-blue-800 border-blue-200",
  TD: "bg-indigo-100 text-indigo-800 border-indigo-200",
  TP: "bg-teal-100 text-teal-800 border-teal-200",
};

type SeanceLocal = typeof seances[number] & { newSalle?: string };

export default function EnseignantEmploiDuTemps() {
  const [items, setItems] = useState<SeanceLocal[]>(
    seances.filter((s) => s.enseignant === "Dr. Hadj").map((s) => ({ ...s }))
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [salleEdit, setSalleEdit] = useState("");

  const changed = items.filter((s) => s.statut !== "normal");

  function getSeance(jour: string, debut: string) {
    return items.find((s) => s.jour === jour && s.heureDebut === debut);
  }

  function startEdit(id: string, currentSalle: string) {
    setEditing(id);
    setSalleEdit(currentSalle);
  }

  function saveEdit(id: string) {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, salle: salleEdit } : s));
    setEditing(null);
  }

  function markAnnule(id: string) {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, statut: "annule" as const } : s) as SeanceLocal[]);
    setEditing(null);
  }

  function markReporte(id: string) {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, statut: "reporte" as const } : s) as SeanceLocal[]);
    setEditing(null);
  }

  function restore(id: string) {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, statut: "normal" as const } : s) as SeanceLocal[]);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">

          <div>
            <h1 className="text-2xl font-bold">Emploi du temps</h1>
            <p className="text-muted-foreground mt-1">Vos séances — Dr. Mohamed Hadj</p>
          </div>

          {/* Modifications banner */}
          {changed.length > 0 && (
            <Card className="p-4 border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="font-semibold text-amber-800 text-sm">Modifications en cours</p>
              </div>
              <div className="space-y-1.5">
                {changed.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <Badge className={s.statut === "annule"
                      ? "bg-red-100 text-red-800 border-red-200 text-xs"
                      : "bg-orange-100 text-orange-800 border-orange-200 text-xs"}>
                      {s.statut === "annule" ? "Annulée" : "Reportée"}
                    </Badge>
                    <span className="text-amber-800">{s.module} — {s.jour} {s.heureDebut}–{s.heureFin}</span>
                    <button
                      onClick={() => restore(s.id)}
                      className="ml-auto text-xs text-amber-600 underline hover:text-amber-800"
                    >
                      Rétablir
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Timetable grid */}
          <Card className="overflow-auto">
            <table className="w-full text-sm border-collapse" style={{ minWidth: "700px" }}>
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-24">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Horaire
                  </th>
                  {jours.map((j) => (
                    <th key={j} className={`text-center px-2 py-3 font-semibold ${j === "Samedi" ? "text-blue-600" : "text-foreground"}`}>{j}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {creneaux.map((cr) => (
                  <tr key={cr.debut} className="border-b border-border/50">
                    <td className="px-4 py-3 text-muted-foreground text-xs font-medium whitespace-nowrap">
                      {cr.debut}<br />{cr.fin}
                    </td>
                    {jours.map((jour) => {
                      const s = getSeance(jour, cr.debut);
                      return (
                        <td key={jour} className="px-1.5 py-1.5 align-top">
                          {s ? (
                            <div className="group relative">
                              <motion.div
                                className={`rounded-lg p-2 border text-left ${
                                  s.statut === "annule"
                                    ? "bg-red-50 border-red-200 opacity-60"
                                    : s.statut === "reporte"
                                    ? "bg-orange-50 border-orange-200"
                                    : "bg-card border-border shadow-sm hover:border-primary/40 hover:shadow-md"
                                } transition-all`}
                              >
                                <p className="font-semibold text-xs leading-tight">{s.module}</p>
                                {editing === s.id ? (
                                  <div className="mt-1 space-y-1" onClick={(e) => e.stopPropagation()}>
                                    <Input
                                      value={salleEdit}
                                      onChange={(e) => setSalleEdit(e.target.value)}
                                      className="h-6 text-xs px-1.5"
                                    />
                                    <div className="flex gap-1 flex-wrap">
                                      <button onClick={() => saveEdit(s.id)} className="text-xs px-1.5 py-0.5 bg-primary text-white rounded flex items-center gap-0.5">
                                        <Check className="w-2.5 h-2.5" />OK
                                      </button>
                                      <button onClick={() => markAnnule(s.id)} className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded flex items-center gap-0.5">
                                        <X className="w-2.5 h-2.5" />Annuler
                                      </button>
                                      <button onClick={() => markReporte(s.id)} className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">
                                        Reporter
                                      </button>
                                      <button onClick={() => setEditing(null)} className="text-xs px-1.5 py-0.5 text-muted-foreground">
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-xs text-muted-foreground mt-0.5">{s.salle}</p>
                                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                                      <Badge className={`text-xs border ${typeColors[s.type]}`}>{s.type}</Badge>
                                      {s.statut !== "normal" && (
                                        <Badge className="text-xs border bg-red-100 text-red-800 border-red-200">{s.statut}</Badge>
                                      )}
                                    </div>
                                    {s.statut === "normal" && (
                                      <button
                                        onClick={() => startEdit(s.id, s.salle)}
                                        className="mt-1.5 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Edit className="w-2.5 h-2.5" />
                                        Modifier
                                      </button>
                                    )}
                                    {s.statut !== "normal" && (
                                      <button
                                        onClick={() => restore(s.id)}
                                        className="mt-1 text-xs text-muted-foreground underline"
                                      >
                                        Rétablir
                                      </button>
                                    )}
                                  </>
                                )}
                              </motion.div>
                            </div>
                          ) : (
                            <div className="h-16 rounded-lg bg-muted/10 border border-dashed border-border/40" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            {Object.entries(typeColors).map(([type, cls]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded border ${cls}`} />
                {type === "CM" ? "Cours Magistral" : type === "TD" ? "Travaux Dirigés" : "Travaux Pratiques"}
              </span>
            ))}
            <span className="flex items-center gap-1.5 ml-4 text-muted-foreground/60">
              <Edit className="w-3 h-3" />
              Survoler une séance pour la modifier / annuler
            </span>
          </div>

          {/* List view */}
          <div>
            <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Toutes les séances</h2>
            <div className="space-y-2">
              {items.map((s) => (
                <Card key={s.id} className={`p-4 ${s.statut === "annule" ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="min-w-[72px] text-center">
                      <p className="text-xs font-bold text-primary">{s.heureDebut}</p>
                      <p className="text-xs text-muted-foreground">{s.heureFin}</p>
                      <p className="text-xs text-muted-foreground">{s.jour}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{s.module}</p>
                      <p className="text-xs text-muted-foreground">{s.salle} — {s.groupes.join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border ${typeColors[s.type]}`}>{s.type}</Badge>
                      <Badge className={`text-xs border ${
                        s.statut === "normal" ? "bg-green-100 text-green-800 border-green-200"
                        : s.statut === "annule" ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}>
                        {s.statut === "normal" ? "Programmée" : s.statut === "annule" ? "Annulée" : "Reportée"}
                      </Badge>
                    </div>
                    {s.statut === "normal" ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(s.id, s.salle)} className="gap-1.5 text-xs">
                          <Edit className="w-3 h-3" />Modifier
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => markAnnule(s.id)} className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50">
                          <X className="w-3 h-3" />Annuler
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => restore(s.id)} className="text-xs">
                        Rétablir
                      </Button>
                    )}
                  </div>
                  {/* Inline edit in list */}
                  <AnimatePresence>
                    {editing === s.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-border flex items-center gap-3"
                      >
                        <Input
                          value={salleEdit}
                          onChange={(e) => setSalleEdit(e.target.value)}
                          className="max-w-xs h-8 text-sm"
                          placeholder="Nouvelle salle…"
                        />
                        <Button size="sm" onClick={() => saveEdit(s.id)}>Enregistrer</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))}
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
