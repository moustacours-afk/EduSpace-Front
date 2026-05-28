import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BarChart2, Flag, Clock, CheckCircle, XCircle } from "lucide-react";
import { notes, notesS6, currentStudent } from "@/data/mockData";
import {
  submitAppeal, getAppealForModule, markAppealNotified, getStudentAppeals,
  type Appeal, type AppealNoteType,
} from "@/lib/appealStore";
import { useToast } from "@/hooks/use-toast";

const annees = ["2024-2025", "2023-2024", "2022-2023"];

const situationConfig = {
  admis: { label: "Admis", color: "bg-green-100 text-green-800 border-green-200" },
  ajourne: { label: "Ajourné", color: "bg-red-100 text-red-800 border-red-200" },
  rattrapage: { label: "Rattrapage", color: "bg-amber-100 text-amber-800 border-amber-200" },
};

const situationGenerale = {
  label: "Admis — Session Normale",
  color: "bg-green-100 text-green-700 border-green-200",
};

const noteTypeLabels: Record<AppealNoteType, string> = {
  exam: "Note Examen",
  controle: "Note Contrôle",
  tp: "Note TP",
  generale: "Moyenne générale",
};

type AppealDialogState = {
  moduleId: string;
  moduleName: string;
  semestre: string;
  noteType: AppealNoteType;
  currentNote: number;
} | null;

function AppealCell({
  moduleId, moduleName, semestre, noteType, currentNote, onOpen,
}: {
  moduleId: string; moduleName: string; semestre: string;
  noteType: AppealNoteType; currentNote: number;
  onOpen: (s: AppealDialogState) => void;
}) {
  const [appeal, setAppeal] = useState<Appeal | undefined>(
    getAppealForModule(currentStudent.id, moduleId, noteType)
  );

  useEffect(() => {
    setAppeal(getAppealForModule(currentStudent.id, moduleId, noteType));
  }, [moduleId, noteType]);

  if (!appeal) {
    return (
      <button
        onClick={() => onOpen({ moduleId, moduleName, semestre, noteType, currentNote })}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 border border-primary/30 hover:border-primary/60 px-2.5 py-1.5 rounded-lg transition-all font-medium"
      >
        <Flag className="w-3 h-3" />
        Soumettre un recours
      </button>
    );
  }

  if (appeal.status === "en_attente") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg font-medium">
        <Clock className="w-3 h-3" />
        Le traitement est en cours
      </span>
    );
  }

  if (appeal.status === "accepte" || appeal.status === "valide_agent") {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg font-medium">
          <CheckCircle className="w-3 h-3" />
          Recours accepté
        </span>
        {appeal.proposedNote !== undefined && (
          <span className="text-xs text-green-600 font-semibold pl-1">→ {appeal.proposedNote}/20</span>
        )}
      </div>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg font-medium">
      <XCircle className="w-3 h-3" />
      Recours refusé
    </span>
  );
}

function SemestreTable({
  label, data, onOpen,
}: {
  label: string; data: typeof notes;
  onOpen: (s: AppealDialogState) => void;
}) {
  const moy = (data.reduce((a, n) => a + n.moyenne, 0) / data.length).toFixed(2);
  const semestre = data[0]?.semestre ?? "";

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-base">{label}</h3>
        <span className="text-sm text-muted-foreground">
          Moyenne semestre : <span className="font-bold text-foreground">{moy}</span>
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Module</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Examen</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Contrôle</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">TP</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Moyenne</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Crédits</th>
              <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Situation</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Recours</th>
            </tr>
          </thead>
          <tbody>
            {data.map((n) => {
              const conf = situationConfig[n.situation];
              return (
                <tr key={n.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-3 font-medium">{n.module}</td>
                  <td className="text-center px-4 py-3">{n.exam}</td>
                  <td className="text-center px-4 py-3">{n.controle}</td>
                  <td className="text-center px-4 py-3">{n.tp ?? "—"}</td>
                  <td className="text-center px-4 py-3">
                    <span className={`font-bold ${n.moyenne >= 10 ? "text-green-600" : "text-red-500"}`}>
                      {n.moyenne.toFixed(2)}
                    </span>
                  </td>
                  <td className="text-center px-4 py-3 font-medium">{n.creditAcquis}</td>
                  <td className="px-5 py-3">
                    <Badge className={`text-xs border ${conf.color}`}>{conf.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <AppealCell
                      moduleId={n.moduleId}
                      moduleName={n.module}
                      semestre={semestre}
                      noteType="generale"
                      currentNote={n.moyenne}
                      onOpen={onOpen}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 px-5 py-3 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Moyenne {label}</span>
        <span className={`font-bold text-base ${parseFloat(moy) >= 10 ? "text-green-600" : "text-red-500"}`}>
          {moy} / 20
        </span>
      </div>
    </div>
  );
}

export default function EtudiantGeneral() {
  const [annee, setAnnee] = useState("2024-2025");
  const [dialogState, setDialogState] = useState<AppealDialogState>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const moyS5 = notes.reduce((a, n) => a + n.moyenne, 0) / notes.length;
  const moyS6 = notesS6.reduce((a, n) => a + n.moyenne, 0) / notesS6.length;
  const moyGenerale = ((moyS5 + moyS6) / 2).toFixed(2);

  // Fire toasts for newly decided appeals
  useEffect(() => {
    const pending = getStudentAppeals(currentStudent.id).filter(
      (a) => (a.status === "accepte" || a.status === "refuse" || a.status === "valide_agent") && !a.notifiedStudent
    );
    for (const a of pending) {
      markAppealNotified(a.id);
      if (a.status === "refuse") {
        toast({
          title: "Recours refusé",
          description: `Votre recours pour "${a.moduleName}" a été refusé.${a.teacherComment ? ` Motif : ${a.teacherComment}` : ""}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Recours accepté",
          description: `Votre recours pour "${a.moduleName}" a été accepté.${a.proposedNote !== undefined ? ` Nouvelle note : ${a.proposedNote}/20` : ""}`,
        });
      }
    }
  }, [toast]);

  function handleSubmit() {
    if (!dialogState || !reason.trim()) return;
    setSubmitting(true);
    submitAppeal({
      studentId: currentStudent.id,
      studentNom: currentStudent.nom,
      studentPrenom: currentStudent.prenom,
      studentMatricule: currentStudent.matricule,
      moduleId: dialogState.moduleId,
      moduleName: dialogState.moduleName,
      semestre: dialogState.semestre,
      noteType: dialogState.noteType,
      currentNote: dialogState.currentNote,
      reason: reason.trim(),
    });
    setSubmitting(false);
    setDialogState(null);
    setReason("");
    toast({ title: "Recours soumis", description: `Votre recours pour "${dialogState.moduleName}" a été envoyé à l'enseignant.` });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold">Résultats généraux</h1>
              <p className="text-muted-foreground mt-1">
                Matricule : {currentStudent.matricule} — {currentStudent.filiere} {currentStudent.niveau}
              </p>
            </div>
            <Select value={annee} onValueChange={setAnnee}>
              <SelectTrigger className="w-40" data-testid="select-annee-general">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {annees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
            <div className="flex-1">
              <p className="text-xs text-blue-500 mb-1 font-medium">Moyenne générale — {annee}</p>
              <p className="text-3xl font-extrabold text-blue-700">
                {moyGenerale}<span className="text-base font-normal text-blue-400"> / 20</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Situation</p>
              <Badge className={`text-sm border px-3 py-1 ${situationGenerale.color}`}>
                <BarChart2 className="w-3.5 h-3.5 mr-1.5 inline" />
                {situationGenerale.label}
              </Badge>
            </div>
          </div>

          <SemestreTable label="Semestre 5" data={notes} onOpen={setDialogState} />
          <SemestreTable label="Semestre 6" data={notesS6} onOpen={setDialogState} />
        </motion.div>
      </main>

      {/* Appeal dialog */}
      <Dialog open={!!dialogState} onOpenChange={(open) => { if (!open) { setDialogState(null); setReason(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-primary" />
              Soumettre un recours
            </DialogTitle>
          </DialogHeader>
          {dialogState && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-lg text-sm space-y-1">
                <p><span className="text-muted-foreground">Module :</span> <span className="font-semibold">{dialogState.moduleName}</span></p>
                <p><span className="text-muted-foreground">Note contestée :</span> <span className="font-semibold">{noteTypeLabels[dialogState.noteType]} — {dialogState.currentNote}/20</span></p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Motif du recours <span className="text-red-500">*</span></label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous contestez cette note…"
                  rows={4}
                  className="resize-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Votre recours sera transmis à l'enseignant responsable du module. Vous serez notifié de la décision.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogState(null); setReason(""); }}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={!reason.trim() || submitting} className="gap-2">
              <Flag className="w-3.5 h-3.5" />
              Soumettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
