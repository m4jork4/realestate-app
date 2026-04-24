import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getListingById } from "../api/listings";
import type { ListingDetail } from "../api/types";
import { isFavorite, toggleFavorite } from "../data/favorites";
import { imageUrl } from "../utils/imageUrl";
import { getSession } from "../auth/session";
import { createInquiry } from "../api/inquiries";

export default function ListingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ListingDetail | null>(null);
  const [err, setErr] = useState("");

  // cover (oldal tetején) aktív kép
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  // ✅ Lightbox 
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // ✅ Inquiry üzenetküldés
  const session = getSession();
  const [inqName, setInqName] = useState(session?.name ?? "");
  const [inqEmail, setInqEmail] = useState((session as any)?.email ?? ""); 
  const [inqPhone, setInqPhone] = useState("");
  const [inqMsg, setInqMsg] = useState("");
  const [inqOk, setInqOk] = useState("");
  const [inqErr, setInqErr] = useState("");
  const [inqSending, setInqSending] = useState(false);

  useEffect(() => {
    if (!id) return;

    getListingById(Number(id))
      .then((x) => {
        setItem(x);
        const first = x.images?.[0]?.url ?? null;
        setActiveUrl(first);
        setLightboxIndex(0);
      })
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
  }, [id]);

  const images = useMemo(() => item?.images ?? [], [item]);

  // Cover mindig az aktív kép 
  const cover = activeUrl ?? images?.[0]?.url ?? null;

  // Lightbox 
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "";
  };

  const goPrev = () => {
    if (!images.length) return;
    setLightboxIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goNext = () => {
    if (!images.length) return;
    setLightboxIndex((i) => (i + 1) % images.length);
  };

  // Billentyűk: ESC, bal, jobb
  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    
  }, [isLightboxOpen, images.length]);

  
  useEffect(() => {
    if (!images.length) return;
    const u = images[lightboxIndex]?.url;
    if (u) setActiveUrl(u);
    
  }, [lightboxIndex]);

  useEffect(() => {
    
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (err)
    return (
      <div className="container">
        <p style={{ color: "crimson" }}>{err}</p>
      </div>
    );

  if (!item)
    return (
      <div className="container">
        <p>Betöltés...</p>
      </div>
    );

  const fav = isFavorite(item.id);

  return (
    <div className="container">
      <Link to="/listings" className="muted">
        ← Vissza
      </Link>

      <div className="card" style={{ marginTop: 16, padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0 }}>{item.title}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontWeight: 900, whiteSpace: "nowrap" }}>
              {item.price.toLocaleString("hu-HU")} {item.currency}
            </div>

            <button
              className="btn"
              onClick={() => {
                toggleFavorite(item.id);
                setItem((prev) => (prev ? { ...prev } : prev));
              }}
              title="Kedvencek"
              type="button"
            >
              {fav ? "💖" : "🤍"}
            </button>
          </div>
        </div>

        {}
        {cover && (
          <div
            className="detailsCover"
            style={{ cursor: images.length ? "zoom-in" : "default" }}
            onClick={() => {
              if (!images.length) return;
              
              const idx = Math.max(0, images.findIndex((x) => x.url === cover));
              openLightbox(idx === -1 ? 0 : idx);
            }}
            title={images.length ? "Kattints a nagyításhoz" : undefined}
          >
            <img
              src={imageUrl(cover)}
              alt={item.title}
              className="detailsCover__img"
              loading="lazy"
            />
          </div>
        )}

        <p className="muted" style={{ marginTop: 14 }}>
          {item.city}
          {item.district ? `, ${item.district}` : ""} • {item.areaM2} m² •{" "}
          {item.rooms} szoba
        </p>

        <p style={{ whiteSpace: "pre-wrap" }}>{item.description}</p>

        {/* ÉRDEKLŐDÉS / ÜZENETKÜLDÉS */}
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Érdeklődés küldése</h3>

          {inqOk && <p style={{ color: "green", marginTop: 0 }}>{inqOk}</p>}
          {inqErr && <p style={{ color: "crimson", marginTop: 0 }}>{inqErr}</p>}

          <div style={{ display: "grid", gap: 10 }}>
            <div
              style={{
                display: "grid",
                gap: 10,
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <input
                className="homeInput"
                placeholder="Név"
                value={inqName}
                onChange={(e) => setInqName(e.target.value)}
              />
              <input
                className="homeInput"
                placeholder="Email"
                value={inqEmail}
                onChange={(e) => setInqEmail(e.target.value)}
              />
            </div>

            <input
              className="homeInput"
              placeholder="Telefon (opcionális)"
              value={inqPhone}
              onChange={(e) => setInqPhone(e.target.value)}
            />

            <textarea
              className="homeInput"
              placeholder="Üzenet"
              value={inqMsg}
              onChange={(e) => setInqMsg(e.target.value)}
              rows={4}
              style={{ resize: "vertical" }}
            />

            <button
              className="btn"
              type="button"
              disabled={inqSending}
              onClick={async () => {
                setInqOk("");
                setInqErr("");

                const name = inqName.trim();
                const email = inqEmail.trim();
                const message = inqMsg.trim();
                const phone = inqPhone.trim() || null;

                if (!name) return setInqErr("A név kötelező.");
                if (!email) return setInqErr("Az email kötelező.");
                if (!message) return setInqErr("Az üzenet kötelező.");

                try {
                  setInqSending(true);

                  await createInquiry(item.id, {
                    name,
                    email,
                    phone,
                    message,
                  });

                  setInqOk("Elküldve ✅ Hamarosan keresni fognak (remélhetőleg).");
                  setInqMsg("");
                  setInqPhone("");
                } catch (e: any) {
                  setInqErr(e?.message ?? "Hiba történt");
                } finally {
                  setInqSending(false);
                }
              }}
            >
              {inqSending ? "Küldés..." : "Üzenet küldése"}
            </button>

            <div className="muted" style={{ fontSize: 12 }}>
              Bejelentkezés nélkül is elküldhető (név + email + üzenet kell).
            </div>
          </div>
        </div>

        {/*  galéria */}
        {images.length ? (
          <div className="detailsGallery" style={{ marginTop: 16 }}>
            {images.map((img, idx) => {
              const isActive = (activeUrl ?? images?.[0]?.url) === img.url;

              return (
                <div
                  key={img.id}
                  className="detailsThumb"
                  onClick={() => {
                    setActiveUrl(img.url);
                    openLightbox(idx);
                  }}
                  title="Kattints a nagyításhoz"
                  style={{
                    cursor: "pointer",
                    outline: isActive ? "3px solid rgba(0,0,0,0.25)" : "none",
                    outlineOffset: isActive ? "2px" : "0px",
                  }}
                >
                  <img
                    src={imageUrl(img.url)}
                    alt="Kép"
                    className="detailsThumb__img"
                    loading="lazy"
                  />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {}
      {isLightboxOpen && images.length ? (
        <div
          className="lightboxOverlay"
          onClick={(e) => {
            
            if (e.target === e.currentTarget) closeLightbox();
          }}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="lightboxClose"
            onClick={closeLightbox}
            type="button"
            aria-label="Bezárás"
            title="Bezárás (ESC)"
          >
            ✕
          </button>

          <button
            className="lightboxNav lightboxNav--left"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            type="button"
            aria-label="Előző"
            title="Előző (←)"
          >
            ‹
          </button>

          <div className="lightboxContent" onClick={(e) => e.stopPropagation()}>
            <img
              className="lightboxImg"
              src={imageUrl(images[lightboxIndex].url)}
              alt="Nagyított kép"
              draggable={false}
            />

            <div className="lightboxCounter">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>

          <button
            className="lightboxNav lightboxNav--right"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            type="button"
            aria-label="Következő"
            title="Következő (→)"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}