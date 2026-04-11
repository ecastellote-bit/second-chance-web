import type { ProbableProfile } from "./profiles";

export type DiagnosticSeverity = "low" | "medium" | "high";
export type FunctionalSubtype = string;

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

export type DirectionSnapshot = {
  label: string;
  ecosystem?: string;
  rationale?: string;
};

type BaseDiagnosticBlock = {
  title?: string;
  headline?: string;
  summary?: string;
  description?: string;
  rationale?: string;
  severity?: DiagnosticSeverity;
  subtype?: string;
  bullets?: string[];
  items?: string[];
  microActions?: string[];
  firstMoves?: string[];
  signals?: string[];
  evidenceKeys?: string[];
  warnings?: string[];
};

export type ValueGenerationBlock = BaseDiagnosticBlock;
export type MisalignmentBlock = BaseDiagnosticBlock;
export type WorkContextBlock = BaseDiagnosticBlock;
export type MisreadRiskBlock = BaseDiagnosticBlock;

export type TransitionRecommendationBlock = BaseDiagnosticBlock & {
  transitionMode?: TransitionMode;
};

export type NextMoveBlock = BaseDiagnosticBlock;

export type FinalDiagnostic = {
  severity: DiagnosticSeverity;
  functionalSubtype: FunctionalSubtype;
  profileSnapshot: DiagnosticProfileSnapshot | null;
  secondaryProfileSnapshot?: DiagnosticProfileSnapshot | null;
  directions?: DirectionSnapshot[];

  valueGeneration: ValueGenerationBlock;
  currentMisalignment: MisalignmentBlock;
  bestWorkContexts: WorkContextBlock;
  misreadRisk: MisreadRiskBlock;
  transitionRecommendation: TransitionRecommendationBlock;
  nextMove: NextMoveBlock;
};

export function toDiagnosticProfileSnapshot(
  profile: ProbableProfile | null | undefined,
): DiagnosticProfileSnapshot | null {
  if (!profile) return null;

  return {
    id: profile.id,
    label: profile.label,
    summary: profile.summary,
    confidence: profile.confidence,
  };
}