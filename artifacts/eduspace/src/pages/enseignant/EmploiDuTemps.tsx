import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, BookOpen, CalendarDays, Layers, AlertTriangle } from "lucide-react";
import { enseignant as api } from "@/lib/api";
import { getUser } from "@/lib/auth";

type Seance = {
  id: number;
  module: string;
  moduleCode?: string;
  type: "CM" | "TD" | "TP";
  jour: string;
  heureDebut: string;
  heureFin: string;
  salle: string;
  filiere: string;
  niveau: string;
  semestre: string;
  groupes: string[];
  statut: string;
};

const JOURS_ORDRE = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const typeColors: Record<string, string> = {
  CM: "bg-blue-100 text-blue-800 border-blue-200",
  TD: "bg-indigo-100 text-indigo-800 border-indigo-200",
  TP: "bg-teal-100 text-teal-800 border-teal-200",
};
const typeLabel: Record<string, string> = { CM: "Cours Magistral", TD: "Travaux Dirigés", TP: "Travaux Pratiques" };

function statutBadge(statut: string) {
  if (statut === "annule")  return { cls: "bg-red-100 text-red-800 border-red-200", label: "Annulée" };
  if (statut === "reporte") return { cls: "bg-amber-100 text-amber-800 border-amber-200", label: "Reportée" };
  return { cls: "bg-green-100 text-green-800 border-green-200", label: "Programmée" };
}

export default function EnseignantEmploiDuTemps() {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);

  const profile = getUser()?.profile as Record<string, string> | undefined;
  const teacherName = profile
    ? `${profile.grade ? profile.grade + " " : "Dr. "}${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim()
    : "Enseignant";

  useEffect(() => {
    let active = true;
    api.emploiDuTemps()
      .then(data => { if (active) setSeances((data as Seance[]) ?? []); })
      .catch(() => { if (active) setSeances([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Distinct time slots present in the data, sorted by start time
  const creneaux = useMemo(() => {
    const map = new Map<string, { debut: string; fin: string }>();
    seances.forEach(s => map.set(`${s.heureDebut}-${s.heureFin}`, { debut: s.heureDebut, fin: s.heureFin }));
    return [...map.values()].sort((a, b) => a.debut.localeCompare(b.debut));
  }, [seances]);

  // Days that actually have séances, in canonical order
  const jours = useMemo(() => {
    const present = new Set(seances.map(s => s.jour));
    return JOURS_ORDRE.filter(j => present.has(j));
  }, [seances]);

  const cellFor = (jour: string, debut: string) =>
    seances.filter(s => s.jour === jour && s.heureDebut === debut);

  const byJour = useMemo(() => {
    const groups: Record<string, Seance[]> = {};
    seances.forEach(s => { (groups[s.jour] ??= []).push(s); });
    return JOURS_ORDRE.filter(j => groups[j]).map(j => ({ jour: j, items: groups[j] }));
  }, [seances]);

  const stats = useMemo(() => {
    const modules = new Set(seances.map(s => s.module));
    return {
      total: seances.length,
      CM: seances.filter(s => s.type === "CM").length,
      TD: seances.filter(s => s.type === "TD").length,
      TP: seances.filter(s => s.type === "TP").length,
      modules: modules.size,
      annulees: seances.filter(s => s.statut === "annule").length,
      reportees: seances.filter(s => s.statut === "reporte").length,
    };
  }, [seances]);

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">

          <div>
            <h1 className="text-2xl font-bold">Emploi du temps</h1>
            <p className="text-muted-foreground mt-1">Planning de vos séances — {teacherName}</p>
          </div>

          {loading ? (
            <Card className="p-12 text-center text-muted-foreground">Chargement du planning…</Card>
          ) : seances.length === 0 ? (
            <Card className="p-12 text-center">
              <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Aucune séance programmée pour le moment.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Les séances que vous assurez (CM / TD / TP) apparaîtront ici une fois planifiées par l'agent pédagogique.
              </p>
            </Card>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: CalendarDays, label: "Séances / semaine", value: stats.total, cls: "text-primary" },
                  { icon: BookOpen, label: "Modules", value: stats.modules, cls: "text-violet-600" },
                  { icon: Layers, label: "CM / TD / TP", value: `${stats.CM} / ${stats.TD} / ${stats.TP}`, cls: "text-blue-600" },
                  { icon: AlertTriangle, label: "Annulées / Reportées", value: `${stats.annulees} / ${stats.reportees}`, cls: "text-amber-600" },
                ].map(s => (
                  <Card key={s.label} className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.icon className={`w-3.5 h-3.5 ${s.cls}`} />{s.label}</div>
                    <p className="text-xl font-bold mt-1">{s.value}</p>
                  </Card>
                ))}
              </div>

              {/* Weekly grid */}
              <Card className="overflow-auto">
                <table className="w-full text-sm border-collapse" style={{ minWidth: "760px" }}>
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-24">
                        <Clock className="w-3.5 h-3.5 inline mr-1" />Horaire
                      </th>
                      {jours.map(j => (
                        <th key={j} className="text-center px-2 py-3 font-semibold text-foreground">{j}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {creneaux.map(cr => (
                      <tr key={cr.debut} className="border-b border-border/50">
                        <td className="px-4 py-3 text-muted-foreground text-xs font-medium whitespace-nowrap">
                          {cr.debut}<br />{cr.fin}
                        </td>
                        {jours.map(jour => {
                          const cell = cellFor(jour, cr.debut);
                          return (
                            <td key={jour} className="px-1.5 py-1.5 align-top">
                              {cell.length === 0 ? (
                                <div className="h-16 rounded-lg bg-muted/10 border border-dashed border-border/40" />
                              ) : (
                                <div className="space-y-1.5">
                                  {cell.map(s => (
                                    <div key={s.id} className={`rounded-lg p-2 border text-left ${
                                      s.statut === "annule" ? "bg-red-50 border-red-200 opacity-70"
                                      : s.statut === "reporte" ? "bg-amber-50 border-amber-200"
                                      : "bg-card border-border shadow-sm"}`}>
                                      <p className="font-semibold text-xs leading-tight">{s.module}</p>
                                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{s.salle}</p>
                                      <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Users className="w-2.5 h-2.5" />{s.niveau} · {s.groupes.join(", ") || "—"}</p>
                                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                                        <Badge className={`text-[10px] border ${typeColors[s.type]}`}>{s.type}</Badge>
                                        {s.statut !== "normal" && <Badge className={`text-[10px] border ${statutBadge(s.statut).cls}`}>{statutBadge(s.statut).label}</Badge>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
                    <span className={`w-3 h-3 rounded border ${cls}`} />{typeLabel[type]}
                  </span>
                ))}
              </div>

              {/* Detailed list grouped by day */}
              <div className="space-y-5">
                <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Détail des séances</h2>
                {byJour.map(({ jour, items }) => (
                  <div key={jour}>
                    <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary" />{jour}
                      <span className="text-xs font-normal text-muted-foreground">({items.length} séance{items.length > 1 ? "s" : ""})</span>
                    </p>
                    <div className="space-y-2">
                      {items.map(s => {
                        const sb = statutBadge(s.statut);
                        return (
                          <Card key={s.id} className={`p-4 ${s.statut === "annule" ? "opacity-70" : ""}`}>
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="min-w-[72px] text-center">
                                <p className="text-sm font-bold text-primary">{s.heureDebut}</p>
                                <p className="text-xs text-muted-foreground">{s.heureFin}</p>
                              </div>
                              <div className="flex-1 min-w-[180px]">
                                <p className="font-medium text-sm">{s.module} {s.moduleCode && <span className="text-xs text-muted-foreground font-mono">({s.moduleCode})</span>}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.salle}</span>
                                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.filiere} {s.niveau} · {s.groupes.join(", ") || "—"}</span>
                                  <span className="text-muted-foreground/70">{s.semestre}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs border ${typeColors[s.type]}`}>{s.type}</Badge>
                                <Badge className={`text-xs border ${sb.cls}`}>{sb.label}</Badge>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
