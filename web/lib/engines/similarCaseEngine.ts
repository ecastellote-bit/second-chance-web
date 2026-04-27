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
  
  function normalizeLearningText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9ñ\s]/gi, " ")
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
  
  function buildCaseComparisonText(learnedCase: LearnedDiagnosticCase): string {
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
    learnedCase: LearnedDiagnosticCase,
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
  
    return learnedCases
      .filter((learnedCase) => learnedCase.shouldInfluenceFutureCases)
      .map((learnedCase) => {
        const caseText = buildCaseComparisonText(learnedCase);
        const caseTokens = unique(tokenize(caseText));
  
        const tokenOverlap = calculateTokenOverlap(inputTokens, caseTokens);
        const matchedLanguage = getMatchedLanguage(normalizedInput, learnedCase);
  
        const phraseBonus = Math.min(0.45, matchedLanguage.length * 0.08);
  
        const similarityScore = clamp(tokenOverlap * 0.75 + phraseBonus);
  
        return {
          caseId: learnedCase.id,
          title: learnedCase.title,
          similarityScore,
          expectedPrimaryFamily: learnedCase.expectedPrimaryFamily,
          acceptableFamilies: learnedCase.acceptableFamilies,
          rivalFamilies: learnedCase.rivalFamilies,
          matchedLanguage,
          lesson: learnedCase.lesson,
        };
      })
      .filter((match) => match.similarityScore >= minSimilarity)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }
  
  function normalizeFamilyName(value: string | undefined): string {
    return normalizeLearningText(value ?? "").replace(/\s+/g, "_");
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
  
    const familyPressure = new Map<string, number>();
  
    for (const match of similarCases) {
      const current = familyPressure.get(match.expectedPrimaryFamily) ?? 0;
      familyPressure.set(
        match.expectedPrimaryFamily,
        current + match.similarityScore,
      );
    }
  
    const strongest = [...familyPressure.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0];
  
    const strongestHistoricalFamily = strongest?.[0];
    const strongestPressure = strongest?.[1] ?? 0;
  
    const normalizedCurrent = normalizeFamilyName(currentCorePattern);
    const normalizedHistorical = normalizeFamilyName(strongestHistoricalFamily);
  
    const topSimilarity = similarCases[0]?.similarityScore ?? 0;
  
    const currentIsWeak =
      !currentCorePattern ||
      normalizedCurrent.includes("todavia") ||
      normalizedCurrent.includes("todavía") ||
      normalizedCurrent.includes("sin_direccion") ||
      normalizedCurrent.includes("sin_dirección") ||
      normalizedCurrent.includes("no_aparece") ||
      normalizedCurrent.includes("insufficient");
  
    const familyConflict =
      !!normalizedCurrent &&
      !!normalizedHistorical &&
      normalizedCurrent !== normalizedHistorical;
  
    const shouldRaiseRedFlag =
      (familyConflict && topSimilarity >= 0.28) ||
      (currentIsWeak && topSimilarity >= 0.28);
  
    const shouldCreateLearningHypothesis =
      !!strongestHistoricalFamily &&
      currentIsWeak &&
      topSimilarity >= 0.28;
  
    return {
      strongestHistoricalFamily,
      similarCases,
      warning: shouldRaiseRedFlag
        ? currentIsWeak
          ? `El diagnóstico principal no encontró una dirección suficientemente fuerte, pero los casos aprendidos similares apuntan a ${strongestHistoricalFamily}.`
          : `El caso se parece a casos aprendidos donde ganó ${strongestHistoricalFamily}, pero el diagnóstico actual apunta a ${currentCorePattern}.`
        : undefined,
      shouldRaiseRedFlag,
      learningAssistedHypothesis: shouldCreateLearningHypothesis
        ? {
            family: strongestHistoricalFamily,
            reason:
              "El motor principal no logró adjudicar una dirección fuerte, pero la memoria de casos aprendidos encontró similitudes relevantes con una familia vocacional concreta.",
            confidence: Math.min(0.85, Math.max(0.35, strongestPressure)),
            basedOnCases: similarCases.length,
          }
        : undefined,
    };
  }