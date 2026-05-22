import type { ProfileFamilyId } from "./profileFamilies";

export type NarrativeCoherenceVerdict =
  | "aligned"
  | "frontier"
  | "narrative_mismatch"
  | "red_flag";

/** Eje A: ¿la top del motor resuena con la historia adulta? */
export type NarrativeDirectionFit = "aligned" | "frontier" | "mismatch";

/** Eje B: compresión vital en la narrativa vs cierre del motor. */
export type NarrativeCompressionConcern = "none" | "moderate" | "high";

/** Riesgo de cierre público demasiado fuerte. */
export type NarrativeClosureRisk = "ok" | "too_closed" | "compressed_ignored";

export type NarrativeRiskFlagType =
  | "lexical_trap"
  | "narrative_distortion"
  | "compressed_life_undetected"
  | "false_rivalry";

export type NarrativeRiskSeverity = "low" | "medium" | "high";

export type NarrativeRiskFlag = {
  type: NarrativeRiskFlagType;
  description: string;
  severity: NarrativeRiskSeverity;
  /** Par de familias en trampa léxica (si aplica). */
  suspectedPair?: [ProfileFamilyId, ProfileFamilyId];
};

export type NarrativeAlternativeFamily = {
  familyId: ProfileFamilyId;
  reason: string;
};

export type NarrativeFamilyResolution =
  | "alternative_promoted_over_motor_echo"
  | "motor_echo_cleared_no_alternative"
  | "failure_ref_motor_acceptable";

export type NarrativeCoherenceReview = {
  judgeId: "narrative_coherence_judge";
  verdict: NarrativeCoherenceVerdict;
  confidence: number;
  reason: string;
  evidence: string[];
  family?: ProfileFamilyId;
  familyResolution?: NarrativeFamilyResolution;
  narrativeSummary: string;
  coreTension: string;
  /** Rol actual como sostén económico/emocional (no vocación). */
  sostenActual?: string;
  alternativeFamilies: NarrativeAlternativeFamily[];
  riskFlags: NarrativeRiskFlag[];
  directionFit: NarrativeDirectionFit;
  compressionConcern: NarrativeCompressionConcern;
  closureRisk: NarrativeClosureRisk;
};

export type NarrativeCoherenceJudgeResult = {
  ok: boolean;
  review: NarrativeCoherenceReview | null;
  latencyMs: number;
  error?: string;
  skipped?: boolean;
};
