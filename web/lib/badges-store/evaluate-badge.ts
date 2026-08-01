import { findBadgeByCondition, type BadgeConfig } from "./badges-config";
import { append, hasBadge } from "./userBadgeStore";
import type { EarnedBadgePayload } from "./userBadgeTypes";

export type EvaluateBadgeResult =
  | { earned: false }
  | { earned: true; badge: BadgeConfig; payload: EarnedBadgePayload };

/**
 * Otorga un badge si el usuario aún no lo tiene.
 * El caller debe invocar solo cuando la condición de negocio se cumplió.
 */
export async function evaluateBadge(
  userId: string,
  condition: string,
): Promise<EvaluateBadgeResult> {
  const id = userId.trim();
  if (!id) return { earned: false };

  const badge = findBadgeByCondition(condition);
  if (!badge) return { earned: false };

  const already = await hasBadge(id, badge.slug);
  if (already) return { earned: false };

  await append({
    userId: id,
    badgeSlug: badge.slug,
    earnedAt: new Date().toISOString(),
    seen: false,
  });

  return {
    earned: true,
    badge,
    payload: {
      slug: badge.slug,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
    },
  };
}

export function collectEarnedPayloads(
  results: EvaluateBadgeResult[],
): EarnedBadgePayload[] {
  return results
    .filter((r): r is Extract<EvaluateBadgeResult, { earned: true }> => r.earned)
    .map((r) => r.payload);
}
