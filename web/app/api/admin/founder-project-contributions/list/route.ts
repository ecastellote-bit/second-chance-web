import { NextResponse } from "next/server";
import {
  GuidedContributionStoreError,
  getGuidedContributionStoreMeta,
  listFounderProjectGuidedContributions,
  type FounderProjectGuidedContributionKind,
  type FounderProjectGuidedContributionStatus,
} from "@/lib/learning/founderProjectGuidedContributions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<FounderProjectGuidedContributionStatus>([
  "pending_review",
  "visible",
  "hidden",
  "flagged",
  "archived",
]);

const VALID_KINDS = new Set<FounderProjectGuidedContributionKind>([
  "valuable_part",
  "first_step",
  "risk",
  "possible_contribution",
  "similar_reference",
]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId")?.trim() || undefined;
    const statusParam = url.searchParams.get("status")?.trim();
    const kindParam = url.searchParams.get("kind")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 300), 2000);

    const status =
      statusParam && VALID_STATUSES.has(statusParam as FounderProjectGuidedContributionStatus)
        ? (statusParam as FounderProjectGuidedContributionStatus)
        : undefined;
    const kind =
      kindParam && VALID_KINDS.has(kindParam as FounderProjectGuidedContributionKind)
        ? (kindParam as FounderProjectGuidedContributionKind)
        : undefined;

    const contributions = await listFounderProjectGuidedContributions({
      projectId,
      status,
      kind,
      limit,
    });

    return NextResponse.json({
      ok: true,
      total: contributions.length,
      contributions,
      store: getGuidedContributionStoreMeta(),
    });
  } catch (error) {
    if (error instanceof GuidedContributionStoreError) {
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
