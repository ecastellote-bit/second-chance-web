import type { FinalReading } from "../types/result";
import type { ContextualSituationReview } from "./contextualSituationJudge";
import {
  familyIdToDisplayLabel,
  normalizeContextualText,
} from "./contextualPanelRules";

export type ContextualDiagnosticContribution = {
  applied: boolean;
  appliedTo: string[];
  situationFrame: string;
  contextSummary: string;
  corePatternBefore?: string;
  corePatternAfter?: string;
  cautionsUsed: number;
};

function isContextualReview(
  value: unknown,
): value is ContextualSituationReview {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as ContextualSituationReview).judgeId ===
      "contextual_situation_judge"
  );
}

function shouldApplyContextualSentence(
  review: ContextualSituationReview,
): boolean {
  if (review.verdict === "context_insufficient") return false;

  return (
    review.shouldInfluenceDiagnostic === true ||
    review.shouldAdjustDiagnosis === true ||
    review.verdict === "context_suggests_frontier" ||
    review.shouldOpenFrontier === true ||
    (review.forces?.length ?? 0) > 0
  );
}

function buildContextualFrontierPattern(
  review: ContextualSituationReview,
  topLabel: string | null,
): string | null {
  const fromAdjustments = (review.familyAdjustments ?? [])
    .filter((a) => a.direction === "raise" && a.strength >= 0.68)
    .sort((a, b) => b.strength - a.strength)
    .map((a) => familyIdToDisplayLabel(a.family))
    .filter(Boolean);

  const fromSuggested = (review.suggestedFrontier ?? []).map((id) =>
    familyIdToDisplayLabel(id),
  );

  const merged = Array.from(new Set([...fromAdjustments, ...fromSuggested]));

  if (merged.length >= 2) {
    return `${merged[0]} / ${merged[1]}`;
  }

  if (merged.length === 1 && topLabel && merged[0] !== topLabel) {
    return `${topLabel} / ${merged[0]}`;
  }

  if (review.suggestedPrimaryFamily) {
    const primary = familyIdToDisplayLabel(review.suggestedPrimaryFamily);
    if (topLabel && primary !== topLabel) {
      return `${topLabel} / ${primary}`;
    }
    return primary;
  }

  return null;
}

function appendCautionToCierre(
  cierre: string,
  cautions: string[],
  max = 2,
): string {
  const extra = cautions.slice(0, max);
  if (extra.length === 0) return cierre;

  const block = extra.join(" ");
  if (cierre.includes(block.slice(0, 40))) return cierre;

  return `${cierre} ${block}`.trim();
}

/**
 * Aplica el Juez Contextual a la lectura ya adjudicada por panel/memoria.
 * No modifica familyScores — solo sentencia pública (corePattern, summary, tensión).
 */
export function applyContextualInfluenceToFinalReading(
  reading: FinalReading,
  contextualReview: unknown,
  params?: {
    topFamilyLabel?: string | null;
    secondFamilyLabel?: string | null;
    scoreGap?: number;
  },
): FinalReading {
  if (!isContextualReview(contextualReview)) {
    return reading;
  }

  const review = contextualReview;
  if (!shouldApplyContextualSentence(review)) {
    return reading;
  }

  const appliedTo: string[] = [];
  const topLabel = params?.topFamilyLabel ?? null;
  const cautions = review.cautions ?? review.warnings ?? [];
  const contextSummary =
    review.contextSummary ?? review.summary ?? review.notes?.[0] ?? "";

  let corePattern = reading.corePattern;
  const corePatternBefore = corePattern;

  const influenceStrong =
    review.shouldInfluenceDiagnostic ||
    review.verdict === "context_suggests_frontier" ||
    review.shouldOpenFrontier;

  if (influenceStrong) {
    const contextualPattern = buildContextualFrontierPattern(review, topLabel);
    if (contextualPattern && contextualPattern !== corePattern) {
      const gap = params?.scoreGap ?? 1;
      const closeRace = gap <= 0.22;

      if (
        closeRace ||
        reading.resultType !== "clear_direction" ||
        review.verdict === "context_suggests_frontier"
      ) {
        corePattern = contextualPattern;
        appliedTo.push("corePattern");
      }
    }
  }

  const previousSummary = reading.summaryForUser ?? {
    diagnostico: "",
    tensiones: "",
    direccion: "",
    cierre: "",
  };

  let diagnostico = previousSummary.diagnostico ?? "";
  let tensiones = previousSummary.tensiones ?? "";
  let direccion = previousSummary.direccion ?? "";
  let cierre = previousSummary.cierre ?? "";

  if (contextSummary && contextSummary.length > 40) {
    const contextSentence = contextSummary.endsWith(".")
      ? contextSummary
      : `${contextSummary}.`;

    if (!tensiones.includes(contextSentence.slice(0, 50))) {
      tensiones = tensiones
        ? `${tensiones} ${contextSentence}`
        : contextSentence;
      appliedTo.push("tensiones");
    }
  }

  if (influenceStrong && review.situationFrame) {
    const frameNote =
      review.situationFrame === "compressed_capacity_context"
        ? "La situación vital muestra compresión o sostén que debe condicionar el ritmo de la transición."
        : review.situationFrame === "human_support_with_interpretive_clarity_context"
          ? "El contexto combina acompañamiento humano con claridad interpretativa; conviene no reducirlo a sociabilidad genérica."
          : review.situationFrame === "creative_expression_context" ||
              review.situationFrame === "narrative_expression_with_public_voice_context"
            ? "La expresión creativa o narrativa es central en la biografía; la sentencia debe protegerla frente a lecturas puramente instrumentales."
            : null;

    if (frameNote && !dominantTensionIncludes(reading.dominantTension, frameNote)) {
      appliedTo.push("dominantTension");
    }
  }

  if (influenceStrong && topLabel) {
    const frontierPattern = buildContextualFrontierPattern(review, topLabel);
    if (frontierPattern) {
      direccion = `La zona que conviene sostener en la sentencia es ${frontierPattern}, leída a la luz del contexto vital (no solo del ranking numérico).`;
      appliedTo.push("direccion");
    }
  }

  if (cautions.length > 0) {
    cierre = appendCautionToCierre(cierre, cautions, 2);
    appliedTo.push("cierre");
  }

  if (
    influenceStrong &&
    diagnostico &&
    !diagnostico.includes("contexto vital")
  ) {
    diagnostico = `${diagnostico} La lectura incorpora el marco situacional del juez contextual.`;
    appliedTo.push("diagnostico");
  }

  const contribution: ContextualDiagnosticContribution = {
    applied: appliedTo.length > 0,
    appliedTo,
    situationFrame: review.situationFrame,
    contextSummary,
    corePatternBefore,
    corePatternAfter: corePattern,
    cautionsUsed: Math.min(cautions.length, 2),
  };

  const dominantTension =
    appliedTo.includes("dominantTension") && review.situationFrame
      ? buildDominantTensionFromFrame(reading.dominantTension, review)
      : reading.dominantTension;

  return {
    ...reading,
    corePattern,
    dominantTension,
    summaryForUser: {
      ...previousSummary,
      diagnostico,
      tensiones,
      direccion,
      cierre,
    },
    trace: mergeContextualContributionTrace(reading.trace, contribution, review),
  } as FinalReading;
}

function dominantTensionIncludes(
  tension: string | undefined,
  fragment: string,
): boolean {
  if (!tension || !fragment) return false;
  return normalizeContextualText(tension).includes(
    normalizeContextualText(fragment).slice(0, 40),
  );
}

function buildDominantTensionFromFrame(
  previous: string | undefined,
  review: ContextualSituationReview,
): string {
  if (review.situationFrame === "compressed_capacity_context") {
    return (
      previous ??
      "La tensión principal es recuperar capacidad vital sin exigir un salto que la situación actual no puede sostener."
    );
  }

  if (review.situationFrame === "human_support_with_interpretive_clarity_context") {
    return "Hay una frontera entre acompañamiento humano profundo y otras lecturas más instrumentales o colectivas.";
  }

  if (
    review.situationFrame === "creative_expression_context" ||
    review.situationFrame === "narrative_expression_with_public_voice_context"
  ) {
    return "La tensión está entre expresión creativa/narrativa y lecturas que la reducen a comunicación genérica o sostén laboral.";
  }

  return (
    previous ??
    "El contexto vital aporta matices que deben condicionar cómo se cierra la sentencia."
  );
}

function mergeContextualContributionTrace(
  trace: unknown,
  contribution: ContextualDiagnosticContribution,
  review: ContextualSituationReview,
): unknown {
  const base =
    trace && typeof trace === "object" && !Array.isArray(trace)
      ? { ...(trace as Record<string, unknown>) }
      : { rawTrace: trace ?? null };

  return {
    ...base,
    contextualDiagnosticContribution: contribution,
    contextualSituationReview: review,
  };
}
