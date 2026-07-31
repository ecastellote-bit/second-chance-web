import { NextResponse } from "next/server";
import { applyToRole } from "@/lib/projects-vivos/projectStore";
import { notifyVivoApplicationReceived } from "@/lib/learning/notificationEventIntegrations";
import { findProjectBySlug } from "@/lib/projects-vivos/projectStore";
import {
  mapProjectError,
  missingUserIdResponse,
  requireCommunityUser,
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
      roleId?: string;
      message?: string;
    };

    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    const denied = await requireCommunityUser(userId);
    if (denied) return denied;

    const member = await applyToRole({
      userId,
      slug,
      roleId: body.roleId ?? "",
      message: body.message ?? "",
    });

    const project = await findProjectBySlug(slug);
    if (project) {
      await notifyVivoApplicationReceived({
        creatorId: project.creatorId,
        projectId: project.id,
        projectSlug: project.slug,
        memberId: member.id,
        actorUserId: userId,
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, application: member }, { status: 201 });
  } catch (error) {
    return mapProjectError(error);
  }
}
