import { NextResponse } from "next/server";
import { togglePostLike } from "@/lib/community-store/communityPostStore";
import {
  mapCommunityError,
  missingUserIdResponse,
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
    const body = (await req.json()) as { userId?: string };
    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    const result = await togglePostLike({ userId, postId });
    return NextResponse.json({
      ok: true,
      liked: result.liked,
      likesCount: result.likesCount,
    });
  } catch (error) {
    return mapCommunityError(error);
  }
}
