import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="card" style={{ padding: 16 }}>
        <h1 style={{ marginTop: 0 }}>404</h1>
        <p className="muted">Ezt az oldalt nem találom. Vagy elköltözött, vagy sosem létezett. Mint a “holnap tanulok” terv.</p>
        <Link className="btn" to="/">Vissza a kezdőlapra</Link>
      </div>
    </div>
  );
}
