import { NextResponse } from "next/server";
import {
  CircleSignalStoreError,
  type CircleSignalStatus,
  type CircleSignalType,
  getCircleSignalStoreMeta,
  listCircleSignals,
} from "@/lib/learning/circleSignals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<CircleSignalStatus>([
  "active",
  "reviewed",
  "flagged",
  "archived",
  "approved",
]);

const VALID_TYPES = new Set<CircleSignalType>([
  "circle_interest",
  "circle_receive_updates",
  "circle_access_request",
  "circle_idea",
]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const circleId = url.searchParams.get("circleId")?.trim() || undefined;
    const actorUserId = url.searchParams.get("actorUserId")?.trim() || undefined;
    const statusParam = url.searchParams.get("status")?.trim();
    const typeParam = url.searchParams.get("signalType")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 300), 2000);

    const status =
      statusParam && VALID_STATUSES.has(statusParam as CircleSignalStatus)
        ? (statusParam as CircleSignalStatus)
        : undefined;
    const signalType =
      typeParam && VALID_TYPES.has(typeParam as CircleSignalType)
        ? (typeParam as CircleSignalType)
        : undefined;

    const signals = await listCircleSignals({
      circleId,
      actorUserId,
      status,
      signalType,
      limit,
    });

    return NextResponse.json({
      ok: true,
      total: signals.length,
      signals,
      store: getCircleSignalStoreMeta(),
    });
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
