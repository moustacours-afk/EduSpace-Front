import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";
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

function getSeance(jour: string, debut: string) {
  return seances.find((s) => s.jour === jour && s.heureDebut === debut);
}

export default function EtudiantEmploiDuTemps() {
  const changed = seances.filter((s) => s.statut !== "normal");

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Emploi du temps</h1>
            <p className="text-muted-foreground mt-1">Semestre 5 — Groupe 2 — Informatique L3</p>
          </div>

          {changed.length > 0 && (
            <Card className="p-4 border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="font-semibold text-amber-800 text-sm">Modifications récentes</p>
              </div>
              <div className="space-y-2">
                {changed.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm" data-testid={`alert-seance-${s.id}`}>
                    <Badge className={s.statut === "annule" ? "bg-red-100 text-red-800 border-red-200 text-xs" : "bg-orange-100 text-orange-800 border-orange-200 text-xs"}>
                      {s.statut === "annule" ? "Annulé" : "Reporté"}
                    </Badge>
                    <span className="text-amber-800">
                      {s.module} — {s.jour} {s.heureDebut}–{s.heureFin} ({s.salle})
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

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
                        <td key={jour} className="px-1.5 py-1.5 align-middle">
                          {s ? (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`rounded-lg p-2 border text-left ${
                                s.statut === "annule"
                                  ? "bg-red-50 border-red-200 opacity-60"
                                  : s.statut === "reporte"
                                  ? "bg-orange-50 border-orange-200"
                                  : "bg-card border-border shadow-sm"
                              }`}
                              data-testid={`cell-seance-${s.id}`}
                            >
                              <p className="font-semibold text-xs leading-tight">{s.module}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{s.salle}</p>
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                <Badge className={`text-xs border ${typeColors[s.type]}`}>{s.type}</Badge>
                                {s.statut !== "normal" && (
                                  <Badge className="text-xs border bg-red-100 text-red-800 border-red-200">{s.statut}</Badge>
                                )}
                              </div>
                            </motion.div>
                          ) : (
                            <div className="h-14 rounded-lg bg-muted/10 border border-dashed border-border/40" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            {Object.entries(typeColors).map(([type, cls]) => (
              <span key={type} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded border ${cls}`} />
                {type === "CM" ? "Cours Magistral" : type === "TD" ? "Travaux Dirigés" : "Travaux Pratiques"}
              </span>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
