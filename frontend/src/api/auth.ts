import { api } from "./client";

export type AuthResponse = {
  token: string;
  name: string;
  role: string;
};

export function loginApi(email: string, password: string) {
  return api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function registerApi(name: string, email: string, password: string) {
  return api<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}