import { NextResponse } from "next/server";
import { appendFounderProjectSeed, listFounderProjectSeeds } from "@/lib/learning/founderProjectSeeds";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const cohortBatch = url.searchParams.get("cohortBatch")?.trim();
  let seeds = await listFounderProjectSeeds(300);

  if (cohortBatch) {
    seeds = seeds.filter((s) => s.cohortBatch === cohortBatch);
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
