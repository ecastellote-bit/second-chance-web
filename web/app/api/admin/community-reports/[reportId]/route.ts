import { NextResponse } from "next/server";
import {
  CommunityReportStoreError,
  updateCommunityReportStatus,
  type CommunityReportStatus,
} from "@/lib/learning/communityReports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<CommunityReportStatus>([
  "reviewed",
  "dismissed",
  "action_taken",
]);

type RouteContext = { params: Promise<{ reportId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { reportId } = await context.params;
    const body = (await req.json()) as { status?: string };
    const status = typeof body.status === "string" ? body.status.trim() : "";

    if (!VALID_STATUSES.has(status as CommunityReportStatus)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    }

    const updated = await updateCommunityReportStatus(
      reportId,
      status as CommunityReportStatus,
    );
    if (!updated) {
      return NextResponse.json({ ok: false, error: "report_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, report: updated });
  } catch (error) {
    if (error instanceof CommunityReportStoreError) {
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
