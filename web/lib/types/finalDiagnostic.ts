import type { ProbableProfile } from "./profiles";
import type { ResultType } from "./result";

export type DiagnosticSeverity = "low" | "medium" | "high";

/** Subtipo funcional exportable desde el composer rico del diagnóstico. */
export type FunctionalSubtypeDetail = {
  id: string;
  label: string;
  explanation: string;
};

/** Código corto desde el orchestrator o snapshot desde el composer. */
export type FunctionalSubtype = FunctionalSubtypeDetail | string;

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
  id?: string;
  label: string;
  ecosystem?: string;
  rationale?: string;
};

type BaseDiagnosticBlock = {
  title?: string;
  headline?: string;
  summary?: string;
  description?: string;
  /** Texto aclaratorio (bloques generados por motores/composer). */
  explanation?: string;
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

export type ValueGenerationBlock = BaseDiagnosticBlock & {
  headline: string;
  explanation?: string;
  body?: string;
  description?: string;
};
export type MisalignmentBlock = BaseDiagnosticBlock;
export type WorkContextBlock = BaseDiagnosticBlock;
export type MisreadRiskBlock = BaseDiagnosticBlock;

export type TransitionRecommendationBlock = BaseDiagnosticBlock & {
  transitionMode?: TransitionMode;
};

export type NextMoveBlock = BaseDiagnosticBlock & {
  /** Lista orientativa de pasos (composer); el orchestrator usa `items` / `microActions`. */
  actions?: string[];
};

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

/** Salida de `buildFinalDiagnostic` (composer standalone); forma distinta al `FinalDiagnostic` del reading. */
export type ComposerFinalDiagnostic = {
  resultType: ResultType;
  dominantProfile: DiagnosticProfileSnapshot | null;
  secondaryProfile: DiagnosticProfileSnapshot | null;
  functionalSubtype: FunctionalSubtypeDetail | null;
  valueGeneration: ValueGenerationBlock;
  currentMisalignment: MisalignmentBlock;
  bestContexts: WorkContextBlock;
  misreadRisk: MisreadRiskBlock;
  compatibleDirections: DirectionSnapshot[];
  transitionRecommendation: TransitionRecommendationBlock;
  nextMove: NextMoveBlock;
  summaryForUser: { headline: string; diagnostico: string };
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