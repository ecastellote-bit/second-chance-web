import type { ModerationInboxItem, ModerationQueueKind } from "./types";

const ATTENTION_KINDS = new Set<ModerationQueueKind>([
  "surface_interest",
  "exit_feedback",
  "seed",
  "contribution",
  "report",
  "circle_signal",
  "formation",
]);

export function filterInboxItems(
  items: ModerationInboxItem[],
  filter: string,
): ModerationInboxItem[] {
  if (filter === "attention") {
    return items.filter((i) => ATTENTION_KINDS.has(i.kind));
  }
  if (filter === "all") {
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
    inbox: "surface_interest",
  };
  const kind = kindMap[filter];
  if (filter === "inbox") {
    return items.filter((i) => i.kind === "surface_interest" || i.kind === "exit_feedback");
  }
  if (!kind) return items;
  return items.filter((i) => i.kind === kind);
}
