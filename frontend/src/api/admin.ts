import { api } from "./client";
import type { AdminListingListItem, AdminUserListItem } from "./types";

export function adminGetUsers(limit = 500) {
  return api<{ items: AdminUserListItem[] }>(`/api/admin/users?limit=${limit}`);
}

export function adminSetUserRole(id: number, role: "USER" | "ADMIN") {
  return api<{ ok: boolean }>(`/api/admin/users/${id}/role`, {
    method: "PUT",
    body: { role },
  });
}

export function adminGetListings(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  q?: string;
}) {
  const p = new URLSearchParams();
  p.set("page", String(params.page ?? 1));
  p.set("pageSize", String(params.pageSize ?? 20));
  if (params.status) p.set("status", params.status);
  if (params.q) p.set("q", params.q);

  return api<{ items: AdminListingListItem[]; page: number; pageSize: number; total: number }>(
    `/api/admin/listings?${p.toString()}`
  );
}

export function adminSetListingStatus(id: number, status: "ACTIVE" | "INACTIVE") {
  return api<{ ok: boolean }>(`/api/admin/listings/${id}/status`, {
    method: "PUT",
    body: { status },
  });
}