import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { ClipboardList, Clock } from "lucide-react";
import { etudiant as api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface NoteRow {
  id: number;
  module: string;
  semestre: string;
  controle: number | null;
  tp: number | null;
}

function SemestreTable({ label, data }: { label: string; data: NoteRow[] }) {
  return (
    <Card>
      <div className="p-4 border-b border-border flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">{label}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Module</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Contrôle</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">TP</th>
            </tr>
          </thead>
          <tbody>
            {data.map((n, i) => (
              <motion.tr
                key={n.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-border/50 hover:bg-muted/10 transition-colors"
              >
                <td className="px-5 py-3.5 font-medium">{n.module}</td>
                <td className="text-center px-4 py-3.5">
                  {n.controle !== null ? n.controle : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="text-center px-4 py-3.5">
                  {n.tp !== null ? n.tp : <span className="text-muted-foreground">—</span>}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function EtudiantControles() {
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

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Contrôle continu & TP</h1>
            <p className="text-muted-foreground mt-1">
              Matricule : {matricule} — {filiere} {niveau}
            </p>
          </motion.div>

          {semestres.length === 0 ? (
            <motion.div variants={item}>
              <Card className="p-12 text-center text-muted-foreground">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucune note publiée pour le moment</p>
                <p className="text-sm mt-1 opacity-70">Vos résultats de contrôle continu apparaîtront ici une fois validés et publiés.</p>
              </Card>
            </motion.div>
          ) : (
            semestres.map((s) => (
              <motion.div variants={item} key={s}>
                <SemestreTable label={s} data={bySemestre[s]} />
              </motion.div>
            ))
          )}

        </motion.div>
      </main>
    </div>
  );
}
