import { NextRequest, NextResponse } from "next/server";
import { deleteLead, updateLeadStatus } from "@/lib/leads";
import { LEAD_STATUSES, LeadStatus } from "@/lib/lead-types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status as LeadStatus | undefined;

  if (!status || !LEAD_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${LEAD_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const lead = updateLeadStatus(id, status);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }
  return NextResponse.json({ lead });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ok = deleteLead(id);
  if (!ok) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
