import type { FinalReading } from "../types/result";
import type { ResultType } from "../types/result";
import type {
  ProfileFamilyId,
  ProfileFamilyScore,
} from "../types/profileFamilies";
import type {
  NarrativeCoherenceReview,
  NarrativeFamilyResolution,
} from "../types/narrativeCoherence";
import { PROFILE_FAMILIES } from "../registries/profileFamilies";

function isRegistryFrontierPair(
  a: string | undefined,
  b: string | undefined,
): boolean {
  if (!a || !b || a === b) return false;
  const key = `${a}|${b}`;
  const reverse = `${b}|${a}`;
  const known = new Set([
    "public_communicator|diplomatic_social_connector",
    "creative_storyteller|artistic_creator",
    "empathic_guide|community_builder",
  ]);
  if (known.has(key) || known.has(reverse)) return true;
  const motorDef = PROFILE_FAMILIES.find((f) => f.id === a);
  const otherDef = PROFILE_FAMILIES.find((f) => f.id === b);
  return (
    motorDef?.misreadAs?.includes(b as ProfileFamilyId) === true ||
    otherDef?.misreadAs?.includes(a as ProfileFamilyId) === true
  );
}

const FAMILY_LABEL_BY_ID = new Map(
  PROFILE_FAMILIES.map((f) => [f.id, f.label]),
);

/** Umbral de confianza para palanca de frontera (fase de prueba; conservador). */
const MISMATCH_FRONTIER_CONFIDENCE = 0.75;

export type NarrativeAdjudicationTrace = {
  applied: boolean;
  levers: (
    | "compression_veto"
    | "mismatch_frontier"
    | "compression_soften"
    | "frontier_copy"
  )[];
  previousResultType: ResultType;
  motorTopFamilyId?: string;
  familyResolution?: NarrativeFamilyResolution;
  vetoedClearDirection: boolean;
};

export function getMotorTopFamilyId(
  familyScores: ProfileFamilyScore[] | undefined,
): string | undefined {
  if (!familyScores?.length) return undefined;

  const sorted = [...familyScores].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0),
  );
  const top = sorted[0] as { id?: string; familyId?: string };
  return top?.id ?? top?.familyId ?? undefined;
}

function familyLabel(id: string | undefined): string | null {
  if (!id) return null;
  return FAMILY_LABEL_BY_ID.get(id as ProfileFamilyId) ?? null;
}

/**
 * Si el LLM repite la top del motor en un mismatch, promovemos la primera
 * alternativa distinta (sin imponer familias por nombre).
 */
export function resolveNarrativeAuditFamily(
  review: NarrativeCoherenceReview,
  motorTopFamilyId: string | undefined,
): {
  review: NarrativeCoherenceReview;
  familyResolution?: NarrativeFamilyResolution;
} {
  if (!motorTopFamilyId) {
    return { review };
  }

  const needsDistinctFamily =
    review.verdict === "narrative_mismatch" || review.verdict === "red_flag";

  if (!needsDistinctFamily || review.family !== motorTopFamilyId) {
    return { review };
  }

  const alt = review.alternativeFamilies.find(
    (a) => a.familyId !== motorTopFamilyId,
  );

  if (alt) {
    return {
      review: { ...review, family: alt.familyId },
      familyResolution: "alternative_promoted_over_motor_echo",
    };
  }

  return {
    review: { ...review, family: undefined },
    familyResolution: "motor_echo_cleared_no_alternative",
  };
}

function buildNarrativeFrontierSummary(params: {
  reading: FinalReading;
  primaryLabel: string | null;
  secondaryLabel: string | null;
}): FinalReading["summaryForUser"] {
  const previous = params.reading.summaryForUser;
  const frontier =
    params.primaryLabel && params.secondaryLabel
      ? `${params.primaryLabel} / ${params.secondaryLabel}`
      : params.primaryLabel ?? "la zona narrativa sugerida";

  return {
    ...previous,
    diagnostico:
      "La lectura detecta una dirección posible, pero la auditoría narrativa recomienda tratarla como frontera activa antes de cerrarla.",
    direccion: `La zona que conviene revisar es ${frontier}.`,
    cierre:
      "No conviene emitir una sentencia cerrada todavía. La historia de vida y la hipótesis del motor no están lo bastante alineadas para un cierre definitivo.",
  };
}

function mergeNarrativeAdjudicationTrace(
  reading: FinalReading,
  adjudication: NarrativeAdjudicationTrace,
): Record<string, unknown> {
  const existing =
    reading.trace &&
    typeof reading.trace === "object" &&
    !Array.isArray(reading.trace)
      ? { ...(reading.trace as Record<string, unknown>) }
      : { rawTrace: reading.trace ?? null };

  return {
    ...existing,
    narrativeAdjudication: adjudication,
  };
}

/**
 * Fase 2 (prueba): palancas TS conservadoras. No modifica familyScores.
 * Solo veta cierre `clear_direction` demasiado fuerte y aplica copy de frontera.
 */
export function applyNarrativeCoherenceLevers(
  reading: FinalReading,
  review: NarrativeCoherenceReview,
  options: {
    motorTopFamilyId?: string;
    familyScores?: ProfileFamilyScore[];
  },
): FinalReading {
  const motorTop = options.motorTopFamilyId;
  const levers: NarrativeAdjudicationTrace["levers"] = [];

  const highCompressionUndetected =
    review.compressionConcern === "high" ||
    review.riskFlags.some(
      (f) =>
        f.type === "compressed_life_undetected" && f.severity === "high",
    );

  const moderateCompression =
    review.compressionConcern === "moderate" || highCompressionUndetected;

  const narrativeFamilyDistinct =
    Boolean(review.family) &&
    Boolean(motorTop) &&
    review.family !== motorTop;

  const frontierPairOnly =
    Boolean(review.family) &&
    Boolean(motorTop) &&
    isRegistryFrontierPair(motorTop, review.family);

  const lexicalTrapFrontier = review.riskFlags.some(
    (f) =>
      f.type === "lexical_trap" &&
      f.suspectedPair &&
      isRegistryFrontierPair(f.suspectedPair[0], f.suspectedPair[1]),
  );

  const closureNeedsSoftening =
    review.closureRisk === "too_closed" ||
    review.closureRisk === "compressed_ignored" ||
    (highCompressionUndetected && reading.resultType === "clear_direction");

  const strongMismatch =
    review.directionFit === "mismatch" &&
    review.confidence >= MISMATCH_FRONTIER_CONFIDENCE &&
    narrativeFamilyDistinct &&
    !frontierPairOnly &&
    !lexicalTrapFrontier &&
    (review.riskFlags.some((f) => f.severity === "high") ||
      review.confidence >= 0.8);

  const compressionSoftening =
    moderateCompression &&
    review.directionFit !== "aligned" &&
    review.confidence >= 0.65;

  const shouldSoftenClearDirection =
    reading.resultType === "clear_direction" &&
    (closureNeedsSoftening || strongMismatch);

  const shouldSoftenCompressedReading =
    (reading.resultType === "compressed_life" ||
      reading.resultType === "insufficient_evidence") &&
    compressionSoftening;

  const benignAligned =
    review.directionFit === "aligned" &&
    review.closureRisk === "ok" &&
    !highCompressionUndetected;

  const benignFrontier =
    review.directionFit === "frontier" ||
    (review.verdict === "frontier" &&
      (!review.family ||
        review.family === motorTop ||
        frontierPairOnly ||
        lexicalTrapFrontier));

  const shouldApplyLevers =
    !benignAligned &&
    (shouldSoftenClearDirection || shouldSoftenCompressedReading) &&
    !(benignFrontier && !highCompressionUndetected && !closureNeedsSoftening);

  const directionAligned =
    review.directionFit === "aligned" && review.verdict === "aligned";

  const swapCorePattern =
    strongMismatch &&
    !lexicalTrapFrontier &&
    !frontierPairOnly &&
    !directionAligned;

  const traceBase: NarrativeAdjudicationTrace = {
    applied: shouldApplyLevers,
    levers: [],
    previousResultType: reading.resultType,
    motorTopFamilyId: motorTop,
    familyResolution: review.familyResolution,
    vetoedClearDirection: shouldSoftenClearDirection,
  };

  if (!shouldApplyLevers) {
    return {
      ...reading,
      trace: mergeNarrativeAdjudicationTrace(reading, traceBase),
    };
  }

  if (highCompressionUndetected) {
    levers.push("compression_veto");
  }
  if (strongMismatch) {
    levers.push("mismatch_frontier");
  }
  if (shouldSoftenCompressedReading && !strongMismatch) {
    levers.push("compression_soften");
  }
  levers.push("frontier_copy");

  const sorted = [...(options.familyScores ?? [])].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0),
  );
  const motorSecond = sorted[1] as { id?: string; familyId?: string } | undefined;
  const motorSecondId = motorSecond?.id ?? motorSecond?.familyId;

  const primaryLabel =
    familyLabel(review.family) ??
    familyLabel(review.alternativeFamilies[0]?.familyId) ??
    familyLabel(motorTop);

  const secondaryLabel =
    familyLabel(
      review.alternativeFamilies.find((a) => a.familyId !== review.family)
        ?.familyId,
    ) ?? familyLabel(motorSecondId);

  const corePattern =
    swapCorePattern && primaryLabel && secondaryLabel
      ? `${primaryLabel} / ${secondaryLabel}`
      : reading.corePattern;

  const previousDiagnostic = reading.finalDiagnostic;

  if (reading.resultType === "insufficient_evidence") {
    return {
      ...reading,
      finalDiagnostic: {
        ...previousDiagnostic,
        functionalSubtype: "frontier_pattern_needs_review",
        needsHumanReview: true,
      } as typeof previousDiagnostic,
      trace: mergeNarrativeAdjudicationTrace(reading, {
        ...traceBase,
        levers: [...levers, "compression_soften"],
        applied: true,
      }),
    };
  }

  const summaryLabels =
    lexicalTrapFrontier || frontierPairOnly
      ? {
          primary: familyLabel(motorTop) ?? primaryLabel,
          secondary: familyLabel(review.family) ?? secondaryLabel,
        }
      : { primary: primaryLabel, secondary: secondaryLabel };

  return {
    ...reading,
    corePattern,
    dominantTension:
      review.compressionConcern === "high"
        ? "La historia muestra compresión vital relevante; el cierre del motor no debería sonar tan definitivo."
        : "La auditoría narrativa detecta tensión entre la historia de vida y un cierre demasiado cerrado del motor.",
    summaryForUser: buildNarrativeFrontierSummary({
      reading,
      primaryLabel: summaryLabels.primary,
      secondaryLabel: summaryLabels.secondary,
    }),
    finalDiagnostic: {
      ...previousDiagnostic,
      functionalSubtype: "frontier_pattern_needs_review",
      needsHumanReview: true,
    } as typeof previousDiagnostic,
    trace: mergeNarrativeAdjudicationTrace(reading, {
      ...traceBase,
      levers,
      applied: true,
    }),
  };
}

