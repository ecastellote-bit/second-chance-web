export type LearningSource =
  | "user_test"
  | "internet_research"
  | "manual_synthetic"
  | "real_user"
  | "local_archive";

export type LearningReviewStatus =
  | "unreviewed"
  | "reviewed"
  | "learning_candidate"
  | "archived";

  export type LearningVerdict =
  | "passed"
  | "failed"
  | "borderline"
  | "learning_candidate";

export type UserFeedbackAccuracy = "yes" | "partial" | "no";

export type DiagnosticLearningLog = {
  id: string;
  createdAt: string;
  systemVersion: string;

  intake: unknown;

  diagnosticOutput: {
    resultType: string;
    corePattern: string;
    familyScores: unknown[];
    affinityScores?: unknown[];
    topAffinities?: unknown[];
    buriedCapacities?: unknown[];
    trace?: unknown;
  };

  followup?: {
    wasAsked: boolean;
    round?: number | null;
    ambiguityType?: string | null;
    answers?: unknown;
  };

  userFeedback?: {
    feltAccurate?: UserFeedbackAccuracy;
    selectedBestFitFamily?: string;
    rejectedMainFamily?: boolean;
    comment?: string;
    submittedAt?: string;
  };

  reviewerNotes?: {
    expectedFamily?: string;
    acceptableFamilies?: string[];
    missedSignals?: string[];
    suspectedBlindSpots?: string[];
    suggestedFix?: string;
    reviewedAt?: string;
  };

  reviewStatus: LearningReviewStatus;
};

export type CaseDifficultyTier =
  | "anchor"
  | "frontier"
  | "hard"
  | "failure_reference";

export type LearnedDiagnosticCase = {
  id: string;
  title: string;
  source: LearningSource;
  language: "es";
  region?: string;

  inputText: string;

  expectedPrimaryFamily: string;
  acceptableFamilies: string[];
  rivalFamilies: string[];

  keyHumanLanguage: string[];
  missingCuesDetected?: string[];

  actualResult?: {
    corePattern: string;
    resultType: string;
    familyScores: unknown[];
  };

  verdict: LearningVerdict;
  lesson: string;

  shouldInfluenceFutureCases: boolean;

  difficultyTier?: CaseDifficultyTier;
  failureContext?: {
    whatWentWrong: string;
    confusedWith?: string[];
    missingSignals?: string[];
    correctedFamily?: string;
    humanVerified?: boolean;
  };
};

export type SimilarCaseMatch = {
  caseId: string;
  title: string;
  similarityScore: number;
  expectedPrimaryFamily: string;
  acceptableFamilies: string[];
  rivalFamilies: string[];
  matchedLanguage: string[];
  lesson: string;
};

export type LearningSignal = {
    strongestHistoricalFamily?: string;
    similarCases: SimilarCaseMatch[];
    warning?: string;
    shouldRaiseRedFlag: boolean;
    learningAssistedHypothesis?: {
      family: string;
      reason: string;
      confidence: number;
      basedOnCases: number;
    };
    cautionFromFailures?: {
      active: boolean;
      matchedFailures: string[];
      avoidFamilies: string[];
      lesson: string;
    };
}; 

export type DiagnosticReviewLayer = {
  agreesWithMainResult: boolean;
  concernLevel: "low" | "medium" | "high";
  reasons: string[];
  recommendedAction:
    | "accept_result"
    | "show_secondary_family"
    | "ask_followup"
    | "raise_human_review"
    | "adjust_with_similar_cases";
};