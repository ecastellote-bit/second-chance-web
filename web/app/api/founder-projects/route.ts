import { NextResponse } from "next/server";
import { recordProjectSeeded } from "@/lib/community/communityRecords";
import {
  appendFounderProjectSeed,
  listFounderProjectSeeds,
  type FounderProjectSeedStatus,
} from "@/lib/learning/founderProjectSeeds";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";

const VALID_STATUSES = new Set<FounderProjectSeedStatus>([
  "pending_review",
  "published",
  "hidden",
]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cohortBatch = url.searchParams.get("cohortBatch")?.trim();
  const userId = url.searchParams.get("userId")?.trim();
  const scope = url.searchParams.get("scope")?.trim();
  const visibility = url.searchParams.get("visibility")?.trim();
  const statusParam = url.searchParams.get("status")?.trim();
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 300), 500);

  const status =
    statusParam && VALID_STATUSES.has(statusParam as FounderProjectSeedStatus)
      ? (statusParam as FounderProjectSeedStatus)
      : undefined;

  let seeds;

  if (scope === "admin") {
    seeds = await listFounderProjectSeeds({
      limit,
      cohortBatch: cohortBatch || undefined,
      userId: userId || undefined,
      status,
    });
  } else if (userId) {
    seeds = await listFounderProjectSeeds({
      limit,
      cohortBatch: cohortBatch || undefined,
      userId,
      status,
    });
  } else {
    seeds = await listFounderProjectSeeds({
      limit,
      cohortBatch: cohortBatch || undefined,
      visibility: visibility === "all" ? undefined : "public",
      status,
    });
  }

  return NextResponse.json({ ok: true, total: seeds.length, seeds });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      archiveId?: string;
      userId?: string;
      title?: string;
      summary?: string;
      cohortBatch?: string;
    };

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const summary = typeof body.summary === "string" ? body.summary.trim() : "";

    if (title.length < 3 || summary.length < 20) {
      return NextResponse.json(
        { ok: false, error: "title_and_summary_required" },
        { status: 400 },
      );
    }

    const record = await appendFounderProjectSeed({
      archiveId: typeof body.archiveId === "string" ? body.archiveId : null,
      userId: typeof body.userId === "string" ? body.userId : null,
      title,
      summary,
      cohortBatch: body.cohortBatch,
    });

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (userId) {
      await recordProjectSeeded({
        userId,
        archiveId: record.archiveId,
        title: record.title,
        seedId: record.seedId,
      }).catch(() => {});
    }

    await appendObservatoryEvent(
      buildObservatoryEvent({
        type: "funnel.barrio_commitment",
        scenario: "founder",
        payload: {
          seedId: record.seedId,
          archiveId: record.archiveId,
          cohortBatch: record.cohortBatch,
          title: record.title,
        },
      }),
    ).catch(() => {});

    return NextResponse.json({ ok: true, seed: record });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "seed_failed",
      },
      { status: 500 },
    );
  }
}
