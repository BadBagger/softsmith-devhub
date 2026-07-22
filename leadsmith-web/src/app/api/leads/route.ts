import { NextRequest, NextResponse } from "next/server";
import { listLeads, saveLead } from "@/lib/leads";
import { LeadCandidate } from "@/lib/leads";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  return NextResponse.json({ leads: listLeads(status) });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const candidate: LeadCandidate | undefined = body?.candidate;
  const category = typeof body?.category === "string" ? body.category : "";
  const location = typeof body?.location === "string" ? body.location : "";

  if (!candidate?.placeId || !candidate?.businessName) {
    return NextResponse.json({ error: "A valid lead candidate is required." }, { status: 400 });
  }

  const lead = saveLead(candidate, category, location);
  return NextResponse.json({ lead }, { status: 201 });
}
