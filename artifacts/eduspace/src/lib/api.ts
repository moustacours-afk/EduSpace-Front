const BASE = "http://localhost:8000/api";

function token(): string | null {
  return localStorage.getItem("eduspace_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isPublic = false,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  if (!isPublic) {
    const t = token();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Erreur réseau" }));
    throw new Error(err.message ?? `Erreur ${res.status}`);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

const get  = <T>(path: string) => request<T>("GET", path);
const post = <T>(path: string, body?: unknown, pub = false) => request<T>("POST", path, body, pub);
const patch = <T>(path: string, body?: unknown) => request<T>("PATCH", path, body);
const del  = <T>(path: string) => request<T>("DELETE", path);

async function uploadFile<T>(path: string, body: FormData): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const t = token();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers, body });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Erreur réseau" }));
    throw new Error(err.message ?? `Erreur ${res.status}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ── Auth ─────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  email: string;
  role: "etudiant" | "enseignant" | "agent" | "super_agent";
  profile: Record<string, unknown>;
}

export function login(email: string, password: string) {
  return post<{ token: string; user: AuthUser }>("/auth/login", { email, password }, true);
}

export function loginWithMatricule(matricule: string, password: string) {
  return post<{ token: string; user: AuthUser }>("/auth/login", { matricule, password }, true);
}

// ── Etudiant ──────────────────────────────────────────────────────────
export const etudiant = {
  profile: () => get<Record<string, unknown>>("/etudiant/profile"),
  notes:   () => get<unknown[]>("/etudiant/notes"),
  emploiDuTemps: () => get<unknown[]>("/etudiant/emploi-du-temps"),
  supports: () => get<unknown[]>("/etudiant/supports"),
  annonces: () => get<unknown[]>("/etudiant/annonces"),
  notifications: () => get<unknown[]>("/etudiant/notifications"),
  markNotifRead: (id: number) => patch<void>(`/etudiant/notifications/${id}/read`),
  markAllNotifRead: () => patch<void>("/etudiant/notifications/read-all"),
  getRecours: () => get<unknown[]>("/etudiant/recours"),
  submitRecours: (body: unknown) => post<unknown>("/etudiant/recours", body),
  markRecourNotified: (id: number) => patch<void>(`/etudiant/recours/${id}/notified`),
  recourForModule: (moduleId: number, semestre: string, noteType: string) =>
    get<unknown>(`/etudiant/recours/for-module?module_id=${moduleId}&semestre=${semestre}&note_type=${noteType}`),
};

// ── Enseignant ────────────────────────────────────────────────────────
export const enseignant = {
  profile: () => get<Record<string, unknown>>("/enseignant/profile"),
  modules: () => get<unknown[]>("/enseignant/modules"),
  emploiDuTemps: () => get<unknown[]>("/enseignant/emploi-du-temps"),
  students: (niveau: string, groupe?: string) => get<unknown[]>(`/enseignant/students?niveau=${encodeURIComponent(niveau)}${groupe ? `&groupe=${encodeURIComponent(groupe)}` : ''}`),
  annonces: () => get<unknown[]>("/enseignant/annonces"),
  storeAnnonce: (body: unknown) => post<unknown>("/enseignant/annonces", body),
  deleteAnnonce: (id: number) => del<void>(`/enseignant/annonces/${id}`),
  supports: () => get<unknown[]>("/enseignant/supports"),
  uploadSupport: (body: FormData) => uploadFile<unknown>("/enseignant/supports", body),
  deleteSupport: (id: number) => del<void>(`/enseignant/supports/${id}`),
  soumissions: () => get<unknown[]>("/enseignant/soumissions"),
  soumissionStudents: (id: number) => get<unknown[]>(`/enseignant/soumissions/${id}/students`),
  soumettrNotes: (id: number, body: unknown) => post<void>(`/enseignant/soumissions/${id}/submit`, body),
  submitGrades: (body: unknown) => post<void>("/enseignant/grades", body),
  myPermissions: () => get<{ peut_saisir_cc: boolean; peut_saisir_examen: boolean; semestre: string | null; grantedBy: string | null; grantedAt: string | null }>("/enseignant/my-permissions"),
  recours: () => get<unknown[]>("/enseignant/recours"),
  decidRecours: (id: number, body: unknown) => post<void>(`/enseignant/recours/${id}/decision`, body),
  sendNotification: (body: unknown) => post<unknown>("/enseignant/notifications", body),
  sentNotifications: () => get<unknown[]>("/enseignant/notifications/sent"),
};

// ── Agent ────────────────────────────────────────────────────────────
export const agent = {
  stats: () => get<Record<string, unknown>>("/agent/stats"),
  students: () => get<unknown[]>("/agent/students"),
  showStudent: (id: number) => get<unknown>(`/agent/students/${id}`),
  storeStudent: (body: unknown) => post<unknown>("/agent/students", body),
  updateStudent: (id: number, body: unknown) => patch<void>(`/agent/students/${id}`, body),
  updateStudentAccount: (id: number, body: unknown) => patch<void>(`/agent/students/${id}/account`, body),
  repartir: (body: { filiere: string; niveau: string; nbSections: number; nbGroupes: number }) =>
    post<{ message: string; sections: Record<string, string[]>; total: number }>("/agent/organisation/repartir", body),
  teachers: () => get<unknown[]>("/agent/teachers"),
  storeTeacher: (body: unknown) => post<unknown>("/agent/teachers", body),
  updateTeacher: (id: number, body: unknown) => patch<void>(`/agent/teachers/${id}`, body),
  modules: (params?: string) => get<unknown[]>(`/agent/modules${params ? "?" + params : ""}`),
  gradeSubmissions: () => get<unknown[]>("/agent/grade-submissions"),
  gradeSubmission: (id: number) => get<unknown>(`/agent/grade-submissions/${id}`),
  validateGrade: (id: number) => post<void>(`/agent/grade-submissions/${id}/validate`),
  publishGrade: (id: number) => post<void>(`/agent/grade-submissions/${id}/publish`),
  rejectGrade: (id: number, reason?: string) => post<void>(`/agent/grade-submissions/${id}/reject`, { reason }),
  pendingRecours: () => get<unknown[]>("/agent/recours/pending"),
  validateRecours: (id: number) => post<void>(`/agent/recours/${id}/validate`),
  salles: () => get<unknown[]>("/agent/salles"),
  storeSalle: (body: unknown) => post<unknown>("/agent/salles", body),
  updateSalle: (id: number, body: unknown) => patch<void>(`/agent/salles/${id}`, body),
  deleteSalle: (id: number) => del<void>(`/agent/salles/${id}`),
  seances: () => get<unknown[]>("/agent/seances"),
  storeSeance: (body: unknown) => post<unknown>("/agent/seances", body),
  updateSeance: (id: number, body: unknown) => patch<void>(`/agent/seances/${id}`, body),
  deleteSeance: (id: number) => del<void>(`/agent/seances/${id}`),
  evenements: () => get<unknown[]>("/agent/evenements"),
  storeEvenement: (body: unknown) => post<unknown>("/agent/evenements", body),
  updateEvenement: (id: number, body: unknown) => patch<void>(`/agent/evenements/${id}`, body),
  deleteEvenement: (id: number) => del<void>(`/agent/evenements/${id}`),
  deliberations: () => get<unknown[]>("/agent/deliberations"),
  storeDeliberation: (body: unknown) => post<unknown>("/agent/deliberations", body),
  annonces: () => get<unknown[]>("/agent/annonces"),
  storeAnnonce: (body: unknown) => post<unknown>("/agent/annonces", body),
  updateAnnonce: (id: number, body: unknown) => patch<void>(`/agent/annonces/${id}`, body),
  deleteAnnonce: (id: number) => del<void>(`/agent/annonces/${id}`),
  reinscriptions: () => get<unknown[]>("/agent/reinscriptions"),
  updateReinscription: (id: number, body: unknown) => patch<void>(`/agent/reinscriptions/${id}`, body),
  permissions: () => get<unknown[]>("/agent/permissions"),
  updatePermission: (enseignantId: number, body: unknown) => post<void>(`/agent/permissions/${enseignantId}`, body),
  revokePermission: (enseignantId: number) => del<void>(`/agent/permissions/${enseignantId}`),
};

// ── Super Agent ───────────────────────────────────────────────────────
export interface UeOption { ue_order: number; ue_code: string; count: number; next_order: number; next_code: string }
export interface UeOptions {
  prefix: string;
  semester_digit: number;
  existing: UeOption[];
  new_ue: { ue_order: number; ue_code: string; first_code: string };
}

export const superAgent = {
  profile: () => get<Record<string, unknown>>("/super-agent/profile"),
  stats: () => get<Record<string, unknown>>("/super-agent/stats"),
  agents: () => get<unknown[]>("/super-agent/agents"),
  storeAgent: (body: { nom: string; prenom: string; username: string; password: string; universite?: string; faculte?: string; departement?: string }) => post<unknown>("/super-agent/agents", body),
  updateAgent: (id: number, body: unknown) => patch<void>(`/super-agent/agents/${id}`, body),
  toggleAgentStatus: (id: number, statut: string) => patch<{ statut: string }>(`/super-agent/agents/${id}/status`, { statut }),
  deleteAgent: (id: number) => del<void>(`/super-agent/agents/${id}`),
  // Doyens (faculty accounts) — Director only
  doyens: () => get<unknown[]>("/super-agent/doyens"),
  storeDoyen: (body: { nom: string; prenom: string; username: string; password: string; faculte: string }) => post<unknown>("/super-agent/doyens", body),
  updateDoyen: (id: number, body: unknown) => patch<void>(`/super-agent/doyens/${id}`, body),
  toggleDoyenStatus: (id: number, statut: string) => patch<{ statut: string }>(`/super-agent/doyens/${id}/status`, { statut }),
  deleteDoyen: (id: number) => del<void>(`/super-agent/doyens/${id}`),
  // Student promotion statistics
  studentStats: (params?: string) => get<{ normale: number; rattrapage: number; dettes: number; ajourne: number; total: number }>(`/super-agent/student-stats${params ? "?" + params : ""}`),
  modules: (params?: string) => get<unknown[]>(`/super-agent/modules${params ? "?" + params : ""}`),
  moduleUeOptions: (params: string) => get<UeOptions>(`/super-agent/modules/ue-options?${params}`),
  storeModule: (body: unknown) => post<unknown>("/super-agent/modules", body),
  updateModule: (id: number, body: unknown) => patch<void>(`/super-agent/modules/${id}`, body),
  moveModule: (id: number, body: { type_ue: string; ue_order?: number; is_new_ue?: boolean; position: number }) =>
    post<{ ok: boolean; code: string }>(`/super-agent/modules/${id}/move`, body),
  deleteModule: (id: number) => del<void>(`/super-agent/modules/${id}`),
};
