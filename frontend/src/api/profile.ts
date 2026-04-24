import { api } from "./client";

export type ProfileDto = {
  userId: number;
  email: string;
  name: string;
  role: string;
  phone: string | null;
};

export type UpdateProfileResponse = {
  token: string;
  userId: number;
  email: string;
  role: string;
  name: string;
  phone: string | null;
};

export function getProfile() {
  return api<ProfileDto>("/api/profile");
}

export function updateProfile(body: { name: string; phone?: string | null }) {
  return api<UpdateProfileResponse>("/api/profile", { method: "PUT", body });
}

export function changePassword(body: { currentPassword: string; newPassword: string }) {
  return api<{ ok: boolean }>("/api/profile/password", { method: "PUT", body });
}