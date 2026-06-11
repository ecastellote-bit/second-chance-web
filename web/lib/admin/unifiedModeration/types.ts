export type ModerationQueueKind =
  | "seed"
  | "contribution"
  | "circle_signal"
  | "report"
  | "admin_post"
  | "project_signal"
  | "formation"
  | "notification"
  | "surface_interest"
  | "exit_feedback";

export type ModerationQuickAction = {
  id: string;
  label: string;
  variant?: "primary" | "secondary" | "danger" | "lime";
  /** PATCH body fields */
  payload: Record<string, unknown>;
  /** If true, open panel instead of auto PATCH */
  requiresPanel?: boolean;
  /** circle_idea approve needs publicText */
  needsPublicText?: boolean;
  /** POST /api/admin/user-inbox/action */
  isUserInboxAction?: boolean;
  /** Pedir confirmación liviana antes de ejecutar (visibilidad pública) */
  requiresConfirm?: boolean;
};

export type ModerationInboxItem = {
  id: string;
  kind: ModerationQueueKind;
  priority: number;
  title: string;
  excerpt: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  relatedLabel?: string;
  relatedHref?: string;
  panelHref: string;
  risk?: "report" | "flagged";
  actions: ModerationQuickAction[];
  meta?: Record<string, string | undefined>;
};

export type ModerationSummaryCounts = {
  seedsPendingReview: number;
  contributionsPendingReview: number;
  contributionsFlagged: number;
  circleIdeasPending: number;
  reportsNew: number;
  adminPostsDraft: number;
  projectSignalsActive: number;
  formationNew: number;
  notificationsPending: number;
  notificationsFailed: number;
  surfaceInterestNew: number;
  exitFeedbackNew: number;
  userInboxNeedsReply: number;
  userInboxArchived: number;
};

export type ModerationStoreAlert = {
  show: boolean;
  message: string;
  backend?: string;
  durable?: boolean;
};

export type UnifiedModerationDashboard = {
  generatedAt: string;
  counts: ModerationSummaryCounts;
  storeAlert: ModerationStoreAlert;
  items: ModerationInboxItem[];
  deepLinks: { label: string; href: string }[];
};
