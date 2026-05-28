import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Upload, ClipboardList, Users } from "lucide-react";
import { enseignant as api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

interface Module { id: number; intitule: string; code: string; niveau: string; semestre: string; credits: number }
interface Student { id: number; nom: string; prenom: string; matricule: string }
interface Support { id: number; nom: string; module: string; uploadDate: string; format: string }
interface Soumission { id: number; statut: string }

export default function EnseignantDashboard() {
  const user = getUser();
  const profile = (user?.profile ?? {}) as Record<string, string>;

  const [modules, setModules] = useState<Module[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [soumissions, setSoumissions] = useState<Soumission[]>([]);

  useEffect(() => {
    api.modules().then((d) => setModules(d as Module[])).catch(() => {});
    api.students().then((d) => setStudents(d as Student[])).catch(() => {});
    api.soumissions().then((d) => setSoumissions(d as Soumission[])).catch(() => {});
  }, []);

  const pendingSoumissions = soumissions.filter((s) => s.statut === "en_attente").length;

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
          <motion.div variants={item} className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Bonjour, Dr. {profile.prenom} {profile.nom}</h1>
              <p className="text-muted-foreground mt-1">{profile.grade} — {profile.departement}</p>
            </div>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Modules enseignés", value: modules.length,        icon: BookOpen,      color: "text-blue-600",   bg: "bg-blue-50" },
              { label: "À soumettre",       value: pendingSoumissions,    icon: Upload,        color: "text-amber-600",  bg: "bg-amber-50" },
              { label: "Total soumissions", value: soumissions.length,    icon: ClipboardList, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Étudiants",         value: students.length,       icon: Users,         color: "text-purple-600", bg: "bg-purple-50" },
            ].map((stat) => (
              <Card key={stat.label} className="p-5">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </Card>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <Card className="p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Mes modules
                </h2>
                {modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun module assigné.</p>
                ) : (
                  <div className="space-y-3">
                    {modules.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors" data-testid={`module-${m.id}`}>
                        <div>
                          <p className="font-medium text-sm">{m.intitule}</p>
                          <p className="text-xs text-muted-foreground">{m.code} — {m.niveau}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">{m.semestre}</Badge>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">{m.credits} cr.</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-500" />
                  Soumissions de notes
                </h2>
                {soumissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucune soumission.</p>
                ) : (
                  <div className="space-y-3">
                    {soumissions.slice(0, 5).map((s: Soumission & Record<string, unknown>) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20" data-testid={`soumission-${s.id}`}>
                        <div>
                          <p className="text-sm font-medium">{String(s.module ?? "—")}</p>
                          <p className="text-xs text-muted-foreground">{String(s.groupe ?? "")} — {String(s.niveau ?? "")}</p>
                        </div>
                        <Badge className={`text-xs ${
                          s.statut === "soumis"     ? "bg-amber-100 text-amber-800 border-amber-200" :
                          s.statut === "valide"     ? "bg-blue-100 text-blue-800 border-blue-200" :
                          s.statut === "publie"     ? "bg-green-100 text-green-800 border-green-200" :
                          "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>{String(s.statut)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
