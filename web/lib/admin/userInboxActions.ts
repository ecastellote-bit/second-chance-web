import {
  updateFounderExitFeedbackStatus,
  FounderExitFeedbackStoreError,
} from "@/lib/learning/founderExitFeedback";
import {
  updateSurfaceInterestLeadStatus,
  SurfaceInterestLeadStoreError,
} from "@/lib/learning/surfaceInterestLeads";
import {
  USER_INBOX_ACTION_STATUSES,
  type UserInboxActionStatus,
  type UserInboxItemKind,
} from "@/lib/admin/userInboxTypes";

const VALID_KINDS = new Set<UserInboxItemKind>(["surface_interest", "exit_feedback"]);
const VALID_STATUSES = new Set<UserInboxActionStatus>(USER_INBOX_ACTION_STATUSES);

export async function applyUserInboxAdminAction(input: {
  kind: UserInboxItemKind;
  itemId: string;
  adminStatus: UserInboxActionStatus;
}) {
  const { kind, itemId, adminStatus } = input;

  if (kind === "surface_interest") {
    const updated = await updateSurfaceInterestLeadStatus(itemId, adminStatus);
    if (!updated) return { ok: false as const, error: "item_not_found" as const };
    return { ok: true as const, kind, itemId, adminStatus };
  }

  const updated = await updateFounderExitFeedbackStatus(itemId, adminStatus);
  if (!updated) return { ok: false as const, error: "item_not_found" as const };
  return { ok: true as const, kind, itemId, adminStatus };
}

export function parseUserInboxActionBody(body: {
  kind?: string;
  itemId?: string;
  adminStatus?: string;
}):
  | { ok: true; kind: UserInboxItemKind; itemId: string; adminStatus: UserInboxActionStatus }
  | { ok: false; error: string } {
  const kind = typeof body.kind === "string" ? body.kind.trim() : "";
  const itemId = typeof body.itemId === "string" ? body.itemId.trim().slice(0, 80) : "";
  const adminStatus =
    typeof body.adminStatus === "string" ? body.adminStatus.trim() : "";

  if (!VALID_KINDS.has(kind as UserInboxItemKind)) {
    return { ok: false, error: "invalid_kind" };
  }
  if (!itemId) {
    return { ok: false, error: "invalid_item_id" };
  }
  if (!VALID_STATUSES.has(adminStatus as UserInboxActionStatus)) {
    return { ok: false, error: "invalid_status" };
  }

  return {
    ok: true,
    kind: kind as UserInboxItemKind,
    itemId,
    adminStatus: adminStatus as UserInboxActionStatus,
  };
}

export { FounderExitFeedbackStoreError, SurfaceInterestLeadStoreError };
