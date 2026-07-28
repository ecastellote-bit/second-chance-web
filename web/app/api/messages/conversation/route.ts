import { NextResponse } from "next/server";
import { getConversationMessages } from "@/lib/messaging/messageStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseOptionalInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.trunc(parsed);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId")?.trim() ?? "";
    const otherUserId = url.searchParams.get("otherUserId")?.trim() ?? "";
    const limit = parseOptionalInt(url.searchParams.get("limit"), 50);
    const offset = parseOptionalInt(url.searchParams.get("offset"), 0);

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { ok: false, error: "conversation_participants_required" },
        { status: 400 },
      );
    }

    if (userId === otherUserId) {
      return NextResponse.json(
        { ok: false, error: "conversation_self_not_allowed" },
        { status: 400 },
      );
    }

    const result = await getConversationMessages({
      userId,
      otherUserId,
      limit,
      offset,
    });

    return NextResponse.json({
      ok: true,
      messages: result.messages,
      total: result.total,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "conversation_messages_failed",
      },
      { status: 500 },
    );
  }
}
