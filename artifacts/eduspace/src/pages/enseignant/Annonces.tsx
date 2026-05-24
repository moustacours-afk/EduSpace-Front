import { useState } from "react";
import { motion } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Send, Plus, Clock } from "lucide-react";
import { modules } from "@/data/mockData";

const teacherModules = modules.filter((m) => m.enseignant.includes("Hadj"));

const mockAnnonces = [
  { id: "a1", titre: "Changement de salle — TP Base de Données", contenu: "Le TP du Mercredi aura lieu en Labo Info 3 au lieu du Labo Info 2.", date: "2025-05-11", destinataires: "Groupe 2", module: "Base de Données" },
  { id: "a2", titre: "Publication du corrigé TD 2 — Algorithmique", contenu: "Le corrigé du TD 2 est maintenant disponible dans les supports de cours.", date: "2025-05-09", destinataires: "Tous", module: "Algorithmique" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function EnseignantAnnonces() {
  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [destinataires, setDestinataires] = useState("Tous");
  const [moduleSelect, setModuleSelect] = useState(teacherModules[0]?.intitule ?? "");
  const [annonces, setAnnonces] = useState(mockAnnonces);

  function handleSend() {
    if (!titre.trim() || !contenu.trim()) return;
    setAnnonces((prev) => [{
      id: `a${Date.now()}`,
      titre,
      contenu,
      date: new Date().toISOString().slice(0, 10),
      destinataires,
      module: moduleSelect,
    }, ...prev]);
    setTitre("");
    setContenu("");
    setShowForm(false);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
          <motion.div variants={item} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Annonces</h1>
              <p className="text-muted-foreground mt-1">Envoyez des annonces pédagogiques à vos étudiants.</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2" data-testid="button-new-annonce">
              <Plus className="w-4 h-4" />
              Nouvelle annonce
            </Button>
          </motion.div>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-primary/30 bg-primary/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  Nouvelle annonce
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Titre</label>
                    <Input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Objet de l'annonce" data-testid="input-titre-annonce" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <textarea
                      value={contenu}
                      onChange={(e) => setContenu(e.target.value)}
                      rows={4}
                      placeholder="Rédigez votre message..."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      data-testid="textarea-contenu-annonce"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Module</label>
                      <Select value={moduleSelect} onValueChange={setModuleSelect}>
                        <SelectTrigger data-testid="select-module-annonce">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {teacherModules.map((m) => <SelectItem key={m.id} value={m.intitule}>{m.intitule}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium mb-1 block">Destinataires</label>
                      <Select value={destinataires} onValueChange={setDestinataires}>
                        <SelectTrigger data-testid="select-destinataires">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tous">Tous les groupes</SelectItem>
                          <SelectItem value="Groupe 1">Groupe 1</SelectItem>
                          <SelectItem value="Groupe 2">Groupe 2</SelectItem>
                          <SelectItem value="Groupe 3">Groupe 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                    <Button onClick={handleSend} className="gap-2" data-testid="button-send-annonce">
                      <Send className="w-4 h-4" />
                      Envoyer
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div variants={item} className="space-y-4">
            {annonces.map((a) => (
              <Card key={a.id} className="p-5" data-testid={`annonce-${a.id}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{a.titre}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Clock className="w-3 h-3" />
                    {a.date}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{a.contenu}</p>
                <div className="flex gap-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">{a.module}</Badge>
                  <Badge variant="outline" className="text-xs">{a.destinataires}</Badge>
                </div>
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
