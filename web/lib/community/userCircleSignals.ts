import type { CommunityActivityItem } from "./types";
import { fetchCommunityActivities } from "./communityClient";

/** Círculos con señal real del usuario (guardado, interés o aviso). */
export function circleIdsFromActivities(
  activities: CommunityActivityItem[],
): string[] {
  const ids = new Set<string>();

  for (const activity of activities) {
    if (activity.type !== "circle_saved") continue;

    const fromMeta = activity.meta?.circleId;
    if (typeof fromMeta === "string" && fromMeta.trim()) {
      ids.add(fromMeta.trim());
      continue;
    }

    const href = activity.ctaHref ?? "";
    const match = href.match(/^\/circulos\/([^/?#]+)/);
    if (match?.[1]) ids.add(decodeURIComponent(match[1]));
  }

  return [...ids];
}

export async function fetchUserCircleIds(): Promise<string[]> {
  const activities = await fetchCommunityActivities();
  return circleIdsFromActivities(activities);
}
