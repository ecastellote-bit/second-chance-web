import { NextResponse } from "next/server";
import {
  CircleSignalStoreError,
  listCirclePublicVisibleIdeas,
} from "@/lib/learning/circleSignals";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const circleId = url.searchParams.get("circleId")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 30);

    const ideas = await listCirclePublicVisibleIdeas({
      circleId: circleId || undefined,
      limit,
    });

    return NextResponse.json({ ok: true, ideas, total: ideas.length });
  } catch (error) {
    if (error instanceof CircleSignalStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "list_failed" },
      { status: 500 },
    );
  }
}
