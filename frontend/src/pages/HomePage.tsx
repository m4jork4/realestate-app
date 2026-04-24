import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { getSession } from "../auth/session";
import { sendAdminMessage } from "../api/adminMessages";

export default function HomePage() {
  const nav = useNavigate();

  const session = getSession();

  const [dealType, setDealType] = useState<"sale" | "rent">("sale");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Admin message box
  const [aName, setAName] = useState(session?.name ?? "");
  const [aEmail, setAEmail] = useState(session?.email ?? "");
  const [aSubject, setASubject] = useState("");
  const [aMessage, setAMessage] = useState("");
  const [aStatus, setAStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [aErr, setAErr] = useState("");

  const stats = useMemo(
    () => [
      { label: "Aktív hirdetések", value: "300+" },
      { label: "Új hirdetés / nap", value: "25+" },
      { label: "Menthető kedvencek", value: "∞" },
    ],
    []
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const qs = new URLSearchParams();
    qs.set("dealType", dealType);
    if (city.trim()) qs.set("city", city.trim());
    if (minPrice.trim()) qs.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) qs.set("maxPrice", maxPrice.trim());

    nav(`/listings?${qs.toString()}`);
  };

  return (
    <>
      {}
      <section className="homeHero">
        <div className="homeHero__bg" aria-hidden="true" />

        <div className="container homeHero__inner">
          <div className="homeHero__grid">
            {/* bal */}
            <div>
              <div className="homePill">
                <span className="homeDot" />
                <span>Gyors • Letisztult • Mobilbarát</span>
              </div>

              <h1 className="homeTitle">
                Találd meg a következő{" "}
                <span className="homeTitle__accent">otthonod</span> pár kattintással
              </h1>

              <p className="homeLead">
                Böngéssz ingatlanok között, mentsd el a kedvenceidet, és adj fel
                saját hirdetést pillanatok alatt. 
              </p>

              <div className="homeActions">
                <Link to="/listings" className="btn">
                  Hirdetések böngészése
                </Link>

                <Link to="/create" className="btn btn--ghost">
                  Hirdetés feladása
                </Link>
              </div>

              <div className="homeStats">
                {stats.map((s) => (
                  <div key={s.label} className="homeStat">
                    <div className="homeStat__value">{s.value}</div>
                    <div className="homeStat__label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* jobb */}
            <div className="homeCard">
              <div className="homeCard__head">
                <div className="homeCard__title">Gyors keresés</div>
                <div className="homeCard__sub">Indulj el egy értelmes szűréssel</div>
              </div>

              <form onSubmit={onSearch} className="homeForm">
                <div className="homeToggle">
                  <button
                    type="button"
                    className={dealType === "sale" ? "homeToggle__btn isActive" : "homeToggle__btn"}
                    onClick={() => setDealType("sale")}
                  >
                    Eladó
                  </button>
                  <button
                    type="button"
                    className={dealType === "rent" ? "homeToggle__btn isActive" : "homeToggle__btn"}
                    onClick={() => setDealType("rent")}
                  >
                    Kiadó
                  </button>
                </div>

                <label className="homeLabel">
                  Város
                  <input
                    className="homeInput"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="pl. Budapest"
                  />
                </label>

                <div className="homeRow">
                  <label className="homeLabel">
                    Min. ár
                    <input
                      className="homeInput"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="pl. 20000000"
                      inputMode="numeric"
                    />
                  </label>

                  <label className="homeLabel">
                    Max. ár
                    <input
                      className="homeInput"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="pl. 60000000"
                      inputMode="numeric"
                    />
                  </label>
                </div>

                <button className="btn homeSubmit" type="submit">
                  Keresés
                </button>

                <div className="homeHint">
                  Tipp: ha üresen hagyod az árakat, nem fog megsértődni.
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="homeSection">
        <div className="container">
          <div className="homeSection__head">
            <h2 className="homeH2">Miért jó ez?</h2>
            <p className="muted">
              Mert nem kell 14 tabot nyitni, mire rájössz, hogy az “amerikai konyha”
              valójában egy mikró az előszobában.
            </p>
          </div>

          <div className="homeFeatureGrid">
            <Feature icon="⚡" title="Gyors keresés" text="Szűrés város, ár, méret alapján. Paginációval, nem szenvedéssel." />
            <Feature icon="❤️" title="Kedvencek" text="Egy kattintás, és a jók nem tűnnek el a semmibe." />
            <Feature icon="🖼️" title="Képek rendben" text="Feltöltés + galéria + nagyítás." />
            <Feature icon="🔐" title="Saját hirdetések" text="Belépsz, kezeled, szerkeszted. Kész." />
          </div>
        </div>
      </section>

      {}
      <section className="homeCta">
        <div className="container homeCta__inner">
          <div>
            <h2 className="homeH2" style={{ marginBottom: 8 }}>
              Készen állsz?
            </h2>
            <p className="muted" style={{ margin: 0 }}>
              Regisztrálj, és add fel az első hirdetésed. (A kedvencek megvárnak.)
            </p>
          </div>

          <div className="homeCta__actions">
            <Link to="/register" className="btn">
              Regisztráció
            </Link>
            <Link to="/listings" className="btn btn--ghost">
              Nézelődöm inkább
            </Link>
          </div>
        </div>
      </section>

      {/* kapcsolat ADMIN */}
      <section className="homeSection" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="homeSection__head" style={{ marginBottom: 14 }}>
            <h2 className="homeH2">Írj az adminnak</h2>
            <p className="muted">
              Ha valami furán viselkedik, hiányzik egy funkció, vagy csak szeretnél üzenni: itt a gyors csatorna.
            </p>
          </div>

          <div className="homeCard" style={{ maxWidth: 820, margin: "0 auto" }}>
            <div className="homeCard__head">
              <div className="homeCard__title">Üzenet küldése</div>
              <div className="homeCard__sub">Válaszolunk (igen, emberek. nem csak a 404).</div>
            </div>

            <form
              className="homeForm"
              onSubmit={async (e) => {
                e.preventDefault();
                setAErr("");
                setAStatus("sending");
                try {
                  await sendAdminMessage({
                    name: aName,
                    email: aEmail,
                    subject: aSubject.trim() || undefined,
                    message: aMessage,
                  });
                  setAStatus("ok");
                  setAMessage("");
                  setASubject("");
                } catch (err: any) {
                  setAStatus("err");
                  setAErr(err?.message ?? "Hiba történt.");
                }
              }}
            >
              <div className="homeRow">
                <label className="homeLabel">
                  Név
                  <input
                    className="homeInput"
                    value={aName}
                    onChange={(e) => setAName(e.target.value)}
                    placeholder="pl. Kovács Márk"
                    required
                  />
                </label>

                <label className="homeLabel">
                  Email
                  <input
                    className="homeInput"
                    value={aEmail}
                    onChange={(e) => setAEmail(e.target.value)}
                    placeholder="pl. mark@example.com"
                    inputMode="email"
                    required
                  />
                </label>
              </div>

              <label className="homeLabel">
                Tárgy (opcionális)
                <input
                  className="homeInput"
                  value={aSubject}
                  onChange={(e) => setASubject(e.target.value)}
                  placeholder="pl. Hibás képfeltöltés"
                />
              </label>

              <label className="homeLabel">
                Üzenet
                <textarea
                  className="homeInput"
                  value={aMessage}
                  onChange={(e) => setAMessage(e.target.value)}
                  placeholder="Írd le röviden, mi a helyzet…"
                  rows={5}
                  required
                />
              </label>

              {aStatus === "ok" && (
                <div className="homeHint" style={{ color: "#0a7a2f" }}>
                  Mentve. Az admin már élesíti a kávét.
                </div>
              )}
              {aStatus === "err" && aErr && (
                <div className="homeHint" style={{ color: "crimson" }}>
                  {aErr}
                </div>
              )}

              <button className="btn homeSubmit" type="submit" disabled={aStatus === "sending"}>
                {aStatus === "sending" ? "Küldés…" : "Küldés"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: string;
}) {
  return (
    <div className="homeFeature">
      <div className="homeFeature__icon">{icon}</div>
      <div>
        <h3 className="homeFeature__title">{title}</h3>
        <p className="homeFeature__text">{text}</p>
      </div>
    </div>
  );
}