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
const GROUPES   = ["Tous", "Groupe 1", "Groupe 2", "Groupe 3", "Groupe 4"];
const SEMESTRES = ["S1", "S2", "S3", "S4", "S5", "S6"];
const SESSIONS  = ["Normale", "Rattrapage"];

// UE groupings for par matière view
type UEInfo = { nom: string; modules: string[] };
const UE_PAR_NIVEAU_SEMESTRE: Record<string, UEInfo[]> = {
  "L3-S5": [
    { nom: "UEF 1.1", modules: ["Algorithmique", "Structures de Données"] },
    { nom: "UEF 1.2", modules: ["Base de Données", "Réseaux Informatiques"] },
    { nom: "UET 1.1", modules: ["Systèmes d'Exploitation"] },
    { nom: "UEM 1.1", modules: ["Analyse Mathématique"] },
  ],
  "L3-S6": [
    { nom: "UEF 2.1", modules: ["Compilation", "Intelligence Artificielle"] },
    { nom: "UEF 2.2", modules: ["Sécurité Informatique", "Génie Logiciel"] },
    { nom: "UEO 2.1", modules: ["Développement Web"] },
  ],
};

function getUEsForKey(key: string): UEInfo[] {
  return UE_PAR_NIVEAU_SEMESTRE[key] ?? [];
}

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

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

function computeCredits(moduleList: string[], moyennes: (number | null)[], isCompensated: boolean): number {
  return moduleList.filter((_, i) => {
    const moy = moyennes[i];
    if (moy === null) return false;
    if (moy >= 10) return true;
    if (isCompensated && moy >= 5) return true;
    return false;
  }).length * CREDIT_PER_MODULE;
}

export default function AgentDeliberations() {
  const [niveau,   setNiveau]   = useState("L3");
  const [groupe,   setGroupe]   = useState("Groupe 2");
  const [semestre, setSemestre] = useState("S5");
  const [session,  setSession]  = useState("Normale");
  const [typeDelib, setTypeDelib] = useState<"par_matiere" | "annuelle">("par_matiere");
  const [semestre2, setSemestre2] = useState("S6");

  const [juryPresident, setJuryPresident] = useState("Pr. Mohamed Hadj");
  const [juryMembers,   setJuryMembers]   = useState(["Dr. Amira Ziani", "Dr. Yacine Bouzid"]);
  const [showEditJury,  setShowEditJury]  = useState(false);
  const [draftPresident, setDraftPresident] = useState("");
  const [draftMembers,   setDraftMembers]   = useState<string[]>([]);

  const semestreNum  = parseInt(semestre.slice(1));
  const semestreNum2 = parseInt(semestre2.slice(1));

  // ── Students in groupe ──
  const studentsInGroupe = useMemo(() => {
    if (groupe === "Tous") {
      return agentStudents.filter(s => s.niveau === niveau).map(s => ({ matricule: s.matricule, nom: s.nom, prenom: s.prenom }));
    }
    const fromList = agentStudents.filter(s => s.groupe === groupe && s.niveau === niveau);
    if (fromList.length > 0) return fromList.map(s => ({ matricule: s.matricule, nom: s.nom, prenom: s.prenom }));
    const byMatricule: Record<string, { matricule: string; nom: string; prenom: string }> = {};
    gradeSubmissions
      .filter(gs => gs.groupe === groupe && gs.niveau === niveau)
      .forEach(sub => sub.students.forEach(st => {
        byMatricule[st.matricule] = { matricule: st.matricule, nom: st.nom, prenom: st.prenom };
      }));
    return Object.values(byMatricule);
  }, [groupe, niveau]);

  // ── Submissions & grade maps ──
  const submissions = useMemo(() => {
    const g = groupe === "Tous" ? undefined : groupe;
    return gradeSubmissions.filter(gs =>
      gs.niveau === niveau &&
      (g === undefined || gs.groupe === g) &&
      (gs.semestre?.includes(String(semestreNum)) ?? true)
    );
  }, [groupe, niveau, semestreNum]);

  const submissions2 = useMemo(() => {
    const g = groupe === "Tous" ? undefined : groupe;
    return gradeSubmissions.filter(gs =>
      gs.niveau === niveau &&
      (g === undefined || gs.groupe === g) &&
      (gs.semestre?.includes(String(semestreNum2)) ?? true)
    );
  }, [groupe, niveau, semestreNum2]);

  const moduleList  = [...new Set(submissions.map(sub => sub.module))];
  const moduleList2 = [...new Set(submissions2.map(sub => sub.module))];

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

  const gradeMap2 = useMemo(() => {
    const m: Record<string, Record<string, { moy: number | null; absent: boolean }>> = {};
    submissions2.forEach(sub => {
      sub.students.forEach(st => {
        if (!m[st.matricule]) m[st.matricule] = {};
        m[st.matricule][sub.module] = { moy: st.absent ? null : calcMoy(st.noteCC, st.noteExam), absent: st.absent ?? false };
      });
    });
    return m;
  }, [submissions2]);

  // ── UE groups for par matière ──
  const uesForSem = useMemo(() => getUEsForKey(`${niveau}-${semestre}`), [niveau, semestre]);
  const moduleListByUE = useMemo(() => {
    if (uesForSem.length === 0) return [{ nom: "Modules", modules: moduleList }];
    // Map each module to its UE, fallback UE for unknowns
    const covered = new Set(uesForSem.flatMap(ue => ue.modules));
    const uncovered = moduleList.filter(m => !covered.has(m));
    const result = uesForSem.map(ue => ({
      nom: ue.nom,
      modules: ue.modules.filter(m => moduleList.includes(m)),
    })).filter(ue => ue.modules.length > 0);
    if (uncovered.length > 0) result.push({ nom: "Autres", modules: uncovered });
    return result;
  }, [uesForSem, moduleList]);

  // ── Par matière rows ──
  const rows = useMemo(() => studentsInGroupe.map((s, idx) => {
    const grades = gradeMap[s.matricule] ?? {};
    const moyennes = moduleList.map(mod => grades[mod]?.moy ?? null);
    const validMoyennes = moyennes.filter(m => m !== null) as number[];
    const semMoy = validMoyennes.length > 0 ? avg(validMoyennes) : null;

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
    const creditsAcquis = computeCredits(moduleList, moyennes, isCompensated);
    const mention = getMention(semMoy);
    return { idx: idx + 1, ...s, moyennes, semMoy, creditsAcquis, decision, mention };
  }), [studentsInGroupe, gradeMap, moduleList, session]);

  // ── Annual rows ──
  const annualRows = useMemo(() => studentsInGroupe.map((s, idx) => {
    const grades1 = gradeMap[s.matricule] ?? {};
    const grades2 = gradeMap2[s.matricule] ?? {};

    const moyennes1 = moduleList.map(mod => grades1[mod]?.moy ?? null);
    const moyennes2 = moduleList2.map(mod => grades2[mod]?.moy ?? null);

    const valid1 = moyennes1.filter(m => m !== null) as number[];
    const valid2 = moyennes2.filter(m => m !== null) as number[];

    const semMoy1 = valid1.length > 0 ? avg(valid1) : null;
    const semMoy2 = valid2.length > 0 ? avg(valid2) : null;

    const isComp1 = semMoy1 !== null && semMoy1 >= 10;
    const isComp2 = semMoy2 !== null && semMoy2 >= 10;
    const credits1 = computeCredits(moduleList, moyennes1, isComp1);
    const credits2 = computeCredits(moduleList2, moyennes2, isComp2);
    const totalCredits = credits1 + credits2;

    const allMoys = [...valid1, ...valid2];
    const annualMoy = allMoys.length > 0 ? avg(allMoys) : null;

    let decision: DecisionType;
    if (annualMoy === null) {
      decision = "Ajourné";
    } else if (annualMoy >= 10) {
      const allPassed = [...moyennes1, ...moyennes2].every(m => m === null || m >= 10);
      decision = allPassed ? "Admis (session normale)" : "Admis par compensation";
    } else if (session === "Rattrapage" && annualMoy >= 5) {
      decision = "Admis (session rattrapage)";
    } else {
      decision = "Ajourné";
    }

    return { idx: idx + 1, ...s, moyennes1, moyennes2, semMoy1, semMoy2, credits1, credits2, totalCredits, annualMoy, decision };
  }), [studentsInGroupe, gradeMap, gradeMap2, moduleList, moduleList2, session]);

  // ── Print functions ──
  function printPV() {
    if (typeDelib === "annuelle") { printAnnualPV(); return; }
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

  function printAnnualPV() {
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) return;

    const tableRows = annualRows.map(r => {
      const decColor = r.decision === "Admis (session normale)" ? "#166534" : r.decision === "Admis par compensation" ? "#0d9488" : r.decision === "Admis (session rattrapage)" ? "#854d0e" : "#991b1b";
      const moy1Color = r.semMoy1 !== null ? (r.semMoy1 >= 10 ? "#166534" : "#991b1b") : "#aaa";
      const moy2Color = r.semMoy2 !== null ? (r.semMoy2 >= 10 ? "#166534" : "#991b1b") : "#aaa";
      const annColor  = r.annualMoy !== null ? (r.annualMoy >= 10 ? "#166534" : "#991b1b") : "#aaa";
      return `<tr>
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px">${r.idx}</td>
        <td style="border:1px solid #bbb;padding:4px;font-size:10px;font-family:monospace">${r.matricule}</td>
        <td style="border:1px solid #bbb;padding:4px;font-size:10px;font-weight:bold">${r.prenom} ${r.nom}</td>
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px;font-weight:bold;background:#eff6ff;color:${moy1Color}">${r.semMoy1 !== null ? r.semMoy1.toFixed(2) : "—"}</td>
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px;background:#eff6ff">${r.credits1}</td>
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px;font-weight:bold;background:#f0fdf4;color:${moy2Color}">${r.semMoy2 !== null ? r.semMoy2.toFixed(2) : "—"}</td>
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px;background:#f0fdf4">${r.credits2}</td>
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px;font-weight:bold">${r.totalCredits}</td>
        <td style="border:1px solid #bbb;padding:4px;text-align:center;font-size:10px;font-weight:bold;color:${annColor}">${r.annualMoy !== null ? r.annualMoy.toFixed(2) : "—"}</td>
        <td style="border:1px solid #bbb;padding:4px;font-size:10px;color:${decColor};font-weight:bold">${r.decision}</td>
      </tr>`;
    }).join("");

    const memberSigsBlock = juryMembers.map(m => `<p style="font-size:11px">${m}</p>`).join("");

    win.document.write(`<html><head><title>PV Délibération Annuelle</title>
    <style>body{font-family:Arial,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}@media print{button{display:none}}</style></head>
    <body>
      <div style="text-align:center;margin-bottom:12px">
        <p style="font-size:11px;color:#444">République Algérienne Démocratique et Populaire</p>
        <p style="font-size:11px;color:#444">Ministère de l'Enseignement Supérieur et de la Recherche Scientifique</p>
        <p style="font-size:13px;font-weight:bold;margin:4px 0">Université des Sciences et de la Technologie Houari Boumediene</p>
        <p style="font-size:11px">Faculté d'Informatique — Département Informatique</p>
        <p style="margin:8px 0;font-size:12px">Année Académique 2025-2026 &nbsp;|&nbsp; Filière : Informatique &nbsp;|&nbsp; Niveau : ${niveau} &nbsp;|&nbsp; Groupe : ${groupe}</p>
        <p style="font-size:14px;font-weight:bold;margin:10px 0;text-decoration:underline">PV de délibération global — ${semestre} + ${semestre2} — Session ${session}</p>
      </div>
      <button onclick="window.print()" style="margin-bottom:12px;padding:8px 16px;background:#4f46e5;color:white;border:none;border-radius:6px;cursor:pointer">Imprimer</button>
      <table>
        <thead>
          <tr>
            <th style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px">N°</th>
            <th style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px">Matricule</th>
            <th style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px">Nom et Prénom</th>
            <th style="border:1px solid #bbb;background:#bfdbfe;padding:6px 4px;font-size:10px;text-align:center">Moy ${semestre}</th>
            <th style="border:1px solid #bbb;background:#bfdbfe;padding:6px 4px;font-size:10px;text-align:center">Crédits ${semestre}</th>
            <th style="border:1px solid #bbb;background:#bbf7d0;padding:6px 4px;font-size:10px;text-align:center">Moy ${semestre2}</th>
            <th style="border:1px solid #bbb;background:#bbf7d0;padding:6px 4px;font-size:10px;text-align:center">Crédits ${semestre2}</th>
            <th style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px;text-align:center">Total Crédits</th>
            <th style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px;text-align:center">Moy Ann.</th>
            <th style="border:1px solid #bbb;background:#e8e8f0;padding:6px 4px;font-size:10px;text-align:center">Décision du jury</th>
          </tr>
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

  const activeRows = typeDelib === "annuelle" ? annualRows : rows;
  const hasData = typeDelib === "annuelle"
    ? studentsInGroupe.length > 0
    : moduleList.length > 0;

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
                  <label className="text-xs text-muted-foreground block mb-1">Type de délibération</label>
                  <Select value={typeDelib} onValueChange={v => setTypeDelib(v as "par_matiere" | "annuelle")}>
                    <SelectTrigger className="w-48 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="par_matiere">Délibération par matière</SelectItem>
                      <SelectItem value="annuelle">Délibération annuelle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {typeDelib === "par_matiere" && (
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Semestre</label>
                    <Select value={semestre} onValueChange={setSemestre}>
                      <SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{SEMESTRES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {typeDelib === "annuelle" && (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Semestre 1</label>
                      <Select value={semestre} onValueChange={setSemestre}>
                        <SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{SEMESTRES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Semestre 2</label>
                      <Select value={semestre2} onValueChange={setSemestre2}>
                        <SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{SEMESTRES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </>
                )}
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
                  {typeDelib === "annuelle"
                    ? `PV de délibération global — ${semestre} + ${semestre2} — 2025/2026 (Session : ${session})`
                    : `PV de délibération — ${semestre} — 2025/2026 (Session : ${session})`}
                </h2>
              </div>
            </Card>
          </motion.div>

          {/* Results summary */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total étudiants", value: activeRows.length, color: "text-foreground", sub: "" },
              { label: "Admis (normale)", value: activeRows.filter(r => r.decision === "Admis (session normale)").length, color: "text-green-700", sub: "" },
              { label: "Admis (compensation)", value: activeRows.filter(r => r.decision === "Admis par compensation").length, color: "text-teal-700", sub: "Moy. ≥ 10" },
              { label: "Ajournés", value: activeRows.filter(r => r.decision === "Ajourné").length, color: "text-red-700", sub: "" },
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
              {!hasData ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground text-sm">Aucune note soumise pour ce groupe / semestre.</p>
                  <p className="text-xs text-muted-foreground mt-1">Sélectionnez un groupe et un semestre pour lesquels des notes existent.</p>
                </div>
              ) : typeDelib === "annuelle" ? (
                // ── ANNUAL TABLE (simplified — summary only) ──
                <div className="overflow-x-auto">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border/60 px-2 py-2 font-semibold text-left w-8">N°</th>
                        <th className="border border-border/60 px-3 py-2 font-semibold text-left">Matricule</th>
                        <th className="border border-border/60 px-3 py-2 font-semibold text-left min-w-36">Nom et Prénom</th>
                        <th className="border border-border/60 px-3 py-2 font-semibold text-center bg-blue-50/60 text-blue-800">Moy {semestre}</th>
                        <th className="border border-border/60 px-3 py-2 font-semibold text-center bg-blue-50/60 text-blue-800">Crédits {semestre}</th>
                        <th className="border border-border/60 px-3 py-2 font-semibold text-center bg-green-50/60 text-green-800">Moy {semestre2}</th>
                        <th className="border border-border/60 px-3 py-2 font-semibold text-center bg-green-50/60 text-green-800">Crédits {semestre2}</th>
                        <th className="border border-border/60 px-3 py-2 font-semibold text-center bg-muted/30">Total Crédits</th>
                        <th className="border border-border/60 px-3 py-2 font-semibold text-center bg-muted/30">Moy Ann.</th>
                        <th className="border border-border/60 px-3 py-2 font-semibold text-center bg-muted/30 min-w-36">Décision du jury</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annualRows.length === 0 ? (
                        <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">Aucun étudiant dans ce groupe</td></tr>
                      ) : annualRows.map((r, ri) => (
                        <tr key={r.matricule} className={`${ri % 2 === 0 ? "bg-background" : "bg-muted/10"} hover:bg-primary/5`}>
                          <td className="border border-border/40 px-2 py-2 text-center text-muted-foreground">{r.idx}</td>
                          <td className="border border-border/40 px-3 py-2 font-mono">{r.matricule}</td>
                          <td className="border border-border/40 px-3 py-2 font-medium">{r.prenom} {r.nom}</td>
                          <td className={`border border-border/40 px-3 py-2 text-center font-bold bg-blue-50/30 ${r.semMoy1 !== null ? (r.semMoy1 >= 10 ? "text-green-700" : "text-red-600") : "text-muted-foreground"}`}>
                            {r.semMoy1 !== null ? r.semMoy1.toFixed(2) : "—"}
                          </td>
                          <td className="border border-border/40 px-3 py-2 text-center bg-blue-50/30">{r.credits1}</td>
                          <td className={`border border-border/40 px-3 py-2 text-center font-bold bg-green-50/30 ${r.semMoy2 !== null ? (r.semMoy2 >= 10 ? "text-green-700" : "text-red-600") : "text-muted-foreground"}`}>
                            {r.semMoy2 !== null ? r.semMoy2.toFixed(2) : "—"}
                          </td>
                          <td className="border border-border/40 px-3 py-2 text-center bg-green-50/30">{r.credits2}</td>
                          <td className="border border-border/40 px-3 py-2 text-center font-bold">{r.totalCredits}</td>
                          <td className={`border border-border/40 px-3 py-2 text-center font-bold ${r.annualMoy !== null ? (r.annualMoy >= 10 ? "text-green-700" : "text-red-600") : "text-muted-foreground"}`}>
                            {r.annualMoy !== null ? r.annualMoy.toFixed(2) : "—"}
                          </td>
                          <td className="border border-border/40 px-2 py-2 text-center">
                            <Badge className={`text-[10px] border ${decisionStyle(r.decision)}`}>{r.decision}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // ── PAR MATIÈRE TABLE (with UE grouping) ──
                <div className="overflow-x-auto">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th rowSpan={3} className="border border-border/60 px-2 py-2 font-semibold text-left w-8">N°</th>
                        <th rowSpan={3} className="border border-border/60 px-3 py-2 font-semibold text-left">Matricule</th>
                        <th rowSpan={3} className="border border-border/60 px-3 py-2 font-semibold text-left min-w-32">Nom et Prénom</th>
                        {moduleListByUE.map(ue => (
                          <th key={ue.nom} colSpan={ue.modules.length * 2}
                            className="border border-border/60 px-2 py-2 font-semibold text-center bg-blue-50/60 text-blue-800 text-[10px]">
                            {ue.nom}
                          </th>
                        ))}
                        <th rowSpan={3} className="border border-border/60 px-2 py-2 font-semibold text-center bg-muted/30">Crédits</th>
                        <th rowSpan={3} className="border border-border/60 px-2 py-2 font-semibold text-center bg-muted/30">Moy. Sem.</th>
                        <th rowSpan={3} className="border border-border/60 px-2 py-2 font-semibold text-center bg-muted/30">Mention</th>
                        <th rowSpan={3} className="border border-border/60 px-3 py-2 font-semibold text-center bg-muted/30 min-w-28">Décision du jury</th>
                      </tr>
                      <tr className="bg-muted/30">
                        {moduleListByUE.flatMap(ue =>
                          ue.modules.map(mod => (
                            <th key={mod} colSpan={2} className="border border-border/60 px-1 py-1 font-semibold text-center text-[10px]">
                              {mod.length > 14 ? mod.slice(0, 14) + "…" : mod}
                            </th>
                          ))
                        )}
                      </tr>
                      <tr className="bg-muted/20">
                        {moduleListByUE.flatMap(ue =>
                          ue.modules.flatMap(mod => [
                            <th key={`${mod}-m`} className="border border-border/60 px-1 py-1 font-medium text-center text-muted-foreground">M</th>,
                            <th key={`${mod}-c`} className="border border-border/60 px-1 py-1 font-medium text-center text-muted-foreground">C</th>,
                          ])
                        )}
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
                          {moduleListByUE.flatMap(ue =>
                            ue.modules.map(mod => {
                              const modIdx = moduleList.indexOf(mod);
                              const moy = modIdx >= 0 ? r.moyennes[modIdx] : null;
                              const isComp = r.decision === "Admis par compensation" && moy !== null && moy < 10 && moy >= 5;
                              const credit = moy !== null && (moy >= 10 || isComp) ? CREDIT_PER_MODULE : 0;
                              return (
                                <Fragment key={mod}>
                                  <td className={`border border-border/40 px-2 py-2 text-center font-semibold ${moy === null ? "text-muted-foreground" : moy >= 10 ? "text-green-700" : isComp ? "text-teal-600" : "text-red-600"}`}>
                                    {moy !== null ? moy.toFixed(2) : "ABS"}
                                    {isComp && <span className="text-[8px] ml-0.5 text-teal-500">C</span>}
                                  </td>
                                  <td className="border border-border/40 px-2 py-2 text-center text-muted-foreground">{credit}</td>
                                </Fragment>
                              );
                            })
                          )}
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

          {/* Jury composition */}
          {hasData && (
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
