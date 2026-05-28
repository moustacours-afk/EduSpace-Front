export type AppealStatus = "en_attente" | "accepte" | "refuse" | "valide_agent";
export type AppealNoteType = "exam" | "controle" | "tp" | "generale";

export type Appeal = {
  id: string;
  studentId: string;
  studentNom: string;
  studentPrenom: string;
  studentMatricule: string;
  moduleId: string;
  moduleName: string;
  semestre: string;
  noteType: AppealNoteType;
  currentNote: number;
  reason: string;
  status: AppealStatus;
  createdAt: string;
  updatedAt?: string;
  teacherComment?: string;
  proposedNote?: number;
  notifiedStudent?: boolean;
};

const KEY = "eduspace_appeals";

function load(): Appeal[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
  catch { return []; }
}

function save(data: Appeal[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getAppeals(): Appeal[] { return load(); }

export function getStudentAppeals(studentId: string): Appeal[] {
  return load().filter((a) => a.studentId === studentId);
}

export function getPendingTeacherAppeals(): Appeal[] {
  return load().filter((a) => a.status === "en_attente");
}

export function getAcceptedAppealsForAgent(): Appeal[] {
  return load().filter((a) => a.status === "accepte");
}

export function hasActiveAppeal(studentId: string, moduleId: string, noteType: AppealNoteType): boolean {
  return load().some(
    (a) => a.studentId === studentId && a.moduleId === moduleId && a.noteType === noteType && a.status === "en_attente"
  );
}

export function getAppealForModule(studentId: string, moduleId: string, noteType: AppealNoteType): Appeal | undefined {
  return load().find(
    (a) => a.studentId === studentId && a.moduleId === moduleId && a.noteType === noteType
  );
}

export function submitAppeal(data: Omit<Appeal, "id" | "createdAt" | "status" | "notifiedStudent">): Appeal {
  const appeals = load();
  const appeal: Appeal = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "en_attente",
    notifiedStudent: false,
  };
  save([...appeals, appeal]);
  return appeal;
}

export function teacherDecideAppeal(id: string, accepted: boolean, comment?: string, proposedNote?: number) {
  const appeals = load();
  const idx = appeals.findIndex((a) => a.id === id);
  if (idx === -1) return;
  appeals[idx].status = accepted ? "accepte" : "refuse";
  appeals[idx].updatedAt = new Date().toISOString();
  appeals[idx].notifiedStudent = false;
  if (comment) appeals[idx].teacherComment = comment;
  if (accepted && proposedNote !== undefined) appeals[idx].proposedNote = proposedNote;
  save(appeals);
}

export function agentValidateAppeal(id: string) {
  const appeals = load();
  const idx = appeals.findIndex((a) => a.id === id);
  if (idx === -1) return;
  appeals[idx].status = "valide_agent";
  appeals[idx].updatedAt = new Date().toISOString();
  save(appeals);
}

export function markAppealNotified(id: string) {
  const appeals = load();
  const idx = appeals.findIndex((a) => a.id === id);
  if (idx === -1) return;
  appeals[idx].notifiedStudent = true;
  save(appeals);
}
