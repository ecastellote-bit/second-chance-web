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
  /**
   * Legacy shadow-ranking gate (top vs second rivalry).
   * @deprecated Prefer `excludedFromCandidates` in production_exclusion mode.
   */
  shouldAffectScoreNow: boolean;
  /** True cuando la familia queda fuera del universo candidato (misión del juez). */
  excludedFromCandidates?: boolean;
  /** Regla estructural que sustenta el descarte (trazabilidad anti-cebado). */
  rivalRuleId?: string;
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

export type NegativeEvidenceReviewMode =
  | "production_exclusion"
  | "audit_only_shadow_preview";

export type NegativeEvidenceReview = {
  mode: NegativeEvidenceReviewMode;
  /** Familias evaluadas (22 del registro). */
  evaluatedFamilies: NegativeEvidenceFinding[];
  originalRanking: NegativeEvidenceRankingItem[];
  /** Ranking sombra legacy (penalizaciones gated top/second). */
  shadowAdjustedRankingPreview: NegativeEvidenceShadowRankingItem[];
  /** IDs excluidos del universo candidato en producción. */
  excludedFamilyIds: string[];
  eligibleFamilyCount: number;
  /** True si las exclusiones se aplicaron al pipeline. */
  exclusionsApplied: boolean;
  /** Familias candidatas para auditoría downstream (narrativa, etc.). */
  eligibleFamiliesForAudit: string[];
  originalTopFamilyId?: string | null;
  effectiveTopFamilyId?: string | null;
  topFamilyChangedByExclusion?: boolean;
  wouldChangeTopFamily: boolean;
  wouldOpenFrontier: boolean;
  wouldCloseFrontier: boolean;
  wouldAffectRealResult: boolean;
  humanReviewSuggested: boolean;
  frontierPatternNeedsReview: boolean;
  summary: string;
  warnings: string[];
};
