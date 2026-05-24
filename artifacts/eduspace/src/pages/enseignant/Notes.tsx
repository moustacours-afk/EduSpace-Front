import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ClipboardList, CheckCircle, Send, Download, Upload,
  FileText, UserX, ChevronRight, BookOpen, ShieldCheck, Lock,
} from "lucide-react";
import {
  niveauxFiliere, semestresParNiveau, teacherAssignments, studentsDB,
  type TeacherRole,
} from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

type Student = { id: string; matricule: string; nom: string; prenom: string; groupe: string };
type NoteEntry = { cc: string; tp: string; absent: boolean; observation: string };
type TabType = "cc" | "examen";

type Assignment = typeof teacherAssignments[number];

function roleLabel(role: TeacherRole) {
  if (role === "cc") return { text: "Contrôle seulement", color: "bg-blue-100 text-blue-800 border-blue-200" };
  if (role === "tp") return { text: "TP seulement", color: "bg-teal-100 text-teal-800 border-teal-200" };
  return { text: "CC & TP", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
}

function buildHeaders(role: TeacherRole, tab: TabType) {
  const base = ["Matricule", "Nom", "Prénom"];
  if (tab === "examen") return [...base, "Note Examen (/20)", "Absent", "Observation"];
  if (role === "cc")    return [...base, "Note Contrôle (/20)", "Absent", "Observation"];
  if (role === "tp")    return [...base, "Note TP (/20)", "Absent", "Observation"];
  return [...base, "Note Contrôle (/20)", "Note TP (/20)", "Absent", "Observation"];
}

function exportCSV(
  students: Student[],
  grades: Record<string, NoteEntry>,
  role: TeacherRole,
  tab: TabType,
  label: string,
) {
  const headers = buildHeaders(role, tab);
  const rows = students.map((s) => {
    const g = grades[s.id] ?? { cc: "", tp: "", absent: false, observation: "" };
    const abs = g.absent ? "ABS" : "";
    if (tab === "examen") return [s.matricule, s.nom, s.prenom, g.absent ? "ABS" : g.cc, abs, g.observation];
    if (role === "cc")    return [s.matricule, s.nom, s.prenom, g.absent ? "ABS" : g.cc, abs, g.observation];
    if (role === "tp")    return [s.matricule, s.nom, s.prenom, g.absent ? "ABS" : g.tp, abs, g.observation];
    return [s.matricule, s.nom, s.prenom, g.absent ? "ABS" : g.cc, g.absent ? "ABS" : g.tp, abs, g.observation];
  });
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `notes_${label.replace(/[^a-z0-9]/gi, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string, students: Student[], role: TeacherRole, tab: TabType): Record<string, NoteEntry> {
  const lines = text.trim().split("\n").slice(1);
  const result: Record<string, NoteEntry> = {};
  for (const line of lines) {
    const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
    const student = students.find((s) => s.matricule === cols[0]);
    if (!student) continue;
    const absent = cols.includes("ABS");
    if (tab === "examen" || role === "cc") {
      result[student.id] = { cc: absent ? "" : cols[3], tp: "", absent, observation: cols[cols.length - 1] };
    } else if (role === "tp") {
      result[student.id] = { cc: "", tp: absent ? "" : cols[3], absent, observation: cols[cols.length - 1] };
    } else {
      result[student.id] = { cc: absent ? "" : cols[3], tp: absent ? "" : cols[4], absent, observation: cols[cols.length - 1] };
    }
  }
  return result;
}

export default function EnseignantNotes() {
  const [tab, setTab] = useState<TabType>("cc");
  const [niveau, setNiveau] = useState("");
  const [semestre, setSemestre] = useState("");
  const [session, setSession] = useState("Session normale");
  const [selectedModule, setSelectedModule] = useState<Assignment | null>(null);
  const [selectedGroupe, setSelectedGroupe] = useState("");
  const [grades, setGrades] = useState<Record<string, NoteEntry>>({});
  const [submitted, setSubmitted] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const semestres = niveau ? semestresParNiveau[niveau] ?? [] : [];

  const filteredAssignments = teacherAssignments.filter((a) => {
    if (a.niveau !== niveau || a.semestre !== semestre) return false;
    if (tab === "examen" && !a.responsable) return false;
    return true;
  });

  const students: Student[] = selectedModule && selectedGroupe
    ? (studentsDB[`${niveau}-${selectedGroupe}`] ?? [])
    : [];

  const role: TeacherRole = selectedModule?.role ?? "cc+tp";

  function setGradeField(id: string, field: keyof NoteEntry, val: string | boolean) {
    const defaults: NoteEntry = { cc: "", tp: "", absent: false, observation: "" };
    setGrades((prev) => ({
      ...prev,
      [id]: { ...defaults, ...prev[id], [field]: val },
    }));
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedModule) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target?.result as string, students, role, tab);
      setGrades((prev) => ({ ...prev, ...parsed }));
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  function resetSelection() {
    setSelectedModule(null);
    setSelectedGroupe("");
    setGrades({});
    setSubmitted(false);
  }

  function resetAll() {
    setNiveau("");
    setSemestre("");
    setSession("Session normale");
    resetSelection();
  }

  const csvLabel = selectedModule && selectedGroupe
    ? `${selectedModule.intitule}_${niveau}_${semestre}_${selectedGroupe}_${tab === "examen" ? session : tab}`
    : "";

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Saisie des notes</h1>
            <p className="text-muted-foreground mt-1">Remplissez les notes par module et groupe, puis soumettez pour validation.</p>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={item} className="flex border-b border-border">
            {(["cc", "examen"] as TabType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); resetAll(); }}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                  tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "cc" ? "Contrôle Continu & TP" : "Examen"}
              </button>
            ))}
          </motion.div>

          {/* Examen notice */}
          {tab === "examen" && (
            <motion.div variants={item}>
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                <span>Seuls les modules dont vous êtes <strong>responsable</strong> apparaissent ici. La saisie des notes d'examen est réservée au responsable du module.</span>
              </div>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div variants={item}>
            <Card className="p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Filtres</p>
              <div className="flex flex-wrap gap-3 items-end">

                {/* Niveau */}
                <div className="flex-1 min-w-[160px]">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Niveau</label>
                  <Select value={niveau} onValueChange={(v) => { setNiveau(v); setSemestre(""); resetSelection(); }}>
                    <SelectTrigger><SelectValue placeholder="Choisir un niveau…" /></SelectTrigger>
                    <SelectContent>
                      {niveauxFiliere.map((n) => <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Semestre */}
                <div className="flex-1 min-w-[130px]">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Semestre</label>
                  <Select value={semestre} onValueChange={(v) => { setSemestre(v); resetSelection(); }} disabled={!niveau}>
                    <SelectTrigger><SelectValue placeholder="Semestre…" /></SelectTrigger>
                    <SelectContent>
                      {semestres.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Session (Examen only) */}
                {tab === "examen" && (
                  <div className="flex-1 min-w-[170px]">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Session</label>
                    <Select value={session} onValueChange={(v) => { setSession(v); setGrades({}); setSubmitted(false); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Session normale">Session normale</SelectItem>
                        <SelectItem value="Session rattrapage">Session rattrapage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Modules list */}
          <AnimatePresence>
            {niveau && semestre && (
              <motion.div key="modules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="p-5">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    {tab === "examen" ? "Modules dont vous êtes responsable" : "Vos modules"} — {niveau} {semestre}
                  </p>

                  {filteredAssignments.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                      <Lock className="w-4 h-4" />
                      {tab === "examen"
                        ? "Vous n'êtes responsable d'aucun module pour ce niveau/semestre."
                        : "Aucun module assigné pour ce niveau/semestre."}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAssignments.map((a) => {
                        const rl = roleLabel(a.role);
                        const isSelected = selectedModule?.key === a.key;
                        return (
                          <button
                            key={a.key}
                            onClick={() => { setSelectedModule(a); setSelectedGroupe(""); setGrades({}); setSubmitted(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/40 hover:bg-muted/30"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <ClipboardList className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{a.intitule}</p>
                              <p className="text-xs text-muted-foreground">{a.groupes.length} groupe{a.groupes.length > 1 ? "s" : ""} · {a.groupes.join(", ")}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {tab !== "examen" && (
                                <Badge className={`text-xs border ${rl.color}`}>{rl.text}</Badge>
                              )}
                              {a.responsable && (
                                <Badge className="text-xs border bg-green-100 text-green-800 border-green-200 gap-1">
                                  <ShieldCheck className="w-3 h-3" />Responsable
                                </Badge>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Groups */}
          <AnimatePresence>
            {selectedModule && (
              <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="p-5">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-primary" />
                    Choisir un groupe — <span className="text-primary">{selectedModule.intitule}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule.groupes.map((g) => {
                      const count = studentsDB[`${niveau}-${g}`]?.length ?? 0;
                      return (
                        <button
                          key={g}
                          onClick={() => { setSelectedGroupe(g); setGrades({}); setSubmitted(false); }}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                            selectedGroupe === g
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-card border-border hover:border-primary/50 hover:bg-muted/30"
                          }`}
                        >
                          {g}
                          <span className="ml-1.5 text-xs opacity-70">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Student table */}
          <AnimatePresence>
            {selectedModule && selectedGroupe && students.length > 0 && !submitted && (
              <motion.div key="table" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card>
                  {/* Table header */}
                  <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">
                        {selectedModule.intitule} — {selectedGroupe}
                        {tab === "examen" && <span className="ml-1 text-muted-foreground font-normal">({session})</span>}
                        <span className="ml-2 text-muted-foreground font-normal text-xs">({students.length} étudiants)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {tab === "cc" && (
                        <Badge className={`text-xs border ${roleLabel(role).color}`}>{roleLabel(role).text}</Badge>
                      )}
                      <input ref={importRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => importRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5" />Importer CSV
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => exportCSV(students, grades, role, tab, csvLabel)}>
                        <Download className="w-3.5 h-3.5" />Exporter CSV
                      </Button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30 border-b border-border">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-8">#</th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Matricule</th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nom</th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Prénom</th>
                          {tab === "examen" ? (
                            <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Note Examen /20</th>
                          ) : role === "cc+tp" ? (
                            <>
                              <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Note Contrôle /20</th>
                              <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Note TP /20</th>
                            </>
                          ) : role === "cc" ? (
                            <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Note Contrôle /20</th>
                          ) : (
                            <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Note TP /20</th>
                          )}
                          <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Absent</th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Observation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((s, idx) => {
                          const g = grades[s.id] ?? { cc: "", tp: "", absent: false, observation: "" };
                          return (
                            <tr
                              key={s.id}
                              className={`border-b border-border/50 hover:bg-muted/10 transition-colors ${g.absent ? "bg-red-50/40" : ""}`}
                            >
                              <td className="px-4 py-2.5 text-muted-foreground text-xs">{idx + 1}</td>
                              <td className="px-4 py-2.5 font-mono text-xs">{s.matricule}</td>
                              <td className="px-4 py-2.5 font-medium">{s.nom}</td>
                              <td className="px-4 py-2.5">{s.prenom}</td>

                              {tab === "examen" ? (
                                <td className="px-3 py-2.5 text-center">
                                  <Input type="number" min="0" max="20" step="0.25"
                                    value={g.absent ? "" : g.cc}
                                    onChange={(e) => setGradeField(s.id, "cc", e.target.value)}
                                    disabled={g.absent}
                                    className="w-20 mx-auto text-center h-8 text-xs" placeholder="—" />
                                </td>
                              ) : role === "cc+tp" ? (
                                <>
                                  <td className="px-3 py-2.5 text-center">
                                    <Input type="number" min="0" max="20" step="0.25"
                                      value={g.absent ? "" : g.cc}
                                      onChange={(e) => setGradeField(s.id, "cc", e.target.value)}
                                      disabled={g.absent}
                                      className="w-20 mx-auto text-center h-8 text-xs" placeholder="—" />
                                  </td>
                                  <td className="px-3 py-2.5 text-center">
                                    <Input type="number" min="0" max="20" step="0.25"
                                      value={g.absent ? "" : g.tp}
                                      onChange={(e) => setGradeField(s.id, "tp", e.target.value)}
                                      disabled={g.absent}
                                      className="w-20 mx-auto text-center h-8 text-xs" placeholder="—" />
                                  </td>
                                </>
                              ) : role === "cc" ? (
                                <td className="px-3 py-2.5 text-center">
                                  <Input type="number" min="0" max="20" step="0.25"
                                    value={g.absent ? "" : g.cc}
                                    onChange={(e) => setGradeField(s.id, "cc", e.target.value)}
                                    disabled={g.absent}
                                    className="w-20 mx-auto text-center h-8 text-xs" placeholder="—" />
                                </td>
                              ) : (
                                <td className="px-3 py-2.5 text-center">
                                  <Input type="number" min="0" max="20" step="0.25"
                                    value={g.absent ? "" : g.tp}
                                    onChange={(e) => setGradeField(s.id, "tp", e.target.value)}
                                    disabled={g.absent}
                                    className="w-20 mx-auto text-center h-8 text-xs" placeholder="—" />
                                </td>
                              )}

                              <td className="px-3 py-2.5 text-center">
                                <button
                                  onClick={() => setGradeField(s.id, "absent", !g.absent)}
                                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto transition-all ${
                                    g.absent ? "bg-red-500 border-red-500 text-white" : "border-border hover:border-red-300 text-muted-foreground hover:text-red-400"
                                  }`}
                                  title="Marquer absent"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              </td>
                              <td className="px-4 py-2.5">
                                <Input value={g.observation}
                                  onChange={(e) => setGradeField(s.id, "observation", e.target.value)}
                                  className="h-8 text-xs" placeholder="Remarque…" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer actions */}
                  <div className="p-4 flex justify-between items-center gap-3 border-t border-border flex-wrap">
                    <Button variant="outline" className="gap-2 text-sm" onClick={() => exportCSV(students, grades, role, tab, csvLabel)}>
                      <FileText className="w-4 h-4" />Télécharger la liste remplie
                    </Button>
                    <div className="flex gap-3">
                      <Button variant="outline">Enregistrer (brouillon)</Button>
                      <Button onClick={() => setSubmitted(true)} className="gap-2">
                        <Send className="w-4 h-4" />Soumettre pour validation
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submitted */}
          <AnimatePresence>
            {submitted && (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Card className="p-8 text-center border-green-200 bg-green-50">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="font-semibold text-green-800 text-lg">Notes soumises pour validation</p>
                  <p className="text-green-600 text-sm mt-2">
                    {selectedModule?.intitule} — {selectedGroupe} — {niveau} {semestre}
                    {tab === "examen" && ` (${session})`} ont été envoyées à l'agent pédagogique.
                  </p>
                  <Badge className="mt-4 bg-amber-100 text-amber-800 border-amber-200">En attente de validation</Badge>
                  <div className="mt-4 flex gap-3 justify-center">
                    <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setSelectedGroupe(""); setGrades({}); }}>
                      Autre groupe
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); resetSelection(); }}>
                      Autre module
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </main>
    </div>
  );
}
