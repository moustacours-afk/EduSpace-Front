import { useState } from "react";
import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCheck } from "lucide-react";
import { notes, notesS6, currentStudent } from "@/data/mockData";

const sessions = ["Session normale", "Session rattrapage"];

const situationConfig = {
  admis:     { label: "Admis",     color: "bg-green-100 text-green-800 border-green-200" },
  ajourne:   { label: "Ajourné",   color: "bg-red-100 text-red-800 border-red-200" },
  rattrapage:{ label: "Rattrapage",color: "bg-amber-100 text-amber-800 border-amber-200" },
};

const rattrapageS5 = notes
  .filter((n) => n.situation === "rattrapage" || n.situation === "ajourne")
  .map((n) => ({
    ...n,
    exam: n.situation === "rattrapage" ? 11.5 : undefined,
    moyenne: n.situation === "rattrapage" ? 10.8 : undefined,
    situation: n.situation === "rattrapage" ? ("admis" as const) : ("ajourne" as const),
  }));

const rattrapageS6 = notesS6
  .filter((n) => (n.situation as string) === "rattrapage" || n.situation === "ajourne")
  .map((n) => ({
    ...n,
    exam: (n.situation as string) === "rattrapage" ? 12.0 : undefined,
    moyenne: (n.situation as string) === "rattrapage" ? 11.2 : undefined,
    situation: (n.situation as string) === "rattrapage" ? ("admis" as const) : ("ajourne" as const),
  }));

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

type NoteRow = {
  id: string;
  module: string;
  exam: number | undefined;
  moyenne: number | undefined;
  situation: "admis" | "ajourne" | "rattrapage";
};

function ExamTable({ label, data }: { label: string; data: NoteRow[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <div className="p-4 border-b border-border flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">{label}</h2>
        </div>
        <p className="text-center text-muted-foreground text-sm py-8">Aucun module à afficher pour ce semestre.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4 border-b border-border flex items-center gap-2">
        <FileCheck className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">{label}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Module</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Note Examen</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Moyenne</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Situation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((n, i) => {
              const conf = situationConfig[n.situation];
              return (
                <motion.tr
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                  data-testid={`examen-row-${n.id}`}
                >
                  <td className="px-5 py-3.5 font-medium">{n.module}</td>
                  <td className="text-center px-4 py-3.5">
                    {n.exam !== undefined
                      ? <span className={`font-semibold ${n.exam >= 10 ? "text-green-600" : "text-red-500"}`}>{n.exam}</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="text-center px-4 py-3.5">
                    {n.moyenne !== undefined
                      ? <span className={`font-bold ${n.moyenne >= 10 ? "text-green-600" : "text-red-500"}`}>{n.moyenne.toFixed(2)}</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge className={`text-xs border ${conf.color}`}>{conf.label}</Badge>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function EtudiantExamens() {
  const [session, setSession] = useState("Session normale");

  const s5Data: NoteRow[] = session === "Session normale" ? notes : rattrapageS5;
  const s6Data: NoteRow[] = session === "Session normale" ? notesS6 : rattrapageS6;

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Examens</h1>
            <p className="text-muted-foreground mt-1">
              Matricule : {currentStudent.matricule} — {currentStudent.filiere} {currentStudent.niveau}
            </p>
          </motion.div>

          <motion.div variants={item} className="flex gap-2">
            {sessions.map((s) => (
              <button
                key={s}
                onClick={() => setSession(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                  session === s
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
                data-testid={`filter-session-${s.replace(/ /g, "-").toLowerCase()}`}
              >
                {s}
              </button>
            ))}
          </motion.div>

          <motion.div variants={item}>
            <ExamTable label={`Semestre 5 — ${session}`} data={s5Data} />
          </motion.div>

          <motion.div variants={item}>
            <ExamTable label={`Semestre 6 — ${session}`} data={s6Data} />
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
