import { NextResponse } from "next/server";
import { founderProjectSeedErrorResponse } from "@/lib/learning/founderProjectSeedApiErrors";
import {
  getFounderProjectSeedStoreMeta,
  readFounderProjectSeed,
  updateFounderProjectSeedStatus,
  type FounderProjectSeedStatus,
} from "@/lib/learning/founderProjectSeeds";
import {
  notifyProjectHidden,
  notifyProjectPublished,
} from "@/lib/learning/notificationEventIntegrations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    if (existing.status !== seed.status) {
      if (seed.status === "published") {
        void notifyProjectPublished(seed);
      } else if (seed.status === "hidden") {
        void notifyProjectHidden(seed);
      }
    }

    return NextResponse.json({
      ok: true,
      seed,
      store: getFounderProjectSeedStoreMeta(),
    });
  } catch (error) {
    return founderProjectSeedErrorResponse(error, "update_failed");
  }
}
