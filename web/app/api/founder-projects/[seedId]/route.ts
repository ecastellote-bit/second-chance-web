import { NextResponse } from "next/server";
import {
  canViewFounderProjectSeed,
  readFounderProjectSeed,
} from "@/lib/learning/founderProjectSeeds";

type RouteContext = { params: Promise<{ seedId: string }> };

export async function GET(req: Request, context: RouteContext) {
  const { seedId } = await context.params;
  const viewerUserId = new URL(req.url).searchParams.get("userId")?.trim() ?? "";

  const seed = await readFounderProjectSeed(seedId);
  if (!seed) {
    return NextResponse.json({ ok: false, error: "seed_not_found" }, { status: 404 });
  }

  if (!canViewFounderProjectSeed(seed, viewerUserId || null)) {
    return NextResponse.json({ ok: false, error: "seed_not_visible" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, seed });
}
