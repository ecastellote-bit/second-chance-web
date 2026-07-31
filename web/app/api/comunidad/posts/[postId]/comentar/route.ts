import { NextResponse } from "next/server";
import { createCommunityComment } from "@/lib/community-store/communityPostStore";
import {
  mapCommunityError,
  missingUserIdResponse,
  requireCommunityUser,
  requireUserId,
} from "@/lib/community-store/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await context.params;
    const body = (await req.json()) as { userId?: string; content?: string };
    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    const denied = await requireCommunityUser(userId);
    if (denied) return denied;

    const result = await createCommunityComment({
      userId,
      postId,
      content: body.content ?? "",
    });

    return NextResponse.json(
      { ok: true, comment: result.comment, commentsCount: result.post.commentsCount },
      { status: 201 },
    );
  } catch (error) {
    return mapCommunityError(error);
  }
}
