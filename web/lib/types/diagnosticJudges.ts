export type DiagnosticJudgeSoftVerdict =
  | "weak_similarity_warning"
  | "frontier_note"
  | "aligned_with_caution";

export type DiagnosticJudgeVerdict =
  | "aligned"
  | "frontier"
  | "conflict"
  | "red_flag"
  | "human_review_recommended"
  | DiagnosticJudgeSoftVerdict;

export type DiagnosticJudgeFinding = {
  judgeId: string;
  verdict: DiagnosticJudgeVerdict;
  family?: string;
  confidence: number;
  reason: string;
  evidence: string[];
};

export type DiagnosticReviewReport = {
  finalVerdict: DiagnosticJudgeVerdict;
  recommendedPrimaryFamily?: string;
  recommendedFrontier?: string[];
  shouldRequestHumanReview: boolean;
  findings: DiagnosticJudgeFinding[];
};