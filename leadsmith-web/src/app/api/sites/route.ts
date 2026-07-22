import { NextRequest, NextResponse } from "next/server";
import { createSite, createSiteFromLead, listSites } from "@/lib/sites";

export async function GET() {
  return NextResponse.json({ sites: listSites() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const leadId = typeof body?.leadId === "string" ? body.leadId : null;

  if (leadId) {
    const site = createSiteFromLead(leadId);
    if (!site) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }
    return NextResponse.json({ site }, { status: 201 });
  }

  const site = createSite({
    businessName: typeof body?.businessName === "string" ? body.businessName : undefined,
  });
  return NextResponse.json({ site }, { status: 201 });
}
