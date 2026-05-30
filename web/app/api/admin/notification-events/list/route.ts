import { NextResponse } from "next/server";
import {
  NotificationEventStoreError,
  getNotificationEventStoreMeta,
  listNotificationEvents,
  type NotificationEventStatus,
  type NotificationEventType,
} from "@/lib/learning/notificationEvents";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<NotificationEventStatus>([
  "pending",
  "sent",
  "failed",
  "skipped",
]);

const VALID_TYPES = new Set<NotificationEventType>([
  "project_published",
  "project_hidden",
  "project_signal_received",
  "project_contribution_visible",
  "circle_idea_visible",
  "admin_post_published",
  "formation_suggestion_reviewed",
]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status")?.trim();
    const typeParam = url.searchParams.get("type")?.trim();
    const userId = url.searchParams.get("userId")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 300), 1000);

    const status =
      statusParam && VALID_STATUSES.has(statusParam as NotificationEventStatus)
        ? (statusParam as NotificationEventStatus)
        : undefined;
    const type =
      typeParam && VALID_TYPES.has(typeParam as NotificationEventType)
        ? (typeParam as NotificationEventType)
        : undefined;

    const events = await listNotificationEvents({
      status,
      type,
      userId: userId || undefined,
      limit,
    });

    return NextResponse.json({
      ok: true,
      total: events.length,
      events,
      store: getNotificationEventStoreMeta(),
    });
  } catch (error) {
    if (error instanceof NotificationEventStoreError) {
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
