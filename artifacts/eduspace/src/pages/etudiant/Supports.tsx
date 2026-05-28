import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileText, Presentation, Video, Link as LinkIcon, Search, FolderOpen } from "lucide-react";
import { etudiant as api } from "@/lib/api";

const typeConfig: Record<string, { label: string; color: string }> = {
  cours:     { label: "Cours",     color: "bg-blue-100 text-blue-800 border-blue-200" },
  td:        { label: "TD",        color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  tp:        { label: "TP",        color: "bg-teal-100 text-teal-800 border-teal-200" },
  corriges:  { label: "Corrigés",  color: "bg-green-100 text-green-800 border-green-200" },
  exercices: { label: "Exercices", color: "bg-purple-100 text-purple-800 border-purple-200" },
};

const formatIcons: Record<string, React.ElementType> = {
  pdf: FileText, ppt: Presentation, video: Video, lien: LinkIcon,
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface Support { id: number; module: string; nom: string; type: string; format: string; taille: string; uploadDate: string }

export default function EtudiantSupports() {
  const [supports, setSupports] = useState<Support[]>([]);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("Tous");
  const [typeFilter, setTypeFilter] = useState("Tous");

  useEffect(() => {
    api.supports().then((d) => setSupports(d as Support[])).catch(() => {});
  }, []);

  const moduleNames = ["Tous", ...Array.from(new Set(supports.map((s) => s.module)))];

  const filtered = supports.filter((s) => {
    const matchSearch = s.nom.toLowerCase().includes(search.toLowerCase()) || s.module.toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === "Tous" || s.module === moduleFilter;
    const matchType = typeFilter === "Tous" || s.type === typeFilter;
    return matchSearch && matchModule && matchType;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Supports de cours</h1>
            <p className="text-muted-foreground mt-1">Accédez aux ressources pédagogiques de vos modules.</p>
          </motion.div>

          <motion.div variants={item} className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un document..." className="pl-9" data-testid="input-search-supports" />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-52" data-testid="select-module">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {moduleNames.map((m) => <SelectItem key={m} value={m}>{m === "Tous" ? "Tous les modules" : m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40" data-testid="select-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Tous les types</SelectItem>
                {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </motion.div>

          {filtered.length === 0 ? (
            <motion.div variants={item} className="text-center py-16 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun support disponible.</p>
            </motion.div>
          ) : (
            <motion.div variants={item} className="space-y-3">
              {filtered.map((s, i) => {
                const conf = typeConfig[s.type] ?? { label: s.type, color: "bg-gray-100 text-gray-800 border-gray-200" };
                const Icon = formatIcons[s.format] ?? FileText;
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="p-4 hover:shadow-md transition-shadow" data-testid={`support-${s.id}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{s.nom}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.module} — {s.taille} — {s.uploadDate}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`text-xs border ${conf.color}`}>{conf.label}</Badge>
                          <Badge variant="outline" className="text-xs uppercase">{s.format}</Badge>
                          <Button size="sm" variant="outline" className="gap-1.5" data-testid={`button-download-${s.id}`}>
                            <Download className="w-3.5 h-3.5" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
