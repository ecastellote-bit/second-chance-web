import { NextResponse } from "next/server";
import {
  createSurfaceInterestLead,
  type SurfaceIntentType,
  SurfaceInterestLeadStoreError,
} from "@/lib/learning/surfaceInterestLeads";
import {
  SURFACE_INTEREST_BODY_MAX_BYTES,
  SURFACE_INTEREST_TEXT_MAX,
  SURFACE_INTEREST_TEXT_MIN,
} from "@/lib/community/surfaceInterestLimits";
import { normalizeCommunityEmail } from "@/lib/users/userProfileTypes";

export const dynamic = "force-dynamic";

const VALID_SURFACES = new Set<SurfaceIntentType>([
  "formacion",
  "proyectos",
  "circulos",
  "eventos",
  "conexiones",
  "oportunidades",
]);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    if (rawBody.length > SURFACE_INTEREST_BODY_MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }

    let body: {
      surfaceType?: string;
      text?: string;
      email?: string;
      sessionId?: string;
      path?: string;
      actionMode?: string;
    };
    try {
      body = JSON.parse(rawBody) as typeof body;
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const surfaceType = body.surfaceType?.trim() as SurfaceIntentType;
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const email = normalizeCommunityEmail(body.email);

    if (!surfaceType || !VALID_SURFACES.has(surfaceType)) {
      return NextResponse.json({ ok: false, error: "invalid_surface_type" }, { status: 400 });
    }
    if (text.length < SURFACE_INTEREST_TEXT_MIN) {
      return NextResponse.json({ ok: false, error: "text_too_short" }, { status: 400 });
    }
    if (text.length > SURFACE_INTEREST_TEXT_MAX) {
      return NextResponse.json({ ok: false, error: "text_too_long" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ ok: false, error: "email_invalid" }, { status: 400 });
    }

    const lead = await createSurfaceInterestLead({
      surfaceType,
      text,
      email,
      sessionId: typeof body.sessionId === "string" ? body.sessionId.trim().slice(0, 64) : null,
      path: typeof body.path === "string" ? body.path.trim().slice(0, 120) : null,
      actionMode:
        typeof body.actionMode === "string" ? body.actionMode.trim().slice(0, 40) : null,
    });

    return NextResponse.json({ ok: true, leadId: lead.leadId });
  } catch (error) {
    if (error instanceof SurfaceInterestLeadStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json({ ok: false, error: "create_failed" }, { status: 500 });
  }
}
