import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, CheckCircle, AlertCircle, Clock, Info, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { etudiant as api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const todayDays = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const today = todayDays[new Date().getDay()];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const categoryAccent: Record<string, string> = {
  Club:        "border-l-violet-400 bg-violet-50",
  Conférence:  "border-l-blue-400 bg-blue-50",
  Formation:   "border-l-teal-400 bg-teal-50",
  Compétition: "border-l-amber-400 bg-amber-50",
};

const categoryBadge: Record<string, string> = {
  Club:        "bg-violet-100 text-violet-700",
  Conférence:  "bg-blue-100 text-blue-700",
  Formation:   "bg-teal-100 text-teal-700",
  Compétition: "bg-amber-100 text-amber-700",
};

interface Notif { id: number; message: string; type: string; lu: boolean; created_at: string }
interface Seance { id: number; module: string; type: string; jour: string; heureDebut: string; heureFin: string; salle: string; enseignant: string; statut: string }
interface Annonce { id: number; titre: string; contenu: string; categorie: string; icon: string; date_publication: string }

export default function EtudiantDashboard() {
  const user = getUser();
  const profile = user?.profile as Record<string, string> | null;

  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.notifications().then((d) => setNotifications(d as Notif[])).catch(() => {});
    api.emploiDuTemps().then((d) => setSeances(d as Seance[])).catch(() => {});
    api.annonces().then((d) => setAnnonces(d as Annonce[])).catch(() => {});
  }, []);

  const unread = notifications.filter((n) => !n.lu);
  const todaySeances = seances.filter((s) => s.jour === today).slice(0, 4);

  function scrollLeft()  { scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" }); }
  function scrollRight() { scrollRef.current?.scrollBy({ left:  320, behavior: "smooth" }); }

  const prenom = profile?.prenom ?? "";
  const nom    = profile?.nom ?? "";
  const filiere = profile?.filiere ?? "";
  const niveau  = profile?.niveau ?? "";
  const groupe  = profile?.groupe ?? "";
  const universite = profile?.universite ?? "";

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <motion.div variants={item} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                <span className="text-white text-xl font-bold">{prenom[0]}{nom[0]}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Bonjour, {prenom} {nom}</h1>
                <p className="text-muted-foreground mt-0.5 text-sm">{filiere} — {niveau} — {groupe}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground mb-0.5">Établissement</p>
              <p className="font-semibold text-sm max-w-xs text-right leading-snug">{universite}</p>
            </div>
          </motion.div>

          {/* Annonces */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-base flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-primary" />
                Annonces universitaires
              </h2>
              <div className="flex gap-1">
                <button onClick={scrollLeft} className="w-7 h-7 rounded-lg border border-border bg-white hover:bg-muted flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={scrollRight} className="w-7 h-7 rounded-lg border border-border bg-white hover:bg-muted flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {annonces.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Aucune annonce.</p>
            ) : (
              <div ref={scrollRef} className="flex gap-3 overflow-x-auto scroll-smooth pb-1" style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
                {annonces.map((ann) => (
                  <div key={ann.id} className={`flex-shrink-0 w-[280px] bg-white border border-border border-l-4 rounded-xl p-4 ${categoryAccent[ann.categorie] ?? "border-l-gray-300 bg-gray-50"}`} style={{ scrollSnapAlign: "start" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg leading-none">{ann.icon}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryBadge[ann.categorie] ?? "bg-gray-100 text-gray-600"}`}>{ann.categorie}</span>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground leading-snug mb-1.5">{ann.titre}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{ann.contenu}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2.5 pt-2.5 border-t border-border/50">{ann.date_publication}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Notifications + Séances */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={item}>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h2 className="font-semibold">Notifications récentes</h2>
                  {unread.length > 0 && (
                    <Badge className="ml-auto bg-amber-100 text-amber-800 border-amber-200 text-xs">{unread.length} non lues</Badge>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucune notification.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} className={`p-3 rounded-lg border text-sm ${notif.lu ? "bg-muted/30 border-border" : "bg-amber-50 border-amber-200"}`}>
                        <div className="flex items-start gap-2">
                          {notif.type === "annulation" ? (
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : notif.type === "horaire" ? (
                            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          ) : notif.type === "info" ? (
                            <Info className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className={notif.lu ? "text-muted-foreground" : "text-foreground font-medium"}>{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notif.created_at?.slice(0, 10)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <h2 className="font-semibold">Séances du jour</h2>
                </div>
                {todaySeances.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Aucune séance aujourd'hui.</p>
                ) : (
                  <div className="space-y-3">
                    {todaySeances.map((s) => (
                      <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border ${s.statut === "annule" ? "bg-red-50 border-red-200 opacity-70" : "bg-muted/20 border-border"}`}>
                        <div className="text-center min-w-[48px]">
                          <p className="text-xs font-bold text-primary">{s.heureDebut}</p>
                          <p className="text-xs text-muted-foreground">{s.heureFin}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{s.module}</p>
                          <p className="text-xs text-muted-foreground">{s.salle} — {s.enseignant}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">{s.type}</Badge>
                          {s.statut !== "normal" && (
                            <Badge className="text-xs bg-red-100 text-red-800 border-red-200">{s.statut}</Badge>
                          )}
                        </div>
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
