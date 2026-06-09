import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SuperAgentSidebar } from "@/components/SuperAgentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Plus, Trash2, X, Search, Eye, EyeOff, KeyRound,
  UserX, UserCheck, Building2, Edit, RefreshCw, Copy, CheckCircle, GraduationCap, Filter, Landmark,
} from "lucide-react";
import { superAgent as api } from "@/lib/api";
import { getSuperAgentAccountType, getSuperAgentFaculte, getSuperAgentUniversite } from "@/lib/auth";
import { getFacultes, getDepartements } from "@/lib/superAgentStore";

// ── helpers ────────────────────────────────────────────────────────────────────
function slug(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
}
function usernamePreview(prenom: string, nom: string, suffix: string): string {
  const p = slug(prenom), n = slug(nom);
  if (!p && !n) return "";
  return (p[0] ?? "") + n + suffix;
}
function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%";
  const all = upper + lower + digits + special;
  const pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    ...Array.from({ length: 5 }, () => all[Math.floor(Math.random() * all.length)]),
  ];
  for (let i = pwd.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }
  return pwd.join("");
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface AgentRecord {
  id: number; nom: string; prenom: string; email: string;
  role: string; departement: string; statut: string; faculte?: string; universite?: string;
}
interface DoyenRecord {
  id: number; nom: string; prenom: string; email: string; faculte: string; statut: string;
}
type Created = { username: string; password: string; name: string };

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded hover:bg-muted/50 transition-colors" title="Copier">
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}

// Generated-credentials confirmation card (shared by both variants)
function CredsModal({ info, onClose }: { info: Created | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {info && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
            <Card className="p-6 w-full max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-base">Compte créé — {info.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Transmettez ces identifiants. Conservez-les en lieu sûr — le mot de passe ne sera pas réaffiché.
              </p>
              <div className="space-y-3">
                <div className="bg-muted/20 border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1.5">Nom d'utilisateur</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-sm">{info.username}</span>
                    <CopyButton text={info.username} />
                  </div>
                </div>
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                  <p className="text-xs text-violet-600 mb-1.5">Mot de passe</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xl tracking-widest text-violet-800">{info.password}</span>
                    <CopyButton text={info.password} />
                  </div>
                </div>
              </div>
              <Button className="w-full mt-5" onClick={onClose}>Fermer</Button>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ConfirmDelete({ open, title, onCancel, onConfirm }: { open: boolean; title: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
            <Card className="p-6 max-w-sm w-full">
              <h3 className="font-bold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4">Cette action est irréversible.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
                <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={onConfirm}>
                  <Trash2 className="w-4 h-4 mr-1" />Supprimer
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Password field with show/regenerate (shared)
function PasswordField({ value, show, onToggle, onRegen }: { value: string; show: boolean; onToggle: () => void; onRegen: () => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">
        <KeyRound className="inline w-3 h-3 mr-1" />Mot de passe (généré automatiquement)
      </label>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-200 bg-violet-50">
        <span className="font-mono text-lg font-bold tracking-widest text-violet-800 flex-1">{show ? value : "••••••••"}</span>
        <button type="button" className="text-muted-foreground hover:text-foreground" onClick={onToggle}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <CopyButton text={value} />
        <button type="button" title="Régénérer" className="text-violet-600 hover:text-violet-800" onClick={onRegen}>
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Dispatcher ─────────────────────────────────────────────────────────────────
export default function SuperAgentComptes() {
  return getSuperAgentAccountType() === "doyen" ? <DoyenComptes /> : <DirectorComptes />;
}

// ════════════════════════════════════════════════════════════════════════════════
// DOYEN — manages the agents of their own faculté (faculté fixed, choose département)
// ════════════════════════════════════════════════════════════════════════════════
function DoyenComptes() {
  const faculte    = getSuperAgentFaculte();
  const universite = getSuperAgentUniversite();
  const departments = useMemo(() => getDepartements(faculte), [faculte]);

  const [agents, setAgents]   = useState<AgentRecord[]>([]);
  const [search, setSearch]   = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [generatedPwd, setGeneratedPwd] = useState("");
  const [form, setForm]       = useState({ nom: "", prenom: "", departement: "" });
  const [errors, setErrors]   = useState<{ nom?: string; prenom?: string }>({});
  const [saving, setSaving]   = useState(false);
  const [saveError, setSaveError] = useState("");
  const [createdInfo, setCreatedInfo] = useState<Created | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing]   = useState<AgentRecord | null>(null);
  const [editForm, setEditForm] = useState({ nom: "", prenom: "", departement: "" });
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [viewCredsAgent, setViewCredsAgent] = useState<AgentRecord | null>(null);

  const refresh = useCallback(() => { api.agents().then(d => setAgents(d as AgentRecord[])).catch(() => {}); }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const username = usernamePreview(form.prenom, form.nom, ".agent");
  const filtered = agents.filter(a => `${a.nom} ${a.prenom} ${a.email} ${a.departement}`.toLowerCase().includes(search.toLowerCase()));

  function openCreate() {
    setGeneratedPwd(generatePassword());
    setForm({ nom: "", prenom: "", departement: "" });
    setErrors({}); setSaveError(""); setShowPwd(false); setShowModal(true);
  }

  async function handleCreate() {
    const e: typeof errors = {};
    if (!form.nom.trim()) e.nom = "Nom requis";
    if (!form.prenom.trim()) e.prenom = "Prénom requis";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setSaveError("");
    try {
      await api.storeAgent({
        nom: form.nom, prenom: form.prenom, username, password: generatedPwd,
        departement: form.departement || undefined,
        // faculté/université are forced server-side from the doyen's account
      });
      localStorage.setItem(`agentPwd_${username}`, generatedPwd);
      refresh();
      setShowModal(false);
      setCreatedInfo({ username, password: generatedPwd, name: `${form.prenom} ${form.nom}` });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally { setSaving(false); }
  }

  function openEdit(a: AgentRecord) {
    setEditing(a);
    setEditForm({ nom: a.nom, prenom: a.prenom, departement: a.departement ?? "" });
    setEditError(""); setShowEdit(true);
  }
  async function saveEdit() {
    if (!editing) return;
    if (!editForm.nom.trim() || !editForm.prenom.trim()) { setEditError("Nom et prénom requis."); return; }
    setEditSaving(true); setEditError("");
    try {
      await api.updateAgent(editing.id, { nom: editForm.nom, prenom: editForm.prenom, departement: editForm.departement || undefined });
      setAgents(prev => prev.map(a => a.id === editing.id ? { ...a, ...editForm } : a));
      setShowEdit(false); setEditing(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Erreur lors de la modification.");
    } finally { setEditSaving(false); }
  }
  async function toggleStatus(id: number, current: string) {
    const next = current === "actif" ? "suspendu" : "actif";
    try { await api.toggleAgentStatus(id, next); setAgents(prev => prev.map(a => a.id === id ? { ...a, statut: next } : a)); } catch { /* ignore */ }
  }
  async function remove(id: number) {
    try { await api.deleteAgent(id); refresh(); } catch { /* ignore */ }
    setConfirmDelete(null);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SuperAgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-purple-600" />Comptes Agents</h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />{faculte || "Faculté non définie"}
                </p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={openCreate}>
                <Plus className="w-4 h-4" />Créer un agent
              </Button>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Rechercher par nom, email, département…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </motion.div>

          <motion.div variants={item}>
            <p className="text-sm text-muted-foreground mb-2">{filtered.length} agent{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{agents.length === 0 ? "Aucun agent. Cliquez sur « Créer un agent »." : "Aucun résultat."}</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {filtered.map(agent => (
                  <Card key={agent.id} className="p-4 flex items-center gap-4 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-purple-700 text-sm">{agent.prenom[0]?.toUpperCase()}{agent.nom[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{agent.prenom} {agent.nom}</p>
                      <p className="text-xs text-muted-foreground font-mono">{agent.email}</p>
                      {agent.departement && <p className="text-xs text-muted-foreground">{agent.departement}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={agent.statut === "suspendu" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200"}>
                        {agent.statut === "suspendu" ? "Suspendu" : "Actif"}
                      </Badge>
                      <Button size="sm" variant="outline" title="Identifiants" className="h-8 px-2 text-violet-600 border-violet-200 hover:bg-violet-50" onClick={() => setViewCredsAgent(agent)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" title="Modifier" className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => openEdit(agent)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" title={agent.statut === "suspendu" ? "Réactiver" : "Suspendre"}
                        className={`h-8 px-2 ${agent.statut === "suspendu" ? "text-blue-600 border-blue-200 hover:bg-blue-50" : "text-amber-600 border-amber-200 hover:bg-amber-50"}`}
                        onClick={() => toggleStatus(agent.id, agent.statut)}>
                        {agent.statut === "suspendu" ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirmDelete(agent.id)}>
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

      {/* Create agent modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg flex items-center gap-2"><Plus className="w-5 h-5 text-purple-600" />Créer un agent pédagogique</h2>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowModal(false)}><X className="w-4 h-4" /></Button>
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
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Nom d'utilisateur (généré)</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30">
                      <span className="font-mono text-sm flex-1">{username || <span className="text-muted-foreground italic">Saisir le prénom et le nom…</span>}</span>
                      {username && <CopyButton text={username} />}
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Auto</span>
                    </div>
                  </div>
                  <PasswordField value={generatedPwd} show={showPwd} onToggle={() => setShowPwd(v => !v)} onRegen={() => setGeneratedPwd(generatePassword())} />

                  {/* Faculté fixed from the doyen's account */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1"><Building2 className="inline w-3 h-3 mr-1" />Faculté (votre rattachement)</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm">
                      <span className="flex-1 truncate">{faculte || "—"}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Fixe</span>
                    </div>
                    {universite && <p className="text-[11px] text-muted-foreground mt-1">{universite}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Département</label>
                    <Select value={form.departement} onValueChange={v => setForm(f => ({ ...f, departement: v }))} disabled={departments.length === 0}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Choisir un département…" /></SelectTrigger>
                      <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  {saveError && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{saveError}</div>}
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

      {/* Edit agent modal */}
      <AnimatePresence>
        {showEdit && editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg flex items-center gap-2"><Edit className="w-5 h-5 text-blue-600" />Modifier l'agent</h2>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowEdit(false)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Prénom *</label>
                      <Input value={editForm.prenom} onChange={e => setEditForm(f => ({ ...f, prenom: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Nom *</label>
                      <Input value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Département</label>
                    <Select value={editForm.departement} onValueChange={v => setEditForm(f => ({ ...f, departement: v }))} disabled={departments.length === 0}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Choisir un département…" /></SelectTrigger>
                      <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {editError && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{editError}</div>}
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setShowEdit(false)}>Annuler</Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={saveEdit} disabled={editSaving}>{editSaving ? "Enregistrement…" : "Enregistrer"}</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CredsModal info={createdInfo} onClose={() => setCreatedInfo(null)} />
      <ConfirmDelete open={confirmDelete !== null} title="Supprimer ce compte ?" onCancel={() => setConfirmDelete(null)} onConfirm={() => confirmDelete !== null && remove(confirmDelete)} />

      {/* View agent credentials modal */}
      <AnimatePresence>
        {viewCredsAgent && (() => {
          const agentUsername = viewCredsAgent.email.split("@")[0];
          const storedPwd = localStorage.getItem(`agentPwd_${agentUsername}`) ?? "—";
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <Card className="p-6 w-full max-w-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound className="w-5 h-5 text-violet-600" />
                    <h3 className="font-bold text-base">Identifiants — {viewCredsAgent.prenom} {viewCredsAgent.nom}</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-muted/20 border border-border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1.5">Nom d'utilisateur</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-sm">{agentUsername}</span>
                        <CopyButton text={agentUsername} />
                      </div>
                    </div>
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                      <p className="text-xs text-violet-600 mb-1.5">Mot de passe initial</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xl tracking-widest text-violet-800">{storedPwd}</span>
                        {storedPwd !== "—" && <CopyButton text={storedPwd} />}
                      </div>
                      {storedPwd === "—" && <p className="text-xs text-muted-foreground mt-1">Mot de passe non disponible (compte créé hors session).</p>}
                    </div>
                  </div>
                  <Button className="w-full mt-5" onClick={() => setViewCredsAgent(null)}>Fermer</Button>
                </Card>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// DIRECTOR — manages Doyen (faculty) accounts + a filterable overview of all agents
// ════════════════════════════════════════════════════════════════════════════════
function DirectorComptes() {
  const universite = getSuperAgentUniversite();

  const [doyens, setDoyens] = useState<DoyenRecord[]>([]);
  const [agents, setAgents] = useState<AgentRecord[]>([]);

  // Faculté options: store list for this université + any faculté already in use
  // (the seeded université string may not match the store key, so merge real data).
  const faculties = useMemo(() => {
    const fromStore = universite ? getFacultes(universite) : [];
    const fromData  = [...doyens.map(d => d.faculte), ...agents.map(a => a.faculte ?? "")].filter(Boolean) as string[];
    return [...new Set([...fromStore, ...fromData])].sort();
  }, [universite, doyens, agents]);

  // Create doyen
  const [showModal, setShowModal] = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const [generatedPwd, setGeneratedPwd] = useState("");
  const [form, setForm]   = useState({ nom: "", prenom: "", faculte: "" });
  const [errors, setErrors] = useState<{ nom?: string; prenom?: string; faculte?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [createdInfo, setCreatedInfo] = useState<Created | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // Edit doyen
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing]   = useState<DoyenRecord | null>(null);
  const [editForm, setEditForm] = useState({ nom: "", prenom: "", faculte: "", email: "", newPassword: "" });
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Agents overview filters
  const [filterFaculte, setFilterFaculte] = useState("all");
  const [filterDept, setFilterDept]       = useState("all");
  const [searchAgent, setSearchAgent]     = useState("");

  const refresh = useCallback(() => {
    api.doyens().then(d => setDoyens(d as DoyenRecord[])).catch(() => {});
    api.agents().then(d => setAgents(d as AgentRecord[])).catch(() => {});
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const username = usernamePreview(form.prenom, form.nom, ".doyen");

  // Data-driven filter options (guaranteed to match the data)
  const agentFaculties = useMemo(() => [...new Set(agents.map(a => a.faculte).filter(Boolean) as string[])].sort(), [agents]);
  const agentDepts = useMemo(() => {
    const pool = filterFaculte === "all" ? agents : agents.filter(a => a.faculte === filterFaculte);
    return [...new Set(pool.map(a => a.departement).filter(Boolean))].sort();
  }, [agents, filterFaculte]);

  const filteredAgents = agents.filter(a => {
    if (filterFaculte !== "all" && a.faculte !== filterFaculte) return false;
    if (filterDept !== "all" && a.departement !== filterDept) return false;
    return `${a.nom} ${a.prenom} ${a.email} ${a.departement}`.toLowerCase().includes(searchAgent.toLowerCase());
  });

  function openCreate() {
    setGeneratedPwd(generatePassword());
    setForm({ nom: "", prenom: "", faculte: "" });
    setErrors({}); setSaveError(""); setShowPwd(false); setShowModal(true);
  }
  async function handleCreate() {
    const e: typeof errors = {};
    if (!form.nom.trim()) e.nom = "Nom requis";
    if (!form.prenom.trim()) e.prenom = "Prénom requis";
    if (!form.faculte) e.faculte = "Faculté requise";
    else if (doyens.some(d => d.faculte === form.faculte)) {
      e.faculte = "Un compte doyen existe déjà pour cette faculté.";
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true); setSaveError("");
    try {
      await api.storeDoyen({ nom: form.nom, prenom: form.prenom, username, password: generatedPwd, faculte: form.faculte });
      refresh();
      setShowModal(false);
      setCreatedInfo({ username, password: generatedPwd, name: `${form.prenom} ${form.nom}` });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally { setSaving(false); }
  }

  function openEdit(d: DoyenRecord) {
    setEditing(d);
    setEditForm({ nom: d.nom, prenom: d.prenom, faculte: d.faculte ?? "", email: d.email ?? "", newPassword: "" });
    setEditError(""); setShowEdit(true);
  }
  async function saveEdit() {
    if (!editing) return;
    if (!editForm.nom.trim() || !editForm.prenom.trim()) { setEditError("Nom et prénom requis."); return; }
    setEditSaving(true); setEditError("");
    const updateBody: Record<string, unknown> = { nom: editForm.nom, prenom: editForm.prenom, faculte: editForm.faculte || undefined };
    if (editForm.email) updateBody.email = editForm.email;
    if (editForm.newPassword) updateBody.password = editForm.newPassword;
    try {
      await api.updateDoyen(editing.id, updateBody);
      setDoyens(prev => prev.map(d => d.id === editing.id ? { ...d, nom: editForm.nom, prenom: editForm.prenom, faculte: editForm.faculte, email: editForm.email || d.email } : d));
      setShowEdit(false); setEditing(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Erreur lors de la modification.");
    } finally { setEditSaving(false); }
  }
  async function toggleStatus(id: number, current: string) {
    const next = current === "actif" ? "suspendu" : "actif";
    try { await api.toggleDoyenStatus(id, next); setDoyens(prev => prev.map(d => d.id === id ? { ...d, statut: next } : d)); } catch { /* ignore */ }
  }
  async function remove(id: number) {
    try { await api.deleteDoyen(id); refresh(); } catch { /* ignore */ }
    setConfirmDelete(null);
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SuperAgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Landmark className="w-6 h-6 text-purple-600" />Comptes de faculté</h1>
                <p className="text-muted-foreground mt-1">Créez les doyens des facultés et consultez tous les agents de l'université.</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700 gap-2" onClick={openCreate}>
                <Plus className="w-4 h-4" />Créer un compte faculté (Doyen)
              </Button>
            </div>
          </motion.div>

          {/* ── Doyens list ── */}
          <motion.div variants={item}>
            <h2 className="text-base font-semibold mb-2 flex items-center gap-2"><Landmark className="w-4 h-4 text-purple-600" />Doyens (comptes de faculté)
              <Badge variant="outline" className="ml-1">{doyens.length}</Badge>
            </h2>
            {doyens.length === 0 ? (
              <Card className="p-10 text-center">
                <Landmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun doyen. Créez le premier compte de faculté.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {doyens.map(d => (
                  <Card key={d.id} className="p-4 flex items-center gap-4 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-purple-700 text-sm">{d.prenom[0]?.toUpperCase()}{d.nom[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{d.prenom} {d.nom}</p>
                      <p className="text-xs text-muted-foreground font-mono">{d.email}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" />{d.faculte}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={d.statut === "suspendu" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200"}>
                        {d.statut === "suspendu" ? "Suspendu" : "Actif"}
                      </Badge>
                      <Button size="sm" variant="outline" title="Modifier" className="h-8 px-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => openEdit(d)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" title={d.statut === "suspendu" ? "Réactiver" : "Suspendre"}
                        className={`h-8 px-2 ${d.statut === "suspendu" ? "text-blue-600 border-blue-200 hover:bg-blue-50" : "text-amber-600 border-amber-200 hover:bg-amber-50"}`}
                        onClick={() => toggleStatus(d.id, d.statut)}>
                        {d.statut === "suspendu" ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirmDelete(d.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── All agents overview ── */}
          <motion.div variants={item}>
            <h2 className="text-base font-semibold mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" />Tous les agents de l'université
              <Badge variant="outline" className="ml-1">{agents.length}</Badge>
            </h2>
            <Card className="p-4 mb-3">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={searchAgent} onChange={e => setSearchAgent(e.target.value)} placeholder="Nom, email, département…" className="pl-8 h-9 text-sm" />
                </div>
                <Select value={filterFaculte} onValueChange={v => { setFilterFaculte(v); setFilterDept("all"); }}>
                  <SelectTrigger className="w-[230px] h-9 text-sm"><Filter className="w-3.5 h-3.5 mr-1" /><SelectValue placeholder="Faculté" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes facultés</SelectItem>
                    {agentFaculties.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger className="w-[200px] h-9 text-sm"><SelectValue placeholder="Département" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous départements</SelectItem>
                    {agentDepts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" onClick={() => { setFilterFaculte("all"); setFilterDept("all"); setSearchAgent(""); }}>Réinitialiser</Button>
              </div>
            </Card>

            {filteredAgents.length === 0 ? (
              <Card className="p-10 text-center"><Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">Aucun agent pour ce filtre.</p></Card>
            ) : (
              <div className="space-y-2">
                {filteredAgents.map(a => (
                  <Card key={a.id} className="p-3 flex items-center gap-3 flex-wrap">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-blue-700 text-xs">{a.prenom[0]?.toUpperCase()}{a.nom[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{a.prenom} {a.nom}</p>
                      <p className="text-xs text-muted-foreground font-mono">{a.email}</p>
                    </div>
                    {a.departement && <Badge variant="outline" className="text-xs">{a.departement}</Badge>}
                    {a.faculte && <Badge variant="outline" className="text-xs text-purple-600 hidden sm:inline-flex">{a.faculte}</Badge>}
                    <Badge className={a.statut === "suspendu" ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-green-100 text-green-700 border-green-200"}>
                      {a.statut === "suspendu" ? "Suspendu" : "Actif"}
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* Create doyen modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg flex items-center gap-2"><Landmark className="w-5 h-5 text-purple-600" />Créer un compte de faculté (Doyen)</h2>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowModal(false)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Prénom *</label>
                      <Input placeholder="ex: Yacine" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
                      {errors.prenom && <p className="text-xs text-red-500 mt-0.5">{errors.prenom}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Nom *</label>
                      <Input placeholder="ex: Cherif" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                      {errors.nom && <p className="text-xs text-red-500 mt-0.5">{errors.nom}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Nom d'utilisateur (généré)</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30">
                      <span className="font-mono text-sm flex-1">{username || <span className="text-muted-foreground italic">Saisir le prénom et le nom…</span>}</span>
                      {username && <CopyButton text={username} />}
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Auto</span>
                    </div>
                  </div>
                  <PasswordField value={generatedPwd} show={showPwd} onToggle={() => setShowPwd(v => !v)} onRegen={() => setGeneratedPwd(generatePassword())} />

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1"><Building2 className="inline w-3 h-3 mr-1" />Faculté *</label>
                    <Select value={form.faculte} onValueChange={v => setForm(f => ({ ...f, faculte: v }))} disabled={faculties.length === 0}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Choisir une faculté…" /></SelectTrigger>
                      <SelectContent className="max-h-60">{faculties.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.faculte && <p className="text-xs text-red-500 mt-0.5">{errors.faculte}</p>}
                    {universite && <p className="text-[11px] text-muted-foreground mt-1">{universite}</p>}
                  </div>

                  {saveError && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{saveError}</div>}
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

      {/* Edit doyen modal */}
      <AnimatePresence>
        {showEdit && editing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg flex items-center gap-2"><Edit className="w-5 h-5 text-blue-600" />Modifier le doyen</h2>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowEdit(false)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Prénom *</label>
                      <Input value={editForm.prenom} onChange={e => setEditForm(f => ({ ...f, prenom: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Nom *</label>
                      <Input value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1"><Building2 className="inline w-3 h-3 mr-1" />Faculté</label>
                    <Select value={editForm.faculte} onValueChange={v => setEditForm(f => ({ ...f, faculte: v }))} disabled={faculties.length === 0}>
                      <SelectTrigger className="text-sm"><SelectValue placeholder="Choisir une faculté…" /></SelectTrigger>
                      <SelectContent className="max-h-60">{faculties.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                    <Input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="doyen@univ.dz" className="text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Nouveau mot de passe <span className="text-muted-foreground/60">(optionnel)</span></label>
                    <Input value={editForm.newPassword} onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))} type="password" placeholder="Laisser vide pour conserver l'actuel" className="text-sm" />
                  </div>
                  {editError && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{editError}</div>}
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setShowEdit(false)}>Annuler</Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={saveEdit} disabled={editSaving}>{editSaving ? "Enregistrement…" : "Enregistrer"}</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CredsModal info={createdInfo} onClose={() => setCreatedInfo(null)} />
      <ConfirmDelete open={confirmDelete !== null} title="Supprimer ce compte de faculté ?" onCancel={() => setConfirmDelete(null)} onConfirm={() => confirmDelete !== null && remove(confirmDelete)} />
    </div>
  );
}
