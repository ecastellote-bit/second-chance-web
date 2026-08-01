/** Client helper: dispara toasts de logros desde respuestas de API. */
import type { EarnedBadgePayload } from "./userBadgeTypes";

export const BADGES_EARNED_EVENT = "vu:badges-earned";

export function emitEarnedBadges(
  badges: EarnedBadgePayload[] | undefined | null,
): void {
  if (typeof window === "undefined") return;
  if (!badges || badges.length === 0) return;
  window.dispatchEvent(
    new CustomEvent(BADGES_EARNED_EVENT, { detail: badges }),
  );
}

export function readEarnedBadgesFromJson(data: unknown): EarnedBadgePayload[] {
  if (!data || typeof data !== "object") return [];
  const raw = (data as { earnedBadges?: unknown }).earnedBadges;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is EarnedBadgePayload =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as EarnedBadgePayload).slug === "string" &&
      typeof (item as EarnedBadgePayload).name === "string" &&
      typeof (item as EarnedBadgePayload).icon === "string",
  );
}
