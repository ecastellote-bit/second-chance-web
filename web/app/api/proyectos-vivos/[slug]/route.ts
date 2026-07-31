import { NextResponse } from "next/server";
import { getProjectDetail } from "@/lib/projects-vivos/projectStore";
import {
  mapProjectError,
  requireUserId,
} from "@/lib/projects-vivos/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const requesterId = requireUserId(
      new URL(req.url).searchParams.get("userId"),
    );

    const detail = await getProjectDetail(slug, requesterId);
    if (!detail) {
      return NextResponse.json({ ok: false, error: "project_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, ...detail });
  } catch (error) {
    return mapProjectError(error);
  }
}
