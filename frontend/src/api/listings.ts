import { api } from "./client";
import type {
  PagedListings,
  CreateListingRequest,
  CreateListingResponse,
  ListingDetail,
} from "./types";
import { getSession } from "../auth/session";

export function getPublicListings(params?: {
  city?: string;
  district?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  rooms?: number | null;
  dealType?: string;
  propertyType?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  const qs = new URLSearchParams();

  if (params?.city) qs.set("city", params.city);
  if (params?.district) qs.set("district", params.district);
  if (params?.minPrice != null) qs.set("minPrice", String(params.minPrice));
  if (params?.maxPrice != null) qs.set("maxPrice", String(params.maxPrice));
  if (params?.minArea != null) qs.set("minArea", String(params.minArea));
  if (params?.maxArea != null) qs.set("maxArea", String(params.maxArea));
  if (params?.rooms != null) qs.set("rooms", String(params.rooms));
  if (params?.dealType) qs.set("dealType", params.dealType);
  if (params?.propertyType) qs.set("propertyType", params.propertyType);
  if (params?.sort) qs.set("sort", params.sort);
  if (params?.page != null) qs.set("page", String(params.page));
  if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api<PagedListings>(`/api/listings${suffix}`);
}

export function getListingById(id: number) {
  return api<ListingDetail>(`/api/listings/${id}`);
}

export function createListing(input: CreateListingRequest) {
  const session = getSession();
  if (!session?.token) throw new Error("Ehhez be kell jelentkezned.");

  return api<CreateListingResponse>("/api/listings", {
    method: "POST",
    token: session.token,
    body: input,
  });
}

export function updateListing(id: number, input: CreateListingRequest) {
  const session = getSession();
  if (!session?.token) throw new Error("Ehhez be kell jelentkezned.");

  return api<void>(`/api/listings/${id}`, {
    method: "PUT",
    token: session.token,
    body: input,
  });
}

export function deleteListing(id: number) {
  const session = getSession();
  if (!session?.token) throw new Error("Ehhez be kell jelentkezned.");

  return api<void>(`/api/listings/${id}`, {
    method: "DELETE",
    token: session.token,
  });
}

// ✅ SAJÁT HIRDETÉSEK
export function getMyListings(params?: { page?: number; pageSize?: number; sort?: string }) {
  const session = getSession();
  if (!session?.token) throw new Error("Ehhez be kell jelentkezned.");

  const qs = new URLSearchParams();
  if (params?.sort) qs.set("sort", params.sort);
  if (params?.page != null) qs.set("page", String(params.page));
  if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api<PagedListings>(`/api/listings/mine${suffix}`, {
    token: session.token,
  });
}

// ✅ KÉPFELTÖLTÉS
export function uploadListingImages(listingId: number, files: File[]) {
  const session = getSession();
  if (!session?.token) throw new Error("Ehhez be kell jelentkezned.");

  const fd = new FormData();
  for (const f of files) fd.append("files", f);

  return api<{ images: Array<{ id: number; url: string }> }>(
    `/api/listings/${listingId}/images`,
    {
      method: "POST",
      token: session.token,
      body: fd,
    }
  );
}