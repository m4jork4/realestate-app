export type SessionUser = {
  token: string;     
  userId: number;    
  email: string;     
  name: string;
  role: string;
};

const KEY = "session";

function safeJsonParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}


function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function pickToken(raw: any): string | null {
  const token =
    raw?.token ||
    raw?.accessToken ||
    raw?.access_token ||
    raw?.jwt ||
    raw?.bearerToken ||
    raw?.bearer_token ||
    raw?.data?.token ||
    raw?.data?.accessToken ||
    raw?.data?.jwt;

  return typeof token === "string" && token.length > 10 ? token : null;
}

function pickEmail(raw: any): string | null {
  const email =
    raw?.email ||
    raw?.user?.email ||
    raw?.data?.email ||
    raw?.username ||
    raw?.userName;
  return typeof email === "string" && email.includes("@") ? email : null;
}

function pickName(raw: any): string {
  const name =
    raw?.name ||
    raw?.user?.name ||
    raw?.data?.name ||
    raw?.fullName ||
    raw?.user?.fullName;
  return typeof name === "string" && name.trim() ? name.trim() : "User";
}

function pickRole(raw: any): string {
  const role =
    raw?.role ||
    raw?.user?.role ||
    raw?.data?.role;
  return typeof role === "string" && role.trim() ? role.trim() : "USER";
}

function pickUserId(raw: any): number | null {
  const v =
    raw?.userId ||
    raw?.userID ||
    raw?.id ||
    raw?.user?.id ||
    raw?.user?.userId ||
    raw?.data?.userId ||
    raw?.data?.id;

  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function extractFromToken(token: string): { userId?: number; email?: string; name?: string; role?: string } {
  const p = decodeJwtPayload(token);
  if (!p) return {};

  
  let userId: number | undefined;
  const sub = p.sub;
  if (sub != null && Number.isFinite(Number(sub))) userId = Number(sub);

  if (userId == null && p.userId != null && Number.isFinite(Number(p.userId))) userId = Number(p.userId);
  if (userId == null && p.id != null && Number.isFinite(Number(p.id))) userId = Number(p.id);

  
  const email =
    (typeof p.email === "string" && p.email.includes("@") ? p.email : undefined) ||
    (typeof p.unique_name === "string" && p.unique_name.includes("@") ? p.unique_name : undefined) ||
    (typeof p.upn === "string" && p.upn.includes("@") ? p.upn : undefined);

  const name =
    (typeof p.name === "string" && p.name.trim() ? p.name.trim() : undefined) ||
    (typeof p.given_name === "string" && p.given_name.trim() ? p.given_name.trim() : undefined);

  const role =
    (typeof p.role === "string" && p.role.trim() ? p.role.trim() : undefined) ||
    (Array.isArray(p.roles) && typeof p.roles[0] === "string" ? p.roles[0] : undefined);

  return { userId, email, name, role };
}


export function setSession(raw: any) {
  const token = pickToken(raw);
  if (!token) throw new Error("Nem találok tokent a login válaszban (token/accessToken/jwt).");

  const fromToken = extractFromToken(token);

  const userId = pickUserId(raw) ?? fromToken.userId ?? 0;
  const email = pickEmail(raw) ?? fromToken.email ?? "";

  
  if (!userId) throw new Error("Nem találok userId-t (a tokenben sem).");
  if (!email) throw new Error("Nem találok email-t (a tokenben sem).");

  const s: SessionUser = {
    token,
    userId,
    email,
    name: pickName(raw) || fromToken.name || "User",
    role: pickRole(raw) || fromToken.role || "USER",
  };

  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("auth"));
}

export function getSession(): SessionUser | null {
  const s = safeJsonParse<SessionUser>(localStorage.getItem(KEY));
  if (s?.token && s.userId && s.email) return s;

  
  const tokenOnly = localStorage.getItem("token");
  if (tokenOnly && tokenOnly.length > 10) {
    const fromToken = extractFromToken(tokenOnly);
    if (fromToken.userId && fromToken.email) {
      const fixed: SessionUser = {
        token: tokenOnly,
        userId: fromToken.userId,
        email: fromToken.email,
        name: fromToken.name ?? "User",
        role: fromToken.role ?? "USER",
      };
      localStorage.setItem(KEY, JSON.stringify(fixed));
      return fixed;
    }
  }

  return null;
}

export function clearSession() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth"));
}