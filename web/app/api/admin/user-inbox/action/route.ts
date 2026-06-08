import { NextResponse } from "next/server";
import {
  applyUserInboxAdminAction,
  FounderExitFeedbackStoreError,
  parseUserInboxActionBody,
  SurfaceInterestLeadStoreError,
} from "@/lib/admin/userInboxActions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: { kind?: string; itemId?: string; adminStatus?: string };
    try {
      body = (await req.json()) as typeof body;
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const parsed = parseUserInboxActionBody(body);
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const result = await applyUserInboxAdminAction(parsed);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      kind: result.kind,
      itemId: result.itemId,
      adminStatus: result.adminStatus,
    });
  } catch (error) {
    if (
      error instanceof SurfaceInterestLeadStoreError ||
      error instanceof FounderExitFeedbackStoreError
    ) {
      return NextResponse.json(
        { ok: false, error: error.code },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json({ ok: false, error: "action_failed" }, { status: 500 });
  }
}
