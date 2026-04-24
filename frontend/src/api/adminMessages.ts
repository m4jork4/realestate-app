import { api } from "./client";

export type AdminMessageCreateRequest = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export type AdminMessageListItem = {
  id: number;
  userId?: number | null;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  createdAt: string;
};

export function sendAdminMessage(req: AdminMessageCreateRequest) {
  return api<{ id: number }>("/api/admin-messages", { method: "POST", body: req });
}

export function adminGetMessages(limit = 200) {
  return api<{ items: AdminMessageListItem[] }>(`/api/admin/messages?limit=${limit}`);
}

export function adminDeleteMessage(id: number) {
  return api<{ ok: boolean }>(`/api/admin/messages/${id}`, { method: "DELETE" });
}
