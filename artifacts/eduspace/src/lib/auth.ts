import type { AuthUser } from "./api";

const TOKEN_KEY = "eduspace_token";
const USER_KEY  = "eduspace_user";

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * The agent's filière, normalised to match the students' `filiere` field.
 * The agent profile stores e.g. "Département d'Informatique" while students
 * store "Informatique" — strip the "Département d'/de/des/du " prefix.
 */
export function getAgentFiliere(): string {
  const profile = getUser()?.profile as Record<string, string> | undefined;
  const dept = profile?.departement ?? "Informatique";
  const stripped = dept.replace(/^d[ée]partement\s+(d['’]\s*|de\s+|des\s+|du\s+)/i, "").trim();
  return stripped || dept;
}

export function isLoggedIn(role?: AuthUser["role"]): boolean {
  const user = getUser();
  if (!user || !getToken()) return false;
  return role ? user.role === role : true;
}
