

export type ListingListItem = {
  id: number;
  title: string;
  price: number;
  currency: string;
  city: string;
  district: string | null;
  areaM2: number;
  rooms: number;
  dealType: string;
  propertyType: string;
  status: string;
  coverImageUrl: string | null;
  createdAt: string;
};

export type PagedListings = {
  items: ListingListItem[];
  page: number;
  pageSize: number;
  total: number;
};

export type CreateListingRequest = {
  title: string;
  description: string;
  price: number;
  currency: string; // "HUF"
  city: string;
  district: string | null;

  
  status: string; // "ACTIVE"
  dealType: string; // "SALE" | "RENT"
  propertyType: string; // "APARTMENT" | "HOUSE" | stb.

  areaM2: number;
  rooms: number;

  // opcionális mezők 
  addressLine?: string | null;
  lat?: number | null;
  lng?: number | null;
  bathrooms?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  yearBuilt?: number | null;
  heatingType?: string | null;
};

export type CreateListingResponse = { id: number };

export type AuthResponse = {
  token: string;
  userId: number;
  email: string;
  role: string;
  name: string;
};

export type MeResponse = {
  userId: number;
  email: string;
  role: string;
  name: string;
};

export type ListingImage = {
  id: number;
  url: string;
  sortOrder: number;
};

export type ListingDetail = {
  id: number;
  ownerUserId: number;
  title: string;
  description: string;

  price: number;
  currency: string;
  city: string;
  district: string | null;
  addressLine: string | null;

  lat: number | null;
  lng: number | null;

  areaM2: number;
  rooms: number;
  bathrooms: number | null;

  floor: number | null;
  totalFloors: number | null;
  yearBuilt: number | null;
  heatingType: string | null;

  dealType: string;
  propertyType: string;
  status: string;

  createdAt: string;
  updatedAt: string;

  images: ListingImage[];
};

export type CreateInquiryRequest = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
};

export type InquiryItem = {
  id: number;
  listingId: number;
  listingTitle: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: string;
};

export type AdminUserListItem = {
  id: number;
  email: string;
  role: string;
  name: string;
  phone: string | null;
  createdAt: string;
};

export type AdminListingListItem = {
  id: number;
  title: string;
  status: string;
  price: number;
  currency: string;
  city: string;
  district: string | null;
  areaM2: number;
  rooms: number;
  createdAt: string;
  ownerUserId: number;
  ownerEmail: string;
  ownerName: string;
};
