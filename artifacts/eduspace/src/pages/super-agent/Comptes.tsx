import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SuperAgentSidebar } from "@/components/SuperAgentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Plus, Trash2, X, Search, UserCheck, UserX,
  Eye, EyeOff, KeyRound,
} from "lucide-react";
import {
  getAgents, createAgent, deleteAgent, toggleAgentActive,
  WILAYAS, type AgentAccount,
} from "@/lib/superAgentStore";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const EMPTY_FORM = { nom: "", prenom: "", email: "", motDePasse: "", wilaya: "", etablissement: "", active: true };

export default function SuperAgentComptes() {
  const [agents, setAgents] = useState<AgentAccount[]>(() => getAgents());
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const refresh = useCallback(() => setAgents(getAgents()), []);

  const filtered = agents.filter(a =>
    `${a.nom} ${a.prenom} ${a.email} ${a.wilaya}`.toLowerCase().includes(search.toLowerCase())
  );

  function validate() {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.nom.trim())     e.nom          = "Nom requis";
    if (!form.prenom.trim())  e.prenom       = "Prénom requis";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Email valide requis";
    if (form.motDePasse.length < 6) e.motDePasse = "Min. 6 caractères";
    if (!form.wilaya)         e.wilaya       = "Wilaya requise";
    if (!form.etablissement.trim()) e.etablissement = "Établissement requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCreate() {
    if (!validate()) return;
    createAgent(form);
    refresh();
    setShowModal(false);
    setForm({ ...EMPTY_FORM });
    setErrors({});
  }

  function handleDelete(id: string) {
    deleteAgent(id);
    refresh();
    setConfirmDelete(null);
  }

  function handleToggle(id: string) {
    toggleAgentActive(id);
    refresh();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SuperAgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  Comptes Agents
                </h1>
                <p className="text-muted-foreground mt-1">Créez et gérez les comptes des agents pédagogiques.</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={() => { setShowModal(true); setForm({ ...EMPTY_FORM }); setErrors({}); }}>
                <Plus className="w-4 h-4" />Créer un agent
              </Button>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Rechercher par nom, email, wilaya…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-muted-foreground">{filtered.length} agent{filtered.length !== 1 ? "s" : ""}</span>
              <Badge variant="outline" className="text-green-700 border-green-300">{agents.filter(a => a.active).length} actifs</Badge>
              <Badge variant="outline" className="text-red-700 border-red-300">{agents.filter(a => !a.active).length} inactifs</Badge>
            </div>

            {filtered.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {agents.length === 0 ? "Aucun agent créé. Cliquez sur « Créer un agent » pour commencer." : "Aucun résultat pour cette recherche."}
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map(agent => (
                  <Card key={agent.id} className="p-4 flex items-center gap-4 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-purple-700 text-sm">
                        {agent.prenom[0]?.toUpperCase()}{agent.nom[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{agent.prenom} {agent.nom}</p>
                      <p className="text-xs text-muted-foreground">{agent.email}</p>
                      <p className="text-xs text-muted-foreground">{agent.wilaya} — {agent.etablissement}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={agent.active ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                        {agent.active ? "Actif" : "Inactif"}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {new Date(agent.createdAt).toLocaleDateString("fr-DZ")}
                      </span>
                      <Button size="sm" variant="outline" className="h-8 px-2 gap-1 text-xs" onClick={() => handleToggle(agent.id)}
                        title={agent.active ? "Désactiver" : "Activer"}>
                        {agent.active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        {agent.active ? "Désactiver" : "Activer"}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => setConfirmDelete(agent.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

        </motion.div>
      </main>

      {/* Create modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5 text-purple-600" />Créer un agent pédagogique
                  </h2>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Prénom *</label>
                      <Input placeholder="ex: Mohammed" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
                      {errors.prenom && <p className="text-xs text-red-500 mt-0.5">{errors.prenom}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Nom *</label>
                      <Input placeholder="ex: Benali" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                      {errors.nom && <p className="text-xs text-red-500 mt-0.5">{errors.nom}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Adresse email *</label>
                    <Input type="email" placeholder="ex: m.benali@univ.dz" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      <KeyRound className="inline w-3 h-3 mr-1" />Mot de passe *
                    </label>
                    <div className="relative">
                      <Input type={showPwd ? "text" : "password"} placeholder="Min. 6 caractères" value={form.motDePasse}
                        onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))} className="pr-9" />
                      <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPwd(v => !v)}>
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.motDePasse && <p className="text-xs text-red-500 mt-0.5">{errors.motDePasse}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Wilaya *</label>
                    <Select value={form.wilaya} onValueChange={v => setForm(f => ({ ...f, wilaya: v }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner une wilaya" /></SelectTrigger>
                      <SelectContent className="max-h-52">
                        {WILAYAS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.wilaya && <p className="text-xs text-red-500 mt-0.5">{errors.wilaya}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Établissement *</label>
                    <Input placeholder="ex: Université des Sciences d'Alger" value={form.etablissement}
                      onChange={e => setForm(f => ({ ...f, etablissement: e.target.value }))} />
                    {errors.etablissement && <p className="text-xs text-red-500 mt-0.5">{errors.etablissement}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="active-check" checked={form.active}
                      onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-purple-600" />
                    <label htmlFor="active-check" className="text-sm">Compte actif dès la création</label>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Annuler</Button>
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-1" />Créer le compte
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 max-w-sm w-full">
                <h3 className="font-bold text-base mb-2">Supprimer ce compte ?</h3>
                <p className="text-sm text-muted-foreground mb-4">Cette action est irréversible. Le compte agent sera définitivement supprimé.</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Annuler</Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleDelete(confirmDelete)}>
                    <Trash2 className="w-4 h-4 mr-1" />Supprimer
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
