import { NextResponse } from "next/server";
import { recordProjectSeeded } from "@/lib/community/communityRecords";
import { founderProjectSeedErrorResponse } from "@/lib/learning/founderProjectSeedApiErrors";
import {
  appendFounderProjectSeed,
  getFounderProjectSeedStoreMeta,
  listFounderProjectSeeds,
  type FounderProjectSeedStatus,
} from "@/lib/learning/founderProjectSeeds";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";
import {
  checkCommunityActionAllowed,
  communityActionDeniedResponse,
} from "@/lib/users/assertCommunityActionAllowed";
import { findUserProfileById } from "@/lib/users/userProfileStore";
import { toPublicAuthorIdentity } from "@/lib/public/publicAuthor";
import { toPublicProjectMedia } from "@/lib/public/projectSeedMedia";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<FounderProjectSeedStatus>([
  "pending_review",
  "published",
  "hidden",
]);

export async function GET(req: Request) {
  try {
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

  // Public listing: privacy-safe records + stable ordering by publish/approval time.
  if (scope !== "admin" && !userId) {
    const publicSeeds = seeds
      .filter((s) => (visibility === "all" ? true : s.status === "published"))
      .slice()
      .sort((a, b) => {
        const ad = a.publishedAt ?? a.statusUpdatedAt ?? a.createdAt;
        const bd = b.publishedAt ?? b.statusUpdatedAt ?? b.createdAt;
        return bd.localeCompare(ad);
      });

    const uniqueUserIds = Array.from(
      new Set(publicSeeds.map((s) => s.userId).filter((x): x is string => Boolean(x?.trim()))),
    );

    const profiles = await Promise.all(
      uniqueUserIds.map(async (id) => [id, await findUserProfileById(id)] as const),
    );
    const byUserId = new Map(profiles);

    const seedsView = publicSeeds.map((seed) => {
      const profile = seed.userId ? byUserId.get(seed.userId) ?? null : null;
      const publicAuthor = toPublicAuthorIdentity({ displayName: profile?.displayName ?? null });
      const media = toPublicProjectMedia(seed.seedId, seed);
      return {
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
        coverImageUrl: media.coverImageUrl,
        coverSrc: media.coverSrc,
        galleryImageUrls: media.galleryImageUrls,
        videoUrl: media.videoUrl,
        videoPosterUrl: media.videoPosterUrl,
      };
    });

    return NextResponse.json({
      ok: true,
      total: seedsView.length,
      seeds: seedsView,
      store: getFounderProjectSeedStoreMeta(),
    });
  }

  return NextResponse.json({
    ok: true,
    total: seeds.length,
    seeds,
    store: getFounderProjectSeedStoreMeta(),
  });
  } catch (error) {
    return founderProjectSeedErrorResponse(error, "list_failed");
  }
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

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    if (!userId) {
      return NextResponse.json({ ok: false, error: "user_id_required" }, { status: 400 });
    }

    const access = await checkCommunityActionAllowed(userId);
    if (!access.allowed) {
      return communityActionDeniedResponse(access.error);
    }

    const record = await appendFounderProjectSeed({
      archiveId: typeof body.archiveId === "string" ? body.archiveId : null,
      userId,
      title,
      summary,
      cohortBatch: body.cohortBatch,
    });

    await recordProjectSeeded({
        userId,
        archiveId: record.archiveId,
        title: record.title,
        seedId: record.seedId,
      }).catch(() => {});

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

    return NextResponse.json({
      ok: true,
      seed: record,
      seedId: record.seedId,
      store: getFounderProjectSeedStoreMeta(),
    });
  } catch (error) {
    return founderProjectSeedErrorResponse(error, "seed_failed");
  }
}
