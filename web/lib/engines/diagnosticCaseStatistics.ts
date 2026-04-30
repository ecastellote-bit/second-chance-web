import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";

type UnknownRecord = Record<string, unknown>;

type FamilyStatSnapshot = {
  family: string;
  rank: number;
  score: number;
  confidence: number;
};

type ContextualForceStat = {
  kind: string;
  label: string;
  strength: number;
};

type ActivationPathStat = {
  path: string;
  fit: string;
};

export type DiagnosticCaseStatistics = {
  statsId: "diagnostic_case_statistics";
  shouldStoreStatistics: true;
  shouldInfluenceDiagnosis: false;

  resultType: string;
  primaryFamily: string | null;
  frontierFamilies: string[];
  topFamilies: FamilyStatSnapshot[];

  similarCasesCount: number;
  strongestHistoricalFamily: string | null;

  diagnosticJudgeVerdict: string | null;
  diagnosticJudgeRequestedHumanReview: boolean;

  experienceDistillationVerdict: string | null;
  learningTier: string | null;
  shouldStoreLearningTrace: boolean;
  shouldInfluenceFutureCases: boolean;

  contextualVerdict: string | null;
  contextualFrame: string | null;
  contextualForces: ContextualForceStat[];
  activationPaths: ActivationPathStat[];

  extractedLessonsCount: number;
  warningCount: number;
  noteCount: number;

  caseComplexityScore: number;
  evidenceVolume: {
    textCharacters: number;
    textLines: number;
  };

  statisticalTags: string[];

  summary: string;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function cleanLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function collectHumanText(value: unknown): string[] {
  if (typeof value === "string") {
    const cleaned = value.trim();
    return cleaned ? [cleaned] : [];
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectHumanText(item));
  }

  if (isRecord(value)) {
    return Object.values(value).flatMap((item) => collectHumanText(item));
  }

  return [];
}

function getFamilyLabel(value: unknown): string | null {
  if (!isRecord(value)) return null;

  return (
    cleanLabel(value.family) ??
    cleanLabel(value.familyId) ??
    cleanLabel(value.id) ??
    cleanLabel(value.label) ??
    cleanLabel(value.familyLabel)
  );
}

function getNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getFamilySnapshots(familyScores: unknown[]): FamilyStatSnapshot[] {
  return familyScores
    .filter(isRecord)
    .map((item) => ({
      family: getFamilyLabel(item) ?? "unknown_family",
      score: getNumber(item.score),
      confidence: getNumber(item.confidence),
    }))
    .filter((item) => item.score > 0 || item.confidence > 0)
    .sort((a, b) => {
      const scoreDelta = b.score - a.score;
      if (scoreDelta !== 0) return scoreDelta;

      return b.confidence - a.confidence;
    })
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
}

function getCorePatternFamilies(finalReading: FinalReading): string[] {
  const safe = finalReading as unknown as UnknownRecord;
  const corePattern = cleanLabel(safe.corePattern);

  if (!corePattern) return [];

  return uniqueStrings(
    corePattern
      .split("/")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function getRecommendedFrontier(value: unknown): string[] {
  if (!isRecord(value)) return [];

  const raw = value.recommendedFrontier ?? value.suggestedFrontier;

  if (!Array.isArray(raw)) return [];

  return uniqueStrings(raw.map((item) => cleanLabel(item)));
}

function getSimilarCasesCount(similarCases: unknown[]): number {
  return Array.isArray(similarCases) ? similarCases.length : 0;
}

function getStrongestHistoricalFamily(learningSignal: unknown): string | null {
  if (!isRecord(learningSignal)) return null;

  return cleanLabel(learningSignal.strongestHistoricalFamily);
}

function getLearningTrace(experienceDistillation: unknown): UnknownRecord | null {
  if (!isRecord(experienceDistillation)) return null;

  if (isRecord(experienceDistillation.learningTrace)) {
    return experienceDistillation.learningTrace;
  }

  return experienceDistillation;
}

function getContextualForces(contextualSituationReview: unknown): ContextualForceStat[] {
  if (!isRecord(contextualSituationReview)) return [];

  const rawForces = [
    ...(Array.isArray(contextualSituationReview.forces)
      ? contextualSituationReview.forces
      : []),
    ...(Array.isArray(contextualSituationReview.contextualForces)
      ? contextualSituationReview.contextualForces
      : []),
  ];

  const seen = new Set<string>();

  return rawForces
    .filter(isRecord)
    .map((force) => {
      const kind =
        cleanLabel(force.kind) ??
        cleanLabel(force.type) ??
        cleanLabel(force.label) ??
        "unknown_force";

      const label = cleanLabel(force.label) ?? kind;
      const strength = getNumber(force.strength);

      return { kind, label, strength };
    })
    .filter((force) => {
      const key = `${force.kind}:${force.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function getActivationPaths(contextualSituationReview: unknown): ActivationPathStat[] {
  if (!isRecord(contextualSituationReview)) return [];

  const raw = contextualSituationReview.activationHints;

  if (!Array.isArray(raw)) return [];

  return raw
    .filter(isRecord)
    .map((item) => ({
      path: cleanLabel(item.path) ?? "unknown_path",
      fit: cleanLabel(item.fit) ?? "unknown_fit",
    }));
}

function getExtractedLessonsCount(experienceDistillation: unknown): number {
  if (!isRecord(experienceDistillation)) return 0;

  const extractedLessons =
    experienceDistillation.extractedLessons ??
    experienceDistillation.lessons ??
    experienceDistillation.distilledLessons;

  return Array.isArray(extractedLessons) ? extractedLessons.length : 0;
}

function getTextItemCount(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  return value ? 1 : 0;
}

function buildStatisticalTags(params: {
  resultType: string;
  frontierFamilies: string[];
  diagnosticJudgeVerdict: string | null;
  contextualVerdict: string | null;
  learningTier: string | null;
  shouldInfluenceFutureCases: boolean;
  shouldStoreLearningTrace: boolean;
  diagnosticJudgeRequestedHumanReview: boolean;
  contextualForces: ContextualForceStat[];
}): string[] {
  const tags: string[] = [];

  tags.push(`result:${params.resultType}`);

  if (params.frontierFamilies.length >= 2) {
    tags.push("frontier_present");
  }

  if (params.diagnosticJudgeVerdict) {
    tags.push(`judge:${normalizeText(params.diagnosticJudgeVerdict)}`);
  }

  if (params.contextualVerdict) {
    tags.push(`context:${normalizeText(params.contextualVerdict)}`);
  }

  if (params.learningTier) {
    tags.push(`learning_tier:${normalizeText(params.learningTier)}`);
  }

  if (params.shouldStoreLearningTrace) {
    tags.push("learning_trace_stored");
  }

  if (params.shouldInfluenceFutureCases) {
    tags.push("future_influence_enabled");
  } else {
    tags.push("future_influence_disabled");
  }

  if (params.diagnosticJudgeRequestedHumanReview) {
    tags.push("human_review_requested");
  }

  for (const force of params.contextualForces) {
    if (force.strength >= 0.7) {
      tags.push(`strong_context:${normalizeText(force.kind)}`);
    }
  }

  return uniqueStrings(tags);
}

function calculateComplexityScore(params: {
  frontierFamilies: string[];
  contextualForces: ContextualForceStat[];
  similarCasesCount: number;
  extractedLessonsCount: number;
  diagnosticJudgeRequestedHumanReview: boolean;
  shouldInfluenceFutureCases: boolean;
}): number {
  let score = 0.2;

  if (params.frontierFamilies.length >= 2) score += 0.2;
  if (params.contextualForces.length >= 3) score += 0.2;
  if (params.similarCasesCount >= 3) score += 0.1;
  if (params.extractedLessonsCount > 0) score += 0.1;
  if (params.diagnosticJudgeRequestedHumanReview) score += 0.15;
  if (params.shouldInfluenceFutureCases) score += 0.1;

  return Math.min(0.95, score);
}

export function buildDiagnosticCaseStatistics(params: {
  sourceInput: {
    rawInput: unknown;
    intake: UserIntake;
  };
  finalReading: FinalReading;
  familyScores?: unknown[];
  affinityScores?: unknown[];
  similarCases?: unknown[];
  learningSignal?: unknown;
  diagnosticReview?: unknown;
  experienceDistillation?: unknown;
  contextualSituationReview?: unknown;
}): DiagnosticCaseStatistics {
  const safeReading = params.finalReading as unknown as UnknownRecord;
  const diagnosticReview = isRecord(params.diagnosticReview)
    ? params.diagnosticReview
    : null;

  const contextualSituationReview = isRecord(params.contextualSituationReview)
    ? params.contextualSituationReview
    : null;

  const experienceDistillation = isRecord(params.experienceDistillation)
    ? params.experienceDistillation
    : null;

  const learningTrace = getLearningTrace(experienceDistillation);

  const resultType = cleanLabel(safeReading.resultType) ?? "unknown_result_type";

  const topFamilies = getFamilySnapshots(params.familyScores ?? []);
  const corePatternFamilies = getCorePatternFamilies(params.finalReading);

  const diagnosticFrontier = getRecommendedFrontier(diagnosticReview);
  const contextualFrontier = getRecommendedFrontier(contextualSituationReview);

  const frontierFamilies = uniqueStrings([
    ...corePatternFamilies,
    ...diagnosticFrontier,
    ...contextualFrontier,
  ]);

  const primaryFamily =
    corePatternFamilies[0] ??
    topFamilies[0]?.family ??
    cleanLabel(diagnosticReview?.recommendedPrimaryFamily) ??
    cleanLabel(contextualSituationReview?.suggestedPrimaryFamily) ??
    null;

  const similarCasesCount = getSimilarCasesCount(params.similarCases ?? []);
  const strongestHistoricalFamily = getStrongestHistoricalFamily(
    params.learningSignal,
  );

  const diagnosticJudgeVerdict = cleanLabel(diagnosticReview?.finalVerdict);
  const diagnosticJudgeRequestedHumanReview =
    diagnosticReview?.shouldRequestHumanReview === true;

  const experienceDistillationVerdict = cleanLabel(
    experienceDistillation?.verdict,
  );

  const learningTier =
    cleanLabel(learningTrace?.learningTier) ??
    cleanLabel(experienceDistillation?.learningTier) ??
    cleanLabel(experienceDistillation?.recommendedLearningUse);

  const shouldStoreLearningTrace =
    learningTrace?.shouldStoreTrace === true ||
    experienceDistillation?.shouldStoreTrace === true ||
    true;

  const shouldInfluenceFutureCases =
    learningTrace?.shouldInfluenceFutureCases === true ||
    experienceDistillation?.shouldInfluenceFutureCases === true;

  const contextualVerdict = cleanLabel(contextualSituationReview?.verdict);
  const contextualFrame =
    cleanLabel(contextualSituationReview?.situationFrame) ??
    cleanLabel(contextualSituationReview?.dominantContext);

  const contextualForces = getContextualForces(contextualSituationReview);
  const activationPaths = getActivationPaths(contextualSituationReview);

  const extractedLessonsCount =
    getExtractedLessonsCount(experienceDistillation);

  const warningCount =
    getTextItemCount(experienceDistillation?.warnings) +
    getTextItemCount(experienceDistillation?.misreadWarnings) +
    getTextItemCount(contextualSituationReview?.warnings);

  const noteCount =
    getTextItemCount(experienceDistillation?.notes) +
    getTextItemCount(contextualSituationReview?.notes);

  const humanText = collectHumanText(params.sourceInput);
  const evidenceText = humanText.join("\n");

  const statisticalTags = buildStatisticalTags({
    resultType,
    frontierFamilies,
    diagnosticJudgeVerdict,
    contextualVerdict,
    learningTier,
    shouldInfluenceFutureCases,
    shouldStoreLearningTrace,
    diagnosticJudgeRequestedHumanReview,
    contextualForces,
  });

  const caseComplexityScore = calculateComplexityScore({
    frontierFamilies,
    contextualForces,
    similarCasesCount,
    extractedLessonsCount,
    diagnosticJudgeRequestedHumanReview,
    shouldInfluenceFutureCases,
  });

  return {
    statsId: "diagnostic_case_statistics",
    shouldStoreStatistics: true,
    shouldInfluenceDiagnosis: false,

    resultType,
    primaryFamily,
    frontierFamilies,
    topFamilies,

    similarCasesCount,
    strongestHistoricalFamily,

    diagnosticJudgeVerdict,
    diagnosticJudgeRequestedHumanReview,

    experienceDistillationVerdict,
    learningTier,
    shouldStoreLearningTrace,
    shouldInfluenceFutureCases,

    contextualVerdict,
    contextualFrame,
    contextualForces,
    activationPaths,

    extractedLessonsCount,
    warningCount,
    noteCount,

    caseComplexityScore,
    evidenceVolume: {
      textCharacters: evidenceText.length,
      textLines: humanText.length,
    },

    statisticalTags,

    summary:
      "Traza estadística del caso. Sirve para acumulación agregada, auditoría futura, distribución de familias, frecuencia de fronteras, señales contextuales y calidad del diagnóstico. No modifica por sí sola la sentencia diagnóstica.",
  };
}