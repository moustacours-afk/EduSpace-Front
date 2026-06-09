import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SuperAgentSidebar } from "@/components/SuperAgentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Trash2, GraduationCap, ChevronRight, Building2, Edit2, Printer, Search, X, ArrowRightLeft } from "lucide-react";
import AjoutModule, { type EditModuleData } from "./AjoutModule";
import {
  getFacultes, getDepartements, getSpecialites,
  NIVEAUX_LIST, SEMESTRES_PAR_NIVEAU,
} from "@/lib/superAgentStore";
import { superAgent as api } from "@/lib/api";
import { getUser, getSuperAgentAccountType, getSuperAgentFaculte } from "@/lib/auth";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface ModuleEntry {
  id: number; intitule: string; code: string; credits: number;
  semestre: string; filiere: string; niveau: string; type_ue?: string;
  nature?: string; coefficient?: number; vhs?: number;
  has_cours?: boolean; duree_cours?: string;
  has_td?: boolean; duree_td?: string;
  has_tp?: boolean; duree_tp?: string;
  pct_examen?: number; pct_td?: number; pct_tp?: number;
}

// ─── canevas helpers ────────────────────────────────────────────────────────────
// Parse "1h30" / "3h" / "2h00" → minutes
function dureeToMin(d?: string): number {
  if (!d) return 0;
  const m = d.match(/(\d+)\s*h\s*(\d*)/i);
  if (!m) return 0;
  return parseInt(m[1], 10) * 60 + (m[2] ? parseInt(m[2], 10) : 0);
}
// minutes → "4h30" / "6h" / "" when zero
function minToDuree(min: number): string {
  if (!min) return "";
  const h = Math.floor(min / 60), mm = min % 60;
  return mm ? `${h}h${String(mm).padStart(2, "0")}` : `${h}h`;
}
// UE group key from a module code: "UEF111" → "UEF11" (falls back to type_ue)
function ueGroupOf(m: ModuleEntry): string {
  const code = (m.code || "").toUpperCase();
  const match = code.match(/^([A-Z]{2,4}\d{2})\d$/);
  return match ? match[1] : (m.type_ue || "UE");
}

// Next free code inside a UE group, e.g. group "UEF11" + 2 existing courses → "UEF113"
function nextCodeInGroup(groupKey: string, list: ModuleEntry[]): { type_ue: string; code: string } {
  const mm = groupKey.match(/^([A-Z]{2,4})(\d)(\d)$/);
  if (!mm) return { type_ue: list[0]?.type_ue || "UEF", code: "" };
  const [, type] = mm;
  let maxOrder = 0;
  const re = new RegExp(`^${groupKey}(\\d)$`);
  for (const m of list) {
    const cm = (m.code || "").toUpperCase().match(re);
    if (cm) maxOrder = Math.max(maxOrder, parseInt(cm[1], 10));
  }
  return { type_ue: type, code: `${groupKey}${maxOrder + 1}` };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// Open a print-ready window with the official canevas table for a scope.
function printCanevas(mods: ModuleEntry[], title: string, subtitle: string) {
  if (mods.length === 0) return;
  const ueMap = new Map<string, ModuleEntry[]>();
  for (const m of mods) { const g = ueGroupOf(m); (ueMap.get(g) ?? ueMap.set(g, []).get(g)!).push(m); }
  const ueGroups = [...ueMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const tot = mods.reduce((a, m) => ({
    vhs: a.vhs + (m.vhs ?? 0),
    c: a.c + (m.has_cours ? dureeToMin(m.duree_cours) : 0),
    td: a.td + (m.has_td ? dureeToMin(m.duree_td) : 0),
    tp: a.tp + (m.has_tp ? dureeToMin(m.duree_tp) : 0),
    coeff: a.coeff + (m.coefficient ?? 0),
    credits: a.credits + (m.credits ?? 0),
  }), { vhs: 0, c: 0, td: 0, tp: 0, coeff: 0, credits: 0 });

  const body = ueGroups.map(([ue, list]) => {
    const agg = list.reduce((a, m) => ({
      c: a.c + (m.has_cours ? dureeToMin(m.duree_cours) : 0),
      td: a.td + (m.has_td ? dureeToMin(m.duree_td) : 0),
      tp: a.tp + (m.has_tp ? dureeToMin(m.duree_tp) : 0),
      coeff: a.coeff + (m.coefficient ?? 0),
      credits: a.credits + (m.credits ?? 0),
    }), { c: 0, td: 0, tp: 0, coeff: 0, credits: 0 });
    const ueRow = `<tr class="ue"><td class="l">${ue} (O/P)</td><td></td><td>${minToDuree(agg.c) || "—"}</td><td>${minToDuree(agg.td) || "—"}</td><td>${minToDuree(agg.tp) || "—"}</td><td>—</td><td>${agg.coeff}</td><td>${agg.credits}</td><td></td><td></td></tr>`;
    const modRows = list.map(m => {
      const cont = (m.pct_td ?? 0) + (m.pct_tp ?? 0);
      return `<tr><td class="l"><b>${escapeHtml(m.code)}</b> : ${escapeHtml(m.intitule)}</td><td>${m.vhs ? m.vhs + "h" : "—"}</td><td>${m.has_cours ? (minToDuree(dureeToMin(m.duree_cours)) || "—") : "—"}</td><td>${m.has_td ? (minToDuree(dureeToMin(m.duree_td)) || "—") : "—"}</td><td>${m.has_tp ? (minToDuree(dureeToMin(m.duree_tp)) || "—") : "—"}</td><td>—</td><td>${m.coefficient ?? "—"}</td><td>${m.credits}</td><td>${cont > 0 ? cont + "%" : "—"}</td><td>${m.pct_examen != null ? m.pct_examen + "%" : "—"}</td></tr>`;
    }).join("");
    return ueRow + modRows;
  }).join("");

  const totalRow = `<tr class="total"><td class="l">Total Semestre</td><td>${tot.vhs}h</td><td>${minToDuree(tot.c) || "—"}</td><td>${minToDuree(tot.td) || "—"}</td><td>${minToDuree(tot.tp) || "—"}</td><td>—</td><td>${tot.coeff}</td><td>${tot.credits}</td><td></td><td></td></tr>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${escapeHtml(title)}</title>
  <style>
    *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#111}
    h1{font-size:16px;text-align:center;margin:0 0 4px}
    p.sub{font-size:12px;text-align:center;color:#444;margin:0 0 16px}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th,td{border:1px solid #333;padding:4px 6px;text-align:center}
    td.l{text-align:left}
    thead th{background:#f0f0f0;font-weight:bold}
    tr.ue td{background:#e9e9e9;font-weight:bold}
    tr.total td{background:#f4eefc;font-weight:bold}
    @media print{@page{size:A4 landscape;margin:12mm} button{display:none}}
    button{margin:14px auto 0;display:block;padding:8px 16px;font-size:13px;cursor:pointer}
  </style></head><body>
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">${escapeHtml(subtitle)}</p>
    <table>
      <thead>
        <tr>
          <th rowspan="2">Unité d'Enseignement</th><th rowspan="2">VHS<br/>14 sem</th>
          <th colspan="4">V.H hebdomadaire</th>
          <th rowspan="2">Coeff</th><th rowspan="2">Crédits</th>
          <th colspan="2">Mode d'évaluation</th>
        </tr>
        <tr><th>C</th><th>TD</th><th>TP</th><th>Autres</th><th>Continu</th><th>Examen</th></tr>
      </thead>
      <tbody>${body}${totalRow}</tbody>
    </table>
    <button onclick="window.print()">Imprimer</button>
    <script>window.onload=function(){window.print()}</script>
  </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

export default function SuperAgentModules() {
  // SA's university from profile
  const saProfile    = getUser()?.profile as Record<string, string> | undefined;
  const saUniversite = saProfile?.universite ?? "";

  // A Doyen has a fixed faculté (not changeable); a Director may pick any.
  const isDoyenAccount = getSuperAgentAccountType() === "doyen";
  const doyenFaculte   = getSuperAgentFaculte();

  const [faculte, setFaculte]         = useState(isDoyenAccount ? doyenFaculte : "");
  const [departement, setDepartement] = useState("");
  const [niveau, setNiveau]           = useState("L3");
  const [specialite, setSpecialite]   = useState("");
  const [semestre, setSemestre]       = useState("S5");

  const [showModal, setShowModal]     = useState(false);
  const [editingModule, setEditingModule] = useState<EditModuleData | undefined>(undefined);
  const [confirmDel, setConfirmDel]   = useState<{ mod: ModuleEntry } | null>(null);
  const [moveTarget, setMoveTarget]   = useState<{ mod: ModuleEntry } | null>(null);
  const [quickAddUe, setQuickAddUe]   = useState<{ type_ue: string; code: string; label: string } | null>(null);
  const [modules, setModules]         = useState<ModuleEntry[]>([]);
  const [allModules, setAllModules]   = useState<ModuleEntry[]>([]);
  const [moduleSearch, setModuleSearch] = useState("");

  // Faculties for the SA's university, plus the SA's own faculty from their profile
  const facultes    = [...new Set([
    ...(saUniversite ? getFacultes(saUniversite) : []),
    ...(saProfile?.faculte ? [saProfile.faculte] : []),
  ])];
  const departements = faculte ? getDepartements(faculte) : [];
  const semestres   = SEMESTRES_PAR_NIVEAU[niveau] ?? ["S1", "S2"];
  const specialites = (faculte && departement && niveau) ? getSpecialites(departement, niveau) : [];
  const isAutoSpec  = niveau === "L1" || niveau === "L2";
  // Modules in the DB are keyed by département (filière) + niveau + semestre.
  // The spécialité is optional context and does not gate the listing.
  const allFiltersSet = !!(faculte && departement && niveau && semestre);

  // Load all modules for the "all modules" view
  const refreshAllModules = useCallback(() => {
    api.modules().then(d => setAllModules(d as ModuleEntry[])).catch(() => {});
  }, []);

  const refreshModules = useCallback(() => {
    if (!departement || !niveau || !semestre) { setModules([]); return; }
    const params = new URLSearchParams({ filiere: departement, niveau, semestre }).toString();
    api.modules(params).then(d => setModules(d as ModuleEntry[])).catch(() => setModules([]));
  }, [departement, niveau, semestre]);

  useEffect(() => { refreshModules(); refreshAllModules(); }, [refreshModules, refreshAllModules]);

  useEffect(() => {
    if (niveau === "L1" || niveau === "L2") setSpecialite("Tronc commun");
    else setSpecialite("");
  }, [niveau, departement]);

  function handleFaculteChange(v: string)    { setFaculte(v); setDepartement(""); setSpecialite(""); }
  function handleDepartementChange(v: string) { setDepartement(v); if (!isAutoSpec) setSpecialite(""); }
  function handleNiveauChange(v: string) {
    setNiveau(v);
    setSemestre((SEMESTRES_PAR_NIVEAU[v] ?? ["S1", "S2"])[0]);
  }

  type SavedMod = {
    nom: string; code: string; coefficient: number; credits: number; ue: string;
    nature: string; vhs: number; has_cours: boolean; duree_cours: string;
    has_td: boolean; duree_td: string; has_tp: boolean; duree_tp: string;
    pct_examen: number; pct_td: number; pct_tp: number; _editId?: number;
    ue_order?: number | null; is_new_ue?: boolean;
  };

  async function handleSaveModule(mod: SavedMod) {
    if (mod._editId) {
      // Edit mode — the code is editable; changing it moves the module to the
      // Teaching Unit encoded in the new code.
      await api.updateModule(mod._editId, {
        intitule:    mod.nom,
        code:        mod.code,
        credits:     mod.credits,
        type_ue:     mod.ue,
        nature:      mod.nature,
        coefficient: mod.coefficient,
        vhs:         mod.vhs,
        has_cours:   mod.has_cours,
        duree_cours: mod.duree_cours,
        has_td:      mod.has_td,
        duree_td:    mod.duree_td,
        has_tp:      mod.has_tp,
        duree_tp:    mod.duree_tp,
        pct_examen:  mod.pct_examen,
        pct_td:      mod.pct_td,
        pct_tp:      mod.pct_tp,
      });
    } else {
      // Create mode — the code is suggested from the UE selection but may have
      // been edited by the admin; send it so the server uses the chosen value.
      await api.storeModule({
        intitule:    mod.nom,
        code:        mod.code,
        credits:     mod.credits,
        filiere:     departement,
        niveau,
        semestre,
        type_ue:     mod.ue,
        ue_order:    mod.ue_order ?? null,
        is_new_ue:   mod.is_new_ue ?? true,
        nature:      mod.nature,
        coefficient: mod.coefficient,
        vhs:         mod.vhs,
        has_cours:   mod.has_cours,
        duree_cours: mod.duree_cours,
        has_td:      mod.has_td,
        duree_td:    mod.duree_td,
        has_tp:      mod.has_tp,
        duree_tp:    mod.duree_tp,
        pct_examen:  mod.pct_examen,
        pct_td:      mod.pct_td,
        pct_tp:      mod.pct_tp,
      });
    }
    setEditingModule(undefined);
    refreshModules();
    refreshAllModules();
  }

  function openEdit(mod: ModuleEntry) {
    setEditingModule(mod as unknown as EditModuleData);
    setShowModal(true);
  }

  function openQuickAdd(groupKey: string, list: ModuleEntry[]) {
    const { type_ue, code } = nextCodeInGroup(groupKey, list);
    setQuickAddUe({ type_ue, code, label: groupKey });
    setEditingModule(undefined);
    setShowModal(true);
  }

  async function handleRemove(mod: ModuleEntry) {
    await api.deleteModule(mod.id);
    refreshModules();
    refreshAllModules();
    setConfirmDel(null);
  }

  const totalCredits = modules.reduce((a, m) => a + m.credits, 0);

  // Search across all created modules (name, code, filière, niveau, semestre)
  // For Doyen: only show modules belonging to their faculty's departments
  const q = moduleSearch.trim().toLowerCase();
  const doyenDepts = isDoyenAccount ? getDepartements(doyenFaculte) : [];
  const scopedAllModules = isDoyenAccount
    ? allModules.filter(m => doyenDepts.includes(m.filiere))
    : allModules;
  const filteredAllModules = q
    ? scopedAllModules.filter(m =>
        [m.intitule, m.code, m.filiere, m.niveau, m.semestre]
          .some(v => (v ?? "").toString().toLowerCase().includes(q)))
    : scopedAllModules;

  return (
    <div className="flex min-h-screen bg-background">
      <SuperAgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <motion.div variants={item}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />Modules par Niveau
                </h1>
                {saUniversite && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />{saUniversite}
                  </p>
                )}
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-700 gap-2 disabled:opacity-50"
                disabled={!allFiltersSet}
                title={!allFiltersSet ? "Veuillez remplir tous les filtres" : undefined}
                onClick={() => setShowModal(true)}
              >
                <Plus className="w-4 h-4" />Ajouter un module
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={item}>
            <Card className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Faculté *</label>
                  {isDoyenAccount ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm h-10">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 truncate">{doyenFaculte || "Faculté non définie"}</span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">non modifiable</span>
                    </div>
                  ) : (
                    <Select value={faculte} onValueChange={handleFaculteChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={saUniversite ? "Sélectionner une faculté" : "Université non définie"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {facultes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Département *</label>
                  <Select value={departement} onValueChange={handleDepartementChange} disabled={!faculte}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={faculte ? "Sélectionner un département" : "Choisissez d'abord une faculté"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-52">
                      {departements.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Niveau</label>
                <div className="flex flex-wrap gap-1.5">
                  {NIVEAUX_LIST.map(n => (
                    <button key={n} onClick={() => handleNiveauChange(n)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors border ${
                        niveau === n ? "bg-purple-600 text-white border-purple-600" : "bg-background border-border hover:bg-muted"
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {faculte && departement && niveau && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <ChevronRight className="w-3 h-3 text-purple-500" />
                      <label className="text-xs font-medium text-muted-foreground">Spécialité *</label>
                    </div>
                    {isAutoSpec ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm px-3 py-1 border-purple-300 text-purple-700 bg-purple-50">Tronc commun</Badge>
                        <span className="text-xs text-muted-foreground">(automatique pour {niveau})</span>
                      </div>
                    ) : (
                      <Select value={specialite} onValueChange={setSpecialite}>
                        <SelectTrigger className="w-full md:w-96">
                          <SelectValue placeholder="Sélectionner une spécialité" />
                        </SelectTrigger>
                        <SelectContent className="max-h-52">
                          {specialites.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Semestre</label>
                <div className="flex gap-1.5">
                  {semestres.map(s => (
                    <button key={s} onClick={() => setSemestre(s)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors border ${
                        semestre === s ? "bg-blue-600 text-white border-blue-600" : "bg-background border-border hover:bg-muted"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {!allFiltersSet && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Remplissez tous les filtres pour gérer les modules de cette combinaison.
                </p>
              )}
            </Card>
          </motion.div>

          {/* Filtered modules */}
          {allFiltersSet && (
            <motion.div variants={item}>
              <div className="flex items-center gap-4 flex-wrap text-sm mb-3">
                <Badge variant="outline" className="gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />{departement} — {niveau} — {semestre}
                </Badge>
                <span className="text-muted-foreground">{modules.length} module{modules.length !== 1 ? "s" : ""}</span>
                <span className="text-muted-foreground">{totalCredits} crédit{totalCredits !== 1 ? "s" : ""} au total</span>
                {modules.length > 0 && (
                  <Button
                    size="sm" variant="outline"
                    className="ml-auto gap-1.5 text-xs"
                    onClick={() => printCanevas(
                      modules,
                      `Canevas pédagogique — ${departement} ${niveau}`,
                      `${faculte ? faculte + " · " : ""}${departement} — ${niveau} — ${semestre}`,
                    )}
                  >
                    <Printer className="w-3.5 h-3.5" />Imprimer le canevas
                  </Button>
                )}
              </div>
              {modules.length === 0 ? (
                <Card className="p-10 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">Aucun module pour {departement} — {niveau} {semestre}.</p>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 gap-1" onClick={() => setShowModal(true)}>
                    <Plus className="w-3.5 h-3.5" />Ajouter le premier module
                  </Button>
                </Card>
              ) : (
                <CanevasTables
                  modules={modules}
                  onEdit={openEdit}
                  onDelete={(mod) => setConfirmDel({ mod })}
                  onMove={(mod) => setMoveTarget({ mod })}
                  onQuickAdd={openQuickAdd}
                />
              )}
            </motion.div>
          )}

          {/* ALL MODULES section */}
          {scopedAllModules.length > 0 && (
            <motion.div variants={item}>
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <h2 className="text-base font-semibold flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="w-4 h-4" />Tous mes modules créés
                    <Badge variant="outline" className="ml-1">
                      {q ? `${filteredAllModules.length}/${scopedAllModules.length}` : scopedAllModules.length}
                    </Badge>
                  </h2>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      value={moduleSearch}
                      onChange={e => setModuleSearch(e.target.value)}
                      placeholder="Rechercher un module (nom, code, filière…)"
                      className="pl-8 pr-8 h-9 text-sm"
                    />
                    {moduleSearch && (
                      <button
                        type="button"
                        onClick={() => setModuleSearch("")}
                        title="Effacer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {filteredAllModules.length === 0 ? (
                  <Card className="p-6 text-center text-sm text-muted-foreground">
                    Aucun module ne correspond à « {moduleSearch} ».
                  </Card>
                ) : (
                <div className="space-y-1.5">
                  {filteredAllModules.map(mod => (
                    <Card key={mod.id} className="px-4 py-2.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{mod.intitule}</span>
                        <span className="text-xs text-muted-foreground ml-2">{mod.filiere} · {mod.niveau} · {mod.semestre}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{mod.credits} cr.</Badge>
                      {mod.type_ue && <Badge variant="outline" className="text-xs text-purple-600">{mod.type_ue}</Badge>}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-500 hover:bg-blue-50"
                        title="Modifier ce module" onClick={() => openEdit(mod)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:bg-red-50"
                        onClick={() => setConfirmDel({ mod })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </Card>
                  ))}
                </div>
                )}
              </div>
            </motion.div>
          )}

        </motion.div>
      </main>

      <AjoutModule
        open={showModal}
        contextLabel={`${faculte} · ${departement}${specialite ? " · " + specialite : ""} — ${niveau} ${semestre}`}
        filiere={departement}
        initialNiveau={niveau}
        initialSemestre={semestre}
        editModule={editingModule}
        presetUe={quickAddUe ?? undefined}
        onClose={() => { setShowModal(false); setEditingModule(undefined); setQuickAddUe(null); }}
        onSave={handleSaveModule}
      />

      <AnimatePresence>
        {moveTarget && (
          <MoveModuleDialog
            mod={moveTarget.mod}
            scopeModules={modules}
            onClose={() => setMoveTarget(null)}
            onMoved={() => { refreshModules(); refreshAllModules(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 max-w-sm w-full">
                <h3 className="font-bold text-base mb-2">Supprimer ce module ?</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium">{confirmDel.mod.intitule}</span> sera supprimé définitivement.
                </p>
                <p className="text-xs text-red-500 mb-4">Cette action est irréversible.</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setConfirmDel(null)}>Annuler</Button>
                  <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleRemove(confirmDel.mod)}>
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

// ─── Canevas pédagogique table ──────────────────────────────────────────────────
// Renders modules grouped per (filière · niveau · semestre), and within each block
// grouped by Unité d'Enseignement, following the official LMD course-structure sheet.
function CanevasTables({
  modules, onEdit, onDelete, onMove, onQuickAdd,
}: {
  modules: ModuleEntry[];
  onEdit: (m: ModuleEntry) => void;
  onDelete: (m: ModuleEntry) => void;
  onMove: (m: ModuleEntry) => void;
  onQuickAdd: (groupKey: string, list: ModuleEntry[]) => void;
}) {
  // Group into semester blocks
  const blocks = new Map<string, ModuleEntry[]>();
  for (const m of modules) {
    const key = `${m.filiere}|||${m.niveau}|||${m.semestre}`;
    (blocks.get(key) ?? blocks.set(key, []).get(key)!).push(m);
  }

  return (
    <div className="space-y-7">
      {[...blocks.entries()].map(([key, mods]) => {
        const [filiere, niveau, semestre] = key.split("|||");

        // Group modules by UE
        const ueMap = new Map<string, ModuleEntry[]>();
        for (const m of mods) {
          const g = ueGroupOf(m);
          (ueMap.get(g) ?? ueMap.set(g, []).get(g)!).push(m);
        }
        const ueGroups = [...ueMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

        // Semester totals
        const tot = mods.reduce(
          (a, m) => ({
            vhs: a.vhs + (m.vhs ?? 0),
            c:   a.c   + (m.has_cours ? dureeToMin(m.duree_cours) : 0),
            td:  a.td  + (m.has_td    ? dureeToMin(m.duree_td)    : 0),
            tp:  a.tp  + (m.has_tp    ? dureeToMin(m.duree_tp)    : 0),
            coeff:   a.coeff   + (m.coefficient ?? 0),
            credits: a.credits + (m.credits ?? 0),
          }),
          { vhs: 0, c: 0, td: 0, tp: 0, coeff: 0, credits: 0 },
        );

        return (
          <div key={key}>
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold">{filiere}</span>
              <span className="text-xs text-muted-foreground">— {niveau} · {semestre}</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/60 text-muted-foreground">
                    <th rowSpan={2} className="border border-border px-2 py-1.5 text-left font-semibold min-w-[220px]">
                      Unité d'Enseignement
                    </th>
                    <th rowSpan={2} className="border border-border px-2 py-1.5 font-semibold">
                      VHS<br /><span className="font-normal text-[10px]">14 sem</span>
                    </th>
                    <th colSpan={4} className="border border-border px-2 py-1 font-semibold">V.H hebdomadaire</th>
                    <th rowSpan={2} className="border border-border px-2 py-1.5 font-semibold">Coeff</th>
                    <th rowSpan={2} className="border border-border px-2 py-1.5 font-semibold">Crédits</th>
                    <th colSpan={2} className="border border-border px-2 py-1 font-semibold">Mode d'évaluation</th>
                    <th rowSpan={2} className="border border-border px-2 py-1.5 font-semibold w-16"></th>
                  </tr>
                  <tr className="bg-muted/60 text-muted-foreground">
                    <th className="border border-border px-2 py-1 font-semibold">C</th>
                    <th className="border border-border px-2 py-1 font-semibold">TD</th>
                    <th className="border border-border px-2 py-1 font-semibold">TP</th>
                    <th className="border border-border px-2 py-1 font-semibold">Autres</th>
                    <th className="border border-border px-2 py-1 font-semibold">Continu</th>
                    <th className="border border-border px-2 py-1 font-semibold">Examen</th>
                  </tr>
                </thead>
                <tbody>
                  {ueGroups.map(([ue, list]) => {
                    // UE-level aggregates
                    const agg = list.reduce(
                      (a, m) => ({
                        c:  a.c  + (m.has_cours ? dureeToMin(m.duree_cours) : 0),
                        td: a.td + (m.has_td    ? dureeToMin(m.duree_td)    : 0),
                        tp: a.tp + (m.has_tp    ? dureeToMin(m.duree_tp)    : 0),
                        coeff:   a.coeff   + (m.coefficient ?? 0),
                        credits: a.credits + (m.credits ?? 0),
                      }),
                      { c: 0, td: 0, tp: 0, coeff: 0, credits: 0 },
                    );
                    return (
                      <FragmentRows
                        key={ue}
                        ue={ue}
                        list={list}
                        agg={agg}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onMove={onMove}
                        onQuickAdd={onQuickAdd}
                      />
                    );
                  })}

                  {/* Total semestre */}
                  <tr className="bg-purple-50 font-bold text-purple-800">
                    <td className="border border-border px-2 py-1.5 text-right">Total Semestre</td>
                    <td className="border border-border px-2 py-1.5 text-center">{tot.vhs}h</td>
                    <td className="border border-border px-2 py-1.5 text-center">{minToDuree(tot.c) || "—"}</td>
                    <td className="border border-border px-2 py-1.5 text-center">{minToDuree(tot.td) || "—"}</td>
                    <td className="border border-border px-2 py-1.5 text-center">{minToDuree(tot.tp) || "—"}</td>
                    <td className="border border-border px-2 py-1.5 text-center">—</td>
                    <td className="border border-border px-2 py-1.5 text-center">{tot.coeff}</td>
                    <td className="border border-border px-2 py-1.5 text-center">{tot.credits}</td>
                    <td className="border border-border px-2 py-1.5" colSpan={3}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// One UE group: a shaded header row + its module rows
function FragmentRows({
  ue, list, agg, onEdit, onDelete, onMove, onQuickAdd,
}: {
  ue: string;
  list: ModuleEntry[];
  agg: { c: number; td: number; tp: number; coeff: number; credits: number };
  onEdit: (m: ModuleEntry) => void;
  onDelete: (m: ModuleEntry) => void;
  onMove: (m: ModuleEntry) => void;
  onQuickAdd: (groupKey: string, list: ModuleEntry[]) => void;
}) {
  return (
    <>
      {/* UE header row */}
      <tr className="bg-muted/40 font-semibold">
        <td className="border border-border px-2 py-1.5 text-purple-700">
          <span className="inline-flex items-center gap-1.5">
            {ue} (O/P)
            <button
              type="button"
              title={`Ajouter un module dans ${ue}`}
              onClick={() => onQuickAdd(ue, list)}
              className="inline-flex h-5 w-5 items-center justify-center rounded text-purple-600 hover:bg-purple-100 font-normal"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </span>
        </td>
        <td className="border border-border px-2 py-1.5"></td>
        <td className="border border-border px-2 py-1.5 text-center">{minToDuree(agg.c) || "—"}</td>
        <td className="border border-border px-2 py-1.5 text-center">{minToDuree(agg.td) || "—"}</td>
        <td className="border border-border px-2 py-1.5 text-center">{minToDuree(agg.tp) || "—"}</td>
        <td className="border border-border px-2 py-1.5 text-center">—</td>
        <td className="border border-border px-2 py-1.5 text-center">{agg.coeff}</td>
        <td className="border border-border px-2 py-1.5 text-center">{agg.credits}</td>
        <td className="border border-border px-2 py-1.5" colSpan={3}></td>
      </tr>

      {/* Module rows */}
      {list.map((m) => {
        const continu = (m.pct_td ?? 0) + (m.pct_tp ?? 0);
        return (
          <tr key={m.id} className="hover:bg-muted/20 group">
            <td className="border border-border px-2 py-1.5">
              <span className="font-medium">{m.code}</span>
              <span className="text-muted-foreground"> : {m.intitule}</span>
            </td>
            <td className="border border-border px-2 py-1.5 text-center">{m.vhs ? `${m.vhs}h` : "—"}</td>
            <td className="border border-border px-2 py-1.5 text-center">{m.has_cours ? (minToDuree(dureeToMin(m.duree_cours)) || "—") : "—"}</td>
            <td className="border border-border px-2 py-1.5 text-center">{m.has_td ? (minToDuree(dureeToMin(m.duree_td)) || "—") : "—"}</td>
            <td className="border border-border px-2 py-1.5 text-center">{m.has_tp ? (minToDuree(dureeToMin(m.duree_tp)) || "—") : "—"}</td>
            <td className="border border-border px-2 py-1.5 text-center">—</td>
            <td className="border border-border px-2 py-1.5 text-center">{m.coefficient ?? "—"}</td>
            <td className="border border-border px-2 py-1.5 text-center">{m.credits}</td>
            <td className="border border-border px-2 py-1.5 text-center">{continu > 0 ? `${continu}%` : "—"}</td>
            <td className="border border-border px-2 py-1.5 text-center">{m.pct_examen != null ? `${m.pct_examen}%` : "—"}</td>
            <td className="border border-border px-1 py-1 text-center whitespace-nowrap">
              <button
                title="Modifier ce module"
                onClick={() => onEdit(m)}
                className="inline-flex h-6 w-6 items-center justify-center rounded text-blue-500 hover:bg-blue-50"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                title="Déplacer ce module (changer son unité ou sa position)"
                onClick={() => onMove(m)}
                className="inline-flex h-6 w-6 items-center justify-center rounded text-purple-500 hover:bg-purple-50"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
              <button
                title="Supprimer ce module"
                onClick={() => onDelete(m)}
                className="inline-flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );
}

// ─── Move-module dialog ─────────────────────────────────────────────────────────
// Lets the admin pick a destination UE (existing or brand-new) and a position
// within it; the backend renumbers every affected module's LMD code accordingly.
const UE_TYPES = ["UEF", "UEM", "UED", "UET"];

function MoveModuleDialog({
  mod, scopeModules, onClose, onMoved,
}: {
  mod: ModuleEntry;
  scopeModules: ModuleEntry[];
  onClose: () => void;
  onMoved: () => void;
}) {
  const currentGroup = ueGroupOf(mod);

  const groupsRaw = new Map<string, ModuleEntry[]>();
  for (const m of scopeModules) {
    const g = ueGroupOf(m);
    (groupsRaw.get(g) ?? groupsRaw.set(g, []).get(g)!).push(m);
  }
  const groups = [...groupsRaw.entries()]
    .map(([key, list]) => [key, [...list].sort((a, b) => a.code.localeCompare(b.code))] as const)
    .sort((a, b) => a[0].localeCompare(b[0]));
  const groupMap = new Map(groups);

  const [targetGroup, setTargetGroup] = useState(currentGroup);
  const [newType, setNewType] = useState("UEF");
  const [position, setPosition] = useState(() => {
    const list = groupMap.get(currentGroup) ?? [];
    const idx = list.findIndex(m => m.id === mod.id);
    return idx >= 0 ? idx + 1 : 1;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isNew = targetGroup === "__new__";
  const targetMembers = isNew ? [] : (groupMap.get(targetGroup) ?? []).filter(m => m.id !== mod.id);
  const maxPosition = targetMembers.length + 1;

  useEffect(() => {
    setPosition(p => Math.min(Math.max(1, p), maxPosition));
  }, [targetGroup, maxPosition]);

  async function confirm() {
    setSaving(true);
    setError("");
    try {
      let payload: { type_ue: string; ue_order?: number; is_new_ue?: boolean; position: number };
      if (isNew) {
        payload = { type_ue: newType, is_new_ue: true, position: 1 };
      } else {
        const mm = targetGroup.match(/^([A-Z]{2,4})\d(\d)$/);
        if (!mm) throw new Error("Code d'unité invalide.");
        payload = { type_ue: mm[1], ue_order: parseInt(mm[2], 10), is_new_ue: false, position };
      }
      await api.moveModule(mod.id, payload);
      onMoved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du déplacement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
        <Card className="p-6 max-w-md w-full space-y-4">
          <div>
            <h3 className="font-bold text-base mb-1 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-purple-600" />Déplacer ce module
            </h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono font-medium">{mod.code}</span> — {mod.intitule}
              <br />Actuellement dans <span className="font-medium">{currentGroup}</span>.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Unité de destination</label>
            <Select value={targetGroup} onValueChange={setTargetGroup}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {groups.map(([key, list]) => (
                  <SelectItem key={key} value={key}>
                    {key} ({list.length} module{list.length !== 1 ? "s" : ""}{key === currentGroup ? " — actuelle" : ""})
                  </SelectItem>
                ))}
                <SelectItem value="__new__">➕ Nouvelle unité</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isNew ? (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Type de la nouvelle unité</label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Le module deviendra le premier cours de cette nouvelle unité ; son code est généré automatiquement.
              </p>
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Position dans {targetGroup} ({maxPosition} place{maxPosition !== 1 ? "s" : ""} possible{maxPosition !== 1 ? "s" : ""})
              </label>
              <Select value={String(position)} onValueChange={(v) => setPosition(parseInt(v, 10))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxPosition }, (_, i) => i + 1).map(p => (
                    <SelectItem key={p} value={String(p)}>{p === 1 ? "1ʳᵉ position" : `${p}ᵉ position`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Les codes des modules de cette unité — et de l'unité d'origine si elle change — seront renumérotés automatiquement.
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Annuler</Button>
            <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={confirm} disabled={saving}>
              {saving ? "Déplacement…" : "Déplacer"}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
