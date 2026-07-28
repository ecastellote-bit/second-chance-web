import { NextResponse } from "next/server";
import { sendMessage } from "@/lib/messaging/messageStore";
import { validateMessageContent } from "@/lib/messaging/messageTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorStatus(code: string): number {
  if (
    code === "message_content_empty" ||
    code === "message_content_too_long" ||
    code === "message_participants_required" ||
    code === "message_self_not_allowed" ||
    code === "message_profile_not_found"
  ) {
    return 400;
  }
  return 500;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      senderId?: string;
      recipientId?: string;
      content?: string;
    };

    const senderId = body.senderId?.trim() ?? "";
    const recipientId = body.recipientId?.trim() ?? "";
    const content = body.content ?? "";

    if (!senderId || !recipientId || !content.trim()) {
      return NextResponse.json(
        { ok: false, error: "message_payload_invalid" },
        { status: 400 },
      );
    }

    validateMessageContent(content);

    const message = await sendMessage({ senderId, recipientId, content });

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    const code = error instanceof Error ? error.message : "message_send_failed";
    return NextResponse.json({ ok: false, error: code }, { status: errorStatus(code) });
  }
}
