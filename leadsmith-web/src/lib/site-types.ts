export type SiteTemplateId = "modern" | "classic";

export const SITE_TEMPLATES: { id: SiteTemplateId; label: string }[] = [
  { id: "modern", label: "Modern" },
  { id: "classic", label: "Classic" },
];

export interface SiteService {
  name: string;
  description: string;
}

export interface Site {
  id: string;
  lead_id: string | null;
  template: SiteTemplateId;
  business_name: string;
  tagline: string;
  about: string;
  /** JSON-encoded SiteService[]; parse with parseServices(). */
  services: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  accent_color: string;
  created_at: string;
  updated_at: string;
}

export function parseServices(services: string): SiteService[] {
  try {
    const parsed = JSON.parse(services);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
