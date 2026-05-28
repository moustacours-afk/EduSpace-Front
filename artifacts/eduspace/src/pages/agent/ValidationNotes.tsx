import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle, XCircle, Clock, Send, Eye, X, AlertTriangle,
  Search, FileText, ChevronRight, ArrowLeft, UserX, Flag,
} from "lucide-react";
import { gradeSubmissions, type GradeSubmission, type GradeStatus } from "@/data/mockData";
import {
  getAcceptedAppealsForAgent, agentValidateAppeal,
  type Appeal, type AppealNoteType,
} from "@/lib/appealStore";

const appealNoteTypeLabels: Record<AppealNoteType, string> = {
  exam: "Note Examen",
  controle: "Note Contrôle",
  tp: "Note TP",
  generale: "Moyenne",
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const statusConfig: Record<GradeStatus, { label: string; color: string; icon: React.ElementType }> = {
  en_attente: { label: "En attente", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
  soumis:     { label: "Soumis",     color: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  valide:     { label: "Validé",     color: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle },
  publie:     { label: "Publié",     color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
};

function calcMoyenne(cc: number | null, exam: number | null) {
  if (cc === null && exam === null) return null;
  if (cc === null) return exam;
  if (exam === null) return cc;
  return Math.round((cc * 0.4 + exam * 0.6) * 100) / 100;
}

export default function AgentValidationNotes() {
  const [submissions, setSubmissions] = useState<GradeSubmission[]>(gradeSubmissions);
  const [search, setSearch] = useState("");
  const [filterNiveau, setFilterNiveau] = useState("all");
  const [filterStatut, setFilterStatut] = useState("all");
  const [selected, setSelected] = useState<GradeSubmission | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; reason: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ action: "valider" | "publier"; id: string } | null>(null);
  const [publishAll, setPublishAll] = useState(false);
  const [pendingAppeals, setPendingAppeals] = useState<Appeal[]>(() => getAcceptedAppealsForAgent());
  const [appealConfirm, setAppealConfirm] = useState<Appeal | null>(null);

  const filtered = submissions.filter((s) => {
    if (filterStatut !== "all" && s.statut !== filterStatut) return false;
    if (filterNiveau !== "all" && s.niveau !== filterNiveau) return false;
    const q = search.toLowerCase();
    return `${s.module} ${s.enseignant} ${s.groupe}`.toLowerCase().includes(q);
  });

  const counts = {
    en_attente: submissions.filter((s) => s.statut === "en_attente").length,
    soumis: submissions.filter((s) => s.statut === "soumis").length,
    valide: submissions.filter((s) => s.statut === "valide").length,
    publie: submissions.filter((s) => s.statut === "publie").length,
  };

  function validate(id: string) {
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, statut: "valide" as GradeStatus } : s));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, statut: "valide" } : null);
  }

  function publish(id: string) {
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, statut: "publie" as GradeStatus } : s));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, statut: "publie" } : null);
  }

  function reject(id: string, reason: string) {
    setSubmissions((prev) =>
      prev.map((s) => s.id === id ? { ...s, statut: "en_attente" as GradeStatus, rejectionReason: reason } : s)
    );
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, statut: "en_attente", rejectionReason: reason } : null);
  }

  function publishAllValidated() {
    setSubmissions((prev) => prev.map((s) => s.statut === "valide" ? { ...s, statut: "publie" as GradeStatus } : s));
    setPublishAll(true);
  }

  if (selected) {
    const cfg = statusConfig[selected.statut];
    const currentSub = submissions.find((s) => s.id === selected.id) ?? selected;

    return (
      <div className="flex min-h-screen bg-background">
        <AgentSidebar />
        <main className="flex-1 p-7 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-5">

            <Button variant="ghost" className="gap-2 text-sm -ml-2 mb-2" onClick={() => setSelected(null)}>
              <ArrowLeft className="w-4 h-4" />
              Retour à la liste
            </Button>

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold">{currentSub.module}</h1>
                  <Badge className={`text-xs border ${cfg.color}`}>{cfg.label}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {currentSub.filiere} — {currentSub.niveau} — {currentSub.groupe} — {currentSub.semestre}
                  {" "}· {currentSub.enseignant}
                  {currentSub.dateDepot && ` · Soumis le ${currentSub.dateDepot}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5" />Exporter PV PDF
                </Button>
                {currentSub.statut === "soumis" && (
                  <>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setRejectModal({ id: currentSub.id, reason: "" })}>
                      <XCircle className="w-3.5 h-3.5" />Rejeter
                    </Button>
                    <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
                      onClick={() => setConfirmModal({ action: "valider", id: currentSub.id })}>
                      <CheckCircle className="w-3.5 h-3.5" />Valider les notes
                    </Button>
                  </>
                )}
                {currentSub.statut === "valide" && (
                  <Button size="sm" className="gap-1.5 text-xs bg-green-600 hover:bg-green-700"
                    onClick={() => setConfirmModal({ action: "publier", id: currentSub.id })}>
                    <Send className="w-3.5 h-3.5" />Publier officiellement
                  </Button>
                )}
              </div>
            </div>

            {currentSub.rejectionReason && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><strong>Motif de rejet :</strong> {currentSub.rejectionReason}</span>
              </div>
            )}

            {/* Student grade table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Matricule</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Nom & Prénom</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Note CC /20</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Note Examen /20</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Moyenne</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Résultat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSub.students.map((s, i) => {
                      const moy = calcMoyenne(s.noteCC, s.noteExam);
                      const resultat = s.absent ? "Absent" : moy === null ? "—" : moy >= 10 ? "Admis" : "Ajourné";
                      return (
                        <tr key={s.matricule} className={`border-b border-border/50 hover:bg-muted/10 ${s.absent ? "bg-red-50/30" : ""}`}>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                          <td className="px-4 py-2.5 font-mono text-xs">{s.matricule}</td>
                          <td className="px-4 py-2.5 font-medium">{s.prenom} {s.nom}</td>
                          <td className="px-4 py-2.5 text-center">
                            {s.absent ? <span className="text-red-500 font-medium text-xs">ABS</span> : s.noteCC ?? <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {s.absent ? <span className="text-red-500 font-medium text-xs">ABS</span> : s.noteExam ?? <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-center font-semibold">
                            {s.absent ? <UserX className="w-4 h-4 text-red-400 mx-auto" /> : moy !== null ? moy.toFixed(2) : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge className={`text-xs border ${
                              resultat === "Admis" ? "bg-green-100 text-green-800 border-green-200"
                              : resultat === "Ajourné" ? "bg-red-100 text-red-800 border-red-200"
                              : resultat === "Absent" ? "bg-gray-100 text-gray-600 border-gray-200"
                              : "bg-muted text-muted-foreground border-border"
                            }`}>{resultat}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>
        </main>

        {/* Modals */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
              <Card className="p-6 max-w-sm w-full">
                <h3 className="font-bold text-base mb-2">
                  {confirmModal.action === "valider" ? "Confirmer la validation" : "Confirmer la publication"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {confirmModal.action === "valider"
                    ? "Voulez-vous valider les notes de ce module ? Cette action ne peut pas être annulée."
                    : "Les notes seront visibles par les étudiants. Confirmer la publication ?"}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setConfirmModal(null)}>Annuler</Button>
                  <Button
                    className={`flex-1 ${confirmModal.action === "valider" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
                    onClick={() => {
                      if (confirmModal.action === "valider") validate(confirmModal.id);
                      else publish(confirmModal.id);
                      setConfirmModal(null);
                    }}
                  >
                    {confirmModal.action === "valider" ? "Valider" : "Publier"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {rejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
              <Card className="p-6 max-w-sm w-full">
                <h3 className="font-bold text-base mb-2">Rejeter les notes</h3>
                <p className="text-sm text-muted-foreground mb-3">Un motif est requis — il sera transmis à l'enseignant.</p>
                <Input
                  placeholder="Motif de rejet…"
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => prev ? { ...prev, reason: e.target.value } : null)}
                  className="mb-4"
                />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setRejectModal(null)}>Annuler</Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={!rejectModal.reason.trim()}
                    onClick={() => { reject(rejectModal.id, rejectModal.reason); setRejectModal(null); }}>
                    Rejeter
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Notes & Délibérations</h1>
              <p className="text-muted-foreground mt-1">Validez et publiez officiellement les notes finales. Soumis → Validé → Publié.</p>
            </div>
            {counts.valide > 0 && !publishAll && (
              <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => setConfirmModal({ action: "publier", id: "__all__" })}>
                <Send className="w-4 h-4" />
                Publier toutes les validées ({counts.valide})
              </Button>
            )}
          </motion.div>

          {publishAll && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
                <CheckCircle className="w-4 h-4" />
                Toutes les notes validées ont été publiées avec succès.
              </div>
            </motion.div>
          )}

          {/* Status cards */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["en_attente", "soumis", "valide", "publie"] as GradeStatus[]).map((s) => {
              const cfg = statusConfig[s];
              return (
                <Card
                  key={s}
                  className={`p-4 cursor-pointer transition-all border-2 ${filterStatut === s ? "border-primary shadow-sm" : "border-transparent hover:border-border"}`}
                  onClick={() => setFilterStatut((prev) => prev === s ? "all" : s)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <cfg.icon className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{cfg.label}</p>
                  </div>
                  <p className="text-2xl font-bold">{counts[s]}</p>
                </Card>
              );
            })}
          </motion.div>

          {/* Filters */}
          <motion.div variants={item}>
            <Card className="p-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Module, enseignant, groupe…" className="pl-8 h-9 text-sm" />
                </div>
                <Select value={filterNiveau} onValueChange={setFilterNiveau}>
                  <SelectTrigger className="w-[110px] h-9 text-sm"><SelectValue placeholder="Niveau" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous niveaux</SelectItem>
                    <SelectItem value="L1">L1</SelectItem><SelectItem value="L2">L2</SelectItem>
                    <SelectItem value="L3">L3</SelectItem><SelectItem value="M1">M1</SelectItem><SelectItem value="M2">M2</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatut} onValueChange={setFilterStatut}>
                  <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous statuts</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="soumis">Soumis</SelectItem>
                    <SelectItem value="valide">Validé</SelectItem>
                    <SelectItem value="publie">Publié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </motion.div>

          {/* Table */}
          <motion.div variants={item}>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Module</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Filière / Niveau</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Groupe</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Enseignant</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Étudiants</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Statut</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Aucun module trouvé</td></tr>
                    ) : filtered.map((sub) => {
                      const cfg = statusConfig[sub.statut];
                      return (
                        <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-medium">{sub.module}
                            <p className="text-xs text-muted-foreground font-normal">{sub.semestre}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{sub.filiere}<br/>{sub.niveau}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{sub.groupe}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{sub.enseignant}</td>
                          <td className="px-4 py-3 text-center font-semibold">{sub.students.length}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={`text-xs border ${cfg.color}`}>{cfg.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-1">
                              <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" onClick={() => setSelected(sub)}>
                                <Eye className="w-3.5 h-3.5" />Voir
                              </Button>
                              {sub.statut === "soumis" && (
                                <>
                                  <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs text-red-500 hover:text-red-600"
                                    onClick={() => setRejectModal({ id: sub.id, reason: "" })}>
                                    <XCircle className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button size="sm" className="h-7 gap-1 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setConfirmModal({ action: "valider", id: sub.id })}>
                                    <CheckCircle className="w-3.5 h-3.5" />Valider
                                  </Button>
                                </>
                              )}
                              {sub.statut === "valide" && (
                                <Button size="sm" className="h-7 gap-1 px-2 text-xs bg-green-600 hover:bg-green-700"
                                  onClick={() => setConfirmModal({ action: "publier", id: sub.id })}>
                                  <Send className="w-3.5 h-3.5" />Publier
                                </Button>
                              )}
                              {sub.statut === "publie" && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" />Publié
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* ── Recours section ── */}
          <motion.div variants={item}>
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-base">Recours acceptés — en attente de validation</h2>
              {pendingAppeals.length > 0 && (
                <span className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {pendingAppeals.length}
                </span>
              )}
            </div>
            {pendingAppeals.length === 0 ? (
              <Card className="p-6 text-center">
                <Flag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun recours en attente de validation agent.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Étudiant</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Module</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Type</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Note actuelle</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Nouvelle note</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Commentaire enseignant</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingAppeals.map((a, i) => (
                        <motion.tr
                          key={a.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium">{a.studentNom} {a.studentPrenom}</p>
                            <p className="text-xs text-muted-foreground font-mono">{a.studentMatricule}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{a.moduleName}</p>
                            <p className="text-xs text-muted-foreground">{a.semestre}</p>
                          </td>
                          <td className="text-center px-4 py-3">
                            <Badge className="text-xs border bg-blue-50 text-blue-700 border-blue-200">
                              {appealNoteTypeLabels[a.noteType]}
                            </Badge>
                          </td>
                          <td className="text-center px-4 py-3 font-semibold text-red-500">{a.currentNote}/20</td>
                          <td className="text-center px-4 py-3 font-bold text-green-600">
                            {a.proposedNote !== undefined ? `${a.proposedNote}/20` : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground italic max-w-[180px]">
                            {a.teacherComment ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              size="sm"
                              className="gap-1.5 text-xs bg-green-600 hover:bg-green-700"
                              onClick={() => setAppealConfirm(a)}
                            >
                              <CheckCircle className="w-3 h-3" />Valider
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>

        </motion.div>
      </main>

      {/* Appeal confirm modal */}
      <AnimatePresence>
        {appealConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 max-w-sm w-full space-y-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Flag className="w-4 h-4 text-primary" />
                  Valider le recours
                </h3>
                <div className="p-3 bg-muted/40 rounded-lg text-sm space-y-1">
                  <p><span className="text-muted-foreground">Étudiant :</span> <strong>{appealConfirm.studentNom} {appealConfirm.studentPrenom}</strong></p>
                  <p><span className="text-muted-foreground">Module :</span> <strong>{appealConfirm.moduleName}</strong></p>
                  <p>
                    <span className="text-muted-foreground">Changement :</span>{" "}
                    <span className="text-red-500 font-semibold">{appealConfirm.currentNote}/20</span>
                    {" → "}
                    <span className="text-green-600 font-bold">{appealConfirm.proposedNote ?? "?"}/20</span>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">En validant, la nouvelle note sera officielle et l'étudiant en sera notifié.</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setAppealConfirm(null)}>Annuler</Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      agentValidateAppeal(appealConfirm.id);
                      setPendingAppeals(getAcceptedAppealsForAgent());
                      setAppealConfirm(null);
                    }}
                  >
                    Confirmer
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 max-w-sm w-full">
                <h3 className="font-bold text-base mb-2">
                  {confirmModal.action === "valider" ? "Confirmer la validation" : "Confirmer la publication"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {confirmModal.id === "__all__"
                    ? `Publier ${counts.valide} modules validés ? Les notes seront visibles par les étudiants.`
                    : confirmModal.action === "valider"
                      ? "Voulez-vous valider les notes de ce module ? Cette action ne peut pas être annulée."
                      : "Les notes seront visibles par les étudiants. Confirmer la publication ?"}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setConfirmModal(null)}>Annuler</Button>
                  <Button
                    className={`flex-1 ${confirmModal.action === "valider" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
                    onClick={() => {
                      if (confirmModal.id === "__all__") publishAllValidated();
                      else if (confirmModal.action === "valider") validate(confirmModal.id);
                      else publish(confirmModal.id);
                      setConfirmModal(null);
                    }}
                  >
                    {confirmModal.action === "valider" ? "Valider" : "Publier"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject modal */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 max-w-sm w-full">
                <h3 className="font-bold text-base mb-2">Rejeter et renvoyer à l'enseignant</h3>
                <p className="text-sm text-muted-foreground mb-3">Un motif est obligatoire. Il sera communiqué à l'enseignant.</p>
                <Input
                  placeholder="Motif de rejet…"
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => prev ? { ...prev, reason: e.target.value } : null)}
                  className="mb-4"
                />
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setRejectModal(null)}>Annuler</Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={!rejectModal.reason.trim()}
                    onClick={() => { reject(rejectModal.id, rejectModal.reason); setRejectModal(null); }}>
                    Confirmer le rejet
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
