import { NextResponse } from "next/server";
import { listByUser } from "@/lib/in-app-notifications/inAppNotificationStore";
import {
  mapInAppError,
  missingUserIdResponse,
  requireUserId,
} from "@/lib/in-app-notifications/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = requireUserId(url.searchParams.get("userId"));
    if (!userId) return missingUserIdResponse();

    const limit = Number(url.searchParams.get("limit") ?? "20");
    const cursor = url.searchParams.get("cursor");

    const result = await listByUser({
      userId,
      limit: Number.isFinite(limit) ? limit : 20,
      cursor,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return mapInAppError(error);
  }
}
