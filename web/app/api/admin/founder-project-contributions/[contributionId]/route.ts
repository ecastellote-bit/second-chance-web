import { NextResponse } from "next/server";
import {
  GuidedContributionStoreError,
  updateFounderProjectGuidedContributionStatus,
  type FounderProjectGuidedContributionStatus,
} from "@/lib/learning/founderProjectGuidedContributions";
import { notifyContributionVisible } from "@/lib/learning/notificationEventIntegrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<FounderProjectGuidedContributionStatus>([
  "visible",
  "hidden",
  "flagged",
  "archived",
]);

type RouteContext = { params: Promise<{ contributionId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { contributionId } = await context.params;
    const body = (await req.json()) as { status?: string };
    const status = typeof body.status === "string" ? body.status.trim() : "";

    if (!VALID_STATUSES.has(status as FounderProjectGuidedContributionStatus)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    }

    const updated = await updateFounderProjectGuidedContributionStatus(
      contributionId,
      status as FounderProjectGuidedContributionStatus,
    );
    if (!updated) {
      return NextResponse.json({ ok: false, error: "contribution_not_found" }, { status: 404 });
    }

    if (status === "visible") {
      void notifyContributionVisible({
        contributionId: updated.contributionId,
        projectId: updated.projectId,
        actorUserId: updated.actorUserId,
      });
    }

    return NextResponse.json({ ok: true, contribution: updated });
  } catch (error) {
    if (error instanceof GuidedContributionStoreError) {
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
