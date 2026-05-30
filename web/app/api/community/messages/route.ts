import { NextResponse } from "next/server";
import {
  appendCommunityMessage,
  listCommunityMessages,
} from "@/lib/community/communityStore";
import type {
  CommunityMessageFrom,
  CommunityMessageKind,
  CommunityMessageStatus,
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

  const messages = await listCommunityMessages(userId, 200);
  return NextResponse.json({ ok: true, messages });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      archiveId?: string | null;
      from?: CommunityMessageFrom;
      subject?: string;
      body?: string;
      ctaLabel?: string;
      ctaHref?: string;
      status?: CommunityMessageStatus;
      kind?: CommunityMessageKind;
      dedupeKey?: string;
      meta?: Record<string, string | null>;
    };

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const text = typeof body.body === "string" ? body.body.trim() : "";

    if (!userId || !subject || !text || !body.from || !body.kind) {
      return NextResponse.json(
        { ok: false, error: "invalid_message_payload" },
        { status: 400 },
      );
    }

    const access = await checkCommunityActionAllowed(userId);
    if (!access.allowed) {
      return communityActionDeniedResponse(access.error);
    }

    const message = await appendCommunityMessage(userId, {
      archiveId: body.archiveId ?? null,
      from: body.from,
      subject,
      body: text,
      ctaLabel: body.ctaLabel ?? null,
      ctaHref: body.ctaHref ?? null,
      status: body.status ?? "unread",
      kind: body.kind,
      dedupeKey: body.dedupeKey ?? null,
      meta: body.meta ?? null,
    });

    return NextResponse.json({ ok: true, message });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "message_failed",
      },
      { status: 500 },
    );
  }
}
