import { NextResponse } from "next/server";
import {
  CommunityAdminPostStoreError,
  getCommunityAdminPostStoreMeta,
  listCommunityAdminPosts,
  type CommunityAdminPostStatus,
  type CommunityAdminPostTargetType,
} from "@/lib/learning/communityAdminPosts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<CommunityAdminPostStatus>([
  "draft",
  "published",
  "hidden",
  "archived",
]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const targetType = url.searchParams.get("targetType")?.trim() as
      | CommunityAdminPostTargetType
      | undefined;
    const targetId = url.searchParams.get("targetId")?.trim() || undefined;
    const statusParam = url.searchParams.get("status")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 300), 2000);

    const status =
      statusParam && VALID_STATUSES.has(statusParam as CommunityAdminPostStatus)
        ? (statusParam as CommunityAdminPostStatus)
        : undefined;

    const posts = await listCommunityAdminPosts({
      targetType,
      targetId,
      status,
      limit,
    });

    return NextResponse.json({
      ok: true,
      total: posts.length,
      posts,
      store: getCommunityAdminPostStoreMeta(),
    });
  } catch (error) {
    if (error instanceof CommunityAdminPostStoreError) {
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
