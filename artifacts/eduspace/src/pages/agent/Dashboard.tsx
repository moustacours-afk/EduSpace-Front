import { useState } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap, Users, CheckSquare, AlertTriangle,
  Clock, CheckCircle, XCircle, Zap, CalendarDays, FileText,
  DoorOpen, AlertOctagon, Building2, School,
} from "lucide-react";
import {
  agentStudents, agentTeachers, gradeSubmissions, agentRooms, seances,
} from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

function detectConflicts() {
  const seen: Record<string, string> = {};
  let count = 0;
  for (const s of seances) {
    const timeKey = `${s.jour}-${s.heureDebut}`;
    const salleKey = `${timeKey}-salle-${s.salle}`;
    const ensKey = `${timeKey}-ens-${s.enseignant}`;
    if (seen[salleKey]) count++;
    else seen[salleKey] = s.id;
    if (seen[ensKey]) count++;
    else seen[ensKey] = s.id;
  }
  return count;
}

export default function AgentDashboard() {
  const [bulkValidated, setBulkValidated] = useState(false);
  const [bulkPublished, setBulkPublished] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const totalStudents = agentStudents.length;
  const totalTeachers = agentTeachers.length;
  const totalFaculty = [...new Set(agentTeachers.map(t => t.departement.split(",")[0].trim()))].length;
  const totalDepts = [...new Set(agentTeachers.map(t => t.departement))].length;

  const availableRooms = agentRooms.filter(r => r.disponible).length;
  const cancelledSessions = seances.filter(s => s.statut === "annule" || s.statut === "reporte").length;
  const conflictsCount = detectConflicts();

  const gradesSoumis = gradeSubmissions.filter((g) => g.statut === "soumis").length;
  const gradesValides = gradeSubmissions.filter((g) => g.statut === "valide").length;
  const gradesPublies = gradeSubmissions.filter((g) => g.statut === "publie").length;
  const gradesAttente = gradeSubmissions.filter((g) => g.statut === "en_attente").length;
  const studentsWithMissingGrades = 4;

  const alerts = [
    ...(gradesSoumis > 0 ? [`${gradesSoumis} module(s) avec notes soumises en attente de validation`] : []),
    ...(gradesAttente > 0 ? [`${gradesAttente} module(s) sans notes — délai de soumission dépassé possible`] : []),
    ...(conflictsCount > 0 ? [`${conflictsCount} conflit(s) de salle ou d'enseignant détecté(s)`] : []),
    ...(agentTeachers.filter(t => t.schedule.length === 0).length > 0
      ? [`${agentTeachers.filter(t => t.schedule.length === 0).length} enseignant(s) sans séances planifiées cette semaine`]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

          {/* ── HEADER ── */}
          <motion.div variants={item}>
            <Card className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Établissement</p>
                  <p className="font-bold text-base leading-snug">
                    Université des Sciences et de la Technologie<br />Houari Boumediene
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <School className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">Ferhat Nadia</p>
                    <p className="text-xs text-muted-foreground">Agent Pédagogique — Scolarité · Informatique</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* BLOCK 1 — Comptes */}
          <motion.div variants={item}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Comptes</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total étudiants", value: totalStudents, icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Total enseignants", value: totalTeachers, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
              ].map((s) => (
                <Card key={s.label} className="p-4">
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* BLOCK 2 — Emplois du temps */}
          <motion.div variants={item}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Emplois du temps</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "Salles disponibles", value: availableRooms, icon: DoorOpen, color: "text-cyan-600", bg: "bg-cyan-50" },
                { label: "Séances reportées / annulées", value: cancelledSessions, icon: XCircle, color: cancelledSessions > 0 ? "text-amber-600" : "text-gray-400", bg: cancelledSessions > 0 ? "bg-amber-50" : "bg-gray-50" },
                { label: "Conflits détectés", value: conflictsCount, icon: AlertOctagon, color: conflictsCount > 0 ? "text-red-600" : "text-gray-400", bg: conflictsCount > 0 ? "bg-red-50" : "bg-gray-50" },
              ].map((s) => (
                <Card key={s.label} className="p-4">
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* BLOCK 3 — Notes */}
          <motion.div variants={item}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Notes & Publication</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Soumis (à valider)", value: gradesSoumis, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Validés (à publier)", value: gradesValides, icon: CheckSquare, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Publiés officiellement", value: gradesPublies, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
                { label: "Étudiants sans note", value: studentsWithMissingGrades, icon: XCircle, color: "text-gray-500", bg: "bg-gray-50" },
              ].map((s) => (
                <Card key={s.label} className="p-4">
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Alerts + Quick Actions */}
          <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm">Alertes & Avertissements</h3>
              </div>
              {alerts.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-600 py-2">
                  <CheckCircle className="w-4 h-4" />
                  Aucune alerte active — tout est en ordre.
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                      {alert}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Actions rapides</h3>
              </div>
              <div className="space-y-3">
                {!bulkValidated ? (
                  <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-sm" onClick={() => setShowValidateModal(true)} disabled={gradesSoumis === 0}>
                    <CheckSquare className="w-4 h-4" />
                    Valider toutes les notes soumises ({gradesSoumis})
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <CheckCircle className="w-4 h-4" />{gradesSoumis} modules validés avec succès.
                  </div>
                )}
                {!bulkPublished ? (
                  <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-sm" onClick={() => setShowPublishModal(true)} disabled={gradesValides === 0 && !bulkValidated}>
                    <CalendarDays className="w-4 h-4" />
                    Publier toutes les notes validées ({bulkValidated ? gradesSoumis : gradesValides})
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                    <CheckCircle className="w-4 h-4" />Notes publiées — visibles par les étudiants.
                  </div>
                )}
                <Button variant="outline" className="w-full gap-2 text-sm">
                  <FileText className="w-4 h-4" />Exporter rapport global PDF
                </Button>
              </div>
            </Card>
          </motion.div>

        </motion.div>
      </main>

      {showValidateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Card className="p-6 max-w-sm w-full">
              <h3 className="font-bold text-base mb-2">Confirmer la validation en masse</h3>
              <p className="text-sm text-muted-foreground mb-4">Voulez-vous valider les notes de <strong>{gradesSoumis} module(s)</strong> soumis ?</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowValidateModal(false)}>Annuler</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => { setBulkValidated(true); setShowValidateModal(false); }}>Confirmer</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Card className="p-6 max-w-sm w-full">
              <h3 className="font-bold text-base mb-2">Confirmer la publication officielle</h3>
              <p className="text-sm text-muted-foreground mb-4">Les notes validées seront <strong>visibles par tous les étudiants</strong>.</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowPublishModal(false)}>Annuler</Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { setBulkPublished(true); setShowPublishModal(false); }}>Publier</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
