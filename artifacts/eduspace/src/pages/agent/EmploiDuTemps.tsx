import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CalendarDays, Plus, Edit, Save, X, AlertTriangle, DoorOpen,
  UsersRound, Trash2, CheckCircle, Download, Wifi, MapPin, Clock,
} from "lucide-react";
import { agent as api } from "@/lib/api";
import { getAgentFiliere } from "@/lib/auth";

const JOURS_BASE = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"];
const JOURS_ALL  = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const STD_CRENEAUX = [
  { debut: "08:00", fin: "09:30" }, { debut: "09:45", fin: "11:15" },
  { debut: "11:30", fin: "13:00" }, { debut: "13:30", fin: "15:00" }, { debut: "15:15", fin: "16:45" },
];
const NIVEAUX = ["L1", "L2", "L3", "M1", "M2", "ING1", "ING2", "ING3", "ING4", "ING5"];

const typeColors: Record<string, string> = {
  CM: "bg-blue-100 text-blue-800 border-blue-200",
  TD: "bg-indigo-100 text-indigo-800 border-indigo-200",
  TP: "bg-teal-100 text-teal-800 border-teal-200",
};

type Seance = {
  id: number; moduleId: number | null; module: string; type: "CM" | "TD" | "TP";
  jour: string; heureDebut: string; heureFin: string;
  salleId: number | null; salle: string | null;
  enseignantId: number | null; enseignant: string | null;
  statut: string; filiere: string; niveau: string; semestre: string; groupes: string[];
};
type Mod = { id: number; intitule: string; niveau: string; semestre: string; filiere: string };
type Teacher = { id: number; nom: string; prenom: string; departement: string };
type Salle = { id: number; nom: string; capacite: number; type: string; disponible: boolean };
type Student = { niveau: string; section: string; groupe: string; filiere: string };

type NewSession = {
  jour: string; debut: string; fin: string; isCustomCreneau: boolean;
  semestre: string; moduleId: string; enseignantId: string; salleId: string;
  type: "CM" | "TD" | "TP"; section: string; groupe: string;
  typeSeance: "presentielle" | "ead";
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
type TabType = "timetable" | "rooms" | "groups";

function exportTimetablePDF(sessions: Seance[], scope: string, niveau: string, dept: string, creneauxList: { debut: string; fin: string }[], jours: string[]) {
  const tc: Record<string, string> = { CM: "#dbeafe:#1d4ed8", TD: "#e0e7ff:#4338ca", TP: "#ccfbf1:#0f766e" };
  const headerCells = jours.map(j => `<th style="padding:10px 8px;background:#f1f5f9;font-size:12px;border:1px solid #e2e8f0">${j}</th>`).join("");
  const rows = creneauxList.map(cr => {
    const cells = jours.map(jour => {
      const list = sessions.filter(x => x.jour === jour && x.heureDebut === cr.debut);
      if (list.length === 0) return `<td style="border:1px solid #e2e8f0;padding:6px"></td>`;
      return `<td style="border:1px solid #e2e8f0;padding:4px;vertical-align:top">` + list.map(s => {
        const [bg, color] = (tc[s.type] ?? "#f8fafc:#374151").split(":");
        return `<div style="background:${bg};border-radius:6px;padding:6px;font-size:10px;margin-bottom:3px">
          <div style="font-weight:bold;color:${color}">${s.module}</div>
          <div style="color:#64748b">${s.salle ?? "EAD"} · ${(s.groupes || []).join(", ")}</div>
          <span style="background:${color};color:#fff;font-size:8px;padding:1px 5px;border-radius:3px">${s.type}</span>
        </div>`;
      }).join("") + `</td>`;
    }).join("");
    return `<tr><td style="border:1px solid #e2e8f0;padding:8px;font-size:11px;color:#64748b;white-space:nowrap;background:#f8fafc">${cr.debut}<br/>${cr.fin}</td>${cells}</tr>`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Emploi du temps</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:20px}h2{font-size:16px;color:#1e293b}p{font-size:12px;color:#64748b;margin-bottom:16px}table{width:100%;border-collapse:collapse}@media print{@page{size:A4 landscape;margin:10mm}}</style></head>
  <body><h2>Emploi du temps — ${dept} ${niveau}</h2><p>${scope} • ${new Date().toLocaleDateString("fr-DZ")}</p>
  <table><thead><tr><th style="padding:10px 8px;background:#f1f5f9;font-size:12px;border:1px solid #e2e8f0">Horaire</th>${headerCells}</tr></thead><tbody>${rows}</tbody></table>
  <script>window.onload=function(){window.print()}</script></body></html>`;
  const win = window.open("", "_blank"); if (!win) return; win.document.write(html); win.document.close();
}

export default function AgentEmploiDuTemps() {
  const agentFiliere = getAgentFiliere();

  const [activeTab, setActiveTab] = useState<TabType>("timetable");
  const [sessions, setSessions]   = useState<Seance[]>([]);
  const [mods, setMods]           = useState<Mod[]>([]);
  const [teachers, setTeachers]   = useState<Teacher[]>([]);
  const [salles, setSalles]       = useState<Salle[]>([]);
  const [students, setStudents]   = useState<Student[]>([]);
  const [loading, setLoading]     = useState(true);

  const [niveau, setNiveau]             = useState("L3");
  const [filterSection, setFilterSection] = useState("all");
  const [filterGroupe, setFilterGroupe]   = useState("all");

  const [showAddModal, setShowAddModal]   = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [conflictError, setConflictError] = useState("");
  const [newSession, setNewSession]       = useState<NewSession>(() => defaultNewSession());
  const [saveSuccess, setSaveSuccess]     = useState("");
  const [busy, setBusy]                   = useState(false);

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom]         = useState({ nom: "", capacite: "", type: "Salle TD" });

  function defaultNewSession(): NewSession {
    return {
      jour: "Dimanche", debut: "08:00", fin: "09:30", isCustomCreneau: false,
      semestre: "", moduleId: "", enseignantId: "", salleId: "", type: "CM",
      section: "", groupe: "", typeSeance: "presentielle",
    };
  }

  const fetchSeances = useCallback(async () => {
    const data = await api.seances() as Seance[];
    setSessions(data ?? []);
  }, []);
  const fetchSalles = useCallback(async () => {
    setSalles((await api.salles() as Salle[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [se, md, te, sa, st] = await Promise.all([
          api.seances(), api.modules(), api.teachers(), api.salles(), api.students(),
        ]);
        setSessions((se as Seance[]) ?? []);
        setMods((md as Mod[]) ?? []);
        setTeachers(((te as Record<string, unknown>[]) ?? []).map(t => ({ id: Number(t.id), nom: String(t.nom ?? ""), prenom: String(t.prenom ?? ""), departement: String(t.departement ?? "") })));
        setSalles((sa as Salle[]) ?? []);
        setStudents(((st as Record<string, unknown>[]) ?? []).map(s => ({
          niveau: String(s.niveau ?? ""), section: String(s.section ?? ""), groupe: String(s.groupe ?? ""), filiere: String(s.filiere ?? ""),
        })));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  // Section → groups map for the current niveau, built from real student records
  const sectionGroups = useMemo(() => {
    const map: Record<string, string[]> = {};
    students.filter(s => s.filiere === agentFiliere && s.niveau === niveau).forEach(s => {
      const sec = s.section || "Section 1";
      (map[sec] ??= []);
      if (s.groupe && !map[sec].includes(s.groupe)) map[sec].push(s.groupe);
    });
    Object.values(map).forEach(g => g.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })));
    return map;
  }, [students, agentFiliere, niveau]);

  const sectionOptions = useMemo(() => Object.keys(sectionGroups).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [sectionGroups]);
  const groupOptions = useMemo(() => {
    const base = filterSection !== "all" ? (sectionGroups[filterSection] ?? []) : Object.values(sectionGroups).flat();
    return [...new Set(base)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [sectionGroups, filterSection]);

  // ── Hierarchical filter: Niveau → Section → Groupe ──
  const filteredSessions = useMemo(() => {
    let list = sessions.filter(s => s.filiere === agentFiliere && s.niveau === niveau);
    if (filterGroupe !== "all") {
      list = list.filter(s => s.groupes.includes(filterGroupe));
    } else if (filterSection !== "all") {
      const secGroups = sectionGroups[filterSection] ?? [];
      list = list.filter(s => s.groupes.some(g => secGroups.includes(g)));
    }
    return list;
  }, [sessions, agentFiliere, niveau, filterSection, filterGroupe, sectionGroups]);

  const jours = useMemo(() => {
    const present = new Set(filteredSessions.map(s => s.jour));
    const extra = JOURS_ALL.filter(j => present.has(j) && !JOURS_BASE.includes(j));
    return [...JOURS_BASE, ...extra];
  }, [filteredSessions]);

  const activeCreneaux = useMemo(() => {
    const map = new Map<string, { debut: string; fin: string }>();
    STD_CRENEAUX.forEach(c => map.set(c.debut, c));
    filteredSessions.forEach(s => map.set(s.heureDebut, { debut: s.heureDebut, fin: s.heureFin }));
    return [...map.values()].sort((a, b) => a.debut.localeCompare(b.debut));
  }, [filteredSessions]);

  function cellSessions(jour: string, debut: string) {
    return filteredSessions.filter(s => s.jour === jour && s.heureDebut === debut);
  }

  const semestreOptions = useMemo(() => {
    const sems = [...new Set(mods.filter(m => m.filiere === agentFiliere && m.niveau === niveau).map(m => m.semestre))].sort();
    return sems.length ? sems : ["S1"];
  }, [mods, agentFiliere, niveau]);

  const moduleOptions = useMemo(
    () => mods.filter(m => m.filiere === agentFiliere && m.niveau === niveau && (!newSession.semestre || m.semestre === newSession.semestre)),
    [mods, agentFiliere, niveau, newSession.semestre],
  );

  // Teachers of this department (fallback to all if none tagged)
  const deptTeachers = useMemo(() => {
    const own = teachers.filter(t => t.departement === agentFiliere);
    return (own.length ? own : teachers).slice().sort((a, b) => a.nom.localeCompare(b.nom));
  }, [teachers, agentFiliere]);

  function openAddModal(prefill?: Partial<NewSession>) {
    setEditingSessionId(null);
    setConflictError("");
    setNewSession({
      ...defaultNewSession(),
      semestre: semestreOptions[0] ?? "S1",
      section: sectionOptions[0] ?? "Section 1",
      groupe: groupOptions[0] ?? "Groupe 1",
      ...prefill,
    });
    setShowAddModal(true);
  }

  function openEditModal(s: Seance) {
    setEditingSessionId(s.id);
    setConflictError("");
    const isCustom = !STD_CRENEAUX.some(c => c.debut === s.heureDebut);
    // For CM, find which section these groups belong to
    let section = sectionOptions[0] ?? "Section 1";
    for (const [sec, grps] of Object.entries(sectionGroups)) {
      if (s.groupes.some(g => grps.includes(g))) { section = sec; break; }
    }
    setNewSession({
      jour: s.jour, debut: s.heureDebut, fin: s.heureFin, isCustomCreneau: isCustom,
      semestre: s.semestre || semestreOptions[0] || "S1",
      moduleId: s.moduleId ? String(s.moduleId) : "",
      enseignantId: s.enseignantId ? String(s.enseignantId) : "",
      salleId: s.salleId ? String(s.salleId) : "",
      type: s.type,
      section,
      groupe: s.type !== "CM" ? (s.groupes[0] ?? "") : "",
      typeSeance: s.salle ? "presentielle" : "ead",
    });
    setShowAddModal(true);
  }

  async function saveSession() {
    setConflictError("");
    if (!newSession.moduleId) return setConflictError("Veuillez choisir un module.");
    if (!newSession.enseignantId) return setConflictError("Veuillez choisir un enseignant.");
    if (newSession.typeSeance === "presentielle" && !newSession.salleId) return setConflictError("Veuillez choisir une salle (séance présentielle).");
    if (!newSession.debut || !newSession.fin) return setConflictError("Veuillez indiquer le créneau horaire.");

    const groupes = newSession.type === "CM"
      ? (sectionGroups[newSession.section] ?? [])
      : (newSession.groupe ? [newSession.groupe] : []);
    if (groupes.length === 0) {
      return setConflictError(newSession.type === "CM"
        ? "Cette section n'a pas encore de groupes. Organisez d'abord les étudiants."
        : "Veuillez choisir un groupe.");
    }

    // Soft conflict: same room, same slot
    if (newSession.typeSeance === "presentielle") {
      const clash = sessions.find(s => s.id !== editingSessionId && s.jour === newSession.jour && s.heureDebut === newSession.debut && s.salleId === Number(newSession.salleId));
      if (clash) return setConflictError(`Conflit de salle : déjà utilisée ${newSession.jour} à ${newSession.debut}.`);
    }

    const body = {
      module_id: Number(newSession.moduleId),
      enseignant_id: Number(newSession.enseignantId),
      salle_id: newSession.typeSeance === "ead" ? null : Number(newSession.salleId),
      type: newSession.type, jour: newSession.jour,
      heure_debut: newSession.debut, heure_fin: newSession.fin,
      groupes, statut: "normal",
      filiere: agentFiliere, niveau, semestre: newSession.semestre,
    };

    setBusy(true);
    try {
      if (editingSessionId) await api.updateSeance(editingSessionId, body);
      else await api.storeSeance(body);
      await fetchSeances();
      setShowAddModal(false);
      setEditingSessionId(null);
      setSaveSuccess(editingSessionId ? "Séance modifiée." : "Séance ajoutée.");
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (e) {
      setConflictError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement.");
    } finally { setBusy(false); }
  }

  async function deleteSession(id: number) {
    setBusy(true);
    try { await api.deleteSeance(id); await fetchSeances(); } catch { /* ignore */ } finally { setBusy(false); }
  }

  // ── Rooms ──
  async function addRoom() {
    if (!newRoom.nom || !newRoom.capacite) return;
    try {
      await api.storeSalle({ nom: newRoom.nom, capacite: Number(newRoom.capacite) || 40, type: newRoom.type, disponible: true });
      await fetchSalles();
      setNewRoom({ nom: "", capacite: "", type: "Salle TD" });
      setShowAddRoom(false);
    } catch { /* ignore */ }
  }
  async function toggleRoom(s: Salle) { try { await api.updateSalle(s.id, { disponible: !s.disponible }); await fetchSalles(); } catch { /* ignore */ } }
  async function deleteRoom(id: number) { try { await api.deleteSalle(id); await fetchSalles(); } catch { /* ignore */ } }

  // ── Groups (derived from real students) ──
  const allGroups = useMemo(() => {
    const map = new Map<string, { nom: string; filiere: string; niveau: string; section: string; nb: number }>();
    students.filter(s => s.filiere === agentFiliere).forEach(s => {
      const key = `${s.niveau}|${s.section}|${s.groupe}`;
      const cur = map.get(key) ?? { nom: s.groupe, filiere: s.filiere, niveau: s.niveau, section: s.section, nb: 0 };
      cur.nb++; map.set(key, cur);
    });
    return [...map.values()].sort((a, b) => a.niveau.localeCompare(b.niveau) || a.nom.localeCompare(b.nom, undefined, { numeric: true }));
  }, [students, agentFiliere]);

  const scopeLabel = filterGroupe !== "all" ? filterGroupe : filterSection !== "all" ? filterSection : "Toutes sections / groupes";

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

          <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Emplois du temps</h1>
              <p className="text-muted-foreground mt-1">Configurez les plannings, salles et groupes — {agentFiliere}.</p>
            </div>
            <div className="flex gap-2">
              {activeTab === "timetable" && (
                <>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => exportTimetablePDF(filteredSessions, scopeLabel, niveau, agentFiliere, activeCreneaux, jours)}>
                    <Download className="w-3.5 h-3.5" />Exporter PDF
                  </Button>
                  <Button className="gap-2" size="sm" onClick={() => openAddModal()}><Plus className="w-4 h-4" />Ajouter une séance</Button>
                </>
              )}
              {activeTab === "rooms" && <Button className="gap-2" size="sm" onClick={() => setShowAddRoom(true)}><Plus className="w-4 h-4" />Ajouter une salle</Button>}
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={item} className="flex border-b border-border gap-1">
            {([
              { key: "timetable", icon: CalendarDays, label: "Emplois du temps" },
              { key: "rooms", icon: DoorOpen, label: `Salles (${salles.length})` },
              { key: "groups", icon: UsersRound, label: `Groupes (${allGroups.length})` },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </motion.div>

          {saveSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800"><CheckCircle className="w-4 h-4" />{saveSuccess}</div>
            </motion.div>
          )}

          {/* ── TIMETABLE TAB ── */}
          {activeTab === "timetable" && (
            <>
              <motion.div variants={item} className="flex gap-3 flex-wrap items-end">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Département</label>
                  <div className="h-9 px-3 flex items-center rounded-md border border-input bg-muted/30 text-sm text-muted-foreground gap-1.5 cursor-not-allowed">
                    {agentFiliere}<span className="text-[10px] bg-muted rounded px-1">non modifiable</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Niveau</label>
                  <Select value={niveau} onValueChange={v => { setNiveau(v); setFilterSection("all"); setFilterGroupe("all"); }}>
                    <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{NIVEAUX.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Section</label>
                  <Select value={filterSection} onValueChange={v => { setFilterSection(v); setFilterGroupe("all"); }}>
                    <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les sections</SelectItem>
                      {sectionOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Groupe</label>
                  <Select value={filterGroupe} onValueChange={setFilterGroupe}>
                    <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les groupes</SelectItem>
                      {groupOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-2">
                  {Object.entries(typeColors).map(([type, cls]) => (
                    <div key={type} className="flex items-center gap-1"><div className={`w-3 h-3 rounded border ${cls}`} /><span>{type === "CM" ? "Cours" : type === "TD" ? "Trav. Dirigés" : "Trav. Pratiques"}</span></div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={item}>
                <Card className="overflow-auto">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">{agentFiliere} {niveau} — {scopeLabel}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{loading ? "Chargement…" : `${filteredSessions.length} séance(s)`}</span>
                  </div>
                  <table className="w-full text-sm border-collapse" style={{ minWidth: "760px" }}>
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-24">Horaire</th>
                        {jours.map(j => <th key={j} className="text-center px-2 py-3 font-semibold text-foreground text-sm">{j}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {activeCreneaux.map(cr => (
                        <tr key={cr.debut} className="border-b border-border/50">
                          <td className="px-4 py-3 text-muted-foreground text-xs font-medium whitespace-nowrap">{cr.debut}<br />{cr.fin}</td>
                          {jours.map(jour => {
                            const list = cellSessions(jour, cr.debut);
                            return (
                              <td key={jour} className="px-1.5 py-1.5 align-top">
                                {list.length === 0 ? (
                                  <div onClick={() => openAddModal({ jour, debut: cr.debut, fin: cr.fin, isCustomCreneau: !STD_CRENEAUX.some(c => c.debut === cr.debut) })}
                                    className="h-16 rounded-lg bg-muted/10 border border-dashed border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-colors cursor-pointer flex items-center justify-center group">
                                    <Plus className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50" />
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    {list.map(s => {
                                      const isEad = !s.salle;
                                      return (
                                        <div key={s.id} onClick={() => openEditModal(s)}
                                          className={`rounded-lg p-2 border text-left group relative cursor-pointer ${s.statut === "annule" ? "bg-muted/30 border-border opacity-60" : "bg-card border-border shadow-sm hover:shadow-md transition-shadow"}`}>
                                          <p className="font-semibold text-xs leading-tight">{s.module}</p>
                                          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                            {isEad ? <><Wifi className="w-2.5 h-2.5 text-blue-400" />EAD</> : <><MapPin className="w-2.5 h-2.5" />{s.salle}</>}
                                          </p>
                                          <p className="text-[11px] text-muted-foreground flex items-center gap-1"><UsersRound className="w-2.5 h-2.5" />{s.groupes.join(", ")}</p>
                                          <div className="flex gap-1 mt-1 items-center justify-between">
                                            <Badge className={`text-[10px] border ${typeColors[s.type]} px-1 py-0`}>{s.type}</Badge>
                                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button onClick={e => { e.stopPropagation(); openEditModal(s); }} className="p-0.5 rounded hover:bg-blue-100 text-blue-400"><Edit className="w-3 h-3" /></button>
                                              <button onClick={e => { e.stopPropagation(); deleteSession(s.id); }} className="p-0.5 rounded hover:bg-red-100 text-red-400"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
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
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Occupation</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salles.map(r => {
                        const occ = sessions.filter(s => s.salleId === r.id).length;
                        return (
                          <tr key={r.id} className="border-b border-border/50 hover:bg-muted/10">
                            <td className="px-4 py-3 font-semibold">{r.nom}</td>
                            <td className="px-4 py-3 text-center">{r.capacite} places</td>
                            <td className="px-4 py-3"><Badge className={`text-xs border ${r.type === "Amphithéâtre" ? "bg-purple-100 text-purple-700 border-purple-200" : r.type === "Laboratoire" ? "bg-teal-100 text-teal-700 border-teal-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}>{r.type}</Badge></td>
                            <td className="px-4 py-3 text-center"><Badge className={`text-xs border ${r.disponible ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}>{r.disponible ? "Disponible" : "Indisponible"}</Badge></td>
                            <td className="px-4 py-3 text-center"><span className={`font-semibold ${occ > 6 ? "text-amber-600" : ""}`}>{occ}</span><span className="text-xs text-muted-foreground"> séance(s)</span></td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => toggleRoom(r)}>{r.disponible ? "Désactiver" : "Activer"}</Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600" onClick={() => deleteRoom(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {salles.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">Aucune salle.</td></tr>}
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
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Section</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Niveau</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Nb étudiants</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allGroups.map((g, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/10">
                          <td className="px-4 py-3 font-semibold">{g.nom}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{g.section || "—"}</td>
                          <td className="px-4 py-3 text-center"><Badge className="text-xs bg-primary/10 text-primary border-primary/20">{g.niveau}</Badge></td>
                          <td className="px-4 py-3 text-center font-semibold">{g.nb}</td>
                          <td className="px-4 py-3 text-center">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setActiveTab("timetable"); setNiveau(g.niveau); setFilterSection(g.section || "all"); setFilterGroupe(g.nom); }}>
                              <CalendarDays className="w-3.5 h-3.5 mr-1" />Voir EDT
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {allGroups.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">Aucun groupe — organisez d'abord les étudiants.</td></tr>}
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base">{editingSessionId ? "Modifier la séance" : "Nouvelle séance"}</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setShowAddModal(false); setEditingSessionId(null); }}><X className="w-4 h-4" /></Button>
                </div>
                <div className="mb-4 flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                  <span className="text-muted-foreground">Niveau :</span>
                  <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10">{agentFiliere} {niveau}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Jour *</label>
                    <Select value={newSession.jour} onValueChange={v => setNewSession(p => ({ ...p, jour: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{JOURS_ALL.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Créneau *</label>
                    <Select value={newSession.isCustomCreneau ? "__custom" : newSession.debut}
                      onValueChange={v => {
                        if (v === "__custom") setNewSession(p => ({ ...p, isCustomCreneau: true, debut: "", fin: "" }));
                        else { const cr = STD_CRENEAUX.find(c => c.debut === v); setNewSession(p => ({ ...p, isCustomCreneau: false, debut: v, fin: cr?.fin ?? v })); }
                      }}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent>
                        {STD_CRENEAUX.map(c => <SelectItem key={c.debut} value={c.debut}>{c.debut} – {c.fin}</SelectItem>)}
                        <SelectItem value="__custom"><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Personnalisé…</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newSession.isCustomCreneau && (
                    <>
                      <div><label className="text-xs font-medium text-muted-foreground block mb-1">Début *</label><Input type="time" value={newSession.debut} onChange={e => setNewSession(p => ({ ...p, debut: e.target.value }))} className="h-9 text-sm" /></div>
                      <div><label className="text-xs font-medium text-muted-foreground block mb-1">Fin *</label><Input type="time" value={newSession.fin} onChange={e => setNewSession(p => ({ ...p, fin: e.target.value }))} className="h-9 text-sm" /></div>
                    </>
                  )}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Semestre</label>
                    <Select value={newSession.semestre} onValueChange={v => setNewSession(p => ({ ...p, semestre: v, moduleId: "" }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Semestre" /></SelectTrigger>
                      <SelectContent>{semestreOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Module *</label>
                    <Select value={newSession.moduleId} onValueChange={v => setNewSession(p => ({ ...p, moduleId: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir un module…" /></SelectTrigger>
                      <SelectContent className="max-h-72">{moduleOptions.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.intitule}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Enseignant *</label>
                    <Select value={newSession.enseignantId} onValueChange={v => setNewSession(p => ({ ...p, enseignantId: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent className="max-h-72">{deptTeachers.map(t => <SelectItem key={t.id} value={String(t.id)}>Dr. {t.prenom} {t.nom}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Type de séance</label>
                    <Select value={newSession.type} onValueChange={v => setNewSession(p => ({ ...p, type: v as "CM" | "TD" | "TP" }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CM">CM — Cours magistral (toute la section)</SelectItem>
                        <SelectItem value="TD">TD — Travaux dirigés (un groupe)</SelectItem>
                        <SelectItem value="TP">TP — Travaux pratiques (un groupe)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newSession.type === "CM" ? (
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Section (le CM s'applique à tous ses groupes)</label>
                      <Select value={newSession.section} onValueChange={v => setNewSession(p => ({ ...p, section: v }))}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir une section…" /></SelectTrigger>
                        <SelectContent>{sectionOptions.map(s => <SelectItem key={s} value={s}>{s} ({(sectionGroups[s] ?? []).join(", ") || "aucun groupe"})</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Groupe</label>
                      <Select value={newSession.groupe} onValueChange={v => setNewSession(p => ({ ...p, groupe: v }))}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir un groupe…" /></SelectTrigger>
                        <SelectContent>{[...new Set(Object.values(sectionGroups).flat())].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Séance</label>
                    <div className="flex gap-3">
                      {[{ val: "presentielle", label: "Présentielle", icon: <MapPin className="w-3.5 h-3.5" /> }, { val: "ead", label: "En ligne (EAD)", icon: <Wifi className="w-3.5 h-3.5" /> }].map(opt => (
                        <button key={opt.val} type="button"
                          onClick={() => setNewSession(p => ({ ...p, typeSeance: opt.val as "presentielle" | "ead", salleId: opt.val === "ead" ? "" : p.salleId }))}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium transition-all ${newSession.typeSeance === opt.val ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/30"}`}>
                          {opt.icon}{opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {newSession.typeSeance === "presentielle" && (
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Salle *</label>
                      <Select value={newSession.salleId} onValueChange={v => setNewSession(p => ({ ...p, salleId: v }))}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir une salle…" /></SelectTrigger>
                        <SelectContent className="max-h-72">{salles.filter(r => r.disponible).map(r => <SelectItem key={r.id} value={String(r.id)}>{r.nom} ({r.capacite} places)</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  {newSession.typeSeance === "ead" && (
                    <div className="col-span-2 flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700"><Wifi className="w-4 h-4 flex-shrink-0" />Séance en ligne (EAD) — aucune salle physique requise.</div>
                  )}
                </div>

                {conflictError && <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100"><AlertTriangle className="w-4 h-4 flex-shrink-0" />{conflictError}</div>}

                <div className="flex gap-3 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => { setShowAddModal(false); setEditingSessionId(null); }}>Annuler</Button>
                  <Button className="flex-1 gap-2" disabled={busy} onClick={saveSession}><Save className="w-4 h-4" />{busy ? "…" : editingSessionId ? "Enregistrer" : "Ajouter"}</Button>
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
    </div>
  );
}
