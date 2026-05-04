import type {
  LearnedDiagnosticCase,
  LearningSignal,
  SimilarCaseMatch,
} from "../types/learning";
import { LEARNED_DIAGNOSTIC_CASES } from "../learning/learnedCases";

const STOPWORDS = new Set([
  "que",
  "para",
  "pero",
  "con",
  "una",
  "uno",
  "los",
  "las",
  "del",
  "por",
  "como",
  "más",
  "mas",
  "muy",
  "todo",
  "toda",
  "algo",
  "esto",
  "esta",
  "ese",
  "esa",
  "hay",
  "soy",
  "ser",
  "sin",
  "mis",
  "sus",
  "me",
  "mi",
  "yo",
  "de",
  "la",
  "el",
  "en",
  "y",
  "o",
  "a",
]);

type SearchableCaseSource = "seed" | "local_archive";

type SearchableLearnedCase = Omit<
  LearnedDiagnosticCase,
  | "source"
  | "searchWeight"
  | "influenceWeight"
  | "qualityScore"
  | "humanFeedbackScore"
  | "reviewStatus"
> & {
  source?: SearchableCaseSource;
  searchWeight?: number;
  influenceWeight?: number;
  qualityScore?: number;
  humanFeedbackScore?: number | null;
  reviewStatus?:
    | "raw"
    | "partial"
    | "reviewed"
    | "validated"
    | "rejected_for_influence"
    | "rejected_for_search"
    | string;
};

type SearchableSimilarCaseMatch = Omit<
  SimilarCaseMatch,
  | "source"
  | "searchWeight"
  | "influenceWeight"
  | "qualityScore"
  | "humanFeedbackScore"
  | "reviewStatus"
  | "shouldInfluenceFutureCases"
> & {
  source?: SearchableCaseSource;
  searchWeight?: number;
  influenceWeight?: number;
  qualityScore?: number;
  humanFeedbackScore?: number | null;
  reviewStatus?: string;
  shouldInfluenceFutureCases?: boolean;
};

function normalizeLearningText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeLearningText(text)
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item.length >= 3 && !STOPWORDS.has(item));
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function humanizeFamilyName(value: string): string {
  const cleaned = value.replace(/_/g, " ").trim();

  if (!cleaned) return "Unknown";

  return cleaned
    .split(" ")
    .map((part) =>
      part.length > 0
        ? `${part.charAt(0).toUpperCase()}${part.slice(1)}`
        : part,
    )
    .join(" ");
}

function collectHumanText(value: unknown, depth = 0): string[] {
  if (depth > 6) return [];

  if (typeof value === "string") {
    const cleaned = value.trim();
    return cleaned.length > 0 ? [cleaned] : [];
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectHumanText(item, depth + 1));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, item]) => {
        const normalizedKey = normalizeLearningText(key);

        /**
         * Evitamos contaminar la comparación con ruido técnico.
         * La biblioteca debe aprender lenguaje humano, no nombres de campos internos.
         */
        if (
          normalizedKey.includes("storagekey") ||
          normalizedKey.includes("archivedat") ||
          normalizedKey.includes("traceid") ||
          normalizedKey.includes("payloadhash") ||
          normalizedKey.includes("status") ||
          normalizedKey.includes("createdat") ||
          normalizedKey.includes("updatedat")
        ) {
          return [];
        }

        return collectHumanText(item, depth + 1);
      },
    );
  }

  return [];
}

function buildInputTextFromArchivedPayload(archive: any): string {
  const payload = archive?.payload ?? archive;

  const preferredSources = [
    payload?.sourceInput?.rawInput,
    payload?.sourceInput?.intake,
    payload?.rawInput,
    payload?.intake,
    payload?.input,
    payload?.answers,
    payload?.userInput,
    payload?.caseInput,
  ];

  const preferredText = preferredSources.flatMap((source) =>
    collectHumanText(source),
  );

  if (preferredText.length > 0) {
    return unique(preferredText).join("\n");
  }

  /**
   * Fallback:
   * si el archivo viejo no guardó sourceInput/intake de forma clara,
   * usamos una extracción amplia pero limitada.
   */
  return unique(collectHumanText(payload)).slice(0, 180).join("\n");
}

function buildKeyHumanLanguageFromText(inputText: string): string[] {
  const lines = inputText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length >= 4 && line.length <= 160);

  const compactTokens = unique(tokenize(inputText)).slice(0, 24);

  return unique([...lines.slice(0, 12), ...compactTokens]);
}

function extractLearningTrace(payload: any): any {
  return (
    payload?.experienceDistillation?.learningTrace ??
    payload?.diagnosticExperienceDistillation?.learningTrace ??
    payload?.diagnosticSurgery?.learningTrace ??
    payload?.learningDistillation?.learningTrace ??
    payload?.learningTrace ??
    {}
  );
}

function extractPrimaryFamilyFromArchive(archive: any): string {
  const payload = archive?.payload ?? archive;

  const directCandidates = [
    payload?.primaryFamily,
    payload?.finalReading?.primaryFamily,
    payload?.result?.primaryFamily,
    payload?.coreFamily,
    payload?.finalReading?.coreFamily,
    payload?.diagnosticCaseStatistics?.primaryFamily,
    payload?.diagnosticCaseStatistics?.statisticalPrimaryFamily,
    payload?.diagnosticStatistics?.primaryFamily,
    payload?.statisticalTrace?.primaryFamily,
    payload?.statisticalTrace?.statisticalPrimaryFamily,
    payload?.experienceDistillation?.primaryFamily,
    payload?.diagnosticExperienceDistillation?.primaryFamily,
  ];

  for (const candidate of directCandidates) {
    const asText = asString(candidate);
    if (asText) return humanizeFamilyName(asText);
  }

  const familyScores =
    payload?.familyScores ??
    payload?.finalReading?.familyScores ??
    payload?.diagnosticCaseStatistics?.familyScores ??
    payload?.statisticalTrace?.familyScores ??
    [];

  if (Array.isArray(familyScores) && familyScores.length > 0) {
    const sorted = [...familyScores].sort((a: any, b: any) => {
      const aScore = safeNumber(a?.score ?? a?.percentage ?? a?.value);
      const bScore = safeNumber(b?.score ?? b?.percentage ?? b?.value);

      return bScore - aScore;
    });

    const top = sorted[0];

    const topFamily =
      asString(top?.family) ??
      asString(top?.familyId) ??
      asString(top?.name) ??
      asString(top?.label);

    if (topFamily) return humanizeFamilyName(topFamily);
  }

  return "Unknown";
}

function extractRivalFamiliesFromArchive(archive: any): string[] {
  const payload = archive?.payload ?? archive;

  const possibleLists = [
    payload?.rivalFamilies,
    payload?.finalReading?.rivalFamilies,
    payload?.diagnosticCaseStatistics?.familiesInFrontier,
    payload?.diagnosticCaseStatistics?.frontierFamilies,
    payload?.statisticalTrace?.familiesInFrontier,
    payload?.statisticalTrace?.frontierFamilies,
    payload?.experienceDistillation?.learningTrace?.familiesInvolved,
    payload?.diagnosticExperienceDistillation?.learningTrace?.familiesInvolved,
  ];

  const families = possibleLists.flatMap((list) => {
    if (!Array.isArray(list)) return [];

    return list
      .map((item) => {
        if (typeof item === "string") return item;

        return (
          asString(item?.family) ??
          asString(item?.familyId) ??
          asString(item?.name) ??
          asString(item?.label) ??
          ""
        );
      })
      .filter(Boolean);
  });

  return unique(families.map(humanizeFamilyName));
}

function archivedCaseToLearnedCase(
  storageKey: string,
  rawArchive: unknown,
): SearchableLearnedCase | null {
  const archive = rawArchive as any;

  if (!archive || typeof archive !== "object") return null;

  const payload = archive?.payload ?? archive;
  const learningTrace = extractLearningTrace(payload);

  const inputText = buildInputTextFromArchivedPayload(archive);

  if (normalizeLearningText(inputText).length === 0) {
    return null;
  }

  const traceId =
    asString(archive?.trace?.traceId) ??
    asString(archive?.traceId) ??
    asString(payload?.traceId) ??
    storageKey;

  const expectedPrimaryFamily = extractPrimaryFamilyFromArchive(archive);
  const rivalFamilies = extractRivalFamiliesFromArchive(archive);

  const shouldInfluenceFutureCases =
    Boolean(learningTrace?.shouldInfluenceFutureCases) ||
    Boolean(payload?.shouldInfluenceFutureCases);

  const influenceStrength = safeNumber(
    learningTrace?.influenceStrength ?? payload?.influenceStrength,
    shouldInfluenceFutureCases ? 0.25 : 0,
  );

  const learningTier =
    asString(learningTrace?.learningTier) ??
    asString(payload?.learningTier) ??
    "raw_archive";

  const reviewStatus =
    learningTier === "validated"
      ? "validated"
      : shouldInfluenceFutureCases
        ? "reviewed"
        : "raw";

  const title =
    asString(payload?.title) ??
    asString(payload?.caseTitle) ??
    asString(payload?.diagnosticCaseStatistics?.title) ??
    `Caso archivado ${traceId.slice(-8)}`;

  const lesson =
    asString(learningTrace?.lesson) ??
    asString(payload?.lesson) ??
    "Caso archivado automáticamente. Debe usarse como comparación amplia, con influencia limitada salvo revisión humana posterior.";

  const keyHumanLanguage = buildKeyHumanLanguageFromText(inputText);

  return {
    id: traceId,
    title,
    inputText,
    keyHumanLanguage,
    lesson,
    expectedPrimaryFamily,
    acceptableFamilies: [expectedPrimaryFamily],
    rivalFamilies,
    shouldInfluenceFutureCases,

    source: "local_archive",
    searchWeight: 0.75,
    influenceWeight: clamp(influenceStrength),
    qualityScore: shouldInfluenceFutureCases ? 0.55 : 0.25,
    humanFeedbackScore: null,
    reviewStatus,
  } as SearchableLearnedCase;
}

function loadArchivedDiagnosticCasesFromLocalStorage(): SearchableLearnedCase[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  const cases: SearchableLearnedCase[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);

    if (!key) continue;

    if (!key.startsWith("2ndch_diagnostic_archive_")) {
      continue;
    }

    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) continue;

    try {
      const parsed = JSON.parse(rawValue);
      const learnedCase = archivedCaseToLearnedCase(key, parsed);

      if (learnedCase) {
        cases.push(learnedCase);
      }
    } catch {
      /**
       * Un caso corrupto en localStorage no debe romper el diagnóstico.
       * Se ignora y la biblioteca sigue funcionando.
       */
    }
  }

  return cases;
}

function mergeLearnedCasesWithArchive(
  learnedCases: LearnedDiagnosticCase[],
): SearchableLearnedCase[] {
  const staticCases = learnedCases.map((item) => ({
    ...item,
    source: "seed" as const,
    searchWeight: 1,
    influenceWeight: item.shouldInfluenceFutureCases ? 1 : 0,
    qualityScore: item.shouldInfluenceFutureCases ? 0.75 : 0.35,
    reviewStatus: item.shouldInfluenceFutureCases ? "reviewed" : "raw",
  }));

  const archivedCases = loadArchivedDiagnosticCasesFromLocalStorage();

  const byId = new Map<string, SearchableLearnedCase>();

  for (const learnedCase of [...staticCases, ...archivedCases]) {
    if (!learnedCase.id) continue;

    byId.set(learnedCase.id, learnedCase);
  }

  return [...byId.values()];
}

function buildCaseComparisonText(learnedCase: SearchableLearnedCase): string {
  return [
    learnedCase.title,
    learnedCase.inputText,
    learnedCase.keyHumanLanguage.join(" "),
    learnedCase.lesson,
    learnedCase.expectedPrimaryFamily,
    learnedCase.acceptableFamilies.join(" "),
    learnedCase.rivalFamilies.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

function getMatchedLanguage(
  normalizedInput: string,
  learnedCase: SearchableLearnedCase,
): string[] {
  return learnedCase.keyHumanLanguage.filter((phrase) =>
    normalizedInput.includes(normalizeLearningText(phrase)),
  );
}

function calculateTokenOverlap(inputTokens: string[], caseTokens: string[]): number {
  const inputSet = new Set(inputTokens);
  const caseSet = new Set(caseTokens);

  const shared = [...inputSet].filter((token) => caseSet.has(token));

  const denominator = Math.max(8, Math.min(inputSet.size, caseSet.size));

  return shared.length / denominator;
}

function shouldCaseBeSearchable(learnedCase: SearchableLearnedCase): boolean {
  /**
   * Regla madre:
   * un caso puede ser buscable aunque no deba influir fuerte.
   */
  return learnedCase.reviewStatus !== "rejected_for_search";
}

function isProbableSelfMatch(
  normalizedInput: string,
  learnedCase: SearchableLearnedCase,
): boolean {
  if (learnedCase.source !== "local_archive") return false;

  const normalizedCaseInput = normalizeLearningText(learnedCase.inputText);

  if (normalizedInput.length < 80 || normalizedCaseInput.length < 80) {
    return false;
  }

  return (
    normalizedInput === normalizedCaseInput ||
    normalizedInput.includes(normalizedCaseInput) ||
    normalizedCaseInput.includes(normalizedInput)
  );
}

export function findSimilarLearnedCases(
  inputText: string,
  learnedCases: LearnedDiagnosticCase[] = LEARNED_DIAGNOSTIC_CASES,
  options?: {
    minSimilarity?: number;
    limit?: number;
  },
): SimilarCaseMatch[] {
  const minSimilarity = options?.minSimilarity ?? 0.18;
  const limit = options?.limit ?? 5;

  const normalizedInput = normalizeLearningText(inputText);
  const inputTokens = unique(tokenize(inputText));

  if (normalizedInput.length === 0 || inputTokens.length === 0) {
    return [];
  }

  const searchableCases = mergeLearnedCasesWithArchive(learnedCases);

  const matches = searchableCases
    .filter((learnedCase) => shouldCaseBeSearchable(learnedCase))
    .filter((learnedCase) => !isProbableSelfMatch(normalizedInput, learnedCase))
    .map((learnedCase) => {
      const caseText = buildCaseComparisonText(learnedCase);
      const caseTokens = unique(tokenize(caseText));

      const tokenOverlap = calculateTokenOverlap(inputTokens, caseTokens);
      const matchedLanguage = getMatchedLanguage(normalizedInput, learnedCase);

      const phraseBonus = Math.min(0.45, matchedLanguage.length * 0.08);

      const rawSimilarityScore = clamp(tokenOverlap * 0.75 + phraseBonus);

      const searchWeight = clamp(learnedCase.searchWeight ?? 1);
      const influenceWeight = clamp(
        learnedCase.influenceWeight ??
          (learnedCase.shouldInfluenceFutureCases ? 1 : 0),
      );

      const similarityScore = clamp(rawSimilarityScore * searchWeight);

      const match: SearchableSimilarCaseMatch = {
        caseId: learnedCase.id,
        title: learnedCase.title,
        similarityScore,
        expectedPrimaryFamily: learnedCase.expectedPrimaryFamily,
        acceptableFamilies: learnedCase.acceptableFamilies,
        rivalFamilies: learnedCase.rivalFamilies,
        matchedLanguage,
        lesson: learnedCase.lesson,

        source: learnedCase.source ?? "seed",
        searchWeight,
        influenceWeight,
        qualityScore: learnedCase.qualityScore,
        humanFeedbackScore: learnedCase.humanFeedbackScore,
        reviewStatus: learnedCase.reviewStatus,
        shouldInfluenceFutureCases: learnedCase.shouldInfluenceFutureCases,
      };

      return match;
    })
    .filter((match) => match.similarityScore >= minSimilarity)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  return matches;
}

function normalizeFamilyName(value: string | undefined): string {
  return normalizeLearningText(value ?? "").replace(/\s+/g, "_");
}

function getMatchInfluenceWeight(match: SimilarCaseMatch): number {
  const extended = match as SearchableSimilarCaseMatch;

  if (extended.shouldInfluenceFutureCases === false) {
    return 0;
  }

  if (typeof extended.influenceWeight === "number") {
    return clamp(extended.influenceWeight);
  }

  return 1;
}

function buildFamilyPressure(
  similarCases: SimilarCaseMatch[],
  useInfluenceWeights: boolean,
): Map<string, number> {
  const familyPressure = new Map<string, number>();

  for (const match of similarCases) {
    const influenceWeight = useInfluenceWeights
      ? getMatchInfluenceWeight(match)
      : 1;

    if (useInfluenceWeights && influenceWeight <= 0) {
      continue;
    }

    const current = familyPressure.get(match.expectedPrimaryFamily) ?? 0;

    familyPressure.set(
      match.expectedPrimaryFamily,
      current + match.similarityScore * influenceWeight,
    );
  }

  return familyPressure;
}

function strongestFamilyFromPressure(
  pressure: Map<string, number>,
): [string, number] | undefined {
  return [...pressure.entries()].sort((a, b) => b[1] - a[1])[0];
}

function buildKnownFamilyKeys(similarCases: SimilarCaseMatch[]): Set<string> {
  const values = similarCases.flatMap((match) => [
    match.expectedPrimaryFamily,
    ...match.acceptableFamilies,
    ...match.rivalFamilies,
  ]);

  return new Set(values.map(normalizeFamilyName).filter(Boolean));
}

export function buildLearningSignal(
  similarCases: SimilarCaseMatch[],
  currentCorePattern?: string,
): LearningSignal {
  if (similarCases.length === 0) {
    return {
      similarCases: [],
      shouldRaiseRedFlag: false,
    };
  }

  const overallPressure = buildFamilyPressure(similarCases, false);
  const influencePressure = buildFamilyPressure(similarCases, true);

  const strongestOverall = strongestFamilyFromPressure(overallPressure);
  const strongestInfluential = strongestFamilyFromPressure(influencePressure);

  const strongestHistoricalFamily = strongestOverall?.[0];
  const strongestInfluentialFamily = strongestInfluential?.[0];

  const strongestInfluentialPressure = strongestInfluential?.[1] ?? 0;

  const normalizedCurrent = normalizeFamilyName(currentCorePattern);
  const normalizedInfluentialHistorical = normalizeFamilyName(
    strongestInfluentialFamily,
  );

  const knownFamilyKeys = buildKnownFamilyKeys(similarCases);

  /**
   * Importante:
   * muchas veces currentCorePattern no es una familia,
   * sino una frase narrativa del resultado.
   *
   * Ejemplo:
   * "Aparece una vida comprimida antes que una dirección nítida".
   *
   * Eso no debe compararse como si fuera "Creative Storyteller".
   */
  const currentLooksLikeFamily =
    !!normalizedCurrent && knownFamilyKeys.has(normalizedCurrent);

  const topInfluentialSimilarity =
    similarCases.find((match) => getMatchInfluenceWeight(match) > 0)
      ?.similarityScore ?? 0;

  const currentIsWeak =
    !currentCorePattern ||
    normalizedCurrent.includes("todavia") ||
    normalizedCurrent.includes("todavía") ||
    normalizedCurrent.includes("sin_direccion") ||
    normalizedCurrent.includes("sin_dirección") ||
    normalizedCurrent.includes("no_aparece") ||
    normalizedCurrent.includes("insufficient") ||
    normalizedCurrent.includes("compressed") ||
    normalizedCurrent.includes("comprimida") ||
    normalizedCurrent.includes("comprimido");

  const familyConflict =
    currentLooksLikeFamily &&
    !!normalizedInfluentialHistorical &&
    normalizedCurrent !== normalizedInfluentialHistorical;

  const shouldRaiseRedFlag =
    (familyConflict && topInfluentialSimilarity >= 0.28) ||
    (currentIsWeak && topInfluentialSimilarity >= 0.28);

  const shouldCreateLearningHypothesis =
    !!strongestInfluentialFamily &&
    currentIsWeak &&
    topInfluentialSimilarity >= 0.28;

  return {
    strongestHistoricalFamily,
    similarCases,
    warning: shouldRaiseRedFlag
      ? currentIsWeak
        ? `El diagnóstico principal no encontró una dirección suficientemente fuerte, pero los casos aprendidos similares apuntan a ${strongestInfluentialFamily}.`
        : `El caso se parece a casos aprendidos donde ganó ${strongestInfluentialFamily}, pero el diagnóstico actual apunta a ${currentCorePattern}.`
      : undefined,
    shouldRaiseRedFlag,
    learningAssistedHypothesis: shouldCreateLearningHypothesis
      ? {
          family: strongestInfluentialFamily,
          reason:
            "El motor principal no logró adjudicar una dirección fuerte, pero la memoria de casos aprendidos encontró similitudes relevantes con una familia vocacional concreta.",
          confidence: Math.min(
            0.85,
            Math.max(0.35, strongestInfluentialPressure),
          ),
          basedOnCases: similarCases.length,
        }
      : undefined,
  };
}