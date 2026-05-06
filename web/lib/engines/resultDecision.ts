import type { UserIntake } from "../types/intake";
import type { EmployabilityDirection, ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ResultType, TransitionAssessment } from "../types/result";
import type { DiagnosticTrace, DecisionReasonCode } from "../types/debug";

type ClarificationMeta = {
  roundsCompleted?: number;
};

type FamilyScoreLike = {
  label?: string;
  familyLabel?: string;
  family?: string;
  score?: number;
  confidence?: number;
};

export type ResultDecisionInput = {
  intake: UserIntake;
  signals: DetectedSignal[];
  profiles: ProbableProfile[];
  transitionAssessment: TransitionAssessment;
  plausibleDirections: EmployabilityDirection[];
  clarificationMeta?: ClarificationMeta;
  familyScores?: FamilyScoreLike[];
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

function getFamilyDecisionView(familyScores?: FamilyScoreLike[]) {
  const top = familyScores?.[0];
  const second = familyScores?.[1];

  return {
    topFamilyLabel: top?.familyLabel ?? top?.label ?? top?.family ?? null,
    topFamilyScore:
      typeof top?.score === "number" && Number.isFinite(top.score) ? top.score : 0,
    topFamilyConfidence:
      typeof top?.confidence === "number" && Number.isFinite(top.confidence)
        ? top.confidence
        : 0,
    secondFamilyLabel: second?.familyLabel ?? second?.label ?? second?.family ?? null,
    secondFamilyScore:
      typeof second?.score === "number" && Number.isFinite(second.score) ? second.score : 0,
    secondFamilyConfidence:
      typeof second?.confidence === "number" && Number.isFinite(second.confidence)
        ? second.confidence
        : 0,
  };
}

export function evaluateResultDecision(
  input: ResultDecisionInput
): { resultType: ResultType; trace: DiagnosticTrace } {
  const topProfile = input.profiles[0];
  const secondProfile = input.profiles[1];

  const signalCount = input.signals.length;
  const topConfidence = topProfile?.confidence ?? 0;
  const secondConfidence = secondProfile?.confidence ?? 0;

  const familyView = getFamilyDecisionView(input.familyScores);

  const useFamilyDecisionLayer =
    !!familyView.topFamilyLabel &&
    (familyView.topFamilyScore > 0 || familyView.topFamilyConfidence > 0);

  const hasAnyTopSurface =
    !!topProfile ||
    useFamilyDecisionLayer ||
    familyView.topFamilyScore > 0 ||
    familyView.topFamilyConfidence > 0;

  const hasStrongEnoughTopProfile = topConfidence >= 0.55;
  const hasVeryStrongTopProfile = topConfidence >= 0.85;

  const hasStrongEnoughTopFamily =
    familyView.topFamilyScore >= 0.45 || familyView.topFamilyConfidence >= 0.6;

  const hasVeryStrongTopFamily =
    familyView.topFamilyScore >= 0.62 || familyView.topFamilyConfidence >= 0.8;

  const topLayerStrongEnough = useFamilyDecisionLayer
    ? hasStrongEnoughTopFamily
    : hasStrongEnoughTopProfile;

  const compressionSurface = [
    input.intake.narrative.whatFeelsCompressedNow ?? "",
    input.intake.currentContext.currentSituation ?? "",
    ...(input.intake.currentContext.restrictions ?? []),
    input.intake.narrative.lossesOrRenunciations ?? "",
    input.intake.narrative.additionalContext ?? "",
  ]
    .join(" ")
    .trim();

  const normalizedCompressionText = normalizeText(compressionSurface);

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
    "apagar lo urgente",
    "modo bombero",
    "no en algo propio",
    "poco margen mental",
    "casi no puedo usar mi mejor criterio",
    "piloto automatico",
    "piloto automático",
    "me drena",
    "que no explote nada",
    "para que no explote nada",
    "tomado por obligaciones",
    "bastante tomado por obligaciones",
    "se va en apagar roces",
    "bajar tensiones",
    "evitar choques",
    "en modo defensivo",
  ];

  const SOFT_COMPRESSION_MARKERS = [
    "aparece de a ratos",
    "no como eje",
    "no como eje principal",
    "no como frente principal",
    "aparece lateral",
    "aparece de costado",
    "medio arrumbada",
    "no esta muerta",
    "no está muerta",
    "no estoy destruido",
    "no estoy roto",
    "hay algo apagado",
    "no estoy mudo ni apagado del todo",
    "no estoy apagado del todo",
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

  const hasSoftCompressionNarrative = SOFT_COMPRESSION_MARKERS.some((marker) =>
    normalizedCompressionText.includes(normalizeText(marker))
  );

  const hasManageableCompressionNarrative = MANAGEABLE_COMPRESSION_MARKERS.some(
    (marker) => normalizedCompressionText.includes(normalizeText(marker))
  );

  const hasCompressionNarrative =
    hasHardCompressionNarrative ||
    hasSoftCompressionNarrative ||
    hasManageableCompressionNarrative;

  const minimalMargin = input.transitionAssessment.transitionMargin === "minimal";

  const hasHardCompressionPressure =
    hasCompressionNarrative &&
    hasHardCompressionNarrative &&
    !hasManageableCompressionNarrative &&
    !hasSoftCompressionNarrative;

  // Minimal transition margin is a constraint signal, not enough by itself
  // to override a clear family direction into compressed_life.
  const compressionPushesToCompressedLife = hasHardCompressionPressure;

  const hasPlausibleDirections = input.plausibleDirections.length > 0;
  const hasRobustEvidence = signalCount >= 5;

  const roundsCompleted = normalizeRoundsCompleted(
    input.clarificationMeta?.roundsCompleted
  );

  const forceAdjudication = roundsCompleted >= 2;

  let decisionReason: DecisionReasonCode;
  let resultTypePreview: ResultType;

  if (!hasAnyTopSurface) {
    decisionReason = "NO_TOP_PROFILE";
    resultTypePreview = "insufficient_evidence";
  } else if (signalCount < 2) {
    decisionReason = "TOO_FEW_SIGNALS";
    resultTypePreview = "insufficient_evidence";
  } else if (topLayerStrongEnough && compressionPushesToCompressedLife) {
    decisionReason = minimalMargin
      ? "MINIMAL_MARGIN_WITH_COMPRESSION"
      : "CLEAR_PROFILE_UNDER_COMPRESSION";
    resultTypePreview = "compressed_life";
  } else if (!hasPlausibleDirections) {
    decisionReason = "NO_PLAUSIBLE_DIRECTIONS";
    resultTypePreview = "insufficient_evidence";
  } else if (!topLayerStrongEnough) {
    decisionReason = "LOW_TOP_CONFIDENCE";
    resultTypePreview = "insufficient_evidence";
  } else {
    const profileSecondTooClose =
      !!secondProfile &&
      topConfidence > 0 &&
      secondConfidence / topConfidence >= 0.995;

    const familySecondTooClose =
      useFamilyDecisionLayer &&
      familyView.secondFamilyScore > 0 &&
      familyView.topFamilyScore > 0 &&
      familyView.secondFamilyScore / familyView.topFamilyScore >= 0.92;

    const familyDominanceGap =
      familyView.topFamilyScore - familyView.secondFamilyScore;

    const familyClearlyAhead =
      useFamilyDecisionLayer &&
      hasStrongEnoughTopFamily &&
      familyDominanceGap >= 0.08;

    const secondTooClose = useFamilyDecisionLayer
      ? familySecondTooClose && !familyClearlyAhead
      : profileSecondTooClose;

    const allowClearDespiteCloseSecond = useFamilyDecisionLayer
      ? familyClearlyAhead || (hasVeryStrongTopFamily && hasPlausibleDirections)
      : !!secondProfile &&
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

  if (
    resultTypePreview === "insufficient_evidence" &&
    forceAdjudication &&
    hasAnyTopSurface
  ) {
    const canForceClear =
      hasPlausibleDirections &&
      (topLayerStrongEnough ||
        (topConfidence >= 0.45 && signalCount >= 4) ||
        (familyView.topFamilyScore >= 0.4 && signalCount >= 4));

    if (canForceClear) {
      decisionReason = "FORCED_CLEAR_AFTER_CLARIFICATION";
      resultTypePreview = "clear_direction";
    } else if (topLayerStrongEnough && compressionPushesToCompressedLife) {
      decisionReason = minimalMargin
        ? "MINIMAL_MARGIN_WITH_COMPRESSION"
        : "CLEAR_PROFILE_UNDER_COMPRESSION";
      resultTypePreview = "compressed_life";
    } else {
      decisionReason = "FORCED_COMPRESSED_AFTER_CLARIFICATION";
      resultTypePreview = "compressed_life";
    }
  }

  const traceTopLabel = useFamilyDecisionLayer
    ? familyView.topFamilyLabel
    : topProfile?.label ?? familyView.topFamilyLabel ?? null;

  const traceTopConfidence = useFamilyDecisionLayer
    ? familyView.topFamilyConfidence > 0
      ? familyView.topFamilyConfidence
      : familyView.topFamilyScore > 0
        ? familyView.topFamilyScore
        : null
    : topProfile?.confidence ??
      (familyView.topFamilyConfidence > 0 ? familyView.topFamilyConfidence : null);

  const traceSecondLabel = useFamilyDecisionLayer
    ? familyView.secondFamilyLabel
    : secondProfile?.label ?? familyView.secondFamilyLabel ?? null;

  const traceSecondConfidence = useFamilyDecisionLayer
    ? familyView.secondFamilyConfidence > 0
      ? familyView.secondFamilyConfidence
      : familyView.secondFamilyScore > 0
        ? familyView.secondFamilyScore
        : null
    : secondProfile?.confidence ??
      (familyView.secondFamilyConfidence > 0
        ? familyView.secondFamilyConfidence
        : null);

  return {
    resultType: resultTypePreview,
    trace: {
      signalCount,
      signalKeys: input.signals.map((signal) => signal.key),
      topProfileLabel: traceTopLabel,
      topProfileConfidence: traceTopConfidence,
      secondProfileLabel: traceSecondLabel,
      secondProfileConfidence: traceSecondConfidence,
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