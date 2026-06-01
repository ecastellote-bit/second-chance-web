import { NextResponse } from "next/server";
import { founderProjectSeedErrorResponse } from "@/lib/learning/founderProjectSeedApiErrors";
import {
  canViewFounderProjectSeed,
  getFounderProjectSeedStoreMeta,
  readFounderProjectSeed,
} from "@/lib/learning/founderProjectSeeds";
import { toPublicAuthorIdentity } from "@/lib/public/publicAuthor";
import { findUserProfileById } from "@/lib/users/userProfileStore";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ seedId: string }> };

export async function GET(req: Request, context: RouteContext) {
  try {
    const { seedId } = await context.params;
    const viewerUserId = new URL(req.url).searchParams.get("userId")?.trim() ?? "";

    const seed = await readFounderProjectSeed(seedId);
    if (!seed) {
      return NextResponse.json({ ok: false, error: "seed_not_found" }, { status: 404 });
    }

    if (!canViewFounderProjectSeed(seed, viewerUserId || null)) {
      return NextResponse.json({ ok: false, error: "seed_not_visible" }, { status: 404 });
    }

    // Public view: never expose userId/archiveId/email, even though the record is durable-private.
    if (seed.status === "published") {
      const profile = seed.userId ? await findUserProfileById(seed.userId).catch(() => null) : null;
      const publicAuthor = toPublicAuthorIdentity({ displayName: profile?.displayName ?? null });
      const publicSeed = {
        seedId: seed.seedId,
        title: seed.title,
        summary: seed.summary,
        createdAt: seed.createdAt,
        status: seed.status,
        publishedAt: seed.publishedAt ?? null,
        statusUpdatedAt: seed.statusUpdatedAt ?? null,
        visibilityTier: seed.visibilityTier,
        cohortBatch: seed.cohortBatch,
        publicAuthor,
      };
      return NextResponse.json({
        ok: true,
        seed: publicSeed,
        store: getFounderProjectSeedStoreMeta(),
      });
    }

    return NextResponse.json({
      ok: true,
      seed,
      store: getFounderProjectSeedStoreMeta(),
    });
  } catch (error) {
    return founderProjectSeedErrorResponse(error, "read_failed");
  }
}
