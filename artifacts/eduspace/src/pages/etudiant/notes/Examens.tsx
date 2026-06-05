import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck, Flag, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  submitAppeal, getAppealForModule, markAppealNotified, getStudentAppeals,
  type Appeal, type AppealNoteType,
} from "@/lib/appealStore";
import { useToast } from "@/hooks/use-toast";
import { etudiant as api } from "@/lib/api";
import { getUser } from "@/lib/auth";

const sessions = ["Session normale", "Session rattrapage"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

interface NoteRow {
  id: number;
  moduleId: number;
  module: string;
  exam: number | null;
  moyenne: number | null;
  situation: "admis" | "ajourne" | "rattrapage";
  semestre: string;
}

type AppealDialogState = {
  moduleId: string;
  moduleName: string;
  semestre: string;
  noteType: AppealNoteType;
  currentNote: number;
} | null;

function AppealCell({
  studentId, moduleId, moduleName, semestre, noteType, currentNote, refreshKey, onOpen,
}: {
  studentId: string; moduleId: string; moduleName: string; semestre: string;
  noteType: AppealNoteType; currentNote: number;
  refreshKey: number;
  onOpen: (s: AppealDialogState) => void;
}) {
  const [appeal, setAppeal] = useState<Appeal | undefined>();

  useEffect(() => {
    setAppeal(getAppealForModule(studentId, moduleId, noteType));
  }, [studentId, moduleId, noteType, refreshKey]);

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
        Traitement en cours
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

function ExamTable({
  label, data, studentId, refreshKey, onOpen, session,
}: {
  label: string; data: NoteRow[]; studentId: string; refreshKey: number;
  onOpen: (s: AppealDialogState) => void;
  session: string;
}) {
  return (
    <Card>
      <div className="p-4 border-b border-border flex items-center gap-2">
        <FileCheck className="w-4 h-4 text-primary" />
        <h2 className="font-semibold text-sm">{label}</h2>
      </div>
      {data.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          Aucune note publiée pour ce semestre.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Module</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Note Examen</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Recours</th>
              </tr>
            </thead>
            <tbody>
              {data.map((n, i) => (
                <motion.tr
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/10 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium">{n.module}</td>
                  <td className="text-center px-4 py-3.5">
                    {n.exam !== null
                      ? <span className={`font-semibold ${n.exam >= 10 ? "text-green-600" : "text-red-500"}`}>{n.exam}</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {session === "Session normale" && n.exam !== null ? (
                      <AppealCell
                        studentId={studentId}
                        moduleId={String(n.moduleId)}
                        moduleName={n.module}
                        semestre={n.semestre}
                        noteType="exam"
                        currentNote={n.exam}
                        refreshKey={refreshKey}
                        onOpen={onOpen}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function EtudiantExamens() {
  const user = getUser();
  const profile = user?.profile as Record<string, unknown> | null;
  const studentId = String(profile?.id ?? user?.id ?? "");
  const matricule = String(profile?.matricule ?? "");
  const filiere   = String(profile?.filiere ?? "");
  const niveau    = String(profile?.niveau ?? "");

  const [session, setSession] = useState("Session normale");
  const [dialogState, setDialogState] = useState<AppealDialogState>(null);
  const [reason, setReason] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    api.notes().then((d) => setNotes(d as NoteRow[])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!studentId) return;
    const pending = getStudentAppeals(studentId).filter(
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
  }, [toast, studentId]);

  function handleSubmit() {
    if (!dialogState || !reason.trim()) return;
    submitAppeal({
      studentId,
      studentNom: String(profile?.nom ?? ""),
      studentPrenom: String(profile?.prenom ?? ""),
      studentMatricule: matricule,
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

  const bySemestre = notes.reduce<Record<string, NoteRow[]>>((acc, n) => {
    (acc[n.semestre] ??= []).push(n);
    return acc;
  }, {});
  const semestres = Object.keys(bySemestre).sort();

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">

          <motion.div variants={item}>
            <h1 className="text-2xl font-bold">Examens</h1>
            <p className="text-muted-foreground mt-1">
              Matricule : {matricule} — {filiere} {niveau}
            </p>
          </motion.div>

          <motion.div variants={item} className="flex gap-2">
            {sessions.map((s) => (
              <button
                key={s}
                onClick={() => setSession(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                  session === s
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </motion.div>

          {notes.length === 0 ? (
            <motion.div variants={item}>
              <Card className="p-12 text-center text-muted-foreground">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucune note d'examen publiée</p>
                <p className="text-sm mt-1 opacity-70">
                  Vos notes d'examen apparaîtront ici une fois publiées par l'agent pédagogique.
                </p>
              </Card>
            </motion.div>
          ) : (
            semestres.map((s) => (
              <motion.div variants={item} key={s}>
                <ExamTable
                  label={`${s} — ${session}`}
                  data={bySemestre[s]}
                  studentId={studentId}
                  refreshKey={refreshKey}
                  onOpen={setDialogState}
                  session={session}
                />
              </motion.div>
            ))
          )}

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
                <p><span className="text-muted-foreground">Note Examen :</span> <span className="font-semibold">{dialogState.currentNote}/20</span></p>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Motif du recours <span className="text-red-500">*</span></label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous contestez cette note d'examen…"
                  rows={4}
                  className="resize-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Votre recours sera transmis à l'enseignant responsable. Vous serez notifié de la décision.
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
