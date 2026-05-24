import { useState } from "react";
import { motion } from "framer-motion";
import { AgentSidebar } from "@/components/AgentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Users, GraduationCap, CheckCircle, Clock } from "lucide-react";
import { agentStudents } from "@/data/mockData";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item      = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

type SentNotif = {
  id: string; recipient: string; message: string; date: string; statut: "Envoyé";
};

const initialHistory: SentNotif[] = [
  { id: "h1", recipient: "Groupe L3 — Groupe 1 (28 étudiants)", message: "Rappel : la date limite de dépôt des dossiers de réinscription est le 30 septembre 2025.", date: "2025-09-15 10:30", statut: "Envoyé" },
  { id: "h2", recipient: "Bensalem Karim", message: "Votre dossier est incomplet. Veuillez soumettre votre CNI avant la date limite.", date: "2025-09-12 14:15", statut: "Envoyé" },
  { id: "h3", recipient: "Tous les étudiants L3", message: "Votre réinscription pour l'année universitaire 2025-2026 a été validée. Bienvenue !", date: "2025-09-10 09:00", statut: "Envoyé" },
];

export default function AgentNotifications() {
  const [recipient, setRecipient]           = useState("all");
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [message, setMessage]               = useState("");
  const [history, setHistory]               = useState<SentNotif[]>(initialHistory);
  const [sent, setSent]                     = useState(false);

  function handleSend() {
    if (!message.trim()) return;
    const recipientLabel =
      recipient === "all"        ? "Tous les étudiants" :
      recipient === "pending"    ? "Étudiants en attente" :
      recipient === "incomplete" ? "Dossiers incomplets" :
      recipient === "individual" && selectedStudent !== "all"
        ? (() => { const s = agentStudents.find(s => s.id === selectedStudent); return s ? `${s.prenom} ${s.nom}` : "Étudiant sélectionné"; })()
        : "Groupe sélectionné";

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

  const recipientCount =
    recipient === "all"        ? agentStudents.length :
    recipient === "pending"    ? agentStudents.filter(s => s.statutReinscription === "en_attente").length :
    recipient === "incomplete" ? agentStudents.filter(s => s.statutReinscription === "incomplet").length :
    1;

  return (
    <div className="flex min-h-screen bg-background">
      <AgentSidebar />
      <main className="flex-1 p-7 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">Envoyez des messages aux étudiants individuellement ou en groupe.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Compose */}
            <motion.div variants={item} className="lg:col-span-3 space-y-4">
              <Card className="p-5">
                <h2 className="font-semibold text-sm mb-4">Composer un message</h2>

                {/* Recipient */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Destinataire</label>
                  <Select value={recipient} onValueChange={v => { setRecipient(v); setSelectedStudent("all"); }}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />Tous les étudiants ({agentStudents.length})</div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />Étudiants en attente ({agentStudents.filter(s => s.statutReinscription === "en_attente").length})</div>
                      </SelectItem>
                      <SelectItem value="incomplete">
                        <div className="flex items-center gap-2"><Bell className="w-3.5 h-3.5" />Dossiers incomplets ({agentStudents.filter(s => s.statutReinscription === "incomplet").length})</div>
                      </SelectItem>
                      <SelectItem value="individual">
                        <div className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5" />Étudiant individuel</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Individual selector */}
                {recipient === "individual" && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground block mb-1.5">Choisir l'étudiant</label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                      <SelectContent>
                        {agentStudents.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.prenom} {s.nom} — {s.matricule}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Message */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Message</label>
                  <textarea
                    className="w-full h-36 px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Saisissez votre message…"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Sera envoyé à <strong>{recipientCount}</strong> destinataire{recipientCount > 1 ? "s" : ""}
                  </p>
                </div>

                {sent && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100 mb-3">
                    <CheckCircle className="w-4 h-4" />
                    Message envoyé avec succès.
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  disabled={!message.trim() || (recipient === "individual" && selectedStudent === "all")}
                  onClick={handleSend}
                >
                  <Send className="w-4 h-4" />Envoyer le message
                </Button>
              </Card>
            </motion.div>

            {/* History */}
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
