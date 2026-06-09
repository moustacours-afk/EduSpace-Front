import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import {
  GraduationCap, Users, School, ArrowRight,
  ClipboardEdit, ShieldCheck, CalendarDays, Layers,
} from "lucide-react";
import { agent as api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

interface Stats { totalStudents: number; totalTeachers: number }

export default function AgentDashboard() {
  const [, setLocation] = useLocation();
  const user = getUser();
  const profile = (user?.profile ?? {}) as Record<string, string>;

  const [stats, setStats] = useState<Stats>({ totalStudents: 0, totalTeachers: 0 });

  useEffect(() => {
    api.stats()
      .then((d) => {
        const s = d as Record<string, number>;
        const totalStudents = s.totalStudents ?? s.totalEtudiants ?? 0;
        const totalTeachers = s.totalTeachers ?? s.totalEnseignants ?? 0;
        if (totalStudents || totalTeachers) {
          setStats({ totalStudents, totalTeachers });
        } else {
          // Fallback: count from the (department-scoped) lists directly.
          Promise.all([api.students(), api.teachers()])
            .then(([st, te]) => setStats({ totalStudents: (st as unknown[]).length, totalTeachers: (te as unknown[]).length }))
            .catch(() => {});
        }
      })
      .catch(() => {
        Promise.all([api.students(), api.teachers()])
          .then(([st, te]) => setStats({ totalStudents: (st as unknown[]).length, totalTeachers: (te as unknown[]).length }))
          .catch(() => {});
      });
  }, []);

  const shortcuts = [
    { label: "Comptes étudiants",      sub: "Créer et gérer les étudiants",   icon: GraduationCap, color: "text-blue-600 bg-blue-50",     href: "/agent/comptes/etudiants" },
    { label: "Comptes enseignants",    sub: "Créer et gérer les enseignants", icon: Users,          color: "text-indigo-600 bg-indigo-50", href: "/agent/comptes/enseignants" },
    { label: "Gestion des dettes",     sub: "Notes de rattrapage",            icon: ClipboardEdit,  color: "text-red-600 bg-red-50",       href: "/agent/dettes" },
    { label: "Permissions enseignants",sub: "Droits de saisie des notes",     icon: ShieldCheck,    color: "text-emerald-600 bg-emerald-50", href: "/agent/permissions" },
    { label: "Emplois du temps",       sub: "Séances et salles",              icon: CalendarDays,   color: "text-amber-600 bg-amber-50",   href: "/agent/emploi-du-temps" },
    { label: "Organisation",           sub: "Sections et groupes",            icon: Layers,         color: "text-purple-600 bg-purple-50", href: "/agent/organisation-etudiants" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <Card className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Établissement</p>
                  <p className="font-bold text-base leading-snug">
                    Université Oran 1<br />Ahmed Ben Bella
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <School className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{profile.prenom} {profile.nom}</p>
                    <p className="text-xs text-muted-foreground">Agent Pédagogique — {profile.departement}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Comptes du département</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total étudiants",   value: stats.totalStudents,  icon: GraduationCap, color: "text-blue-600",   bg: "bg-blue-50" },
                { label: "Total enseignants", value: stats.totalTeachers,  icon: Users,         color: "text-indigo-600", bg: "bg-indigo-50" },
              ].map((s) => (
                <Card key={s.label} className="p-4">
                  <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Raccourcis</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {shortcuts.map((s) => (
                <Card
                  key={s.href}
                  className="p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                  onClick={() => setLocation(s.href)}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                      <s.icon className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="font-semibold text-sm">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
                </Card>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
