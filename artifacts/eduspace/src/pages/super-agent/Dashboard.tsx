import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { SuperAgentSidebar } from "@/components/SuperAgentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, ShieldCheck, Landmark, ArrowRight, Building2, CheckCircle, XCircle, BarChart3, GraduationCap, UserCheck } from "lucide-react";
import { superAgent as api } from "@/lib/api";
import { NIVEAUX_LIST, getDepartements } from "@/lib/superAgentStore";
import { getSuperAgentAccountType, getSuperAgentFaculte, getSuperAgentUniversite } from "@/lib/auth";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface AgentRecord { id: number; nom: string; prenom: string; email: string; departement: string; faculte?: string; statut?: string }
interface DoyenRecord { id: number; nom: string; prenom: string; email: string; faculte: string; statut: string }
interface ModuleRecord { id: number; intitule: string; niveau: string; filiere: string }

export default function SuperAgentDashboard() {
  const [, setLocation] = useLocation();
  const accountType = getSuperAgentAccountType();
  const isDirector  = accountType === "directeur";
  const faculte     = getSuperAgentFaculte();
  const universite  = getSuperAgentUniversite();

  const [agents, setAgents]   = useState<AgentRecord[]>([]);
  const [doyens, setDoyens]   = useState<DoyenRecord[]>([]);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);

  useEffect(() => {
    api.agents().then(d => setAgents(d as AgentRecord[])).catch(() => {});
    api.modules().then(d => setModules(d as ModuleRecord[])).catch(() => {});
    if (isDirector) api.doyens().then(d => setDoyens(d as DoyenRecord[])).catch(() => {});
    api.stats().then(d => {
      const s = d as Record<string, number>;
      setTotalStudents(s.totalStudents ?? s.totalEtudiants ?? 0);
      setTotalTeachers(s.totalTeachers ?? s.totalEnseignants ?? 0);
    }).catch(() => {});
  }, [isDirector]);

  // Doyen: scope modules to the faculty's départements (modules carry no faculté).
  const facultyDepts  = isDirector ? [] : getDepartements(faculte);
  const scopedModules = isDirector ? modules : modules.filter(m => facultyDepts.includes(m.filiere));

  const modulesByNiveau = NIVEAUX_LIST.reduce<Record<string, number>>((acc, n) => {
    acc[n] = scopedModules.filter(m => m.niveau === n).length;
    return acc;
  }, {});

  const scopeLabel = isDirector ? "université" : "faculté";
  const statCards = [
    { label: `Étudiants (${scopeLabel})`, value: totalStudents, sub: isDirector ? "tous départements" : "tous départements de la faculté", icon: GraduationCap, color: "bg-blue-50 text-blue-700", href: null },
    { label: `Enseignants (${scopeLabel})`, value: totalTeachers, sub: isDirector ? "tous départements" : "tous départements de la faculté", icon: UserCheck, color: "bg-indigo-50 text-indigo-700", href: null },
    { label: isDirector ? "Agents (université)" : "Agents (faculté)", value: agents.length, sub: "comptes pédagogiques", icon: Users, color: "bg-purple-50 text-purple-700", href: "/super-agent/comptes" },
    { label: "Modules", value: scopedModules.length, sub: "toutes spécialités", icon: BookOpen, color: "bg-blue-50 text-blue-700", href: "/super-agent/modules" },
    ...(isDirector ? [{ label: "Doyens", value: doyens.length, sub: "comptes de faculté", icon: Landmark, color: "bg-emerald-50 text-emerald-700", href: "/super-agent/comptes" }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <SuperAgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
              Accueil — {isDirector ? "Directeur" : "Doyen"}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {isDirector ? (universite || "Niveau université") : (faculte || "Niveau faculté")}
            </p>
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl">
            {statCards.map(s => (
              <Card
                key={s.label}
                className={`p-4 transition-shadow ${s.href ? "hover:shadow-md cursor-pointer" : ""}`}
                onClick={() => s.href && setLocation(s.href)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}><s.icon className="w-5 h-5" /></div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm font-medium mt-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </Card>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left panel: Doyens (Director) or latest agents (Doyen) */}
            <motion.div variants={item}>
              <Card className="p-5">
                {isDirector ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold flex items-center gap-2"><Landmark className="w-4 h-4 text-purple-600" />Comptes de faculté (Doyens)</h2>
                      <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setLocation("/super-agent/comptes")}>Voir tout <ArrowRight className="w-3 h-3" /></Button>
                    </div>
                    {doyens.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Aucun doyen créé pour l'instant.</p>
                    ) : (
                      <div className="space-y-2">
                        {doyens.slice(0, 6).map(d => (
                          <div key={d.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                            <div className="min-w-0">
                              <span className="font-medium">{d.prenom} {d.nom}</span>
                              <span className="text-muted-foreground ml-2 text-xs">{d.faculte}</span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.statut === "suspendu" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                              {d.statut === "suspendu" ? "Suspendu" : "Actif"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-purple-600" />Agents de la faculté</h2>
                      <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setLocation("/super-agent/comptes")}>Voir tout <ArrowRight className="w-3 h-3" /></Button>
                    </div>
                    {agents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Aucun agent créé pour l'instant.</p>
                    ) : (
                      <div className="space-y-2">
                        {agents.slice(-6).reverse().map(a => (
                          <div key={a.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                            <div className="min-w-0">
                              <span className="font-medium">{a.prenom} {a.nom}</span>
                              {a.departement && <span className="text-muted-foreground ml-2 text-xs">{a.departement}</span>}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.statut === "suspendu" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                              {a.statut === "suspendu" ? "Suspendu" : "Actif"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </Card>
            </motion.div>

            {/* Right panel: modules per niveau */}
            <motion.div variants={item}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600" />État des modules par niveau</h2>
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setLocation("/super-agent/modules")}>Gérer <ArrowRight className="w-3 h-3" /></Button>
                </div>
                <div className="space-y-2">
                  {NIVEAUX_LIST.map(niveau => {
                    const total = modulesByNiveau[niveau] ?? 0;
                    return (
                      <div key={niveau} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <span className="font-medium w-16">{niveau}</span>
                        <div className="flex-1 mx-3">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((total / 10) * 100, 100)}%` }} />
                          </div>
                        </div>
                        <span className="text-muted-foreground text-xs w-20 text-right">{total} module{total !== 1 ? "s" : ""}</span>
                        {total > 0 ? <CheckCircle className="w-3.5 h-3.5 text-green-500 ml-2" /> : <XCircle className="w-3.5 h-3.5 text-red-400 ml-2" />}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>

          {isDirector && (
            <motion.div variants={item}>
              <Card className="p-5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center"><BarChart3 className="w-5 h-5" /></div>
                  <div>
                    <p className="font-semibold text-sm">Statistiques étudiants</p>
                    <p className="text-xs text-muted-foreground">Résultats annuels : admis (normale / rattrapage), dettes, ajournés.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setLocation("/super-agent/statistiques")}>Ouvrir <ArrowRight className="w-3 h-3" /></Button>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
