import { NextResponse } from "next/server";
import { createMilestone } from "@/lib/projects-vivos/projectStore";
import {
  mapProjectError,
  missingUserIdResponse,
  requireUserId,
} from "@/lib/projects-vivos/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const body = (await req.json()) as {
      userId?: string;
      title?: string;
      description?: string;
      order?: number;
    };

    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    const milestone = await createMilestone({
      creatorId: userId,
      slug,
      title: body.title ?? "",
      description: body.description ?? "",
      order: body.order,
    });

    return NextResponse.json({ ok: true, milestone }, { status: 201 });
  } catch (error) {
    return mapProjectError(error);
  }
}
