import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPublicListings } from "../api/listings";
import type { ListingListItem } from "../api/types";
import ListingCard from "../components/ListingCard";


function getString(sp: URLSearchParams, key: string) {
  const v = sp.get(key);
  return v && v.trim() ? v : "";
}
function getNumberString(sp: URLSearchParams, key: string) {
  const v = sp.get(key);
  return v && v.trim() ? v : "";
}
function getInt(sp: URLSearchParams, key: string, fallback: number) {
  const v = sp.get(key);
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}


function buildPageButtons(page: number, totalPages: number) {
  const clamp = (n: number) => Math.max(1, Math.min(totalPages, n));
  const p = clamp(page);

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  for (let i = p - 2; i <= p + 2; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }

  const arr = Array.from(pages).sort((a, b) => a - b);

  const out: Array<number | "..."> = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i]);
    if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push("...");
  }
  return out;
}

function Pagination({
  page,
  totalPages,
  loading,
  onGo,
}: {
  page: number;
  totalPages: number;
  loading: boolean;
  onGo: (p: number) => void;
}) {
  const buttons = buildPageButtons(page, totalPages);
  const canPrev = page > 1 && !loading;
  const canNext = page < totalPages && !loading;

  const [jump, setJump] = useState("");

  function doJump() {
    const n = parseInt(jump, 10);
    if (!Number.isFinite(n)) return;
    const clamped = Math.max(1, Math.min(totalPages, n));
    setJump("");
    onGo(clamped);
  }

  return (
    <div
      className="card"
      style={{
        marginTop: 14,
        padding: 12,
        display: "flex",
        gap: 8,
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <button className="btn" disabled={!canPrev} onClick={() => onGo(1)}>
        ⏮ Első
      </button>
      <button className="btn" disabled={!canPrev} onClick={() => onGo(page - 1)}>
        ◀
      </button>

      {buttons.map((b, idx) =>
        b === "..." ? (
          <span key={`dots-${idx}`} className="muted" style={{ padding: "0 6px" }}>
            …
          </span>
        ) : (
          <button
            key={b}
            className={b === page ? "btn" : "btn secondary"}
            disabled={loading || b === page}
            onClick={() => onGo(b)}
            style={{ minWidth: 44 }}
            aria-current={b === page ? "page" : undefined}
            title={`Oldal ${b}`}
          >
            {b}
          </button>
        )
      )}

      <button className="btn" disabled={!canNext} onClick={() => onGo(page + 1)}>
        ▶
      </button>
      <button className="btn" disabled={!canNext} onClick={() => onGo(totalPages)}>
        Utolsó ⏭
      </button>

      <span className="muted" style={{ marginLeft: 8 }}>
        Oldal <b>{page}</b> / <b>{totalPages}</b>
      </span>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 8 }}>
        <span className="muted">Ugrás:</span>
        <input
          className="input"
          style={{ width: 92 }}
          inputMode="numeric"
          placeholder="pl. 3"
          value={jump}
          onChange={(e) => setJump(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!loading) doJump();
            }
          }}
          disabled={loading || totalPages <= 1}
        />
        <button className="btn secondary" onClick={doJump} disabled={loading || totalPages <= 1 || !jump.trim()}>
          Go
        </button>
      </div>
    </div>
  );
}

/*Lap*/
export default function ListingsPage() {
  const [sp, setSp] = useSearchParams();

  const initial = useMemo(() => {
    return {
      city: getString(sp, "city"),
      district: getString(sp, "district"),
      minPrice: getNumberString(sp, "minPrice"),
      maxPrice: getNumberString(sp, "maxPrice"),
      minArea: getNumberString(sp, "minArea"),
      maxArea: getNumberString(sp, "maxArea"),
      rooms: getNumberString(sp, "rooms"),
      dealType: getString(sp, "dealType"),
      propertyType: getString(sp, "propertyType"),
      sort: getString(sp, "sort") || "created_desc",
      page: getInt(sp, "page", 1),
      pageSize: getInt(sp, "pageSize", 12),
    };
    
  }, []);

  // filters 
  const [city, setCity] = useState(initial.city);
  const [district, setDistrict] = useState(initial.district);
  const [minPrice, setMinPrice] = useState(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);
  const [minArea, setMinArea] = useState(initial.minArea);
  const [maxArea, setMaxArea] = useState(initial.maxArea);
  const [rooms, setRooms] = useState(initial.rooms);
  const [dealType, setDealType] = useState(initial.dealType);
  const [propertyType, setPropertyType] = useState(initial.propertyType);
  const [sort, setSort] = useState(initial.sort);
  const [pageSize, setPageSize] = useState(initial.pageSize);

  // list 
  const [items, setItems] = useState<ListingListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initial.page);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function buildQueryParams(nextPage: number) {
    const qs = new URLSearchParams();

    if (city.trim()) qs.set("city", city.trim());
    if (district.trim()) qs.set("district", district.trim());

    if (minPrice.trim()) qs.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) qs.set("maxPrice", maxPrice.trim());
    if (minArea.trim()) qs.set("minArea", minArea.trim());
    if (maxArea.trim()) qs.set("maxArea", maxArea.trim());
    if (rooms.trim()) qs.set("rooms", rooms.trim());

    if (dealType.trim()) qs.set("dealType", dealType.trim());
    if (propertyType.trim()) qs.set("propertyType", propertyType.trim());

    if (sort) qs.set("sort", sort);

    qs.set("page", String(nextPage));
    qs.set("pageSize", String(pageSize));

    return qs;
  }

  function activeChips() {
    const chips: Array<{ key: string; label: string; clear: () => void }> = [];
    if (city.trim()) chips.push({ key: "city", label: `Város: ${city.trim()}`, clear: () => setCity("") });
    if (district.trim())
      chips.push({ key: "district", label: `Kerület: ${district.trim()}`, clear: () => setDistrict("") });
    if (minPrice.trim()) chips.push({ key: "minPrice", label: `Ár ≥ ${minPrice.trim()}`, clear: () => setMinPrice("") });
    if (maxPrice.trim()) chips.push({ key: "maxPrice", label: `Ár ≤ ${maxPrice.trim()}`, clear: () => setMaxPrice("") });
    if (minArea.trim()) chips.push({ key: "minArea", label: `m² ≥ ${minArea.trim()}`, clear: () => setMinArea("") });
    if (maxArea.trim()) chips.push({ key: "maxArea", label: `m² ≤ ${maxArea.trim()}`, clear: () => setMaxArea("") });
    if (rooms.trim()) chips.push({ key: "rooms", label: `Szobák ≥ ${rooms.trim()}`, clear: () => setRooms("") });
    if (dealType.trim()) chips.push({ key: "dealType", label: `Ügylet: ${dealType.trim()}`, clear: () => setDealType("") });
    if (propertyType.trim())
      chips.push({ key: "propertyType", label: `Típus: ${propertyType.trim()}`, clear: () => setPropertyType("") });
    return chips;
  }

  async function load(nextPage: number) {
    setErr("");
    setLoading(true);
    try {
      const res = await getPublicListings({
        city: city.trim() || undefined,
        district: district.trim() || undefined,
        minPrice: minPrice.trim() ? Number(minPrice) : null,
        maxPrice: maxPrice.trim() ? Number(maxPrice) : null,
        minArea: minArea.trim() ? Number(minArea) : null,
        maxArea: maxArea.trim() ? Number(maxArea) : null,
        rooms: rooms.trim() ? Number(rooms) : null,
        dealType: dealType.trim() || undefined,
        propertyType: propertyType.trim() || undefined,
        sort,
        page: nextPage,
        pageSize,
      });

      setItems(res.items);
      setTotal(res.total);
      setPage(res.page);

      setSp(buildQueryParams(res.page), { replace: true });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(initial.page);
    
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    load(1);
  }

  function onReset() {
    setCity("");
    setDistrict("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setMaxArea("");
    setRooms("");
    setDealType("");
    setPropertyType("");
    setSort("created_desc");
    setPageSize(12);
    setTimeout(() => load(1), 0);
  }

  const chips = activeChips();

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Hirdetések</h1>
        <span className="muted">
          Találatok: <b>{total}</b>
        </span>
      </div>

      <div style={{ position: "sticky", top: 72, zIndex: 20, marginTop: 12 }}>
        <div className="card" style={{ padding: 14 }}>
          <form onSubmit={onSubmit}>
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                alignItems: "end",
              }}
            >
              <div>
                <label className="muted">Város</label>
                <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="pl. Budapest" />
              </div>

              <div>
                <label className="muted">Kerület</label>
                <input className="input" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="pl. XI." />
              </div>

              <div>
                <label className="muted">Ár min</label>
                <input className="input" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} inputMode="numeric" />
              </div>

              <div>
                <label className="muted">Ár max</label>
                <input className="input" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} inputMode="numeric" />
              </div>

              <div>
                <label className="muted">m² min</label>
                <input className="input" value={minArea} onChange={(e) => setMinArea(e.target.value)} inputMode="numeric" />
              </div>

              <div>
                <label className="muted">m² max</label>
                <input className="input" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} inputMode="numeric" />
              </div>

              <div>
                <label className="muted">Szobák (min)</label>
                <input className="input" value={rooms} onChange={(e) => setRooms(e.target.value)} inputMode="decimal" />
              </div>

              <div>
                <label className="muted">Ügylet</label>
                <select className="input" value={dealType} onChange={(e) => setDealType(e.target.value)}>
                  <option value="">Bármely</option>
                  <option value="SALE">Eladó</option>
                  <option value="RENT">Kiadó</option>
                </select>
              </div>

              <div>
                <label className="muted">Típus</label>
                <select className="input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                  <option value="">Bármely</option>
                  <option value="APARTMENT">Lakás</option>
                  <option value="HOUSE">Ház</option>
                  <option value="PLOT">Telek</option>
                  <option value="OFFICE">Iroda</option>
                </select>
              </div>

              <div>
                <label className="muted">Rendezés</label>
                <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="created_desc">Legújabb</option>
                  <option value="price_asc">Ár növekvő</option>
                  <option value="price_desc">Ár csökkenő</option>
                  <option value="area_desc">Legnagyobb terület</option>
                </select>
              </div>

              <div>
                <label className="muted">Oldalméret</label>
                <select className="input" value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value, 10))}>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn" type="submit" disabled={loading}>
                  Keresés
                </button>
                <button className="btn secondary" type="button" onClick={onReset} disabled={loading}>
                  Törlés
                </button>
              </div>
            </div>
          </form>

          {chips.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className="muted">Aktív szűrők:</span>
              {chips.map((c) => (
                <button
                  key={c.key}
                  className="badge"
                  type="button"
                  onClick={() => {
                    c.clear();
                    setTimeout(() => load(1), 0);
                  }}
                  title="Katt: törlés"
                  style={{ cursor: "pointer" }}
                >
                  {c.label} ✕
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {err && <p style={{ color: "crimson", marginTop: 12 }}>{err}</p>}
      {loading && !err && <p className="muted" style={{ marginTop: 12 }}>Betöltés...</p>}
      {!loading && !err && items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>Nincs találat a megadott szűrőkre.</p>}

      <div className="listGrid">
        {items.map((x) => (
          <ListingCard key={x.id} item={x} />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} loading={loading} onGo={(p) => load(p)} />
    </div>
  );
}