import { NextResponse } from "next/server";
import { normalizeSlug } from "@/lib/users/slugUtils";
import { findUserProfileBySlug } from "@/lib/users/userProfileStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const slug = normalizeSlug(new URL(req.url).searchParams.get("slug") ?? "");
    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug_required" }, { status: 400 });
    }

    const profile = await findUserProfileBySlug(slug);
    if (!profile) {
      return NextResponse.json({ ok: false, error: "profile_not_found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      userId: profile.userId,
      displayName: profile.displayName.trim(),
      avatarUrl: profile.avatarUrl?.trim() || null,
      slug: profile.slug?.trim() ?? slug,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "profile_lookup_failed",
      },
      { status: 500 },
    );
  }
}
