import type { ProfileFamilyId } from "./profileFamilies";

export type NegativeEvidenceVerdict =
  | "keep_candidate"
  | "watch_candidate"
  | "frontier_candidate"
  | "soft_discard"
  | "strong_discard"
  | "insufficient_negative_evidence";

export type NegativeEvidenceFinding = {
  familyId: ProfileFamilyId | string;
  familyLabel: string;
  originalRank?: number;
  originalScore?: number;
  verdict: NegativeEvidenceVerdict;
  strength: number;
  suggestedPenalty?: number;
  reasons: string[];
  supportingEvidence?: string[];
  contradictingEvidence?: string[];
  riskNotes?: string[];
  /** True only when strict discard gates pass (rivalry control), never for audit-only flags alone. */
  shouldAffectScoreNow: boolean;
};

export type NegativeEvidenceRankingItem = {
  familyId: string;
  score: number;
  rank: number;
};

export type NegativeEvidenceShadowRankingItem = {
  familyId: string;
  originalScore: number;
  shadowScore: number;
  originalRank: number;
  shadowRank: number;
};

export type NegativeEvidenceReview = {
  mode: "audit_only_shadow_preview";
  evaluatedFamilies: NegativeEvidenceFinding[];
  originalRanking: NegativeEvidenceRankingItem[];
  /** Ranking sombra: sólo resta penalizaciones con `shouldAffectScoreNow` (gates estrictos). */
  shadowAdjustedRankingPreview: NegativeEvidenceShadowRankingItem[];
  /** True si el top sombra (gated) difiere del top original. */
  wouldChangeTopFamily: boolean;
  wouldOpenFrontier: boolean;
  wouldCloseFrontier: boolean;
  /** Igual a `wouldChangeTopFamily` en modo gated; explícito para /lab. */
  wouldAffectRealResult: boolean;
  humanReviewSuggested: boolean;
  frontierPatternNeedsReview: boolean;
  summary: string;
  warnings: string[];
};
