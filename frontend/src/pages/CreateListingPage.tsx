import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createListing, uploadListingImages } from "../api/listings";
import { getSession } from "../auth/session";

type DealType = "SALE" | "RENT";
type PropertyType = "APARTMENT" | "HOUSE";

function clampFiles(list: File[], max = 8) {
  
  const seen = new Set<string>();
  const out: File[] = [];
  for (const f of list) {
    const key = `${f.name}_${f.size}_${f.lastModified}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
    if (out.length >= max) break;
  }
  return out;
}

export default function CreateListingPage() {
  const nav = useNavigate();
  const session = getSession();

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [price, setPrice] = useState("");
  const [areaM2, setAreaM2] = useState("");
  const [rooms, setRooms] = useState("");
  const [description, setDescription] = useState("");

  const [dealType, setDealType] = useState<DealType>("SALE");
  const [propertyType, setPropertyType] = useState<PropertyType>("APARTMENT");

  //  képek (sorrend = tömb sorrendje)
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  
  const dragIndexRef = useRef<number | null>(null);

  const previews = useMemo(
    () => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [files]
  );

  useEffect(() => {
    return () => {
      for (const p of previews) URL.revokeObjectURL(p.url);
    };
  }, [previews]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!session) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 600, margin: "40px auto", padding: 24 }}>
          <h2>Hirdetés feladása</h2>
          <p className="muted">
            Ehhez be kell jelentkezned. <Link to="/login">Bejelentkezés</Link>
          </p>
        </div>
      </div>
    );
  }

  function addFiles(newOnes: File[]) {
    const merged = clampFiles([...files, ...newOnes], 8);
    setFiles(merged);
  }

  function removeAt(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function move(from: number, to: number) {
    if (from === to) return;
    setFiles((prev) => {
      const next = [...prev];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      //  listing létrehozás
      const res = await createListing({
        title: title.trim(),
        city: city.trim(),
        district: district.trim() ? district.trim() : null,

        price: Number(price),
        currency: "HUF",

        areaM2: Number(areaM2),
        rooms: Number(rooms),

        description: description.trim() || "—",

        status: "ACTIVE",
        dealType,
        propertyType,
      });

      // képek feltöltése  a jelenlegi sorrendben
      if (files.length > 0) {
        setUploading(true);
        await uploadListingImages(res.id, files);
      }

      nav(`/listings/${res.id}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Hirdetés feladása</h2>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            className="input"
            placeholder="Hirdetés címe"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <input
              className="input"
              placeholder="Város"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Kerület (opcionális)"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <select className="input" value={dealType} onChange={(e) => setDealType(e.target.value as DealType)}>
              <option value="SALE">Eladó</option>
              <option value="RENT">Kiadó</option>
            </select>

            <select
              className="input"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
            >
              <option value="APARTMENT">Lakás</option>
              <option value="HOUSE">Ház</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <input
              className="input"
              type="number"
              placeholder="Ár (HUF)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <input
              className="input"
              type="number"
              placeholder="Alapterület (m²)"
              value={areaM2}
              onChange={(e) => setAreaM2(e.target.value)}
              required
            />
            <input
              className="input"
              type="number"
              step="0.5"
              placeholder="Szobák száma (pl. 2.5)"
              value={rooms}
              onChange={(e) => setRooms(e.target.value)}
              required
            />
          </div>

          <textarea
            className="textarea"
            placeholder="Leírás"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />

          {/* KÉPFELTÖLTÉS + DRAG&DROP + REORDER */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 900 }}>Képek</div>
                <div className="muted" style={{ marginTop: 4 }}>
                  Húzd rá a képeket, vagy válaszd ki. Utána fogd-és-vidd a sorrendhez. (max 8)
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  className="btn secondary"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || uploading}
                >
                  Kiválasztás
                </button>
                {files.length > 0 && (
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => setFiles([])}
                    disabled={loading || uploading}
                  >
                    Mind törlése
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              className="input"
              style={{ display: "none" }}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const list = Array.from(e.target.files ?? []);
                addFiles(list);
                
                e.currentTarget.value = "";
              }}
              disabled={loading || uploading}
            />

            {/* Dropzone */}
            <div
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(false);
                const dropped = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
                addFiles(dropped);
              }}
              style={{
                marginTop: 12,
                padding: 16,
                borderRadius: 14,
                border: dragOver ? "2px dashed rgba(59,130,246,0.9)" : "2px dashed rgba(15,23,42,0.18)",
                background: dragOver ? "rgba(59,130,246,0.08)" : "rgba(15,23,42,0.03)",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontWeight: 900 }}>Dobd ide a képeket</div>
                <div className="muted" style={{ marginTop: 4 }}>
                  PNG / JPG / WEBP
                </div>
              </div>
              <div className="muted" style={{ fontWeight: 800 }}>
                {files.length}/8
              </div>
            </div>

            {/* Previews + reorder */}
            {previews.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="muted" style={{ marginBottom: 8 }}>
                  Sorrend: húzd a képet a megfelelő helyre.
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 10,
                  }}
                >
                  {previews.map((p, idx) => (
                    <div
                      key={p.url}
                      draggable
                      onDragStart={() => {
                        dragIndexRef.current = idx;
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const from = dragIndexRef.current;
                        dragIndexRef.current = null;
                        if (from == null) return;
                        move(from, idx);
                      }}
                      onDragEnd={() => {
                        dragIndexRef.current = null;
                      }}
                      style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.12)",
                        background: "white",
                        cursor: "grab",
                      }}
                      title="Húzd a sorrendhez"
                    >
                      <div style={{ position: "relative" }}>
                        <img
                          src={p.url}
                          alt="Preview"
                          style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                        />

                        {/* index */}
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            padding: "4px 8px",
                            borderRadius: 999,
                            background: "rgba(0,0,0,0.65)",
                            color: "white",
                            fontWeight: 900,
                            fontSize: 12,
                          }}
                        >
                          #{idx + 1}
                        </div>

                        {/* remove */}
                        <button
                          type="button"
                          className="btn"
                          onClick={() => removeAt(idx)}
                          disabled={loading || uploading}
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            borderRadius: 999,
                            padding: "6px 10px",
                            background: "rgba(255,255,255,0.9)",
                          }}
                          title="Törlés"
                        >
                          ✕
                        </button>
                      </div>

                      <div style={{ padding: 8 }}>
                        <div
                          className="muted"
                          style={{
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={p.file.name}
                        >
                          {p.file.name}
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {(p.file.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button className="btn" type="submit" disabled={loading || uploading}>
            {uploading ? "Képek feltöltése..." : loading ? "Mentés..." : "Hirdetés mentése"}
          </button>
        </form>
      </div>
    </div>
  );
}