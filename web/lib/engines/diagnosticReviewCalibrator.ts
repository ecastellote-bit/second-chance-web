type UnknownRecord = Record<string, unknown>;

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

function getNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;

  if (value > 1 && value <= 100) {
    return value / 100;
  }

  return value;
}

function isSimilarCaseJudge(finding: UnknownRecord): boolean {
  const judgeId = normalizeText(finding.judgeId);

  return (
    judgeId.includes("similar") ||
    judgeId.includes("case") ||
    judgeId.includes("learning")
  );
}

function isConflictVerdict(value: unknown): boolean {
  const normalized = normalizeText(value);

  return (
    normalized === "conflict" ||
    normalized.includes("conflict") ||
    normalized.includes("contradiction") ||
    normalized.includes("red flag")
  );
}

function getTopSimilarity(similarCases: unknown[]): number {
  return similarCases
    .filter(isRecord)
    .map((item) => getNumber(item.similarityScore))
    .sort((a, b) => b - a)[0] ?? 0;
}

function softenSimilarCaseFinding(
  finding: UnknownRecord,
  topSimilarity: number,
): UnknownRecord {
  const originalReason =
    typeof finding.reason === "string" ? finding.reason : "";

  if (topSimilarity < 0.4) {
    return {
      ...finding,
      verdict: "weak_similarity_warning",
      confidence: Math.min(getNumber(finding.confidence), 0.35),
      reason: [
        "La memoria de casos detectó una posible tensión, pero la similitud más alta es baja. No debe generar conflicto fuerte ni desplazar una lectura principal sólida.",
        originalReason,
      ]
        .filter(Boolean)
        .join(" "),
    };
  }

  if (topSimilarity < 0.55) {
    return {
      ...finding,
      verdict: "frontier_note",
      confidence: Math.min(getNumber(finding.confidence), 0.5),
      reason: [
        "La memoria de casos aporta una nota de frontera, pero todavía no tiene fuerza suficiente para declarar contradicción diagnóstica.",
        originalReason,
      ]
        .filter(Boolean)
        .join(" "),
    };
  }

  return finding;
}

export function calibrateDiagnosticReviewIntensity<T>(
  diagnosticReview: T,
  params: {
    similarCases?: unknown[];
    familyScores?: unknown[];
    finalReading?: unknown;
  },
): T {
  if (!isRecord(diagnosticReview)) return diagnosticReview;

  const similarCases = Array.isArray(params.similarCases)
    ? params.similarCases
    : [];

  const topSimilarity = getTopSimilarity(similarCases);

  const findings = Array.isArray(diagnosticReview.findings)
    ? diagnosticReview.findings
    : [];

  const calibratedFindings = findings.map((finding) => {
    if (!isRecord(finding)) return finding;

    if (!isSimilarCaseJudge(finding)) return finding;

    if (!isConflictVerdict(finding.verdict)) return finding;

    return softenSimilarCaseFinding(finding, topSimilarity);
  });

  const weakSimilarCaseConflictWasPresent =
    findings.filter(isRecord).some((finding) => {
      return (
        isSimilarCaseJudge(finding) &&
        isConflictVerdict(finding.verdict) &&
        topSimilarity < 0.4
      );
    });

  const strongNonSimilarConflictsRemain = calibratedFindings
    .filter(isRecord)
    .some((finding) => {
      return !isSimilarCaseJudge(finding) && isConflictVerdict(finding.verdict);
    });

  const shouldDowngradeOverallConflict =
    weakSimilarCaseConflictWasPresent &&
    isConflictVerdict(diagnosticReview.finalVerdict) &&
    !strongNonSimilarConflictsRemain;

  if (!shouldDowngradeOverallConflict) {
    return {
      ...diagnosticReview,
      findings: calibratedFindings,
    } as T;
  }

  const recommendedFrontier = Array.isArray(diagnosticReview.recommendedFrontier)
    ? diagnosticReview.recommendedFrontier
    : [];

  return {
    ...diagnosticReview,
    finalVerdict:
      recommendedFrontier.length >= 2 ? "frontier" : "aligned_with_caution",
    shouldRequestHumanReview: false,
    findings: calibratedFindings,
  } as T;
}