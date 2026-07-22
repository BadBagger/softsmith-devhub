import type { SiteService } from "@/lib/site-types";

export interface SiteTemplateProps {
  businessName: string;
  tagline: string;
  about: string;
  services: SiteService[];
  phone: string | null;
  email: string | null;
  address: string | null;
  accentColor: string;
}
