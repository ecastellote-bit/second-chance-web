import { NextResponse } from "next/server";
import {
  CommunityReportStoreError,
  getCommunityReportStoreMeta,
  listCommunityReports,
  type CommunityReportStatus,
  type CommunityReportTargetType,
} from "@/lib/learning/communityReports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<CommunityReportStatus>([
  "new",
  "reviewed",
  "dismissed",
  "action_taken",
]);

const VALID_TARGETS = new Set<CommunityReportTargetType>([
  "founder_project",
  "project_guided_contribution",
  "circle",
  "formation_opportunity",
]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status")?.trim();
    const targetTypeParam = url.searchParams.get("targetType")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 300), 2000);

    const status =
      statusParam && VALID_STATUSES.has(statusParam as CommunityReportStatus)
        ? (statusParam as CommunityReportStatus)
        : undefined;
    const targetType =
      targetTypeParam && VALID_TARGETS.has(targetTypeParam as CommunityReportTargetType)
        ? (targetTypeParam as CommunityReportTargetType)
        : undefined;

    const reports = await listCommunityReports({ status, targetType, limit });

    return NextResponse.json({
      ok: true,
      total: reports.length,
      reports,
      store: getCommunityReportStoreMeta(),
    });
  } catch (error) {
    if (error instanceof CommunityReportStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "list_failed" },
      { status: 500 },
    );
  }
}
