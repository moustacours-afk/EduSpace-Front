import { motion } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Upload, ClipboardList, CalendarClock, Users } from "lucide-react";
import { currentTeacher, modules, supports, seances, studentsForTeacher } from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const teacherModules = modules.filter((m) => m.enseignant.includes("Hadj"));
const teacherSupports = supports.filter((s) => s.enseignantId === "t1");
const upcomingSeances = seances.filter((s) => s.statut !== "annule").slice(0, 4);

export default function EnseignantDashboard() {
  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
          <motion.div variants={item} className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">Bonjour, Dr. {currentTeacher.prenom} {currentTeacher.nom}</h1>
              <p className="text-muted-foreground mt-1">{currentTeacher.grade} — {currentTeacher.departement}</p>
            </div>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Modules enseignés", value: teacherModules.length, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Supports déposés", value: teacherSupports.length, icon: Upload, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Séances à venir", value: upcomingSeances.length, icon: CalendarClock, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Étudiants", value: studentsForTeacher.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
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
                <div className="space-y-3">
                  {teacherModules.map((m) => (
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
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-indigo-500" />
                  Prochaines séances
                </h2>
                <div className="space-y-3">
                  {upcomingSeances.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20" data-testid={`seance-teacher-${s.id}`}>
                      <div className="text-center min-w-[52px]">
                        <p className="text-xs font-bold text-primary">{s.heureDebut}</p>
                        <p className="text-xs text-muted-foreground">{s.jour}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{s.module}</p>
                        <p className="text-xs text-muted-foreground">{s.salle} — {s.groupes.join(", ")}</p>
                      </div>
                      <Badge className="text-xs bg-teal-100 text-teal-800 border-teal-200">{s.type}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={item}>
            <Card className="p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-500" />
                Derniers supports déposés
              </h2>
              <div className="space-y-2">
                {teacherSupports.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 text-sm" data-testid={`support-teacher-${s.id}`}>
                    <div>
                      <p className="font-medium">{s.nom}</p>
                      <p className="text-xs text-muted-foreground">{s.module} — {s.uploadDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 uppercase">{s.format}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
