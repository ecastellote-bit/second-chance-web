export const FOUNDER_CASE_DRAFT_SOURCE = "founder_wave" as const;
export const FOUNDER_CASE_DRAFT_ROUTE = "/full" as const;
export const FOUNDER_CASE_QUESTIONNAIRE_VERSION = "full_copy_v2_integrated" as const;

export type FounderCaseDraftStatus =
  | "draft_started"
  | "draft_updated"
  | "submitted_before_analysis"
  | "analysis_started"
  | "analysis_failed"
  | "analysis_succeeded_pending_archive"
  | "archived";

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

  source: typeof FOUNDER_CASE_DRAFT_SOURCE;
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
  source: typeof FOUNDER_CASE_DRAFT_SOURCE | null;
  questionnaireVersion: string | null;
  runNumber: number | null;
};
