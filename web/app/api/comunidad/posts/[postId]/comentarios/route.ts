import { NextResponse } from "next/server";
import { listCommentsByPost } from "@/lib/community-store/communityPostStore";
import { mapCommunityError } from "@/lib/community-store/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await context.params;
    const comments = await listCommentsByPost(postId);
    return NextResponse.json({ ok: true, comments });
  } catch (error) {
    return mapCommunityError(error);
  }
}
