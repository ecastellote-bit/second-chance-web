import { NextResponse } from "next/server";
import {
  CommunityAdminPostStoreError,
  updateCommunityAdminPost,
  type CommunityAdminPostKind,
  type CommunityAdminPostStatus,
} from "@/lib/learning/communityAdminPosts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<CommunityAdminPostStatus>([
  "draft",
  "published",
  "hidden",
  "archived",
]);

const VALID_KINDS = new Set<CommunityAdminPostKind>([
  "update",
  "call_for_interest",
  "question",
  "next_step",
  "need",
  "announcement",
]);

type RouteContext = { params: Promise<{ postId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { postId } = await context.params;
    const body = (await req.json()) as {
      status?: string;
      title?: string;
      body?: string;
      kind?: string;
      ctaLabel?: string | null;
      ctaSignalType?: string | null;
    };

    const patch: Parameters<typeof updateCommunityAdminPost>[1] = {};
    if (typeof body.title === "string") patch.title = body.title;
    if (typeof body.body === "string") patch.body = body.body;
    if (body.kind && VALID_KINDS.has(body.kind as CommunityAdminPostKind)) {
      patch.kind = body.kind as CommunityAdminPostKind;
    }
    if (body.status && VALID_STATUSES.has(body.status as CommunityAdminPostStatus)) {
      patch.status = body.status as CommunityAdminPostStatus;
    }
    if (body.ctaLabel !== undefined) {
      patch.ctaLabel = body.ctaLabel?.trim() || undefined;
    }
    if (body.ctaSignalType !== undefined) {
      patch.ctaSignalType = body.ctaSignalType?.trim() || undefined;
    }

    const updated = await updateCommunityAdminPost(postId, patch);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "post_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, post: updated });
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
      { ok: false, error: error instanceof Error ? error.message : "update_failed" },
      { status: 500 },
    );
  }
}
