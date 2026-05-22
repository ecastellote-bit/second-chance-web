import type { FinalReading } from "../types/result";
import type { ProfileFamilyScore } from "../types/profileFamilies";
import type { NarrativeCompressionConcern } from "../types/narrativeCoherence";

export type NarrativePipelineContext = {
  topFamilies: { id: string; label: string; score: number; gapToSecond: number }[];
  diagnosticReview?: {
    finalVerdict?: string;
    summary?: string;
  };
  contextualSituationReview?: {
    verdict?: string;
    summary?: string;
    compressionSignalsDetected?: boolean;
  };
  semanticNarrativeFlags: string[];
  priorCompressionDetected: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function getTopFamiliesWithGap(
  familyScores: ProfileFamilyScore[] | undefined,
  limit = 3,
): NarrativePipelineContext["topFamilies"] {
  if (!familyScores?.length) return [];

  const sorted = [...familyScores]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit)
    .map((f) => {
      const id = String(
        (f as { id?: string; familyId?: string }).id ??
          (f as { familyId?: string }).familyId ??
          "",
      );
      return {
        id,
        label: f.label ?? id,
        score: typeof f.score === "number" ? f.score : 0,
      };
    });

  return sorted.map((row, index) => ({
    ...row,
    gapToSecond:
      index === 0 && sorted[1]
        ? Math.max(0, row.score - sorted[1].score)
        : 0,
  }));
}

export function extractNarrativePipelineContext(
  reading: FinalReading,
  familyScores?: ProfileFamilyScore[],
): NarrativePipelineContext {
  const trace = asRecord(reading.trace);
  const scores =
    familyScores ??
    (Array.isArray((reading as FinalReading & { familyScores?: ProfileFamilyScore[] }).familyScores)
      ? (reading as FinalReading & { familyScores?: ProfileFamilyScore[] }).familyScores
      : undefined);

  const diagnosticReview = asRecord(
    trace?.diagnosticReview ?? trace?.diagnosticJudgeReview,
  );
  const contextualSituationReview = asRecord(
    trace?.contextualSituationReview ??
      trace?.contextualSituationJudge ??
      trace?.contextualReview,
  );

  const semanticBlock = asRecord(trace?.semanticExtraction ?? trace?._semantic);
  const narrativeFlagsRaw = semanticBlock?.narrativeFlags;
  const semanticNarrativeFlags = Array.isArray(narrativeFlagsRaw)
    ? narrativeFlagsRaw.map((f) => String(f))
    : [];

  const priorCompressionDetected =
    contextualSituationReview?.compressionSignalsDetected === true ||
    (semanticNarrativeFlags.length > 0 &&
      semanticNarrativeFlags.some((f) =>
        /compress|comprim|buried|cajón|supervivencia/i.test(f),
      )) ||
    reading.resultType === "compressed_life";

  return {
    topFamilies: getTopFamiliesWithGap(scores),
    diagnosticReview: diagnosticReview
      ? {
          finalVerdict:
            typeof diagnosticReview.finalVerdict === "string"
              ? diagnosticReview.finalVerdict
              : typeof diagnosticReview.verdict === "string"
                ? diagnosticReview.verdict
                : undefined,
          summary:
            typeof diagnosticReview.summary === "string"
              ? diagnosticReview.summary
              : undefined,
        }
      : undefined,
    contextualSituationReview: contextualSituationReview
      ? {
          verdict:
            typeof contextualSituationReview.verdict === "string"
              ? contextualSituationReview.verdict
              : undefined,
          summary:
            typeof contextualSituationReview.summary === "string"
              ? contextualSituationReview.summary
              : undefined,
          compressionSignalsDetected:
            contextualSituationReview.compressionSignalsDetected === true,
        }
      : undefined,
    semanticNarrativeFlags,
    priorCompressionDetected,
  };
}

export function formatPipelineContextForPrompt(
  ctx: NarrativePipelineContext,
  reading: FinalReading,
): string {
  const topBlock = ctx.topFamilies
    .map(
      (f, i) =>
        `${i + 1}. ${f.id} (${f.label}) score=${f.score.toFixed(2)}` +
        (i === 0 ? ` gapVs2nd=${f.gapToSecond.toFixed(2)}` : ""),
    )
    .join("\n");

  return [
    "## Expediente del pipeline (solo lectura — no re-diagnosticar)",
    `resultType provisorio: ${reading.resultType}`,
    `corePattern provisorio: ${reading.corePattern ?? ""}`,
    `dominantTension: ${reading.dominantTension ?? ""}`,
    "",
    "### Top familias (scores)",
    topBlock || "sin scores",
    "",
    "### Juez diagnóstico (panel)",
    ctx.diagnosticReview?.finalVerdict
      ? `verdict: ${ctx.diagnosticReview.finalVerdict}`
      : "verdict: n/a",
    ctx.diagnosticReview?.summary
      ? `summary: ${ctx.diagnosticReview.summary.slice(0, 400)}`
      : "",
    "",
    "### Juez contextual de situación",
    ctx.contextualSituationReview?.verdict
      ? `verdict: ${ctx.contextualSituationReview.verdict}`
      : "verdict: n/a",
    ctx.contextualSituationReview?.compressionSignalsDetected
      ? "compressionSignalsDetected: true"
      : "compressionSignalsDetected: false",
    ctx.contextualSituationReview?.summary
      ? `summary: ${ctx.contextualSituationReview.summary.slice(0, 400)}`
      : "",
    "",
    "### Flags semánticos (entrada previa)",
    ctx.semanticNarrativeFlags?.length
      ? ctx.semanticNarrativeFlags.join(", ")
      : "ninguno",
    ctx.priorCompressionDetected
      ? "\n⚠ El pipeline ya sugirió compresión vital antes de tu auditoría."
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function isShortSyntheticIntake(narrativeText: string): boolean {
  const trimmed = narrativeText.trim();
  return trimmed.length > 0 && trimmed.length < 900;
}

/** Eleva compresión si el pipeline ya la detectó y el LLM fue tímido. */
export function elevateCompressionConcern(
  concern: NarrativeCompressionConcern,
  priorCompressionDetected: boolean,
  readingResultType: string,
): NarrativeCompressionConcern {
  if (concern === "high") return "high";
  if (!priorCompressionDetected && readingResultType !== "compressed_life") {
    return concern;
  }
  if (concern === "moderate") return "high";
  if (concern === "none") return "moderate";
  return concern;
}
