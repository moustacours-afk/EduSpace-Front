import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Send, Plus, Clock, Loader2 } from "lucide-react";
import { enseignant as api } from "@/lib/api";

interface AnnonceRow {
  id: number;
  titre: string;
  contenu: string;
  categorie: string | null;
  date_publication: string;
  audience: string;
}

interface ModuleRow { id: number; intitule: string; }

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function EnseignantAnnonces() {
  const [annonces, setAnnonces] = useState<AnnonceRow[]>([]);
  const [myModules, setMyModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm]   = useState(false);
  const [titre, setTitre]         = useState("");
  const [contenu, setContenu]     = useState("");
  const [moduleSelect, setModuleSelect] = useState("");
  const [sending, setSending]     = useState(false);
  const [sendError, setSendError] = useState("");

  const fetchAnnonces = useCallback(async () => {
    try {
      const data = await api.annonces() as AnnonceRow[];
      setAnnonces(data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAnnonces();
    api.modules().then(data => {
      const mods = (data as Record<string, unknown>[]).map(m => ({
        id: Number(m.id), intitule: String(m.intitule ?? ""),
      }));
      setMyModules(mods);
      if (mods.length > 0) setModuleSelect(mods[0].intitule);
    }).catch(() => {});
  }, [fetchAnnonces]);

  async function handleSend() {
    if (!titre.trim() || !contenu.trim()) return;
    setSending(true);
    setSendError("");
    try {
      const created = await api.storeAnnonce({
        titre,
        contenu,
        categorie: moduleSelect || "Pédagogique",
      }) as AnnonceRow;

      // Optimistic update: show immediately without waiting for re-fetch
      setAnnonces(prev => [created, ...prev]);

      setTitre("");
      setContenu("");
      setShowForm(false);

      // Sync from server in background to get the authoritative list
      fetchAnnonces();
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
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
            <Button onClick={() => { setShowForm(!showForm); setSendError(""); }} className="gap-2">
              <Plus className="w-4 h-4" />Nouvelle annonce
            </Button>
          </motion.div>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-primary/30 bg-primary/5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" />Nouvelle annonce
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Titre</label>
                    <Input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Objet de l'annonce" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <textarea value={contenu} onChange={e => setContenu(e.target.value)} rows={4}
                      placeholder="Rédigez votre message..."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Module concerné</label>
                    <Select value={moduleSelect} onValueChange={setModuleSelect}>
                      <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Général">Général</SelectItem>
                        {myModules.map(m => <SelectItem key={m.id} value={m.intitule}>{m.intitule}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {sendError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{sendError}</div>
                  )}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
                    <Button onClick={handleSend} disabled={sending || !titre.trim() || !contenu.trim()} className="gap-2">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {sending ? "Envoi…" : "Envoyer"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div variants={item} className="space-y-4">
            {loading ? (
              <Card className="p-8 text-center text-muted-foreground text-sm">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement…
              </Card>
            ) : annonces.length === 0 ? (
              <Card className="p-10 text-center text-muted-foreground text-sm">Aucune annonce.</Card>
            ) : annonces.map(a => (
              <Card key={a.id} className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{a.titre}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Clock className="w-3 h-3" />{a.date_publication}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{a.contenu}</p>
                {a.categorie && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">{a.categorie}</Badge>
                )}
              </Card>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
