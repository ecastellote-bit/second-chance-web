import { NextResponse } from "next/server";
import { completeMilestone } from "@/lib/projects-vivos/projectStore";
import { notifyVivoMilestoneCompleted } from "@/lib/learning/notificationEventIntegrations";
import {
  mapProjectError,
  missingUserIdResponse,
  requireUserId,
} from "@/lib/projects-vivos/apiHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string; milestoneId: string }> },
) {
  try {
    const { slug, milestoneId } = await context.params;
    const body = (await req.json()) as {
      userId?: string;
      completed?: boolean;
    };

    const userId = requireUserId(body.userId);
    if (!userId) return missingUserIdResponse();

    if (body.completed !== true) {
      return NextResponse.json(
        { ok: false, error: "completed_must_be_true" },
        { status: 400 },
      );
    }

    const result = await completeMilestone({
      creatorId: userId,
      slug,
      milestoneId,
    });

    await notifyVivoMilestoneCompleted({
      memberUserIds: result.acceptedMemberIds,
      projectId: result.project.id,
      projectSlug: result.project.slug,
      milestoneId: result.milestone.id,
      milestoneTitle: result.milestone.title,
    }).catch(() => {});

    return NextResponse.json({
      ok: true,
      milestone: result.milestone,
      project: result.project,
    });
  } catch (error) {
    return mapProjectError(error);
  }
}
