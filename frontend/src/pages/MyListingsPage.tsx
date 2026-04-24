import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteListing, getMyListings } from "../api/listings";
import type { ListingListItem } from "../api/types";
import { getSession } from "../auth/session";

export default function MyListingsPage() {
  const nav = useNavigate();
  const session = getSession();

  const [items, setItems] = useState<ListingListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sort, setSort] = useState("created_desc");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function load(p: number) {
    setErr("");
    setLoading(true);
    try {
      const res = await getMyListings({ page: p, pageSize, sort });
      setItems(res.items);
      setTotal(res.total);
      setPage(res.page);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    load(1);
    
  }, [pageSize, sort]);

  if (!session) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 700, margin: "40px auto", padding: 24 }}>
          <h2>Saját hirdetéseim</h2>
          <p className="muted">
            Ehhez be kell jelentkezned. <Link to="/login">Bejelentkezés</Link>
          </p>
        </div>
      </div>
    );
  }

  async function onDelete(id: number) {
    const ok = confirm("Biztos törlöd a hirdetést?");
    if (!ok) return;

    try {
      await deleteListing(id);
      
      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
      await load(nextPage);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="container" style={{ paddingTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Saját hirdetéseim</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="muted">
            Találatok: <b>{total}</b>
          </span>
          <button className="btn" onClick={() => nav("/create")}>+ Új hirdetés</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12, padding: 12, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <label className="muted">Rendezés</label>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="created_desc">Legújabb</option>
            <option value="price_asc">Ár növekvő</option>
            <option value="price_desc">Ár csökkenő</option>
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

        <button className="btn secondary" disabled={loading} onClick={() => load(page)}>
          Frissítés
        </button>
      </div>

      {err && <p style={{ color: "crimson", marginTop: 12 }}>{err}</p>}
      {loading && !err && <p className="muted" style={{ marginTop: 12 }}>Betöltés...</p>}
      {!loading && !err && items.length === 0 && <p className="muted" style={{ marginTop: 12 }}>Még nincs feladott hirdetésed.</p>}

      <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
        {items.map((x) => (
          <div key={x.id} className="card" style={{ padding: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px", minWidth: 260 }}>
              <div style={{ fontWeight: 1000 }}>{x.title}</div>
              <div className="muted" style={{ marginTop: 6 }}>
                {x.city}{x.district ? `, ${x.district}` : ""} • {x.areaM2} m² • {x.rooms} szoba
              </div>
              <div style={{ marginTop: 6, fontWeight: 900 }}>
                {x.price.toLocaleString("hu-HU")} {x.currency} <span className="muted">• {x.status}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn secondary" to={`/listings/${x.id}`}>Megnyitás</Link>
              <Link className="btn" to={`/my-listings/${x.id}/edit`}>Szerkesztés</Link>
              <button className="btn" onClick={() => onDelete(x.id)}>Törlés</button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn" disabled={loading || page <= 1} onClick={() => load(page - 1)}>◀ Előző</button>
          <span className="muted">Oldal <b>{page}</b> / <b>{totalPages}</b></span>
          <button className="btn" disabled={loading || page >= totalPages} onClick={() => load(page + 1)}>Következő ▶</button>
        </div>
      )}
    </div>
  );
}