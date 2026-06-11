import { COMMUNITY_REPORT_REASON_OPTIONS } from "@/lib/community/communityReportCopy";
import type { CommunityReportReason } from "@/lib/learning/communityReports";

const REPORT_REASON_LABEL = Object.fromEntries(
  COMMUNITY_REPORT_REASON_OPTIONS.map((o) => [o.reason, o.label]),
) as Record<CommunityReportReason, string>;

export function reportReasonLabel(reason: string): string {
  return REPORT_REASON_LABEL[reason as CommunityReportReason] ?? reason;
}

export const PANEL_HREFS = {
  seeds: "/admin/founder-project-seeds",
  contributions: "/admin/founder-project-contributions",
  circleSignals: "/admin/circle-signals",
  reports: "/admin/community-reports",
  adminPosts: "/admin/community-admin-posts",
  projectSignals: "/admin/founder-project-signals",
  formation: "/admin/formation-suggestions",
  notifications: "/admin/notification-events",
  userInbox: "/admin/user-inbox",
} as const;

export const KIND_LABEL: Record<string, string> = {
  seed: "Proyecto sembrado",
  contribution: "Aporte guiado",
  circle_signal: "Círculo / idea",
  report: "Reporte",
  admin_post: "Anuncio editorial",
  project_signal: "Señal a proyecto",
  formation: "Sugerencia formación",
  notification: "Evento notificación",
  surface_interest: "Interés con email",
  exit_feedback: "Feedback de salida",
  human_review: "Revisión humana (diagnóstico)",
};
