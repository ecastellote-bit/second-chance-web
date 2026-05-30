import { NextResponse } from "next/server";
import {
  NotificationEventStoreError,
  updateNotificationEventStatus,
  type NotificationEventStatus,
} from "@/lib/learning/notificationEvents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<NotificationEventStatus>([
  "pending",
  "sent",
  "failed",
  "skipped",
]);

type RouteContext = { params: Promise<{ notificationId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { notificationId } = await context.params;
    const body = (await req.json()) as { status?: string; error?: string | null };
    const status = typeof body.status === "string" ? body.status.trim() : "";

    if (!VALID_STATUSES.has(status as NotificationEventStatus)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    }

    const updated = await updateNotificationEventStatus(
      notificationId,
      status as NotificationEventStatus,
      { error: body.error },
    );
    if (!updated) {
      return NextResponse.json({ ok: false, error: "notification_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, event: updated });
  } catch (error) {
    if (error instanceof NotificationEventStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "update_failed" },
      { status: 500 },
    );
  }
}
