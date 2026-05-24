export type CommunityActivityType =
  | "diagnostic_completed"
  | "theme_selected"
  | "activation_selected"
  | "project_seeded"
  | "project_interest"
  | "circle_saved"
  | "formation_interest"
  | "event_interest"
  | "system_next_step";

export type CommunityActivitySource = "system" | "user_action" | "team";

export type CommunityActivityStatus =
  | "visible"
  | "pending_review"
  | "completed"
  | "informational";

export type CommunityActivityItem = {
  id: string;
  userId: string | null;
  archiveId: string | null;
  createdAt: string;
  type: CommunityActivityType;
  title: string;
  body: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  source: CommunityActivitySource;
  status: CommunityActivityStatus;
  dedupeKey?: string | null;
  meta?: Record<string, string | null> | null;
};

export type CommunityMessageFrom = "VocationUp" | "Equipo fundador" | "Sistema";

export type CommunityMessageKind =
  | "project_received"
  | "next_step"
  | "interest_confirmation"
  | "review_pending"
  | "community_seed";

export type CommunityMessageStatus = "unread" | "read";

export type CommunityMessage = {
  id: string;
  userId: string | null;
  archiveId: string | null;
  createdAt: string;
  from: CommunityMessageFrom;
  subject: string;
  body: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  status: CommunityMessageStatus;
  kind: CommunityMessageKind;
  dedupeKey?: string | null;
  meta?: Record<string, string | null> | null;
};

export type CommunityUserInbox = {
  recordType: "community_user_inbox";
  userId: string;
  updatedAt: string;
  activities: CommunityActivityItem[];
  messages: CommunityMessage[];
};
