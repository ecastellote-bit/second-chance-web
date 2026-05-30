"use client";

import { getFoundingMemberArchiveId } from "@/lib/learning/foundationalMember";
import { getOrCreateUserId } from "@/lib/users/activeUserSession";
import type {
  CommunityActivityItem,
  CommunityActivityType,
  CommunityMessage,
  CommunityMessageFrom,
  CommunityMessageKind,
} from "./types";

function resolveIds(archiveId?: string | null): {
  userId: string;
  archiveId: string | null;
} {
  return {
    userId: getOrCreateUserId(),
    archiveId: archiveId ?? getFoundingMemberArchiveId() ?? null,
  };
}

export async function fetchCommunityActivities(): Promise<CommunityActivityItem[]> {
  const userId = getOrCreateUserId();
  if (!userId) return [];

  const res = await fetch(
    `/api/community/activity?userId=${encodeURIComponent(userId)}`,
  );
  const data = (await res.json()) as { ok?: boolean; activities?: CommunityActivityItem[] };
  return data.ok && Array.isArray(data.activities) ? data.activities : [];
}

export async function fetchCommunityMessages(): Promise<CommunityMessage[]> {
  const userId = getOrCreateUserId();
  if (!userId) return [];

  const res = await fetch(
    `/api/community/messages?userId=${encodeURIComponent(userId)}`,
  );
  const data = (await res.json()) as { ok?: boolean; messages?: CommunityMessage[] };
  return data.ok && Array.isArray(data.messages) ? data.messages : [];
}

export async function postCommunityActivity(input: {
  type: CommunityActivityType;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  dedupeKey?: string;
  archiveId?: string | null;
  meta?: Record<string, string | null>;
}): Promise<CommunityActivityItem | null> {
  const { userId, archiveId } = resolveIds(input.archiveId);
  if (!userId) return null;

  const res = await fetch("/api/community/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      archiveId,
      type: input.type,
      title: input.title,
      body: input.body,
      ctaLabel: input.ctaLabel,
      ctaHref: input.ctaHref,
      source: "user_action",
      status: "visible",
      dedupeKey: input.dedupeKey,
      meta: input.meta,
    }),
  });
  const data = (await res.json()) as { ok?: boolean; activity?: CommunityActivityItem };
  return data.ok && data.activity ? data.activity : null;
}

export async function postCommunityMessage(input: {
  from: CommunityMessageFrom;
  subject: string;
  body: string;
  kind: CommunityMessageKind;
  ctaLabel?: string;
  ctaHref?: string;
  dedupeKey?: string;
  archiveId?: string | null;
  meta?: Record<string, string | null>;
}): Promise<CommunityMessage | null> {
  const { userId, archiveId } = resolveIds(input.archiveId);
  if (!userId) return null;

  const res = await fetch("/api/community/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      archiveId,
      from: input.from,
      subject: input.subject,
      body: input.body,
      kind: input.kind,
      ctaLabel: input.ctaLabel,
      ctaHref: input.ctaHref,
      status: "unread",
      dedupeKey: input.dedupeKey,
      meta: input.meta,
    }),
  });
  const data = (await res.json()) as { ok?: boolean; message?: CommunityMessage };
  return data.ok && data.message ? data.message : null;
}

export async function postCommunityEvent(
  event:
    | {
        event: "activation_selected";
        pathId: string;
        pathLabel: string;
        archiveId?: string | null;
      }
    | {
        event: "circle_interest";
        circleId: string;
        circleTitle: string;
        mode: "saved" | "interested" | "notify";
        archiveId?: string | null;
      }
    | {
        event: "project_interest";
        projectId: string;
        projectTitle: string;
        mode: "interest" | "observe" | "join";
        archiveId?: string | null;
      }
    | {
        event: "formation_or_event_interest";
        targetId: string;
        targetTitle: string;
        targetKind: "formation" | "event";
        notifySimilar?: boolean;
        savedRoute?: boolean;
        archiveId?: string | null;
      }
    | {
        event: "founder_project_signal";
        projectId: string;
        projectTitle: string;
        signalType:
          | "project_follow_close"
          | "project_interest"
          | "project_possible_contribution"
          | "project_join_exploration";
        capabilities?: string[];
        source?: "project_page" | "projects_list" | "activation";
        archiveId?: string | null;
      },
): Promise<{ ok: boolean; error?: string }> {
  const { userId, archiveId } = resolveIds(
    "archiveId" in event ? event.archiveId : undefined,
  );
  if (!userId) return { ok: false, error: "user_id_required" };

  const res = await fetch("/api/community/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, archiveId, ...event }),
  });
  const data = (await res.json()) as { ok?: boolean; error?: string };
  return { ok: Boolean(data.ok), error: data.error };
}
