import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicListings } from "../api/listings";
import type { ListingListItem } from "../api/types";
import { getFavorites, toggleFavorite } from "../data/favorites";

export default function FavoritesPage() {
  const [all, setAll] = useState<ListingListItem[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [favIdsKey, setFavIdsKey] = useState(() => Array.from(getFavorites()).sort().join(","));

  
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "favorites") {
        setFavIdsKey(Array.from(getFavorites()).sort().join(","));
      }
    };

    const onFocus = () => {
      setFavIdsKey(Array.from(getFavorites()).sort().join(","));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    getPublicListings({ page: 1, pageSize: 200 })
      .then((res) => setAll(res.items))
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  const favIds = useMemo(() => getFavorites(), [favIdsKey]);

  const items = useMemo(() => {
    return all.filter((x) => favIds.has(x.id));
  }, [all, favIds]);

  const remove = (id: number) => {
    toggleFavorite(id);
    setFavIdsKey(Array.from(getFavorites()).sort().join(","));
  };

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      <div className="favTop">
        <div>
          <h1 className="favTitle">Kedvencek</h1>
          <div className="favSub">
            {items.length > 0 ? (
              <>
                Mentett hirdetések: <span className="favPill">{items.length}</span>
              </>
            ) : (
              "Itt gyűjtöd a “na ez jó” hirdetéseket."
            )}
          </div>
        </div>

        <div className="favTopActions">
          <Link to="/listings" className="btn btn--ghostLight">
            + Böngészés
          </Link>
        </div>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {loading && !err && <p>Betöltés...</p>}

      {!loading && !err && items.length === 0 && (
        <div className="favEmpty">
          <div className="favEmptyCard">
            <div className="favEmptyIcon">💾</div>
            <div className="favEmptyTitle">Még nincs kedvenc ingatlan</div>
            <div className="muted">
              Nyomd meg a 💖-t egy hirdetésen, és ide kerül. Ennyi az egész.
            </div>

            <div style={{ marginTop: 14 }}>
              <Link to="/listings" className="btn">
                Hirdetések böngészése
              </Link>
            </div>
          </div>
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <div className="favGrid">
          {items.map((x) => (
            <div key={x.id} className="favCard">
              <Link to={`/listings/${x.id}`} className="favCard__link">
                <div className="favCard__body">
                  <div className="favCard__title">{x.title}</div>

                  <div className="favCard__meta">
                    <span>
                      {x.city}
                      {x.district ? `, ${x.district}` : ""}
                    </span>
                    <span className="favDot">•</span>
                    <span>{x.areaM2} m²</span>
                    <span className="favDot">•</span>
                    <span>{x.rooms} szoba</span>
                  </div>
                </div>
              </Link>

              <div className="favCard__actions">
                <Link to={`/listings/${x.id}`} className="btn btn--ghostLight">
                  Megnyitás
                </Link>

                <button
                  className="btn btn--dangerLight"
                  type="button"
                  onClick={() => remove(x.id)}
                  title="Eltávolítás a kedvencekből"
                >
                  Törlés
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}