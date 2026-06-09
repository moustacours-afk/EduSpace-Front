import { useState, useEffect, Fragment } from "react";
import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart2, Clock } from "lucide-react";
import { etudiant as api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const situationConfig = {
  admis:      { label: "Admis",      color: "bg-green-100 text-green-800 border-green-200" },
  ajourne:    { label: "Ajourné",    color: "bg-red-100 text-red-800 border-red-200" },
  rattrapage: { label: "Rattrapage", color: "bg-amber-100 text-amber-800 border-amber-200" },
};

const niveauLabels: Record<string, string> = {
  L1: "Licence 1ère Année", L2: "Licence 2ème Année", L3: "Licence 3ème Année",
  M1: "Master 1ère Année",  M2: "Master 2ème Année",
  ING1: "Ingéniorat 1ère Année", ING2: "Ingéniorat 2ème Année",
  ING3: "Ingéniorat 3ème Année", ING4: "Ingéniorat 4ème Année", ING5: "Ingéniorat 5ème Année",
};

function mention(moy: number) {
  if (moy >= 16) return "Très bien";
  if (moy >= 14) return "Bien";
  if (moy >= 12) return "Assez bien";
  if (moy >= 10) return "Passable";
  return null;
}

/** "UEF" → "U.E.F" */
function ueLabel(typeUe: string) {
  return typeUe ? typeUe.split("").join(".") : "U.E";
}

interface NoteRow {
  id: number;
  module: string;
  code: string | null;
  typeUe: string | null;
  credits: number | null;
  coefficient: number | null;
  semestre: string;
  exam: number | null;
  controle: number | null;
  tp: number | null;
  moyenne: number;
  creditAcquis: number;
  situation: "admis" | "ajourne" | "rattrapage";
}

interface UeGroup {
  key: string;
  code: string;
  typeUe: string;
  rows: NoteRow[];
  totalCredits: number;
  acquiredCredits: number;
  moyenne: number;
  acquise: boolean;
}

/** Group modules of a semester by their teaching unit (UE), derived from the
 *  module code "{type}{semestre}{ueOrder}{courseOrder}" — e.g. UEF111 & UEF112
 *  belong to the same unit "UEF11". A unit is "acquise" (and releases ALL its
 *  credits, even for individually-failing modules) when its weighted average
 *  reaches 10/20 — the LMD compensation mechanism (Article 70 of Arrêté 11.65). */
function groupByUe(rows: NoteRow[]): UeGroup[] {
  const groups: UeGroup[] = [];
  const byKey = new Map<string, UeGroup>();

  for (const r of rows) {
    const key = r.code && r.code.length > 1 ? r.code.slice(0, -1) : (r.typeUe ?? r.module);
    let g = byKey.get(key);
    if (!g) {
      g = { key, code: key, typeUe: r.typeUe ?? "", rows: [], totalCredits: 0, acquiredCredits: 0, moyenne: 0, acquise: false };
      byKey.set(key, g);
      groups.push(g);
    }
    g.rows.push(r);
  }

  for (const g of groups) {
    const coefSum = g.rows.reduce((a, r) => a + (r.coefficient ?? 1), 0);
    g.moyenne = coefSum ? g.rows.reduce((a, r) => a + r.moyenne * (r.coefficient ?? 1), 0) / coefSum : 0;
    g.totalCredits = g.rows.reduce((a, r) => a + (r.credits ?? 0), 0);
    g.acquise = g.moyenne >= 10;
    g.acquiredCredits = g.acquise
      ? g.totalCredits
      : g.rows.reduce((a, r) => a + (r.creditAcquis ?? 0), 0);
  }

  return groups;
}

function Pill({ children, ok }: { children: React.ReactNode; ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 rounded-full border text-sm font-bold ${
        ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"
      }`}
    >
      {children}
    </span>
  );
}

function SemestreTable({ niveau, label, data }: { niveau: string; label: string; data: NoteRow[] }) {
  const coefSum = data.reduce((a, n) => a + (n.coefficient ?? 1), 0);
  const moy = coefSum ? data.reduce((a, n) => a + n.moyenne * (n.coefficient ?? 1), 0) / coefSum : 0;
  const totalCredits = data.reduce((a, n) => a + (n.credits ?? 0), 0);
  const groups = groupByUe(data);

  return (
    <Card className="mb-6 overflow-hidden rounded-2xl border border-border">
      <div className="p-5 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-lg">{niveauLabels[niveau] ?? niveau} — {label}</h3>
        <div className="flex flex-wrap items-center gap-3">
          <Pill ok={moy >= 10}>Moyenne {label} : {moy.toFixed(2)}</Pill>
          <Pill ok>Crédits : {totalCredits}</Pill>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Module</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Crédits</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Coef</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Moyenne</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <Fragment key={g.key}>
                {g.rows.map((n) => (
                  <tr key={n.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-3 font-medium">{n.module}</td>
                    <td className="text-center px-4 py-3">{n.creditAcquis}</td>
                    <td className="text-center px-4 py-3 text-muted-foreground">{n.coefficient ?? "—"}</td>
                    <td className="text-center px-4 py-3">
                      <span className={`font-bold ${n.moyenne >= 10 ? "text-green-600" : "text-red-500"}`}>
                        {n.moyenne.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className={g.acquise ? "bg-green-50/70" : "bg-red-50/70"}>
                  <td className="px-5 py-2.5 font-semibold text-xs tracking-wide">
                    ({ueLabel(g.typeUe)}) {g.code}
                  </td>
                  <td className="text-center px-4 py-2.5 font-semibold">
                    {g.acquiredCredits}/{g.totalCredits}
                  </td>
                  <td />
                  <td className="text-center px-4 py-2.5">
                    <span className={`font-bold ${g.acquise ? "text-green-600" : "text-red-500"}`}>
                      {g.moyenne.toFixed(2)}
                    </span>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function semToYear(sem: string): number {
  const num = parseInt(sem.replace(/\D/g, ""), 10);
  return isNaN(num) ? 0 : Math.ceil(num / 2);
}

function anneeLabel(y: number): string {
  const labels = ["1ère", "2ème", "3ème", "4ème", "5ème"];
  return (labels[y - 1] ?? `${y}ème`) + " Année";
}

export default function EtudiantGeneral() {
  const user = getUser();
  const profile = user?.profile as Record<string, string> | null;
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    api.notes().then((d) => setNotes(d as NoteRow[])).catch(() => {});
  }, []);

  const matricule = profile?.matricule ?? "";
  const filiere   = profile?.filiere ?? "";
  const niveau    = profile?.niveau ?? "";

  const allSemestres = [...new Set(notes.map(n => n.semestre))].sort();
  const years        = [...new Set(allSemestres.map(semToYear))].sort();

  // Filter semesters by selected year
  const semestres = selectedYear === null
    ? allSemestres
    : allSemestres.filter(s => semToYear(s) === selectedYear);

  const filteredNotes = notes.filter(n => semestres.includes(n.semestre));

  const bySemestre = filteredNotes.reduce<Record<string, NoteRow[]>>((acc, n) => {
    (acc[n.semestre] ??= []).push(n);
    return acc;
  }, {});

  const coefSum     = filteredNotes.reduce((a, n) => a + (n.coefficient ?? 1), 0);
  const moyGenerale = filteredNotes.length && coefSum
    ? filteredNotes.reduce((a, n) => a + n.moyenne * (n.coefficient ?? 1), 0) / coefSum
    : null;

  const totalCredits    = filteredNotes.reduce((a, n) => a + n.creditAcquis, 0);
  const situationGlobale = filteredNotes.length
    ? (filteredNotes.every((n) => n.situation === "admis") ? "admis"
      : filteredNotes.some((n) => n.situation === "ajourne") ? "ajourne"
      : "rattrapage") as keyof typeof situationConfig
    : null;

  const scopeLabel = selectedYear !== null ? anneeLabel(selectedYear) : "toutes les années";

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Résultats généraux</h1>
            <p className="text-muted-foreground mt-1">
              Matricule : {matricule} — {filiere} {niveau}
            </p>
          </div>

          {notes.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune note publiée pour le moment</p>
              <p className="text-sm mt-1 opacity-70">
                Vos résultats apparaîtront ici une fois que votre enseignant les aura saisis et que l'agent pédagogique les aura validés et publiés.
              </p>
            </Card>
          ) : (
            <>
              {/* Year filter buttons */}
              {years.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedYear(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedYear === null
                        ? "border-blue-500 bg-blue-500/10 text-blue-700"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    Toutes les années
                  </button>
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedYear === y
                          ? "border-blue-500 bg-blue-500/10 text-blue-700"
                          : "border-border text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      {anneeLabel(y)}
                    </button>
                  ))}
                </div>
              )}

              {/* Summary card */}
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
                <div className="flex-1">
                  <p className="text-xs text-blue-500 mb-1 font-medium capitalize">
                    Moyenne — {scopeLabel}
                  </p>
                  <p className="text-3xl font-extrabold text-blue-700">
                    {moyGenerale?.toFixed(2) ?? "—"}<span className="text-base font-normal text-blue-400"> / 20</span>
                  </p>
                  {moyGenerale !== null && mention(moyGenerale) && (
                    <p className="text-xs text-blue-500 mt-1">{mention(moyGenerale)}</p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs text-muted-foreground">Crédits acquis : <span className="font-bold text-foreground">{totalCredits}</span></p>
                  {situationGlobale && (
                    <Badge className={`text-sm border px-3 py-1 ${situationConfig[situationGlobale].color}`}>
                      <BarChart2 className="w-3.5 h-3.5 mr-1.5 inline" />
                      {situationConfig[situationGlobale].label}
                    </Badge>
                  )}
                </div>
              </div>

              {semestres.map((s) => (
                <SemestreTable key={s} niveau={niveau} label={s} data={bySemestre[s]} />
              ))}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
