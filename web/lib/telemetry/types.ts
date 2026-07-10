/** Nombres de eventos de telemetría interna — sin PII en properties. */
export type TelemetryEventName =
  // Base
  | "session_started"
  | "page_viewed"
  | "route_changed"
  | "cta_clicked"
  | "scroll_depth_reached"
  | "form_started"
  | "form_submitted"
  | "form_submit_success"
  | "form_submit_error"
  | "exit_intent"
  // Founder
  | "founder_landing_viewed"
  | "founder_primary_cta_clicked"
  | "founder_secondary_cta_clicked"
  | "founder_microchoice_selected"
  | "founder_story_seen"
  | "founder_exit_feedback_opened"
  | "founder_exit_feedback_submitted"
  // Diagnóstico
  | "diagnostic_started"
  | "diagnostic_step_viewed"
  | "diagnostic_step_completed"
  | "diagnostic_abandoned"
  | "diagnostic_processing_started"
  | "diagnostic_completed"
  | "diagnostic_failed"
  | "result_viewed"
  // Comunidad
  | "barrio_viewed"
  | "barrio_card_clicked"
  | "plaza_viewed"
  | "formation_viewed"
  | "formation_interest_submitted"
  | "project_viewed"
  | "project_seed_started"
  | "project_seed_submitted"
  | "circle_viewed"
  | "circle_interest_submitted"
  | "event_viewed"
  | "event_interest_submitted"
  // Admin
  | "admin_dashboard_viewed"
  | "admin_inbox_viewed"
  | "admin_signal_reviewed"
  | "admin_signal_archived"
  | "admin_signal_marked_needs_reply";

export const TELEMETRY_EVENT_NAMES: readonly TelemetryEventName[] = [
  "session_started",
  "page_viewed",
  "route_changed",
  "cta_clicked",
  "scroll_depth_reached",
  "form_started",
  "form_submitted",
  "form_submit_success",
  "form_submit_error",
  "exit_intent",
  "founder_landing_viewed",
  "founder_primary_cta_clicked",
  "founder_secondary_cta_clicked",
  "founder_microchoice_selected",
  "founder_story_seen",
  "founder_exit_feedback_opened",
  "founder_exit_feedback_submitted",
  "diagnostic_started",
  "diagnostic_step_viewed",
  "diagnostic_step_completed",
  "diagnostic_abandoned",
  "diagnostic_processing_started",
  "diagnostic_completed",
  "diagnostic_failed",
  "result_viewed",
  "barrio_viewed",
  "barrio_card_clicked",
  "plaza_viewed",
  "formation_viewed",
  "formation_interest_submitted",
  "project_viewed",
  "project_seed_started",
  "project_seed_submitted",
  "circle_viewed",
  "circle_interest_submitted",
  "event_viewed",
  "event_interest_submitted",
  "admin_dashboard_viewed",
  "admin_inbox_viewed",
  "admin_signal_reviewed",
  "admin_signal_archived",
  "admin_signal_marked_needs_reply",
] as const;

export type TelemetryPropertyValue = string | number | boolean | null;

export type TelemetryEventInput = {
  name: TelemetryEventName;
  path: string;
  properties?: Record<string, TelemetryPropertyValue>;
  timestamp?: string;
};

export type TelemetryEventRecord = {
  eventId: string;
  anonymousId: string;
  sessionId: string;
  name: TelemetryEventName;
  path: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  timestamp: string;
  properties: Record<string, TelemetryPropertyValue>;
  pii: false;
  source: "internal";
};

export type TelemetrySampleEvent = {
  eventId: string;
  name: TelemetryEventName;
  path: string;
  timestamp: string;
  properties: Record<string, TelemetryPropertyValue>;
};

export type TelemetryDailyAggregate = {
  date: string;
  totalEvents: number;
  byName: Record<string, number>;
  byPath: Record<string, number>;
  bySource: Record<string, number>;
  updatedAt: string;
  lastEventAt: string | null;
  sampleRecentEvents: TelemetrySampleEvent[];
};

export type TelemetryIngestBody = {
  name?: string;
  path?: string;
  sessionId?: string;
  anonymousId?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
};
