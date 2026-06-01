import type { FounderProjectSignalType } from "@/lib/learning/founderProjectSignals";
import { listFounderProjectSignals } from "@/lib/learning/founderProjectSignals";
import { listFounderProjectSeeds } from "@/lib/learning/founderProjectSeeds";
import { listFormationSuggestions } from "@/lib/learning/formationSuggestions";
import { listCommunityAdminPosts } from "@/lib/learning/communityAdminPosts";
import { listFounderProjectGuidedContributions } from "@/lib/learning/founderProjectGuidedContributions";
import { listCircleSignals } from "@/lib/learning/circleSignals";
import {
  PUBLIC_BARRIO_ACTIVITY_EMPTY,
  PUBLIC_BARRIO_ACTIVITY_TITLE,
  PUBLIC_CIRCLES_ACTIVITY_EMPTY,
  PUBLIC_CIRCLES_ACTIVITY_TITLE,
  PUBLIC_CONNECTION_ACTIVITY_EMPTY,
  PUBLIC_CONNECTION_ACTIVITY_TITLE,
  PUBLIC_EVENTS_ACTIVITY_EMPTY,
  PUBLIC_EVENTS_ACTIVITY_TITLE,
  PUBLIC_FORMATION_ACTIVITY_EMPTY,
  PUBLIC_FORMATION_ACTIVITY_TITLE,
  PUBLIC_PROJECTS_ACTIVITY_EMPTY,
  PUBLIC_PROJECTS_ACTIVITY_TITLE,
} from "@/lib/community/communityRulesCopy";

export type PublicCommunityActivitySurface =
  | "barrio"
  | "projects"
  | "circles"
  | "formation"
  | "events"
  | "connection";

const PROJECT_ACTIVITY_KINDS = new Set<PublicCommunityActivityKind>([
  "project_published",
  "project_signal",
  "project_guided_contribution_pending",
  "project_guided_contribution_visible",
  "community_admin_post",
]);

const CIRCLE_ACTIVITY_KINDS = new Set<PublicCommunityActivityKind>([
  "circle_signal",
  "circle_visible_idea",
  "community_admin_post",
]);

const FORMATION_ACTIVITY_KINDS = new Set<PublicCommunityActivityKind>([
  "formation_suggestion",
  "community_admin_post",
]);

const CONNECTION_ACTIVITY_KINDS = new Set<PublicCommunityActivityKind>([
  "circle_signal",
  "project_signal",
  "community_admin_post",
]);

const EVENTS_ACTIVITY_KINDS = new Set<PublicCommunityActivityKind>([
  "formation_suggestion",
  "community_admin_post",
]);

const SURFACE_COPY: Record<
  PublicCommunityActivitySurface,
  { title: string; empty: string }
> = {
  barrio: { title: PUBLIC_BARRIO_ACTIVITY_TITLE, empty: PUBLIC_BARRIO_ACTIVITY_EMPTY },
  projects: { title: PUBLIC_PROJECTS_ACTIVITY_TITLE, empty: PUBLIC_PROJECTS_ACTIVITY_EMPTY },
  circles: { title: PUBLIC_CIRCLES_ACTIVITY_TITLE, empty: PUBLIC_CIRCLES_ACTIVITY_EMPTY },
  formation: { title: PUBLIC_FORMATION_ACTIVITY_TITLE, empty: PUBLIC_FORMATION_ACTIVITY_EMPTY },
  events: { title: PUBLIC_EVENTS_ACTIVITY_TITLE, empty: PUBLIC_EVENTS_ACTIVITY_EMPTY },
  connection: {
    title: PUBLIC_CONNECTION_ACTIVITY_TITLE,
    empty: PUBLIC_CONNECTION_ACTIVITY_EMPTY,
  },
};

export type PublicCommunityActivityKind =
  | "project_published"
  | "project_signal"
  | "formation_suggestion"
  | "circle_signal"
  | "project_guided_contribution_pending"
  | "project_guided_contribution_visible"
  | "community_admin_post"
  | "circle_visible_idea";

export type PublicCommunityActivityItem = {
  activityId: string;
  kind: PublicCommunityActivityKind;
  text: string;
  occurredAt: string;
};

export type PublicCommunityRecentActivityResult = {
  title: string;
  items: PublicCommunityActivityItem[];
  emptyMessage: string;
  hasRealActivity: boolean;
};

function projectSignalPublicText(signalType: FounderProjectSignalType): string {
  switch (signalType) {
    case "project_interest":
      return "Un proyecto fundador recibió una nueva señal de interés.";
    case "project_follow_close":
      return "Un proyecto fundador recibió una señal de seguimiento cercano.";
    case "project_possible_contribution":
      return "Alguien dejó una posible capacidad para un proyecto.";
    case "project_join_exploration":
      return "Un proyecto recibió una señal para explorar sumarse.";
    default:
      return "Un proyecto fundador recibió una nueva señal.";
  }
}

function circleSignalPublicText(signalType: string): string | null {
  switch (signalType) {
    case "circle_interest":
      return "Un círculo recibió interés inicial.";
    case "circle_receive_updates":
      return "Un círculo sumó personas que pidieron aviso cuando se mueva.";
    case "circle_access_request":
      return "Un círculo recibió una solicitud de acceso para revisión.";
    default:
      return null;
  }
}

async function collectProjectPublishedEvents(): Promise<PublicCommunityActivityItem[]> {
  const seeds = await listFounderProjectSeeds({ visibility: "public", limit: 200 });
  return seeds
    .filter((seed) => seed.status === "published")
    .map((seed) => {
      const occurredAt =
        seed.publishedAt?.trim() || seed.statusUpdatedAt?.trim() || seed.createdAt;
      return {
        activityId: `seed_published:${seed.seedId}`,
        kind: "project_published" as const,
        text: "Un proyecto fue publicado para recibir primeras señales.",
        occurredAt,
      };
    });
}

async function collectProjectSignalEvents(): Promise<PublicCommunityActivityItem[]> {
  const signals = await listFounderProjectSignals({ limit: 500 });
  return signals
    .filter((item) => item.status !== "withdrawn" && item.status !== "flagged")
    .map((signal) => ({
      activityId: `project_signal:${signal.signalId}`,
      kind: "project_signal" as const,
      text: projectSignalPublicText(signal.signalType),
      occurredAt: signal.updatedAt?.trim() || signal.createdAt,
    }));
}

async function collectFormationSuggestionEvents(): Promise<PublicCommunityActivityItem[]> {
  const suggestions = await listFormationSuggestions({ limit: 300 });
  return suggestions
    .filter((item) => item.status !== "archived")
    .map((suggestion) => ({
      activityId: `formation_suggestion:${suggestion.suggestionId}`,
      kind: "formation_suggestion" as const,
      text: "Una persona sugirió una formación para futuros acuerdos educativos.",
      occurredAt: suggestion.createdAt,
    }));
}

async function collectGuidedContributionPendingEvents(): Promise<PublicCommunityActivityItem[]> {
  const contributions = await listFounderProjectGuidedContributions({
    status: "pending_review",
    limit: 200,
  });
  return contributions.map((item) => ({
    activityId: `guided_contribution_pending:${item.contributionId}`,
    kind: "project_guided_contribution_pending" as const,
    text: "Un proyecto recibió un aporte para revisión.",
    occurredAt: item.createdAt,
  }));
}

async function collectGuidedContributionVisibleEvents(): Promise<PublicCommunityActivityItem[]> {
  const contributions = await listFounderProjectGuidedContributions({
    status: "visible",
    limit: 200,
  });
  return contributions.map((item) => ({
    activityId: `guided_contribution_visible:${item.contributionId}`,
    kind: "project_guided_contribution_visible" as const,
    text: "Un proyecto publicó un nuevo aporte.",
    occurredAt: item.updatedAt?.trim() || item.createdAt,
  }));
}

function adminPostPublicText(targetType: string): string {
  switch (targetType) {
    case "founder_project":
      return "Un proyecto publicó un nuevo movimiento.";
    case "circle":
      return "Un círculo publicó un nuevo movimiento.";
    case "general_barrio":
      return "El barrio publicó un nuevo aviso.";
    default:
      return "El barrio publicó un nuevo movimiento.";
  }
}

async function collectCommunityAdminPostEvents(options?: {
  founderProjectsOnly?: boolean;
  circleOnly?: boolean;
  generalBarrioOnly?: boolean;
}): Promise<PublicCommunityActivityItem[]> {
  const posts = await listCommunityAdminPosts({ status: "published", limit: 200 });
  let filtered = posts;
  if (options?.founderProjectsOnly) {
    filtered = filtered.filter((post) => post.targetType === "founder_project");
  }
  if (options?.circleOnly) {
    filtered = filtered.filter((post) => post.targetType === "circle");
  }
  if (options?.generalBarrioOnly) {
    filtered = filtered.filter((post) => post.targetType === "general_barrio");
  }
  return filtered.map((post) => ({
    activityId: `admin_post:${post.postId}`,
    kind: "community_admin_post" as const,
    text: adminPostPublicText(post.targetType),
    occurredAt: post.publishedAt?.trim() || post.updatedAt?.trim() || post.createdAt,
  }));
}

async function collectCircleVisibleIdeaEvents(): Promise<PublicCommunityActivityItem[]> {
  const signals = await listCircleSignals({ signalType: "circle_idea", limit: 200 });
  return signals
    .filter((item) => item.publicStatus === "visible" && item.publicApprovedAt)
    .map((item) => ({
      activityId: `circle_visible_idea:${item.signalId}`,
      kind: "circle_visible_idea" as const,
      text: "Un círculo publicó una nueva idea recibida.",
      occurredAt: item.publicApprovedAt!.trim(),
    }));
}

async function collectCircleSignalEvents(): Promise<PublicCommunityActivityItem[]> {
  const signals = await listCircleSignals({ limit: 300, status: "active" });
  const items: PublicCommunityActivityItem[] = [];
  for (const signal of signals) {
    const text = circleSignalPublicText(signal.signalType);
    if (!text) continue;
    items.push({
      activityId: `circle_signal:${signal.signalId}`,
      kind: "circle_signal",
      text,
      occurredAt: signal.updatedAt?.trim() || signal.createdAt,
    });
  }
  return items;
}

/**
 * Aggregates anonymized, sober activity lines from durable community stores.
 * Never exposes names, emails, userIds, or project titles in public copy.
 */
export async function getPublicCommunityRecentActivity(options?: {
  limit?: number;
  surface?: PublicCommunityActivitySurface;
}): Promise<PublicCommunityRecentActivityResult> {
  const limit = Math.min(Math.max(options?.limit ?? 10, 1), 20);
  const surface = options?.surface ?? "barrio";
  const buckets: PublicCommunityActivityItem[] = [];

  const collectorsBySurface: Record<
    PublicCommunityActivitySurface,
    Array<() => Promise<PublicCommunityActivityItem[]>>
  > = {
    barrio: [
      collectProjectPublishedEvents,
      collectProjectSignalEvents,
      collectFormationSuggestionEvents,
      collectGuidedContributionPendingEvents,
      collectGuidedContributionVisibleEvents,
      () => collectCommunityAdminPostEvents(),
      collectCircleSignalEvents,
      collectCircleVisibleIdeaEvents,
    ],
    projects: [
      collectProjectPublishedEvents,
      collectProjectSignalEvents,
      collectGuidedContributionPendingEvents,
      collectGuidedContributionVisibleEvents,
      () => collectCommunityAdminPostEvents({ founderProjectsOnly: true }),
    ],
    circles: [
      collectCircleSignalEvents,
      collectCircleVisibleIdeaEvents,
      () => collectCommunityAdminPostEvents({ circleOnly: true }),
    ],
    formation: [
      collectFormationSuggestionEvents,
      () => collectCommunityAdminPostEvents({ generalBarrioOnly: true }),
    ],
    events: [
      () => collectCommunityAdminPostEvents({ generalBarrioOnly: true }),
      collectFormationSuggestionEvents,
    ],
    connection: [
      collectCircleSignalEvents,
      collectProjectSignalEvents,
      () => collectCommunityAdminPostEvents({ generalBarrioOnly: true }),
    ],
  };

  const kindFilterBySurface: Partial<
    Record<PublicCommunityActivitySurface, Set<PublicCommunityActivityKind>>
  > = {
    projects: PROJECT_ACTIVITY_KINDS,
    circles: CIRCLE_ACTIVITY_KINDS,
    formation: FORMATION_ACTIVITY_KINDS,
    events: EVENTS_ACTIVITY_KINDS,
    connection: CONNECTION_ACTIVITY_KINDS,
  };

  for (const collect of collectorsBySurface[surface]) {
    try {
      const items = await collect();
      buckets.push(...items);
    } catch {
      // Store unavailable (e.g. blob not configured) — skip bucket, stay honest.
    }
  }

  let items = buckets
    .filter((item) => Boolean(item.occurredAt))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const kindFilter = kindFilterBySurface[surface];
  if (kindFilter) {
    items = items.filter((item) => kindFilter.has(item.kind));
  }

  items = items.slice(0, limit);

  const copy = SURFACE_COPY[surface];

  return {
    title: copy.title,
    items,
    emptyMessage: copy.empty,
    hasRealActivity: items.length > 0,
  };
}
