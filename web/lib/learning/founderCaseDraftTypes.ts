export const FOUNDER_CASE_DRAFT_ROUTE = "/full" as const;
export const FOUNDER_CASE_QUESTIONNAIRE_VERSION = "full_copy_v2_integrated" as const;

export type DiagnosticCaseSource =
  | "founder_wave"
  | "direct_full_diagnostic"
  | "recovered_case";

export type FounderCaseDraftStatus =
  | "draft_started"
  | "draft_updated"
  | "submitted_before_analysis"
  | "analysis_started"
  | "analysis_failed"
  | "analysis_succeeded_pending_archive"
  | "archived"
  | "archived_minimal";

export type FounderCaseDraftLearningDisposition =
  | "raw_human_case"
  | "needs_review"
  | "do_not_influence_yet"
  | "learning_candidate"
  | "calibration_only";

export type FounderCaseDraftErrorSummary = {
  stage: string;
  message: string;
  createdAt: string;
};

export type FounderCaseDraftRecord = {
  caseId: string;
  diagnosticRunId: string;
  runNumber?: number;

  source: DiagnosticCaseSource;
  route: typeof FOUNDER_CASE_DRAFT_ROUTE;
  questionnaireVersion: typeof FOUNDER_CASE_QUESTIONNAIRE_VERSION;

  status: FounderCaseDraftStatus;

  rawAnswers: unknown;
  builtUserIntake?: unknown;

  createdAt: string;
  updatedAt: string;
  submittedAt?: string;

  archiveId?: string | null;

  analysisResultSummary?: unknown;
  analysisResultFull?: unknown;

  errorSummary?: FounderCaseDraftErrorSummary | null;

  shouldBecomeLearnedCase: false;

  learningDisposition: FounderCaseDraftLearningDisposition;

  humanReviewRequested?: boolean;
  humanReviewRequestedAt?: string | null;
  humanReviewStatus?: "pending" | "none";

  privacy: {
    containsPersonalNarrative: true;
    storage: "private_blob";
    publicExposure: false;
  };

  clientMeta?: {
    userAgent?: string;
    timezone?: string;
    language?: string;
    referrer?: string;
    reviewNote?: string;
    reviewReason?: string;
  };
};

export type FounderCaseDraftStatusPublic = {
  exists: boolean;
  caseId: string;
  diagnosticRunId: string | null;
  status: FounderCaseDraftStatus | null;
  updatedAt: string | null;
  submittedAt: string | null;
  archiveId: string | null;
  source: DiagnosticCaseSource | null;
  questionnaireVersion: string | null;
  runNumber: number | null;
  humanReviewRequested: boolean;
  serverPreservationConfirmed: boolean;
};
