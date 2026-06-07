import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { SuperAgentSidebar } from "@/components/SuperAgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, GraduationCap, Building2, Award, RefreshCcw, AlertTriangle, XCircle, Users } from "lucide-react";
import { superAgent as api } from "@/lib/api";
import { getSuperAgentUniversite } from "@/lib/auth";
import { getFacultes, getDepartements, NIVEAUX_LIST } from "@/lib/superAgentStore";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface AgentRecord { faculte?: string }
interface Stats { normale: number; rattrapage: number; dettes: number; ajourne: number; total: number }

const OUTCOMES = [
  { key: "normale" as const,    label: "Admis — session normale",     sub: "passés du premier coup",        icon: Award,         bar: "bg-green-500",  chip: "bg-green-50 text-green-700" },
  { key: "rattrapage" as const, label: "Admis — session rattrapage",  sub: "passés après rattrapage",       icon: RefreshCcw,    bar: "bg-amber-500",  chip: "bg-amber-50 text-amber-700" },
  { key: "dettes" as const,     label: "Admis avec dettes",           sub: "passent en devant des modules", icon: AlertTriangle, bar: "bg-blue-500",   chip: "bg-blue-50 text-blue-700" },
  { key: "ajourne" as const,    label: "Ajournés",                    sub: "redoublent l'année",            icon: XCircle,       bar: "bg-red-500",    chip: "bg-red-50 text-red-700" },
];

export default function SuperAgentStatistiques() {
  const universite = getSuperAgentUniversite();

  const [agents, setAgents]         = useState<AgentRecord[]>([]);
  const [faculte, setFaculte]       = useState("");
  const [departement, setDepartement] = useState("");
  const [niveau, setNiveau]         = useState("L3");
  const [stats, setStats]           = useState<Stats | null>(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => { api.agents().then(d => setAgents(d as AgentRecord[])).catch(() => {}); }, []);

  // Faculté options: store list for this université + any faculté already in use.
  const faculties = useMemo(() => {
    const fromStore = universite ? getFacultes(universite) : [];
    const fromData  = agents.map(a => a.faculte ?? "").filter(Boolean) as string[];
    return [...new Set([...fromStore, ...fromData])].sort();
  }, [universite, agents]);

  const departements = useMemo(() => (faculte ? getDepartements(faculte) : []), [faculte]);
  const allSet = !!(faculte && departement && niveau);

  const fetchStats = useCallback(() => {
    if (!departement || !niveau) { setStats(null); return; }
    setLoading(true);
    const params = new URLSearchParams({ filiere: departement, niveau }).toString();
    api.studentStats(params)
      .then(d => setStats(d))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [departement, niveau]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  function handleFaculte(v: string) { setFaculte(v); setDepartement(""); }

  const total = stats?.total ?? 0;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="flex min-h-screen bg-background">
      <SuperAgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-indigo-600" />Statistiques étudiants</h1>
            <p className="text-muted-foreground mt-1">Résultats de fin d'année — passage à l'année supérieure par session.</p>
            {universite && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{universite}</p>}
          </motion.div>

          {/* Filters */}
          <motion.div variants={item}>
            <Card className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Faculté *</label>
                  <Select value={faculte} onValueChange={handleFaculte}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner une faculté" /></SelectTrigger>
                    <SelectContent className="max-h-60">{faculties.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Département *</label>
                  <Select value={departement} onValueChange={setDepartement} disabled={!faculte}>
                    <SelectTrigger className="w-full"><SelectValue placeholder={faculte ? "Sélectionner un département" : "Choisissez d'abord une faculté"} /></SelectTrigger>
                    <SelectContent className="max-h-52">{departements.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Niveau (année)</label>
                <div className="flex flex-wrap gap-1.5">
                  {NIVEAUX_LIST.map(n => (
                    <button key={n} onClick={() => setNiveau(n)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors border ${niveau === n ? "bg-indigo-600 text-white border-indigo-600" : "bg-background border-border hover:bg-muted"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Results */}
          {!allSet ? (
            <motion.div variants={item}>
              <Card className="p-10 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Choisissez une faculté, un département et un niveau pour afficher les résultats.</p>
              </Card>
            </motion.div>
          ) : loading ? (
            <motion.div variants={item}><Card className="p-10 text-center text-muted-foreground">Chargement…</Card></motion.div>
          ) : total === 0 ? (
            <motion.div variants={item}>
              <Card className="p-10 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun résultat d'étudiant pour {departement} — {niveau}.</p>
              </Card>
            </motion.div>
          ) : (
            <>
              <motion.div variants={item} className="flex items-center gap-4 flex-wrap text-sm">
                <Badge variant="outline" className="gap-1.5"><GraduationCap className="w-3.5 h-3.5" />{departement} — {niveau}</Badge>
                <span className="text-muted-foreground">{total} étudiant{total !== 1 ? "s" : ""} avec résultats</span>
              </motion.div>

              <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {OUTCOMES.map(o => {
                  const value = stats ? stats[o.key] : 0;
                  return (
                    <Card key={o.key} className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${o.chip}`}><o.icon className="w-5 h-5" /></div>
                        <span className="text-3xl font-bold">{value}</span>
                      </div>
                      <p className="font-semibold text-sm">{o.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-3">{o.sub}</p>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${o.bar}`} style={{ width: `${pct(value)}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-right">{pct(value)}%</p>
                    </Card>
                  );
                })}
              </motion.div>

              {/* Summary: passed vs failed */}
              <motion.div variants={item}>
                <Card className="p-5">
                  <h2 className="font-semibold text-sm mb-3">Synthèse</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex h-3 flex-1 rounded-full overflow-hidden">
                      {OUTCOMES.map(o => {
                        const value = stats ? stats[o.key] : 0;
                        return value > 0 ? <div key={o.key} className={o.bar} style={{ width: `${pct(value)}%` }} title={`${o.label}: ${value}`} /> : null;
                      })}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs">
                    {(() => {
                      const admis = (stats?.normale ?? 0) + (stats?.rattrapage ?? 0) + (stats?.dettes ?? 0);
                      return (
                        <>
                          <span className="text-green-700 font-medium">Admis (passent) : {admis} ({pct(admis)}%)</span>
                          <span className="text-red-700 font-medium">Ajournés (redoublent) : {stats?.ajourne ?? 0} ({pct(stats?.ajourne ?? 0)}%)</span>
                        </>
                      );
                    })()}
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
