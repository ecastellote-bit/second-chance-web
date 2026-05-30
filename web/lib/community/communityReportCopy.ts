import type { CommunityReportReason } from "@/lib/learning/communityReports";

export const COMMUNITY_REPORT_REASON_OPTIONS: {
  reason: CommunityReportReason;
  label: string;
}[] = [
  { reason: "spam", label: "Spam o venta invasiva" },
  { reason: "abuse", label: "Agresión o discriminación" },
  { reason: "misleading", label: "Promesa falsa o engañosa" },
  { reason: "privacy", label: "Expone datos personales" },
  { reason: "other", label: "Otro motivo" },
];

export const COMMUNITY_REPORT_CONFIRMATION =
  "Gracias. El reporte quedó registrado para revisión del equipo.";
