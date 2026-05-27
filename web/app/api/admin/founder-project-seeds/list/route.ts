import { NextResponse } from "next/server";
import {
  getFounderProjectSeedStoreStatus,
  listFounderProjectSeeds,
  type FounderProjectSeedStatus,
} from "@/lib/learning/founderProjectSeeds";

export const runtime = "nodejs";

const VALID_STATUSES = new Set<FounderProjectSeedStatus>([
  "pending_review",
  "published",
  "hidden",
]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status")?.trim();
    const cohortBatch = url.searchParams.get("cohortBatch")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 100), 300);

    const status =
      statusParam && VALID_STATUSES.has(statusParam as FounderProjectSeedStatus)
        ? (statusParam as FounderProjectSeedStatus)
        : undefined;

    const seeds = await listFounderProjectSeeds({
      limit,
      cohortBatch: cohortBatch || undefined,
      status,
    });

    const store = await getFounderProjectSeedStoreStatus();

    return NextResponse.json({
      ok: true,
      total: seeds.length,
      seeds,
      store,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "list_failed",
      },
      { status: 500 },
    );
  }
}
