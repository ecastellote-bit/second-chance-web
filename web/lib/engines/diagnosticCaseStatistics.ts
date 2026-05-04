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
  weakSimilarityWarningDetected: boolean;

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

  compressionDetected: boolean;
  compressionSignalsDetected: boolean;
  compressionSignalReasons: string[];

  humanReviewSuggested: boolean;
  frontierDetected: boolean;
  conflictDetected: boolean;

  extractedLessonsCount: number;
  warningCount: number;
  noteCount: number;

  caseComplexityScore: number;
  evidenceVolume: {
    textCharacters: number;
    textLines: number;
  };

  statisticalTags: string[];
  notes: string[];

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

function normalizeKey(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .trim();
}

function cleanLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    if (typeof value !== "string") continue;

    const cleaned = value.trim();
    if (!cleaned) continue;

    const key = normalizeKey(cleaned);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    output.push(cleaned);
  }

  return output;
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

function keyToWords(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .trim();
}

function collectHumanTextWithKeys(value: unknown, path = ""): string[] {
  if (typeof value === "string") {
    const cleaned = value.trim();
    if (!cleaned) return [];

    return path ? [`${path}: ${cleaned}`, cleaned] : [cleaned];
  }

  if (typeof value === "number" || typeof value === "boolean") {
    const cleaned = String(value);
    return path ? [`${path}: ${cleaned}`, cleaned] : [cleaned];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectHumanTextWithKeys(item, path));
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) => {
      const readableKey = keyToWords(key);
      const nextPath = path ? `${path} ${readableKey}` : readableKey;
      return collectHumanTextWithKeys(item, nextPath);
    });
  }

  return [];
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(normalizeText(term)));
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

function getFamilyRaceFrontier(finalReading: FinalReading): string[] {
  const safe = finalReading as unknown as UnknownRecord;
  const trace = isRecord(safe.trace) ? safe.trace : null;
  const familyRace = isRecord(trace?.familyRace) ? trace.familyRace : null;

  if (!familyRace) return [];

  const shouldAvoidSingleClearClaim =
    familyRace.shouldAvoidSingleClearClaim === true ||
    familyRace.isCloseRace === true ||
    familyRace.isVeryCloseRace === true;

  if (!shouldAvoidSingleClearClaim) return [];

  return uniqueStrings([
    cleanLabel(familyRace.topLabel),
    cleanLabel(familyRace.secondLabel),
  ]);
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

function getContextualForces(
  contextualSituationReview: unknown,
): ContextualForceStat[] {
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
      const key = `${normalizeKey(force.kind)}:${normalizeKey(force.label)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function getActivationPaths(
  contextualSituationReview: unknown,
): ActivationPathStat[] {
  if (!isRecord(contextualSituationReview)) return [];

  const raw = contextualSituationReview.activationHints;

  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();

  return raw
    .filter(isRecord)
    .map((item) => ({
      path: cleanLabel(item.path) ?? "unknown_path",
      fit: cleanLabel(item.fit) ?? "unknown_fit",
    }))
    .filter((item) => {
      const key = `${normalizeKey(item.path)}:${normalizeKey(item.fit)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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

function hasWeakSimilarityWarning(diagnosticReview: unknown): boolean {
  if (!isRecord(diagnosticReview)) return false;

  const finalVerdictKey = normalizeKey(cleanLabel(diagnosticReview.finalVerdict));
  if (finalVerdictKey === "weak_similarity_warning") return true;

  const findings = Array.isArray(diagnosticReview.findings)
    ? diagnosticReview.findings
    : [];

  return findings.filter(isRecord).some((finding) => {
    const judgeKey = normalizeKey(cleanLabel(finding.judgeId));
    const verdictKey = normalizeKey(cleanLabel(finding.verdict));
    const reasonKey = normalizeKey(cleanLabel(finding.reason));

    return (
      judgeKey.includes("similar") &&
      (verdictKey.includes("weak_similarity_warning") ||
        reasonKey.includes("similitud_mas_alta_es_baja") ||
        reasonKey.includes("similarity_low"))
    );
  });
}

function detectCompressionSignals(params: {
  sourceInput: unknown;
  finalReading: FinalReading;
  contextualForces: ContextualForceStat[];
}): {
  detected: boolean;
  reasons: string[];
} {
  const sourceText = normalizeText(
    [
      ...collectHumanText(params.sourceInput),
      ...collectHumanTextWithKeys(params.sourceInput),
    ].join("\n"),
  );

  const finalReadingText = normalizeText(
    collectHumanText(params.finalReading).join("\n"),
  );

  const text = `${sourceText}\n${finalReadingText}`;

  const forceKeys = params.contextualForces.map((force) =>
    normalizeKey(`${force.kind} ${force.label}`),
  );

  const hasCompressionContextualForce = forceKeys.some(
    (forceKey) =>
      forceKey.includes("compressed_capacity") ||
      forceKey.includes("capacidad_comprimida") ||
      forceKey.includes("stability_constraint") ||
      forceKey.includes("restricciones_reales_de_transicion") ||
      forceKey.includes("restricciones_de_transicion"),
  );

  const reasons = uniqueStrings([
    includesAny(text, [
      "energia baja",
      "poca energia",
      "sin energia",
      "energy level low",
      "energy level: low",
      "low energy",
      "agotado",
      "agotada",
      "agotamiento",
      "cansancio",
      "estres",
      "estresado",
      "estresada",
      "me apago",
      "apagado",
      "apagada",
    ])
      ? "baja energía, cansancio o desgaste"
      : null,

    includesAny(text, [
      "presion economica",
      "economic pressure high",
      "economic pressure: high",
      "plata",
      "deuda",
      "ingresos",
      "necesito ingresos",
      "sostener economicamente",
      "no puedo dejar",
    ])
      ? "presión económica o necesidad de sostener ingresos"
      : null,

    includesAny(text, [
      "hijos",
      "familia",
      "family load high",
      "family load: high",
      "carga familiar",
      "dependientes",
      "responsabilidades familiares",
    ])
      ? "carga familiar o responsabilidades de cuidado"
      : null,

    includesAny(text, [
      "deje de lado",
      "renuncie",
      "renuncias",
      "postergue",
      "tapada",
      "tapado",
      "comprimida",
      "comprimido",
      "enterrada",
      "enterrado",
    ])
      ? "capacidad, deseo o vocación postergada"
      : null,

    includesAny(text, [
      "no me llena",
      "no me representa",
      "no la soporto",
      "no lo soporto",
      "trabajo desalineado",
      "tareas repetitivas",
    ])
      ? "desalineación o desgaste en la ocupación actual"
      : null,

    hasCompressionContextualForce
      ? "fuerza contextual de compresión o restricción detectada"
      : null,
  ]);

  return {
    detected: reasons.length > 0,
    reasons,
  };
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
  weakSimilarityWarningDetected: boolean;
  contextualForces: ContextualForceStat[];
  compressionDetected: boolean;
  conflictDetected: boolean;
}): string[] {
  const tags: string[] = [];

  tags.push(`result_${normalizeKey(params.resultType)}`);

  if (params.frontierFamilies.length >= 2) {
    tags.push("frontier_present");
  }

  if (params.diagnosticJudgeVerdict) {
    tags.push(`judge_${normalizeKey(params.diagnosticJudgeVerdict)}`);
  }

  if (params.contextualVerdict) {
    tags.push(`context_${normalizeKey(params.contextualVerdict)}`);
  }

  if (params.learningTier) {
    tags.push(`learning_tier_${normalizeKey(params.learningTier)}`);
  }

  if (params.weakSimilarityWarningDetected) {
    tags.push("weak_similarity_warning");
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

  if (params.compressionDetected) {
    tags.push("compression_signals_detected");
  }

  if (params.conflictDetected) {
    tags.push("conflict_detected");
  }

  for (const force of params.contextualForces) {
    if (force.strength >= 0.7) {
      tags.push(`strong_context_${normalizeKey(force.kind)}`);
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
  weakSimilarityWarningDetected: boolean;
  shouldInfluenceFutureCases: boolean;
  compressionDetected: boolean;
  conflictDetected: boolean;
}): number {
  let score = 0.2;

  if (params.frontierFamilies.length >= 2) score += 0.2;
  if (params.contextualForces.length >= 3) score += 0.2;
  if (params.similarCasesCount >= 3) score += 0.1;
  if (params.extractedLessonsCount > 0) score += 0.1;
  if (params.diagnosticJudgeRequestedHumanReview) score += 0.15;
  if (params.weakSimilarityWarningDetected) score += 0.05;
  if (params.shouldInfluenceFutureCases) score += 0.1;
  if (params.compressionDetected) score += 0.1;
  if (params.conflictDetected) score += 0.1;

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
  const familyRaceFrontier = getFamilyRaceFrontier(params.finalReading);

  const diagnosticFrontier = getRecommendedFrontier(diagnosticReview);

  const contextualFrontier =
    contextualSituationReview?.shouldOpenFrontier === true
      ? getRecommendedFrontier(contextualSituationReview)
      : [];

  const frontierFamilies = uniqueStrings([
    ...(corePatternFamilies.length >= 2 ? corePatternFamilies : []),
    ...familyRaceFrontier,
    ...diagnosticFrontier,
    ...contextualFrontier,
  ]);

  const primaryFamily =
    corePatternFamilies[0] ??
    cleanLabel(diagnosticReview?.recommendedPrimaryFamily) ??
    cleanLabel(contextualSituationReview?.suggestedPrimaryFamily) ??
    topFamilies[0]?.family ??
    null;

  const similarCasesCount = getSimilarCasesCount(params.similarCases ?? []);

  const strongestHistoricalFamily = getStrongestHistoricalFamily(
    params.learningSignal,
  );

  const weakSimilarityWarningDetected = hasWeakSimilarityWarning(
    diagnosticReview,
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

  const shouldStoreLearningTrace = true;

  const shouldInfluenceFutureCases =
    learningTrace?.shouldInfluenceFutureCases === true ||
    experienceDistillation?.shouldInfluenceFutureCases === true;

  const contextualVerdict = cleanLabel(contextualSituationReview?.verdict);

  const contextualFrame =
    cleanLabel(contextualSituationReview?.situationFrame) ??
    cleanLabel(contextualSituationReview?.dominantContext);

  const contextualForces = getContextualForces(contextualSituationReview);
  const activationPaths = getActivationPaths(contextualSituationReview);

  const compressionSignals = detectCompressionSignals({
    sourceInput: params.sourceInput,
    finalReading: params.finalReading,
    contextualForces,
  });

  const extractedLessonsCount =
    getExtractedLessonsCount(experienceDistillation);

  const warningCount =
    getTextItemCount(experienceDistillation?.warnings) +
    getTextItemCount(experienceDistillation?.misreadWarnings) +
    getTextItemCount(contextualSituationReview?.warnings);

  const noteCount =
    getTextItemCount(experienceDistillation?.notes) +
    getTextItemCount(contextualSituationReview?.notes);

  const diagnosticConflict =
    normalizeKey(diagnosticJudgeVerdict).includes("conflict") ||
    normalizeKey(diagnosticJudgeVerdict).includes("contradiction");

  const contextualConflict = normalizeKey(contextualVerdict).includes("conflict");

  const recommendedLearningUseKey = normalizeKey(
    cleanLabel(experienceDistillation?.recommendedLearningUse),
  );

  const experienceVerdictKey = normalizeKey(experienceDistillationVerdict);

  const distillationRequestsHumanReview =
    experienceVerdictKey.includes("requires_human_review") ||
    experienceVerdictKey.includes("human_review");

  const distillationMisreadWarning =
    recommendedLearningUseKey.includes("misread_warning") ||
    normalizeKey(learningTier).includes("misread_warning");

  const weakSimilarityOnly =
    weakSimilarityWarningDetected && !diagnosticConflict && !contextualConflict;

  const strongDistillationConflict =
    distillationMisreadWarning &&
    !weakSimilarityOnly &&
    (experienceDistillation?.shouldRaiseRedFlag === true ||
      distillationRequestsHumanReview);

  const conflictDetected =
    diagnosticConflict || contextualConflict || strongDistillationConflict;

  const humanReviewSuggested =
    diagnosticJudgeRequestedHumanReview ||
    contextualSituationReview?.shouldRequestHumanReview === true ||
    (distillationRequestsHumanReview && !weakSimilarityOnly);

  const frontierDetected = frontierFamilies.length >= 2;

  const statisticalTags = buildStatisticalTags({
    resultType,
    frontierFamilies,
    diagnosticJudgeVerdict,
    contextualVerdict,
    learningTier,
    shouldInfluenceFutureCases,
    shouldStoreLearningTrace,
    diagnosticJudgeRequestedHumanReview,
    weakSimilarityWarningDetected,
    contextualForces,
    compressionDetected: compressionSignals.detected,
    conflictDetected,
  });

  const caseComplexityScore = calculateComplexityScore({
    frontierFamilies,
    contextualForces,
    similarCasesCount,
    extractedLessonsCount,
    diagnosticJudgeRequestedHumanReview,
    weakSimilarityWarningDetected,
    shouldInfluenceFutureCases,
    compressionDetected: compressionSignals.detected,
    conflictDetected,
  });

  const humanText = [
    ...collectHumanText(params.sourceInput),
    ...collectHumanTextWithKeys(params.sourceInput),
  ];

  const evidenceText = uniqueStrings(humanText).join("\n");

  const notes = uniqueStrings([
    "Esta traza sirve para contar patrones, fronteras, familias involucradas, señales contextuales y huella de aprendizaje.",
    "No decide el diagnóstico. Alimenta memoria estadística y auditoría futura.",
    weakSimilarityWarningDetected
      ? "Weak Similarity Warning detectado: no debe contarse como conflicto fuerte si el diagnóstico principal y los jueces centrales están alineados."
      : null,
    compressionSignals.detected
      ? "Se detectaron señales de compresión aunque el resultType no necesariamente sea compressed_life."
      : null,
  ]);

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
    weakSimilarityWarningDetected,

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

    compressionDetected: compressionSignals.detected,
    compressionSignalsDetected: compressionSignals.detected,
    compressionSignalReasons: compressionSignals.reasons,

    humanReviewSuggested,
    frontierDetected,
    conflictDetected,

    extractedLessonsCount,
    warningCount,
    noteCount,

    caseComplexityScore,
    evidenceVolume: {
      textCharacters: evidenceText.length,
      textLines: uniqueStrings(humanText).length,
    },

    statisticalTags,
    notes,

    summary:
      "Traza estadística del caso. Sirve para acumulación agregada, auditoría futura, distribución de familias, frecuencia de fronteras, señales contextuales, compresión vital y calidad del diagnóstico. No modifica por sí sola la sentencia diagnóstica.",
  };
}