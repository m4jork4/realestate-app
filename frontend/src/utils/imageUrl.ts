export function imageUrl(url?: string | null) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const base = (import.meta as any).env?.VITE_API_URL || "https://localhost:5080";

  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
}