import { NextResponse } from "next/server";
import { softDeleteNotification } from "@/lib/in-app-notifications/inAppNotificationStore";
import {
  mapInAppError,
  missingUserIdResponse,
  requireUserId,
} from "@/lib/in-app-notifications/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as { userId?: string };
    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    await softDeleteNotification({ userId, notificationId: id });
    return NextResponse.json({ ok: true, success: true });
  } catch (error) {
    return mapInAppError(error);
  }
}
