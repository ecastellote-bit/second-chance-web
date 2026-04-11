import type { UserIntake } from "../types/intake";
import type { EmployabilityDirection, ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ResultType, TransitionAssessment } from "../types/result";
import type { DiagnosticTrace, DecisionReasonCode } from "../types/debug";

export type ResultDecisionInput = {
  intake: UserIntake;
  signals: DetectedSignal[];
  profiles: ProbableProfile[];
  transitionAssessment: TransitionAssessment;
  plausibleDirections: EmployabilityDirection[];
};

export function evaluateResultDecision(
  input: ResultDecisionInput
): { resultType: ResultType; trace: DiagnosticTrace } {
  const topProfile = input.profiles[0];
  const secondProfile = input.profiles[1];

  const signalCount = input.signals.length;
  const topConfidence = topProfile?.confidence ?? 0;
  const secondConfidence = secondProfile?.confidence ?? 0;

  const hasCompressionNarrative = Boolean(
    input.intake.narrative.whatFeelsCompressedNow?.trim()
  );

  const minimalMargin =
    input.transitionAssessment.transitionMargin === "minimal";

  const hasPlausibleDirections = input.plausibleDirections.length > 0;
  const hasStrongEnoughTopProfile = topConfidence >= 0.55;

  const hasVeryStrongTopProfile = topConfidence >= 0.85;
  const hasRobustEvidence = signalCount >= 5;

  let decisionReason: DecisionReasonCode;
  let resultTypePreview: ResultType;

  if (!topProfile) {
    decisionReason = "NO_TOP_PROFILE";
    resultTypePreview = "insufficient_evidence";
  } else if (signalCount < 2) {
    decisionReason = "TOO_FEW_SIGNALS";
    resultTypePreview = "insufficient_evidence";
  } else if (
    minimalMargin &&
    hasCompressionNarrative &&
    hasStrongEnoughTopProfile
  ) {
    decisionReason = "MINIMAL_MARGIN_WITH_COMPRESSION";
    resultTypePreview = "compressed_life";
  } else if (!hasPlausibleDirections) {
    decisionReason = "NO_PLAUSIBLE_DIRECTIONS";
    resultTypePreview = "insufficient_evidence";
  } else if (!hasStrongEnoughTopProfile) {
    decisionReason = "LOW_TOP_CONFIDENCE";
    resultTypePreview = "insufficient_evidence";
  } else {
    const secondTooClose =
      !!secondProfile &&
      topConfidence > 0 &&
      secondConfidence / topConfidence >= 0.995;

    const allowClearDespiteCloseSecond =
      !!secondProfile &&
      hasVeryStrongTopProfile &&
      hasRobustEvidence &&
      hasPlausibleDirections;

    if (secondTooClose && !allowClearDespiteCloseSecond) {
      decisionReason = "SECOND_PROFILE_TOO_CLOSE";
      resultTypePreview = "insufficient_evidence";
    } else {
      decisionReason = "CLEAR_DIRECTION";
      resultTypePreview = "clear_direction";
    }
  }

  return {
    resultType: resultTypePreview,
    trace: {
      signalCount,
      signalKeys: input.signals.map((signal) => signal.key),
      topProfileLabel: topProfile?.label ?? null,
      topProfileConfidence: topProfile?.confidence ?? null,
      secondProfileLabel: secondProfile?.label ?? null,
      secondProfileConfidence: secondProfile?.confidence ?? null,
      plausibleDirectionLabels: input.plausibleDirections.map(
        (direction) => direction.label
      ),
      transitionMargin: input.transitionAssessment.transitionMargin,
      hasCompressionNarrative,
      decisionReason,
      resultTypePreview,
    },
  };
}