import { api } from "./client";
import type { CreateInquiryRequest, InquiryItem } from "./types";

export function createInquiry(listingId: number, req: CreateInquiryRequest) {
  return api<{ id: number }>(`/api/listings/${listingId}/inquiries`, {
    method: "POST",
    body: req,
  });
}

export function getMyInquiries(limit = 200) {
  return api<{ items: InquiryItem[] }>(`/api/inquiries/mine?limit=${limit}`);
}

export function deleteInquiry(id: number) {
  return api<{ ok: boolean }>(`/api/inquiries/${id}`, { method: "DELETE" });
}