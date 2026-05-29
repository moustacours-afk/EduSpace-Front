import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { notes, notesS6 } from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function SemestreTable({ label, data }: { label: string; data: typeof notes }) {
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
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Contrôle 1</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Contrôle 2</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">TP</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Moy. CC+TP</th>
            </tr>
          </thead>
          <tbody>
            {data.map((n, i) => {
              const ccMoy = n.tp !== null
                ? ((n.controle + (n.tp ?? 0)) / 2).toFixed(2)
                : n.controle.toFixed(2);
              return (
                <motion.tr
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium">{n.module}</td>
                  <td className="text-center px-4 py-3.5">{n.controle}</td>
                  <td className="text-center px-4 py-3.5 text-muted-foreground">—</td>
                  <td className="text-center px-4 py-3.5">
                    {n.tp !== null ? n.tp : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="text-center px-4 py-3.5">
                    <span className={`font-bold ${parseFloat(ccMoy) >= 10 ? "text-green-600" : "text-red-500"}`}>
                      {ccMoy}
                    </span>
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

import { currentStudent } from "@/data/mockData";

export default function EtudiantControles() {
  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Contrôle continu & TP</h1>
            <p className="text-muted-foreground mt-1">
              Matricule : {currentStudent.matricule} — {currentStudent.filiere} {currentStudent.niveau}
            </p>
          </motion.div>

          <motion.div variants={item}>
            <SemestreTable label="Semestre 5" data={notes} />
          </motion.div>

          <motion.div variants={item}>
            <SemestreTable label="Semestre 6" data={notesS6} />
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
