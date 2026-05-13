export type DiagnosticCandidateUse =
  | "seed_case"
  | "candidate_learned_case"
  | "calibration_only"
  | "review_queue"
  | "rejected_for_influence";

export type DiagnosticCandidateCategory =
  | "family_anchor"
  | "subfamily_anchor"
  | "frontier_case"
  | "compression_case"
  | "insufficient_evidence_case"
  | "false_positive_trap"
  | "negative_control";

export type DiagnosticCandidateExpected = {
  resultType: "clear_direction" | "compressed_life" | "insufficient_evidence";
  primaryFamily?: string;
  acceptablePrimaryFamilies?: string[];
  acceptableSecondaryFamilies?: string[];
  rivalFamilies?: string[];
  shouldNotWin?: string[];
  coreAffinities?: string[];
  supportingAffinities?: string[];
  buriedAffinities?: string[];
  expectedCompression?: boolean;
  expectedFrontier?: boolean;
  expectedFollowUp?: boolean;
};

export type DiagnosticCandidateUserInput = {
  currentSituation: string;
  repeatedPatterns: string;
  compressedLife?: string;
  restrictions?: string;
  assets?: string;
  childhoodMemories?: string;
  earlyFascinations?: string;
  meaningfulSubjects?: string;
  naturalSocialRoles?: string;
  additionalNote?: string;
};

export type DiagnosticCandidateValidation = {
  passCriteria: string[];
  reviewCriteria: string[];
  failCriteria: string[];
  recommendedInitialUse: DiagnosticCandidateUse;
  notes?: string;
};

export type DiagnosticCandidateQualityFlags = {
  containsTechnicalLabels?: boolean;
  feelsArtificial?: boolean;
  tooKeywordStuffed?: boolean;
  needsHumanReview?: boolean;
};

export type DiagnosticCandidateCase = {
  id: string;
  title: string;
  category: DiagnosticCandidateCategory;
  source: string;
  language: "es";
  region?: "argentina" | "rioplatense" | "latam_neutral" | "mixed";
  register?: "natural" | "rough" | "reflective" | "compressed" | "professional";
  expected: DiagnosticCandidateExpected;
  userInput: DiagnosticCandidateUserInput;
  validation: DiagnosticCandidateValidation;
  qualityFlags?: DiagnosticCandidateQualityFlags;
};
