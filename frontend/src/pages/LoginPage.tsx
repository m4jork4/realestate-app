import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../api/auth";
import { setSession } from "../auth/session";

export default function LoginPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await loginApi(email.trim(), password);
      setSession(res);
      nav("/listings");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "40px auto", padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Bejelentkezés</h2>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            className="input"
            placeholder="Jelszó"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Belépés..." : "Belépés"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 12 }}>
          Nincs fiókod? <Link to="/register">Regisztráció</Link>
        </p>
      </div>
    </div>
  );
}