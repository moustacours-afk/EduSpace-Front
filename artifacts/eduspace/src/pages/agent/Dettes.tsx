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
  ChevronRight, AlertTriangle, CheckCircle, Save, BookOpen, Lock,
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

function situationBadge(situation: string) {
  if (situation === "admis")      return <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">Admis</Badge>;
  if (situation === "rattrapage") return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Rattrapage</Badge>;
  return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px]">Ajourné</Badge>;
}

// ── Relevé modal — full relevé, admis locked, dettes editable (exam only) ──
function ReleveModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const [notes, setNotes]     = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId]   = useState<number | null>(null);
  const [editExam, setEditExam] = useState("");
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ id: number; ok: boolean } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.studentNotes(student.id) as NoteRow[];
      setNotes(data);
    } catch { /* keep empty */ }
    finally { setLoading(false); }
  }, [student.id]);

  useEffect(() => { load(); }, [load]);

  const dettes   = notes.filter(n => n.situation !== "admis");
  const semestres = [...new Set(notes.map(n => n.semestre))].sort();

  // Weighted UE moyenne for a given (semestre, ue) pair — uses ALL modules (not just dettes)
  function ueWeightedMoy(sem: string, ue: string): number | null {
    const pool = notes.filter(n => n.semestre === sem && (n.typeUe || "UE") === ue && n.moyenne !== null);
    const totalCr = pool.reduce((s, n) => s + (n.credits || 0), 0);
    if (totalCr === 0) return null;
    return Math.round(pool.reduce((s, n) => s + ((n.moyenne ?? 0) * (n.credits || 0)), 0) / totalCr * 100) / 100;
  }

  // Preview moyenne when only exam changes (CC & TP stay as-is)
  function liveCalcExam(n: NoteRow): number | null {
    const exam = parseFloat(editExam);
    if (isNaN(exam) || exam < 0 || exam > 20) return null;
    return n.hasTp
      ? Math.round((exam * 0.6 + (n.controle ?? 0) * 0.2 + (n.tp ?? 0) * 0.2) * 100) / 100
      : Math.round((exam * 0.6 + (n.controle ?? 0) * 0.4) * 100) / 100;
  }

  function startEdit(n: NoteRow) {
    setEditId(n.id);
    setEditExam(String(n.exam ?? ""));
    setSaveMsg(null);
  }

  async function saveNote(n: NoteRow) {
    const exam = parseFloat(editExam);
    if (isNaN(exam) || exam < 0 || exam > 20) return;
    setSaving(true);
    try {
      const res = await api.updateNote(n.id, { note_exam: exam }) as { moyenne: number; situation: string; creditAcquis: number };
      setNotes(prev => prev.map(r =>
        r.id === n.id ? { ...r, exam, moyenne: res.moyenne, situation: res.situation, creditAcquis: res.creditAcquis } : r
      ));
      setSaveMsg({ id: n.id, ok: true });
      setEditId(null);
    } catch { setSaveMsg({ id: n.id, ok: false }); }
    finally { setSaving(false); }
  }

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
            <p className="text-xs text-muted-foreground">{student.matricule} · {student.niveau} · {student.section}</p>
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
            Relevé complet — modules admis verrouillés (grisés), dettes modifiables (cliquez). UE compensées (moy. UE ≥ 10) verrouillées.
          </p>
        </div>

        {/* Notes list grouped by semestre → UE */}
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
                const ueKeys   = [...new Set(semNotes.map(n => n.typeUe || "UE"))];
                const semDettes = semNotes.filter(n => n.situation !== "admis").length;
                return (
                  <div key={sem}>
                    {/* Semestre header */}
                    <div className="flex items-center gap-2 mb-3 border-b pb-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{sem}</p>
                      {semDettes > 0
                        ? <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-600 border-red-200">{semDettes} dette(s)</Badge>
                        : <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200">Validé</Badge>
                      }
                    </div>

                    <div className="space-y-4">
                      {ueKeys.map(ue => {
                        const ueNotes  = semNotes.filter(n => (n.typeUe || "UE") === ue);
                        const ueDettes = ueNotes.filter(n => n.situation !== "admis");
                        const ueMoy    = ueWeightedMoy(sem, ue);
                        const isUeLocked = ueDettes.length > 0 && ueMoy !== null && ueMoy >= 10;

                        return (
                          <div key={ue}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">{ue}</span>
                              {isUeLocked && (
                                <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />Compensée — moy. {ueMoy}/20
                                </Badge>
                              )}
                              {!isUeLocked && ueDettes.length > 0 && (
                                <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-600 border-red-200">{ueDettes.length} dette(s)</Badge>
                              )}
                            </div>

                            <div className="space-y-2 ml-2">
                              {ueNotes.map(n => {
                                const isAdmis   = n.situation === "admis";
                                const isDette   = !isAdmis;
                                const locked    = isAdmis || isUeLocked;
                                const isEditing = editId === n.id;
                                const liveMoy   = isEditing ? liveCalcExam(n) : null;
                                const liveSit   = liveMoy !== null
                                  ? (liveMoy >= 10 ? "Admis" : liveMoy >= 8 ? "Rattrapage" : "Ajourné") : null;

                                return (
                                  <Card
                                    key={n.id}
                                    className={`p-3 border transition-colors ${
                                      locked && !isEditing
                                        ? "opacity-60 bg-muted/10"
                                        : isEditing
                                          ? "border-primary/40 bg-primary/5"
                                          : isDette
                                            ? "hover:border-red-300 cursor-pointer"
                                            : ""
                                    }`}
                                    onClick={() => { if (!isEditing && !locked) startEdit(n); }}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-semibold text-sm truncate">{n.module}</span>
                                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{n.code}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                                          <span>{n.credits} crédits</span>
                                          <span>Coeff. {n.coefficient}</span>
                                          <span className={`font-mono font-semibold ${isAdmis ? "text-green-700" : "text-red-600"}`}>
                                            Moy : {n.moyenne ?? "—"}/20
                                          </span>
                                          <span className="font-mono">Exam : {n.exam ?? "—"}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {situationBadge(n.situation)}
                                        {isUeLocked && isDette && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                                        {!locked && !isEditing && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                                      </div>
                                    </div>

                                    {/* Exam-only edit form */}
                                    <AnimatePresence>
                                      {isEditing && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto" }}
                                          exit={{ opacity: 0, height: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="mt-3 overflow-hidden"
                                          onClick={e => e.stopPropagation()}
                                        >
                                          <div className="max-w-[200px]">
                                            <label className="text-[10px] text-muted-foreground block mb-1">Note d'examen /20</label>
                                            <Input
                                              type="number" min={0} max={20} step={0.25}
                                              value={editExam}
                                              onChange={e => setEditExam(e.target.value)}
                                              className="h-8 text-sm"
                                              autoFocus
                                            />
                                          </div>

                                          {liveMoy !== null && (
                                            <div className="mt-2 rounded-lg px-3 py-2 text-xs flex items-center gap-2 bg-muted/40 border border-border">
                                              <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                                              Nouvelle moyenne : <strong>{liveMoy}/20</strong> → {liveSit}
                                            </div>
                                          )}

                                          {saveMsg?.id === n.id && (
                                            <div className={`mt-2 text-xs flex items-center gap-1 ${saveMsg.ok ? "text-green-600" : "text-red-600"}`}>
                                              {saveMsg.ok
                                                ? <><CheckCircle className="w-3.5 h-3.5" /> Note mise à jour.</>
                                                : <><AlertTriangle className="w-3.5 h-3.5" /> Erreur lors de la sauvegarde.</>
                                              }
                                            </div>
                                          )}

                                          <div className="flex gap-2 mt-3">
                                            <Button size="sm" className="h-7 text-xs gap-1.5 flex-1"
                                              disabled={saving || liveMoy === null}
                                              onClick={() => saveNote(n)}>
                                              <Save className="w-3 h-3" />{saving ? "Enregistrement…" : "Enregistrer"}
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditId(null)}>
                                              Annuler
                                            </Button>
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

  const orgSections    = getSectionsForNiveau(filterNiveau);
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
          id:        Number(s.id),
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
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
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
                {loading
                  ? "Chargement…"
                  : `${displayed.length} étudiant(s) — cliquez sur un étudiant pour voir et modifier ses dettes.`
                }
              </p>
            </Card>
          </motion.div>

          {/* Student list */}
          <motion.div variants={item}>
            {loading ? (
              <div className="flex justify-center py-16 text-muted-foreground text-sm">
                Chargement des étudiants…
              </div>
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
