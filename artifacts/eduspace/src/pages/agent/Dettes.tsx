import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ClipboardEdit, Filter, RefreshCw, Search, Save,
  AlertTriangle, CheckCircle, BookOpen, GraduationCap,
} from "lucide-react";
import { agent as api } from "@/lib/api";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item      = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

type DebtRow = {
  id: number; moduleId: number; module: string; code: string | null;
  semestre: string | null; credits: number | null; coefficient: number | null;
  academicYear: string; originalGrade: number | null; retakeGrade: number | null;
  status: boolean; cleared: boolean;
};

type DebtStudent = {
  student: {
    id: number; matricule: string; nom: string; prenom: string;
    niveau: string; section: string; groupe: string;
  };
  debts: DebtRow[];
  activeCount: number;
  clearedCount: number;
};

function uniq(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))].sort();
}

// ── A single debt row with its retake-grade input ───────────────────────────────
function DebtLine({ debt, studentId, onSaved }: {
  debt: DebtRow;
  studentId: number;
  onSaved: (studentId: number, updated: DebtRow) => void;
}) {
  const [value, setValue]   = useState(debt.retakeGrade != null ? String(debt.retakeGrade) : "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState<"ok" | "err" | null>(null);

  const parsed   = parseFloat(value);
  const valid    = !isNaN(parsed) && parsed >= 0 && parsed <= 20;
  const dirty    = value !== (debt.retakeGrade != null ? String(debt.retakeGrade) : "");
  const previewCleared = valid && parsed >= 10;

  async function save() {
    if (!valid) return;
    setSaving(true); setMsg(null);
    try {
      const res = await api.updateDebt(debt.id, { retake_grade: parsed });
      onSaved(studentId, { ...debt, retakeGrade: res.retakeGrade, status: res.status, cleared: res.cleared });
      setMsg("ok");
    } catch { setMsg("err"); }
    finally { setSaving(false); }
  }

  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
      <td className="px-4 py-3">
        <p className="font-medium text-sm">{debt.module}</p>
        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{debt.code ?? "—"}</p>
      </td>
      <td className="px-3 py-3 text-center text-xs text-muted-foreground whitespace-nowrap">
        {debt.semestre ?? "—"}
        <span className="block text-[10px]">{debt.academicYear}</span>
      </td>
      <td className="px-3 py-3 text-center text-xs text-muted-foreground">{debt.credits ?? "—"}</td>
      <td className="px-3 py-3 text-center">
        <span className="font-semibold text-red-600 text-sm">
          {debt.originalGrade != null ? debt.originalGrade.toFixed(2) : "—"}
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2 justify-center">
          <Input
            type="number" min={0} max={20} step={0.25}
            value={value}
            onChange={e => { setValue(e.target.value); setMsg(null); }}
            placeholder="—"
            className={`h-8 w-20 text-sm text-center ${value && !valid ? "border-red-400" : ""}`}
          />
          <Button size="sm" className="h-8 gap-1.5 text-xs" disabled={!valid || !dirty || saving} onClick={save}>
            <Save className="w-3 h-3" />{saving ? "…" : "Enr."}
          </Button>
        </div>
        {value && !valid && (
          <p className="text-[10px] text-red-500 text-center mt-1">Note entre 0 et 20.</p>
        )}
        {msg === "ok" && (
          <p className="text-[10px] text-green-600 text-center mt-1 flex items-center gap-1 justify-center">
            <CheckCircle className="w-3 h-3" />Enregistré.
          </p>
        )}
        {msg === "err" && (
          <p className="text-[10px] text-red-500 text-center mt-1 flex items-center gap-1 justify-center">
            <AlertTriangle className="w-3 h-3" />Erreur.
          </p>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {debt.cleared ? (
          <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] whitespace-nowrap">Soldée</Badge>
        ) : previewCleared && dirty ? (
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] whitespace-nowrap">→ Soldée</Badge>
        ) : (
          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] whitespace-nowrap">Active</Badge>
        )}
      </td>
    </tr>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────────
export default function AgentDettes() {
  const [groups, setGroups]   = useState<DebtStudent[]>([]);
  const [loading, setLoading] = useState(false);

  const [filterNiveau,  setFilterNiveau]  = useState("Tous");
  const [filterSection, setFilterSection] = useState("Tous");
  const [filterGroupe,  setFilterGroupe]  = useState("Tous");
  const [search, setSearch]               = useState("");

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.debts() as DebtStudent[];
      setGroups(data);
    } catch { setGroups([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDebts(); }, [fetchDebts]);

  // Filter options derived from the actual debt-carrying students.
  const niveauOptions  = useMemo(() => ["Tous", ...uniq(groups.map(g => g.student.niveau))], [groups]);
  const sectionOptions = useMemo(() => ["Tous", ...uniq(
    groups.filter(g => filterNiveau === "Tous" || g.student.niveau === filterNiveau).map(g => g.student.section)
  )], [groups, filterNiveau]);
  const groupeOptions  = useMemo(() => ["Tous", ...uniq(
    groups.filter(g => filterNiveau === "Tous" || g.student.niveau === filterNiveau).map(g => g.student.groupe)
  )], [groups, filterNiveau]);

  const displayed = useMemo(() => groups.filter(g => {
    const s = g.student;
    if (filterNiveau  !== "Tous" && s.niveau  !== filterNiveau)  return false;
    if (filterSection !== "Tous" && s.section !== filterSection) return false;
    if (filterGroupe  !== "Tous" && s.groupe  !== filterGroupe)  return false;
    if (search && !`${s.nom} ${s.prenom} ${s.matricule}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [groups, filterNiveau, filterSection, filterGroupe, search]);

  const totalActive = displayed.reduce((sum, g) => sum + g.activeCount, 0);

  function handleSaved(studentId: number, updated: DebtRow) {
    setGroups(prev => prev.map(g => {
      if (g.student.id !== studentId) return g;
      const debts = g.debts.map(d => d.id === updated.id ? updated : d);
      return {
        ...g,
        debts,
        activeCount:  debts.filter(d => d.status).length,
        clearedCount: debts.filter(d => !d.status).length,
      };
    }));
  }

  function handleNiveauChange(v: string) {
    setFilterNiveau(v);
    setFilterSection("Tous");
    setFilterGroupe("Tous");
  }

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
                  Étudiants ayant des modules en dette (échec non compensé d'une année antérieure).
                  Saisissez la note de rattrapage&nbsp;: la dette se solde automatiquement à partir de 10/20.
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={fetchDebts} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div variants={item} className="grid grid-cols-2 gap-3 max-w-md">
            <Card className="p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xl font-bold">{displayed.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Étudiant(s) en dette</p>
            </Card>
            <Card className="p-4">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xl font-bold">{totalActive}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Dette(s) active(s)</p>
            </Card>
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
                    <SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{niveauOptions.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
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
            </Card>
          </motion.div>

          {/* Student debt list */}
          <motion.div variants={item} className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-16 text-muted-foreground text-sm">Chargement des dettes…</div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <p className="text-sm">Aucun étudiant en dette avec ces filtres.</p>
              </div>
            ) : (
              displayed.map(g => (
                <Card key={g.student.id} className="overflow-hidden">
                  {/* Student header */}
                  <div className="px-5 py-3.5 border-b bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{g.student.prenom} {g.student.nom}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {g.student.matricule}
                        <span className="ml-2 font-sans">{g.student.niveau}{g.student.section ? ` · ${g.student.section}` : ""}{g.student.groupe ? ` · ${g.student.groupe}` : ""}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {g.activeCount > 0
                        ? <Badge className="bg-red-100 text-red-700 border-red-200 text-[11px]">{g.activeCount} dette(s) active(s)</Badge>
                        : <Badge className="bg-green-100 text-green-700 border-green-200 text-[11px]">Toutes soldées</Badge>}
                      {g.clearedCount > 0 && (
                        <Badge className="bg-muted text-muted-foreground border-border text-[11px]">{g.clearedCount} soldée(s)</Badge>
                      )}
                    </div>
                  </div>

                  {/* Debt table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30 border-b border-border">
                        <tr>
                          <th className="text-left  px-4 py-2.5 font-semibold text-muted-foreground text-xs">Module</th>
                          <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs">Semestre</th>
                          <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs">Crédits</th>
                          <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs">Note initiale</th>
                          <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground text-xs">Note rattrapage /20</th>
                          <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground text-xs">État</th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.debts.map(d => (
                          <DebtLine key={d.id} debt={d} studentId={g.student.id} onSaved={handleSaved} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ))
            )}
          </motion.div>

          <motion.div variants={item} className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5" />
            Les modules compensés au sein d'une unité d'enseignement (moy. UE ≥ 10) ne sont pas comptés comme dettes.
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
