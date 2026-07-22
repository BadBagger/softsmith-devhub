import { randomUUID } from "node:crypto";
import db from "./db";
import { Lead, LEAD_STATUSES, LeadStatus } from "./lead-types";
import { PlaceCandidate } from "./places";
import { scoreLead } from "./scoring";

export interface LeadCandidate extends PlaceCandidate {
  score: number;
  scoreReasons: string[];
  alreadySaved: boolean;
}

export function candidatesFromPlaces(places: PlaceCandidate[]): LeadCandidate[] {
  const existing = new Set(
    (db.prepare("SELECT place_id FROM leads").all() as { place_id: string }[]).map(
      (r) => r.place_id,
    ),
  );

  return places
    .map((p) => {
      const { score, reasons } = scoreLead({
        hasWebsite: Boolean(p.website),
        rating: p.rating,
        ratingCount: p.ratingCount,
      });
      return {
        ...p,
        score,
        scoreReasons: reasons,
        alreadySaved: existing.has(p.placeId),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function saveLead(candidate: LeadCandidate, searchCategory: string, searchLocation: string): Lead {
  const now = new Date().toISOString();
  const existing = db
    .prepare("SELECT * FROM leads WHERE place_id = ?")
    .get(candidate.placeId) as Lead | undefined;
  if (existing) return existing;

  const id = randomUUID();
  db.prepare(
    `INSERT INTO leads (
      id, place_id, business_name, category, address, phone, website,
      has_website, lat, lng, rating, rating_count, score, score_reasons,
      status, search_location, search_category, created_at, updated_at
    ) VALUES (@id, @place_id, @business_name, @category, @address, @phone, @website,
      @has_website, @lat, @lng, @rating, @rating_count, @score, @score_reasons,
      @status, @search_location, @search_category, @created_at, @updated_at)`,
  ).run({
    id,
    place_id: candidate.placeId,
    business_name: candidate.businessName,
    category: searchCategory,
    address: candidate.address,
    phone: candidate.phone,
    website: candidate.website,
    has_website: candidate.website ? 1 : 0,
    lat: candidate.lat,
    lng: candidate.lng,
    rating: candidate.rating,
    rating_count: candidate.ratingCount,
    score: candidate.score,
    score_reasons: JSON.stringify(candidate.scoreReasons),
    status: "new",
    search_location: searchLocation,
    search_category: searchCategory,
    created_at: now,
    updated_at: now,
  });

  return db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as Lead;
}

export function listLeads(status?: string): Lead[] {
  if (status && LEAD_STATUSES.includes(status as LeadStatus)) {
    return db
      .prepare("SELECT * FROM leads WHERE status = ? ORDER BY score DESC, created_at DESC")
      .all(status) as Lead[];
  }
  return db
    .prepare("SELECT * FROM leads ORDER BY score DESC, created_at DESC")
    .all() as Lead[];
}

export function updateLeadStatus(id: string, status: LeadStatus): Lead | null {
  if (!LEAD_STATUSES.includes(status)) return null;
  const now = new Date().toISOString();
  const result = db
    .prepare("UPDATE leads SET status = ?, updated_at = ? WHERE id = ?")
    .run(status, now, id);
  if (result.changes === 0) return null;
  return db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as Lead;
}

export function deleteLead(id: string): boolean {
  const result = db.prepare("DELETE FROM leads WHERE id = ?").run(id);
  return result.changes > 0;
}

export function getLead(id: string): Lead | null {
  return (db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as Lead | undefined) ?? null;
}
