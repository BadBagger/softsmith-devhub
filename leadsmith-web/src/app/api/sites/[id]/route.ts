import { NextRequest, NextResponse } from "next/server";
import { deleteSite, getSite, updateSite, SiteInput } from "@/lib/sites";
import { SiteService } from "@/lib/site-types";

function parseServicesInput(value: unknown): SiteService[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
    .map((s) => ({
      name: typeof s.name === "string" ? s.name : "",
      description: typeof s.description === "string" ? s.description : "",
    }));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const site = getSite(id);
  if (!site) {
    return NextResponse.json({ error: "Site not found." }, { status: 404 });
  }
  return NextResponse.json({ site });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input: SiteInput = {
    template: body.template,
    businessName: typeof body.businessName === "string" ? body.businessName : undefined,
    tagline: typeof body.tagline === "string" ? body.tagline : undefined,
    about: typeof body.about === "string" ? body.about : undefined,
    services: parseServicesInput(body.services),
    phone: body.phone === null ? null : typeof body.phone === "string" ? body.phone : undefined,
    email: body.email === null ? null : typeof body.email === "string" ? body.email : undefined,
    address:
      body.address === null ? null : typeof body.address === "string" ? body.address : undefined,
    accentColor: typeof body.accentColor === "string" ? body.accentColor : undefined,
  };

  const site = updateSite(id, input);
  if (!site) {
    return NextResponse.json({ error: "Site not found." }, { status: 404 });
  }
  return NextResponse.json({ site });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ok = deleteSite(id);
  if (!ok) {
    return NextResponse.json({ error: "Site not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
