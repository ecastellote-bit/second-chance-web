import { NextResponse } from "next/server";
import { applyToRole, findProjectBySlug } from "@/lib/projects-vivos/projectStore";
import { notifyVivoApplicationReceived } from "@/lib/learning/notificationEventIntegrations";
import { createInAppNotification } from "@/lib/in-app-notifications/inAppNotificationStore";
import {
  collectEarnedPayloads,
  evaluateBadge,
} from "@/lib/badges-store/evaluate-badge";
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

      await createInAppNotification({
        userId: project.creatorId,
        type: "postulacion_recibida",
        title: "Nueva postulación",
        body: `${member.userName} se postuló a ${member.role} en ${project.title}`,
        data: {
          url: `/proyectos/vivos/${project.slug}`,
          projectSlug: project.slug,
        },
      }).catch(() => {});
    }

    const badgeResult = await evaluateBadge(userId, "primera_accion").catch(
      () => ({ earned: false as const }),
    );

    return NextResponse.json(
      {
        ok: true,
        application: member,
        earnedBadges: collectEarnedPayloads([badgeResult]),
      },
      { status: 201 },
    );
  } catch (error) {
    return mapProjectError(error);
  }
}
