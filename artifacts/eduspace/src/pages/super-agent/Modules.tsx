import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SuperAgentSidebar } from "@/components/SuperAgentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Trash2, GraduationCap, ChevronRight } from "lucide-react";
import AjoutModule from "./AjoutModule";
import {
  getAllFacultes, getDepartements, getSpecialites,
  getModulesForProgramme, addModuleToProgramme, removeModuleFromProgramme,
  NIVEAUX_LIST, SEMESTRES_PAR_NIVEAU,
  type ModuleEntry,
} from "@/lib/superAgentStore";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };


export default function SuperAgentModules() {
  const [faculte, setFaculte]       = useState("");
  const [departement, setDepartement] = useState("");
  const [niveau, setNiveau]         = useState("L3");
  const [specialite, setSpecialite] = useState("");
  const [semestre, setSemestre]     = useState("S5");

  const [showModal, setShowModal]   = useState(false);
  const [confirmDel, setConfirmDel] = useState<{ mod: ModuleEntry } | null>(null);
  const [modules, setModules]       = useState<ModuleEntry[]>([]);

  const allFacultes   = getAllFacultes();
  const departements  = faculte ? getDepartements(faculte) : [];
  const semestres     = SEMESTRES_PAR_NIVEAU[niveau] ?? ["S1", "S2"];
  const specialites   = (faculte && departement && niveau) ? getSpecialites(departement, niveau) : [];
  const isAutoSpec    = niveau === "L1" || niveau === "L2";
  const allFiltersSet = !!(faculte && departement && niveau && specialite && semestre);

  // Refresh module list whenever filters change
  const refreshModules = useCallback(() => {
    if (faculte && departement && specialite && niveau && semestre) {
      setModules(getModulesForProgramme(faculte, departement, specialite, niveau, semestre));
    } else {
      setModules([]);
    }
  }, [faculte, departement, specialite, niveau, semestre]);

  useEffect(() => { refreshModules(); }, [refreshModules]);

  // Auto-set specialite for L1/L2
  useEffect(() => {
    if (niveau === "L1" || niveau === "L2") {
      setSpecialite("Tronc commun");
    } else {
      setSpecialite("");
    }
  }, [niveau, departement]);

  function handleFaculteChange(v: string) {
    setFaculte(v);
    setDepartement("");
    setSpecialite("");
  }

  function handleDepartementChange(v: string) {
    setDepartement(v);
    if (!isAutoSpec) setSpecialite("");
  }

  function handleNiveauChange(v: string) {
    setNiveau(v);
    const sems = SEMESTRES_PAR_NIVEAU[v] ?? ["S1", "S2"];
    setSemestre(sems[0]);
  }

  function handleAddModule(mod: Omit<ModuleEntry, "id">) {
    addModuleToProgramme(faculte, departement, specialite, niveau, semestre, mod);
    refreshModules();
    setShowModal(false);
  }

  function handleRemove(mod: ModuleEntry) {
    removeModuleFromProgramme(faculte, departement, specialite, niveau, semestre, mod.id);
    refreshModules();
    setConfirmDel(null);
  }

  const byUE = modules.reduce<Record<string, ModuleEntry[]>>((acc, m) => {
    const ue = m.ue || "Sans UE";
    acc[ue] = [...(acc[ue] ?? []), m];
    return acc;
  }, {});

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
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  Modules par Niveau
                </h1>
                <p className="text-muted-foreground mt-1">
                  Définissez les modules pour chaque spécialité, niveau et semestre.
                </p>
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-700 gap-2 disabled:opacity-50"
                disabled={!allFiltersSet}
                title={!allFiltersSet ? "Veuillez remplir tous les filtres" : undefined}
                onClick={() => { setShowModal(true); setModForm({ ...EMPTY_MOD, ue: "" }); setModErrors({}); }}
              >
                <Plus className="w-4 h-4" />Ajouter un module
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={item}>
            <Card className="p-5 space-y-4">
              {/* Row 1: Faculté + Département */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Faculté *</label>
                  <Select value={faculte} onValueChange={handleFaculteChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une faculté" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {allFacultes.map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
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
                      {departements.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Niveau chips */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Niveau</label>
                <div className="flex flex-wrap gap-1.5">
                  {NIVEAUX_LIST.map(n => (
                    <button key={n} onClick={() => handleNiveauChange(n)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors border ${
                        niveau === n
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-background border-border hover:bg-muted"
                      }`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Spécialité (appears once faculté + département + niveau are all set) */}
              <AnimatePresence>
                {faculte && departement && niveau && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <ChevronRight className="w-3 h-3 text-purple-500" />
                      <label className="text-xs font-medium text-muted-foreground">Spécialité *</label>
                    </div>
                    {isAutoSpec ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm px-3 py-1 border-purple-300 text-purple-700 bg-purple-50">
                          Tronc commun
                        </Badge>
                        <span className="text-xs text-muted-foreground">(automatique pour {niveau})</span>
                      </div>
                    ) : (
                      <Select value={specialite} onValueChange={setSpecialite}>
                        <SelectTrigger className="w-full md:w-96">
                          <SelectValue placeholder="Sélectionner une spécialité" />
                        </SelectTrigger>
                        <SelectContent className="max-h-52">
                          {specialites.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Row 4: Semestre chips */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Semestre</label>
                <div className="flex gap-1.5">
                  {semestres.map(s => (
                    <button key={s} onClick={() => setSemestre(s)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors border ${
                        semestre === s
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-background border-border hover:bg-muted"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter hint */}
              {!allFiltersSet && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Remplissez tous les filtres (faculté, département, niveau, spécialité, semestre) pour gérer les modules.
                </p>
              )}
            </Card>
          </motion.div>

          {/* Stats bar */}
          {allFiltersSet && (
            <motion.div variants={item}>
              <div className="flex items-center gap-4 flex-wrap text-sm">
                <Badge variant="outline" className="gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {niveau} — {semestre} — {specialite}
                </Badge>
                <span className="text-muted-foreground">{modules.length} module{modules.length !== 1 ? "s" : ""}</span>
                <span className="text-muted-foreground">{totalCredits} crédit{totalCredits !== 1 ? "s" : ""} au total</span>
                <span className="text-muted-foreground">{Object.keys(byUE).length} UE</span>
              </div>
            </motion.div>
          )}

          {/* Module list */}
          {allFiltersSet && (
            <motion.div variants={item}>
              {modules.length === 0 ? (
                <Card className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-3">
                    Aucun module pour {departement} — {specialite} — {niveau} {semestre}.
                  </p>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 gap-1"
                    onClick={() => { setShowModal(true); setModForm({ ...EMPTY_MOD, ue: "" }); setModErrors({}); }}>
                    <Plus className="w-3.5 h-3.5" />Ajouter le premier module
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {Object.entries(byUE).map(([ue, mods]) => (
                    <div key={ue}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm font-semibold text-purple-700">{ue}</span>
                        <span className="text-xs text-muted-foreground">
                          ({mods.reduce((a, m) => a + m.credits, 0)} crédits)
                        </span>
                      </div>
                      <div className="space-y-2 ml-4">
                        {mods.map(mod => (
                          <Card key={mod.id} className="p-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{mod.nom}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="outline" className="text-xs px-1.5 py-0">Coef {mod.coefficient}</Badge>
                                <Badge variant="outline" className="text-xs px-1.5 py-0">{mod.credits} cr.</Badge>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                              onClick={() => setConfirmDel({ mod })}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </motion.div>
      </main>

      {/* Add module modal */}
      <AjoutModule
        open={showModal}
        contextLabel={`${faculte} · ${departement} · ${specialite} — ${niveau} ${semestre}`}
        onClose={() => setShowModal(false)}
        onSave={handleAddModule}
      />

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 max-w-sm w-full">
                <h3 className="font-bold text-base mb-2">Supprimer ce module ?</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium">{confirmDel.mod.nom}</span> sera supprimé de {niveau} — {semestre}.
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
