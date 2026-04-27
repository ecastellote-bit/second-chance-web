import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";
import type { HumanAffinityScore } from "../types/humanAffinity";
import type { ProfileFamilyScore } from "../types/profileFamilies";
import type {
  DiagnosticJudgeFinding,
  DiagnosticJudgeVerdict,
  DiagnosticReviewReport,
} from "../types/diagnosticJudges";

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
  learningAssistedHypothesis?: {
    family: string;
    reason: string;
    confidence: number;
    basedOnCases: number;
  };
};

type DiagnosticJudgeEngineInput = {
  intake: UserIntake;
  finalReading: FinalReading;
  familyScores?: ProfileFamilyScore[];
  affinityScores?: HumanAffinityScore[];
  learningSignal?: LearningSignalLike | null;
  similarCases?: SimilarCaseLike[];
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

function collectHumanText(value: unknown): string[] {
  if (typeof value === "string") {
    const cleaned = value.trim();
    return cleaned.length > 0 ? [cleaned] : [];
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectHumanText(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((item) => collectHumanText(item));
  }

  return [];
}

function buildFullIntakeText(intake: UserIntake): string {
  return collectHumanText(intake).join(" ");
}

function getFamilyId(family: ProfileFamilyScore | undefined | null): string {
  if (!family) return "";

  const raw = (family as any).id ?? (family as any).familyId ?? "";
  return normalizeFamily(raw);
}

function getFamilyLabel(family: ProfileFamilyScore | undefined | null): string {
  if (!family) return "";

  const raw =
    (family as any).label ??
    (family as any).familyLabel ??
    (family as any).id ??
    "";

  return normalizeFamilyLabel(raw);
}

function getFamilyScore(family: ProfileFamilyScore | undefined | null): number {
  const value = (family as any)?.score;

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getFamilyConfidence(
  family: ProfileFamilyScore | undefined | null,
): number {
  const value = (family as any)?.confidence;

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

function judgeFamilyScores(
  familyScores: ProfileFamilyScore[] | undefined,
): DiagnosticJudgeFinding {
  const sorted = sortFamilyScores(familyScores);
  const top = sorted[0] ?? null;
  const second = sorted[1] ?? null;

  if (!top) {
    return buildFinding({
      judgeId: "family_score_judge",
      verdict: "red_flag",
      confidence: 0.4,
      reason: "No llegaron familyScores utilizables a la revisión diagnóstica.",
      evidence: [],
    });
  }

  const topLabel = getFamilyLabel(top);
  const secondLabel = getFamilyLabel(second);
  const topScore = getFamilyScore(top);
  const secondScore = getFamilyScore(second);
  const gap = topScore - secondScore;

  if (second && topScore >= 0.45 && secondScore >= 0.42 && gap <= 0.12) {
    return buildFinding({
      judgeId: "family_score_judge",
      verdict: "frontier",
      family: `${topLabel} / ${secondLabel}`,
      confidence: clamp((topScore + secondScore) / 2),
      reason:
        "Las dos familias principales están demasiado cerca como para cerrar una sentencia única.",
      evidence: [
        `${topLabel}: ${Math.round(topScore * 100)}%`,
        `${secondLabel}: ${Math.round(secondScore * 100)}%`,
        `Diferencia: ${Math.round(gap * 100)} puntos`,
      ],
    });
  }

  if (topScore >= 0.52) {
    return buildFinding({
      judgeId: "family_score_judge",
      verdict: "aligned",
      family: topLabel,
      confidence: clamp(topScore),
      reason: "La capa de familyScores encuentra una familia dominante utilizable.",
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

function judgeSimilarCases(
  learningSignal: LearningSignalLike | null | undefined,
  similarCases: SimilarCaseLike[] | undefined,
  finalReading: FinalReading,
): DiagnosticJudgeFinding {
  const cases = similarCases ?? learningSignal?.similarCases ?? [];
  const strongestFamily = learningSignal?.strongestHistoricalFamily;
  const assistedFamily = learningSignal?.learningAssistedHypothesis?.family;
  const historicalFamily = assistedFamily ?? strongestFamily;
  const currentPattern = normalizeFamily((finalReading as any).corePattern);

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

  const historicalNormalized = normalizeFamily(historicalFamily);
  const bestSimilarity =
    cases
      .map((item) =>
        typeof item.similarityScore === "number" &&
        Number.isFinite(item.similarityScore)
          ? item.similarityScore
          : 0,
      )
      .sort((a, b) => b - a)[0] ?? 0;

  const currentMentionsHistorical = currentPattern.includes(historicalNormalized);

  if (learningSignal?.shouldRaiseRedFlag && !currentMentionsHistorical) {
    return buildFinding({
      judgeId: "similar_case_judge",
      verdict: "conflict",
      family: normalizeFamilyLabel(historicalFamily),
      confidence: clamp(bestSimilarity),
      reason:
        "La memoria de casos aprendidos empuja hacia una familia que no coincide con el patrón principal actual.",
      evidence: [
        `Familia histórica dominante: ${normalizeFamilyLabel(historicalFamily)}`,
        `Casos similares encontrados: ${cases.length}`,
        `Mejor similitud: ${Math.round(bestSimilarity * 100)}%`,
      ],
    });
  }

  if (learningSignal?.shouldRaiseRedFlag && currentMentionsHistorical) {
    return buildFinding({
      judgeId: "similar_case_judge",
      verdict: "frontier",
      family: normalizeFamilyLabel(historicalFamily),
      confidence: clamp(bestSimilarity),
      reason:
        "La memoria de casos aprendidos confirma que una de las familias de la frontera merece revisión fuerte.",
      evidence: [
        `Familia histórica dominante: ${normalizeFamilyLabel(historicalFamily)}`,
        `Casos similares encontrados: ${cases.length}`,
      ],
    });
  }

  return buildFinding({
    judgeId: "similar_case_judge",
    verdict: "aligned",
    family: normalizeFamilyLabel(historicalFamily),
    confidence: clamp(bestSimilarity),
    reason: "La memoria histórica no contradice de forma fuerte el diagnóstico actual.",
    evidence: [
      `Familia histórica dominante: ${normalizeFamilyLabel(historicalFamily)}`,
      `Casos similares encontrados: ${cases.length}`,
    ],
  });
}

function judgeHumanLexicon(intake: UserIntake): DiagnosticJudgeFinding {
  const text = normalizeText(buildFullIntakeText(intake));

  const technicalMarkers = [
    "desarmar",
    "armar",
    "reparar",
    "arreglar",
    "hacer funcionar",
    "funcione",
    "funcionen",
    "motor",
    "motores",
    "circuito",
    "circuitos",
    "electrico",
    "electricos",
    "mecanico",
    "mecanicos",
    "instalacion",
    "instalaciones",
    "herramienta",
    "herramientas",
    "taller",
    "componentes",
    "celular",
    "celulares",
    "artefacto",
    "artefactos",
    "prototipo",
    "meter mano",
  ];

  const systemMarkers = [
    "sistema",
    "sistemas",
    "estructura",
    "estructuras",
    "ordenar",
    "organizar",
    "proceso",
    "procesos",
    "criterio",
    "secuencia",
    "secuencias",
    "diseñar",
    "disenar",
    "marco",
    "marcos",
  ];

  const expressiveMarkers = [
    "escribir",
    "contar",
    "relatar",
    "narrar",
    "historias",
    "comunicar",
    "expresar",
    "voz",
    "mensaje",
    "contenido",
  ];

  const empathicMarkers = [
    "escuchar",
    "acompañar",
    "acompanar",
    "ayudar",
    "contener",
    "orientar a alguien",
    "persona",
    "personas",
    "emocion",
    "emociones",
  ];

  function matched(markers: string[]): string[] {
    return markers.filter((marker) => text.includes(marker));
  }

  const technicalHits = matched(technicalMarkers);
  const systemHits = matched(systemMarkers);
  const expressiveHits = matched(expressiveMarkers);
  const empathicHits = matched(empathicMarkers);

  const groups = [
    {
      family: "Technical Builder",
      hits: technicalHits,
      threshold: 3,
    },
    {
      family: "System Designer",
      hits: systemHits,
      threshold: 3,
    },
    {
      family: "Creative Storyteller",
      hits: expressiveHits,
      threshold: 3,
    },
    {
      family: "Empathic Guide",
      hits: empathicHits,
      threshold: 3,
    },
  ].sort((a, b) => b.hits.length - a.hits.length);

  const winner = groups[0];

  if (!winner || winner.hits.length === 0) {
    return buildFinding({
      judgeId: "human_lexicon_judge",
      verdict: "aligned",
      confidence: 0.1,
      reason: "No se detectó un grupo léxico humano suficientemente dominante.",
      evidence: [],
    });
  }

  const confidence = clamp(winner.hits.length / 8);

  if (winner.hits.length >= winner.threshold) {
    return buildFinding({
      judgeId: "human_lexicon_judge",
      verdict: "frontier",
      family: winner.family,
      confidence,
      reason:
        "El lenguaje humano crudo contiene marcadores repetidos que empujan hacia una familia concreta.",
      evidence: winner.hits.slice(0, 10),
    });
  }

  return buildFinding({
    judgeId: "human_lexicon_judge",
    verdict: "aligned",
    family: winner.family,
    confidence,
    reason:
      "Hay algunos marcadores léxicos útiles, pero todavía no alcanzan para corregir la lectura.",
    evidence: winner.hits.slice(0, 10),
  });
}

function judgeRivalries(
  familyScores: ProfileFamilyScore[] | undefined,
): DiagnosticJudgeFinding {
  const sorted = sortFamilyScores(familyScores);
  const top = sorted[0] ?? null;
  const second = sorted[1] ?? null;

  if (!top || !second) {
    return buildFinding({
      judgeId: "rivalry_judge",
      verdict: "aligned",
      confidence: 0.1,
      reason: "No hay dos familias suficientemente visibles para evaluar rivalidad.",
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

  const knownRivalries = [
    ["system_designer", "technical_builder"],
    ["analytical_strategist", "system_designer"],
    ["creative_storyteller", "public_communicator"],
    ["empathic_guide", "community_builder"],
    ["diplomatic_social_connector", "institutional_operator"],
    ["analytical_strategist", "technical_builder"],
  ];

  const isKnownRivalry = knownRivalries.some(
    ([a, b]) =>
      (topId === a && secondId === b) || (topId === b && secondId === a),
  );

  if (isKnownRivalry && gap <= 0.15) {
    return buildFinding({
      judgeId: "rivalry_judge",
      verdict: "frontier",
      family: `${topLabel} / ${secondLabel}`,
      confidence: clamp((topScore + secondScore) / 2),
      reason:
        "El caso cae dentro de una rivalidad conocida y la distancia entre familias es estrecha.",
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
    reason: "No se detecta una rivalidad suficientemente cerrada.",
    evidence: [
      `${topLabel}: ${Math.round(topScore * 100)}%`,
      `${secondLabel}: ${Math.round(secondScore * 100)}%`,
    ],
  });
}

function judgeAntiOverfit(
  similarCases: SimilarCaseLike[] | undefined,
): DiagnosticJudgeFinding {
  const cases = similarCases ?? [];

  if (cases.length < 4) {
    return buildFinding({
      judgeId: "anti_overfit_judge",
      verdict: "aligned",
      confidence: 0.2,
      reason:
        "Todavía no hay tantos casos similares como para sospechar cebado fuerte.",
      evidence: [`Casos similares: ${cases.length}`],
    });
  }

  const familyCounts = new Map<string, number>();

  for (const item of cases) {
    const family = normalizeFamily(item.expectedPrimaryFamily);
    if (!family) continue;

    familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
  }

  const mostRepeated = [...familyCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  if (mostRepeated && mostRepeated[1] >= 4) {
    return buildFinding({
      judgeId: "anti_overfit_judge",
      verdict: "red_flag",
      family: normalizeFamilyLabel(mostRepeated[0]),
      confidence: clamp(mostRepeated[1] / cases.length),
      reason:
        "Hay demasiados casos similares empujando hacia la misma familia. Conviene limitar el peso del aprendizaje para evitar cebado.",
      evidence: [
        `Familia repetida: ${normalizeFamilyLabel(mostRepeated[0])}`,
        `Repeticiones: ${mostRepeated[1]}`,
        `Casos similares: ${cases.length}`,
      ],
    });
  }

  return buildFinding({
    judgeId: "anti_overfit_judge",
    verdict: "aligned",
    confidence: 0.3,
    reason: "No se detecta patrón fuerte de sobreajuste por repetición.",
    evidence: [`Casos similares: ${cases.length}`],
  });
}

function aggregateVerdict(
  findings: DiagnosticJudgeFinding[],
): DiagnosticJudgeVerdict {
  const hasHumanReview = findings.some(
    (finding) => finding.verdict === "human_review_recommended",
  );

  if (hasHumanReview) return "human_review_recommended";

  const hasConflict = findings.some((finding) => finding.verdict === "conflict");
  const hasRedFlag = findings.some((finding) => finding.verdict === "red_flag");
  const frontierCount = findings.filter(
    (finding) => finding.verdict === "frontier",
  ).length;

  if (hasConflict && hasRedFlag) return "human_review_recommended";
  if (hasConflict) return "conflict";
  if (frontierCount >= 2) return "frontier";
  if (hasRedFlag) return "red_flag";
  if (frontierCount === 1) return "frontier";

  return "aligned";
}

function getRecommendedFrontier(
  findings: DiagnosticJudgeFinding[],
): string[] | undefined {
  const frontierFamilies = findings
    .filter((finding) => finding.verdict === "frontier" && finding.family)
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
    .filter((finding) => finding.family)
    .sort((a, b) => b.confidence - a.confidence);

  return candidates[0]?.family;
}

export function runDiagnosticJudgeEngine(
  input: DiagnosticJudgeEngineInput,
): DiagnosticReviewReport {
  const similarCases =
    input.similarCases ?? input.learningSignal?.similarCases ?? [];

  const findings: DiagnosticJudgeFinding[] = [
    judgeFamilyScores(input.familyScores),
    judgeSimilarCases(input.learningSignal, similarCases, input.finalReading),
    judgeHumanLexicon(input.intake),
    judgeRivalries(input.familyScores),
    judgeAntiOverfit(similarCases),
  ];

  const finalVerdict = aggregateVerdict(findings);

  return {
    finalVerdict,
    recommendedPrimaryFamily:
      finalVerdict === "aligned" || finalVerdict === "conflict"
        ? getRecommendedPrimaryFamily(findings)
        : undefined,
    recommendedFrontier:
      finalVerdict === "frontier" ? getRecommendedFrontier(findings) : undefined,
    shouldRequestHumanReview:
      finalVerdict === "human_review_recommended" ||
      finalVerdict === "conflict" ||
      findings.some((finding) => finding.verdict === "red_flag"),
    findings,
  };
}