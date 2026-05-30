import type { FounderProjectSignalType } from "@/lib/learning/founderProjectSignals";
import { listFounderProjectSignals } from "@/lib/learning/founderProjectSignals";
import { listFounderProjectSeeds } from "@/lib/learning/founderProjectSeeds";
import { listFormationSuggestions } from "@/lib/learning/formationSuggestions";
import {
  PUBLIC_BARRIO_ACTIVITY_EMPTY,
  PUBLIC_BARRIO_ACTIVITY_TITLE,
} from "@/lib/community/communityRulesCopy";

export type PublicCommunityActivityKind =
  | "project_published"
  | "project_signal"
  | "formation_suggestion"
  | "circle_signal";

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
