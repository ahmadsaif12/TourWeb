const serverApiBase = (process.env.INTERNAL_API_URL || "http://backend:8000/api").replace(/\/$/, "");

function joinPath(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${serverApiBase}${path.startsWith("/") ? path : `/${path}`}`;
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

export async function serverFetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(joinPath(path), {
    ...init,
    cache: "no-store",
    headers: {
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
