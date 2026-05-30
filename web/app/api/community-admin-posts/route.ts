import { NextResponse } from "next/server";
import {
  CommunityAdminPostStoreError,
  listCommunityAdminPosts,
  type CommunityAdminPostTargetType,
} from "@/lib/learning/communityAdminPosts";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const targetType = url.searchParams.get("targetType")?.trim() as CommunityAdminPostTargetType;
    const targetId = url.searchParams.get("targetId")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);

    if (!targetType || !targetId) {
      return NextResponse.json(
        { ok: false, error: "targetType_and_targetId_required" },
        { status: 400 },
      );
    }

    const posts = await listCommunityAdminPosts({
      targetType,
      targetId,
      status: "published",
      limit,
    });

    return NextResponse.json({
      ok: true,
      posts: posts.map(
        ({ postId, targetType, targetId, targetTitle, kind, title, body, ctaLabel, ctaSignalType, publishedAt, createdAt }) => ({
          postId,
          targetType,
          targetId,
          targetTitle,
          kind,
          title,
          body,
          ctaLabel,
          ctaSignalType,
          publishedAt,
          createdAt,
        }),
      ),
      total: posts.length,
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
