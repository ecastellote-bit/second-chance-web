import { NextResponse } from "next/server";
import {
  CommunityAdminPostStoreError,
  createCommunityAdminPost,
  getCommunityAdminPostStoreMeta,
  type CommunityAdminPostKind,
  type CommunityAdminPostStatus,
  type CommunityAdminPostTargetType,
} from "@/lib/learning/communityAdminPosts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TARGETS: CommunityAdminPostTargetType[] = [
  "founder_project",
  "circle",
  "general_barrio",
];
const VALID_KINDS: CommunityAdminPostKind[] = [
  "update",
  "call_for_interest",
  "question",
  "next_step",
  "need",
  "announcement",
];
const VALID_STATUSES: CommunityAdminPostStatus[] = [
  "draft",
  "published",
  "hidden",
  "archived",
];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      targetType?: string;
      targetId?: string;
      kind?: string;
      title?: string;
      body?: string;
      ctaLabel?: string;
      ctaSignalType?: string;
      status?: string;
    };

    const targetType = body.targetType as CommunityAdminPostTargetType;
    const targetId = typeof body.targetId === "string" ? body.targetId.trim() : "";
    const kind = body.kind as CommunityAdminPostKind;
    const status = (body.status as CommunityAdminPostStatus) ?? "draft";

    if (
      !VALID_TARGETS.includes(targetType) ||
      !targetId ||
      !VALID_KINDS.includes(kind) ||
      !VALID_STATUSES.includes(status)
    ) {
      return NextResponse.json({ ok: false, error: "invalid_admin_post_payload" }, { status: 400 });
    }

    const post = await createCommunityAdminPost({
      targetType,
      targetId,
      kind,
      title: typeof body.title === "string" ? body.title : "",
      body: typeof body.body === "string" ? body.body : "",
      ctaLabel: typeof body.ctaLabel === "string" ? body.ctaLabel : undefined,
      ctaSignalType: typeof body.ctaSignalType === "string" ? body.ctaSignalType : undefined,
      status,
    });

    return NextResponse.json({
      ok: true,
      post,
      store: getCommunityAdminPostStoreMeta(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "admin_post_validation_failed") {
      return NextResponse.json({ ok: false, error: "admin_post_validation_failed" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "admin_post_target_invalid") {
      return NextResponse.json({ ok: false, error: "admin_post_target_invalid" }, { status: 400 });
    }
    if (error instanceof CommunityAdminPostStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "create_failed" },
      { status: 500 },
    );
  }
}
