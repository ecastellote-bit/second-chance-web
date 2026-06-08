import type { FounderExitFeedbackRecord } from "@/lib/learning/founderExitFeedback";
import type { SurfaceInterestLead } from "@/lib/learning/surfaceInterestLeads";
import {
  isUserInboxAttentionStatus,
  type UserInboxAdminStatus,
} from "@/lib/admin/userInboxTypes";

export type UserInboxStatusCounts = {
  new: number;
  needsReply: number;
  reviewed: number;
  archived: number;
  hidden: number;
  attention: number;
};

function bump(counts: UserInboxStatusCounts, status: UserInboxAdminStatus): void {
  if (status === "new") counts.new += 1;
  else if (status === "needs_reply") counts.needsReply += 1;
  else if (status === "reviewed") counts.reviewed += 1;
  else if (status === "archived") counts.archived += 1;
  else if (status === "hidden") counts.hidden += 1;
  if (isUserInboxAttentionStatus(status)) counts.attention += 1;
}

export function countUserInboxStatuses(
  surfaceLeads: SurfaceInterestLead[],
  exitFeedback: FounderExitFeedbackRecord[],
): UserInboxStatusCounts {
  const counts: UserInboxStatusCounts = {
    new: 0,
    needsReply: 0,
    reviewed: 0,
    archived: 0,
    hidden: 0,
    attention: 0,
  };
  for (const lead of surfaceLeads) bump(counts, lead.status);
  for (const item of exitFeedback) bump(counts, item.status);
  return counts;
}

export type UserInboxListFilter =
  | "active"
  | "all"
  | "new"
  | "needs_reply"
  | "reviewed"
  | "archived"
  | "hidden";

export function matchesUserInboxFilter(
  status: UserInboxAdminStatus,
  filter: UserInboxListFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "active") return status !== "archived" && status !== "hidden";
  return status === filter;
}
