import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Download, FileText, BarChart3, Users, GraduationCap, BookOpen, TrendingUp } from "lucide-react";
import { agentStudents, gradeSubmissions, reinscriptionChartData } from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const paymentData = [
  { filiere: "Informatique", paye: 18, non_paye: 5 },
  { filiere: "Mathématiques", paye: 13, non_paye: 4 },
  { filiere: "Physique", paye: 8, non_paye: 3 },
];

const noteStatusData = [
  { name: "Publié", value: gradeSubmissions.filter((g) => g.statut === "publie").length, color: "#22c55e" },
  { name: "Validé", value: gradeSubmissions.filter((g) => g.statut === "valide").length, color: "#3b82f6" },
  { name: "Soumis", value: gradeSubmissions.filter((g) => g.statut === "soumis").length, color: "#f59e0b" },
  { name: "En attente", value: gradeSubmissions.filter((g) => g.statut === "en_attente").length, color: "#9ca3af" },
];

const resultatsData = [
  { niveau: "L1", admis: 28, ajourne: 8, redoublant: 3 },
  { niveau: "L2", admis: 22, ajourne: 6, redoublant: 2 },
  { niveau: "L3", admis: 18, ajourne: 7, redoublant: 3 },
  { niveau: "M1", admis: 15, ajourne: 4, redoublant: 1 },
  { niveau: "M2", admis: 12, ajourne: 3, redoublant: 0 },
];

type Report = {
  id: string;
  titre: string;
  description: string;
  icon: React.ElementType;
  badge: string;
};

const reports: Report[] = [
  { id: "r1", titre: "État des réinscriptions", description: "Répartition par filière : Validé / En attente / Rejeté", icon: GraduationCap, badge: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "r2", titre: "État des paiements", description: "Suivi des paiements de frais de scolarité par filière", icon: TrendingUp, badge: "bg-green-100 text-green-800 border-green-200" },
  { id: "r3", titre: "Dossiers incomplets", description: "Liste des étudiants avec documents manquants", icon: FileText, badge: "bg-amber-100 text-amber-800 border-amber-200" },
  { id: "r4", titre: "État des notes par module", description: "Statut de soumission/validation des notes", icon: BookOpen, badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { id: "r5", titre: "Résultats de délibération", description: "Admis / Ajourné / Redoublant par niveau", icon: BarChart3, badge: "bg-purple-100 text-purple-800 border-purple-200" },
  { id: "r6", titre: "Récapitulatif global", description: "Synthèse de tous les indicateurs clés", icon: Users, badge: "bg-gray-100 text-gray-700 border-gray-200" },
];

function StatRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm font-semibold w-8 text-right">{value}</span>
      </div>
    </div>
  );
}

export default function AgentRapports() {
  const totalStudents = agentStudents.length;
  const valide = agentStudents.filter((s) => s.statutReinscription === "valide").length;
  const attente = agentStudents.filter((s) => s.statutReinscription === "en_attente").length;
  const rejete = agentStudents.filter((s) => s.statutReinscription === "rejete").length;
  const incomplet = agentStudents.filter((s) => s.statutReinscription === "incomplet").length;

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

          <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Rapports</h1>
              <p className="text-muted-foreground mt-1">Consultez et exportez les rapports pédagogiques et administratifs.</p>
            </div>
          </motion.div>

          {/* Report cards */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {reports.map((r) => (
              <Card key={r.id} className="p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                    <r.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Badge className={`text-xs border ${r.badge}`}>PDF</Badge>
                </div>
                <p className="font-semibold text-sm mb-1">{r.titre}</p>
                <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-7">
                    <Download className="w-3 h-3" />PDF
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs h-7">
                    <Download className="w-3 h-3" />Excel
                  </Button>
                </div>
              </Card>
            ))}
          </motion.div>

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Réinscriptions chart */}
            <motion.div variants={item}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Rapport 1 — Réinscriptions par filière</h3>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"><Download className="w-3 h-3" />Export</Button>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={reinscriptionChartData} barSize={14}>
                    <XAxis dataKey="filiere" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="valide" name="Validé" fill="#22c55e" radius={[3,3,0,0]} />
                    <Bar dataKey="en_attente" name="En attente" fill="#f59e0b" radius={[3,3,0,0]} />
                    <Bar dataKey="rejete" name="Rejeté" fill="#ef4444" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Payment chart */}
            <motion.div variants={item}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Rapport 2 — État des paiements</h3>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"><Download className="w-3 h-3" />Export</Button>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={paymentData} barSize={20}>
                    <XAxis dataKey="filiere" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="paye" name="Payé" fill="#22c55e" radius={[3,3,0,0]} />
                    <Bar dataKey="non_paye" name="Non payé" fill="#ef4444" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Notes status pie */}
            <motion.div variants={item}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Rapport 4 — Statut des notes</h3>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"><Download className="w-3 h-3" />Export</Button>
                </div>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={160}>
                    <PieChart>
                      <Pie data={noteStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={65}>
                        {noteStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {noteStatusData.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-sm">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-muted-foreground text-xs">{d.name}</span>
                        <span className="ml-auto font-semibold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Résultats */}
            <motion.div variants={item}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Rapport 5 — Résultats par niveau</h3>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"><Download className="w-3 h-3" />Export</Button>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={resultatsData} barSize={12}>
                    <XAxis dataKey="niveau" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="admis" name="Admis" fill="#22c55e" radius={[3,3,0,0]} />
                    <Bar dataKey="ajourne" name="Ajourné" fill="#f59e0b" radius={[3,3,0,0]} />
                    <Bar dataKey="redoublant" name="Redoublant" fill="#ef4444" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          {/* Rapport 3 — Dossiers incomplets */}
          <motion.div variants={item}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Rapport 3 — Dossiers incomplets</h3>
                <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"><Download className="w-3 h-3" />Export</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatRow label="Total étudiants" value={totalStudents} total={totalStudents} />
                <StatRow label="Réinscriptions validées" value={valide} total={totalStudents} />
                <StatRow label="En attente" value={attente} total={totalStudents} />
                <StatRow label="Incomplets" value={incomplet} total={totalStudents} />
              </div>
              {agentStudents.filter((s) => s.statutReinscription === "incomplet").length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30 border-b border-border">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Matricule</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Nom</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Filière</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Documents manquants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentStudents.filter((s) => s.statutReinscription === "incomplet").map((s) => (
                        <tr key={s.id} className="border-b border-border/50 hover:bg-muted/10">
                          <td className="px-3 py-2 font-mono text-xs">{s.matricule}</td>
                          <td className="px-3 py-2">{s.prenom} {s.nom}</td>
                          <td className="px-3 py-2 text-muted-foreground text-xs">{s.filiere} {s.niveau}</td>
                          <td className="px-3 py-2 text-xs text-red-600">
                            {s.documents.filter((d) => !d.soumis).map((d) => d.type).join(", ") || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
