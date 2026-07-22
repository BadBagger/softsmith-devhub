import { NextRequest, NextResponse } from "next/server";
import { candidatesFromPlaces } from "@/lib/leads";
import { PlacesConfigError, searchPlaces } from "@/lib/places";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const location = typeof body?.location === "string" ? body.location.trim() : "";

  if (!category || !location) {
    return NextResponse.json(
      { error: "Both 'category' and 'location' are required." },
      { status: 400 },
    );
  }

  try {
    const places = await searchPlaces(category, location);
    const candidates = candidatesFromPlaces(places);
    return NextResponse.json({ candidates, category, location });
  } catch (err) {
    if (err instanceof PlacesConfigError) {
      return NextResponse.json({ error: err.message }, { status: 412 });
    }
    const message = err instanceof Error ? err.message : "Unknown error searching Places.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
