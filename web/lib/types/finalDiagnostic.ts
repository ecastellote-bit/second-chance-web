import type { ResultType } from "./result";
import type { EmployabilityDirection, ProbableProfile } from "./profiles";

export type DiagnosticSeverity = "low" | "medium" | "high";

export type TransitionMode =
  | "gradual_lateral"
  | "guided_repositioning"
  | "compressed_but_clear"
  | "needs_confirmation"
  | "not_ready_to_move";

export type DiagnosticProfileSnapshot = {
  id: string;
  label: string;
  summary: string;
  confidence: number;
};

export type FunctionalSubtype = {
  id: string;
  label: string;
  explanation: string;
};

export type ValueGenerationBlock = {
  headline: string;
  explanation: string;
  evidenceKeys: string[];
};

export type MisalignmentBlock = {
  headline: string;
  explanation: string;
  severity: DiagnosticSeverity;
  evidenceKeys: string[];
};

export type WorkContextBlock = {
  headline: string;
  explanation: string;
  environmentMarkers: string[];
};

export type MisreadRiskBlock = {
  headline: string;
  explanation: string;
  mistakenFor: string[];
};

export type TransitionRecommendationBlock = {
  mode: TransitionMode;
  headline: string;
  explanation: string;
  rationale: string;
};

export type NextMoveBlock = {
  headline: string;
  explanation: string;
  actions: string[];
};

export type DirectionSnapshot = Pick<
  EmployabilityDirection,
  "id" | "ecosystem" | "label" | "whyItFits"
>;

export type FinalDiagnostic = {
  resultType: ResultType;

  dominantProfile: DiagnosticProfileSnapshot | null;
  secondaryProfile: DiagnosticProfileSnapshot | null;

  functionalSubtype: FunctionalSubtype | null;

  valueGeneration: ValueGenerationBlock;
  currentMisalignment: MisalignmentBlock;
  bestContexts: WorkContextBlock;
  misreadRisk: MisreadRiskBlock;

  compatibleDirections: DirectionSnapshot[];
  transitionRecommendation: TransitionRecommendationBlock;
  nextMove: NextMoveBlock;

  summaryForUser: {
    headline: string;
    diagnostico: string;
  };
};

export function toDiagnosticProfileSnapshot(
  profile: ProbableProfile | null | undefined
): DiagnosticProfileSnapshot | null {
  if (!profile) return null;

  return {
    id: profile.id,
    label: profile.label,
    summary: profile.summary,
    confidence: profile.confidence,
  };
}