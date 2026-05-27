import { NextResponse } from "next/server";
import {
  readFounderProjectSeed,
  updateFounderProjectSeedStatus,
  type FounderProjectSeedStatus,
} from "@/lib/learning/founderProjectSeeds";

export const runtime = "nodejs";

const VALID_STATUSES = new Set<FounderProjectSeedStatus>([
  "pending_review",
  "published",
  "hidden",
]);

type RouteContext = { params: Promise<{ seedId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { seedId } = await context.params;
    const body = (await req.json()) as { status?: string };
    const status = typeof body.status === "string" ? body.status.trim() : "";

    if (!VALID_STATUSES.has(status as FounderProjectSeedStatus)) {
      return NextResponse.json(
        { ok: false, error: "invalid_status" },
        { status: 400 },
      );
    }

    const existing = await readFounderProjectSeed(seedId);
    if (!existing) {
      return NextResponse.json({ ok: false, error: "seed_not_found" }, { status: 404 });
    }

    const seed = await updateFounderProjectSeedStatus(
      seedId,
      status as FounderProjectSeedStatus,
    );

    if (!seed) {
      return NextResponse.json({ ok: false, error: "update_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, seed });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "update_failed",
      },
      { status: 500 },
    );
  }
}
