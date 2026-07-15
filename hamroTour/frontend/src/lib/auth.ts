import type { AuthPayload, User } from "@/lib/types";

const STORAGE_KEY = "hamrotour-auth";
const AUTH_EVENT = "hamrotour-auth-changed";

export type StoredAuth = {
  access: string;
  refresh: string;
  user?: User;
};

function emitAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: StoredAuth) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  emitAuthChange();
}

export function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
  emitAuthChange();
}

export async function refreshAccessToken(): Promise<string | null> {
  const auth = getStoredAuth();
  if (!auth?.refresh) {
    return null;
  }

  const response = await fetch("/api/auth/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: auth.refresh }),
  });

  if (!response.ok) {
    clearStoredAuth();
    return null;
  }

  const data = (await response.json()) as { access: string; refresh?: string };
  setStoredAuth({
    ...auth,
    access: data.access,
    refresh: data.refresh || auth.refresh,
  });
  return data.access;
}

export async function login(identifier: string, password: string) {
  const response = await fetch("/api/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  const data = (await response.json()) as Partial<AuthPayload> & { detail?: string };
  if (!response.ok) {
    throw new Error(data.detail || "Login failed.");
  }

  const auth = data as AuthPayload;
  setStoredAuth(auth);
  return auth;
}

export async function register(formData: FormData) {
  const response = await fetch("/api/auth/register/", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as Partial<AuthPayload> & { detail?: string };
  if (!response.ok) {
    throw new Error(data.detail || "Signup failed.");
  }

  const auth = data as AuthPayload;
  setStoredAuth(auth);
  return auth;
}

export async function logout() {
  const auth = getStoredAuth();
  if (auth?.access && auth.refresh) {
    await fetch("/api/auth/logout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.access}`,
      },
      body: JSON.stringify({ refresh: auth.refresh }),
    }).catch(() => undefined);
  }
  clearStoredAuth();
}
