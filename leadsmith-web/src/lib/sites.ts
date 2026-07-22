import { randomUUID } from "node:crypto";
import db from "./db";
import { getLead } from "./leads";
import { Site, SiteService, SiteTemplateId, SITE_TEMPLATES } from "./site-types";

export interface SiteInput {
  template?: SiteTemplateId;
  businessName?: string;
  tagline?: string;
  about?: string;
  services?: SiteService[];
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  accentColor?: string;
}

const VALID_TEMPLATES = new Set(SITE_TEMPLATES.map((t) => t.id));

export function listSites(): Site[] {
  return db.prepare("SELECT * FROM sites ORDER BY updated_at DESC").all() as Site[];
}

export function getSite(id: string): Site | null {
  return (db.prepare("SELECT * FROM sites WHERE id = ?").get(id) as Site | undefined) ?? null;
}

export function createSite(input: SiteInput, leadId: string | null = null): Site {
  const now = new Date().toISOString();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO sites (
      id, lead_id, template, business_name, tagline, about, services,
      phone, email, address, accent_color, created_at, updated_at
    ) VALUES (@id, @lead_id, @template, @business_name, @tagline, @about, @services,
      @phone, @email, @address, @accent_color, @created_at, @updated_at)`,
  ).run({
    id,
    lead_id: leadId,
    template: input.template && VALID_TEMPLATES.has(input.template) ? input.template : "modern",
    business_name: input.businessName ?? "Your Business",
    tagline: input.tagline ?? "",
    about: input.about ?? "",
    services: JSON.stringify(input.services ?? []),
    phone: input.phone ?? null,
    email: input.email ?? null,
    address: input.address ?? null,
    accent_color: input.accentColor ?? "#0f766e",
    created_at: now,
    updated_at: now,
  });

  return getSite(id) as Site;
}

/** Creates a proposal site pre-filled from a saved lead's business info. */
export function createSiteFromLead(leadId: string): Site | null {
  const lead = getLead(leadId);
  if (!lead) return null;

  return createSite(
    {
      businessName: lead.business_name,
      tagline: lead.category
        ? `Trusted ${lead.category} in ${lead.search_location ?? "your area"}`
        : "",
      about: `${lead.business_name} is a local business ready for a website that matches the quality of its work. This is a starting draft — everything here is editable.`,
      services: lead.category
        ? [{ name: lead.category, description: "Describe what you offer here." }]
        : [],
      phone: lead.phone,
      address: lead.address,
    },
    lead.id,
  );
}

export function updateSite(id: string, input: SiteInput): Site | null {
  const existing = getSite(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE sites SET
      template = @template,
      business_name = @business_name,
      tagline = @tagline,
      about = @about,
      services = @services,
      phone = @phone,
      email = @email,
      address = @address,
      accent_color = @accent_color,
      updated_at = @updated_at
    WHERE id = @id`,
  ).run({
    id,
    template:
      input.template && VALID_TEMPLATES.has(input.template) ? input.template : existing.template,
    business_name: input.businessName ?? existing.business_name,
    tagline: input.tagline ?? existing.tagline,
    about: input.about ?? existing.about,
    services: input.services ? JSON.stringify(input.services) : existing.services,
    phone: input.phone !== undefined ? input.phone : existing.phone,
    email: input.email !== undefined ? input.email : existing.email,
    address: input.address !== undefined ? input.address : existing.address,
    accent_color: input.accentColor ?? existing.accent_color,
    updated_at: now,
  });

  return getSite(id);
}

export function deleteSite(id: string): boolean {
  const result = db.prepare("DELETE FROM sites WHERE id = ?").run(id);
  return result.changes > 0;
}
