import type { ResultType, TransitionMargin } from "./result";

export type DecisionReasonCode =
  | "NO_TOP_PROFILE"
  | "TOO_FEW_SIGNALS"
  | "MINIMAL_MARGIN_WITH_COMPRESSION"
  | "CLEAR_PROFILE_UNDER_COMPRESSION"
  | "NO_PLAUSIBLE_DIRECTIONS"
  | "LOW_TOP_CONFIDENCE"
  | "SECOND_PROFILE_TOO_CLOSE"
  | "CLEAR_DIRECTION_DEFENSIBLE_FRONTIER"
  | "CLEAR_DIRECTION"
  | "FORCED_CLEAR_AFTER_CLARIFICATION"
  | "FORCED_COMPRESSED_AFTER_CLARIFICATION";

export interface DiagnosticTrace {
  signalCount: number;
  signalKeys: string[];
  topProfileLabel: string | null;
  topProfileConfidence: number | null;
  secondProfileLabel: string | null;
  secondProfileConfidence: number | null;
  plausibleDirectionLabels: string[];
  transitionMargin: TransitionMargin;
  hasCompressionNarrative: boolean;
  decisionReason: DecisionReasonCode;
  resultTypePreview: ResultType;
}