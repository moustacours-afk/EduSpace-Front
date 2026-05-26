import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Plus, X, CheckCircle, ChevronDown, ChevronRight,
  GraduationCap, Layers, Shuffle, Trash2, Edit, ArrowRightLeft,
  Filter,
} from "lucide-react";
import { agentStudents } from "@/data/mockData";
import {
  getOrgState, setOrgState,
  type OrgState, type OrgSection, type OrgGroup,
} from "@/lib/orgStore";

const NIVEAUX = ["L1", "L2", "L3", "M1", "M2", "ING1", "ING2", "ING3"];
const NIVEAUX_AVEC_SPECIALITE = ["M1", "M2", "ING1", "ING2", "ING3"];

const SPECIALITES_PAR_NIVEAU: Record<string, string[]> = {
  M1: ["Systèmes Informatiques", "Réseaux & Télécoms", "Base de Données & IA", "Génie Logiciel"],
  M2: ["Systèmes Informatiques", "Réseaux & Télécoms", "Base de Données & IA", "Génie Logiciel"],
  ING1: ["Génie des Systèmes", "Réseaux & Télécoms", "Sécurité Informatique"],
  ING2: ["Génie des Systèmes", "Réseaux & Télécoms", "Sécurité Informatique"],
  ING3: ["Génie des Systèmes", "Réseaux & Télécoms", "Sécurité Informatique"],
};

const AGENT_FILIERE = "Informatique";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildGroups(studentIds: string[], nbGroupes: number, sectionId: string): OrgGroup[] {
  const shuffled = shuffleArray(studentIds);
  const groups: OrgGroup[] = [];
  const baseSize = Math.floor(shuffled.length / nbGroupes);
  const remainder = shuffled.length % nbGroupes;
  let idx = 0;
  for (let g = 0; g < nbGroupes; g++) {
    const size = baseSize + (g < remainder ? 1 : 0);
    groups.push({
      id: `${sectionId}-g${g + 1}`,
      nom: `Groupe ${g + 1}`,
      nbMax: Math.ceil(shuffled.length / nbGroupes),
      studentIds: shuffled.slice(idx, idx + size),
    });
    idx += size;
  }
  return groups;
}

export default function AgentOrganisationEtudiants() {
  const [orgState, setLocalOrg] = useState<OrgState>(() => getOrgState());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSuccess, setCreateSuccess] = useState("");
  const [filterNiveau, setFilterNiveau] = useState("all");
  const [filterSpecialite, setFilterSpecialite] = useState("all");

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editGroupsForm, setEditGroupsForm] = useState<{ id: string; nom: string; nbMax: number }[]>([]);

  const [reassignStudent, setReassignStudent] = useState<{ studentId: string; currentSectionId: string; currentGroupId: string } | null>(null);
  const [reassignTarget, setReassignTarget] = useState<{ sectionId: string; groupId: string }>({ sectionId: "", groupId: "" });

  const [form, setForm] = useState({
    niveau: "L3",
    specialite: "",
    maxStudents: "200",
    nbGroupes: "4",
  });

  useEffect(() => {
    setLocalOrg(getOrgState());
  }, []);

  // Reset specialite when niveau changes in filter
  useEffect(() => {
    setFilterSpecialite("all");
  }, [filterNiveau]);

  // Reset specialite in form when niveau changes
  useEffect(() => {
    setForm(p => ({ ...p, specialite: "" }));
  }, [form.niveau]);

  function saveOrg(state: OrgState) {
    setOrgState(state);
    setLocalOrg(state);
  }

  function getAssignedStudentIds(): Set<string> {
    const ids = new Set<string>();
    orgState.sections.forEach(s => s.groupes.forEach(g => g.studentIds.forEach(id => ids.add(id))));
    return ids;
  }

  function createSection() {
    const nb = parseInt(form.nbGroupes) || 4;
    const max = parseInt(form.maxStudents) || 200;

    const assigned = getAssignedStudentIds();
    const eligible = agentStudents.filter(
      s => s.niveau === form.niveau && s.filiere === AGENT_FILIERE && !assigned.has(s.id)
    );

    const toAssign = shuffleArray(eligible).slice(0, max).map(s => s.id);
    const sectionIndex = orgState.sections.filter(s => s.niveau === form.niveau).length + 1;
    const sectionId = `sec-${form.niveau}-${Date.now()}`;

    const newSection: OrgSection = {
      id: sectionId,
      nom: `Section ${sectionIndex}`,
      niveau: form.niveau,
      specialite: NIVEAUX_AVEC_SPECIALITE.includes(form.niveau) ? (form.specialite || undefined) : undefined,
      maxStudents: max,
      nbGroupes: nb,
      groupes: buildGroups(toAssign, nb, sectionId),
    };

    const newState: OrgState = { sections: [...orgState.sections, newSection] };
    saveOrg(newState);
    setShowCreateModal(false);
    setExpandedSections(prev => new Set(prev).add(sectionId));
    const total = newSection.groupes.reduce((acc, g) => acc + g.studentIds.length, 0);
    const specLabel = newSection.specialite ? ` — ${newSection.specialite}` : "";
    setCreateSuccess(`${newSection.nom} (${form.niveau}${specLabel}) créée — ${total} étudiant(s) réparti(s) en ${nb} groupe(s).`);
    setTimeout(() => setCreateSuccess(""), 6000);
  }

  function deleteSection(id: string) {
    const newState: OrgState = { sections: orgState.sections.filter(s => s.id !== id) };
    saveOrg(newState);
  }

  function toggleSection(id: string) {
    setExpandedSections(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleGroup(id: string) {
    setExpandedGroups(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function openEditSection(section: OrgSection) {
    setEditingSectionId(section.id);
    setEditGroupsForm(section.groupes.map(g => ({ id: g.id, nom: g.nom, nbMax: g.nbMax })));
  }

  function saveEditSection() {
    if (!editingSectionId) return;
    const newState: OrgState = {
      sections: orgState.sections.map(sec => {
        if (sec.id !== editingSectionId) return sec;
        const updatedGroupes = sec.groupes
          .filter(g => editGroupsForm.some(ef => ef.id === g.id))
          .map(g => {
            const ef = editGroupsForm.find(f => f.id === g.id)!;
            return { ...g, nom: ef.nom, nbMax: ef.nbMax };
          });
        const newGroups = editGroupsForm
          .filter(ef => ef.id.startsWith("new-"))
          .map((ef, i) => ({
            id: `${editingSectionId}-g${Date.now()}-${i}`,
            nom: ef.nom,
            nbMax: ef.nbMax,
            studentIds: [],
          }));
        return { ...sec, groupes: [...updatedGroupes, ...newGroups], nbGroupes: updatedGroupes.length + newGroups.length };
      }),
    };
    saveOrg(newState);
    setEditingSectionId(null);
  }

  function addGroupToForm() {
    const nextNum = editGroupsForm.length + 1;
    setEditGroupsForm(prev => [...prev, { id: `new-${Date.now()}`, nom: `Groupe ${nextNum}`, nbMax: 30 }]);
  }

  function removeGroupFromForm(id: string) {
    setEditGroupsForm(prev => prev.filter(g => g.id !== id));
  }

  function openReassign(studentId: string, sectionId: string, groupId: string) {
    setReassignStudent({ studentId, currentSectionId: sectionId, currentGroupId: groupId });
    setReassignTarget({ sectionId: "", groupId: "" });
  }

  function confirmReassign() {
    if (!reassignStudent || !reassignTarget.sectionId || !reassignTarget.groupId) return;
    const newState: OrgState = {
      sections: orgState.sections.map(sec => ({
        ...sec,
        groupes: sec.groupes.map(grp => {
          if (grp.id === reassignStudent.currentGroupId) {
            return { ...grp, studentIds: grp.studentIds.filter(id => id !== reassignStudent.studentId) };
          }
          if (grp.id === reassignTarget.groupId) {
            return { ...grp, studentIds: [...grp.studentIds, reassignStudent.studentId] };
          }
          return grp;
        }),
      })),
    };
    saveOrg(newState);
    setReassignStudent(null);
  }

  const approxPerGroup = Math.ceil((parseInt(form.maxStudents) || 200) / (parseInt(form.nbGroupes) || 4));

  const filteredSections = orgState.sections.filter(s => {
    if (filterNiveau !== "all" && s.niveau !== filterNiveau) return false;
    if (
      filterNiveau !== "all" &&
      NIVEAUX_AVEC_SPECIALITE.includes(filterNiveau) &&
      filterSpecialite !== "all" &&
      s.specialite !== filterSpecialite
    ) return false;
    return true;
  });

  const editingSection = editingSectionId ? orgState.sections.find(s => s.id === editingSectionId) : null;
  const formSpecialites = NIVEAUX_AVEC_SPECIALITE.includes(form.niveau) ? (SPECIALITES_PAR_NIVEAU[form.niveau] ?? []) : [];
  const filterSpecialites = filterNiveau !== "all" && NIVEAUX_AVEC_SPECIALITE.includes(filterNiveau)
    ? (SPECIALITES_PAR_NIVEAU[filterNiveau] ?? [])
    : [];

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Organisation des étudiants</h1>
              <p className="text-muted-foreground mt-1">
                Créez des sections, définissez les groupes et répartissez automatiquement les étudiants.
              </p>
            </div>
            <Button className="gap-2" size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />Créer une section
            </Button>
          </motion.div>

          {/* Niveau filter */}
          <motion.div variants={item}>
            <Card className="p-3 space-y-3">
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
                <span className="text-xs text-muted-foreground ml-auto">{filteredSections.length} section(s) affichée(s)</span>
              </div>

              {/* Specialite filter — only for M1/M2/ING levels */}
              {filterSpecialites.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-border/40">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <GraduationCap className="w-3.5 h-3.5" />Spécialité :
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {["all", ...filterSpecialites].map(sp => (
                      <button key={sp} onClick={() => setFilterSpecialite(sp)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filterSpecialite === sp ? "bg-indigo-600 text-white border-indigo-600" : "border-border text-muted-foreground hover:border-indigo-400/50 hover:text-foreground"}`}>
                        {sp === "all" ? "Toutes les spécialités" : sp}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {createSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />{createSuccess}
              </div>
            </motion.div>
          )}

          {filteredSections.length === 0 ? (
            <motion.div variants={item}>
              <Card className="p-12 text-center">
                <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  {filterNiveau === "all" ? "Aucune section créée pour le moment." : `Aucune section pour le niveau ${filterNiveau}.`}
                </p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Créez une section pour répartir automatiquement les étudiants en groupes.
                </p>
                <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />Créer la première section
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
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded
                          ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        }
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{section.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            {AGENT_FILIERE} — {section.niveau}
                            {section.specialite ? ` — ${section.specialite}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-semibold">{totalStudents} <span className="font-normal text-muted-foreground">étudiant(s)</span></p>
                          <p className="text-xs text-muted-foreground">{section.nbGroupes} groupe(s)</p>
                        </div>
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{section.niveau}</Badge>
                        {section.specialite && (
                          <Badge className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200 hidden md:inline-flex">
                            {section.specialite}
                          </Badge>
                        )}
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 w-7 p-0 text-blue-500 hover:text-blue-700"
                          onClick={e => { e.stopPropagation(); openEditSection(section); }}
                          title="Modifier la section"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                          onClick={e => { e.stopPropagation(); deleteSection(section.id); }}
                          title="Supprimer la section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border/50 p-4 space-y-3 bg-muted/5">
                            {section.groupes.map(groupe => {
                              const isGrpExpanded = expandedGroups.has(groupe.id);
                              return (
                                <div key={groupe.id} className="border border-border/60 rounded-lg overflow-hidden">
                                  <div
                                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-muted/20 transition-colors"
                                    onClick={() => toggleGroup(groupe.id)}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      {isGrpExpanded
                                        ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                        : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                      }
                                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                                      <span className="text-sm font-medium">{groupe.nom}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">{groupe.studentIds.length}/{groupe.nbMax} étudiant(s)</span>
                                    </div>
                                  </div>

                                  <AnimatePresence>
                                    {isGrpExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="border-t border-border/40 bg-background">
                                          {groupe.studentIds.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-4 italic">
                                              Aucun étudiant dans ce groupe.
                                            </p>
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
                                                  const s = agentStudents.find(x => x.id === sid);
                                                  if (!s) return null;
                                                  return (
                                                    <tr key={sid} className="border-t border-border/30 hover:bg-muted/10">
                                                      <td className="px-4 py-2 font-mono">{s.matricule}</td>
                                                      <td className="px-4 py-2 font-medium">{s.prenom} {s.nom}</td>
                                                      <td className="px-4 py-2 text-muted-foreground">{s.niveau}</td>
                                                      <td className="px-4 py-2 text-center">
                                                        <Button size="sm" variant="ghost" className="h-6 px-2 gap-1 text-[10px] text-indigo-600 hover:text-indigo-800"
                                                          onClick={() => openReassign(sid, section.id, groupe.id)}>
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

      {/* ── CREATE SECTION MODAL ── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-base">Créer une section</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Les étudiants seront répartis aléatoirement.</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowCreateModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Niveau *</label>
                    <Select value={form.niveau} onValueChange={v => setForm(p => ({ ...p, niveau: v, specialite: "" }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {NIVEAUX.map(n => <SelectItem key={n} value={n}>{n} — {AGENT_FILIERE}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specialite — only for M1/M2/ING levels */}
                  {formSpecialites.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Spécialité *</label>
                      <Select value={form.specialite} onValueChange={v => setForm(p => ({ ...p, specialite: v }))}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir une spécialité…" /></SelectTrigger>
                        <SelectContent>
                          {formSpecialites.map(sp => <SelectItem key={sp} value={sp}>{sp}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Nombre max d'étudiants dans cette section
                    </label>
                    <Input
                      type="number" min="1" placeholder="200"
                      value={form.maxStudents}
                      onChange={e => setForm(p => ({ ...p, maxStudents: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Nombre de groupes</label>
                    <Input
                      type="number" min="1" max="20" placeholder="4"
                      value={form.nbGroupes}
                      onChange={e => setForm(p => ({ ...p, nbGroupes: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <p className="text-xs text-indigo-700">
                      Soit environ <strong>{approxPerGroup}</strong> étudiant(s) par groupe.
                      Les étudiants disponibles seront répartis aléatoirement.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Annuler</Button>
                  <Button
                    className="flex-1 gap-2"
                    disabled={
                      !form.niveau || !form.maxStudents || !form.nbGroupes ||
                      (formSpecialites.length > 0 && !form.specialite)
                    }
                    onClick={createSection}
                  >
                    <Shuffle className="w-4 h-4" />Créer et répartir
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EDIT SECTION GROUPS MODAL ── */}
      <AnimatePresence>
        {editingSectionId && editingSection && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-base">Modifier {editingSection.nom}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {AGENT_FILIERE} — {editingSection.niveau}
                      {editingSection.specialite ? ` — ${editingSection.specialite}` : ""}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditingSectionId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Groupes</p>
                  {editGroupsForm.map((g, idx) => (
                    <div key={g.id} className="flex items-center gap-2 p-3 border border-border/60 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Nom du groupe</label>
                          <Input value={g.nom} className="h-8 text-sm"
                            onChange={e => setEditGroupsForm(prev => prev.map((x, i) => i === idx ? { ...x, nom: e.target.value } : x))} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Nb max étudiants</label>
                          <Input type="number" value={g.nbMax} className="h-8 text-sm"
                            onChange={e => setEditGroupsForm(prev => prev.map((x, i) => i === idx ? { ...x, nbMax: parseInt(e.target.value) || 30 } : x))} />
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 flex-shrink-0"
                        onClick={() => removeGroupFromForm(g.id)} disabled={editGroupsForm.length <= 1}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={addGroupToForm}>
                    <Plus className="w-3.5 h-3.5" />Ajouter un groupe
                  </Button>
                </div>

                <div className="flex gap-3 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => setEditingSectionId(null)}>Annuler</Button>
                  <Button className="flex-1" onClick={saveEditSection}>Enregistrer</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── REASSIGN STUDENT MODAL ── */}
      <AnimatePresence>
        {reassignStudent && (() => {
          const student = agentStudents.find(s => s.id === reassignStudent.studentId);
          const currentSection = orgState.sections.find(s => s.id === reassignStudent.currentSectionId);
          const currentGroup = currentSection?.groupes.find(g => g.id === reassignStudent.currentGroupId);
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <Card className="p-6 w-full max-w-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                      <h3 className="font-bold text-base">Changer de groupe</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setReassignStudent(null)}><X className="w-4 h-4" /></Button>
                  </div>

                  <div className="bg-muted/20 rounded-lg p-3 mb-4 text-sm">
                    <p className="font-medium">{student?.prenom} {student?.nom}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Actuellement : {currentSection?.nom} — {currentGroup?.nom}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Section de destination</label>
                      <Select value={reassignTarget.sectionId} onValueChange={v => setReassignTarget({ sectionId: v, groupId: "" })}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir une section…" /></SelectTrigger>
                        <SelectContent>
                          {orgState.sections.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.nom} ({s.niveau}{s.specialite ? ` — ${s.specialite}` : ""})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {reassignTarget.sectionId && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Groupe de destination</label>
                        <Select value={reassignTarget.groupId} onValueChange={v => setReassignTarget(p => ({ ...p, groupId: v }))}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir un groupe…" /></SelectTrigger>
                          <SelectContent>
                            {(orgState.sections.find(s => s.id === reassignTarget.sectionId)?.groupes ?? [])
                              .filter(g => g.id !== reassignStudent.currentGroupId || reassignTarget.sectionId !== reassignStudent.currentSectionId)
                              .map(g => (
                                <SelectItem key={g.id} value={g.id}>{g.nom} ({g.studentIds.length}/{g.nbMax})</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-5">
                    <Button variant="outline" className="flex-1" onClick={() => setReassignStudent(null)}>Annuler</Button>
                    <Button className="flex-1 gap-2" disabled={!reassignTarget.sectionId || !reassignTarget.groupId} onClick={confirmReassign}>
                      <ArrowRightLeft className="w-4 h-4" />Confirmer
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
