export type ListingSeed = {
  id: number;
  title: string;
  city: string;
  district?: string | null;
  price: number;
  currency: "HUF" | "EUR";
  areaM2: number;
  rooms: number;
  description?: string | null;
};

const STORAGE_KEY = "realestate:demo:listings";

const SEED: ListingSeed[] = [
  {
    id: 1,
    title: "Panorámás lakás a belvárosban",
    city: "Budapest",
    district: "V. kerület",
    price: 89900000,
    currency: "HUF",
    areaM2: 54,
    rooms: 2,
    description:
      "Modern, világos lakás, kiváló közlekedéssel. Közel a Duna-parthoz, éttermekhez és irodákhoz.",
  },
  {
    id: 2,
    title: "Családi ház kerttel",
    city: "Érd",
    district: null,
    price: 129900000,
    currency: "HUF",
    areaM2: 120,
    rooms: 4,
    description: "Tágas, kertkapcsolatos ház, garázzsal. Nyugodt környék.",
  },
];

function readFromStorage(): ListingSeed[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ListingSeed[];
  } catch {
    return [];
  }
}

function writeToStorage(items: ListingSeed[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("listings-changed"));
}

export function getAllListings(): ListingSeed[] {
  const extra = readFromStorage();
  return [...SEED, ...extra];
}

export function getListingById(id: number): ListingSeed | undefined {
  return getAllListings().find((x) => x.id === id);
}

export function addListing(input: Omit<ListingSeed, "id">): ListingSeed {
  const extra = readFromStorage();
  const maxId = Math.max(...SEED.map((x) => x.id), ...extra.map((x) => x.id), 0);
  const next: ListingSeed = { id: maxId + 1, ...input };
  const nextExtra = [next, ...extra];
  writeToStorage(nextExtra);
  return next;
}
