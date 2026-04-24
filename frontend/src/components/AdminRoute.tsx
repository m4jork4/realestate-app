import { Navigate } from "react-router-dom";
import { getSession } from "../auth/session";
import type { ReactNode } from "react";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const s = getSession();
  if (!s) return <Navigate to="/login" replace />;
  if ((s.role ?? "").toUpperCase() !== "ADMIN") return <Navigate to="/" replace />;
  return <>{children}</>;
}