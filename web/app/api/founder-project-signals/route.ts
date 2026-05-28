import { NextResponse } from "next/server";
import {
  FounderProjectSignalStoreError,
  getFounderProjectSignalStoreMeta,
  listFounderProjectSignals,
} from "@/lib/learning/founderProjectSignals";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId")?.trim();
    const userId = url.searchParams.get("userId")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 100), 500);

    if (!projectId || !userId) {
      return NextResponse.json(
        { ok: false, error: "projectId_and_userId_required" },
        { status: 400 },
      );
    }

    const signals = await listFounderProjectSignals({
      projectId,
      actorUserId: userId,
      status: ["active", "updated", "reviewed", "flagged"],
      limit,
    });

    return NextResponse.json({
      ok: true,
      total: signals.length,
      signals,
      store: getFounderProjectSignalStoreMeta(),
    });
  } catch (error) {
    if (error instanceof FounderProjectSignalStoreError) {
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
