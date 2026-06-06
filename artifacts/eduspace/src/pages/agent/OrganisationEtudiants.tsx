import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, X, CheckCircle, ChevronDown, ChevronRight,
  GraduationCap, Layers, Shuffle, ArrowRightLeft, Filter, RefreshCw, AlertCircle,
} from "lucide-react";
import { agent as api } from "@/lib/api";
import { buildOrgFromStudents, setOrgState, type OrgSection } from "@/lib/orgStore";
import { getAgentFiliere } from "@/lib/auth";

const NIVEAUX = ["L1", "L2", "L3", "M1", "M2", "ING1", "ING2", "ING3", "ING4", "ING5"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

type LocalStudent = { id: string; matricule: string; nom: string; prenom: string; filiere: string; niveau: string; groupe: string; section: string };

export default function AgentOrganisationEtudiants() {
  const agentFiliere = getAgentFiliere();

  const [apiStudents, setApiStudents] = useState<LocalStudent[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [filterNiveau, setFilterNiveau] = useState("all");

  const [showRepartir, setShowRepartir] = useState(false);
  const [repForm, setRepForm] = useState({ niveau: "L3", nbSections: "2", nbGroupes: "2" });
  const [working, setWorking] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  const [reassign, setReassign] = useState<{ studentId: string; niveau: string; currentSection: string; currentGroupe: string } | null>(null);
  const [reassignTarget, setReassignTarget] = useState<{ section: string; groupe: string }>({ section: "", groupe: "" });

  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const data = await api.students() as Record<string, unknown>[];
      const mapped: LocalStudent[] = data.map(s => ({
        id:        String(s.id),
        matricule: String(s.matricule ?? ""),
        nom:       String(s.nom ?? ""),
        prenom:    String(s.prenom ?? ""),
        filiere:   String(s.filiere ?? ""),
        niveau:    String(s.niveau ?? ""),
        groupe:    String(s.groupe ?? ""),
        section:   String(s.section ?? ""),
      }));
      setApiStudents(mapped);
      // Keep the shared org store in sync so Sheets / Emploi du temps stay consistent.
      setOrgState(buildOrgFromStudents(mapped.filter(s => s.filiere === agentFiliere)));
    } catch { /* keep empty */ }
    finally { setLoadingStudents(false); }
  }, [agentFiliere]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Sections of this department, derived from the real student records.
  const sections: OrgSection[] = useMemo(
    () => buildOrgFromStudents(apiStudents.filter(s => s.filiere === agentFiliere)).sections,
    [apiStudents, agentFiliere],
  );

  const filteredSections = useMemo(
    () => sections.filter(s => filterNiveau === "all" || s.niveau === filterNiveau),
    [sections, filterNiveau],
  );

  const studentById = useMemo(() => new Map(apiStudents.map(s => [s.id, s])), [apiStudents]);

  function flash(kind: "ok" | "err", msg: string) {
    setBanner({ kind, msg });
    setTimeout(() => setBanner(null), 6000);
  }

  function toggleSection(id: string) {
    setExpandedSections(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleGroup(id: string) {
    setExpandedGroups(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  // ── Répartir : un seul appel serveur qui affecte section + groupe à tous les
  //    étudiants du niveau ET crée l'emploi du temps de tout nouveau groupe. ──
  async function repartirNiveau() {
    const niveau = repForm.niveau;
    const nbSections = Math.max(1, parseInt(repForm.nbSections) || 1);
    const nbGroupes  = Math.max(1, parseInt(repForm.nbGroupes) || 1);

    setWorking(true);
    try {
      const res = await api.repartir({ filiere: agentFiliere, niveau, nbSections, nbGroupes });
      await fetchStudents();
      setShowRepartir(false);
      setExpandedSections(new Set());
      flash("ok", `${res.total} étudiant(s) de ${niveau} répartis en ${nbSections} section(s) × ${nbGroupes} groupe(s) — emplois du temps mis à jour.`);
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Erreur lors de la répartition.");
    } finally { setWorking(false); }
  }

  function openReassign(studentId: string, niveau: string, section: string, groupe: string) {
    setReassign({ studentId, niveau, currentSection: section, currentGroupe: groupe });
    setReassignTarget({ section, groupe: "" });
  }

  async function confirmReassign() {
    if (!reassign || !reassignTarget.section || !reassignTarget.groupe) return;
    setWorking(true);
    try {
      await api.updateStudent(Number(reassign.studentId), { section: reassignTarget.section, groupe: reassignTarget.groupe });
      await fetchStudents();
      setReassign(null);
      flash("ok", "Étudiant déplacé — enregistré en base.");
    } catch (e) {
      flash("err", e instanceof Error ? e.message : "Erreur lors du déplacement.");
    } finally { setWorking(false); }
  }

  // Sections / groups available as reassign targets (same niveau as the student).
  const reassignSections = reassign ? sections.filter(s => s.niveau === reassign.niveau) : [];
  const reassignGroups = reassignSections.find(s => s.nom === reassignTarget.section)?.groupes ?? [];

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Organisation des étudiants</h1>
              <p className="text-muted-foreground mt-1">
                Sections et groupes — synchronisés avec les comptes étudiants ({agentFiliere}).
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {loadingStudents ? "Chargement des étudiants…" : `${apiStudents.filter(s => s.filiere === agentFiliere).length} étudiant(s) ${agentFiliere}.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={fetchStudents} disabled={loadingStudents} title="Recharger depuis les comptes étudiants">
                <RefreshCw className={`w-4 h-4 ${loadingStudents ? "animate-spin" : ""}`} />Actualiser
              </Button>
              <Button className="gap-2" size="sm" onClick={() => setShowRepartir(true)}>
                <Shuffle className="w-4 h-4" />Répartir un niveau
              </Button>
            </div>
          </motion.div>

          {/* Niveau filter */}
          <motion.div variants={item}>
            <Card className="p-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Filter className="w-3.5 h-3.5" />Filtrer par niveau :
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all", ...NIVEAUX].map(n => (
                    <button key={n} onClick={() => setFilterNiveau(n)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filterNiveau === n ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                      {n === "all" ? "Tous les niveaux" : n}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-auto">{filteredSections.length} section(s)</span>
              </div>
            </Card>
          </motion.div>

          {banner && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm ${banner.kind === "ok" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                {banner.kind === "ok" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}{banner.msg}
              </div>
            </motion.div>
          )}

          {filteredSections.length === 0 ? (
            <motion.div variants={item}>
              <Card className="p-12 text-center">
                <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  {filterNiveau === "all" ? "Aucune section pour le moment." : `Aucune section pour le niveau ${filterNiveau}.`}
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Utilisez « Répartir un niveau » pour organiser les étudiants en sections et groupes.
                </p>
                <Button size="sm" onClick={() => setShowRepartir(true)} className="gap-2">
                  <Shuffle className="w-4 h-4" />Répartir un niveau
                </Button>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={item} className="space-y-4">
              {filteredSections.map(section => {
                const isExpanded = expandedSections.has(section.id);
                const totalStudents = section.groupes.reduce((acc, g) => acc + g.studentIds.length, 0);
                return (
                  <Card key={section.id} className="overflow-hidden">
                    <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => toggleSection(section.id)}>
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Layers className="w-4 h-4 text-primary" /></div>
                        <div>
                          <p className="font-semibold">{section.nom}</p>
                          <p className="text-xs text-muted-foreground">{agentFiliere} — {section.niveau}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold">{totalStudents} <span className="font-normal text-muted-foreground">étudiant(s)</span></p>
                          <p className="text-xs text-muted-foreground">{section.nbGroupes} groupe(s)</p>
                        </div>
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{section.niveau}</Badge>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="border-t border-border/50 p-4 space-y-3 bg-muted/5">
                            {section.groupes.map(groupe => {
                              const isGrpExpanded = expandedGroups.has(groupe.id);
                              return (
                                <div key={groupe.id} className="border border-border/60 rounded-lg overflow-hidden">
                                  <div className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => toggleGroup(groupe.id)}>
                                    <div className="flex items-center gap-2.5">
                                      {isGrpExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                                      <span className="text-sm font-medium">{groupe.nom}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{groupe.studentIds.length} étudiant(s)</span>
                                  </div>

                                  <AnimatePresence>
                                    {isGrpExpanded && (
                                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                                        <div className="border-t border-border/40 bg-background">
                                          {groupe.studentIds.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-4 italic">Aucun étudiant dans ce groupe.</p>
                                          ) : (
                                            <table className="w-full text-xs">
                                              <thead className="bg-muted/20">
                                                <tr>
                                                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Matricule</th>
                                                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Nom complet</th>
                                                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Niveau</th>
                                                  <th className="text-center px-4 py-2 font-medium text-muted-foreground">Changer groupe</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {groupe.studentIds.map(sid => {
                                                  const s = studentById.get(sid);
                                                  if (!s) return null;
                                                  return (
                                                    <tr key={sid} className="border-t border-border/30 hover:bg-muted/10">
                                                      <td className="px-4 py-2 font-mono">{s.matricule}</td>
                                                      <td className="px-4 py-2 font-medium">{s.prenom} {s.nom}</td>
                                                      <td className="px-4 py-2 text-muted-foreground">{s.niveau}</td>
                                                      <td className="px-4 py-2 text-center">
                                                        <Button size="sm" variant="ghost" className="h-6 px-2 gap-1 text-[10px] text-indigo-600 hover:text-indigo-800"
                                                          onClick={() => openReassign(sid, section.niveau, section.nom, groupe.nom)}>
                                                          <ArrowRightLeft className="w-3 h-3" />Changer
                                                        </Button>
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* ── RÉPARTIR MODAL ── */}
      <AnimatePresence>
        {showRepartir && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-base">Répartir un niveau</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Affecte section + groupe à tous les étudiants du niveau (enregistré en base).</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowRepartir(false)}><X className="w-4 h-4" /></Button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Niveau *</label>
                    <Select value={repForm.niveau} onValueChange={v => setRepForm(p => ({ ...p, niveau: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{NIVEAUX.map(n => <SelectItem key={n} value={n}>{n} — {agentFiliere}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre de sections</label>
                      <Input type="number" min="1" max="6" value={repForm.nbSections} onChange={e => setRepForm(p => ({ ...p, nbSections: e.target.value }))} className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Groupes / section</label>
                      <Input type="number" min="1" max="6" value={repForm.nbGroupes} onChange={e => setRepForm(p => ({ ...p, nbGroupes: e.target.value }))} className="h-9 text-sm" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      Sections nommées <strong>Section 1, 2…</strong> et groupes <strong>Groupe 1, 2…</strong> — cohérent avec les comptes étudiants. La répartition précédente du niveau sera remplacée.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => setShowRepartir(false)} disabled={working}>Annuler</Button>
                  <Button className="flex-1 gap-2" disabled={working} onClick={repartirNiveau}>
                    <Shuffle className={`w-4 h-4 ${working ? "animate-spin" : ""}`} />{working ? "Enregistrement…" : "Répartir et enregistrer"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── REASSIGN MODAL ── */}
      <AnimatePresence>
        {reassign && (() => {
          const student = studentById.get(reassign.studentId);
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <Card className="p-6 w-full max-w-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-indigo-500" /><h3 className="font-bold text-base">Changer de groupe</h3></div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setReassign(null)}><X className="w-4 h-4" /></Button>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-3 mb-4 text-sm">
                    <p className="font-medium">{student?.prenom} {student?.nom}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Actuellement : {reassign.currentSection} — {reassign.currentGroupe}</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Section de destination</label>
                      <Select value={reassignTarget.section} onValueChange={v => setReassignTarget({ section: v, groupe: "" })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir une section…" /></SelectTrigger>
                        <SelectContent>{reassignSections.map(s => <SelectItem key={s.id} value={s.nom}>{s.nom}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    {reassignTarget.section && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Groupe de destination</label>
                        <Select value={reassignTarget.groupe} onValueChange={v => setReassignTarget(p => ({ ...p, groupe: v }))}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir un groupe…" /></SelectTrigger>
                          <SelectContent>{reassignGroups.map(g => <SelectItem key={g.id} value={g.nom}>{g.nom} ({g.studentIds.length})</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-5">
                    <Button variant="outline" className="flex-1" onClick={() => setReassign(null)} disabled={working}>Annuler</Button>
                    <Button className="flex-1 gap-2" disabled={!reassignTarget.section || !reassignTarget.groupe || working} onClick={confirmReassign}>
                      <ArrowRightLeft className="w-4 h-4" />{working ? "…" : "Confirmer"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
