import { useState } from "react";
import { motion } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarClock, Edit, X, AlertTriangle } from "lucide-react";
import { seances } from "@/data/mockData";

type SeanceLocal = typeof seances[number] & { editMode?: boolean; motif?: string };

const statusConfig = {
  normal: { label: "Programmée", color: "bg-green-100 text-green-800 border-green-200" },
  annule: { label: "Annulée", color: "bg-red-100 text-red-800 border-red-200" },
  reporte: { label: "Reportée", color: "bg-amber-100 text-amber-800 border-amber-200" },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function EnseignantSeances() {
  const [items, setItems] = useState<SeanceLocal[]>(
    seances.filter((s) => s.enseignant === "Dr. Hadj").map((s) => ({ ...s }))
  );
  const [editing, setEditing] = useState<string | null>(null);

  function toggleEdit(id: string) {
    setEditing(editing === id ? null : id);
  }

  function markAnnule(id: string) {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, statut: "annule" as const } : s) as SeanceLocal[]);
    setEditing(null);
  }

  function save(id: string, salle: string) {
    setItems((prev) => prev.map((s) => s.id === id ? { ...s, salle } : s));
    setEditing(null);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Gestion des séances</h1>
            <p className="text-muted-foreground mt-1">Modifiez les informations de vos séances et signalez les annulations.</p>
          </motion.div>

          <motion.div variants={item} className="space-y-3">
            {items.map((s) => {
              const conf = statusConfig[s.statut];
              const isEditing = editing === s.id;
              return (
                <Card key={s.id} className={`p-4 ${s.statut === "annule" ? "opacity-60" : ""}`} data-testid={`seance-item-${s.id}`}>
                  <div className="flex items-start gap-4">
                    <div className="min-w-[80px] text-center">
                      <p className="text-sm font-bold text-primary">{s.heureDebut}</p>
                      <p className="text-xs text-muted-foreground">{s.heureFin}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.jour}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{s.module}</p>
                        <Badge className={`text-xs border ${conf.color}`}>{conf.label}</Badge>
                        <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">{s.type}</Badge>
                      </div>
                      {isEditing ? (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-3">
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="text-xs font-medium mb-1 block">Nouvelle salle</label>
                              <Input defaultValue={s.salle} id={`salle-${s.id}`} data-testid={`input-salle-${s.id}`} />
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Button size="sm" onClick={() => {
                              const val = (document.getElementById(`salle-${s.id}`) as HTMLInputElement)?.value ?? s.salle;
                              save(s.id, val);
                            }} data-testid={`button-save-${s.id}`}>Enregistrer</Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => markAnnule(s.id)} data-testid={`button-annuler-${s.id}`}>
                              <X className="w-3.5 h-3.5 mr-1" />
                              Marquer annulée
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
                          </div>
                        </motion.div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Salle : {s.salle} — {s.groupes.join(", ")}
                          {s.statut === "annule" && <span className="ml-2 text-red-500 flex items-center gap-1 inline-flex"><AlertTriangle className="w-3 h-3" />Séance annulée</span>}
                        </p>
                      )}
                    </div>
                    {s.statut !== "annule" && (
                      <Button size="sm" variant="outline" onClick={() => toggleEdit(s.id)} className="gap-1.5" data-testid={`button-edit-${s.id}`}>
                        <Edit className="w-3.5 h-3.5" />
                        Modifier
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
