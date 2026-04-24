import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { changePassword, getProfile, updateProfile } from "../api/profile";
import { getSession, setSession } from "../auth/session";

export default function ProfilePage() {
  const session = getSession();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [currPw, setCurrPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwOk, setPwOk] = useState("");
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    if (!session) return;

    setLoading(true);
    setErr("");
    setOk("");

    getProfile()
      .then((p) => {
        setEmail(p.email);
        setRole(p.role);
        setName(p.name ?? "");
        setPhone(p.phone ?? "");
      })
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [session?.token]);

  if (!session) return <Navigate to="/login" replace />;

  async function onSaveProfile() {
    setErr("");
    setOk("");

    const n = name.trim();
    if (!n) {
      setErr("A név kötelező.");
      return;
    }

    try {
      const res = await updateProfile({
        name: n,
        phone: phone.trim() ? phone.trim() : null,
      });

      // friss token + név a sessionben
      setSession({
        token: res.token,
        userId: res.userId,
        email: res.email,
        role: res.role,
        name: res.name,
      });

      setOk("Mentve.");
    } catch (e: any) {
      setErr(e?.message ?? "Mentés sikertelen");
    }
  }

  async function onChangePassword() {
    setPwErr("");
    setPwOk("");

    if (!currPw.trim()) {
      setPwErr("Régi jelszó kötelező.");
      return;
    }
    if (newPw.trim().length < 6) {
      setPwErr("Új jelszó minimum 6 karakter.");
      return;
    }

    try {
      await changePassword({ currentPassword: currPw, newPassword: newPw });
      setPwOk("Jelszó frissítve.");
      setCurrPw("");
      setNewPw("");
    } catch (e: any) {
      setPwErr(e?.message ?? "Jelszó csere sikertelen");
    }
  }

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      <div className="profileTop">
        <div>
          <h1 className="profileTitle">Profil</h1>
          <div className="muted">Saját adatok és biztonság.</div>
        </div>

        <div className={role.toUpperCase() === "ADMIN" ? "roleBadge roleBadge--admin" : "roleBadge"}>
          {role.toUpperCase()}
        </div>
      </div>

      {loading && <p>Betöltés...</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {ok && <p style={{ color: "green" }}>{ok}</p>}

      {!loading && (
        <div className="profileGrid">
          {/* Profile card */}
          <div className="profileCard">
            <div className="profileCardTitle">Saját adatok</div>

            <label className="profileLabel">Email (readonly)</label>
            <input className="profileInput" value={email} readOnly />

            <label className="profileLabel">Név</label>
            <input
              className="profileInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Név"
            />

            <label className="profileLabel">Telefon</label>
            <input
              className="profileInput"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+36..."
            />

            <div className="profileActions">
              <button className="btn" type="button" onClick={onSaveProfile}>
                Mentés
              </button>
            </div>
          </div>

          {/* Password card */}
          <div className="profileCard">
            <div className="profileCardTitle">Jelszó csere</div>

            {pwErr && <p style={{ color: "crimson", marginTop: 0 }}>{pwErr}</p>}
            {pwOk && <p style={{ color: "green", marginTop: 0 }}>{pwOk}</p>}

            <label className="profileLabel">Régi jelszó</label>
            <input
              className="profileInput"
              type="password"
              value={currPw}
              onChange={(e) => setCurrPw(e.target.value)}
              placeholder="••••••"
            />

            <label className="profileLabel">Új jelszó</label>
            <input
              className="profileInput"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="minimum 6 karakter"
            />

            <div className="profileActions">
              <button className="btn btn--ghostLight" type="button" onClick={onChangePassword}>
                Jelszó frissítése
              </button>
            </div>

            <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
              Tipp: ne “123456”, mert azt még a hűtőd is feltöri.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}