import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SuperAgentSidebar } from "@/components/SuperAgentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Trash2, GraduationCap, ChevronRight, Building2, Edit2 } from "lucide-react";
import AjoutModule, { type EditModuleData } from "./AjoutModule";
import {
  getFacultes, getDepartements, getSpecialites,
  NIVEAUX_LIST, SEMESTRES_PAR_NIVEAU,
} from "@/lib/superAgentStore";
import { superAgent as api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface ModuleEntry { id: number; intitule: string; code: string; credits: number; semestre: string; filiere: string; niveau: string }

export default function SuperAgentModules() {
  // SA's university from profile
  const saProfile    = getUser()?.profile as Record<string, string> | undefined;
  const saUniversite = saProfile?.universite ?? "";

  const [faculte, setFaculte]         = useState("");
  const [departement, setDepartement] = useState("");
  const [niveau, setNiveau]           = useState("L3");
  const [specialite, setSpecialite]   = useState("");
  const [semestre, setSemestre]       = useState("S5");

  const [showModal, setShowModal]     = useState(false);
  const [editingModule, setEditingModule] = useState<EditModuleData | undefined>(undefined);
  const [confirmDel, setConfirmDel]   = useState<{ mod: ModuleEntry } | null>(null);
  const [modules, setModules]         = useState<ModuleEntry[]>([]);
  const [allModules, setAllModules]   = useState<ModuleEntry[]>([]);

  // Faculties filtered to SA's university
  const facultes    = saUniversite ? getFacultes(saUniversite) : [];
  const departements = faculte ? getDepartements(faculte) : [];
  const semestres   = SEMESTRES_PAR_NIVEAU[niveau] ?? ["S1", "S2"];
  const specialites = (faculte && departement && niveau) ? getSpecialites(departement, niveau) : [];
  const isAutoSpec  = niveau === "L1" || niveau === "L2";
  const allFiltersSet = !!(faculte && departement && niveau && specialite && semestre);

  // Load all modules for the "all modules" view
  const refreshAllModules = useCallback(() => {
    api.modules().then(d => setAllModules(d as ModuleEntry[])).catch(() => {});
  }, []);

  const refreshModules = useCallback(() => {
    if (!specialite || !niveau || !semestre) { setModules([]); return; }
    const params = new URLSearchParams({ filiere: specialite, niveau, semestre }).toString();
    api.modules(params).then(d => setModules(d as ModuleEntry[])).catch(() => setModules([]));
  }, [specialite, niveau, semestre]);

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
  };

  async function handleSaveModule(mod: SavedMod) {
    if (mod._editId) {
      // Edit mode
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
      // Create mode
      await api.storeModule({
        code:        mod.code || `${specialite.slice(0, 3).toUpperCase()}${Date.now().toString().slice(-4)}`,
        intitule:    mod.nom,
        credits:     mod.credits,
        filiere:     specialite,
        niveau,
        semestre,
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
    }
    setEditingModule(undefined);
    refreshModules();
    refreshAllModules();
  }

  function openEdit(mod: ModuleEntry) {
    setEditingModule(mod as unknown as EditModuleData);
    setShowModal(true);
  }

  async function handleRemove(mod: ModuleEntry) {
    await api.deleteModule(mod.id);
    refreshModules();
    refreshAllModules();
    setConfirmDel(null);
  }

  const totalCredits = modules.reduce((a, m) => a + m.credits, 0);

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
                  <Select value={faculte} onValueChange={handleFaculteChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={saUniversite ? "Sélectionner une faculté" : "Université non définie"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {facultes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                  <GraduationCap className="w-3.5 h-3.5" />{niveau} — {semestre} — {specialite}
                </Badge>
                <span className="text-muted-foreground">{modules.length} module{modules.length !== 1 ? "s" : ""}</span>
                <span className="text-muted-foreground">{totalCredits} crédit{totalCredits !== 1 ? "s" : ""} au total</span>
              </div>
              {modules.length === 0 ? (
                <Card className="p-10 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">Aucun module pour {specialite} — {niveau} {semestre}.</p>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 gap-1" onClick={() => setShowModal(true)}>
                    <Plus className="w-3.5 h-3.5" />Ajouter le premier module
                  </Button>
                </Card>
              ) : (
                <div className="space-y-2">
                  {modules.map(mod => (
                    <Card key={mod.id} className="p-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{mod.intitule}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs px-1.5 py-0">{mod.code}</Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">{mod.credits} cr.</Badge>
                          {mod.type_ue && <Badge variant="outline" className="text-xs px-1.5 py-0 text-purple-600">{mod.type_ue}</Badge>}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-500 hover:bg-blue-50"
                        title="Modifier ce module" onClick={() => openEdit(mod)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                        onClick={() => setConfirmDel({ mod })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ALL MODULES section */}
          {allModules.length > 0 && (
            <motion.div variants={item}>
              <div className="mt-4">
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-4 h-4" />Tous mes modules créés
                  <Badge variant="outline" className="ml-1">{allModules.length}</Badge>
                </h2>
                <div className="space-y-1.5">
                  {allModules.map(mod => (
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
              </div>
            </motion.div>
          )}

        </motion.div>
      </main>

      <AjoutModule
        open={showModal}
        contextLabel={`${faculte} · ${departement} · ${specialite} — ${niveau} ${semestre}`}
        initialNiveau={niveau}
        initialSemestre={semestre}
        editModule={editingModule}
        onClose={() => { setShowModal(false); setEditingModule(undefined); }}
        onSave={handleSaveModule}
      />

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
