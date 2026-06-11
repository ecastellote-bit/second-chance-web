import { adminFetch } from "@/lib/admin/adminFetch";
import type { ModerationInboxItem, ModerationQuickAction } from "./types";

function patchUrl(item: ModerationInboxItem): string {
  switch (item.kind) {
    case "seed":
      return `/api/admin/founder-project-seeds/${encodeURIComponent(item.id)}`;
    case "contribution":
      return `/api/admin/founder-project-contributions/${encodeURIComponent(item.id)}`;
    case "circle_signal":
      return `/api/admin/circle-signals/${encodeURIComponent(item.id)}`;
    case "report":
      return `/api/admin/community-reports/${encodeURIComponent(item.id)}`;
    case "admin_post":
      return `/api/admin/community-admin-posts/${encodeURIComponent(item.id)}`;
    case "project_signal":
      return `/api/admin/founder-project-signals/${encodeURIComponent(item.id)}`;
    case "formation":
      return `/api/admin/formation-suggestions/${encodeURIComponent(item.id)}`;
    case "notification":
      return `/api/admin/notification-events/${encodeURIComponent(item.id)}`;
    default:
      throw new Error("unknown_kind");
  }
}

function userInboxKind(item: ModerationInboxItem): "surface_interest" | "exit_feedback" {
  if (item.kind === "surface_interest") return "surface_interest";
  if (item.kind === "exit_feedback") return "exit_feedback";
  throw new Error("not_user_inbox");
}

export async function runModerationQuickAction(
  item: ModerationInboxItem,
  action: ModerationQuickAction,
  options?: { publicText?: string },
): Promise<void> {
  if (action.requiresPanel) {
    window.location.href = item.panelHref;
    return;
  }

  if (action.isUserInboxAction) {
    const adminStatus = action.payload.adminStatus;
    if (typeof adminStatus !== "string") {
      throw new Error("Estado de inbox inválido");
    }
    const res = await adminFetch("/api/admin/user-inbox/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: userInboxKind(item),
        itemId: item.id,
        adminStatus,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
    if (!res.ok || !data.ok) {
      throw new Error(data.message ?? data.error ?? "No se pudo actualizar el inbox");
    }
    return;
  }

  const body = { ...action.payload };
  if (action.needsPublicText) {
    const text = options?.publicText?.trim() ?? "";
    if (text.length < 20) {
      throw new Error("El texto público curado debe tener al menos 20 caracteres.");
    }
    body.publicText = text;
  }

  const res = await adminFetch(patchUrl(item), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok?: boolean; error?: string; message?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.message ?? data.error ?? "No se pudo aplicar la acción");
  }
}
