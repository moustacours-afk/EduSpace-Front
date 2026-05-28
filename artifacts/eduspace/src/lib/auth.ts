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

export function isLoggedIn(role?: AuthUser["role"]): boolean {
  const user = getUser();
  if (!user || !getToken()) return false;
  return role ? user.role === role : true;
}
