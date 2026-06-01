import { NextResponse } from "next/server";
import { getPublicCommunityRecentActivity } from "@/lib/community/publicCommunityRecentActivity";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 10), 1), 20);
    const surfaceParam = url.searchParams.get("surface")?.trim();
    const allowed = new Set([
      "barrio",
      "projects",
      "circles",
      "formation",
      "events",
      "connection",
    ]);
    const surface =
      surfaceParam && allowed.has(surfaceParam)
        ? (surfaceParam as
            | "barrio"
            | "projects"
            | "circles"
            | "formation"
            | "events"
            | "connection")
        : ("barrio" as const);
    const activity = await getPublicCommunityRecentActivity({ limit, surface });
    return NextResponse.json({ ok: true, ...activity });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "public_activity_failed",
      },
      { status: 500 },
    );
  }
}
