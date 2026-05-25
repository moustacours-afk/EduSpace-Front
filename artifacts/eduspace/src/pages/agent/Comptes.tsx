import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, UserPlus, Edit, UserX, UserCheck, Eye, X, CheckCircle,
  GraduationCap, Users, ChevronLeft, ChevronRight, Download,
  ChevronDown, ClipboardCheck, BookOpen,
  Plus, Trash2, Copy, FileText, KeyRound,
} from "lucide-react";
import {
  agentStudents, agentTeachers, modules, gradeSubmissions,
  type AgentStudent, type AgentTeacher, type CompteStatut,
} from "@/data/mockData";
import { getStudentAssignment } from "@/lib/orgStore";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const ITEMS_PER_PAGE = 10;

const DEPARTMENTS = ["Informatique", "Mathématiques", "Physique", "Réseaux", "Systèmes", "Électronique"];
const SECTIONS  = ["Section 1", "Section 2"];
const GROUPS    = ["Groupe 1", "Groupe 2", "Groupe 3", "Groupe 4"];
const NIVEAUX   = ["L1", "L2", "L3", "M1", "M2"];
const GRADES    = ["MAA", "MAB", "MCA", "MCB", "Professeur"];
const AGENT_DEPT    = "Informatique";
const AGENT_FACULTY = "Faculté d'Informatique";
const AGENT_UNIV    = "Université des Sciences et de la Technologie Houari Boumediene";

const statutCompteBadge: Record<CompteStatut, string> = {
  actif:    "bg-green-100 text-green-800 border-green-200",
  suspendu: "bg-amber-100 text-amber-800 border-amber-200",
  archive:  "bg-gray-100 text-gray-700 border-gray-200",
};

type ModuleRow = {
  id: string; module: string; types: ("CM" | "TD" | "TP")[];
  sections: string[]; tdGroups: string[]; tpGroups: string[]; responsable: boolean;
};
type CreatedInfo = { username: string; password: string; name: string };

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function initStudentPasswords(students: AgentStudent[]): Record<string, string> {
  const store: Record<string, string> = {};
  students.forEach(s => { store[s.id] = generatePassword(); });
  return store;
}
function initTeacherPasswords(teachers: AgentTeacher[]): Record<string, { password: string; username: string }> {
  const store: Record<string, { password: string; username: string }> = {};
  teachers.forEach(t => { store[t.id] = { password: generatePassword(), username: t.email }; });
  return store;
}

function getSectionFromGroupe(groupe: string) {
  return ["Groupe 1", "Groupe 2"].includes(groupe) ? "Section 1" : "Section 2";
}

function exportStudentPDF(list: { nom: string; prenom: string; matricule: string; password: string }[]) {
  const pages = list.map(s => `
    <div class="page">
      <div class="card">
        <div class="logo-row">🎓</div>
        <h1>${AGENT_UNIV}</h1>
        <h2>${AGENT_FACULTY}</h2>
        <p class="dept">Département ${AGENT_DEPT}</p>
        <hr/>
        <div class="student-name">${s.prenom} ${s.nom}</div>
        <p class="sub">Identifiants d'accès — Plateforme EduSpace</p>
        <div class="box">
          <div class="box-label">Matricule</div>
          <div class="box-value">${s.matricule}</div>
        </div>
        <div class="box highlight">
          <div class="box-label">Mot de passe</div>
          <div class="box-value pw">${s.password}</div>
        </div>
        <p class="footer">Document confidentiel — à remettre en main propre</p>
      </div>
    </div>`).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Identifiants</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif}
    .page{width:210mm;min-height:297mm;display:flex;align-items:center;justify-content:center;page-break-after:always}
    .card{width:160mm;border:2px solid #2d2d7a;border-radius:12px;padding:44px;text-align:center}
    .logo-row{font-size:48px;margin-bottom:16px}
    h1{font-size:15px;font-weight:bold;color:#1a1a4e;margin-bottom:8px;line-height:1.5}
    h2{font-size:13px;color:#2d2d7a;margin-bottom:4px}
    .dept{font-size:12px;color:#666;margin-bottom:24px}
    hr{border:none;border-top:1px solid #e5e7eb;margin-bottom:24px}
    .student-name{font-size:22px;font-weight:bold;color:#111;margin-bottom:6px}
    .sub{font-size:11px;color:#aaa;margin-bottom:28px}
    .box{background:#f8f8ff;border:1px solid #ddd;border-radius:8px;padding:18px;margin-bottom:14px}
    .box.highlight{background:#f0eeff;border-color:#a78bfa}
    .box-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
    .box-value{font-size:30px;font-family:'Courier New',monospace;font-weight:bold;color:#1a1a4e;letter-spacing:4px}
    .pw{color:#5b21b6}
    .footer{font-size:10px;color:#ccc;margin-top:24px;font-style:italic}
    @media print{@page{margin:0;size:A4}}
  </style></head>
  <body>${pages}<script>window.onload=function(){window.print()}</script></body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded hover:bg-muted/50 transition-colors" title="Copier">
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
}

export default function AgentComptes() {
  const tab = window.location.pathname.includes("enseignants") ? "enseignants" : "etudiants";

  const [search, setSearch]                   = useState("");
  const [filterNiveau, setFilterNiveau]       = useState("all");
  const [filterStatutCompte, setFilterStatutCompte] = useState("all");
  const [filterSection, setFilterSection]     = useState("all");
  const [filterGroupe, setFilterGroupe]       = useState("all");
  const [page, setPage]                       = useState(1);

  const [students, setStudents]   = useState<AgentStudent[]>(agentStudents);
  const [teachers, setTeachers]   = useState<AgentTeacher[]>(agentTeachers);

  const [studentPasswordStore, setStudentPasswordStore] = useState<Record<string, string>>(
    () => initStudentPasswords(agentStudents)
  );
  const [teacherPasswordStore, setTeacherPasswordStore] = useState<Record<string, { password: string; username: string }>>(
    () => initTeacherPasswords(agentTeachers)
  );

  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<Set<string>>(new Set());

  const [selectedStudent, setSelectedStudent] = useState<AgentStudent | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<AgentTeacher | null>(null);

  const [showAddStudent, setShowAddStudent]   = useState(false);
  const [showAddTeacher, setShowAddTeacher]   = useState(false);

  const [showStudentCredentials, setShowStudentCredentials] = useState(false);
  const [studentCredentialsFor, setStudentCredentialsFor]   = useState<AgentStudent | null>(null);

  const [showTeacherCredentials, setShowTeacherCredentials] = useState(false);
  const [teacherCredentialsFor, setTeacherCredentialsFor]   = useState<AgentTeacher | null>(null);

  const [createdInfo, setCreatedInfo]           = useState<CreatedInfo | null>(null);
  const [showCreatedModal, setShowCreatedModal] = useState(false);

  const [showEditModal, setShowEditModal]       = useState(false);
  const [editingTeacher, setEditingTeacher]     = useState<AgentTeacher | null>(null);
  const [editModules, setEditModules]           = useState<ModuleRow[]>([]);

  const [addSuccess, setAddSuccess]             = useState("");

  const [newStudent, setNewStudent] = useState({
    nom: "", prenom: "", dateNaissance: "", wilayaNaissance: "", matricule: "",
    niveau: "L3",
  });
  const [newTeacher, setNewTeacher]     = useState({ nom: "", prenom: "", grade: "MAA", username: "" });
  const [selectedDepts, setSelectedDepts] = useState<string[]>([AGENT_DEPT]);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const deptRef = useRef<HTMLDivElement>(null);

  // ── helpers ──────────────────────────────────────────────
  function toggleDept(dept: string) {
    setSelectedDepts(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
  }

  function toggleStudentStatus(id: string) {
    const u = (s: AgentStudent) => s.id === id ? { ...s, statutCompte: s.statutCompte === "actif" ? "suspendu" as CompteStatut : "actif" as CompteStatut } : s;
    setStudents(prev => prev.map(u));
    setSelectedStudent(prev => prev ? u(prev) : null);
  }
  function toggleTeacherStatus(id: string) {
    const u = (t: AgentTeacher) => t.id === id ? { ...t, statutCompte: t.statutCompte === "actif" ? "suspendu" as CompteStatut : "actif" as CompteStatut } : t;
    setTeachers(prev => prev.map(u));
    setSelectedTeacher(prev => prev ? u(prev) : null);
  }

  function openEditTeacher(t: AgentTeacher) {
    setEditingTeacher(t);
    setEditModules(t.modulesAssignes.map((mod, i) => ({
      id: `em${i}`, module: mod, types: [], sections: [], tdGroups: [], tpGroups: [], responsable: false,
    })));
    setShowEditModal(true);
  }
  function addModuleRow() {
    setEditModules(prev => [...prev, { id: `em${Date.now()}`, module: "", types: [], sections: [], tdGroups: [], tpGroups: [], responsable: false }]);
  }
  function removeModuleRow(id: string) {
    setEditModules(prev => prev.filter(r => r.id !== id));
  }
  function updateModuleRow(id: string, updates: Partial<ModuleRow>) {
    setEditModules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }
  function toggleModuleType(rowId: string, t: "CM" | "TD" | "TP") {
    setEditModules(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const types = r.types.includes(t) ? r.types.filter(x => x !== t) : [...r.types, t];
      return {
        ...r, types,
        sections: types.includes("CM") ? r.sections : [],
        tdGroups: types.includes("TD") ? r.tdGroups : [],
        tpGroups: types.includes("TP") ? r.tpGroups : [],
      };
    }));
  }
  function toggleTdGroup(rowId: string, grp: string) {
    setEditModules(prev => prev.map(r => r.id !== rowId ? r : {
      ...r, tdGroups: r.tdGroups.includes(grp) ? r.tdGroups.filter(g => g !== grp) : [...r.tdGroups, grp],
    }));
  }
  function toggleTpGroup(rowId: string, grp: string) {
    setEditModules(prev => prev.map(r => r.id !== rowId ? r : {
      ...r, tpGroups: r.tpGroups.includes(grp) ? r.tpGroups.filter(g => g !== grp) : [...r.tpGroups, grp],
    }));
  }
  function saveTeacherEdit() {
    if (!editingTeacher) return;
    const updated = editModules.filter(r => r.module).map(r => r.module);
    setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, modulesAssignes: updated } : t));
    if (selectedTeacher?.id === editingTeacher.id) setSelectedTeacher(prev => prev ? { ...prev, modulesAssignes: updated } : null);
    setShowEditModal(false);
  }

  function getModulesForTeacher(t: AgentTeacher) {
    const depts = t.departement.split(",").map(d => d.trim().toLowerCase());
    return modules.filter(m => depts.some(d => m.filiere.toLowerCase().includes(d) || d.includes(m.filiere.toLowerCase())));
  }

  function addStudentFn() {
    if (!newStudent.nom || !newStudent.prenom || !newStudent.matricule) return;
    const password = generatePassword();
    const email = `${newStudent.prenom[0].toLowerCase()}.${newStudent.nom.toLowerCase()}@univ-alger.dz`;
    const newS: AgentStudent = {
      id: `as${Date.now()}`, matricule: newStudent.matricule, nom: newStudent.nom, prenom: newStudent.prenom,
      dateNaissance: newStudent.dateNaissance || "2001-01-01", wilaya: newStudent.wilayaNaissance || "Alger",
      filiere: AGENT_DEPT, niveau: newStudent.niveau, groupe: "", email,
      statutCompte: "actif", statutReinscription: "en_attente", statutPaiement: "non_paye",
      montantPaye: 0, methodePayment: "", referencePayment: "", datePayment: "",
      documents: ["CNI", "Attestation de naissance", "Bac original", "Relevé de notes", "Photo d'identité", "Reçu de paiement"].map(type => ({ type, soumis: false, verifie: false })),
      auditTrail: [{ date: new Date().toLocaleString("fr-FR").replace(",", ""), action: "Compte créé par l'agent", agent: "Ferhat Nadia" }],
    };
    setStudents(prev => [newS, ...prev]);
    setStudentPasswordStore(prev => ({ ...prev, [newS.id]: password }));
    setShowAddStudent(false);
    setNewStudent({ nom: "", prenom: "", dateNaissance: "", wilayaNaissance: "", matricule: "", niveau: "L3" });
    setAddSuccess(`Étudiant ${newS.prenom} ${newS.nom} créé. Matricule : ${newS.matricule}`);
    setTimeout(() => setAddSuccess(""), 5000);
  }

  function addTeacherFn() {
    if (!newTeacher.nom || !newTeacher.prenom) return;
    const mat = `ENS${String(teachers.length + 100).padStart(3, "0")}`;
    const username = newTeacher.username || `${newTeacher.prenom[0].toLowerCase()}.${newTeacher.nom.toLowerCase()}`;
    const password = generatePassword();
    const deptStr = selectedDepts.join(", ") || AGENT_DEPT;
    const newT: AgentTeacher = {
      id: `at${Date.now()}`, matricule: mat, nom: newTeacher.nom, prenom: newTeacher.prenom,
      grade: newTeacher.grade, departement: deptStr, email: username,
      modulesAssignes: [], statutCompte: "actif", schedule: [],
    };
    setTeachers(prev => [newT, ...prev]);
    setTeacherPasswordStore(prev => ({ ...prev, [newT.id]: { password, username } }));
    setShowAddTeacher(false);
    setNewTeacher({ nom: "", prenom: "", grade: "MAA", username: "" });
    setSelectedDepts([AGENT_DEPT]);
    setCreatedInfo({ username, password, name: `${newT.prenom} ${newT.nom}` });
    setShowCreatedModal(true);
  }

  // ── student selection helpers ──
  function toggleSelectStudent(id: string) {
    setSelectedStudentIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAllStudents(ids: string[]) {
    const allSel = ids.every(id => selectedStudentIds.has(id));
    if (allSel) setSelectedStudentIds(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
    else setSelectedStudentIds(prev => { const n = new Set(prev); ids.forEach(id => n.add(id)); return n; });
  }
  function exportSelectedStudentsPDF() {
    const list = students.filter(s => selectedStudentIds.has(s.id)).map(s => ({
      nom: s.nom, prenom: s.prenom, matricule: s.matricule, password: studentPasswordStore[s.id] ?? "——",
    }));
    if (list.length) exportStudentPDF(list);
  }

  // ── teacher selection helpers ──
  function toggleSelectTeacher(id: string) {
    setSelectedTeacherIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAllTeachers(ids: string[]) {
    const allSel = ids.every(id => selectedTeacherIds.has(id));
    if (allSel) setSelectedTeacherIds(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
    else setSelectedTeacherIds(prev => { const n = new Set(prev); ids.forEach(id => n.add(id)); return n; });
  }
  function exportSelectedTeachersPDF() {
    const list = teachers.filter(t => selectedTeacherIds.has(t.id)).map(t => {
      const creds = teacherPasswordStore[t.id];
      return { nom: t.nom, prenom: t.prenom, matricule: t.matricule, password: creds?.password ?? "——" };
    });
    if (list.length) exportStudentPDF(list);
  }

  // ── filtered data ──
  const filteredStudents = useMemo(() => students.filter(s => {
    const q = search.toLowerCase();
    if (!`${s.prenom} ${s.nom} ${s.matricule}`.toLowerCase().includes(q)) return false;
    if (filterNiveau !== "all" && s.niveau !== filterNiveau) return false;
    if (filterStatutCompte !== "all" && s.statutCompte !== filterStatutCompte) return false;
    if (filterSection !== "all" && getSectionFromGroupe(s.groupe) !== filterSection) return false;
    if (filterGroupe !== "all" && s.groupe !== filterGroupe) return false;
    return true;
  }), [students, search, filterNiveau, filterStatutCompte, filterSection, filterGroupe]);

  const filteredTeachers = useMemo(() => teachers.filter(t => {
    const q = search.toLowerCase();
    return `${t.prenom} ${t.nom} ${t.matricule} ${t.email}`.toLowerCase().includes(q);
  }), [teachers, search]);

  const totalPages    = Math.ceil((tab === "etudiants" ? filteredStudents : filteredTeachers).length / ITEMS_PER_PAGE);
  const pagedStudents = filteredStudents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const pagedTeachers = filteredTeachers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const pagedStudentIds  = pagedStudents.map(s => s.id);
  const allPageStudentSel = pagedStudentIds.length > 0 && pagedStudentIds.every(id => selectedStudentIds.has(id));
  const pagedTeacherIds  = pagedTeachers.map(t => t.id);
  const allPageTeacherSel = pagedTeacherIds.length > 0 && pagedTeacherIds.every(id => selectedTeacherIds.has(id));

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">

          <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">{tab === "etudiants" ? "Comptes étudiants" : "Comptes enseignants"}</h1>
              <p className="text-muted-foreground mt-1">
                {tab === "etudiants" ? `${filteredStudents.length} étudiant(s)` : `${filteredTeachers.length} enseignant(s)`}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tab === "etudiants" && selectedStudentIds.size > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs border-violet-300 text-violet-700 hover:bg-violet-50" onClick={exportSelectedStudentsPDF}>
                  <FileText className="w-3.5 h-3.5" />Exporter PDF ({selectedStudentIds.size} sélectionné{selectedStudentIds.size > 1 ? "s" : ""})
                </Button>
              )}
              {tab === "enseignants" && selectedTeacherIds.size > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs border-violet-300 text-violet-700 hover:bg-violet-50" onClick={exportSelectedTeachersPDF}>
                  <FileText className="w-3.5 h-3.5" />Exporter PDF ({selectedTeacherIds.size} sélectionné{selectedTeacherIds.size > 1 ? "s" : ""})
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Download className="w-3.5 h-3.5" />Exporter</Button>
              <Button className="gap-2" size="sm" onClick={() => tab === "etudiants" ? setShowAddStudent(true) : setShowAddTeacher(true)}>
                <UserPlus className="w-4 h-4" />
                {tab === "etudiants" ? "Ajouter un étudiant" : "Ajouter un enseignant"}
              </Button>
            </div>
          </motion.div>

          {addSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />{addSuccess}
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          <motion.div variants={item} className="flex border-b border-border">
            <a href="/agent/comptes/etudiants" className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${tab === "etudiants" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <GraduationCap className="w-4 h-4" />Étudiants ({students.length})
            </a>
            <a href="/agent/comptes/enseignants" className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${tab === "enseignants" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <Users className="w-4 h-4" />Enseignants ({teachers.length})
            </a>
          </motion.div>

          {/* ── STUDENT FILTERS ── */}
          {tab === "etudiants" && (
            <motion.div variants={item}>
              <Card className="p-4">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Nom, prénom, matricule…" className="pl-8 h-9 text-sm" />
                  </div>
                  <Select value={filterNiveau} onValueChange={v => { setFilterNiveau(v); setPage(1); }}>
                    <SelectTrigger className="w-[110px] h-9 text-sm"><SelectValue placeholder="Niveau" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Tous niveaux</SelectItem>{NIVEAUX.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={filterStatutCompte} onValueChange={v => { setFilterStatutCompte(v); setPage(1); }}>
                    <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Compte" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Tous comptes</SelectItem><SelectItem value="actif">Actif</SelectItem><SelectItem value="suspendu">Suspendu</SelectItem><SelectItem value="archive">Archivé</SelectItem></SelectContent>
                  </Select>
                  <Select value={filterSection} onValueChange={v => { setFilterSection(v); setFilterGroupe("all"); setPage(1); }}>
                    <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Section" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Toutes sections</SelectItem>{SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={filterGroupe} onValueChange={v => { setFilterGroupe(v); setPage(1); }}>
                    <SelectTrigger className="w-[130px] h-9 text-sm"><SelectValue placeholder="Groupe" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Tous groupes</SelectItem>{GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" onClick={() => { setSearch(""); setFilterNiveau("all"); setFilterStatutCompte("all"); setFilterSection("all"); setFilterGroupe("all"); setPage(1); }}>
                    Réinitialiser
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {tab === "enseignants" && (
            <motion.div variants={item}>
              <Card className="p-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Nom, matricule, username…" className="pl-8 h-9 text-sm" />
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── TABLES ── */}
          <motion.div variants={item}>
            {tab === "etudiants" ? (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        <th className="px-3 py-3 w-10">
                          <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer"
                            checked={allPageStudentSel} onChange={() => toggleSelectAllStudents(pagedStudentIds)} />
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Matricule</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Nom complet</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Filière / Niveau</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Section / Groupe</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Compte</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedStudents.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Aucun étudiant trouvé</td></tr>
                      ) : pagedStudents.map(s => (
                        <tr key={s.id} className={`border-b border-border/50 hover:bg-muted/10 transition-colors ${selectedStudentIds.has(s.id) ? "bg-violet-50/40" : ""}`}>
                          <td className="px-3 py-3 text-center">
                            <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer"
                              checked={selectedStudentIds.has(s.id)} onChange={() => toggleSelectStudent(s.id)} />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">{s.matricule}</td>
                          <td className="px-4 py-3 font-medium">{s.prenom} {s.nom}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{s.filiere} — {s.niveau}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {(() => { const a = getStudentAssignment(s.id); return a ? <>{a.section}<br />{a.groupe}</> : <span className="italic text-muted-foreground/50">—</span>; })()}
                          </td>
                          <td className="px-4 py-3 text-center"><Badge className={`text-xs border ${statutCompteBadge[s.statutCompte]}`}>{s.statutCompte}</Badge></td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelectedStudent(s)}><Eye className="w-3.5 h-3.5" /></Button>
                              <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 ${s.statutCompte === "actif" ? "text-amber-600" : "text-blue-600"}`} onClick={() => toggleStudentStatus(s.id)}>
                                {s.statutCompte === "actif" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-4 border-t border-border flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Page {page} sur {totalPages} — {filteredStudents.length} résultat(s)</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              /* ── TEACHER TABLE ── */
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 border-b border-border">
                      <tr>
                        <th className="px-3 py-3 w-10">
                          <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer"
                            checked={allPageTeacherSel} onChange={() => toggleSelectAllTeachers(pagedTeacherIds)} />
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Matricule</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Nom complet</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Grade</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs">Département</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Modules</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Statut</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedTeachers.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-10 text-muted-foreground text-sm">Aucun enseignant trouvé</td></tr>
                      ) : pagedTeachers.map(t => (
                        <tr key={t.id} className={`border-b border-border/50 hover:bg-muted/10 transition-colors ${selectedTeacherIds.has(t.id) ? "bg-violet-50/40" : ""}`}>
                          <td className="px-3 py-3 text-center">
                            <input type="checkbox" className="accent-primary w-4 h-4 cursor-pointer"
                              checked={selectedTeacherIds.has(t.id)} onChange={() => toggleSelectTeacher(t.id)} />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">{t.matricule}</td>
                          <td className="px-4 py-3"><p className="font-medium">{t.prenom} {t.nom}</p><p className="text-xs text-muted-foreground">{t.email}</p></td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{t.grade}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{t.departement}</td>
                          <td className="px-4 py-3 text-center font-semibold">{t.modulesAssignes.length}</td>
                          <td className="px-4 py-3 text-center"><Badge className={`text-xs border ${statutCompteBadge[t.statutCompte]}`}>{t.statutCompte}</Badge></td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-1 items-center">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Voir" onClick={() => setSelectedTeacher(t)}><Eye className="w-3.5 h-3.5" /></Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Modifier" onClick={() => openEditTeacher(t)}><Edit className="w-3.5 h-3.5" /></Button>
                              <Button size="sm" variant="ghost" className={`h-7 w-7 p-0 ${t.statutCompte === "actif" ? "text-amber-600" : "text-blue-600"}`} onClick={() => toggleTeacherStatus(t.id)}>
                                {t.statutCompte === "actif" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="p-4 border-t border-border flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Page {page} sur {totalPages}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="outline" className="h-7 w-7 p-0" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* ── STUDENT DETAIL PANEL ── */}
      <AnimatePresence>
        {selectedStudent && (() => {
          const s = students.find(x => x.id === selectedStudent.id) ?? selectedStudent;
          return (
            <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-full max-w-lg h-screen bg-background overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{s.prenom[0]}{s.nom[0]}</div>
                    <div><h2 className="font-bold text-lg">{s.prenom} {s.nom}</h2><p className="text-sm text-muted-foreground font-mono">{s.matricule} — {s.filiere} {s.niveau}</p></div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedStudent(null)}><X className="w-4 h-4" /></Button>
                </div>

                <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Informations personnelles</span>
                    </div>
                    {(() => {
                      const assignment = getStudentAssignment(s.id);
                      return (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {[
                            { label: "Date de naissance", value: s.dateNaissance },
                            { label: "Wilaya de naissance", value: s.wilaya },
                            { label: "Email", value: s.email },
                            { label: "Filière", value: s.filiere },
                            { label: "Niveau", value: s.niveau },
                            { label: "Section", value: assignment ? assignment.section : "—" },
                            { label: "Groupe", value: assignment ? assignment.groupe : "—" },
                          ].map(f => (
                            <div key={f.label} className="bg-muted/20 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground">{f.label}</p>
                              <p className={`font-medium mt-0.5 break-all ${!assignment && (f.label === "Section" || f.label === "Groupe") ? "text-muted-foreground/50 italic" : ""}`}>{f.value}</p>
                            </div>
                          ))}
                          <div className="bg-muted/20 rounded-lg p-3 flex items-center justify-between gap-2 col-span-2">
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs border-violet-300 text-violet-700 hover:bg-violet-50"
                              onClick={() => { setStudentCredentialsFor(s); setShowStudentCredentials(true); }}>
                              <KeyRound className="w-3.5 h-3.5" />Afficher matricule et mot de passe
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">Statut du compte</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <Badge className={`text-xs border ${statutCompteBadge[s.statutCompte]}`}>{s.statutCompte}</Badge>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => toggleStudentStatus(s.id)}>
                        {s.statutCompte === "actif" ? <UserX className="w-3.5 h-3.5 text-amber-600" /> : <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                        {s.statutCompte === "actif" ? "Suspendre" : "Activer"}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ── TEACHER DETAIL PANEL ── */}
      <AnimatePresence>
        {selectedTeacher && (() => {
          const t = teachers.find(x => x.id === selectedTeacher.id) ?? selectedTeacher;
          const teacherGrades = gradeSubmissions.filter(gs => gs.enseignant.includes(t.nom));
          return (
            <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50">
              <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="w-full max-w-xl h-screen bg-background overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">{t.prenom[0]}{t.nom[0]}</div>
                    <div><h2 className="font-bold text-lg">{t.prenom} {t.nom}</h2><p className="text-sm text-muted-foreground">{t.grade} — {t.departement}</p></div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedTeacher(null)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="p-5 space-y-5 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[{ label: "Matricule", value: t.matricule }, { label: "Username", value: t.email }, { label: "Grade", value: t.grade }, { label: "Département", value: t.departement }].map(f => (
                      <div key={f.label} className="bg-muted/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">{f.label}</p>
                        <p className="font-medium mt-0.5 text-sm break-all">{f.value}</p>
                      </div>
                    ))}
                    <div className="col-span-2 bg-muted/20 rounded-lg p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Statut :</span>
                        <Badge className={`text-xs border ${statutCompteBadge[t.statutCompte]}`}>{t.statutCompte}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs border-violet-300 text-violet-700 hover:bg-violet-50"
                          onClick={() => { setTeacherCredentialsFor(t); setShowTeacherCredentials(true); }}>
                          <KeyRound className="w-3.5 h-3.5" />Afficher matricule et mot de passe
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => toggleTeacherStatus(t.id)}>
                          {t.statutCompte === "actif" ? <UserX className="w-3.5 h-3.5 text-amber-600" /> : <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                          {t.statutCompte === "actif" ? "Suspendre" : "Activer"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3"><BookOpen className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">Modules assignés</span></div>
                    {t.modulesAssignes.length === 0 ? <p className="text-sm text-muted-foreground italic">Aucun module.</p> : (
                      <div className="space-y-2">
                        {t.modulesAssignes.map((mod, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 text-sm">
                            <span className="font-medium">{mod}</span>
                            <Badge className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">Assigné</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs mt-3" onClick={() => openEditTeacher(t)}><Edit className="w-3.5 h-3.5" />Modifier les enseignements</Button>
                  </div>
                  {teacherGrades.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3"><ClipboardCheck className="w-4 h-4 text-primary" /><span className="font-semibold text-sm">Statut des notes</span></div>
                      <div className="space-y-2">
                        {teacherGrades.map(gs => (
                          <div key={gs.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 text-sm">
                            <div><p className="font-medium">{gs.module}</p><p className="text-xs text-muted-foreground">{gs.groupe} — {gs.semestre}</p></div>
                            <Badge className={`text-xs border ${gs.statut === "publie" ? "bg-green-100 text-green-800 border-green-200" : gs.statut === "valide" ? "bg-blue-100 text-blue-800 border-blue-200" : gs.statut === "soumis" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                              {gs.statut === "publie" ? "Publié" : gs.statut === "valide" ? "Validé" : gs.statut === "soumis" ? "Soumis" : "En attente"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ── STUDENT CREDENTIALS POPUP ── */}
      <AnimatePresence>
        {showStudentCredentials && studentCredentialsFor && (() => {
          const s = studentCredentialsFor;
          const pwd = studentPasswordStore[s.id] ?? "——";
          return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <Card className="p-6 w-full max-w-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-violet-600" /><h3 className="font-bold text-base">{s.prenom} {s.nom}</h3></div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowStudentCredentials(false)}><X className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-muted/20 border border-border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1.5">Matricule</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-base">{s.matricule}</span>
                        <CopyButton text={s.matricule} />
                      </div>
                    </div>
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                      <p className="text-xs text-violet-600 mb-1.5">Mot de passe</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xl tracking-widest text-violet-800">{pwd}</span>
                        <CopyButton text={pwd} />
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 gap-2 text-sm border-violet-300 text-violet-700 hover:bg-violet-50"
                    onClick={() => exportStudentPDF([{ nom: s.nom, prenom: s.prenom, matricule: s.matricule, password: pwd }])}>
                    <FileText className="w-3.5 h-3.5" />Exporter matricule et mot de passe (PDF)
                  </Button>
                  <Button className="w-full mt-2" onClick={() => setShowStudentCredentials(false)}>Fermer</Button>
                </Card>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ── TEACHER CREDENTIALS POPUP ── */}
      <AnimatePresence>
        {showTeacherCredentials && teacherCredentialsFor && (() => {
          const t = teacherCredentialsFor;
          const creds = teacherPasswordStore[t.id];
          const pwd = creds?.password ?? "——";
          const username = creds?.username ?? t.email;
          return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <Card className="p-6 w-full max-w-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-violet-600" /><h3 className="font-bold text-base">{t.prenom} {t.nom}</h3></div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowTeacherCredentials(false)}><X className="w-4 h-4" /></Button>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-muted/20 border border-border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1.5">Matricule</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-base">{t.matricule}</span>
                        <CopyButton text={t.matricule} />
                      </div>
                    </div>
                    <div className="bg-muted/20 border border-border rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1.5">Nom d'utilisateur</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm">{username}</span>
                        <CopyButton text={username} />
                      </div>
                    </div>
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                      <p className="text-xs text-violet-600 mb-1.5">Mot de passe</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xl tracking-widest text-violet-800">{pwd}</span>
                        <CopyButton text={pwd} />
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 gap-2 text-sm border-violet-300 text-violet-700 hover:bg-violet-50"
                    onClick={() => exportStudentPDF([{ nom: t.nom, prenom: t.prenom, matricule: t.matricule, password: pwd }])}>
                    <FileText className="w-3.5 h-3.5" />Exporter matricule et mot de passe (PDF)
                  </Button>
                  <Button className="w-full mt-2" onClick={() => setShowTeacherCredentials(false)}>Fermer</Button>
                </Card>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ── TEACHER EDIT MODAL ── */}
      <AnimatePresence>
        {showEditModal && editingTeacher && (() => {
          const availableMods = getModulesForTeacher(editingTeacher);
          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                <Card className="p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-bold text-base">Enseignements — {editingTeacher.prenom} {editingTeacher.nom}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Semestre en cours · Département {editingTeacher.departement}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowEditModal(false)}><X className="w-4 h-4" /></Button>
                  </div>

                  <div className="space-y-4">
                    {editModules.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4 italic">Aucun module assigné. Cliquez « Ajouter » pour commencer.</p>
                    )}
                    {editModules.map(row => (
                      <div key={row.id} className="border border-border rounded-xl p-4 space-y-3 bg-muted/10">
                        <div className="flex gap-3 items-start">
                          <div className="flex-1">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Module</label>
                            <Select value={row.module} onValueChange={v => updateModuleRow(row.id, { module: v })}>
                              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choisir un module…" /></SelectTrigger>
                              <SelectContent>
                                {availableMods.length === 0
                                  ? <SelectItem value="__none" disabled>Aucun module dans ce département</SelectItem>
                                  : availableMods.map(m => <SelectItem key={m.id} value={m.intitule}>{m.intitule}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 mt-5 text-red-400 hover:text-red-600 flex-shrink-0" onClick={() => removeModuleRow(row.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-2">Type(s) d'enseignement</label>
                          <div className="flex gap-4">
                            {(["CM", "TD", "TP"] as const).map(t => (
                              <label key={t} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                <input type="checkbox" className="accent-primary w-4 h-4"
                                  checked={row.types.includes(t)} onChange={() => toggleModuleType(row.id, t)} />
                                {t}
                              </label>
                            ))}
                          </div>
                        </div>

                        {row.types.includes("CM") && (
                          <div className="pl-3 border-l-2 border-blue-200">
                            <label className="text-xs font-medium text-blue-700 block mb-2">Sections (CM)</label>
                            <div className="flex gap-4">
                              {SECTIONS.map(sec => (
                                <label key={sec} className="flex items-center gap-2 cursor-pointer text-sm">
                                  <input type="checkbox" className="accent-primary w-4 h-4"
                                    checked={row.sections.includes(sec)}
                                    onChange={() => updateModuleRow(row.id, { sections: row.sections.includes(sec) ? row.sections.filter(x => x !== sec) : [...row.sections, sec] })} />
                                  {sec}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {row.types.includes("TD") && (
                          <div className="pl-3 border-l-2 border-indigo-200">
                            <label className="text-xs font-medium text-indigo-700 block mb-2">Groupes TD</label>
                            <div className="flex flex-wrap gap-4">
                              {GROUPS.map(grp => (
                                <label key={grp} className="flex items-center gap-2 cursor-pointer text-sm">
                                  <input type="checkbox" className="accent-primary w-4 h-4"
                                    checked={row.tdGroups.includes(grp)} onChange={() => toggleTdGroup(row.id, grp)} />
                                  {grp}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {row.types.includes("TP") && (
                          <div className="pl-3 border-l-2 border-teal-200">
                            <label className="text-xs font-medium text-teal-700 block mb-2">Groupes TP</label>
                            <div className="flex flex-wrap gap-4">
                              {GROUPS.map(grp => (
                                <label key={grp} className="flex items-center gap-2 cursor-pointer text-sm">
                                  <input type="checkbox" className="accent-primary w-4 h-4"
                                    checked={row.tpGroups.includes(grp)} onChange={() => toggleTpGroup(row.id, grp)} />
                                  {grp}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input type="checkbox" className="accent-primary w-4 h-4" checked={row.responsable}
                              onChange={() => updateModuleRow(row.id, { responsable: !row.responsable })} />
                            <span className="font-medium">Responsable de ce module</span>
                          </label>
                          {row.responsable && <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">Responsable</Badge>}
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" size="sm" className="gap-1.5 text-xs w-full" onClick={addModuleRow}>
                      <Plus className="w-3.5 h-3.5" />Ajouter un module
                    </Button>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>Annuler</Button>
                    <Button className="flex-1" onClick={saveTeacherEdit}>Enregistrer</Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* ── ADD STUDENT MODAL ── */}
      <AnimatePresence>
        {showAddStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-base">Ajouter un nouvel étudiant</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowAddStudent(false)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Nom *", key: "nom", placeholder: "Bensalem", span: false },
                    { label: "Prénom *", key: "prenom", placeholder: "Karim", span: false },
                    { label: "Date de naissance", key: "dateNaissance", placeholder: "", type: "date", span: false },
                    { label: "Wilaya de naissance", key: "wilayaNaissance", placeholder: "Alger", span: false },
                    { label: "Numéro de matricule *", key: "matricule", placeholder: "Ex: 20221234567", span: true },
                  ].map(f => (
                    <div key={f.key} className={f.span ? "col-span-2" : ""}>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
                      <Input type={f.type || "text"} placeholder={f.placeholder}
                        value={(newStudent as Record<string, string>)[f.key]}
                        onChange={e => setNewStudent(prev => ({ ...prev, [f.key]: e.target.value }))} className="h-9 text-sm" />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Filière</label>
                    <div className="h-9 px-3 flex items-center rounded-md border border-input bg-muted/30 text-sm text-muted-foreground cursor-not-allowed">
                      {AGENT_DEPT} <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">non modifiable</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Niveau</label>
                    <Select value={newStudent.niveau} onValueChange={v => setNewStudent(prev => ({ ...prev, niveau: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{NIVEAUX.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 p-3 bg-muted/20 rounded-lg text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    La section et le groupe seront attribués via <strong className="mx-1">Organisation des étudiants</strong>.
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  Un mot de passe à 6 caractères (lettres + chiffres) sera généré automatiquement.
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddStudent(false)}>Annuler</Button>
                  <Button className="flex-1" disabled={!newStudent.nom || !newStudent.prenom || !newStudent.matricule} onClick={addStudentFn}>Créer le compte</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD TEACHER MODAL ── */}
      <AnimatePresence>
        {showAddTeacher && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-base">Ajouter un enseignant</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowAddTeacher(false)}><X className="w-4 h-4" /></Button>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Nom *", key: "nom", placeholder: "Hadj" },
                    { label: "Prénom *", key: "prenom", placeholder: "Mohamed" },
                    { label: "Nom d'utilisateur", key: "username", placeholder: "m.hadj (auto si vide)" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
                      <Input placeholder={f.placeholder} value={(newTeacher as Record<string, string>)[f.key]}
                        onChange={e => setNewTeacher(prev => ({ ...prev, [f.key]: e.target.value }))} className="h-9 text-sm" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Grade académique</label>
                    <Select value={newTeacher.grade} onValueChange={v => setNewTeacher(prev => ({ ...prev, grade: v }))}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div ref={deptRef}>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Département(s)</label>
                    <div className="relative">
                      <button type="button" onClick={() => setShowDeptDropdown(v => !v)}
                        className="w-full h-9 px-3 text-sm text-left rounded-md border border-input bg-background flex items-center justify-between">
                        <span className={selectedDepts.length === 0 ? "text-muted-foreground" : ""}>
                          {selectedDepts.length === 0 ? "Sélectionner…" : selectedDepts.join(", ")}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <AnimatePresence>
                        {showDeptDropdown && (
                          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg z-20 p-2">
                            {DEPARTMENTS.map(dept => (
                              <label key={dept} className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm">
                                <input type="checkbox" className="accent-primary w-3.5 h-3.5"
                                  checked={selectedDepts.includes(dept)} onChange={() => toggleDept(dept)} />
                                {dept}
                              </label>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/20 rounded-lg p-3 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    Un mot de passe à 6 caractères sera généré automatiquement.
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddTeacher(false)}>Annuler</Button>
                  <Button className="flex-1" disabled={!newTeacher.nom || !newTeacher.prenom} onClick={addTeacherFn}>Créer le compte</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CREATED TEACHER ACCOUNT MODAL ── */}
      <AnimatePresence>
        {showCreatedModal && createdInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <Card className="p-6 w-full max-w-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-base">Compte créé — {createdInfo.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Transmettez ces identifiants à l'enseignant. Ils resteront accessibles via l'œil dans le panneau de détail.</p>
                <div className="space-y-3">
                  <div className="bg-muted/20 border border-border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Nom d'utilisateur</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-sm">{createdInfo.username}</span>
                      <CopyButton text={createdInfo.username} />
                    </div>
                  </div>
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                    <p className="text-xs text-violet-600 mb-1.5">Mot de passe généré</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xl tracking-widest text-violet-800">{createdInfo.password}</span>
                      <CopyButton text={createdInfo.password} />
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-5" onClick={() => setShowCreatedModal(false)}>Fermer et continuer</Button>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
