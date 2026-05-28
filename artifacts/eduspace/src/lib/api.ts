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
  students: () => get<unknown[]>("/enseignant/students"),
  annonces: () => get<unknown[]>("/enseignant/annonces"),
  soumissions: () => get<unknown[]>("/enseignant/soumissions"),
  soumissionStudents: (id: number) => get<unknown[]>(`/enseignant/soumissions/${id}/students`),
  soumettrNotes: (id: number, body: unknown) => post<void>(`/enseignant/soumissions/${id}/submit`, body),
  uploadSupport: (body: unknown) => post<void>("/enseignant/supports", body),
  recours: () => get<unknown[]>("/enseignant/recours"),
  decidRecours: (id: number, body: unknown) => post<void>(`/enseignant/recours/${id}/decision`, body),
};

// ── Agent ────────────────────────────────────────────────────────────
export const agent = {
  stats: () => get<Record<string, unknown>>("/agent/stats"),
  students: () => get<unknown[]>("/agent/students"),
  showStudent: (id: number) => get<unknown>(`/agent/students/${id}`),
  storeStudent: (body: unknown) => post<unknown>("/agent/students", body),
  updateStudent: (id: number, body: unknown) => patch<void>(`/agent/students/${id}`, body),
  updateStudentAccount: (id: number, body: unknown) => patch<void>(`/agent/students/${id}/account`, body),
  teachers: () => get<unknown[]>("/agent/teachers"),
  storeTeacher: (body: unknown) => post<unknown>("/agent/teachers", body),
  updateTeacher: (id: number, body: unknown) => patch<void>(`/agent/teachers/${id}`, body),
  gradeSubmissions: () => get<unknown[]>("/agent/grade-submissions"),
  validateGrade: (id: number) => post<void>(`/agent/grade-submissions/${id}/validate`),
  publishGrade: (id: number) => post<void>(`/agent/grade-submissions/${id}/publish`),
  rejectGrade: (id: number) => post<void>(`/agent/grade-submissions/${id}/reject`),
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
};

// ── Super Agent ───────────────────────────────────────────────────────
export const superAgent = {
  profile: () => get<Record<string, unknown>>("/super-agent/profile"),
  stats: () => get<Record<string, unknown>>("/super-agent/stats"),
  agents: () => get<unknown[]>("/super-agent/agents"),
  storeAgent: (body: unknown) => post<unknown>("/super-agent/agents", body),
  updateAgent: (id: number, body: unknown) => patch<void>(`/super-agent/agents/${id}`, body),
  deleteAgent: (id: number) => del<void>(`/super-agent/agents/${id}`),
  modules: (params?: string) => get<unknown[]>(`/super-agent/modules${params ? "?" + params : ""}`),
  storeModule: (body: unknown) => post<unknown>("/super-agent/modules", body),
  updateModule: (id: number, body: unknown) => patch<void>(`/super-agent/modules/${id}`, body),
  deleteModule: (id: number) => del<void>(`/super-agent/modules/${id}`),
};
