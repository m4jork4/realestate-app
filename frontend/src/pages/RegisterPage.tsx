import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/auth";
import { setSession } from "../auth/session";

export default function RegisterPage() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await registerApi(name.trim(), email.trim(), password);
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
        <h2 style={{ marginTop: 0 }}>Regisztráció</h2>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            className="input"
            placeholder="Név"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />

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
            autoComplete="new-password"
            required
          />

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Regisztráció..." : "Regisztráció"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 12 }}>
          Van már fiókod? <Link to="/login">Bejelentkezés</Link>
        </p>
      </div>
    </div>
  );
}