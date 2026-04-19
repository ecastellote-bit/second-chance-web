import type { UserIntake } from "../types/intake";
import type { EmployabilityDirection, ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ResultType, TransitionAssessment } from "../types/result";
import type { DiagnosticTrace, DecisionReasonCode } from "../types/debug";

type ClarificationMeta = {
  roundsCompleted?: number;
};

export type ResultDecisionInput = {
  intake: UserIntake;
  signals: DetectedSignal[];
  profiles: ProbableProfile[];
  transitionAssessment: TransitionAssessment;
  plausibleDirections: EmployabilityDirection[];
  clarificationMeta?: ClarificationMeta;
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeRoundsCompleted(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 2) return 2;
  return 1;
}

export function evaluateResultDecision(
  input: ResultDecisionInput
): { resultType: ResultType; trace: DiagnosticTrace } {
  const topProfile = input.profiles[0];
  const secondProfile = input.profiles[1];

  const signalCount = input.signals.length;
  const topConfidence = topProfile?.confidence ?? 0;
  const secondConfidence = secondProfile?.confidence ?? 0;

  const rawCompressionText =
    input.intake.narrative.whatFeelsCompressedNow?.trim() ?? "";

  const normalizedCompressionText = normalizeText(rawCompressionText);

  const hasCompressionNarrative = rawCompressionText.length > 0;

  const HARD_COMPRESSION_MARKERS = [
    "solo de forma defensiva",
    "supervivencia",
    "apagar incendios",
    "apagando incendios",
    "sin margen",
    "muy por debajo",
    "no puedo mover demasiadas cosas",
    "no puedo resignar ingresos",
    "toda mi energia se va",
    "toda mi energía se va",
    "casi toda mi energia se va",
    "casi toda mi energía se va",
    "sostener funcionamiento inmediato",
    "bajar tensiones urgentes",
    "evitar rupturas",
    "reactivo",
    "urgencias",
  ];

  const MANAGEABLE_COMPRESSION_MARKERS = [
    "todavia veo una linea posible",
    "todavía veo una linea posible",
    "todavia veo una linea",
    "todavía veo una línea",
    "linea posible",
    "línea posible",
    "no solo compresion",
    "no solo compresión",
    "restricciones manejables",
    "manejables",
    "hay partes subutilizadas",
  ];

  const hasHardCompressionNarrative = HARD_COMPRESSION_MARKERS.some((marker) =>
    normalizedCompressionText.includes(normalizeText(marker))
  );

  const hasManageableCompressionNarrative =
    MANAGEABLE_COMPRESSION_MARKERS.some((marker) =>
      normalizedCompressionText.includes(normalizeText(marker))
    );

  const minimalMargin =
    input.transitionAssessment.transitionMargin === "minimal";

  const hasPlausibleDirections = input.plausibleDirections.length > 0;
  const hasStrongEnoughTopProfile = topConfidence >= 0.55;

  const hasVeryStrongTopProfile = topConfidence >= 0.85;
  const hasRobustEvidence = signalCount >= 5;

  const roundsCompleted = normalizeRoundsCompleted(
    input.clarificationMeta?.roundsCompleted
  );

  const forceAdjudication = roundsCompleted >= 2;

  let decisionReason: DecisionReasonCode;
  let resultTypePreview: ResultType;

  if (!topProfile) {
    decisionReason = "NO_TOP_PROFILE";
    resultTypePreview = "insufficient_evidence";
  } else if (signalCount < 2) {
    decisionReason = "TOO_FEW_SIGNALS";
    resultTypePreview = "insufficient_evidence";
  } else if (
    hasStrongEnoughTopProfile &&
    (
      minimalMargin ||
      (
        hasCompressionNarrative &&
        hasHardCompressionNarrative &&
        !hasManageableCompressionNarrative
      )
    )
  ) {
    decisionReason = minimalMargin
      ? "MINIMAL_MARGIN_WITH_COMPRESSION"
      : "CLEAR_PROFILE_UNDER_COMPRESSION";
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

  /**
   * Regla dura:
   * si ya se completaron Ronda 2 y Ronda 3,
   * el sistema no puede seguir devolviendo insufficient_evidence.
   */
  if (
    resultTypePreview === "insufficient_evidence" &&
    forceAdjudication &&
    topProfile
  ) {
    const canForceClear =
      hasPlausibleDirections &&
      (hasStrongEnoughTopProfile || (topConfidence >= 0.45 && signalCount >= 4));

    if (canForceClear) {
      decisionReason = "FORCED_CLEAR_AFTER_CLARIFICATION";
      resultTypePreview = "clear_direction";
    } else {
      decisionReason = "FORCED_COMPRESSED_AFTER_CLARIFICATION";
      resultTypePreview = "compressed_life";
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