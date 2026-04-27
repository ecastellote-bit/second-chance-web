export type LearningObservationType =
  | "frontier_rule"
  | "partial_lesson"
  | "contextual_marker"
  | "counterweight"
  | "misread_warning"
  | "contradiction_red_flag"
  | "weak_noise";

export type LearningUseRecommendation =
  | "full_case"
  | "partial_lesson"
  | "frontier_support"
  | "counterweight"
  | "misread_warning"
  | "do_not_learn_yet";

export type DistillationVerdict =
  | "collect_partial_learning"
  | "promote_to_learned_case_candidate"
  | "requires_human_review"
  | "no_useful_learning";

export type ContextualMarker = {
  marker: string;
  supportsFamilies: string[];
  contextMeaning: string;
  notEnoughFor?: string[];
};

export type LearningObservation = {
  id: string;
  type: LearningObservationType;
  families: string[];
  primaryFamily?: string;
  secondaryFamily?: string;
  strength: number;
  lesson: string;
  conditions?: string[];
  positiveMarkers?: string[];
  negativeMarkers?: string[];
  contextualMarkers?: ContextualMarker[];
  misreadWarnings?: string[];
  sourceCaseIds?: string[];
  shouldInfluenceFutureCases: boolean;
  requiresHumanApproval: boolean;
};

export type ExtractedLearningLesson = {
  type: LearningObservationType;
  families: string[];
  primaryFamily?: string;
  secondaryFamily?: string;
  strength: number;
  lesson: string;
  conditions?: string[];
  positiveMarkers?: string[];
  negativeMarkers?: string[];
  contextualMarkers?: ContextualMarker[];
  misreadWarnings?: string[];
  requiresHumanApproval: boolean;
};

export type DiagnosticExperienceDistillation = {
  verdict: DistillationVerdict;
  recommendedLearningUse: LearningUseRecommendation;
  shouldBecomeFullLearnedCase: boolean;
  shouldCreateObservation: boolean;
  shouldRaiseRedFlag: boolean;
  confidence: number;
  summary: string;
  extractedLessons: ExtractedLearningLesson[];
  contextualMarkers: ContextualMarker[];
  misreadWarnings: string[];
  notes: string[];
};

export type DiagnosticExperienceDistillerInput = {
  sourceInput?: unknown;
  currentResult?: unknown;
  finalReading?: unknown;
  learningSignal?: unknown;
  diagnosticReview?: unknown;
  humanReview?: unknown;
};