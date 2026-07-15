import { clearStoredAuth, getStoredAuth, refreshAccessToken } from "@/lib/auth";

function joinPath(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return path.startsWith("/") ? `/api${path}` : `/api/${path}`;
}

async function parseError(response: Response) {
  try {
    const data = await response.json();
    if (typeof data === "string") {
      return data;
    }
    if (data.detail) {
      return data.detail;
    }
    const firstKey = Object.keys(data)[0];
    return firstKey ? `${firstKey}: ${Array.isArray(data[firstKey]) ? data[firstKey].join(", ") : data[firstKey]}` : response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers || {});
  const isFormData = init.body instanceof FormData;

  if (!isFormData && init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const auth = getStoredAuth();
  if (
    auth?.access &&
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/register") &&
    !path.startsWith("/auth/refresh")
  ) {
    headers.set("Authorization", `Bearer ${auth.access}`);
  }

  const response = await fetch(joinPath(path), {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, init, false);
    }
    clearStoredAuth();
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
