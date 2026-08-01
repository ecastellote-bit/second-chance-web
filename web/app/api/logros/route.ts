import { NextResponse } from "next/server";
import { BADGES_CONFIG } from "@/lib/badges-store/badges-config";
import {
  mapBadgeError,
  missingUserIdResponse,
  requireUserId,
} from "@/lib/badges-store/apiHelpers";
import { listByUser } from "@/lib/badges-store/userBadgeStore";
import type { BadgeView } from "@/lib/badges-store/userBadgeTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = requireUserId(url.searchParams.get("userId"));
    if (!userId) return missingUserIdResponse();

    const earned = await listByUser(userId);
    const bySlug = new Map(earned.map((b) => [b.badgeSlug, b]));

    const badges: BadgeView[] = BADGES_CONFIG.map((config) => {
      const record = bySlug.get(config.slug);
      return {
        slug: config.slug,
        name: config.name,
        description: config.description,
        icon: config.icon,
        earned: Boolean(record),
        earnedAt: record?.earnedAt ?? null,
        seen: record?.seen === true,
      };
    });

    return NextResponse.json({
      ok: true,
      badges,
      earnedCount: badges.filter((b) => b.earned).length,
      total: BADGES_CONFIG.length,
    });
  } catch (error) {
    return mapBadgeError(error);
  }
}
