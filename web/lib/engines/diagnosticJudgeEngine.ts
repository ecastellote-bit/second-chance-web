import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";
import type { HumanAffinityScore } from "../types/humanAffinity";
import type { ProfileFamilyScore } from "../types/profileFamilies";
import type {
  DiagnosticJudgeFinding,
  DiagnosticJudgeVerdict,
  DiagnosticReviewReport,
} from "../types/diagnosticJudges";
import {
  SIMILARITY_CONFLICT_MIN,
  SIMILARITY_FRONTIER_MIN,
  SIMILARITY_INFLUENTIAL_MIN,
  detectLexiconArchetypeTension,
  isKnownDiagnosticRivalry,
  scoreLexiconGroups,
  buildDiagnosticIntakeText,
} from "./diagnosticPanelRules";

type SimilarCaseLike = {
  caseId?: string;
  title?: string;
  similarityScore?: number;
  expectedPrimaryFamily?: string;
  acceptableFamilies?: string[];
  rivalFamilies?: string[];
  matchedLanguage?: string[];
  lesson?: string;
};

type LearningSignalLike = {
  strongestHistoricalFamily?: string;
  similarCases?: SimilarCaseLike[];
  warning?: string;
  shouldRaiseRedFlag?: boolean;
  cautionFromFailures?: {
    active?: boolean;
    matchedFailures?: string[];
    avoidFamilies?: string[];
    lesson?: string;
  };
  learningAssistedHypothesis?: {
    family: string;
    reason: string;
    confidence: number;
    basedOnCases: number;
  };
};

export type DiagnosticJudgeEngineInput = {
  intake: UserIntake;
  finalReading: FinalReading;
  familyScores?: ProfileFamilyScore[];
  affinityScores?: HumanAffinityScore[];
  learningSignal?: LearningSignalLike | null;
  similarCases?: SimilarCaseLike[];
  /** Familias ya excluidas por el Juez de Descarte — no compiten en frontera/rivalidad. */
  excludedFamilyIds?: string[];
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFamily(value: unknown): string {
  return normalizeText(value).replace(/\s+/g, "_");
}

function normalizeFamilyLabel(value: unknown): string {
  const normalized = normalizeText(value);
  if (!normalized) return "";

  return normalized
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getFamilyId(family: ProfileFamilyScore | undefined | null): string {
  if (!family) return "";

  const raw = (family as { id?: string; familyId?: string }).id ?? (family as { familyId?: string }).familyId ?? "";
  return normalizeFamily(raw);
}

function getFamilyLabel(family: ProfileFamilyScore | undefined | null): string {
  if (!family) return "";

  const raw =
    (family as { label?: string; familyLabel?: string; id?: string }).label ??
    (family as { familyLabel?: string }).familyLabel ??
    (family as { id?: string }).id ??
    "";

  return normalizeFamilyLabel(raw);
}

function getFamilyScore(family: ProfileFamilyScore | undefined | null): number {
  const value = (family as { score?: number })?.score;

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getFamilyConfidence(
  family: ProfileFamilyScore | undefined | null,
): number {
  const value = (family as { confidence?: number })?.confidence;

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function sortFamilyScores(
  familyScores: ProfileFamilyScore[] | undefined,
): ProfileFamilyScore[] {
  if (!familyScores || familyScores.length === 0) return [];

  return [...familyScores].sort((a, b) => {
    const scoreDelta = getFamilyScore(b) - getFamilyScore(a);
    if (scoreDelta !== 0) return scoreDelta;

    return getFamilyConfidence(b) - getFamilyConfidence(a);
  });
}

function filterEligibleFamilyScores(
  familyScores: ProfileFamilyScore[] | undefined,
  excludedFamilyIds?: string[],
): ProfileFamilyScore[] {
  const excluded = new Set(
    (excludedFamilyIds ?? []).map((id) => normalizeFamily(id)).filter(Boolean),
  );

  return sortFamilyScores(familyScores).filter(
    (family) => !excluded.has(getFamilyId(family)),
  );
}

function buildFinding(params: {
  judgeId: string;
  verdict: DiagnosticJudgeVerdict;
  family?: string;
  confidence: number;
  reason: string;
  evidence?: string[];
}): DiagnosticJudgeFinding {
  return {
    judgeId: params.judgeId,
    verdict: params.verdict,
    family: params.family,
    confidence: clamp(params.confidence),
    reason: params.reason,
    evidence: params.evidence ?? [],
  };
}

function isHardVerdict(verdict: DiagnosticJudgeVerdict): boolean {
  return (
    verdict === "conflict" ||
    verdict === "red_flag" ||
    verdict === "human_review_recommended"
  );
}

function countsAsFrontier(verdict: DiagnosticJudgeVerdict): boolean {
  return verdict === "frontier";
}

function judgeFamilyScores(
  familyScores: ProfileFamilyScore[] | undefined,
  excludedFamilyIds?: string[],
): DiagnosticJudgeFinding {
  const sorted = filterEligibleFamilyScores(familyScores, excludedFamilyIds);
  const top = sorted[0] ?? null;
  const second = sorted[1] ?? null;

  if (!top) {
    return buildFinding({
      judgeId: "family_score_judge",
      verdict: "red_flag",
      confidence: 0.4,
      reason: "No llegaron familyScores elegibles a la revisión diagnóstica.",
      evidence: [],
    });
  }

  const topLabel = getFamilyLabel(top);
  const secondLabel = getFamilyLabel(second);
  const topScore = getFamilyScore(top);
  const secondScore = getFamilyScore(second);
  const gap = topScore - secondScore;
  const relativeGap = topScore > 0 ? gap / topScore : gap;

  const closeRace =
    second &&
    topScore >= 0.4 &&
    secondScore >= 0.38 &&
    (gap <= 0.1 || relativeGap <= 0.22);

  if (closeRace) {
    return buildFinding({
      judgeId: "family_score_judge",
      verdict: "frontier",
      family: `${topLabel} / ${secondLabel}`,
      confidence: clamp((topScore + secondScore) / 2),
      reason:
        "Las dos familias principales elegibles están demasiado cerca como para cerrar una sentencia única.",
      evidence: [
        `${topLabel}: ${Math.round(topScore * 100)}%`,
        `${secondLabel}: ${Math.round(secondScore * 100)}%`,
        `Diferencia: ${Math.round(gap * 100)} puntos`,
      ],
    });
  }

  if (topScore >= 0.52 && gap >= 0.12) {
    return buildFinding({
      judgeId: "family_score_judge",
      verdict: "aligned",
      family: topLabel,
      confidence: clamp(topScore),
      reason: "La capa de familyScores encuentra una familia dominante elegible con brecha utilizable.",
      evidence: [
        `${topLabel}: ${Math.round(topScore * 100)}%`,
        second ? `Siguiente: ${secondLabel} ${Math.round(secondScore * 100)}%` : "",
      ].filter(Boolean),
    });
  }

  if (topScore >= 0.48) {
    return buildFinding({
      judgeId: "family_score_judge",
      verdict: "aligned",
      family: topLabel,
      confidence: clamp(topScore),
      reason:
        "La familia principal es aceptable para adjudicación, aunque conviene mantener prudencia en el cierre.",
      evidence: [`${topLabel}: ${Math.round(topScore * 100)}%`],
    });
  }

  return buildFinding({
    judgeId: "family_score_judge",
    verdict: "red_flag",
    family: topLabel,
    confidence: clamp(topScore),
    reason:
      "La familia principal existe, pero su puntaje todavía es débil para adjudicación fuerte.",
    evidence: [`${topLabel}: ${Math.round(topScore * 100)}%`],
  });
}

function topFamilyMatchesHistorical(
  familyScores: ProfileFamilyScore[] | undefined,
  historicalFamily: string,
  excludedFamilyIds?: string[],
): boolean {
  const historical = normalizeFamily(historicalFamily);
  if (!historical) return false;

  const sorted = filterEligibleFamilyScores(familyScores, excludedFamilyIds);
  const topId = getFamilyId(sorted[0]);
  if (topId === historical) return true;

  return sorted.slice(0, 3).some((item) => getFamilyId(item) === historical);
}

function judgeSimilarCases(
  learningSignal: LearningSignalLike | null | undefined,
  similarCases: SimilarCaseLike[] | undefined,
  finalReading: FinalReading,
  familyScores: ProfileFamilyScore[] | undefined,
  excludedFamilyIds?: string[],
): DiagnosticJudgeFinding {
  const cases = similarCases ?? learningSignal?.similarCases ?? [];
  const strongestFamily = learningSignal?.strongestHistoricalFamily;
  const assistedFamily = learningSignal?.learningAssistedHypothesis?.family;
  const historicalFamily = assistedFamily ?? strongestFamily;

  const bestSimilarity =
    cases
      .map((item) =>
        typeof item.similarityScore === "number" &&
        Number.isFinite(item.similarityScore)
          ? item.similarityScore
          : 0,
      )
      .sort((a, b) => b - a)[0] ?? 0;

  const failureCaution = learningSignal?.cautionFromFailures?.active === true;

  if (!historicalFamily || cases.length === 0) {
    return buildFinding({
      judgeId: "similar_case_judge",
      verdict: "aligned",
      confidence: 0.15,
      reason:
        "No hay suficientes casos similares como para que la memoria histórica pese en esta lectura.",
      evidence: [],
    });
  }

  const historicalLabel = normalizeFamilyLabel(historicalFamily);
  const eligibleSorted = filterEligibleFamilyScores(
    familyScores,
    excludedFamilyIds,
  );
  const topMatches = topFamilyMatchesHistorical(
    familyScores,
    historicalFamily,
    excludedFamilyIds,
  );
  const topScore = getFamilyScore(eligibleSorted[0]);
  const secondScore = getFamilyScore(eligibleSorted[1]);
  const motorGap = topScore - secondScore;
  const motorDominant = topScore >= 0.52 && motorGap >= 0.12;

  const resultType = normalizeText((finalReading as { resultType?: string }).resultType);
  const weakMainResult =
    resultType.includes("insufficient") ||
    resultType.includes("compressed") ||
    !resultType;

  if (failureCaution && bestSimilarity >= SIMILARITY_FRONTIER_MIN) {
    return buildFinding({
      judgeId: "similar_case_judge",
      verdict: "frontier",
      family: historicalLabel,
      confidence: clamp(bestSimilarity),
      reason:
        "Casos de referencia de fallo aportan cautela; conviene frontera o revisión sin declarar conflicto duro por memoria débil.",
      evidence: [
        `Familia histórica: ${historicalLabel}`,
        `Mejor similitud: ${Math.round(bestSimilarity * 100)}%`,
        ...(learningSignal?.cautionFromFailures?.matchedFailures ?? []).slice(0, 3),
      ],
    });
  }

  if (learningSignal?.shouldRaiseRedFlag && topMatches) {
    return buildFinding({
      judgeId: "similar_case_judge",
      verdict: "frontier",
      family: historicalLabel,
      confidence: clamp(bestSimilarity),
      reason:
        "La memoria histórica refuerza una familia ya presente en el top elegible; no hay contradicción dura.",
      evidence: [
        `Familia histórica: ${historicalLabel}`,
        `Casos similares: ${cases.length}`,
      ],
    });
  }

  if (learningSignal?.shouldRaiseRedFlag && !topMatches) {
    if (bestSimilarity < SIMILARITY_FRONTIER_MIN) {
      return buildFinding({
        judgeId: "similar_case_judge",
        verdict: "weak_similarity_warning",
        confidence: clamp(bestSimilarity),
        reason:
          "La memoria sugiere otra familia, pero la similitud es demasiado baja para conflicto diagnóstico.",
        evidence: [
          `Familia histórica: ${historicalLabel}`,
          `Mejor similitud: ${Math.round(bestSimilarity * 100)}%`,
        ],
      });
    }

    if (bestSimilarity < SIMILARITY_CONFLICT_MIN) {
      return buildFinding({
        judgeId: "similar_case_judge",
        verdict: "frontier_note",
        family: historicalLabel,
        confidence: clamp(bestSimilarity),
        reason:
          "Hay tensión con la memoria, pero la similitud aún no alcanza umbral de conflicto fuerte.",
        evidence: [
          `Familia histórica: ${historicalLabel}`,
          `Mejor similitud: ${Math.round(bestSimilarity * 100)}%`,
        ],
      });
    }

    if (weakMainResult || motorDominant) {
      return buildFinding({
        judgeId: "similar_case_judge",
        verdict: "frontier",
        family: historicalLabel,
        confidence: clamp(bestSimilarity),
        reason: motorDominant
          ? "El motor tiene un top dominante elegible; la memoria sugiere otra familia y conviene frontera, no conflicto duro."
          : "El resultado principal es débil y la memoria apunta a una familia concreta con similitud relevante.",
        evidence: [
          `Familia histórica: ${historicalLabel}`,
          `Mejor similitud: ${Math.round(bestSimilarity * 100)}%`,
          motorDominant
            ? `Top motor: ${getFamilyLabel(eligibleSorted[0])} ${Math.round(topScore * 100)}%`
            : "",
        ].filter(Boolean),
      });
    }

    return buildFinding({
      judgeId: "similar_case_judge",
      verdict: "conflict",
      family: historicalLabel,
      confidence: clamp(bestSimilarity),
      reason:
        "La memoria de casos aprendidos empuja hacia una familia que no coincide con el top elegible actual.",
      evidence: [
        `Familia histórica: ${historicalLabel}`,
        `Casos similares: ${cases.length}`,
        `Mejor similitud: ${Math.round(bestSimilarity * 100)}%`,
      ],
    });
  }

  return buildFinding({
    judgeId: "similar_case_judge",
    verdict: "aligned",
    family: historicalLabel,
    confidence: clamp(bestSimilarity),
    reason: "La memoria histórica no contradice de forma fuerte el diagnóstico actual.",
    evidence: [
      `Familia histórica: ${historicalLabel}`,
      `Casos similares: ${cases.length}`,
    ],
  });
}

function judgeHumanLexicon(intake: UserIntake): DiagnosticJudgeFinding {
  const text = buildDiagnosticIntakeText(intake);
  const archetypeNotes = detectLexiconArchetypeTension(intake);
  const scored = scoreLexiconGroups(text);
  const winner = scored[0];

  if (!winner || winner.score === 0) {
    return buildFinding({
      judgeId: "human_lexicon_judge",
      verdict: "aligned",
      confidence: 0.1,
      reason: "No se detectó un grupo léxico humano suficientemente dominante.",
      evidence: archetypeNotes.slice(0, 3),
    });
  }

  const { group, phraseHits, wordHits } = winner;
  const minPhrase = group.minPhraseHitsForFrontier ?? 1;
  const minWord = group.minWordHitsForFrontier ?? 2;

  const strongEnough =
    phraseHits.length >= minPhrase ||
    wordHits.length >= minWord ||
    (phraseHits.length >= 1 && wordHits.length >= 1);

  const suppressTechnicalForSosten =
    archetypeNotes.some((n) => n.startsWith("sosten_laboral")) &&
    (group.familyId === "technical_builder" || group.familyId === "system_designer");

  const suppressCommunityWithoutCollective =
    archetypeNotes.some((n) => n.startsWith("sin_colectivo")) &&
    group.familyId === "community_builder";

  if (suppressTechnicalForSosten || suppressCommunityWithoutCollective) {
    return buildFinding({
      judgeId: "human_lexicon_judge",
      verdict: "aligned",
      confidence: 0.2,
      reason:
        "Marcadores léxicos detectados, pero el arquetipo vital (sostén/compresión/colectivo) indica que no deben corregir la lectura.",
      evidence: [...archetypeNotes, ...phraseHits, ...wordHits].slice(0, 8),
    });
  }

  const confidence = clamp(
    phraseHits.length * 0.15 + wordHits.length * 0.08,
  );

  if (strongEnough) {
    return buildFinding({
      judgeId: "human_lexicon_judge",
      verdict: "frontier",
      family: group.label,
      confidence,
      reason:
        "El lenguaje humano contiene marcadores repetidos y contextualizados que empujan hacia una familia concreta.",
      evidence: [...phraseHits, ...wordHits].slice(0, 10),
    });
  }

  return buildFinding({
    judgeId: "human_lexicon_judge",
    verdict: "aligned",
    family: group.label,
    confidence,
    reason:
      "Hay algunos marcadores léxicos útiles, pero todavía no alcanzan para abrir frontera por léxico solo.",
    evidence: [...phraseHits, ...wordHits].slice(0, 8),
  });
}

function judgeRivalries(
  familyScores: ProfileFamilyScore[] | undefined,
  excludedFamilyIds?: string[],
): DiagnosticJudgeFinding {
  const sorted = filterEligibleFamilyScores(familyScores, excludedFamilyIds);
  const top = sorted[0] ?? null;
  const second = sorted[1] ?? null;

  if (!top || !second) {
    return buildFinding({
      judgeId: "rivalry_judge",
      verdict: "aligned",
      confidence: 0.1,
      reason: "No hay dos familias elegibles suficientemente visibles para evaluar rivalidad.",
      evidence: [],
    });
  }

  const topId = getFamilyId(top);
  const secondId = getFamilyId(second);
  const topLabel = getFamilyLabel(top);
  const secondLabel = getFamilyLabel(second);
  const topScore = getFamilyScore(top);
  const secondScore = getFamilyScore(second);
  const gap = topScore - secondScore;

  const isKnownRivalry = isKnownDiagnosticRivalry(topId, secondId);

  const rivalryGapMax =
    topScore >= 0.55 ? 0.12 : topScore >= 0.45 ? 0.15 : 0.18;

  if (isKnownRivalry && gap <= rivalryGapMax) {
    return buildFinding({
      judgeId: "rivalry_judge",
      verdict: "frontier",
      family: `${topLabel} / ${secondLabel}`,
      confidence: clamp((topScore + secondScore) / 2),
      reason:
        "El caso cae dentro de una rivalidad conocida y la distancia entre familias elegibles es estrecha.",
      evidence: [
        `${topLabel}: ${Math.round(topScore * 100)}%`,
        `${secondLabel}: ${Math.round(secondScore * 100)}%`,
      ],
    });
  }

  return buildFinding({
    judgeId: "rivalry_judge",
    verdict: "aligned",
    family: topLabel,
    confidence: clamp(topScore),
    reason: "No se detecta una rivalidad cerrada entre las dos familias elegibles principales.",
    evidence: [
      `${topLabel}: ${Math.round(topScore * 100)}%`,
      `${secondLabel}: ${Math.round(secondScore * 100)}%`,
    ],
  });
}

function judgeAntiOverfit(
  similarCases: SimilarCaseLike[] | undefined,
  familyScores: ProfileFamilyScore[] | undefined,
  excludedFamilyIds?: string[],
): DiagnosticJudgeFinding {
  const cases = similarCases ?? [];
  const sorted = filterEligibleFamilyScores(familyScores, excludedFamilyIds);
  const top = sorted[0] ?? null;
  const topId = getFamilyId(top);
  const topScore = getFamilyScore(top);
  const secondScore = getFamilyScore(sorted[1]);
  const gap = topScore - secondScore;

  const influential = cases.filter(
    (item) =>
      (typeof item.similarityScore === "number"
        ? item.similarityScore
        : 0) >= SIMILARITY_INFLUENTIAL_MIN,
  );

  if (influential.length < 3) {
    return buildFinding({
      judgeId: "anti_overfit_judge",
      verdict: "aligned",
      confidence: 0.2,
      reason:
        "No hay suficientes casos similares influyentes como para sospechar cebado fuerte.",
      evidence: [`Casos influyentes (≥${Math.round(SIMILARITY_INFLUENTIAL_MIN * 100)}%): ${influential.length}`],
    });
  }

  if (top && topScore >= 0.58 && gap >= 0.15) {
    return buildFinding({
      judgeId: "anti_overfit_judge",
      verdict: "aligned",
      confidence: 0.35,
      reason:
        "El motor tiene un top dominante claro; la repetición en memoria no implica sobreajuste sino refuerzo.",
      evidence: [
        `Top: ${getFamilyLabel(top)} ${Math.round(topScore * 100)}%`,
        `Casos influyentes: ${influential.length}`,
      ],
    });
  }

  const familyCounts = new Map<string, number>();

  for (const item of influential) {
    const family = normalizeFamily(item.expectedPrimaryFamily);
    if (!family) continue;

    familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
  }

  const mostRepeated = [...familyCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  if (mostRepeated && mostRepeated[0] === topId && topScore >= 0.5) {
    return buildFinding({
      judgeId: "anti_overfit_judge",
      verdict: "aligned",
      confidence: clamp(mostRepeated[1] / influential.length),
      reason:
        "La memoria repite la misma familia que ya lidera el ranking elegible; es confirmación, no cebado.",
      evidence: [
        `Familia repetida: ${normalizeFamilyLabel(mostRepeated[0])}`,
        `Repeticiones influyentes: ${mostRepeated[1]}`,
      ],
    });
  }

  if (mostRepeated && mostRepeated[1] >= 3 && mostRepeated[0] !== topId) {
    return buildFinding({
      judgeId: "anti_overfit_judge",
      verdict: "red_flag",
      family: normalizeFamilyLabel(mostRepeated[0]),
      confidence: clamp(mostRepeated[1] / influential.length),
      reason:
        "Varios casos similares influyentes empujan hacia una familia distinta del top elegible; conviene limitar el peso del aprendizaje.",
      evidence: [
        `Familia repetida: ${normalizeFamilyLabel(mostRepeated[0])}`,
        `Repeticiones: ${mostRepeated[1]}`,
        `Top elegible: ${top ? getFamilyLabel(top) : "—"}`,
      ],
    });
  }

  return buildFinding({
    judgeId: "anti_overfit_judge",
    verdict: "aligned",
    confidence: 0.3,
    reason: "No se detecta patrón fuerte de sobreajuste por repetición influyente.",
    evidence: [`Casos influyentes: ${influential.length}`],
  });
}

/** Agregación compartida con el calibrador post-similitud. */
export function recomputeDiagnosticAggregateFromFindings(
  findings: DiagnosticJudgeFinding[],
): Pick<
  DiagnosticReviewReport,
  | "finalVerdict"
  | "recommendedPrimaryFamily"
  | "recommendedFrontier"
  | "shouldRequestHumanReview"
> {
  const hasHumanReview = findings.some(
    (finding) => finding.verdict === "human_review_recommended",
  );

  if (hasHumanReview) {
    return {
      finalVerdict: "human_review_recommended",
      shouldRequestHumanReview: true,
    };
  }

  const hasConflict = findings.some((finding) => finding.verdict === "conflict");
  const hasRedFlag = findings.some(
    (finding) =>
      finding.verdict === "red_flag" &&
      (finding.judgeId === "family_score_judge" ||
        finding.judgeId === "anti_overfit_judge"),
  );
  const frontierCount = findings.filter((finding) =>
    countsAsFrontier(finding.verdict),
  ).length;

  let finalVerdict: DiagnosticJudgeVerdict = "aligned";

  if (hasConflict && hasRedFlag) {
    finalVerdict = "human_review_recommended";
  } else if (hasConflict) {
    finalVerdict = "conflict";
  } else if (frontierCount >= 2) {
    finalVerdict = "frontier";
  } else if (hasRedFlag) {
    finalVerdict = "red_flag";
  } else if (frontierCount === 1) {
    finalVerdict = "frontier";
  }

  const recommendedFrontier =
    finalVerdict === "frontier"
      ? getRecommendedFrontier(findings)
      : undefined;

  const recommendedPrimaryFamily =
    finalVerdict === "aligned" ||
    finalVerdict === "conflict" ||
    finalVerdict === "aligned_with_caution"
      ? getRecommendedPrimaryFamily(findings)
      : undefined;

  const shouldRequestHumanReview =
    finalVerdict === "human_review_recommended" ||
    finalVerdict === "conflict" ||
    (finalVerdict === "red_flag" &&
      findings.some((f) => f.judgeId === "family_score_judge"));

  return {
    finalVerdict,
    recommendedPrimaryFamily,
    recommendedFrontier,
    shouldRequestHumanReview,
  };
}

function getRecommendedFrontier(
  findings: DiagnosticJudgeFinding[],
): string[] | undefined {
  const frontierFamilies = findings
    .filter((finding) => countsAsFrontier(finding.verdict) && finding.family)
    .flatMap((finding) => String(finding.family).split("/"))
    .map((item) => normalizeFamilyLabel(item))
    .filter(Boolean);

  const unique = Array.from(new Set(frontierFamilies));

  return unique.length > 0 ? unique : undefined;
}

function getRecommendedPrimaryFamily(
  findings: DiagnosticJudgeFinding[],
): string | undefined {
  const candidates = findings
    .filter((finding) => finding.family && !isHardVerdict(finding.verdict))
    .sort((a, b) => b.confidence - a.confidence);

  return candidates[0]?.family;
}

export function runDiagnosticJudgeEngine(
  input: DiagnosticJudgeEngineInput,
): DiagnosticReviewReport {
  const similarCases =
    input.similarCases ?? input.learningSignal?.similarCases ?? [];
  const excluded = input.excludedFamilyIds;

  const findings: DiagnosticJudgeFinding[] = [
    judgeFamilyScores(input.familyScores, excluded),
    judgeSimilarCases(
      input.learningSignal,
      similarCases,
      input.finalReading,
      input.familyScores,
      excluded,
    ),
    judgeHumanLexicon(input.intake),
    judgeRivalries(input.familyScores, excluded),
    judgeAntiOverfit(similarCases, input.familyScores, excluded),
  ];

  const aggregate = recomputeDiagnosticAggregateFromFindings(findings);

  return {
    ...aggregate,
    findings,
  };
}
