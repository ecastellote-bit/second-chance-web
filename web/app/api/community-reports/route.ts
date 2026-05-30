import { NextResponse } from "next/server";
import { COMMUNITY_REPORT_CONFIRMATION } from "@/lib/community/communityReportCopy";
import {
  CommunityReportStoreError,
  createCommunityReport,
  getCommunityReportStoreMeta,
  type CommunityReportReason,
  type CommunityReportTargetType,
} from "@/lib/learning/communityReports";

export const dynamic = "force-dynamic";

const VALID_TARGETS: CommunityReportTargetType[] = [
  "founder_project",
  "project_guided_contribution",
  "circle",
  "formation_opportunity",
];

const VALID_REASONS: CommunityReportReason[] = [
  "spam",
  "abuse",
  "misleading",
  "privacy",
  "other",
];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      targetType?: string;
      targetId?: string;
      reason?: string;
      details?: string;
    };

    const reporterUserId = typeof body.userId === "string" ? body.userId.trim() : "";
    const targetType = body.targetType as CommunityReportTargetType;
    const targetId = typeof body.targetId === "string" ? body.targetId.trim() : "";
    const reason = body.reason as CommunityReportReason;

    if (
      !reporterUserId ||
      !targetId ||
      !VALID_TARGETS.includes(targetType) ||
      !VALID_REASONS.includes(reason)
    ) {
      return NextResponse.json({ ok: false, error: "invalid_report_payload" }, { status: 400 });
    }

    const report = await createCommunityReport({
      reporterUserId,
      targetType,
      targetId,
      reason,
      details: typeof body.details === "string" ? body.details : undefined,
    });

    return NextResponse.json({
      ok: true,
      reportId: report.reportId,
      confirmation: COMMUNITY_REPORT_CONFIRMATION,
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
      { ok: false, error: error instanceof Error ? error.message : "create_failed" },
      { status: 500 },
    );
  }
}
