import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CalendarDays, Plus, Edit, Save, X, AlertTriangle, DoorOpen,
  UsersRound, Trash2, CheckCircle, Download, Wifi, MapPin,
} from "lucide-react";
import { seances as initialSeances, modules, agentTeachers, agentRooms as initialRooms, groupesParNiveau } from "@/data/mockData";

const jours    = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Samedi"];
const creneaux = [
  { debut: "08:00", fin: "10:00" },
  { debut: "10:00", fin: "12:00" },
  { debut: "14:00", fin: "16:00" },
  { debut: "16:00", fin: "18:00" },
];

const typeColors: Record<string, string> = {
  CM: "bg-blue-100 text-blue-800 border-blue-200",
  TD: "bg-indigo-100 text-indigo-800 border-indigo-200",
  TP: "bg-teal-100 text-teal-800 border-teal-200",
};

type Session = typeof initialSeances[0];
type Room    = typeof initialRooms[0];

type NewSession = {
  jour: string; debut: string; fin: string;
  moduleId: string; enseignant: string; salle: string; type: string;
  groupe: string; typeSeance: "presentielle" | "ead";
};

const AGENT_DEPT = "Informatique";

function detectConflict(sessions: Session[], newS: NewSession, excludeId?: string) {
  const cands = sessions.filter(s => s.id !== excludeId && s.jour === newS.jour && s.heureDebut === newS.debut);
  for (const c of cands) {
    if (newS.typeSeance !== "ead" && c.salle === newS.salle) return `Conflit de salle : ${newS.salle} déjà utilisée ${newS.jour} à ${newS.debut}`;
    if (c.enseignant.includes(newS.enseignant.split(" ").pop() ?? "")) return `Conflit d'enseignant : ${newS.enseignant} a déjà une séance à ce créneau`;
  }
  return null;
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

type TabType = "timetable" | "rooms" | "groups";

const defaultNewSession = (groupe: string): NewSession => ({
  jour: "Dimanche", debut: "08:00", fin: "10:00",
  moduleId: "", enseignant: "", salle: "", type: "CM", groupe, typeSeance: "presentielle",
});

// Suggestions: sessions that teachers could have based on their modules
function buildSuggestions(sessions: Session[], groupe: string) {
  const suggestions: Partial<NewSession>[] = [];
  agentTeachers.forEach(t => {
    t.modulesAssignes.forEach(mod => {
      const existing = sessions.some(s => s.module === mod && s.groupes.includes(groupe));
      if (!existing) {
        const modObj = modules.find(m => m.intitule === mod);
        suggestions.push({
          moduleId: modObj?.id ?? mod,
          enseignant: `Dr. ${t.prenom} ${t.nom}`,
          type: "CM",
        });
      }
    });
  });
  return suggestions.slice(0, 4);
}

export default function AgentEmploiDuTemps() {
  const [activeTab, setActiveTab]   = useState<TabType>("timetable");
  const [sessions, setSessions]     = useState<Session[]>(initialSeances);
  const [niveau, setNiveau]         = useState("L3");
  const [groupe, setGroupe]         = useState("Groupe 2");
  const [showAddModal, setShowAddModal]   = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState("");
  const [newSession, setNewSession]       = useState<NewSession>(() => defaultNewSession("Groupe 2"));
  const [saveSuccess, setSaveSuccess]     = useState(false);

  const [rooms, setRooms]           = useState<Room[]>(initialRooms);
  const [showAddRoom, setShowAddRoom]     = useState(false);
  const [newRoom, setNewRoom]             = useState({ nom: "", capacite: "", type: "Salle TD" });

  const [showAddGroup, setShowAddGroup]   = useState(false);
  const [newGroup, setNewGroup]           = useState({ nom: "", niveau: "L3" });
  const [customGroups, setCustomGroups]   = useState<{ nom: string; filiere: string; niveau: string; nb: number }[]>([]);

  function openAddModal(prefill?: Partial<NewSession>) {
    setEditingSessionId(null);
    setNewSession({ ...defaultNewSession(groupe), ...prefill });
    setConflictError("");
    setShowAddModal(true);
  }

  function openEditModal(s: Session) {
    setEditingSessionId(s.id);
    setNewSession({
      jour: s.jour, debut: s.heureDebut, fin: s.heureFin,
      moduleId: s.moduleId ?? s.module,
      enseignant: s.enseignant, salle: s.salle ?? "",
      type: s.type, groupe: s.groupes[0] ?? groupe,
      typeSeance: s.salle ? "presentielle" : "ead",
    });
    setConflictError("");
    setShowAddModal(true);
  }

  function saveSession() {
    if (!newSession.moduleId || !newSession.enseignant) {
      setConflictError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (newSession.typeSeance === "presentielle" && !newSession.salle) {
      setConflictError("Veuillez sélectionner une salle (séance présentielle).");
      return;
    }
    const conflict = detectConflict(sessions, newSession, editingSessionId ?? undefined);
    if (conflict) { setConflictError(conflict); return; }

    const mod = modules.find(m => m.id === newSession.moduleId || m.intitule === newSession.moduleId);

    if (editingSessionId) {
      setSessions(prev => prev.map(s => s.id !== editingSessionId ? s : {
        ...s,
        moduleId: newSession.moduleId,
        module: mod?.intitule ?? newSession.moduleId,
        type: newSession.type as "CM" | "TD" | "TP",
        jour: newSession.jour,
        heureDebut: newSession.debut,
        heureFin: newSession.fin,
        salle: newSession.typeSeance === "ead" ? "En ligne (EAD)" : newSession.salle,
        enseignant: newSession.enseignant,
        groupes: [newSession.groupe],
      }) as Session[]);
    } else {
      const newS: Session = {
        id: `s${Date.now()}`,
        moduleId: newSession.moduleId,
        module: mod?.intitule ?? newSession.moduleId,
        type: newSession.type as "CM" | "TD" | "TP",
        jour: newSession.jour,
        heureDebut: newSession.debut,
        heureFin: newSession.fin,
        salle: newSession.typeSeance === "ead" ? "En ligne (EAD)" : newSession.salle,
        enseignant: newSession.enseignant,
        statut: "normal",
        groupes: [newSession.groupe],
      };
      setSessions(prev => [...prev, newS]);
    }

    setShowAddModal(false);
    setEditingSessionId(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  function deleteSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  function addRoom() {
    if (!newRoom.nom || !newRoom.capacite) return;
    setRooms(prev => [...prev, { id: `r${Date.now()}`, nom: newRoom.nom, capacite: parseInt(newRoom.capacite) || 40, type: newRoom.type, disponible: true }]);
    setNewRoom({ nom: "", capacite: "", type: "Salle TD" });
    setShowAddRoom(false);
  }

  function toggleRoomAvailability(id: string) {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, disponible: !r.disponible } : r));
  }

  function addGroup() {
    if (!newGroup.nom) return;
    setCustomGroups(prev => [...prev, { nom: newGroup.nom, filiere: AGENT_DEPT, niveau: newGroup.niveau, nb: 0 }]);
    setNewGroup({ nom: "", niveau: "L3" });
    setShowAddGroup(false);
  }

  const filteredSessions = sessions.filter(s => s.groupes.includes(groupe) || groupe === "all");

  function getSessionForCell(jour: string, debut: string) {
    return filteredSessions.find(s => s.jour === jour && s.heureDebut === debut);
  }

  const allGroups = [
    ...Object.entries(groupesParNiveau).flatMap(([niv, grps]) =>
      grps.map(g => ({ nom: g, filiere: AGENT_DEPT, niveau: niv, nb: ({"L1":34,"L2":30,"L3":26,"M1":20,"M2":18} as Record<string,number>)[niv] ?? 25 }))
    ),
    ...customGroups,
  ];

  const suggestions = buildSuggestions(sessions, groupe);

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

          <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Emplois du temps</h1>
              <p className="text-muted-foreground mt-1">Configurez les plannings, salles et groupes.</p>
            </div>
            <div className="flex gap-2">
              {activeTab === "timetable" && (
                <>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Download className="w-3.5 h-3.5" />Exporter PDF</Button>
                  <Button className="gap-2" size="sm" onClick={() => openAddModal()}>
                    <Plus className="w-4 h-4" />Ajouter une séance
                  </Button>
                </>
              )}
              {activeTab === "rooms" && (
                <Button className="gap-2" size="sm" onClick={() => setShowAddRoom(true)}><Plus className="w-4 h-4" />Ajouter une salle</Button>
              )}
              {activeTab === "groups" && (
                <Button className="gap-2" size="sm" onClick={() => setShowAddGroup(true)}><Plus className="w-4 h-4" />Ajouter un groupe</Button>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={item} className="flex border-b border-border gap-1">
            {([
              { key: "timetable", icon: CalendarDays, label: "Emplois du temps" },
              { key: "rooms",     icon: DoorOpen,     label: `Salles (${rooms.length})` },
              { key: "groups",    icon: UsersRound,   label: `Groupes (${allGroups.length})` },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </motion.div>

          {saveSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
                <CheckCircle className="w-4 h-4" />Séance enregistrée avec succès.
              </div>
            </motion.div>
          )}

          {/* ── TIMETABLE TAB ── */}
          {activeTab === "timetable" && (
            <>
              <motion.div variants={item} className="flex gap-3 flex-wrap items-end">
                {/* Locked département */}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Département</label>
                  <div className="h-9 px-3 flex items-center rounded-md border border-input bg-muted/30 text-sm text-muted-foreground gap-1.5 cursor-not-allowed">
                    {AGENT_DEPT}
                    <span className="text-[10px] bg-muted rounded px-1">non modifiable</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Niveau</label>
                  <Select value={niveau} onValueChange={setNiveau}>
                    <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{["L1","L2","L3","M1","M2"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Groupe</label>
                  <Select value={groupe} onValueChange={setGroupe}>
                    <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(groupesParNiveau[niveau] ?? ["Groupe 1","Groupe 2"]).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-2">
                  {Object.entries(typeColors).map(([type, cls]) => (
                    <div key={type} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded border ${cls}`} />
                      <span>{type === "CM" ? "Cours" : type === "TD" ? "Trav. Dirigés" : "Trav. Pratiques"}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={item}>
                <Card className="overflow-auto">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">{AGENT_DEPT} {niveau} — {groupe}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{filteredSessions.length} séance(s) planifiée(s)</span>
                  </div>
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-28">Horaire</th>
                        {jours.map(j => <th key={j} className="text-center px-2 py-3 font-semibold text-foreground text-sm">{j}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {creneaux.map(cr => (
                        <tr key={cr.debut} className="border-b border-border/50">
                          <td className="px-4 py-3 text-muted-foreground text-xs font-medium">{cr.debut}<br />{cr.fin}</td>
                          {jours.map(jour => {
                            const s = getSessionForCell(jour, cr.debut);
                            const isConflict = s && sessions.filter(x => x.id !== s.id && x.jour === jour && x.heureDebut === cr.debut && (x.salle === s.salle || x.enseignant === s.enseignant)).length > 0;
                            const isEad = s?.salle === "En ligne (EAD)";
                            return (
                              <td key={jour} className="px-2 py-2 text-center align-middle">
                                {s ? (
                                  <div className={`rounded-lg p-2 border text-left group relative cursor-pointer ${isConflict ? "bg-red-50 border-red-300" : s.statut === "annule" ? "bg-muted/30 border-border opacity-60" : "bg-card border-border shadow-sm hover:shadow-md transition-shadow"}`}
                                    onClick={() => openEditModal(s)}>
                                    {isConflict && <AlertTriangle className="w-3 h-3 text-red-500 absolute top-1 left-1" />}
                                    {isEad && <Wifi className="w-3 h-3 text-blue-500 absolute top-1 right-5" />}
                                    <p className="font-semibold text-xs leading-tight">{s.module}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                      {isEad ? <><Wifi className="w-2.5 h-2.5 text-blue-400" />EAD</> : <><MapPin className="w-2.5 h-2.5" />{s.salle}</>}
                                    </p>
                                    <div className="flex gap-1 mt-1 flex-wrap items-center justify-between">
                                      <Badge className={`text-[10px] border ${typeColors[s.type]} px-1 py-0`}>{s.type}</Badge>
                                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={e => { e.stopPropagation(); openEditModal(s); }} className="p-0.5 rounded hover:bg-blue-100 text-blue-400">
                                          <Edit className="w-3 h-3" />
                                        </button>
                                        <button onClick={e => { e.stopPropagation(); deleteSession(s.id); }} className="p-0.5 rounded hover:bg-red-100 text-red-400">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div onClick={() => openAddModal({ jour, debut: cr.debut, fin: cr.fin })}
                                    className="h-16 rounded-lg bg-muted/10 border border-dashed border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer flex items-center justify-center group">
                                    <Plus className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </motion.div>
            </>
          )}

          {/* ── ROOMS TAB ── */}
          {activeTab === "rooms" && (
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Salle</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Capacité</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Type</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Disponibilité</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Occupation sem.</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map(r => {
                        const occupation = sessions.filter(s => s.salle === r.nom).length;
                        return (
                          <tr key={r.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 font-semibold">{r.nom}</td>
                            <td className="px-4 py-3 text-center">{r.capacite} places</td>
                            <td className="px-4 py-3">
                              <Badge className={`text-xs border ${r.type === "Amphithéâtre" ? "bg-purple-100 text-purple-700 border-purple-200" : r.type === "Laboratoire" ? "bg-teal-100 text-teal-700 border-teal-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>{r.type}</Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge className={`text-xs border ${r.disponible ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}>{r.disponible ? "Disponible" : "Indisponible"}</Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`font-semibold ${occupation > 3 ? "text-amber-600" : ""}`}>{occupation}</span>
                              <span className="text-xs text-muted-foreground"> séance(s)</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => toggleRoomAvailability(r.id)}>
                                {r.disponible ? "Désactiver" : "Activer"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── GROUPS TAB ── */}
          {activeTab === "groups" && (
            <motion.div variants={item}>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Groupe</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Filière</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Niveau</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Nb étudiants</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allGroups.map((g, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-semibold">{g.nom}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{g.filiere}</td>
                          <td className="px-4 py-3 text-center"><Badge className="text-xs bg-primary/10 text-primary border-primary/20">{g.niveau}</Badge></td>
                          <td className="px-4 py-3 text-center font-semibold">{g.nb}</td>
                          <td className="px-4 py-3 text-center">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setActiveTab("timetable"); setGroupe(g.nom); setNiveau(g.niveau); }}>
                              <CalendarDays className="w-3.5 h-3.5 mr-1" />Voir EDT
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

        </motion.div>
      </main>

      {/* ── ADD / EDIT SESSION MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 w-full max-w-lg max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base">{editingSessionId ? "Modifier la séance" : "Nouvelle séance"}</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setShowAddModal(false); setEditingSessionId(null); }}><X className="w-4 h-4" /></Button>
                </div>

                {/* Suggestions (only for new sessions) */}
                {!editingSessionId && suggestions.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-muted/20 border border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions :</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((sug, i) => {
                        const modObj = modules.find(m => m.id === sug.moduleId || m.intitule === sug.moduleId);
                        return (
                          <button key={i}
                            onClick={() => setNewSession(prev => ({ ...prev, ...sug, moduleId: sug.moduleId ?? prev.moduleId, enseignant: sug.enseignant ?? prev.enseignant }))}
                            className="text-xs px-2.5 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                            {modObj?.intitule ?? sug.moduleId} · {sug.enseignant?.split(" ").slice(-1)[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Jour *</label>
                    <Select value={newSession.jour} onValueChange={v => setNewSession(prev => ({ ...prev, jour: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{jours.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Créneau *</label>
                    <Select value={newSession.debut} onValueChange={v => {
                      const cr = creneaux.find(c => c.debut === v);
                      setNewSession(prev => ({ ...prev, debut: v, fin: cr?.fin ?? v }));
                    }}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{creneaux.map(c => <SelectItem key={c.debut} value={c.debut}>{c.debut} – {c.fin}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Module *</label>
                    <Select value={newSession.moduleId} onValueChange={v => setNewSession(prev => ({ ...prev, moduleId: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir un module…" /></SelectTrigger>
                      <SelectContent>{modules.map(m => <SelectItem key={m.id} value={m.id}>{m.intitule}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Enseignant *</label>
                    <Select value={newSession.enseignant} onValueChange={v => setNewSession(prev => ({ ...prev, enseignant: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent>{agentTeachers.map(t => <SelectItem key={t.id} value={`Dr. ${t.prenom} ${t.nom}`}>Dr. {t.prenom} {t.nom}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Type de cours</label>
                    <Select value={newSession.type} onValueChange={v => setNewSession(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CM">CM — Cours magistral</SelectItem>
                        <SelectItem value="TD">TD — Travaux dirigés</SelectItem>
                        <SelectItem value="TP">TP — Travaux pratiques</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Groupe</label>
                    <Select value={newSession.groupe} onValueChange={v => setNewSession(prev => ({ ...prev, groupe: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(groupesParNiveau[niveau] ?? ["Groupe 1","Groupe 2"]).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Type de séance</label>
                    <div className="flex gap-3">
                      {[
                        { val: "presentielle", label: "Présentielle", icon: <MapPin className="w-3.5 h-3.5" /> },
                        { val: "ead",          label: "En ligne (EAD)", icon: <Wifi className="w-3.5 h-3.5" /> },
                      ].map(opt => (
                        <button key={opt.val} type="button"
                          onClick={() => setNewSession(prev => ({ ...prev, typeSeance: opt.val as "presentielle" | "ead", salle: opt.val === "ead" ? "" : prev.salle }))}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${newSession.typeSeance === opt.val ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/30"}`}>
                          {opt.icon}{opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {newSession.typeSeance === "presentielle" && (
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Salle *</label>
                      <Select value={newSession.salle} onValueChange={v => setNewSession(prev => ({ ...prev, salle: v }))}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir une salle…" /></SelectTrigger>
                        <SelectContent>
                          {rooms.filter(r => r.disponible).map(r => <SelectItem key={r.id} value={r.nom}>{r.nom} ({r.capacite} places)</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newSession.typeSeance === "ead" && (
                    <div className="col-span-2 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                      <Wifi className="w-4 h-4 flex-shrink-0" />
                      Séance en ligne (EAD) — aucune salle physique requise.
                    </div>
                  )}
                </div>

                {conflictError && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />{conflictError}
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => { setShowAddModal(false); setEditingSessionId(null); }}>Annuler</Button>
                  <Button className="flex-1 gap-2" onClick={saveSession}>
                    <Save className="w-4 h-4" />{editingSessionId ? "Enregistrer" : "Ajouter"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD ROOM MODAL ── */}
      <AnimatePresence>
        {showAddRoom && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base">Nouvelle salle</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowAddRoom(false)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div><label className="text-xs font-medium text-muted-foreground block mb-1">Nom / Numéro *</label><Input placeholder="Ex: C112" value={newRoom.nom} onChange={e => setNewRoom(p => ({ ...p, nom: e.target.value }))} className="h-9 text-sm" /></div>
                  <div><label className="text-xs font-medium text-muted-foreground block mb-1">Capacité *</label><Input type="number" placeholder="40" value={newRoom.capacite} onChange={e => setNewRoom(p => ({ ...p, capacite: e.target.value }))} className="h-9 text-sm" /></div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Type</label>
                    <Select value={newRoom.type} onValueChange={v => setNewRoom(p => ({ ...p, type: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Salle TD">Salle TD</SelectItem>
                        <SelectItem value="Amphithéâtre">Amphithéâtre</SelectItem>
                        <SelectItem value="Laboratoire">Laboratoire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddRoom(false)}>Annuler</Button>
                  <Button className="flex-1" disabled={!newRoom.nom || !newRoom.capacite} onClick={addRoom}>Ajouter</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD GROUP MODAL ── */}
      <AnimatePresence>
        {showAddGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base">Nouveau groupe</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowAddGroup(false)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div><label className="text-xs font-medium text-muted-foreground block mb-1">Nom du groupe *</label><Input placeholder="Ex: Groupe 5" value={newGroup.nom} onChange={e => setNewGroup(p => ({ ...p, nom: e.target.value }))} className="h-9 text-sm" /></div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Niveau</label>
                    <Select value={newGroup.niveau} onValueChange={v => setNewGroup(p => ({ ...p, niveau: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{["L1","L2","L3","M1","M2"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddGroup(false)}>Annuler</Button>
                  <Button className="flex-1" disabled={!newGroup.nom} onClick={addGroup}>Créer</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
