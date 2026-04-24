import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getListingById, updateListing } from "../api/listings";
import { getSession } from "../auth/session";

export default function EditListingPage() {
  const { id } = useParams();
  const listingId = Number(id);
  const nav = useNavigate();
  const session = getSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [price, setPrice] = useState("");
  const [areaM2, setAreaM2] = useState("");
  const [rooms, setRooms] = useState("");
  const [description, setDescription] = useState("");
  const [dealType, setDealType] = useState<"SALE" | "RENT">("SALE");
  const [propertyType, setPropertyType] = useState<"APARTMENT" | "HOUSE">("APARTMENT");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  useEffect(() => {
    if (!session) return;

    (async () => {
      setErr("");
      setLoading(true);
      try {
        const d = await getListingById(listingId);

        setTitle(d.title ?? "");
        setCity(d.city ?? "");
        setDistrict(d.district ?? "");
        setPrice(String(d.price ?? ""));
        setAreaM2(String(d.areaM2 ?? ""));
        setRooms(String(d.rooms ?? ""));
        setDescription(d.description ?? "");
        setDealType((d.dealType as any) ?? "SALE");
        setPropertyType((d.propertyType as any) ?? "APARTMENT");
        setStatus((d.status as any) ?? "ACTIVE");
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [listingId, session]);

  if (!session) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 700, margin: "40px auto", padding: 24 }}>
          <h2>Szerkesztés</h2>
          <p className="muted">
            Ehhez be kell jelentkezned. <Link to="/login">Bejelentkezés</Link>
          </p>
        </div>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
      await updateListing(listingId, {
        title: title.trim(),
        city: city.trim(),
        district: district.trim() ? district.trim() : null,

        price: Number(price),
        currency: "HUF",

        areaM2: Number(areaM2),
        rooms: Number(rooms),

        description: description.trim() || "—",

        status,
        dealType,
        propertyType,
      });

      nav("/my-listings");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
          <h2 style={{ marginTop: 0 }}>Hirdetés szerkesztése</h2>
          <Link className="btn secondary" to="/my-listings">← Vissza</Link>
        </div>

        {loading && <p className="muted">Betöltés...</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}

        {!loading && !err && (
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cím" required />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Város" required />
              <input className="input" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Kerület (opcionális)" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <select className="input" value={dealType} onChange={(e) => setDealType(e.target.value as any)}>
                <option value="SALE">Eladó</option>
                <option value="RENT">Kiadó</option>
              </select>

              <select className="input" value={propertyType} onChange={(e) => setPropertyType(e.target.value as any)}>
                <option value="APARTMENT">Lakás</option>
                <option value="HOUSE">Ház</option>
              </select>

              <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="ACTIVE">Aktív</option>
                <option value="INACTIVE">Inaktív</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <input className="input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ár (HUF)" required />
              <input className="input" type="number" value={areaM2} onChange={(e) => setAreaM2(e.target.value)} placeholder="Alapterület (m²)" required />
              <input className="input" type="number" step="0.5" value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="Szobák" required />
            </div>

            <textarea className="textarea" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Leírás" />

            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Mentés..." : "Mentés"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}