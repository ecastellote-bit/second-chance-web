import { NextResponse } from "next/server";
import { markMessagesAsRead } from "@/lib/messaging/messageStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      readerId?: string;
      senderId?: string;
    };

    const readerId = body.readerId?.trim() ?? "";
    const senderId = body.senderId?.trim() ?? "";

    if (!readerId || !senderId) {
      return NextResponse.json(
        { ok: false, error: "message_read_payload_invalid" },
        { status: 400 },
      );
    }

    if (readerId === senderId) {
      return NextResponse.json(
        { ok: false, error: "message_read_invalid" },
        { status: 400 },
      );
    }

    await markMessagesAsRead({ readerId, senderId });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : "message_read_failed";
    const status = code === "message_read_invalid" ? 400 : 500;
    return NextResponse.json({ ok: false, error: code }, { status });
  }
}
