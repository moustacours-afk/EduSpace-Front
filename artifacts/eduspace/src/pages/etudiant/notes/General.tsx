import { useState } from "react";
import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart2 } from "lucide-react";
import { notes, notesS6, currentStudent } from "@/data/mockData";

const annees = ["2024-2025", "2023-2024", "2022-2023"];

const situationConfig = {
  admis: { label: "Admis", color: "bg-green-100 text-green-800 border-green-200" },
  ajourne: { label: "Ajourné", color: "bg-red-100 text-red-800 border-red-200" },
  rattrapage: { label: "Rattrapage", color: "bg-amber-100 text-amber-800 border-amber-200" },
};

const situationGenerale = {
  label: "Admis — Session Normale",
  color: "bg-green-100 text-green-700 border-green-200",
};

function SemestreTable({ label, data }: { label: string; data: typeof notes }) {
  const moy = (data.reduce((a, n) => a + n.moyenne, 0) / data.length).toFixed(2);
  const semestre = data[0]?.semestre ?? "";

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-base">{label}</h3>
        <span className="text-sm text-muted-foreground">
          Moyenne semestre : <span className="font-bold text-foreground">{moy}</span>
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
              <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Situation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((n) => {
              const conf = situationConfig[n.situation];
              return (
                <tr key={n.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-3 font-medium">{n.module}</td>
                  <td className="text-center px-4 py-3">{n.exam}</td>
                  <td className="text-center px-4 py-3">{n.controle}</td>
                  <td className="text-center px-4 py-3">{n.tp ?? "—"}</td>
                  <td className="text-center px-4 py-3">
                    <span className={`font-bold ${n.moyenne >= 10 ? "text-green-600" : "text-red-500"}`}>
                      {n.moyenne.toFixed(2)}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3 font-medium">{n.creditAcquis}</td>
                  <td className="px-5 py-3">
                    <Badge className={`text-xs border ${conf.color}`}>{conf.label}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 px-5 py-3 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Moyenne {label}</span>
        <span className={`font-bold text-base ${parseFloat(moy) >= 10 ? "text-green-600" : "text-red-500"}`}>
          {moy} / 20
        </span>
      </div>
    </div>
  );
}

export default function EtudiantGeneral() {
  const [annee, setAnnee] = useState("2024-2025");

  const moyS5 = notes.reduce((a, n) => a + n.moyenne, 0) / notes.length;
  const moyS6 = notesS6.reduce((a, n) => a + n.moyenne, 0) / notesS6.length;
  const moyGenerale = ((moyS5 + moyS6) / 2).toFixed(2);

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Résultats généraux</h1>
              <p className="text-muted-foreground mt-1">
                Matricule : {currentStudent.matricule} — {currentStudent.filiere} {currentStudent.niveau}
              </p>
            </div>
            <Select value={annee} onValueChange={setAnnee}>
              <SelectTrigger className="w-40" data-testid="select-annee-general">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {annees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
            <div className="flex-1">
              <p className="text-xs text-blue-500 mb-1 font-medium">Moyenne générale — {annee}</p>
              <p className="text-3xl font-extrabold text-blue-700">
                {moyGenerale}<span className="text-base font-normal text-blue-400"> / 20</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Situation</p>
              <Badge className={`text-sm border px-3 py-1 ${situationGenerale.color}`}>
                <BarChart2 className="w-3.5 h-3.5 mr-1.5 inline" />
                {situationGenerale.label}
              </Badge>
            </div>
          </div>

          <SemestreTable label="Semestre 5" data={notes} />
          <SemestreTable label="Semestre 6" data={notesS6} />
        </motion.div>
      </main>

    </div>
  );
}
