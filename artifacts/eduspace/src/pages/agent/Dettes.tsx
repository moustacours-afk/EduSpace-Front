import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ClipboardEdit, Filter, RefreshCw, Search, X,
  ChevronRight, AlertTriangle, CheckCircle, Save, BookOpen,
} from "lucide-react";
import { groupesParNiveau } from "@/data/mockData";
import { getSectionsForNiveau } from "@/lib/orgStore";
import { agent as api } from "@/lib/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item      = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const NIVEAUX = ["L1", "L2", "L3", "M1", "M2", "ING1", "ING2", "ING3", "ING4", "ING5"];

type Student = {
  id: number; matricule: string; nom: string; prenom: string;
  niveau: string; section: string; groupe: string;
};

type NoteRow = {
  id: number; moduleId: number; module: string; code: string;
  typeUe: string; credits: number; coefficient: number; hasTp: boolean;
  semestre: string;
  exam: number | null; controle: number | null; tp: number | null;
  moyenne: number | null; creditAcquis: number; situation: string; statut: string;
};

type EditState = { exam: string; controle: string; tp: string };

function calcMoyenne(exam: number, controle: number, tp: number | null, hasTp: boolean): number {
  if (hasTp && tp !== null) return Math.round((exam * 0.6 + controle * 0.2 + tp * 0.2) * 100) / 100;
  return Math.round((exam * 0.6 + controle * 0.4) * 100) / 100;
}

function situationBadge(situation: string) {
  if (situation === "admis")     return <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">Admis</Badge>;
  if (situation === "rattrapage") return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Rattrapage</Badge>;
  return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Ajourné</Badge>;
}

// ── Relevé modal — shows ALL modules grouped by UE, editable for dettes ───────
function ReleveModal({
  student, onClose,
}: { student: Student; onClose: () => void }) {
  const [notes, setNotes]       = useState<NoteRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editId, setEditId]     = useState<number | null>(null);
  const [editVals, setEditVals] = useState<EditState>({ exam: "", controle: "", tp: "" });
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState<{ id: number; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.studentNotes(student.id) as NoteRow[];
      setNotes(data);
    } catch { /* keep empty */ }
    finally { setLoading(false); }
  }, [student.id]);

  useEffect(() => { load(); }, [load]);

  function startEdit(n: NoteRow) {
    if (n.situation === "admis") return;
    setEditId(n.id);
    setEditVals({ exam: String(n.exam ?? ""), controle: String(n.controle ?? ""), tp: String(n.tp ?? "") });
    setSaveMsg(null);
  }

  function cancelEdit() { setEditId(null); }

  function liveCalc(vals: EditState, hasTp: boolean): { moy: number | null; valid: boolean } {
    const exam = parseFloat(vals.exam), controle = parseFloat(vals.controle), tp = parseFloat(vals.tp);
    if (isNaN(exam) || isNaN(controle)) return { moy: null, valid: false };
    if (hasTp && isNaN(tp)) return { moy: null, valid: false };
    return { moy: calcMoyenne(exam, controle, hasTp ? tp : null, hasTp), valid: true };
  }

  async function saveNote(n: NoteRow) {
    const { moy, valid } = liveCalc(editVals, n.hasTp);
    if (!valid || moy === null) return;
    if (moy >= 10) { setSaveMsg({ id: n.id, ok: false }); return; }
    setSaving(true);
    try {
      const body: { note_exam: number; note_controle: number; note_tp?: number } = {
        note_exam: parseFloat(editVals.exam),
        note_controle: parseFloat(editVals.controle),
      };
      if (n.hasTp) body.note_tp = parseFloat(editVals.tp);
      const res = await api.updateNote(n.id, body);
      setNotes(prev => prev.map(r =>
        r.id === n.id
          ? { ...r, exam: body.note_exam, controle: body.note_controle, tp: body.note_tp ?? r.tp,
              moyenne: res.moyenne, situation: res.situation, creditAcquis: res.creditAcquis }
          : r
      ));
      setSaveMsg({ id: n.id, ok: true });
      setEditId(null);
    } catch { setSaveMsg({ id: n.id, ok: false }); }
    finally { setSaving(false); }
  }

  const dettes = notes.filter(n => n.situation !== "admis");
  // Group all notes by semestre → typeUe
  const semestres = [...new Set(notes.map(n => n.semestre))].sort();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-end overflow-hidden">
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="w-full max-w-2xl h-full bg-background shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between gap-3 flex-shrink-0">
          <div>
            <h2 className="font-bold text-base">{student.prenom} {student.nom}</h2>
            <p className="text-xs text-muted-foreground">
              {student.matricule} · {student.niveau} · {student.section} · {student.groupe}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {dettes.length > 0
              ? <Badge className="bg-red-100 text-red-700 border-red-200">{dettes.length} dette(s)</Badge>
              : <Badge className="bg-green-100 text-green-700 border-green-200">Aucune dette</Badge>
            }
            <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-2 border-b bg-muted/30 flex-shrink-0">
          <p className="text-[10px] text-muted-foreground">
            Relevé complet — modules admis (lecture seule) et dettes (modifiables). Cliquez sur un module en dette pour éditer les notes.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Chargement…</div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
              <BookOpen className="w-8 h-8" />
              <p className="text-sm">Aucune note disponible.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {semestres.map(sem => {
                const semNotes = notes.filter(n => n.semestre === sem);
                const ueGroups = [...new Set(semNotes.map(n => n.typeUe || "UE"))];
                return (
                  <div key={sem}>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 border-b pb-1">{sem}</p>
                    <div className="space-y-4">
                      {ueGroups.map(ue => {
                        const ueNotes = semNotes.filter(n => (n.typeUe || "UE") === ue);
                        const ueDettes = ueNotes.filter(n => n.situation !== "admis");
                        return (
                          <div key={ue}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">{ue}</span>
                              {ueDettes.length > 0 && <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-600 border-red-200">{ueDettes.length} dette(s)</Badge>}
                            </div>
                            <div className="space-y-2 ml-2">
                              {ueNotes.map(n => {
                                const isEditing = editId === n.id;
                                const isDette = n.situation !== "admis";
                                const { moy: liveMoy } = isEditing ? liveCalc(editVals, n.hasTp) : { moy: null };
                                const liveSit = liveMoy !== null ? (liveMoy >= 10 ? "admis" : liveMoy >= 8 ? "rattrapage" : "ajourne") : null;
                                const blockedByMoy = liveMoy !== null && liveMoy >= 10;

                                return (
                                  <Card key={n.id}
                                    className={`p-3 border transition-colors ${
                                      isEditing ? "border-primary/40 bg-primary/5"
                                        : isDette ? "hover:border-red-300 cursor-pointer"
                                        : "opacity-70"
                                    }`}
                                    onClick={() => { if (!isEditing && isDette) startEdit(n); }}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-semibold text-sm truncate">{n.module}</span>
                                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{n.code}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                          <span>{n.credits} crédits</span>
                                          <span>Coeff. {n.coefficient}</span>
                                          {!isEditing && <span className="font-mono font-semibold text-foreground">Moy : {n.moyenne ?? "—"}</span>}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {situationBadge(n.situation)}
                                        {isDette && !isEditing && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                                      </div>
                                    </div>

                                    {/* Edit form — only for dettes */}
                                    <AnimatePresence>
                                      {isEditing && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                                          className="mt-3 overflow-hidden"
                                          onClick={e => e.stopPropagation()}
                                        >
                                          <div className={`grid gap-3 ${n.hasTp ? "grid-cols-3" : "grid-cols-2"}`}>
                                            <div>
                                              <label className="text-[10px] text-muted-foreground block mb-1">Examen /20</label>
                                              <Input type="number" min={0} max={20} step={0.25} value={editVals.exam}
                                                onChange={e => setEditVals(v => ({ ...v, exam: e.target.value }))} className="h-8 text-sm" />
                                            </div>
                                            <div>
                                              <label className="text-[10px] text-muted-foreground block mb-1">Contrôle /20</label>
                                              <Input type="number" min={0} max={20} step={0.25} value={editVals.controle}
                                                onChange={e => setEditVals(v => ({ ...v, controle: e.target.value }))} className="h-8 text-sm" />
                                            </div>
                                            {n.hasTp && (
                                              <div>
                                                <label className="text-[10px] text-muted-foreground block mb-1">TP /20</label>
                                                <Input type="number" min={0} max={20} step={0.25} value={editVals.tp}
                                                  onChange={e => setEditVals(v => ({ ...v, tp: e.target.value }))} className="h-8 text-sm" />
                                              </div>
                                            )}
                                          </div>

                                          {liveMoy !== null && (
                                            <div className={`mt-2 rounded-lg px-3 py-2 text-xs flex items-center gap-2 ${
                                              blockedByMoy ? "bg-green-50 border border-green-200 text-green-700" : "bg-muted/40 border border-border text-foreground"
                                            }`}>
                                              {blockedByMoy
                                                ? <><CheckCircle className="w-3.5 h-3.5 flex-shrink-0" /> Moyenne {liveMoy}/20 — UE ≥ 10, ce module ne peut pas être enregistré comme dette.</>
                                                : <><BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" /> Moyenne calculée : <strong>{liveMoy}/20</strong> — {liveSit === "rattrapage" ? "Rattrapage" : "Ajourné"}</>
                                              }
                                            </div>
                                          )}

                                          {saveMsg?.id === n.id && (
                                            <div className={`mt-2 text-xs flex items-center gap-1 ${saveMsg.ok ? "text-green-600" : "text-red-600"}`}>
                                              {saveMsg.ok
                                                ? <><CheckCircle className="w-3.5 h-3.5" />Note mise à jour.</>
                                                : <><AlertTriangle className="w-3.5 h-3.5" />{blockedByMoy ? "Moyenne ≥ 10 : ce module ne peut pas être une dette." : "Erreur lors de la sauvegarde."}</>
                                              }
                                            </div>
                                          )}

                                          <div className="flex gap-2 mt-3">
                                            <Button size="sm" className="h-7 text-xs gap-1.5 flex-1"
                                              disabled={saving || blockedByMoy || liveMoy === null}
                                              onClick={() => saveNote(n)}>
                                              <Save className="w-3 h-3" />{saving ? "Enregistrement…" : "Enregistrer"}
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={cancelEdit}>Annuler</Button>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" className="w-full" onClick={onClose}>Fermer</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AgentDettes() {
  const [filterNiveau,  setFilterNiveau]  = useState("L3");
  const [filterSection, setFilterSection] = useState("Tous");
  const [filterGroupe,  setFilterGroupe]  = useState("Tous");
  const [search, setSearch]               = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);

  const orgSections   = getSectionsForNiveau(filterNiveau);
  const sectionOptions = ["Tous", ...(orgSections.length > 0 ? orgSections.map(s => s.nom) : ["Section 1", "Section 2"])];
  const groupeOptions  = ["Tous", ...(groupesParNiveau[filterNiveau] ?? ["Groupe 1"])];

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.students() as Record<string, unknown>[];
      const mapped: Student[] = data
        .filter(s => s.niveau === filterNiveau)
        .filter(s => filterSection === "Tous" || s.section === filterSection)
        .filter(s => filterGroupe  === "Tous" || s.groupe  === filterGroupe)
        .map(s => ({
          id:       Number(s.id),
          matricule: String(s.matricule ?? ""),
          nom:       String(s.nom ?? ""),
          prenom:    String(s.prenom ?? ""),
          niveau:    String(s.niveau ?? ""),
          section:   String(s.section ?? ""),
          groupe:    String(s.groupe ?? ""),
        }));
      setStudents(mapped);
    } catch { setStudents([]); }
    finally { setLoading(false); }
  }, [filterNiveau, filterSection, filterGroupe]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  function handleNiveauChange(v: string) {
    setFilterNiveau(v);
    setFilterSection("Tous");
    setFilterGroupe("Tous");
  }

  const displayed = search
    ? students.filter(s =>
        `${s.nom} ${s.prenom} ${s.matricule}`.toLowerCase().includes(search.toLowerCase())
      )
    : students;

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <motion.div variants={item}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <ClipboardEdit className="w-6 h-6 text-primary" />
                  Gestion des dettes
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Sélectionnez un étudiant pour consulter et modifier ses notes de dettes.
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={fetchStudents} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />Actualiser
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={item}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtres</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Niveau</label>
                  <Select value={filterNiveau} onValueChange={handleNiveauChange}>
                    <SelectTrigger className="w-24 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{NIVEAUX.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Section</label>
                  <Select value={filterSection} onValueChange={v => { setFilterSection(v); setFilterGroupe("Tous"); }}>
                    <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{sectionOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Groupe</label>
                  <Select value={filterGroupe} onValueChange={setFilterGroupe}>
                    <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{groupeOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-48">
                  <label className="text-xs text-muted-foreground block mb-1">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      className="pl-9 h-9 text-sm"
                      placeholder="Nom, prénom ou matricule…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {loading ? "Chargement…" : `${displayed.length} étudiant(s) — cliquez sur un étudiant pour voir et modifier ses dettes.`}
              </p>
            </Card>
          </motion.div>

          {/* Student list */}
          <motion.div variants={item}>
            {loading ? (
              <div className="flex justify-center py-16 text-muted-foreground text-sm">Chargement des étudiants…</div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                <Search className="w-8 h-8" />
                <p className="text-sm">Aucun étudiant trouvé avec ces filtres.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayed.map(s => (
                  <Card
                    key={s.id}
                    className="p-4 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                    onClick={() => setSelected(s)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{s.prenom} {s.nom}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{s.matricule}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">{s.niveau}</Badge>
                          {s.section && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">{s.section}</Badge>}
                          {s.groupe  && <Badge className="text-[10px] px-1.5 py-0 bg-muted/50 text-muted-foreground border-0">{s.groupe}</Badge>}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* Relevé panel */}
      <AnimatePresence>
        {selected && (
          <ReleveModal student={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
