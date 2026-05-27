import { NextResponse } from "next/server";
import {
  FounderCaseDraftStoreError,
  getFounderCaseDraftStoreStatus,
  listFounderCaseDraftSummaries,
} from "@/lib/learning/founderCaseDraftStore";
import type { FounderCaseDraftStatus } from "@/lib/learning/founderCaseDraftTypes";

export const runtime = "nodejs";

const VALID_STATUSES = new Set<FounderCaseDraftStatus>([
  "draft_started",
  "draft_updated",
  "submitted_before_analysis",
  "analysis_started",
  "analysis_failed",
  "analysis_succeeded_pending_archive",
  "archived",
  "archived_minimal",
]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status")?.trim();
    const reviewParam = url.searchParams.get("humanReviewRequested");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 80), 200);

    const status =
      statusParam && VALID_STATUSES.has(statusParam as FounderCaseDraftStatus)
        ? (statusParam as FounderCaseDraftStatus)
        : undefined;

    let humanReviewRequested: boolean | undefined;
    if (reviewParam === "true" || reviewParam === "1") humanReviewRequested = true;
    if (reviewParam === "false" || reviewParam === "0") humanReviewRequested = false;

    const drafts = await listFounderCaseDraftSummaries({
      limit,
      status,
      humanReviewRequested,
    });

    return NextResponse.json({
      ok: true,
      total: drafts.length,
      drafts,
      store: getFounderCaseDraftStoreStatus(),
    });
  } catch (error) {
    if (error instanceof FounderCaseDraftStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "list_failed" },
      { status: 500 },
    );
  }
}
