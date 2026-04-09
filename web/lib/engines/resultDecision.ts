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

const HARD_COMPRESSION_CUES = [
  "vida actual esta claramente comprimida",
  "forma defensiva",
  "reactiva",
  "tactica",
  "funcionamiento inmediato",
  "sostener funcionamiento inmediato",
  "urgencias",
  "muy poco margen real",
  "no puedo mover demasiadas cosas",
  "no puedo resignar ingresos ahora",
  "responsabilidades",
  "por debajo de lo que podria desplegar",
  "por debajo de lo que podria usar",
  "apagando incendios",
  "apago incendios",
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getCompressionCueCount(intake: UserIntake): number {
  const text = normalizeText(
    [
      intake.narrative.whatFeelsCompressedNow,
      intake.narrative.lossesOrRenunciations,
      intake.currentContext.currentSituation,
      ...(intake.currentContext.restrictions ?? []),
    ]
      .filter(Boolean)
      .join(" ")
  );

  return HARD_COMPRESSION_CUES.filter((cue) =>
    text.includes(normalizeText(cue))
  ).length;
}

function hasHardCompression(
  intake: UserIntake,
  topConfidence: number
): boolean {
  const hasCompressionNarrative = Boolean(
    intake.narrative.whatFeelsCompressedNow?.trim()
  );

  const restrictionCount = intake.currentContext.restrictions?.length ?? 0;
  const compressionCueCount = getCompressionCueCount(intake);

  return (
    hasCompressionNarrative &&
    restrictionCount >= 2 &&
    compressionCueCount >= 4 &&
    topConfidence >= 0.7
  );
}

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

  const hardCompression = hasHardCompression(input.intake, topConfidence);

  const hasPlausibleDirections = input.plausibleDirections.length > 0;
  const hasStrongEnoughTopProfile = topConfidence >= 0.55;

  let decisionReason: DecisionReasonCode;
  let resultTypePreview: ResultType;

  if (!topProfile) {
    decisionReason = "NO_TOP_PROFILE";
    resultTypePreview = "insufficient_evidence";
  } else if (signalCount < 2) {
    decisionReason = "TOO_FEW_SIGNALS";
    resultTypePreview = "insufficient_evidence";
  } else if (
    (minimalMargin && hasCompressionNarrative && hasStrongEnoughTopProfile) ||
    hardCompression
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
      secondConfidence / topConfidence >= 0.92;

    if (secondTooClose) {
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