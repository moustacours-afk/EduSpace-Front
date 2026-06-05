import { useState } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Plus, Trash2, Clock, Send } from "lucide-react";
import { universityAnnouncements } from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item      = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const categories = [
  { value: "Club",          icon: "🎭", accent: "border-l-violet-400 bg-violet-50/60", badge: "bg-violet-100 text-violet-700" },
  { value: "Conférence",    icon: "🎤", accent: "border-l-blue-400 bg-blue-50/60",    badge: "bg-blue-100 text-blue-700" },
  { value: "Formation",     icon: "💻", accent: "border-l-teal-400 bg-teal-50/60",    badge: "bg-teal-100 text-teal-700" },
  { value: "Compétition",   icon: "🏆", accent: "border-l-amber-400 bg-amber-50/60",  badge: "bg-amber-100 text-amber-700" },
  { value: "Administratif", icon: "📋", accent: "border-l-slate-400 bg-slate-50/60",  badge: "bg-slate-100 text-slate-700" },
];

function getCatConfig(cat: string) {
  return categories.find(c => c.value === cat) ?? categories[4];
}

type Annonce = { id: string; titre: string; contenu: string; date: string; categorie: string; icon: string };

export default function AgentAnnonces() {
  const [annonces, setAnnonces] = useState<Annonce[]>(
    universityAnnouncements.map(a => ({ ...a }))
  );
  const [showForm, setShowForm] = useState(false);
  const [titre,    setTitre]    = useState("");
  const [contenu,  setContenu]  = useState("");
  const [categorie, setCategorie] = useState("Club");

  function handlePublish() {
    if (!titre.trim() || !contenu.trim()) return;
    const cfg = getCatConfig(categorie);
    setAnnonces(prev => [{
      id:        `ua${Date.now()}`,
      titre,
      contenu,
      date:      new Date().toISOString().slice(0, 10),
      categorie,
      icon:      cfg.icon,
    }, ...prev]);
    setTitre("");
    setContenu("");
    setShowForm(false);
  }

  function handleDelete(id: string) {
    setAnnonces(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-primary" />
                Annonces
              </h1>
              <p className="text-muted-foreground mt-1">
                Publiez des annonces visibles par les enseignants et les étudiants sur leur accueil.
              </p>
            </div>
            <Button onClick={() => setShowForm(v => !v)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle annonce
            </Button>
          </motion.div>

          {/* Create form */}
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-primary/30 bg-primary/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
                  <Send className="w-4 h-4 text-primary" />
                  Nouvelle annonce
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Titre</label>
                    <Input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de l'annonce" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Contenu</label>
                    <textarea
                      value={contenu}
                      onChange={e => setContenu(e.target.value)}
                      rows={4}
                      placeholder="Détails de l'annonce…"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Catégorie</label>
                      <Select value={categorie} onValueChange={setCategorie}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.value} value={c.value}>
                              <span>{c.icon} {c.value}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                      <Button onClick={handlePublish} disabled={!titre.trim() || !contenu.trim()} className="gap-2">
                        <Send className="w-4 h-4" />
                        Publier
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Annonces list */}
          <motion.div variants={item}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {annonces.length} annonce{annonces.length !== 1 ? "s" : ""} publiée{annonces.length !== 1 ? "s" : ""}
            </p>
            {annonces.length === 0 ? (
              <Card className="p-10 text-center">
                <Megaphone className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Aucune annonce publiée.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {annonces.map(a => {
                  const cfg = getCatConfig(a.categorie);
                  return (
                    <Card
                      key={a.id}
                      className={`p-4 border-l-4 ${cfg.accent}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{a.icon}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{a.categorie}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          {a.date}
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm leading-snug mb-1.5">{a.titre}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">{a.contenu}</p>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
