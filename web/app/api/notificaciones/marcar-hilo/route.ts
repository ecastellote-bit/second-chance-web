import { NextResponse } from "next/server";
import { markThreadNotificationsRead } from "@/lib/in-app-notifications/inAppNotificationStore";
import {
  mapInAppError,
  missingUserIdResponse,
  requireUserId,
} from "@/lib/in-app-notifications/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Marca leídas las notifs de un hilo de mensajes al abrir la conversación. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { userId?: string; threadId?: string };
    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();
    const threadId = body.threadId?.trim();
    if (!threadId) {
      return NextResponse.json({ ok: false, error: "thread_id_required" }, { status: 400 });
    }

    const updatedCount = await markThreadNotificationsRead({ userId, threadId });
    return NextResponse.json({ ok: true, updatedCount });
  } catch (error) {
    return mapInAppError(error);
  }
}
