import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Upload, ClipboardList, Users, Bell, Send, AlertCircle, Info, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import { enseignant as api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { teacherSentNotifs, agentNotificationsForTeacher, universityAnnouncements } from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const categoryAccent: Record<string, string> = {
  Club:          "border-l-violet-400 bg-violet-50",
  Conférence:    "border-l-blue-400 bg-blue-50",
  Formation:     "border-l-teal-400 bg-teal-50",
  Compétition:   "border-l-amber-400 bg-amber-50",
  Administratif: "border-l-slate-400 bg-slate-50",
};
const categoryBadge: Record<string, string> = {
  Club:          "bg-violet-100 text-violet-700",
  Conférence:    "bg-blue-100 text-blue-700",
  Formation:     "bg-teal-100 text-teal-700",
  Compétition:   "bg-amber-100 text-amber-700",
  Administratif: "bg-slate-100 text-slate-700",
};

function AnnonceCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  function scrollLeft()  { scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" }); }
  function scrollRight() { scrollRef.current?.scrollBy({ left:  320, behavior: "smooth" }); }

  if (universityAnnouncements.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          Annonces universitaires
        </h2>
        <div className="flex gap-1">
          <button onClick={scrollLeft}  className="w-7 h-7 rounded-lg border border-border bg-white hover:bg-muted flex items-center justify-center transition-colors">
            <ChevronLeft  className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={scrollRight} className="w-7 h-7 rounded-lg border border-border bg-white hover:bg-muted flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scroll-smooth pb-1" style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
        {universityAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className={`flex-shrink-0 w-[280px] bg-white border border-border border-l-4 rounded-xl p-4 ${categoryAccent[ann.categorie] ?? "border-l-gray-300 bg-gray-50"}`}
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg leading-none">{ann.icon}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryBadge[ann.categorie] ?? "bg-gray-100 text-gray-600"}`}>{ann.categorie}</span>
            </div>
            <h3 className="font-semibold text-sm text-foreground leading-snug mb-1.5">{ann.titre}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{ann.contenu}</p>
            <p className="text-xs text-muted-foreground/60 mt-2.5 pt-2.5 border-t border-border/50">{ann.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

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
    api.students("L3", "").then((d) => setStudents(d as Student[])).catch(() => {});
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

          {/* ── Annonces universitaires ── */}
          <motion.div variants={item}>
            <AnnonceCarousel />
          </motion.div>

          {/* ── Admin notifications ── */}
          {agentNotificationsForTeacher.length > 0 && (
            <motion.div variants={item}>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h2 className="font-semibold">Notifications de l'administration</h2>
                  {agentNotificationsForTeacher.filter(n => !n.lu).length > 0 && (
                    <Badge className="ml-auto bg-amber-100 text-amber-800 border-amber-200 text-xs">
                      {agentNotificationsForTeacher.filter(n => !n.lu).length} non lues
                    </Badge>
                  )}
                </div>
                <div className="space-y-3">
                  {agentNotificationsForTeacher.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${
                        notif.lu ? "bg-muted/30 border-border" : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      {notif.lu
                        ? <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      }
                      <div>
                        <p className={notif.lu ? "text-muted-foreground" : "text-foreground font-medium"}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

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

          <motion.div variants={item}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  Dernières notifications envoyées
                </h2>
                <Link href="/enseignant/notifications">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <Send className="w-3 h-3" />
                    Envoyer
                  </Button>
                </Link>
              </div>
              {teacherSentNotifs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune notification envoyée récemment.
                </p>
              ) : (
                <div className="space-y-2">
                  {teacherSentNotifs.slice(0, 3).map((n) => (
                    <div key={n.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/20 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">{n.recipient}</p>
                        <p className="truncate">{n.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {n.date.split(" ")[0]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
