import { NextResponse } from "next/server";
import {
  CIRCLE_SIGNAL_CONFIRMATIONS,
  CircleSignalStoreError,
  getCircleSignalStoreMeta,
  listCircleSignals,
  upsertCircleSignal,
  type CircleSignalType,
} from "@/lib/learning/circleSignals";
import {
  checkCommunityActionAllowed,
  communityActionDeniedResponse,
} from "@/lib/users/assertCommunityActionAllowed";

export const dynamic = "force-dynamic";

const SIGNAL_TYPES: CircleSignalType[] = [
  "circle_interest",
  "circle_receive_updates",
  "circle_access_request",
  "circle_idea",
];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const circleId = url.searchParams.get("circleId")?.trim();
    const userId = url.searchParams.get("userId")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);

    if (!circleId || !userId) {
      return NextResponse.json(
        { ok: false, error: "circleId_and_userId_required" },
        { status: 400 },
      );
    }

    const signals = await listCircleSignals({
      circleId,
      actorUserId: userId,
      status: "active",
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      circleId?: string;
      circleTitle?: string;
      signalType?: string;
      note?: string;
    };

    const actorUserId = typeof body.userId === "string" ? body.userId.trim() : "";
    const circleId = typeof body.circleId === "string" ? body.circleId.trim() : "";
    const circleTitle =
      typeof body.circleTitle === "string" && body.circleTitle.trim()
        ? body.circleTitle.trim()
        : circleId;
    const signalType = body.signalType as CircleSignalType;

    if (!actorUserId || !circleId || !SIGNAL_TYPES.includes(signalType)) {
      return NextResponse.json(
        { ok: false, error: "invalid_circle_signal_payload" },
        { status: 400 },
      );
    }

    const access = await checkCommunityActionAllowed(actorUserId);
    if (!access.allowed) {
      return communityActionDeniedResponse(access.error);
    }

    const result = await upsertCircleSignal({
      actorUserId,
      circleId,
      circleTitle,
      signalType,
      note: typeof body.note === "string" ? body.note : undefined,
    });

    return NextResponse.json({
      ok: true,
      signal: result.signal,
      deduped: result.deduped,
      updated: result.updated,
      confirmation: CIRCLE_SIGNAL_CONFIRMATIONS[signalType],
      store: getCircleSignalStoreMeta(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "circle_idea_note_required") {
      return NextResponse.json(
        { ok: false, error: "circle_idea_note_required" },
        { status: 400 },
      );
    }

    if (error instanceof CircleSignalStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "upsert_failed" },
      { status: 500 },
    );
  }
}
