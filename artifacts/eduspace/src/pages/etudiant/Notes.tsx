import { useState } from "react";
import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Award, BookOpen } from "lucide-react";
import { notes, currentStudent } from "@/data/mockData";

const situationConfig = {
  admis: { label: "Admis", color: "bg-green-100 text-green-800 border-green-200" },
  ajourne: { label: "Ajourné", color: "bg-red-100 text-red-800 border-red-200" },
  rattrapage: { label: "Rattrapage", color: "bg-amber-100 text-amber-800 border-amber-200" },
};

const semestres = ["Tous les semestres", "S5", "S6"];
const annees = ["2024-2025", "2023-2024", "2022-2023"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function EtudiantNotes() {
  const [semestre, setSemestre] = useState("Tous les semestres");
  const [annee, setAnnee] = useState("2024-2025");

  const filtered = semestre === "Tous les semestres" ? notes : notes.filter((n) => n.semestre === semestre);
  const moyenne = (filtered.reduce((a, n) => a + n.moyenne, 0) / filtered.length).toFixed(2);
  const creditsAcquis = filtered.reduce((a, n) => a + n.creditAcquis, 0);
  const creditsTotaux = filtered.reduce((a, n) => a + (n.creditAcquis > 0 ? n.creditAcquis : 4), 0);
  const admisCount = filtered.filter((n) => n.situation === "admis").length;

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Notes &amp; Résultats</h1>
            <p className="text-muted-foreground mt-1">Matricule : {currentStudent.matricule} — {currentStudent.filiere} {currentStudent.niveau}</p>
          </motion.div>

          <motion.div variants={item} className="flex gap-3 flex-wrap">
            <Select value={semestre} onValueChange={setSemestre}>
              <SelectTrigger className="w-52" data-testid="select-semestre">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {semestres.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={annee} onValueChange={setAnnee}>
              <SelectTrigger className="w-44" data-testid="select-annee">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {annees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-3 gap-4">
            {[
              { label: "Moyenne Générale", value: moyenne, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Crédits Acquis", value: `${creditsAcquis} crédits`, icon: Award, color: "text-green-600", bg: "bg-green-50" },
              { label: "Modules Validés", value: `${admisCount}/${filtered.length}`, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
            ].map((s) => (
              <Card key={s.label} className="p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </Card>
            ))}
          </motion.div>

          <motion.div variants={item}>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b border-border">
                    <tr>
                      <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Module</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Examen</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Contrôle</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">TP</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Moyenne</th>
                      <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Crédits</th>
                      <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Situation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((n, i) => {
                      const conf = situationConfig[n.situation];
                      return (
                        <motion.tr
                          key={n.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                          data-testid={`note-row-${n.id}`}
                        >
                          <td className="px-5 py-3.5 font-medium">{n.module}</td>
                          <td className="text-center px-4 py-3.5">{n.exam}</td>
                          <td className="text-center px-4 py-3.5">{n.controle}</td>
                          <td className="text-center px-4 py-3.5">{n.tp ?? "—"}</td>
                          <td className="text-center px-4 py-3.5">
                            <span className={`font-bold text-base ${n.moyenne >= 10 ? "text-green-600" : "text-red-600"}`}>{n.moyenne.toFixed(2)}</span>
                          </td>
                          <td className="text-center px-4 py-3.5 font-medium">{n.creditAcquis}</td>
                          <td className="px-5 py-3.5">
                            <Badge className={`text-xs border ${conf.color}`}>{conf.label}</Badge>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
