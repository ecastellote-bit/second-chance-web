import type { ModerationInboxItem } from "./types";

export function filterInboxItems(
  items: ModerationInboxItem[],
  filter: string,
): ModerationInboxItem[] {
  if (filter === "attention" || filter === "all") {
    return items;
  }
  const kindMap: Record<string, ModerationInboxItem["kind"]> = {
    projects: "seed",
    contributions: "contribution",
    circles: "circle_signal",
    reports: "report",
    announcements: "admin_post",
    signals: "project_signal",
    formation: "formation",
    notifications: "notification",
  };
  const kind = kindMap[filter];
  if (!kind) return items;
  return items.filter((i) => i.kind === kind);
}
