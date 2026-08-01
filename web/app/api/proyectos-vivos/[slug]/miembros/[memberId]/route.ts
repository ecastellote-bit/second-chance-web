import { NextResponse } from "next/server";
import { resolveApplication } from "@/lib/projects-vivos/projectStore";
import { notifyVivoApplicationResponse } from "@/lib/learning/notificationEventIntegrations";
import { createInAppNotification } from "@/lib/in-app-notifications/inAppNotificationStore";
import {
  mapProjectError,
  missingUserIdResponse,
  requireUserId,
} from "@/lib/projects-vivos/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string; memberId: string }> },
) {
  try {
    const { slug, memberId } = await context.params;
    const body = (await req.json()) as {
      userId?: string;
      status?: "aceptado" | "rechazado";
    };

    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    if (body.status !== "aceptado" && body.status !== "rechazado") {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    }

    const result = await resolveApplication({
      creatorId: userId,
      slug,
      memberId,
      status: body.status,
    });

    await notifyVivoApplicationResponse({
      applicantId: result.member.userId,
      projectId: result.project.id,
      projectSlug: result.project.slug,
      memberId: result.member.id,
      accepted: body.status === "aceptado",
    }).catch(() => {});

    if (body.status === "aceptado") {
      await createInAppNotification({
        userId: result.member.userId,
        type: "postulacion_aceptada",
        title: "¡Te aceptaron!",
        body: `Sos parte del equipo de ${result.project.title}`,
        data: {
          url: "/proyectos/vivos/mis-proyectos",
          projectSlug: result.project.slug,
        },
      }).catch(() => {});
    } else {
      await createInAppNotification({
        userId: result.member.userId,
        type: "postulacion_rechazada",
        title: "Postulación no seleccionada",
        body: `El equipo de ${result.project.title} sigue buscando`,
        data: {
          url: "/proyectos/vivos",
          projectSlug: result.project.slug,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      member: result.member,
      project: result.project,
    });
  } catch (error) {
    return mapProjectError(error);
  }
}
