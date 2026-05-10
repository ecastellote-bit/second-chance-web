import type { ProfileFamilyId } from "./profileFamilies";

export type NegativeEvidenceVerdict =
  | "keep_candidate"
  | "watch_candidate"
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
  shouldAffectScoreNow: false;
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
  shadowAdjustedRankingPreview: NegativeEvidenceShadowRankingItem[];
  wouldChangeTopFamily: boolean;
  wouldOpenFrontier: boolean;
  wouldCloseFrontier: boolean;
  summary: string;
  warnings: string[];
};
