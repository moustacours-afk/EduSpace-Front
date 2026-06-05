import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Award, BookOpen } from "lucide-react";
import { etudiant as api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const situationConfig = {
  admis:     { label: "Admis",      color: "bg-green-100 text-green-800 border-green-200" },
  ajourne:   { label: "Ajourné",    color: "bg-red-100 text-red-800 border-red-200" },
  rattrapage:{ label: "Rattrapage", color: "bg-amber-100 text-amber-800 border-amber-200" },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface NoteRow {
  id: number;
  moduleId: number;
  module: string;
  semestre: string;
  exam: number | null;
  controle: number | null;
  tp: number | null;
  moyenne: number;
  creditAcquis: number;
  situation: "admis" | "ajourne" | "rattrapage";
}

export default function EtudiantNotes() {
  const user = getUser();
  const profile = user?.profile as Record<string, string> | null;

  const [allNotes, setAllNotes] = useState<NoteRow[]>([]);
  const [semestre, setSemestre] = useState("Tous les semestres");

  useEffect(() => {
    api.notes().then((d) => setAllNotes(d as NoteRow[])).catch(() => {});
  }, []);

  const semestres = ["Tous les semestres", ...Array.from(new Set(allNotes.map((n) => n.semestre))).sort()];
  const filtered = semestre === "Tous les semestres" ? allNotes : allNotes.filter((n) => n.semestre === semestre);

  const moyenne = filtered.length
    ? (filtered.reduce((a, n) => a + n.moyenne, 0) / filtered.length).toFixed(2)
    : "—";
  const creditsAcquis = filtered.reduce((a, n) => a + n.creditAcquis, 0);
  const admisCount = filtered.filter((n) => n.situation === "admis").length;

  const matricule = profile?.matricule ?? "";
  const filiere   = profile?.filiere ?? "";
  const niveau    = profile?.niveau ?? "";

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Notes &amp; Résultats</h1>
            <p className="text-muted-foreground mt-1">Matricule : {matricule} — {filiere} {niveau}</p>
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
            {filtered.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucune note publiée pour le moment</p>
                <p className="text-sm mt-1 opacity-70">Vos résultats apparaîtront ici une fois saisis par vos enseignants et validés par l'agent pédagogique.</p>
              </Card>
            ) : (
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
                        const conf = situationConfig[n.situation] ?? situationConfig.ajourne;
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
                            <td className="text-center px-4 py-3.5">{n.exam ?? "—"}</td>
                            <td className="text-center px-4 py-3.5">{n.controle ?? "—"}</td>
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
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
