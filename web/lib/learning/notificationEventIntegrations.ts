import { NOTIFICATION_MILESTONE_COPY } from "./notificationEventCopy";
import { tryCreateNotificationEventForUser } from "./notificationEvents";
import type { FounderProjectSeed } from "./founderProjectSeeds";

/**
 * admin_post_published: pendiente — requiere listar seguidores por señal/círculo.
 * Ver web/docs/community-p1f-watchlist.txt y comentario en notificationEventCopy.
 */

export async function notifyProjectPublished(seed: FounderProjectSeed): Promise<void> {
  const ownerUserId = seed.userId?.trim();
  if (!ownerUserId) return;
  const copy = NOTIFICATION_MILESTONE_COPY.project_published;
  await tryCreateNotificationEventForUser({
    userId: ownerUserId,
    type: "project_published",
    title: copy.title,
    body: copy.body,
    targetType: "founder_project_seed",
    targetId: seed.seedId,
    dedupeKey: `project_published:${seed.seedId}:${ownerUserId}`,
    metadata: { seedId: seed.seedId, status: "published" },
  });
}

export async function notifyProjectHidden(seed: FounderProjectSeed): Promise<void> {
  const ownerUserId = seed.userId?.trim();
  if (!ownerUserId) return;
  const copy = NOTIFICATION_MILESTONE_COPY.project_hidden;
  await tryCreateNotificationEventForUser({
    userId: ownerUserId,
    type: "project_hidden",
    title: copy.title,
    body: copy.body,
    targetType: "founder_project_seed",
    targetId: seed.seedId,
    dedupeKey: `project_hidden:${seed.seedId}:${ownerUserId}`,
    metadata: { seedId: seed.seedId, status: "hidden" },
  });
}

export async function notifyProjectSignalReceived(input: {
  seed: FounderProjectSeed;
  signalId: string;
  actorUserId: string;
}): Promise<void> {
  const ownerUserId = input.seed.userId?.trim();
  if (!ownerUserId) return;
  const copy = NOTIFICATION_MILESTONE_COPY.project_signal_received;
  await tryCreateNotificationEventForUser({
    userId: ownerUserId,
    type: "project_signal_received",
    title: copy.title,
    body: copy.body,
    targetType: "founder_project_seed",
    targetId: input.seed.seedId,
    dedupeKey: `project_signal_received:${input.seed.seedId}:${input.signalId}:${ownerUserId}`,
    metadata: {
      seedId: input.seed.seedId,
      signalId: input.signalId,
    },
    actorUserId: input.actorUserId,
  });
}

export async function notifyContributionVisible(input: {
  contributionId: string;
  projectId: string;
  actorUserId: string;
}): Promise<void> {
  const copy = NOTIFICATION_MILESTONE_COPY.project_contribution_visible;
  await tryCreateNotificationEventForUser({
    userId: input.actorUserId,
    type: "project_contribution_visible",
    title: copy.title,
    body: copy.body,
    targetType: "project_guided_contribution",
    targetId: input.contributionId,
    dedupeKey: `project_contribution_visible:${input.contributionId}:${input.actorUserId}`,
    metadata: {
      contributionId: input.contributionId,
      projectId: input.projectId,
    },
  });
}

export async function notifyCircleIdeaVisible(input: {
  signalId: string;
  circleId: string;
  actorUserId: string;
}): Promise<void> {
  const copy = NOTIFICATION_MILESTONE_COPY.circle_idea_visible;
  await tryCreateNotificationEventForUser({
    userId: input.actorUserId,
    type: "circle_idea_visible",
    title: copy.title,
    body: copy.body,
    targetType: "circle_signal",
    targetId: input.signalId,
    dedupeKey: `circle_idea_visible:${input.signalId}:${input.actorUserId}`,
    metadata: { signalId: input.signalId, circleId: input.circleId },
  });
}

export async function notifyFormationSuggestionReviewed(input: {
  suggestionId: string;
  userId: string;
}): Promise<void> {
  const copy = NOTIFICATION_MILESTONE_COPY.formation_suggestion_reviewed;
  await tryCreateNotificationEventForUser({
    userId: input.userId,
    type: "formation_suggestion_reviewed",
    title: copy.title,
    body: copy.body,
    targetType: "formation_suggestion",
    targetId: input.suggestionId,
    dedupeKey: `formation_suggestion_reviewed:${input.suggestionId}:${input.userId}`,
    metadata: { suggestionId: input.suggestionId },
  });
}

export async function notifyVivoApplicationReceived(input: {
  creatorId: string;
  projectId: string;
  projectSlug: string;
  memberId: string;
  actorUserId: string;
}): Promise<void> {
  const copy = NOTIFICATION_MILESTONE_COPY.vivo_application_received;
  await tryCreateNotificationEventForUser({
    userId: input.creatorId,
    type: "vivo_application_received",
    title: copy.title,
    body: copy.body,
    targetType: "vivo_project",
    targetId: input.projectId,
    dedupeKey: `vivo_application_received:${input.projectId}:${input.memberId}`,
    metadata: {
      projectId: input.projectId,
      projectSlug: input.projectSlug,
      memberId: input.memberId,
    },
    actorUserId: input.actorUserId,
  });
}

export async function notifyVivoApplicationResponse(input: {
  applicantId: string;
  projectId: string;
  projectSlug: string;
  memberId: string;
  accepted: boolean;
}): Promise<void> {
  const copy = input.accepted
    ? NOTIFICATION_MILESTONE_COPY.vivo_application_accepted
    : NOTIFICATION_MILESTONE_COPY.vivo_application_rejected;
  await tryCreateNotificationEventForUser({
    userId: input.applicantId,
    type: "vivo_application_response",
    title: copy.title,
    body: copy.body,
    targetType: "vivo_project",
    targetId: input.projectId,
    dedupeKey: `vivo_application_response:${input.memberId}:${input.accepted ? "ok" : "no"}`,
    metadata: {
      projectId: input.projectId,
      projectSlug: input.projectSlug,
      memberId: input.memberId,
      accepted: input.accepted,
    },
  });
}

export async function notifyVivoMilestoneCompleted(input: {
  memberUserIds: string[];
  projectId: string;
  projectSlug: string;
  milestoneId: string;
  milestoneTitle: string;
}): Promise<void> {
  const copy = NOTIFICATION_MILESTONE_COPY.vivo_milestone_completed;
  for (const userId of input.memberUserIds) {
    await tryCreateNotificationEventForUser({
      userId,
      type: "vivo_milestone_completed",
      title: copy.title,
      body: `${copy.body} Hito: ${input.milestoneTitle}.`,
      targetType: "vivo_project",
      targetId: input.projectId,
      dedupeKey: `vivo_milestone_completed:${input.milestoneId}:${userId}`,
      metadata: {
        projectId: input.projectId,
        projectSlug: input.projectSlug,
        milestoneId: input.milestoneId,
      },
    });
  }
}
