export interface PlaceCandidate {
  placeId: string;
  businessName: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  ratingCount: number | null;
  businessStatus: string | null;
}

interface GooglePlacesTextSearchResponse {
  places?: Array<{
    id: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    businessStatus?: string;
    location?: { latitude?: number; longitude?: number };
  }>;
}

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "places.location",
].join(",");

export class PlacesConfigError extends Error {}

/**
 * Searches Google Places (New) Text Search for businesses matching a
 * category near a location. Requires GOOGLE_PLACES_API_KEY. Set
 * LEADSMITH_MOCK_PLACES=1 to get deterministic sample data instead, useful
 * for local development without burning API quota or a key at all.
 */
export async function searchPlaces(
  category: string,
  location: string,
): Promise<PlaceCandidate[]> {
  if (process.env.LEADSMITH_MOCK_PLACES === "1") {
    return mockSearch(category, location);
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new PlacesConfigError(
      "GOOGLE_PLACES_API_KEY is not set. Add it to .env.local, or set LEADSMITH_MOCK_PLACES=1 to try the flow with sample data.",
    );
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: `${category} in ${location}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Places request failed (${res.status}): ${body}`);
  }

  const data: GooglePlacesTextSearchResponse = await res.json();

  return (data.places ?? [])
    .filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY")
    .map((p) => ({
      placeId: p.id,
      businessName: p.displayName?.text ?? "Unnamed business",
      address: p.formattedAddress ?? null,
      phone: p.internationalPhoneNumber ?? p.nationalPhoneNumber ?? null,
      website: p.websiteUri ?? null,
      lat: p.location?.latitude ?? null,
      lng: p.location?.longitude ?? null,
      rating: p.rating ?? null,
      ratingCount: p.userRatingCount ?? null,
      businessStatus: p.businessStatus ?? null,
    }));
}

function mockSearch(category: string, location: string): PlaceCandidate[] {
  const seed = `${category} in ${location}`;
  const samples: Array<Omit<PlaceCandidate, "placeId">> = [
    {
      businessName: `${capitalize(category)} Corner`,
      address: `123 Main St, ${location}`,
      phone: "+1 555-0101",
      website: null,
      lat: 39.1,
      lng: -84.5,
      rating: 4.2,
      ratingCount: 6,
      businessStatus: "OPERATIONAL",
    },
    {
      businessName: `${capitalize(category)} House`,
      address: `456 Oak Ave, ${location}`,
      phone: "+1 555-0102",
      website: "https://example.com",
      lat: 39.11,
      lng: -84.51,
      rating: 4.7,
      ratingCount: 210,
      businessStatus: "OPERATIONAL",
    },
    {
      businessName: `Downtown ${capitalize(category)}`,
      address: `789 Elm St, ${location}`,
      phone: null,
      website: null,
      lat: 39.12,
      lng: -84.52,
      rating: 3.4,
      ratingCount: 3,
      businessStatus: "OPERATIONAL",
    },
  ];

  return samples.map((s, i) => ({
    ...s,
    placeId: `mock-${hash(seed)}-${i}`,
  }));
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}
