import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SuperAgentSidebar } from "@/components/SuperAgentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Trash2, X, GraduationCap, ChevronRight } from "lucide-react";
import {
  getAllFacultes, getDepartements, getSpecialites,
  getModulesForProgramme, addModuleToProgramme, removeModuleFromProgramme,
  NIVEAUX_LIST, SEMESTRES_PAR_NIVEAU,
  type ModuleEntry,
} from "@/lib/superAgentStore";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const EMPTY_MOD = { nom: "", coefficient: 2, credits: 4, ue: "" };
const UE_SUGGESTIONS = ["UEF 1.1","UEF 1.2","UEF 2.1","UEF 2.2","UEM 1.1","UEM 1.2","UEM 2.1","UET 1.1","UET 1.2","UEO 1.1","UEO 2.1"];

export default function SuperAgentModules() {
  const [faculte, setFaculte]       = useState("");
  const [departement, setDepartement] = useState("");
  const [niveau, setNiveau]         = useState("L3");
  const [specialite, setSpecialite] = useState("");
  const [semestre, setSemestre]     = useState("S5");

  const [showModal, setShowModal]   = useState(false);
  const [modForm, setModForm]       = useState({ ...EMPTY_MOD, ue: "" });
  const [modErrors, setModErrors]   = useState<Partial<typeof EMPTY_MOD>>({});
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

  function validateMod() {
    const e: Partial<typeof EMPTY_MOD> = {};
    if (!modForm.nom.trim()) e.nom = "Nom requis";
    if (modForm.coefficient < 1 || modForm.coefficient > 6) e.coefficient = "Entre 1 et 6" as unknown as number;
    if (modForm.credits < 1 || modForm.credits > 12) e.credits = "Entre 1 et 12" as unknown as number;
    if (!modForm.ue.trim()) e.ue = "UE requise";
    setModErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAddModule() {
    if (!validateMod()) return;
    addModuleToProgramme(faculte, departement, specialite, niveau, semestre, {
      nom: modForm.nom.trim(),
      coefficient: Number(modForm.coefficient),
      credits: Number(modForm.credits),
      ue: modForm.ue.trim(),
    });
    refreshModules();
    setShowModal(false);
    setModForm({ ...EMPTY_MOD, ue: "" });
    setModErrors({});
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
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5 text-purple-600" />Ajouter un module
                    <Badge variant="outline" className="text-xs ml-1">{niveau} — {semestre}</Badge>
                  </h2>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mb-4">
                  {faculte} · {departement} · {specialite}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Nom du module *</label>
                    <Input placeholder="ex: Algorithmique Avancée" value={modForm.nom}
                      onChange={e => setModForm(f => ({ ...f, nom: e.target.value }))} />
                    {modErrors.nom && <p className="text-xs text-red-500 mt-0.5">{modErrors.nom}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Unité d'Enseignement (UE) *</label>
                    <Select value={modForm.ue} onValueChange={v => setModForm(f => ({ ...f, ue: v }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner une UE" /></SelectTrigger>
                      <SelectContent>
                        {UE_SUGGESTIONS.map(ue => <SelectItem key={ue} value={ue}>{ue}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input className="mt-1.5" placeholder="Ou saisir manuellement…" value={modForm.ue}
                      onChange={e => setModForm(f => ({ ...f, ue: e.target.value }))} />
                    {modErrors.ue && <p className="text-xs text-red-500 mt-0.5">{modErrors.ue}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Coefficient (1–6) *</label>
                      <Input type="number" min={1} max={6} value={modForm.coefficient}
                        onChange={e => setModForm(f => ({ ...f, coefficient: Number(e.target.value) }))} />
                      {modErrors.coefficient && <p className="text-xs text-red-500 mt-0.5">{String(modErrors.coefficient)}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Crédits (1–12) *</label>
                      <Input type="number" min={1} max={12} value={modForm.credits}
                        onChange={e => setModForm(f => ({ ...f, credits: Number(e.target.value) }))} />
                      {modErrors.credits && <p className="text-xs text-red-500 mt-0.5">{String(modErrors.credits)}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Annuler</Button>
                  <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleAddModule}>
                    <Plus className="w-4 h-4 mr-1" />Ajouter
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
