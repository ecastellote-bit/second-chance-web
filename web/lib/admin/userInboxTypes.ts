/** Estados operativos compartidos para señales del inbox admin. */

export type UserInboxAdminStatus =
  | "new"
  | "reviewed"
  | "needs_reply"
  | "archived"
  | "hidden";

export const USER_INBOX_ACTION_STATUSES = [
  "reviewed",
  "needs_reply",
  "archived",
  "hidden",
] as const satisfies readonly UserInboxAdminStatus[];

export type UserInboxActionStatus = (typeof USER_INBOX_ACTION_STATUSES)[number];

export type UserInboxItemKind = "surface_interest" | "exit_feedback";

export const USER_INBOX_STATUS_LABEL: Record<UserInboxAdminStatus, string> = {
  new: "Nuevo",
  reviewed: "Revisado",
  needs_reply: "Para responder",
  archived: "Archivado",
  hidden: "Oculto",
};

export function isUserInboxAttentionStatus(status: string): boolean {
  return status === "new" || status === "needs_reply";
}

export function normalizeUserInboxAdminStatus(raw: string | undefined): UserInboxAdminStatus {
  if (
    raw === "reviewed" ||
    raw === "needs_reply" ||
    raw === "archived" ||
    raw === "hidden"
  ) {
    return raw;
  }
  return "new";
}

export function userInboxStatusLabel(status: string): string {
  return USER_INBOX_STATUS_LABEL[normalizeUserInboxAdminStatus(status)];
}
