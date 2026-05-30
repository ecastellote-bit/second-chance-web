import { NextResponse } from "next/server";
import {
  appendCommunityActivity,
  listCommunityActivities,
} from "@/lib/community/communityStore";
import type {
  CommunityActivitySource,
  CommunityActivityStatus,
  CommunityActivityType,
} from "@/lib/community/types";
import {
  checkCommunityActionAllowed,
  communityActionDeniedResponse,
} from "@/lib/users/assertCommunityActionAllowed";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId")?.trim() ?? "";
  if (!userId) {
    return NextResponse.json({ ok: false, error: "user_id_required" }, { status: 400 });
  }

  const activities = await listCommunityActivities(userId, 200);
  return NextResponse.json({ ok: true, activities });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      archiveId?: string | null;
      type?: CommunityActivityType;
      title?: string;
      body?: string;
      ctaLabel?: string;
      ctaHref?: string;
      source?: CommunityActivitySource;
      status?: CommunityActivityStatus;
      dedupeKey?: string;
      meta?: Record<string, string | null>;
    };

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const text = typeof body.body === "string" ? body.body.trim() : "";

    if (!userId || !body.type || !title || !text) {
      return NextResponse.json(
        { ok: false, error: "invalid_activity_payload" },
        { status: 400 },
      );
    }

    const access = await checkCommunityActionAllowed(userId);
    if (!access.allowed) {
      return communityActionDeniedResponse(access.error);
    }

    const activity = await appendCommunityActivity(userId, {
      archiveId: body.archiveId ?? null,
      type: body.type,
      title,
      body: text,
      ctaLabel: body.ctaLabel ?? null,
      ctaHref: body.ctaHref ?? null,
      source: body.source ?? "user_action",
      status: body.status ?? "visible",
      dedupeKey: body.dedupeKey ?? null,
      meta: body.meta ?? null,
    });

    return NextResponse.json({ ok: true, activity });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "activity_failed",
      },
      { status: 500 },
    );
  }
}
