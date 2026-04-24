import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminGetListings, adminGetUsers, adminSetListingStatus, adminSetUserRole } from "../api/admin";
import type { AdminListingListItem, AdminUserListItem } from "../api/types";
import { adminDeleteMessage, adminGetMessages, type AdminMessageListItem } from "../api/adminMessages";

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "listings" | "messages">("users");

  // users
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [uErr, setUErr] = useState("");
  const [uLoading, setULoading] = useState(true);

  // listings
  const [listings, setListings] = useState<AdminListingListItem[]>([]);
  const [lErr, setLErr] = useState("");
  const [lLoading, setLLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // messages
  const [messages, setMessages] = useState<AdminMessageListItem[]>([]);
  const [mErr, setMErr] = useState("");
  const [mLoading, setMLoading] = useState(false);

  useEffect(() => {
    setULoading(true);
    adminGetUsers(500)
      .then((r) => setUsers(r.items))
      .catch((e: any) => setUErr(e?.message ?? "Hiba"))
      .finally(() => setULoading(false));
  }, []);

  async function loadListings(p = page) {
    setLLoading(true);
    setLErr("");
    try {
      const r = await adminGetListings({ page: p, pageSize: 20, status: statusFilter || undefined, q: q.trim() || undefined });
      setListings(r.items);
      setTotal(r.total);
      setPage(r.page);
    } catch (e: any) {
      setLErr(e?.message ?? "Hiba");
    } finally {
      setLLoading(false);
    }
  }

  useEffect(() => {
    loadListings(1);
    
  }, [statusFilter]);

  const pages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  async function loadMessages() {
    setMLoading(true);
    setMErr("");
    try {
      const r = await adminGetMessages(300);
      setMessages(r.items);
    } catch (e: any) {
      setMErr(e?.message ?? "Hiba");
    } finally {
      setMLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      <div className="adminTop">
        <div>
          <h1 className="adminTitle">Admin</h1>
          <div className="adminSub muted">Userek kezelése, role váltás, hirdetések moderálása.</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/listings" className="btn btn--ghostLight">Hirdetések</Link>
        </div>
      </div>

      <div className="adminTabs">
        <button className={tab === "users" ? "adminTab isActive" : "adminTab"} onClick={() => setTab("users")} type="button">
          Userek
        </button>
        <button className={tab === "listings" ? "adminTab isActive" : "adminTab"} onClick={() => setTab("listings")} type="button">
          Hirdetések
        </button>
        <button
          className={tab === "messages" ? "adminTab isActive" : "adminTab"}
          onClick={() => {
            setTab("messages");
            loadMessages();
          }}
          type="button"
        >
          Üzenetek
        </button>
      </div>

      {tab === "users" && (
        <div className="adminCard">
          {uErr && <p style={{ color: "crimson" }}>{uErr}</p>}
          {uLoading && !uErr && <p>Betöltés...</p>}

          {!uLoading && !uErr && (
            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Név</th>
                    <th>Email</th>
                    <th>Telefon</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="muted">{u.id}</td>
                      <td style={{ fontWeight: 800 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td className="muted">{u.phone ?? "—"}</td>
                      <td>
                        <span className={u.role === "ADMIN" ? "adminPill adminPill--admin" : "adminPill"}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
                          <button
                            className="btn btn--ghostLight"
                            type="button"
                            disabled={u.role === "USER"}
                            onClick={async () => {
                              await adminSetUserRole(u.id, "USER");
                              setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: "USER" } : x)));
                            }}
                          >
                            USER
                          </button>
                          <button
                            className="btn btn--ghostLight"
                            type="button"
                            disabled={u.role === "ADMIN"}
                            onClick={async () => {
                              await adminSetUserRole(u.id, "ADMIN");
                              setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: "ADMIN" } : x)));
                            }}
                          >
                            ADMIN
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "listings" && (
        <div className="adminCard">
          <div className="adminFilters">
            <input
              className="msgSearchInput"
              placeholder="Keresés: cím / város / owner email…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="msgSearchInput" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Összes status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <button className="btn btn--ghostLight" type="button" onClick={() => loadListings(1)}>
              Keresés
            </button>
          </div>

          {lErr && <p style={{ color: "crimson" }}>{lErr}</p>}
          {lLoading && !lErr && <p>Betöltés...</p>}

          {!lLoading && !lErr && (
            <>
              <div className="adminList">
                {listings.map((x) => (
                  <div key={x.id} className="adminListingRow">
                    <div>
                      <div style={{ fontWeight: 900 }}>
                        <Link to={`/listings/${x.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                          {x.title}
                        </Link>
                      </div>
                      <div className="muted" style={{ marginTop: 6 }}>
                        {x.city}{x.district ? `, ${x.district}` : ""} • {x.areaM2} m² • {x.rooms} szoba •{" "}
                        {x.price.toLocaleString("hu-HU")} {x.currency}
                      </div>
                      <div className="muted" style={{ marginTop: 6 }}>
                        Owner: <b>{x.ownerName}</b> ({x.ownerEmail}) • {new Date(x.createdAt).toLocaleString("hu-HU")}
                      </div>
                    </div>

                    <div className="adminRight">
                      <span className={x.status === "ACTIVE" ? "adminPill adminPill--ok" : "adminPill adminPill--warn"}>
                        {x.status}
                      </span>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <button
                          className="btn btn--ghostLight"
                          type="button"
                          disabled={x.status === "ACTIVE"}
                          onClick={async () => {
                            await adminSetListingStatus(x.id, "ACTIVE");
                            setListings((prev) => prev.map((l) => (l.id === x.id ? { ...l, status: "ACTIVE" } : l)));
                          }}
                        >
                          Aktiválás
                        </button>

                        <button
                          className="btn btn--dangerLight"
                          type="button"
                          disabled={x.status === "INACTIVE"}
                          onClick={async () => {
                            await adminSetListingStatus(x.id, "INACTIVE");
                            setListings((prev) => prev.map((l) => (l.id === x.id ? { ...l, status: "INACTIVE" } : l)));
                          }}
                        >
                          Tiltás
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="adminPager">
                <button className="btn btn--ghostLight" disabled={page <= 1} onClick={() => loadListings(page - 1)} type="button">
                  ←
                </button>
                <div className="muted">
                  {page} / {pages} (összes: {total})
                </div>
                <button className="btn btn--ghostLight" disabled={page >= pages} onClick={() => loadListings(page + 1)} type="button">
                  →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "messages" && (
        <div className="adminCard">
          <div className="adminFilters" style={{ justifyContent: "space-between" }}>
            <div className="muted">Legutóbbi admin üzenetek.</div>
            <button className="btn btn--ghostLight" type="button" onClick={loadMessages}>
              Frissítés
            </button>
          </div>

          {mErr && <p style={{ color: "crimson" }}>{mErr}</p>}
          {mLoading && !mErr && <p>Betöltés...</p>}

          {!mLoading && !mErr && messages.length === 0 && <p className="muted">Nincs üzenet.</p>}

          {!mLoading && !mErr && messages.length > 0 && (
            <div className="adminList">
              {messages.map((m) => (
                <div key={m.id} className="adminListingRow">
                  <div>
                    <div style={{ fontWeight: 900 }}>{m.subject?.trim() ? m.subject : "(nincs tárgy)"}</div>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {m.name} • {m.email} • {new Date(m.createdAt).toLocaleString("hu-HU")}
                    </div>
                    <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{m.message}</div>
                  </div>

                  <div className="adminRight">
                    <button
                      className="btn btn--ghostLight"
                      type="button"
                      onClick={async () => {
                        await adminDeleteMessage(m.id);
                        setMessages((prev) => prev.filter((x) => x.id !== m.id));
                      }}
                    >
                      Törlés
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}