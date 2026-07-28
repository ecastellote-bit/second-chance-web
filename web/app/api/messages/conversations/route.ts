import { NextResponse } from "next/server";
import { listConversationsForUser } from "@/lib/messaging/messageStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const userId = new URL(req.url).searchParams.get("userId")?.trim() ?? "";
    if (!userId) {
      return NextResponse.json({ ok: false, error: "user_id_required" }, { status: 400 });
    }

    const result = await listConversationsForUser(userId);

    return NextResponse.json({
      ok: true,
      conversations: result.conversations,
      totalUnread: result.totalUnread,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "conversations_list_failed",
      },
      { status: 500 },
    );
  }
}
