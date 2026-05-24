import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertOctagon, Info } from "lucide-react";
import { dettes, currentStudent } from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function EtudiantDettes() {
  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">
          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Dettes pédagogiques</h1>
            <p className="text-muted-foreground mt-1">Matricule : {currentStudent.matricule} — modules non validés des années précédentes</p>
          </motion.div>

          {dettes.length === 0 ? (
            <motion.div variants={item}>
              <Card className="p-10 text-center border-green-200 bg-green-50">
                <AlertOctagon className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="font-semibold text-green-700">Aucune dette enregistrée</p>
                <p className="text-sm text-green-500 mt-1">Tous vos modules sont validés.</p>
              </Card>
            </motion.div>
          ) : (
            <>
              <motion.div variants={item}>
                <Card className="p-4 border-amber-200 bg-amber-50 flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Les dettes sont des modules des années précédentes qui n'ont pas été validés. Elles sont gérées et mises à jour par l'agent pédagogique.
                  </p>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card>
                  <div className="p-4 border-b border-border">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-red-500" />
                      Modules en dette — {dettes.length} module(s)
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30 border-b border-border">
                        <tr>
                          <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Module</th>
                          <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Année</th>
                          <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Note Exam</th>
                          <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Moyenne</th>
                          <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Crédits</th>
                          <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Session</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dettes.map((d, i) => (
                          <motion.tr
                            key={d.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="border-b border-border/50 hover:bg-muted/10 transition-colors bg-red-50/30"
                            data-testid={`dette-row-${d.id}`}
                          >
                            <td className="px-5 py-3.5 font-medium">{d.module}</td>
                            <td className="text-center px-4 py-3.5 text-muted-foreground">{d.annee}</td>
                            <td className="text-center px-4 py-3.5">
                              <span className="font-semibold text-red-600">{d.exam}</span>
                            </td>
                            <td className="text-center px-4 py-3.5">
                              <span className="font-bold text-red-600">{d.moyenne.toFixed(2)}</span>
                            </td>
                            <td className="text-center px-4 py-3.5">{d.credits}</td>
                            <td className="px-4 py-3.5">
                              <Badge className={d.session === "rattrapage" ? "bg-amber-100 text-amber-800 border-amber-200 text-xs" : "bg-red-100 text-red-800 border-red-200 text-xs"}>
                                {d.session === "rattrapage" ? "Rattrapage" : "Session normale"}
                              </Badge>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
