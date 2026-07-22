export type LeadStatus = "new" | "contacted" | "replied" | "won" | "lost";

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "replied",
  "won",
  "lost",
];

export interface Lead {
  id: string;
  place_id: string;
  business_name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  has_website: 0 | 1;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  rating_count: number | null;
  score: number;
  score_reasons: string;
  status: LeadStatus;
  search_location: string | null;
  search_category: string | null;
  created_at: string;
  updated_at: string;
}
