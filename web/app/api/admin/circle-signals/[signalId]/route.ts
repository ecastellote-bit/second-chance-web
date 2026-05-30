import { NextResponse } from "next/server";
import {
  CircleSignalStoreError,
  type CircleSignalStatus,
  updateCircleSignalStatus,
} from "@/lib/learning/circleSignals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<CircleSignalStatus>(["reviewed", "flagged", "archived"]);

type RouteContext = { params: Promise<{ signalId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { signalId } = await context.params;
    const body = (await req.json()) as { status?: string };
    const status = typeof body.status === "string" ? body.status.trim() : "";

    if (!VALID_STATUSES.has(status as CircleSignalStatus)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    }

    const updated = await updateCircleSignalStatus(signalId, status as CircleSignalStatus);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "signal_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, signal: updated });
  } catch (error) {
    if (error instanceof CircleSignalStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "update_failed" },
      { status: 500 },
    );
  }
}
