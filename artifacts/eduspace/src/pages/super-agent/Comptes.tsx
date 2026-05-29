import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SuperAgentSidebar } from "@/components/SuperAgentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, X, Search, Eye, EyeOff, KeyRound, UserX, UserCheck } from "lucide-react";
import { superAgent as api } from "@/lib/api";

// ── Static hierarchical university data ───────────────────────────────────────
const UNIVERSITIES = [
  "USTHB — Université des Sciences et de la Technologie Houari Boumediene",
  "USDB — Université Saad Dahleb Blida",
  "ENP — École Nationale Polytechnique",
  "ENSET — École Normale Supérieure de l'Enseignement Technique",
  "USTO — Université des Sciences et de la Technologie d'Oran",
];

const FACULTIES_BY_UNIVERSITY: Record<string, string[]> = {
  "USTHB — Université des Sciences et de la Technologie Houari Boumediene": [
    "Faculté d'Informatique",
    "Faculté de Mathématiques",
    "Faculté de Physique",
    "Faculté de Chimie",
    "Faculté des Sciences Biologiques",
  ],
  "USDB — Université Saad Dahleb Blida": [
    "Faculté des Sciences",
    "Faculté de Technologie",
    "Faculté des Lettres et Sciences Humaines",
    "Faculté de Droit",
  ],
  "ENP — École Nationale Polytechnique": [
    "Département Informatique",
    "Département Électronique",
    "Département Génie Civil",
    "Département Génie Mécanique",
  ],
  "ENSET — École Normale Supérieure de l'Enseignement Technique": [
    "Département Informatique",
    "Département Génie Électrique",
    "Département Génie Mécanique",
  ],
  "USTO — Université des Sciences et de la Technologie d'Oran": [
    "Faculté d'Informatique",
    "Faculté des Mathématiques et Informatique",
    "Faculté de Physique",
    "Faculté de Chimie",
  ],
};

const DEPARTMENTS_BY_FACULTY: Record<string, string[]> = {
  "Faculté d'Informatique":            ["Informatique", "Réseaux & Télécoms", "Systèmes d'Information", "Sécurité Informatique"],
  "Faculté de Mathématiques":          ["Mathématiques Pures", "Statistiques", "Mathématiques Appliquées"],
  "Faculté de Physique":               ["Physique Théorique", "Physique Appliquée", "Optique"],
  "Faculté de Chimie":                 ["Chimie Organique", "Chimie Analytique", "Chimie Industrielle"],
  "Faculté des Sciences Biologiques":  ["Biologie Cellulaire", "Microbiologie", "Biochimie"],
  "Faculté des Sciences":              ["Informatique", "Mathématiques", "Physique", "Chimie"],
  "Faculté de Technologie":            ["Génie Civil", "Génie Électrique", "Génie Mécanique"],
  "Faculté des Lettres et Sciences Humaines": ["Linguistique", "Histoire", "Géographie"],
  "Faculté de Droit":                  ["Droit Public", "Droit Privé"],
  "Département Informatique":          ["Informatique Générale", "Génie Logiciel", "Réseaux"],
  "Département Électronique":          ["Électronique", "Micro-électronique"],
  "Département Génie Civil":           ["Structures", "Hydraulique"],
  "Département Génie Mécanique":       ["Mécanique des Fluides", "Thermodynamique"],
  "Département Génie Électrique":      ["Electrotechnique", "Automatique"],
  "Faculté des Mathématiques et Informatique": ["Mathématiques", "Informatique"],
};

function generateUsername(prenom: string, nom: string): string {
  const p = prenom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
  const n = nom.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
  if (!p && !n) return "";
  return (p[0] ?? "") + n + ".agent";
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface AgentRecord { id: number; nom: string; prenom: string; email: string; role: string; departement: string; statut: string; }

const EMPTY_FORM = { nom: "", prenom: "", motDePasse: "", universite: "", faculte: "", departement: "" };

export default function SuperAgentComptes() {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const computedUsername = generateUsername(form.prenom, form.nom);
  const faculties = form.universite ? (FACULTIES_BY_UNIVERSITY[form.universite] ?? []) : [];
  const departments = form.faculte ? (DEPARTMENTS_BY_FACULTY[form.faculte] ?? []) : [];

  // Reset faculty when university changes
  useEffect(() => {
    setForm(f => ({ ...f, faculte: "", departement: "" }));
  }, [form.universite]);
  // Reset department when faculty changes
  useEffect(() => {
    setForm(f => ({ ...f, departement: "" }));
  }, [form.faculte]);

  const refresh = useCallback(() => {
    api.agents().then((d) => setAgents(d as AgentRecord[])).catch(() => {});
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const filtered = agents.filter((a) =>
    `${a.nom} ${a.prenom} ${a.email} ${a.departement}`.toLowerCase().includes(search.toLowerCase())
  );

  function validate() {
    const e: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
    if (!form.nom.trim())    e.nom = "Nom requis";
    if (!form.prenom.trim()) e.prenom = "Prénom requis";
    if (form.motDePasse.length < 6) e.motDePasse = "Min. 6 caractères";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreate() {
    if (!validate()) return;
    setSaving(true);
    setSaveError("");
    try {
      await api.storeAgent({
        nom:         form.nom,
        prenom:      form.prenom,
        username:    computedUsername,
        password:    form.motDePasse,
        universite:  form.universite || undefined,
        faculte:     form.faculte || undefined,
        departement: form.departement || undefined,
      });
      refresh();
      setShowModal(false);
      setForm({ ...EMPTY_FORM });
      setErrors({});
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteAgent(id);
      refresh();
    } catch { /* ignore */ }
    setConfirmDelete(null);
  }

  async function handleToggleStatus(id: number, current: string) {
    const newStatut = current === "actif" ? "suspendu" : "actif";
    try {
      await api.toggleAgentStatus(id, newStatut);
      setAgents(prev => prev.map(a => a.id === id ? { ...a, statut: newStatut } : a));
    } catch { /* ignore */ }
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
                  <Users className="w-6 h-6 text-purple-600" />Comptes Agents
                </h1>
                <p className="text-muted-foreground mt-1">Créez et gérez les comptes des agents pédagogiques.</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2"
                onClick={() => { setShowModal(true); setForm({ ...EMPTY_FORM }); setErrors({}); setSaveError(""); }}>
                <Plus className="w-4 h-4" />Créer un agent
              </Button>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Rechercher par nom, email, département…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-muted-foreground">{filtered.length} agent{filtered.length !== 1 ? "s" : ""}</span>
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
                {filtered.map((agent) => (
                  <Card key={agent.id} className="p-4 flex items-center gap-4 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-purple-700 text-sm">
                        {agent.prenom[0]?.toUpperCase()}{agent.nom[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{agent.prenom} {agent.nom}</p>
                      <p className="text-xs text-muted-foreground font-mono">{agent.email}</p>
                      {agent.departement && (
                        <p className="text-xs text-muted-foreground">{agent.departement}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={agent.statut === "suspendu"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-green-100 text-green-700 border-green-200"}>
                        {agent.statut === "suspendu" ? "Suspendu" : "Actif"}
                      </Badge>
                      <Button size="sm" variant="outline"
                        title={agent.statut === "suspendu" ? "Réactiver" : "Suspendre"}
                        className={`h-8 px-2 ${agent.statut === "suspendu"
                          ? "text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                          : "text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50"}`}
                        onClick={() => handleToggleStatus(agent.id, agent.statut)}>
                        {agent.statut === "suspendu"
                          ? <UserCheck className="w-3.5 h-3.5" />
                          : <UserX className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="sm" variant="outline"
                        className="h-8 px-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
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
                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Prénom *</label>
                      <Input placeholder="ex: Mohammed" value={form.prenom}
                        onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} />
                      {errors.prenom && <p className="text-xs text-red-500 mt-0.5">{errors.prenom}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Nom *</label>
                      <Input placeholder="ex: Benali" value={form.nom}
                        onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} />
                      {errors.nom && <p className="text-xs text-red-500 mt-0.5">{errors.nom}</p>}
                    </div>
                  </div>

                  {/* Auto-generated username */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Nom d'utilisateur (généré automatiquement)
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30">
                      <span className="font-mono text-sm text-foreground flex-1">
                        {computedUsername || <span className="text-muted-foreground italic">Saisir le prénom et le nom…</span>}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Auto</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Format : première lettre du prénom + nom + .agent (ex: mbenali.agent)
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      <KeyRound className="inline w-3 h-3 mr-1" />Mot de passe *
                    </label>
                    <div className="relative">
                      <Input type={showPwd ? "text" : "password"} placeholder="Min. 6 caractères"
                        value={form.motDePasse}
                        onChange={(e) => setForm((f) => ({ ...f, motDePasse: e.target.value }))} className="pr-9" />
                      <button type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPwd((v) => !v)}>
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.motDePasse && <p className="text-xs text-red-500 mt-0.5">{errors.motDePasse}</p>}
                  </div>

                  {/* Hierarchical selects */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Université</label>
                    <Select value={form.universite} onValueChange={(v) => setForm(f => ({ ...f, universite: v, faculte: "", departement: "" }))}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Choisir une université…" /></SelectTrigger>
                      <SelectContent>
                        {UNIVERSITIES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Faculté</label>
                    <Select value={form.faculte} onValueChange={(v) => setForm(f => ({ ...f, faculte: v, departement: "" }))}
                      disabled={!form.universite || faculties.length === 0}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Choisir une faculté…" /></SelectTrigger>
                      <SelectContent>
                        {faculties.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Département</label>
                    <Select value={form.departement} onValueChange={(v) => setForm(f => ({ ...f, departement: v }))}
                      disabled={!form.faculte || departments.length === 0}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Choisir un département…" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {saveError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {saveError}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Annuler</Button>
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleCreate} disabled={saving}>
                    <Plus className="w-4 h-4 mr-1" />{saving ? "Création…" : "Créer le compte"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDelete !== null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 max-w-sm w-full">
                <h3 className="font-bold text-base mb-2">Supprimer ce compte ?</h3>
                <p className="text-sm text-muted-foreground mb-4">Cette action est irréversible.</p>
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
