import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteInquiry, getMyInquiries } from "../api/inquiries";
import type { InquiryItem } from "../api/types";

type Thread = {
  listingId: number;
  listingTitle: string;
  lastAt: string;
  unreadCount: number;
  items: InquiryItem[];
};

const READ_KEY = "inquiries_read_ids_v1";

function loadReadSet(): Set<number> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x) => typeof x === "number"));
  } catch {
    return new Set();
  }
}

function saveReadSet(set: Set<number>) {
  localStorage.setItem(READ_KEY, JSON.stringify(Array.from(set)));
}

export default function MyInquiriesPage() {
  const [items, setItems] = useState<InquiryItem[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  const [readSet, setReadSet] = useState<Set<number>>(() => loadReadSet());

  // törlés
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getMyInquiries()
      .then((r) => {
        setItems(r.items);
        const firstListingId = r.items?.[0]?.listingId ?? null;
        setSelectedListingId((prev) => prev ?? firstListingId);
      })
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  const threads: Thread[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = !q
      ? items
      : items.filter((x) => {
          const hay = `${x.listingTitle} ${x.name} ${x.email} ${x.phone ?? ""} ${x.message}`.toLowerCase();
          return hay.includes(q);
        });

    const map = new Map<number, InquiryItem[]>();
    for (const it of filtered) {
      const arr = map.get(it.listingId) ?? [];
      arr.push(it);
      map.set(it.listingId, arr);
    }

    const result: Thread[] = Array.from(map.entries()).map(([listingId, arr]) => {
      const sorted = [...arr].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      const last = sorted[0];
      const unreadCount = sorted.reduce((acc, x) => acc + (readSet.has(x.id) ? 0 : 1), 0);

      return {
        listingId,
        listingTitle: last.listingTitle,
        lastAt: last.createdAt,
        unreadCount,
        items: sorted,
      };
    });

    result.sort((a, b) => +new Date(b.lastAt) - +new Date(a.lastAt));
    return result;
  }, [items, query, readSet]);

  const selectedThread = useMemo(() => {
    if (!selectedListingId) return null;
    return threads.find((t) => t.listingId === selectedListingId) ?? null;
  }, [threads, selectedListingId]);

  const totalUnread = useMemo(
    () => threads.reduce((acc, t) => acc + t.unreadCount, 0),
    [threads]
  );

  const markThreadAsRead = (thread: Thread) => {
    const next = new Set(readSet);
    for (const it of thread.items) next.add(it.id);
    setReadSet(next);
    saveReadSet(next);
  };

  const markOneAsRead = (id: number) => {
    if (readSet.has(id)) return;
    const next = new Set(readSet);
    next.add(id);
    setReadSet(next);
    saveReadSet(next);
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString("hu-HU");

  async function onDeleteMessage(id: number) {
    const ok = window.confirm("Biztosan törlöd ezt az üzenetet?");
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteInquiry(id);

      
      setItems((prev) => prev.filter((x) => x.id !== id));

      
      const next = new Set(readSet);
      next.delete(id);
      setReadSet(next);
      saveReadSet(next);

      // ha az aktuális thread teljesen kiürült, ugorjunk a következőre
      setSelectedListingId((prevListingId) => {
        if (!prevListingId) return prevListingId;
        const remainingInThread = items.filter((x) => x.listingId === prevListingId && x.id !== id);
        if (remainingInThread.length > 0) return prevListingId;

        //másik threade (legfrissebbet)
        const remaining = items.filter((x) => x.id !== id);
        const nextListingId = remaining[0]?.listingId ?? null;
        return nextListingId;
      });
    } catch (e: any) {
      alert(e?.message ?? "Törlés sikertelen");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      <div className="msgTop">
        <div>
          <h1 className="msgTitle">Üzenetek</h1>
          <div className="msgSub">
            Saját hirdetéseidre érkezett érdeklődések.
            {totalUnread > 0 ? <span className="msgBadge">{totalUnread} új</span> : null}
          </div>
        </div>

        <div className="msgTopActions">
          <Link to="/my-listings" className="btn btn--ghostLight">
            Saját hirdetések
          </Link>
        </div>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {loading && !err && <p>Betöltés...</p>}

      {!loading && !err && items.length === 0 && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontWeight: 900 }}>Még nincs üzenet</div>
          <p className="muted" style={{ marginBottom: 0 }}>
            Rakj ki 1-2 normális képet és egy normális címet… és jönnek.
          </p>
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <div className="msgLayout">
          {/* bal oldal */}
          <aside className="msgLeft">
            <div className="msgSearch">
              <input
                className="msgSearchInput"
                placeholder="Keresés: név, email, üzenet…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query ? (
                <button className="msgClear" onClick={() => setQuery("")} type="button" title="Törlés">
                  ✕
                </button>
              ) : null}
            </div>

            <div className="msgThreadList">
              {threads.map((t) => {
                const active = t.listingId === selectedListingId;
                const preview = t.items[0]?.message ?? "";
                return (
                  <button
                    key={t.listingId}
                    type="button"
                    className={active ? "msgThread isActive" : "msgThread"}
                    onClick={() => {
                      setSelectedListingId(t.listingId);
                      markThreadAsRead(t);
                    }}
                  >
                    <div className="msgThreadHead">
                      <div className="msgThreadTitle">{t.listingTitle}</div>
                      <div className="msgThreadTime">{fmt(t.lastAt)}</div>
                    </div>

                    <div className="msgThreadPreview">{preview}</div>

                    <div className="msgThreadFoot">
                      <span className="msgThreadMeta">{t.items.length} üzenet</span>
                      {t.unreadCount > 0 ? (
                        <span className="msgDotBadge">{t.unreadCount}</span>
                      ) : (
                        <span className="msgThreadMeta muted">olvasott</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* jobb oldal */}
          <main className="msgRight">
            {!selectedThread ? (
              <div className="msgEmpty">
                <div className="msgEmptyTitle">Válassz egy beszélgetést</div>
                <div className="muted">Bal oldalt kattints egy hirdetésre.</div>
              </div>
            ) : (
              <>
                <div className="msgHeader">
                  <div>
                    <div className="msgHeaderTitle">{selectedThread.listingTitle}</div>
                    <div className="muted">
                      <Link to={`/listings/${selectedThread.listingId}`} className="msgLink">
                        Hirdetés megnyitása →
                      </Link>
                    </div>
                  </div>

                  <div className="msgHeaderActions">
                    <button
                      className="btn btn--ghostLight"
                      type="button"
                      onClick={() => markThreadAsRead(selectedThread)}
                      title="Összes olvasottnak jelölése"
                    >
                      Olvasottnak
                    </button>
                  </div>
                </div>

                <div className="msgMessages">
                  {[...selectedThread.items].reverse().map((x) => {
                    const isUnread = !readSet.has(x.id);

                    return (
                      <div
                        key={x.id}
                        className={isUnread ? "msgBubble isUnread" : "msgBubble"}
                        onMouseEnter={() => markOneAsRead(x.id)}
                      >
                        <div className="msgBubbleTop">
                          <div className="msgSender">
                            <span className="msgSenderName">{x.name}</span>
                            <span className="msgSenderSep">•</span>
                            <a className="msgSenderLink" href={`mailto:${x.email}`}>
                              {x.email}
                            </a>
                            {x.phone ? (
                              <>
                                <span className="msgSenderSep">•</span>
                                <a className="msgSenderLink" href={`tel:${x.phone}`}>
                                  {x.phone}
                                </a>
                              </>
                            ) : null}
                          </div>

                          <div className="msgTime">{fmt(x.createdAt)}</div>
                        </div>

                        <div className="msgText">{x.message}</div>

                        <div className="msgActions">
                          <a
                            className="msgActionBtn"
                            href={`mailto:${x.email}?subject=${encodeURIComponent("Érdeklődés: " + selectedThread.listingTitle)}`}
                          >
                            Válasz emailben
                          </a>
                          {x.phone ? (
                            <a className="msgActionBtn" href={`tel:${x.phone}`}>
                              Hívás
                            </a>
                          ) : null}

                          <button
                            className="msgActionBtn msgActionDanger"
                            type="button"
                            disabled={deletingId === x.id}
                            onClick={() => onDeleteMessage(x.id)}
                            title="Üzenet törlése"
                          >
                            {deletingId === x.id ? "Törlés..." : "Törlés"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  );
}