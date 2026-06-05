import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Users, GraduationCap, CheckCircle, BookOpen, Search, UserCheck } from "lucide-react";
import {
  allStudents,
  niveauxFiliere,
  teacherAssignments,
  studentsDB,
  teacherSentNotifs,
} from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const templates = [
  { id: "t1", label: "Séance annulée",     text: "La séance prévue est annulée. Une nouvelle date vous sera communiquée ultérieurement." },
  { id: "t2", label: "Séance reportée",    text: "La séance a été reportée. Veuillez consulter l'emploi du temps mis à jour pour la nouvelle date." },
  { id: "t3", label: "Support disponible", text: "Un nouveau support de cours est disponible. Veuillez le consulter avant la prochaine séance." },
  { id: "t4", label: "Date d'examen",      text: "Rappel : l'examen aura lieu prochainement. Préparez-vous et consultez les consignes sur le portail." },
  { id: "t5", label: "Notes publiées",     text: "Les résultats de l'évaluation ont été publiés. Vous pouvez les consulter dans votre espace étudiant." },
  { id: "t6", label: "TP à rendre",        text: "Rappel : le travail pratique est à remettre avant la date limite. Tout retard ne sera pas accepté." },
];

// Compute teacher's unique groups and totals
const teacherGroupKeys = [
  ...new Set(teacherAssignments.flatMap((a) => a.groupes.map((g) => `${a.niveau}-${g}`))),
];
const myStudentCount = teacherGroupKeys.reduce(
  (sum, key) => sum + (studentsDB[key]?.length ?? 0),
  0,
);
const totalStudentCount = Object.values(studentsDB).reduce(
  (sum, arr) => sum + arr.length,
  0,
);

function getNiveauCount(niveau: string) {
  return Object.entries(studentsDB)
    .filter(([k]) => k.startsWith(niveau + "-"))
    .reduce((sum, [, arr]) => sum + arr.length, 0);
}

function getModuleCount(a: (typeof teacherAssignments)[0]) {
  return a.groupes.reduce(
    (sum, g) => sum + (studentsDB[`${a.niveau}-${g}`]?.length ?? 0),
    0,
  );
}

type SentNotif = { id: string; recipient: string; message: string; date: string; statut: "Envoyé" };

export default function EnseignantNotifications() {
  const [recipientType, setRecipientType] = useState("tous");
  const [selectedNiveau, setSelectedNiveau] = useState(niveauxFiliere[0].id);
  const [selectedModuleKey, setSelectedModuleKey] = useState(teacherAssignments[0].key);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<(typeof allStudents)[0] | null>(null);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<SentNotif[]>(teacherSentNotifs);
  const [sent, setSent] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allStudents
      .filter(
        (s) =>
          s.nom.toLowerCase().includes(q) ||
          s.prenom.toLowerCase().includes(q) ||
          s.matricule.includes(q),
      )
      .slice(0, 8);
  }, [searchQuery]);

  const recipientCount = useMemo(() => {
    if (recipientType === "tous") return totalStudentCount;
    if (recipientType === "mes") return myStudentCount;
    if (recipientType === "niveau") return getNiveauCount(selectedNiveau);
    if (recipientType === "module") {
      const a = teacherAssignments.find((a) => a.key === selectedModuleKey);
      return a ? getModuleCount(a) : 0;
    }
    if (recipientType === "individuel") return selectedStudent ? 1 : 0;
    return 0;
  }, [recipientType, selectedNiveau, selectedModuleKey, selectedStudent]);

  const recipientLabel = useMemo(() => {
    if (recipientType === "tous") return `Tous les étudiants — ${totalStudentCount} éts`;
    if (recipientType === "mes") return `Mes étudiants — ${myStudentCount} éts`;
    if (recipientType === "niveau") {
      const niv = niveauxFiliere.find((n) => n.id === selectedNiveau);
      return `Niveau ${niv?.id ?? selectedNiveau} — ${getNiveauCount(selectedNiveau)} éts`;
    }
    if (recipientType === "module") {
      const a = teacherAssignments.find((a) => a.key === selectedModuleKey);
      return a ? `${a.intitule} ${a.niveau} — ${getModuleCount(a)} éts` : "";
    }
    if (recipientType === "individuel" && selectedStudent) {
      return `${selectedStudent.prenom} ${selectedStudent.nom} — ${selectedStudent.matricule}`;
    }
    return "";
  }, [recipientType, selectedNiveau, selectedModuleKey, selectedStudent]);

  function handleSend() {
    if (!message.trim() || !recipientLabel) return;
    setHistory((prev) => [
      {
        id: `tsn${Date.now()}`,
        recipient: recipientLabel,
        message,
        date: new Date().toLocaleString("fr-FR").replace(",", ""),
        statut: "Envoyé",
      },
      ...prev,
    ]);
    setSent(true);
    setMessage("");
    setTimeout(() => setSent(false), 3000);
  }

  const canSend =
    message.trim().length > 0 &&
    (recipientType !== "individuel" || selectedStudent !== null);

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-500" />
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Envoyez des notifications à vos étudiants — par niveau, par module, ou individuellement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* ── Compose ── */}
            <motion.div variants={item} className="lg:col-span-3">
              <Card className="p-5">
                <h2 className="font-semibold text-sm mb-4">Composer un message</h2>

                {/* Recipient type */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Destinataires</label>
                  <Select
                    value={recipientType}
                    onValueChange={(v) => {
                      setRecipientType(v);
                      setSelectedStudent(null);
                      setSearchQuery("");
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          Tous les étudiants ({totalStudentCount})
                        </div>
                      </SelectItem>
                      <SelectItem value="mes">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5" />
                          Mes étudiants ({myStudentCount})
                        </div>
                      </SelectItem>
                      <SelectItem value="niveau">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Par niveau
                        </div>
                      </SelectItem>
                      <SelectItem value="module">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5" />
                          Par module
                        </div>
                      </SelectItem>
                      <SelectItem value="individuel">
                        <div className="flex items-center gap-2">
                          <Search className="w-3.5 h-3.5" />
                          Étudiant individuel
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Niveau selector */}
                {recipientType === "niveau" && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Choisir le niveau</label>
                    <Select value={selectedNiveau} onValueChange={setSelectedNiveau}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {niveauxFiliere.map((n) => (
                          <SelectItem key={n.id} value={n.id}>
                            {n.label} — {getNiveauCount(n.id)} étudiants
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Module selector */}
                {recipientType === "module" && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Choisir le module</label>
                    <Select value={selectedModuleKey} onValueChange={setSelectedModuleKey}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {teacherAssignments.map((a) => (
                          <SelectItem key={a.key} value={a.key}>
                            {a.intitule} — {a.niveau} ({getModuleCount(a)} éts)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Individual student search */}
                {recipientType === "individuel" && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Rechercher un étudiant</label>
                    {selectedStudent ? (
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-primary/30 bg-primary/5">
                        <div>
                          <p className="text-sm font-medium">{selectedStudent.prenom} {selectedStudent.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedStudent.matricule} — {selectedStudent.niveau} {selectedStudent.groupe}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => { setSelectedStudent(null); setSearchQuery(""); }}
                        >
                          Changer
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                          className="pl-8 h-9 text-sm"
                          placeholder="Nom, prénom ou matricule…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {filteredStudents.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border border-border rounded-lg shadow-md overflow-hidden">
                            {filteredStudents.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => { setSelectedStudent(s); setSearchQuery(""); }}
                                className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center justify-between gap-3 transition-colors"
                              >
                                <span className="font-medium">{s.prenom} {s.nom}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {s.matricule} — {s.niveau}
                                </span>
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

                {/* Templates */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Modèles prédéfinis</label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setMessage(t.text)}
                        className="text-left p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 text-xs transition-all"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Message</label>
                  <textarea
                    className="w-full h-28 px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Saisissez votre message ou choisissez un modèle ci-dessus…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Aucune notification envoyée.</p>
                  ) : (
                    history.map((h) => (
                      <div key={h.id} className="p-3 rounded-lg bg-muted/20 border border-border/50">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-medium text-muted-foreground">{h.recipient}</p>
                          <Badge className="text-xs bg-green-100 text-green-800 border-green-200 flex-shrink-0">
                            {h.statut}
                          </Badge>
                        </div>
                        <p className="text-sm line-clamp-2">{h.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{h.date}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
