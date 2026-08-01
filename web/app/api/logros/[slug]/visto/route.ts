import { NextResponse } from "next/server";
import {
  mapBadgeError,
  missingUserIdResponse,
  requireUserId,
} from "@/lib/badges-store/apiHelpers";
import { findBadgeBySlug } from "@/lib/badges-store/badges-config";
import { markAsSeen } from "@/lib/badges-store/userBadgeStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const body = (await req.json()) as { userId?: string };
    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    if (!findBadgeBySlug(slug)) {
      return NextResponse.json({ ok: false, error: "badge_not_found" }, { status: 404 });
    }

    await markAsSeen({ userId, badgeSlug: slug });
    return NextResponse.json({ ok: true, success: true });
  } catch (error) {
    return mapBadgeError(error);
  }
}
