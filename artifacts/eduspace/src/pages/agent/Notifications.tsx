import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bell, Send, Users, GraduationCap, CheckCircle,
  Search, UserCheck, BookOpen,
} from "lucide-react";
import {
  agentTeachers,
  allStudents,
  niveauxFiliere,
  studentsDB,
} from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item      = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// ── Student total counts ─────────────────────────────────────────────────────
const totalStudentCount = Object.values(studentsDB).reduce((s, a) => s + a.length, 0);
function getNiveauCount(niveau: string) {
  return Object.entries(studentsDB)
    .filter(([k]) => k.startsWith(niveau + "-"))
    .reduce((s, [, a]) => s + a.length, 0);
}

// ── Message templates ────────────────────────────────────────────────────────
const studentTemplates = [
  { id: "s1", label: "Réinscription validée",  text: "Votre réinscription pour l'année universitaire 2025-2026 a été validée. Bienvenue !" },
  { id: "s2", label: "Document manquant",       text: "Votre dossier est incomplet. Veuillez soumettre les documents manquants avant la date limite." },
  { id: "s3", label: "Paiement non confirmé",   text: "Votre paiement des frais de scolarité n'a pas encore été confirmé. Veuillez régulariser votre situation." },
  { id: "s4", label: "Date limite approche",    text: "Rappel : la date limite de dépôt des dossiers de réinscription est le 30 septembre 2025." },
];

const teacherTemplates = [
  { id: "t1", label: "Limite soumission notes", text: "Rappel : la date limite de soumission des notes pour ce semestre approche. Veillez à soumettre dans les délais." },
  { id: "t2", label: "Permissions accordées",   text: "Vos permissions de saisie des notes ont été accordées. Vous pouvez désormais saisir vos résultats." },
  { id: "t3", label: "Réunion pédagogique",      text: "Une réunion pédagogique est prévue prochainement. Votre présence est requise — consultez le calendrier." },
  { id: "t4", label: "Calendrier délibérations", text: "Le calendrier des délibérations du semestre est disponible. Prenez en compte les dates dans votre agenda." },
];

// ── Types ────────────────────────────────────────────────────────────────────
type SentNotif = { id: string; recipient: string; message: string; date: string; statut: "Envoyé" };

const initialHistory: SentNotif[] = [
  { id: "h1", recipient: "Niveau L3 — 53 étudiants",         message: "Rappel : la date limite de dépôt des dossiers de réinscription est le 30 septembre 2025.", date: "2025-09-15 10:30", statut: "Envoyé" },
  { id: "h2", recipient: "Kadi Islam — 222237400711",        message: "Votre dossier est incomplet. Veuillez soumettre votre CNI avant la date limite.",           date: "2025-09-12 14:15", statut: "Envoyé" },
  { id: "h3", recipient: "Tous les enseignants — 10 éts",    message: "Rappel : la date limite de soumission des notes S5 est le 10 janvier 2026.",                date: "2025-09-10 09:00", statut: "Envoyé" },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function AgentNotifications() {
  // Audience: "etudiants" | "enseignants"
  const [audience, setAudience] = useState<"etudiants" | "enseignants">("etudiants");

  // Student recipient mode
  const [studentMode, setStudentMode] = useState("all");
  const [selectedNiveau, setSelectedNiveau] = useState(niveauxFiliere[0].id);

  // Teacher recipient mode
  const [teacherMode, setTeacherMode] = useState("all");

  // Individual search (shared between student & teacher)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<(typeof allStudents)[0] | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<(typeof agentTeachers)[0] | null>(null);

  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<SentNotif[]>(initialHistory);
  const [sent, setSent] = useState(false);

  // Reset selections when switching audience
  function switchAudience(a: "etudiants" | "enseignants") {
    setAudience(a);
    setStudentMode("all");
    setTeacherMode("all");
    setSearchQuery("");
    setSelectedStudent(null);
    setSelectedTeacher(null);
    setMessage("");
  }

  // Live search results
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allStudents
      .filter(s => s.nom.toLowerCase().includes(q) || s.prenom.toLowerCase().includes(q) || s.matricule.includes(q))
      .slice(0, 8);
  }, [searchQuery]);

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return agentTeachers
      .filter(t =>
        t.nom.toLowerCase().includes(q) ||
        t.prenom.toLowerCase().includes(q) ||
        t.email.split("@")[0].toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [searchQuery]);

  // Recipient count & label
  const { recipientCount, recipientLabel } = useMemo(() => {
    if (audience === "etudiants") {
      if (studentMode === "all")        return { recipientCount: totalStudentCount,               recipientLabel: `Tous les étudiants — ${totalStudentCount} éts` };
      if (studentMode === "niveau")     return { recipientCount: getNiveauCount(selectedNiveau),  recipientLabel: `Niveau ${selectedNiveau} — ${getNiveauCount(selectedNiveau)} éts` };
      if (studentMode === "individual") return { recipientCount: selectedStudent ? 1 : 0,          recipientLabel: selectedStudent ? `${selectedStudent.prenom} ${selectedStudent.nom} — ${selectedStudent.matricule}` : "" };
    } else {
      if (teacherMode === "all")        return { recipientCount: agentTeachers.length,                                                                     recipientLabel: `Tous les enseignants — ${agentTeachers.length} éts` };
      if (teacherMode === "individual") return { recipientCount: selectedTeacher ? 1 : 0,                                                                  recipientLabel: selectedTeacher ? `${selectedTeacher.prenom} ${selectedTeacher.nom} — ${selectedTeacher.matricule}` : "" };
    }
    return { recipientCount: 0, recipientLabel: "" };
  }, [audience, studentMode, teacherMode, selectedNiveau, selectedStudent, selectedTeacher]);

  function handleSend() {
    if (!message.trim() || !recipientLabel) return;
    setHistory(prev => [{
      id: `h${Date.now()}`,
      recipient: recipientLabel,
      message,
      date: new Date().toLocaleString("fr-FR").replace(",", ""),
      statut: "Envoyé",
    }, ...prev]);
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 3000);
  }

  const canSend = message.trim().length > 0 && recipientLabel.length > 0 && (
    (audience === "etudiants"  && (studentMode !== "individual" || selectedStudent  !== null)) ||
    (audience === "enseignants" && (teacherMode !== "individual" || selectedTeacher !== null))
  );

  const templates = audience === "etudiants" ? studentTemplates : teacherTemplates;

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Envoyez des notifications aux étudiants et aux enseignants.
            </p>
          </motion.div>

          {/* ── Audience toggle ── */}
          <motion.div variants={item}>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-1 gap-1">
              <button
                onClick={() => switchAudience("etudiants")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  audience === "etudiants"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Étudiants
              </button>
              <button
                onClick={() => switchAudience("enseignants")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  audience === "enseignants"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Enseignants
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* ── Compose ── */}
            <motion.div variants={item} className="lg:col-span-3">
              <Card className="p-5">
                <h2 className="font-semibold text-sm mb-4">Composer un message</h2>

                {/* ── STUDENT recipient ── */}
                {audience === "etudiants" && (
                  <>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Destinataires</label>
                      <Select value={studentMode} onValueChange={v => { setStudentMode(v); setSelectedStudent(null); setSearchQuery(""); }}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />Tous les étudiants ({totalStudentCount})</div>
                          </SelectItem>
                          <SelectItem value="niveau">
                            <div className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5" />Par niveau</div>
                          </SelectItem>
                          <SelectItem value="individual">
                            <div className="flex items-center gap-2"><Search className="w-3.5 h-3.5" />Étudiant individuel</div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Niveau selector */}
                    {studentMode === "niveau" && (
                      <div className="mb-4">
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Choisir le niveau</label>
                        <Select value={selectedNiveau} onValueChange={setSelectedNiveau}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {niveauxFiliere.map(n => (
                              <SelectItem key={n.id} value={n.id}>
                                {n.label} — {getNiveauCount(n.id)} étudiants
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Individual student search */}
                    {studentMode === "individual" && (
                      <div className="mb-4">
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Rechercher un étudiant</label>
                        {selectedStudent ? (
                          <div className="flex items-center justify-between p-2.5 rounded-lg border border-primary/30 bg-primary/5">
                            <div>
                              <p className="text-sm font-medium">{selectedStudent.prenom} {selectedStudent.nom}</p>
                              <p className="text-xs text-muted-foreground">{selectedStudent.matricule} — {selectedStudent.niveau} {selectedStudent.groupe}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs h-7 px-2"
                              onClick={() => { setSelectedStudent(null); setSearchQuery(""); }}>
                              Changer
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input className="pl-8 h-9 text-sm" placeholder="Nom, prénom ou matricule…"
                              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            {filteredStudents.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border border-border rounded-lg shadow-md overflow-hidden">
                                {filteredStudents.map(s => (
                                  <button key={s.id} onClick={() => { setSelectedStudent(s); setSearchQuery(""); }}
                                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center justify-between gap-3 transition-colors">
                                    <span className="font-medium">{s.prenom} {s.nom}</span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{s.matricule} — {s.niveau}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {searchQuery.trim() && filteredStudents.length === 0 && (
                              <p className="text-xs text-muted-foreground mt-1.5">Aucun étudiant trouvé.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── TEACHER recipient ── */}
                {audience === "enseignants" && (
                  <>
                    <div className="mb-4">
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">Destinataires</label>
                      <Select value={teacherMode} onValueChange={v => { setTeacherMode(v); setSelectedTeacher(null); setSearchQuery(""); }}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            <div className="flex items-center gap-2"><UserCheck className="w-3.5 h-3.5" />Tous les enseignants ({agentTeachers.length})</div>
                          </SelectItem>
                          <SelectItem value="individual">
                            <div className="flex items-center gap-2"><Search className="w-3.5 h-3.5" />Enseignant individuel</div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Individual teacher search */}
                    {teacherMode === "individual" && (
                      <div className="mb-4">
                        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Rechercher un enseignant</label>
                        {selectedTeacher ? (
                          <div className="flex items-center justify-between p-2.5 rounded-lg border border-primary/30 bg-primary/5">
                            <div>
                              <p className="text-sm font-medium">{selectedTeacher.prenom} {selectedTeacher.nom}</p>
                              <p className="text-xs text-muted-foreground">{selectedTeacher.email.split("@")[0]} — {selectedTeacher.grade} — {selectedTeacher.departement}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs h-7 px-2"
                              onClick={() => { setSelectedTeacher(null); setSearchQuery(""); }}>
                              Changer
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            <Input className="pl-8 h-9 text-sm" placeholder="Nom, prénom ou nom d'utilisateur…"
                              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            {filteredTeachers.length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border border-border rounded-lg shadow-md overflow-hidden">
                                {filteredTeachers.map(t => (
                                  <button key={t.id} onClick={() => { setSelectedTeacher(t); setSearchQuery(""); }}
                                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center justify-between gap-3 transition-colors">
                                    <span className="font-medium">{t.prenom} {t.nom}</span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{t.email.split("@")[0]} — {t.departement}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {searchQuery.trim() && filteredTeachers.length === 0 && (
                              <p className="text-xs text-muted-foreground mt-1.5">Aucun enseignant trouvé.</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* ── Templates ── */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Modèles prédéfinis</label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map(t => (
                      <button key={t.id} onClick={() => setMessage(t.text)}
                        className="text-left p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 text-xs transition-all">
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Message ── */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Message</label>
                  <textarea
                    className="w-full h-28 px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Saisissez votre message ou choisissez un modèle ci-dessus…"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  {recipientCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Sera envoyé à <strong>{recipientCount}</strong> destinataire{recipientCount > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                {sent && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100 mb-3">
                    <CheckCircle className="w-4 h-4" />
                    Notification envoyée avec succès.
                  </div>
                )}

                <Button className="w-full gap-2" disabled={!canSend} onClick={handleSend}>
                  <Send className="w-4 h-4" />
                  Envoyer la notification
                </Button>
              </Card>
            </motion.div>

            {/* ── History ── */}
            <motion.div variants={item} className="lg:col-span-2">
              <Card className="p-5">
                <h2 className="font-semibold text-sm mb-4">Historique des envois</h2>
                <div className="space-y-3">
                  {history.map(h => (
                    <div key={h.id} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-medium text-muted-foreground">{h.recipient}</p>
                        <Badge className="text-xs bg-green-100 text-green-800 border-green-200 flex-shrink-0">{h.statut}</Badge>
                      </div>
                      <p className="text-sm line-clamp-2">{h.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{h.date}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
