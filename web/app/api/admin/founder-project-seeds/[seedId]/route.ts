import { NextResponse } from "next/server";
import { founderProjectSeedErrorResponse } from "@/lib/learning/founderProjectSeedApiErrors";
import {
  getFounderProjectSeedStoreMeta,
  readFounderProjectSeed,
  updateFounderProjectSeedMedia,
  updateFounderProjectSeedStatus,
  type FounderProjectSeedStatus,
} from "@/lib/learning/founderProjectSeeds";
import { sanitizeProjectMediaUrl } from "@/lib/public/projectSeedMedia";
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

function parseGalleryInput(value: unknown): string[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === "string");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    return trimmed
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { seedId } = await context.params;
    const body = (await req.json()) as {
      status?: string;
      coverImageUrl?: string | null;
      galleryImageUrls?: string[] | string | null;
      videoUrl?: string | null;
      videoPosterUrl?: string | null;
    };

    const existing = await readFounderProjectSeed(seedId);
    if (!existing) {
      return NextResponse.json({ ok: false, error: "seed_not_found" }, { status: 404 });
    }

    const statusRaw = typeof body.status === "string" ? body.status.trim() : "";
    const hasStatus = Boolean(statusRaw);
    const hasMedia =
      body.coverImageUrl !== undefined ||
      body.galleryImageUrls !== undefined ||
      body.videoUrl !== undefined ||
      body.videoPosterUrl !== undefined;

    if (!hasStatus && !hasMedia) {
      return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 400 });
    }

    let seed = existing;

    if (hasStatus) {
      if (!VALID_STATUSES.has(statusRaw as FounderProjectSeedStatus)) {
        return NextResponse.json(
          { ok: false, error: "invalid_status" },
          { status: 400 },
        );
      }

      const updated = await updateFounderProjectSeedStatus(
        seedId,
        statusRaw as FounderProjectSeedStatus,
      );
      if (!updated) {
        return NextResponse.json({ ok: false, error: "update_failed" }, { status: 500 });
      }
      seed = updated;

      if (existing.status !== seed.status) {
        if (seed.status === "published") {
          void notifyProjectPublished(seed);
        } else if (seed.status === "hidden") {
          void notifyProjectHidden(seed);
        }
      }
    }

    if (hasMedia) {
      const galleryParsed = parseGalleryInput(body.galleryImageUrls);
      const mediaPatch = {
        coverImageUrl:
          body.coverImageUrl !== undefined
            ? sanitizeProjectMediaUrl(
                body.coverImageUrl === null ? null : String(body.coverImageUrl),
              )
            : undefined,
        galleryImageUrls:
          galleryParsed !== undefined
            ? (galleryParsed ?? []).map((u) => sanitizeProjectMediaUrl(u)).filter((u): u is string => Boolean(u))
            : undefined,
        videoUrl:
          body.videoUrl !== undefined
            ? sanitizeProjectMediaUrl(body.videoUrl === null ? null : String(body.videoUrl))
            : undefined,
        videoPosterUrl:
          body.videoPosterUrl !== undefined
            ? sanitizeProjectMediaUrl(
                body.videoPosterUrl === null ? null : String(body.videoPosterUrl),
              )
            : undefined,
      };

      const updatedMedia = await updateFounderProjectSeedMedia(seedId, mediaPatch);
      if (!updatedMedia) {
        return NextResponse.json({ ok: false, error: "update_failed" }, { status: 500 });
      }
      seed = updatedMedia;
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
