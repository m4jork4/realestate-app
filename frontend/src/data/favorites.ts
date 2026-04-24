const KEY = "realestate:favorites";

function read(): Set<number> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set<number>(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function write(set: Set<number>) {
  localStorage.setItem(KEY, JSON.stringify([...set]));
  
  window.dispatchEvent(new Event("favorites-changed"));
}

export function getFavorites(): Set<number> {
  return read();
}

export function isFavorite(id: number): boolean {
  return read().has(id);
}

export function toggleFavorite(id: number) {
  const favs = read();
  favs.has(id) ? favs.delete(id) : favs.add(id);
  write(favs);
}

