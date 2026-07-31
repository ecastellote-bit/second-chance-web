import { NextResponse } from "next/server";
import {
  createCommunityPost,
  listFeedPosts,
} from "@/lib/community-store/communityPostStore";
import {
  mapCommunityError,
  missingUserIdResponse,
  requireCommunityUser,
  requireUserId,
} from "@/lib/community-store/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const circleTag =
      url.searchParams.get("circleTag") ??
      url.searchParams.get("circleTagSlug") ??
      "";

    const result = await listFeedPosts({
      cursor,
      limit: Number.isFinite(limit) ? limit : 10,
      circleTagSlug: circleTag || undefined,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return mapCommunityError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      content?: string;
      type?: "texto" | "enlace";
      metadata?: {
        url?: string;
        urlTitle?: string;
        urlDescription?: string;
        urlImage?: string | null;
      } | null;
      circleTag?: string;
      circleTagSlug?: string;
    };

    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    const denied = await requireCommunityUser(userId);
    if (denied) return denied;

    const post = await createCommunityPost({
      userId,
      content: body.content ?? "",
      type: body.type,
      metadata: body.metadata?.url
        ? {
            url: body.metadata.url,
            urlTitle: body.metadata.urlTitle,
            urlDescription: body.metadata.urlDescription,
            urlImage: body.metadata.urlImage ?? null,
          }
        : null,
      circleTagSlug: body.circleTagSlug ?? body.circleTag ?? "",
    });

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (error) {
    return mapCommunityError(error);
  }
}
