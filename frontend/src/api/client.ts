type ApiOptions = {
  method?: string;
  token?: string;
  body?: any; 
};

function getBaseUrl() {
  const env = (import.meta as any).env;
  
  return (env?.VITE_API_URL as string) || "https://localhost:5080";
}

function getSessionTokenSafely(): string | undefined {
  try {
    const raw = localStorage.getItem("session");
    if (!raw) return undefined;
    const s = JSON.parse(raw);
    return typeof s?.token === "string" ? s.token : undefined;
  } catch {
    return undefined;
  }
}

function buildAuthHeader(token?: string) {
  if (!token) return undefined;
  const t = token.trim();
  if (!t) return undefined;
  return t.toLowerCase().startsWith("bearer ") ? t : `Bearer ${t}`;
}

async function readErrorMessage(res: Response) {
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const j = await res.json();
      
      return (
        j?.detail ||
        j?.title ||
        j?.message ||
        j?.error ||
        (typeof j === "string" ? j : JSON.stringify(j))
      );
    }
    const t = await res.text();
    return t || `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

export async function api<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const method = options.method || (options.body ? "POST" : "GET");

  
  const token = options.token ?? getSessionTokenSafely();
  const auth = buildAuthHeader(token);

  const headers: Record<string, string> = {};
  if (auth) headers["Authorization"] = auth;

  let body: BodyInit | undefined = undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined && options.body !== null) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  
  const res = await fetch(url, { method, headers, body });

  if (!res.ok) {
    const msg = await readErrorMessage(res);

    if (res.status === 401) {
      
      console.error("[API 401]", {
        url,
        baseUrl,
        hasAuthHeader: Boolean(headers["Authorization"]),
        authHeaderPrefix: headers["Authorization"]?.slice(0, 12),
      });
      throw new Error(msg || "HTTP 401 – nincs bejelentkezve / rossz token / lejárt token.");
    }

    if (res.status === 403) throw new Error(msg || "HTTP 403 – nincs jogosultság.");
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;

  return (await res.text()) as unknown as T;
}