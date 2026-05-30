import type { FounderProjectSignalType } from "@/lib/learning/founderProjectSignals";
import { listFounderProjectSignals } from "@/lib/learning/founderProjectSignals";
import { listFounderProjectSeeds } from "@/lib/learning/founderProjectSeeds";
import { listFormationSuggestions } from "@/lib/learning/formationSuggestions";
import { listFounderProjectGuidedContributions } from "@/lib/learning/founderProjectGuidedContributions";
import { listCircleSignals } from "@/lib/learning/circleSignals";
import {
  PUBLIC_BARRIO_ACTIVITY_EMPTY,
  PUBLIC_BARRIO_ACTIVITY_TITLE,
} from "@/lib/community/communityRulesCopy";

export type PublicCommunityActivityKind =
  | "project_published"
  | "project_signal"
  | "formation_suggestion"
  | "circle_signal"
  | "project_guided_contribution_pending"
  | "project_guided_contribution_visible";

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
      return "Un círculo sumó personas que quieren recibir movimiento.";
    case "circle_access_request":
      return "Un círculo recibió una solicitud de acceso para revisión.";
    case "circle_idea":
      return "Alguien dejó una idea para un círculo, en revisión del equipo.";
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
}): Promise<PublicCommunityRecentActivityResult> {
  const limit = Math.min(Math.max(options?.limit ?? 10, 1), 20);
  const buckets: PublicCommunityActivityItem[] = [];

  const collectors = [
    collectProjectPublishedEvents,
    collectProjectSignalEvents,
    collectFormationSuggestionEvents,
    collectGuidedContributionPendingEvents,
    collectGuidedContributionVisibleEvents,
    collectCircleSignalEvents,
  ];

  for (const collect of collectors) {
    try {
      const items = await collect();
      buckets.push(...items);
    } catch {
      // Store unavailable (e.g. blob not configured) — skip bucket, stay honest.
    }
  }

  const items = buckets
    .filter((item) => Boolean(item.occurredAt))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, limit);

  return {
    title: PUBLIC_BARRIO_ACTIVITY_TITLE,
    items,
    emptyMessage: PUBLIC_BARRIO_ACTIVITY_EMPTY,
    hasRealActivity: items.length > 0,
  };
}
