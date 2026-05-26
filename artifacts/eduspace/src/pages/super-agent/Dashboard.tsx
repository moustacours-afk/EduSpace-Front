import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { SuperAgentSidebar } from "@/components/SuperAgentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, ShieldCheck, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { getAgents, getModules, NIVEAUX_LIST } from "@/lib/superAgentStore";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function SuperAgentDashboard() {
  const [, setLocation] = useLocation();

  const agents  = useMemo(() => getAgents(), []);
  const modules = useMemo(() => getModules(), []);

  const activeAgents   = agents.filter(a => a.active).length;
  const inactiveAgents = agents.length - activeAgents;
  const niveauxConfigured = modules.filter(p => p.semestres.some(s => s.modules.length > 0)).length;
  const totalModules = modules.reduce((acc, p) => acc + p.semestres.reduce((a, s) => a + s.modules.length, 0), 0);

  const stats = [
    { label: "Agents créés", value: agents.length, sub: `${activeAgents} actifs`, icon: Users, color: "bg-purple-50 text-purple-700", href: "/super-agent/comptes" },
    { label: "Agents actifs", value: activeAgents, sub: `${inactiveAgents} inactifs`, icon: CheckCircle, color: "bg-green-50 text-green-700", href: "/super-agent/comptes" },
    { label: "Niveaux configurés", value: niveauxConfigured, sub: `sur ${NIVEAUX_LIST.length} niveaux`, icon: BookOpen, color: "bg-blue-50 text-blue-700", href: "/super-agent/modules" },
    { label: "Total modules", value: totalModules, sub: "tous niveaux confondus", icon: ShieldCheck, color: "bg-amber-50 text-amber-700", href: "/super-agent/modules" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <SuperAgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-purple-600" />
                  Tableau de bord — Super Agent
                </h1>
                <p className="text-muted-foreground mt-1">Vue d'ensemble de l'administration centrale.</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(s => (
              <Card key={s.label} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(s.href)}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm font-medium mt-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </Card>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={item}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-purple-600" />Derniers agents créés</h2>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setLocation("/super-agent/comptes")}>
                    Voir tout <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
                {agents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Aucun agent créé pour l'instant.</p>
                ) : (
                  <div className="space-y-2">
                    {agents.slice(-4).reverse().map(a => (
                      <div key={a.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                        <div>
                          <span className="font-medium">{a.prenom} {a.nom}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{a.wilaya}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {a.active ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600" />État des modules par niveau</h2>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setLocation("/super-agent/modules")}>
                    Gérer <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {modules.map(p => {
                    const total = p.semestres.reduce((a, s) => a + s.modules.length, 0);
                    return (
                      <div key={p.niveau} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <span className="font-medium w-16">{p.niveau}</span>
                        <div className="flex-1 mx-3">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((total / 8) * 100, 100)}%` }} />
                          </div>
                        </div>
                        <span className="text-muted-foreground text-xs w-20 text-right">{total} module{total !== 1 ? "s" : ""}</span>
                        {total > 0
                          ? <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-2" />
                          : <XCircle className="w-3.5 h-3.5 text-red-400 ml-2" />}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
