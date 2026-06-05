import { useState, useEffect } from "react";
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

function mention(moy: number) {
  if (moy >= 16) return "Très bien";
  if (moy >= 14) return "Bien";
  if (moy >= 12) return "Assez bien";
  if (moy >= 10) return "Passable";
  return null;
}

interface NoteRow {
  id: number;
  module: string;
  semestre: string;
  exam: number | null;
  controle: number | null;
  tp: number | null;
  moyenne: number;
  creditAcquis: number;
  situation: "admis" | "ajourne" | "rattrapage";
}

function SemestreTable({ label, data }: { label: string; data: NoteRow[] }) {
  const moy = data.length ? (data.reduce((a, n) => a + n.moyenne, 0) / data.length) : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-base">{label}</h3>
        <span className="text-sm text-muted-foreground">
          Moyenne semestre : <span className={`font-bold ${moy >= 10 ? "text-green-600" : "text-red-500"}`}>{moy.toFixed(2)}</span>
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Module</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Examen</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Contrôle</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">TP</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Moyenne</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Crédits</th>
            </tr>
          </thead>
          <tbody>
            {data.map((n) => (
              <tr key={n.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                <td className="px-5 py-3 font-medium">{n.module}</td>
                <td className="text-center px-4 py-3">{n.exam ?? "—"}</td>
                <td className="text-center px-4 py-3">{n.controle ?? "—"}</td>
                <td className="text-center px-4 py-3">{n.tp ?? "—"}</td>
                <td className="text-center px-4 py-3">
                  <span className={`font-bold ${n.moyenne >= 10 ? "text-green-600" : "text-red-500"}`}>
                    {n.moyenne.toFixed(2)}
                  </span>
                </td>
                <td className="text-center px-4 py-3 font-medium">{n.creditAcquis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 px-5 py-3 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Moyenne {label}</span>
        <span className={`font-bold text-base ${moy >= 10 ? "text-green-600" : "text-red-500"}`}>
          {moy.toFixed(2)} / 20
        </span>
      </div>
    </div>
  );
}

export default function EtudiantGeneral() {
  const user = getUser();
  const profile = user?.profile as Record<string, string> | null;
  const [notes, setNotes] = useState<NoteRow[]>([]);

  useEffect(() => {
    api.notes().then((d) => setNotes(d as NoteRow[])).catch(() => {});
  }, []);

  const matricule = profile?.matricule ?? "";
  const filiere   = profile?.filiere ?? "";
  const niveau    = profile?.niveau ?? "";

  const bySemestre = notes.reduce<Record<string, NoteRow[]>>((acc, n) => {
    (acc[n.semestre] ??= []).push(n);
    return acc;
  }, {});
  const semestres = Object.keys(bySemestre).sort();

  const moyGenerale = notes.length
    ? (notes.reduce((a, n) => a + n.moyenne, 0) / notes.length)
    : null;

  const totalCredits = notes.reduce((a, n) => a + n.creditAcquis, 0);
  const situationGlobale = notes.length
    ? (notes.every((n) => n.situation === "admis") ? "admis"
      : notes.some((n) => n.situation === "ajourne") ? "ajourne"
      : "rattrapage") as keyof typeof situationConfig
    : null;

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
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
                <div className="flex-1">
                  <p className="text-xs text-blue-500 mb-1 font-medium">Moyenne générale</p>
                  <p className="text-3xl font-extrabold text-blue-700">
                    {moyGenerale?.toFixed(2)}<span className="text-base font-normal text-blue-400"> / 20</span>
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
                <SemestreTable key={s} label={s} data={bySemestre[s]} />
              ))}
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
