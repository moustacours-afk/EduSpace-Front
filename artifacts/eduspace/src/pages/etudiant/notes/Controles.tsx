import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Flag, Clock, CheckCircle, XCircle } from "lucide-react";
import { notes, notesS6, currentStudent } from "@/data/mockData";
import {
  submitAppeal, getAppealForModule, markAppealNotified, getStudentAppeals,
  type Appeal, type AppealNoteType,
} from "@/lib/appealStore";
import { useToast } from "@/hooks/use-toast";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

type AppealDialogState = {
  moduleId: string;
  moduleName: string;
  semestre: string;
  noteType: AppealNoteType;
  currentNote: number;
} | null;

function AppealCell({
  moduleId, moduleName, semestre, noteType, currentNote, refreshKey, onOpen,
}: {
  moduleId: string; moduleName: string; semestre: string;
  noteType: AppealNoteType; currentNote: number;
  refreshKey: number;
  onOpen: (s: AppealDialogState) => void;
}) {
  const [appeal, setAppeal] = useState<Appeal | undefined>();

  useEffect(() => {
    setAppeal(getAppealForModule(currentStudent.id, moduleId, noteType));
  }, [moduleId, noteType, refreshKey]);

  if (!appeal) {
    return (
      <button
        onClick={() => onOpen({ moduleId, moduleName, semestre, noteType, currentNote })}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 border border-primary/30 hover:border-primary/60 px-2.5 py-1.5 rounded-lg transition-all font-medium"
      >
        <Flag className="w-3 h-3" />
        Recours
      </button>
    );
  }

  if (appeal.status === "en_attente") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg font-medium">
        <Clock className="w-3 h-3" />
        En cours
      </span>
    );
  }

  if (appeal.status === "accepte" || appeal.status === "valide_agent") {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-lg font-medium">
          <CheckCircle className="w-3 h-3" />
          Accepté
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
      Refusé
    </span>
  );
}

const noteTypeLabels: Record<AppealNoteType, string> = {
  exam: "Note Examen",
  controle: "Note Contrôle",
  tp: "Note TP",
  generale: "Moyenne générale",
};

function SemestreTable({
  label, data, refreshKey, onOpen,
}: {
  label: string; data: typeof notes; refreshKey: number;
  onOpen: (s: AppealDialogState) => void;
}) {
  const semestre = data[0]?.semestre ?? "";

  return (
    <Card>
      <div className="p-4 border-b border-border flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">{label}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Module</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Contrôle 1</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Contrôle 2</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">TP</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Moy. CC+TP</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Recours CC</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Recours TP</th>
            </tr>
          </thead>
          <tbody>
            {data.map((n, i) => {
              const ccMoy = n.tp !== null
                ? ((n.controle + (n.tp ?? 0)) / 2).toFixed(2)
                : n.controle.toFixed(2);
              return (
                <motion.tr
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium">{n.module}</td>
                  <td className="text-center px-4 py-3.5">{n.controle}</td>
                  <td className="text-center px-4 py-3.5 text-muted-foreground">—</td>
                  <td className="text-center px-4 py-3.5">
                    {n.tp !== null ? n.tp : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="text-center px-4 py-3.5">
                    <span className={`font-bold ${parseFloat(ccMoy) >= 10 ? "text-green-600" : "text-red-500"}`}>
                      {ccMoy}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <AppealCell
                      moduleId={n.moduleId}
                      moduleName={n.module}
                      semestre={semestre}
                      noteType="controle"
                      currentNote={n.controle}
                      refreshKey={refreshKey}
                      onOpen={onOpen}
                    />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {n.tp !== null ? (
                      <AppealCell
                        moduleId={n.moduleId}
                        moduleName={n.module}
                        semestre={semestre}
                        noteType="tp"
                        currentNote={n.tp!}
                        refreshKey={refreshKey}
                        onOpen={onOpen}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function EtudiantControles() {
  const [dialogState, setDialogState] = useState<AppealDialogState>(null);
  const [reason, setReason] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

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
    setRefreshKey((k) => k + 1);
    setDialogState(null);
    setReason("");
    toast({ title: "Recours soumis", description: `Votre recours pour "${dialogState.moduleName}" a été envoyé à l'enseignant.` });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Contrôle continu & TP</h1>
            <p className="text-muted-foreground mt-1">
              Matricule : {currentStudent.matricule} — {currentStudent.filiere} {currentStudent.niveau}
            </p>
          </motion.div>

          <motion.div variants={item}>
            <SemestreTable label="Semestre 5" data={notes} refreshKey={refreshKey} onOpen={setDialogState} />
          </motion.div>

          <motion.div variants={item}>
            <SemestreTable label="Semestre 6" data={notesS6} refreshKey={refreshKey} onOpen={setDialogState} />
          </motion.div>

        </motion.div>
      </main>

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
                <p>
                  <span className="text-muted-foreground">{noteTypeLabels[dialogState.noteType]} :</span>{" "}
                  <span className="font-semibold">{dialogState.currentNote}/20</span>
                </p>
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
                Votre recours sera transmis à l'enseignant. Vous serez notifié de la décision.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogState(null); setReason(""); }}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={!reason.trim()} className="gap-2">
              <Flag className="w-3.5 h-3.5" />
              Soumettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
