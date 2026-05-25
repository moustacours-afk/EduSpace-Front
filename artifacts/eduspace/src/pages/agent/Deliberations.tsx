import { useState, useMemo, Fragment } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Printer, Filter, Users, Edit, Plus, Trash2, X, Save } from "lucide-react";
import { gradeSubmissions, agentStudents } from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const NIVEAUX   = ["L1", "L2", "L3", "M1", "M2"];
const GROUPES   = ["Groupe 1", "Groupe 2", "Groupe 3", "Groupe 4"];
const SEMESTRES = ["S1", "S2", "S3", "S4", "S5", "S6"];
const SESSIONS  = ["Normale", "Rattrapage"];

function calcMoy(cc: number | null, exam: number | null) {
  if (cc === null && exam === null) return null;
  if (cc === null) return exam;
  if (exam === null) return cc;
  return Math.round((cc * 0.4 + exam * 0.6) * 100) / 100;
}

const CREDIT_PER_MODULE = 3;

type DecisionType = "Admis (session normale)" | "Admis par compensation" | "Admis (session rattrapage)" | "Ajourné";

function getMention(moy: number | null): string {
  if (moy === null || moy < 10) return "";
  if (moy >= 16) return "Très bien";
  if (moy >= 14) return "Bien";
  if (moy >= 12) return "Assez bien";
  return "Passable";
}

function decisionStyle(d: DecisionType) {
  if (d === "Admis (session normale)") return "bg-green-100 text-green-800 border-green-200";
  if (d === "Admis par compensation") return "bg-teal-100 text-teal-800 border-teal-200";
  if (d === "Admis (session rattrapage)") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export default function AgentDeliberations() {
  const [niveau,   setNiveau]   = useState("L3");
  const [groupe,   setGroupe]   = useState("Groupe 2");
  const [semestre, setSemestre] = useState("S5");
  const [session,  setSession]  = useState("Normale");
  const [showPV,   setShowPV]   = useState(false);

  const [juryPresident, setJuryPresident] = useState("Pr. Mohamed Hadj");
  const [juryMembers,   setJuryMembers]   = useState(["Dr. Amira Ziani", "Dr. Yacine Bouzid"]);
  const [showEditJury,  setShowEditJury]  = useState(false);
  const [draftPresident, setDraftPresident] = useState("");
  const [draftMembers,   setDraftMembers]   = useState<string[]>([]);

  const semestreNum = parseInt(semestre.slice(1));

  // Fetch submissions for this groupe + semestre label
  const submissions = useMemo(() => {
    const semLabel = `Semestre ${semestreNum}`;
    return gradeSubmissions.filter(gs =>
      gs.groupe === groupe &&
      gs.niveau === niveau &&
      (gs.semestre?.includes(String(semestreNum)) ?? true)
    );
  }, [groupe, niveau, semestreNum]);

  // Build student list: take from agentStudents for this groupe, or from submissions students
  const studentsInGroupe = useMemo(() => {
    // Prefer agentStudents filtered by groupe + niveau
    const fromList = agentStudents.filter(s => s.groupe === groupe && s.niveau === niveau);
    if (fromList.length > 0) return fromList.map(s => ({ matricule: s.matricule, nom: s.nom, prenom: s.prenom }));
    // Fallback: union from submissions
    const byMatricule: Record<string, { matricule: string; nom: string; prenom: string }> = {};
    submissions.forEach(sub => sub.students.forEach(st => {
      byMatricule[st.matricule] = { matricule: st.matricule, nom: st.nom, prenom: st.prenom };
    }));
    return Object.values(byMatricule);
  }, [groupe, niveau, submissions]);

  // Build module list from submissions
  const moduleList = submissions.map(sub => sub.module);

  // Build grade map: matricule -> moduleId -> { moy }
  const gradeMap = useMemo(() => {
    const m: Record<string, Record<string, { moy: number | null; absent: boolean }>> = {};
    submissions.forEach(sub => {
      sub.students.forEach(st => {
        if (!m[st.matricule]) m[st.matricule] = {};
        m[st.matricule][sub.module] = { moy: st.absent ? null : calcMoy(st.noteCC, st.noteExam), absent: st.absent ?? false };
      });
    });
    return m;
  }, [submissions]);

  // Aggregate per student with compensation + mention logic
  const rows = useMemo(() => studentsInGroupe.map((s, idx) => {
    const grades = gradeMap[s.matricule] ?? {};
    const moyennes = moduleList.map(mod => grades[mod]?.moy ?? null);
    const validMoyennes = moyennes.filter(m => m !== null) as number[];
    const semMoy = validMoyennes.length > 0 ? Math.round(validMoyennes.reduce((a, b) => a + b, 0) / validMoyennes.length * 100) / 100 : null;

    const allPassed = moyennes.every(m => m === null || m >= 10);
    let decision: DecisionType;
    if (semMoy === null) {
      decision = "Ajourné";
    } else if (semMoy >= 10) {
      decision = allPassed ? "Admis (session normale)" : "Admis par compensation";
    } else if (session === "Rattrapage" && semMoy >= 5) {
      decision = "Admis (session rattrapage)";
    } else {
      decision = "Ajourné";
    }

    const isCompensated = semMoy !== null && semMoy >= 10;
    const creditsAcquis = moduleList.filter((_, i) => {
      const moy = moyennes[i];
      if (moy === null) return false;
      if (moy >= 10) return true;
      if (isCompensated && moy >= 5) return true;
      return false;
    }).length * CREDIT_PER_MODULE;

    const mention = getMention(semMoy);
    return { idx: idx + 1, ...s, moyennes, semMoy, creditsAcquis, decision, mention };
  }), [studentsInGroupe, gradeMap, moduleList, session]);

  function printPV() {
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) return;

    const moduleHeaders = moduleList.map(m => `<th colspan="2" style="border:1px solid #bbb;background:#f0f0f0;padding:6px 4px;font-size:10px;text-align:center;min-width:60px">${m}</th>`).join("");
    const subHeaders = moduleList.map(() => `<th style="border:1px solid #bbb;background:#f5f5f5;padding:4px;font-size:9px;text-align:center">M</th><th style="border:1px solid #bbb;background:#f5f5f5;padding:4px;font-size:9px;text-align:center">C</th>`).join("");

    const tableRows = rows.map(r => {
      const isComp = r.decision === "Admis par compensation";
      const gradeCells = moduleList.map((_, i) => {
        const moy = r.moyennes[i];
        const comp = isComp && moy !== null && moy < 10 && moy >= 5;
        const credit = moy !== null && (moy >= 10 || comp) ? CREDIT_PER_MODULE : 0;
        const color = moy === null ? "#aaa" : moy >= 10 ? "#166534" : comp ? "#0d9488" : "#991b1b";
        return `<td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px;color:${color}">${moy !== null ? moy.toFixed(2) : "ABS"}${comp ? "<sup>C</sup>" : ""}</td><td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px">${credit}</td>`;
      }).join("");
      const decColor = r.decision === "Admis (session normale)" ? "#166534" : r.decision === "Admis par compensation" ? "#0d9488" : r.decision === "Admis (session rattrapage)" ? "#854d0e" : "#991b1b";
      return `<tr>
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px">${r.idx}</td>
        <td style="border:1px solid #bbb;padding:4px;font-size:10px;font-family:monospace">${r.matricule}</td>
        <td style="border:1px solid #bbb;padding:4px;font-size:10px;font-weight:bold">${r.prenom} ${r.nom}</td>
        ${gradeCells}
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px;font-weight:bold">${r.creditsAcquis}</td>
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px;font-weight:bold">${r.semMoy !== null ? r.semMoy.toFixed(2) : "—"}</td>
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px">${r.mention}</td>
        <td style="border:1px solid #bbb;padding:4px;font-size:10px;color:${decColor};font-weight:bold">${r.decision}</td>
      </tr>`;
    }).join("");
    const memberSigsBlock = juryMembers.map(m => `<p style="font-size:11px">${m}</p>`).join("");

    win.document.write(`<html><head><title>PV Délibération</title>
    <style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head>
    <body>
      <div style="text-align:center;margin-bottom:12px">
        <p style="font-size:11px;color:#444">République Algérienne Démocratique et Populaire</p>
        <p style="font-size:11px;color:#444">Ministère de l'Enseignement Supérieur et de la Recherche Scientifique</p>
        <p style="font-size:13px;font-weight:bold;margin:4px 0">Université des Sciences et de la Technologie Houari Boumediene</p>
        <p style="font-size:11px">Faculté d'Informatique — Département Informatique</p>
        <p style="margin:8px 0;font-size:12px">Année Académique 2025-2026 &nbsp;|&nbsp; Filière : Informatique &nbsp;|&nbsp; Niveau : ${niveau} &nbsp;|&nbsp; Groupe : ${groupe}</p>
        <p style="font-size:14px;font-weight:bold;margin:10px 0;text-decoration:underline">PV de délibération — ${semestre} — Session ${session}</p>
      </div>
      <button onclick="window.print()" style="margin-bottom:12px;padding:8px 16px;background:#4f46e5;color:white;border:none;border-radius:6px;cursor:pointer">Imprimer</button>
      <p style="font-size:9px;color:#666;margin-bottom:4px">C = module compensé (moy. semestre ≥ 10)</p>
      <table>
        <thead>
          <tr>
            <th rowspan="2" style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px">N°</th>
            <th rowspan="2" style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px">Matricule</th>
            <th rowspan="2" style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px">Nom et Prénom</th>
            ${moduleHeaders}
            <th rowspan="2" style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px">Crédits</th>
            <th rowspan="2" style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px">Moy. Sem.</th>
            <th rowspan="2" style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px">Mention</th>
            <th rowspan="2" style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px">Décision du jury</th>
          </tr>
          <tr>${subHeaders}</tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div style="margin-top:40px;display:flex;justify-content:space-between">
        <div><p style="font-size:11px;font-weight:bold">Le Président du Jury</p><p style="font-size:11px">${juryPresident}</p><br/><br/><p style="font-size:11px">Signature et cachet</p></div>
        <div><p style="font-size:11px;font-weight:bold">Membres du Jury</p>${memberSigsBlock}<br/><p style="font-size:11px">Signatures</p></div>
        <div><p style="font-size:11px;font-weight:bold">L'Agent Pédagogique</p><p style="font-size:11px">Ferhat Nadia</p><br/><br/><p style="font-size:11px">Signature</p></div>
      </div>
    </body></html>`);
    win.document.close();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">

          <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Délibérations</h1>
              <p className="text-muted-foreground mt-1">PV de délibération — Filière Informatique — USTHB</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={printPV}>
                <Printer className="w-4 h-4" />Imprimer PV
              </Button>
              <Button variant="outline" className="gap-2" onClick={printPV}>
                <FileText className="w-4 h-4" />Exporter PDF
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={item}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Paramètres du PV</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Niveau</label>
                  <Select value={niveau} onValueChange={setNiveau}>
                    <SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{NIVEAUX.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Groupe</label>
                  <Select value={groupe} onValueChange={setGroupe}>
                    <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{GROUPES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Semestre</label>
                  <Select value={semestre} onValueChange={setSemestre}>
                    <SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{SEMESTRES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Session</label>
                  <Select value={session} onValueChange={setSession}>
                    <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{SESSIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* PV Header */}
          <motion.div variants={item}>
            <Card className="p-5">
              <div className="text-center border-b border-border pb-4 mb-4">
                <p className="text-xs text-muted-foreground">République Algérienne Démocratique et Populaire</p>
                <p className="text-xs text-muted-foreground">Ministère de l'Enseignement Supérieur et de la Recherche Scientifique</p>
                <p className="font-bold text-base mt-1">Université des Sciences et de la Technologie Houari Boumediene</p>
                <p className="text-sm text-muted-foreground">Faculté d'Informatique — Département Informatique</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm mb-4">
                {[
                  { label: "Année académique", value: "2025-2026" },
                  { label: "Domaine", value: "Mathématiques et Informatique" },
                  { label: "Filière", value: "Informatique" },
                  { label: "Niveau", value: niveau },
                  { label: "Groupe", value: groupe },
                ].map(f => (
                  <div key={f.label} className="text-center">
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="font-semibold">{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold underline">
                  PV de délibération — {semestre} — 2025/2026 (Session : {session})
                </h2>
              </div>
            </Card>
          </motion.div>

          {/* Results summary */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total étudiants", value: rows.length, color: "text-foreground", sub: "" },
              { label: "Admis (normale)", value: rows.filter(r => r.decision === "Admis (session normale)").length, color: "text-green-700", sub: "" },
              { label: "Admis (compensation)", value: rows.filter(r => r.decision === "Admis par compensation").length, color: "text-teal-700", sub: "Moy. sem. ≥ 10" },
              { label: "Ajournés", value: rows.filter(r => r.decision === "Ajourné").length, color: "text-red-700", sub: "" },
            ].map(c => (
              <Card key={c.label} className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                {c.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>}
              </Card>
            ))}
          </motion.div>

          {/* PV Table */}
          <motion.div variants={item}>
            <Card className="overflow-hidden">
              {moduleList.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground text-sm">Aucune note soumise pour ce groupe / semestre.</p>
                  <p className="text-xs text-muted-foreground mt-1">Sélectionnez un groupe et un semestre pour lesquels des notes existent.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th rowSpan={2} className="border border-border/60 px-2 py-2 font-semibold text-left w-8">N°</th>
                        <th rowSpan={2} className="border border-border/60 px-3 py-2 font-semibold text-left">Matricule</th>
                        <th rowSpan={2} className="border border-border/60 px-3 py-2 font-semibold text-left min-w-32">Nom et Prénom</th>
                        {moduleList.map(mod => (
                          <th key={mod} colSpan={2} className="border border-border/60 px-1 py-2 font-semibold text-center bg-blue-50/60 text-blue-800 text-[10px]">
                            {mod.length > 16 ? mod.slice(0, 16) + "…" : mod}
                          </th>
                        ))}
                        <th rowSpan={2} className="border border-border/60 px-2 py-2 font-semibold text-center bg-muted/30">Crédits</th>
                        <th rowSpan={2} className="border border-border/60 px-2 py-2 font-semibold text-center bg-muted/30">Moy. Sem.</th>
                        <th rowSpan={2} className="border border-border/60 px-2 py-2 font-semibold text-center bg-muted/30">Mention</th>
                        <th rowSpan={2} className="border border-border/60 px-3 py-2 font-semibold text-center bg-muted/30 min-w-28">Décision du jury</th>
                      </tr>
                      <tr className="bg-muted/30">
                        {moduleList.map(mod => (
                          <Fragment key={mod}>
                            <th className="border border-border/60 px-1 py-1 font-medium text-center text-muted-foreground">M</th>
                            <th className="border border-border/60 px-1 py-1 font-medium text-center text-muted-foreground">C</th>
                          </Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr><td colSpan={3 + moduleList.length * 2 + 4} className="text-center py-8 text-muted-foreground">Aucun étudiant dans ce groupe</td></tr>
                      ) : rows.map((r, ri) => (
                        <tr key={r.matricule} className={`${ri % 2 === 0 ? "bg-background" : "bg-muted/10"} hover:bg-primary/5 transition-colors`}>
                          <td className="border border-border/40 px-2 py-2 text-center text-muted-foreground">{r.idx}</td>
                          <td className="border border-border/40 px-3 py-2 font-mono">{r.matricule}</td>
                          <td className="border border-border/40 px-3 py-2 font-medium">{r.prenom} {r.nom}</td>
                          {r.moyennes.map((moy, i) => {
                            const isComp = r.decision === "Admis par compensation" && moy !== null && moy < 10 && moy >= 5;
                            const credit = moy !== null && (moy >= 10 || isComp) ? CREDIT_PER_MODULE : 0;
                            return (
                              <Fragment key={i}>
                                <td className={`border border-border/40 px-2 py-2 text-center font-semibold ${moy === null ? "text-muted-foreground" : moy >= 10 ? "text-green-700" : isComp ? "text-teal-600" : "text-red-600"}`}>
                                  {moy !== null ? moy.toFixed(2) : "ABS"}
                                  {isComp && <span className="text-[8px] ml-0.5 text-teal-500">C</span>}
                                </td>
                                <td className="border border-border/40 px-2 py-2 text-center text-muted-foreground">{credit}</td>
                              </Fragment>
                            );
                          })}
                          <td className="border border-border/40 px-2 py-2 text-center font-bold">{r.creditsAcquis}</td>
                          <td className={`border border-border/40 px-2 py-2 text-center font-bold ${r.semMoy !== null && r.semMoy >= 10 ? "text-green-700" : "text-red-600"}`}>
                            {r.semMoy !== null ? r.semMoy.toFixed(2) : "—"}
                          </td>
                          <td className="border border-border/40 px-2 py-2 text-center text-xs font-medium text-muted-foreground">
                            {r.mention}
                          </td>
                          <td className="border border-border/40 px-2 py-2 text-center">
                            <Badge className={`text-[10px] border ${decisionStyle(r.decision)}`}>{r.decision}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Jury composition + Signature area */}
          {moduleList.length > 0 && (
            <motion.div variants={item}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Composition du Jury</span>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs"
                    onClick={() => { setDraftPresident(juryPresident); setDraftMembers([...juryMembers]); setShowEditJury(true); }}>
                    <Edit className="w-3 h-3" />Modifier
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Président du Jury</p>
                    <p className="font-semibold">{juryPresident}</p>
                    <div className="mt-8 border-t border-border/50 pt-2">
                      <p className="text-xs text-muted-foreground">Signature et cachet</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Membres du Jury</p>
                    {juryMembers.map((m, i) => <p key={i} className="font-medium">{m}</p>)}
                    <div className="mt-8 border-t border-border/50 pt-2">
                      <p className="text-xs text-muted-foreground">Signatures</p>
                    </div>
                  </div>
                  <div className="text-sm text-right">
                    <p className="text-xs text-muted-foreground mb-1">L'Agent Pédagogique</p>
                    <p className="font-semibold">Ferhat Nadia</p>
                    <div className="mt-8 border-t border-border/50 pt-2">
                      <p className="text-xs text-muted-foreground">Signature</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Edit Jury Modal */}
          {showEditJury && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Card className="p-6 w-full max-w-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base">Composition du jury</h3>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowEditJury(false)}><X className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Président du jury</label>
                      <Input value={draftPresident} onChange={e => setDraftPresident(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-muted-foreground">Membres du jury</label>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => setDraftMembers(prev => [...prev, ""])}>
                          <Plus className="w-3 h-3" />Ajouter
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {draftMembers.map((m, i) => (
                          <div key={i} className="flex gap-2">
                            <Input value={m} onChange={e => setDraftMembers(prev => prev.map((x, xi) => xi === i ? e.target.value : x))} className="h-9 text-sm flex-1" />
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-400 hover:text-red-600" onClick={() => setDraftMembers(prev => prev.filter((_, xi) => xi !== i))}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditJury(false)}>Annuler</Button>
                    <Button className="flex-1 gap-2" onClick={() => { setJuryPresident(draftPresident); setJuryMembers(draftMembers.filter(m => m.trim())); setShowEditJury(false); }}>
                      <Save className="w-4 h-4" />Enregistrer
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
