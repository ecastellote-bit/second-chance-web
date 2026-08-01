import { NextResponse } from "next/server";
import { markAllAsRead } from "@/lib/in-app-notifications/inAppNotificationStore";
import {
  mapInAppError,
  missingUserIdResponse,
  requireUserId,
} from "@/lib/in-app-notifications/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as { userId?: string };
    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    const updatedCount = await markAllAsRead(userId);
    return NextResponse.json({ ok: true, success: true, updatedCount });
  } catch (error) {
    return mapInAppError(error);
  }
}
