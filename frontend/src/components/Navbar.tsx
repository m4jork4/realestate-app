import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearSession, getSession } from "../auth/session";
import { getMyInquiries } from "../api/inquiries";
import type { InquiryItem } from "../api/types";

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

function useIsMobile(breakpointPx = 720) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= breakpointPx;
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= breakpointPx);
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpointPx]);

  return isMobile;
}

export default function Navbar() {
  const location = useLocation();
  const isMobile = useIsMobile(720);

  const [session, setSession] = useState(() => getSession());
  const [open, setOpen] = useState(false);

  // Unread  számláló
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const update = () => setSession(getSession());
    update();

    window.addEventListener("storage", update);
    window.addEventListener("auth", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("auth", update);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  async function refreshUnread() {
    try {
      if (!session) {
        setUnreadCount(0);
        return;
      }

      const r = await getMyInquiries(200);
      const readSet = loadReadSet();

      const unread = (r.items as InquiryItem[]).reduce(
        (acc, x) => acc + (readSet.has(x.id) ? 0 : 1),
        0
      );

      setUnreadCount(unread);
    } catch {
      
      setUnreadCount(0);
    }
  }

  
  useEffect(() => {
    refreshUnread();
    
  }, [session?.token]);

  
  useEffect(() => {
    const onFocus = () => refreshUnread();

    const onStorage = (e: StorageEvent) => {
      if (e.key === READ_KEY) refreshUnread();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
    
  }, [session?.token]);

  function logout() {
    clearSession();
    window.location.href = "/";
  }

  const isAdmin = (session?.role ?? "").toUpperCase() === "ADMIN";

  const commonLinks = (
    <>
      <Link to="/listings">Hirdetések</Link>

      {session && <Link to="/favorites">Kedvencek</Link>}
      {session && <Link to="/create">Hirdetés feladás</Link>}
      {session && <Link to="/my-listings">Saját hirdetéseim</Link>}
      {session && <Link to="/profile">Profil</Link>}

      {session && (
        <Link
          to="/inquiries"
          className="navMsgLink"
          onClick={() => setUnreadCount(0)}
        >
          Üzenetek
          {unreadCount > 0 ? (
            <span className="navBadge">{unreadCount}</span>
          ) : null}
        </Link>
      )}

      {/*  ADMIN  */}
      {session && isAdmin && <Link to="/admin">Admin</Link>}
    </>
  );

  const authLinks = !session ? (
    <>
      <Link to="/login">Bejelentkezés</Link>
      <Link to="/register">Regisztráció</Link>
    </>
  ) : (
    <>
      <span className="muted" style={{ fontWeight: 700 }}>
        {session.name} ({session.role})
      </span>
      <button className="btn" onClick={logout}>
        Kilépés
      </button>
    </>
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        background: "white",
        borderBottom: "1px solid #eee",
        zIndex: 50,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 64,
          gap: 12,
        }}
      >
        {/*  LOGÓ + BRAND */}
        <Link
          to="/"
          className="navbarBrand"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "inherit",
            fontWeight: 900,
            fontSize: 18,
            whiteSpace: "nowrap",
          }}
        >
          <img
            src="/logo.png"
            alt="RealEstate"
            style={{
              width: 70,
              height: 70,
              objectFit: "contain",
              borderRadius: 8,
              display: "block",
            }}
          />
          <span>RealEstate</span>
        </Link>

        {!isMobile && (
          <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {commonLinks}
            {authLinks}
          </nav>
        )}

        {isMobile && (
          <button
            className="btn"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Menü"
          >
            {open ? "✕" : "☰"}
          </button>
        )}
      </div>

      {isMobile && open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 40,
            }}
          />

          <div
            style={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              background: "white",
              borderBottom: "1px solid #eee",
              zIndex: 60,
              padding: 16,
            }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {commonLinks}
              <div style={{ height: 1, background: "#eee" }} />
              {authLinks}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}