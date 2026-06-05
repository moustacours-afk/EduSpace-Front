import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldCheck, ShieldOff, Search, CheckCircle2, XCircle, Pencil, Loader2,
} from "lucide-react";
import { agent as api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface TeacherPerm {
  id: number;
  nom: string;
  prenom: string;
  grade: string;
  departement: string;
  peutSaisirCC: boolean;
  peutSaisirExamen: boolean;
  semestre: string | null;
  notesAdmin: string | null;
  grantedBy: string | null;
  grantedAt: string | null;
}

function PermBadge({ active, label }: { active: boolean; label: string }) {
  return active ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
      <CheckCircle2 className="w-3 h-3" /> {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      <XCircle className="w-3 h-3" /> {label}
    </span>
  );
}

export default function AgentPermissions() {
  const [teachers, setTeachers] = useState<TeacherPerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TeacherPerm | null>(null);
  const [form, setForm] = useState({ peutSaisirCC: false, peutSaisirExamen: false, semestre: "", notesAdmin: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  function load() {
    setLoading(true);
    api.permissions()
      .then((d) => setTeachers(d as TeacherPerm[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openEdit(t: TeacherPerm) {
    setEditing(t);
    setForm({
      peutSaisirCC: t.peutSaisirCC,
      peutSaisirExamen: t.peutSaisirExamen,
      semestre: t.semestre ?? "",
      notesAdmin: t.notesAdmin ?? "",
    });
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      await api.updatePermission(editing.id, {
        peutSaisirCC: form.peutSaisirCC,
        peutSaisirExamen: form.peutSaisirExamen,
        semestre: form.semestre || null,
        notesAdmin: form.notesAdmin || null,
      });
      toast({ title: "Permissions mises à jour", description: `Dr. ${editing.nom} — permissions sauvegardées.` });
      setEditing(null);
      load();
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour les permissions.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleRevoke(t: TeacherPerm) {
    try {
      await api.revokePermission(t.id);
      toast({ title: "Permissions révoquées", description: `Dr. ${t.nom} — toutes les permissions ont été retirées.` });
      load();
    } catch {
      toast({ title: "Erreur", description: "Impossible de révoquer les permissions.", variant: "destructive" });
    }
  }

  const filtered = teachers.filter((t) =>
    `${t.nom} ${t.prenom} ${t.departement}`.toLowerCase().includes(search.toLowerCase())
  );

  const withPerm = teachers.filter((t) => t.peutSaisirCC || t.peutSaisirExamen).length;
  const noPerm   = teachers.length - withPerm;

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-brand" />
              Permissions de saisie
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les autorisations de saisie de notes pour chaque enseignant (Contrôle Continu &amp; Examen).
            </p>
          </motion.div>

          {/* Summary */}
          <motion.div variants={item} className="grid grid-cols-3 gap-4">
            {[
              { label: "Enseignants", value: teachers.length, color: "text-foreground", bg: "bg-muted/40" },
              { label: "Avec permission", value: withPerm, color: "text-green-700", bg: "bg-green-50" },
              { label: "Sans permission", value: noPerm, color: "text-gray-600", bg: "bg-gray-50" },
            ].map((s) => (
              <Card key={s.label} className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-lg font-extrabold ${s.color}`}>{s.value}</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
              </Card>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div variants={item} className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un enseignant…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={item}>
            {loading ? (
              <Card className="p-12 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Enseignant</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Grade / Dept.</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Contrôle Continu</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Examen</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Semestre</th>
                        <th className="text-right px-5 py-3 font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-muted-foreground">
                            Aucun enseignant trouvé.
                          </td>
                        </tr>
                      )}
                      {filtered.map((t, i) => (
                        <motion.tr
                          key={t.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-semibold">Dr. {t.prenom} {t.nom}</p>
                            {t.grantedBy && (
                              <p className="text-xs text-muted-foreground mt-0.5">Accordé par {t.grantedBy} · {t.grantedAt}</p>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-muted-foreground">
                            <p>{t.grade}</p>
                            <p className="text-xs">{t.departement}</p>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <PermBadge active={t.peutSaisirCC} label="CC" />
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <PermBadge active={t.peutSaisirExamen} label="Examen" />
                          </td>
                          <td className="px-4 py-3.5 text-center text-muted-foreground text-xs">
                            {t.semestre ?? <span className="italic">Tous</span>}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => openEdit(t)}>
                                <Pencil className="w-3.5 h-3.5" />
                                Modifier
                              </Button>
                              {(t.peutSaisirCC || t.peutSaisirExamen) && (
                                <Button size="sm" variant="outline" className="gap-1.5 h-8 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300" onClick={() => handleRevoke(t)}>
                                  <ShieldOff className="w-3.5 h-3.5" />
                                  Révoquer
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </motion.div>

        </motion.div>
      </main>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand" />
              Permissions — Dr. {editing?.prenom} {editing?.nom}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "peutSaisirCC" as const, label: "Contrôle Continu (CC)", desc: "Autoriser la saisie des notes de CC et TP" },
                  { key: "peutSaisirExamen" as const, label: "Examen", desc: "Autoriser la saisie des notes d'examen" },
                ].map(({ key, label, desc }) => (
                  <label key={key} className={`flex flex-col gap-1.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none ${form[key] ? "border-brand bg-brand/5" : "border-border bg-card hover:bg-muted/30"}`}>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="sr-only" checked={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))} />
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${form[key] ? "bg-brand border-brand" : "border-border"}`}>
                        {form[key] && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-semibold">{label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">{desc}</p>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wide">Semestre (optionnel)</label>
                <Input
                  value={form.semestre}
                  onChange={(e) => setForm((f) => ({ ...f, semestre: e.target.value }))}
                  placeholder="Ex : S5, S6 — vide = tous les semestres"
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wide">Note administrative</label>
                <Input
                  value={form.notesAdmin}
                  onChange={(e) => setForm((f) => ({ ...f, notesAdmin: e.target.value }))}
                  placeholder="Remarque interne (optionnel)…"
                  className="text-sm"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
