import type { SemanticExtractionResult } from "../types/semantic";
import type { LearningSignal } from "../types/learning";

export type HumanReviewReason =
  | "failure_reference_match"
  | "low_semantic_confidence"
  | "competing_families"
  | "compression_ambiguity"
  | "learning_signal_conflict"
  | "insufficient_with_strong_signals";

export type HumanReviewTriggerResult = {
  shouldEscalate: boolean;
  reasons: HumanReviewReason[];
  urgency: "standard" | "priority";
  userMessage: string;
  internalSummary: string;
};

export type HumanReviewPayload = {
  triggeredAt: string;
  triggerResult: HumanReviewTriggerResult;
  userEmail?: string;
  narrativeText: string;
  pipelineResult: {
    resultType: string | null;
    corePattern: string | null;
    topFamilies: { id: string; score: number }[];
    confidence: number;
  };
  semanticExtraction: {
    ok: boolean;
    confidence: number;
    signals: { id: string; strength: number }[];
    narrativeFlags: Record<string, boolean>;
  };
  similarCases: { caseId: string; similarity: number; family: string }[];
  cautionFromFailures?: {
    matchedFailures: string[];
    avoidFamilies: string[];
    lesson: string;
  };
};

const STANDARD_USER_MESSAGE =
  "Tu perfil tiene particularidades que queremos analizar con mayor profundidad. " +
  "Nuestro equipo va a revisar tu caso personalmente y vas a recibir un resultado " +
  "más preciso por email en las próximas 4 a 8 horas. " +
  "Esto no es un error — es nuestra forma de asegurarnos de darte la mejor orientación posible.";

const PRIORITY_USER_MESSAGE =
  "Detectamos señales muy interesantes en tu perfil que merecen una mirada más atenta. " +
  "Nuestro equipo especializado va a revisar tu caso y te contactaremos por email " +
  "en las próximas horas con un análisis personalizado. " +
  "Queremos darte la mejor orientación posible.";

type EvaluationContext = {
  resultType: string | null;
  topFamilyScore: number;
  secondFamilyScore: number;
  semanticConfidence: number;
  semanticOk: boolean;
  learningSignal: LearningSignal;
  hasCautionFromFailures: boolean;
  isCompressedLife: boolean;
};

function detectReasons(ctx: EvaluationContext): HumanReviewReason[] {
  const reasons: HumanReviewReason[] = [];

  if (ctx.hasCautionFromFailures) {
    reasons.push("failure_reference_match");
  }

  if (
    ctx.resultType === "insufficient_evidence" &&
    ctx.semanticOk &&
    ctx.semanticConfidence >= 0.6
  ) {
    reasons.push("insufficient_with_strong_signals");
  }

  if (ctx.semanticOk && ctx.semanticConfidence < 0.35) {
    reasons.push("low_semantic_confidence");
  }

  return reasons;
}

function determineUrgency(reasons: HumanReviewReason[]): "standard" | "priority" {
  const priorityReasons: HumanReviewReason[] = [
    "failure_reference_match",
    "insufficient_with_strong_signals",
  ];

  return reasons.some((r) => priorityReasons.includes(r)) ? "priority" : "standard";
}

export function evaluateHumanReviewTrigger(input: {
  resultType: string | null;
  topFamilies: { id: string; score: number }[];
  semanticSignals: SemanticExtractionResult;
  learningSignal: LearningSignal;
}): HumanReviewTriggerResult {
  const { resultType, topFamilies, semanticSignals, learningSignal } = input;

  const topFamilyScore = topFamilies[0]?.score ?? 0;
  const secondFamilyScore = topFamilies[1]?.score ?? 0;

  const ctx: EvaluationContext = {
    resultType,
    topFamilyScore,
    secondFamilyScore,
    semanticConfidence: semanticSignals.extractionConfidence,
    semanticOk: semanticSignals.ok,
    learningSignal,
    hasCautionFromFailures: !!learningSignal.cautionFromFailures?.active,
    isCompressedLife: resultType === "compressed_life",
  };

  const reasons = detectReasons(ctx);

  if (reasons.length === 0) {
    return {
      shouldEscalate: false,
      reasons: [],
      urgency: "standard",
      userMessage: "",
      internalSummary: "No escalation needed — diagnostic confidence is adequate.",
    };
  }

  const urgency = determineUrgency(reasons);

  const internalParts: string[] = [
    `Red flag activado (${reasons.length} razón${reasons.length > 1 ? "es" : ""}).`,
    `Razones: ${reasons.join(", ")}.`,
    `Top family: ${topFamilies[0]?.id ?? "none"} (${topFamilyScore.toFixed(3)}).`,
    `Result type: ${resultType ?? "null"}.`,
    `Semantic confidence: ${semanticSignals.extractionConfidence.toFixed(2)}.`,
  ];

  if (learningSignal.cautionFromFailures) {
    internalParts.push(
      `Caution: matches ${learningSignal.cautionFromFailures.matchedFailures.join(", ")}.`,
    );
    internalParts.push(`Lesson: ${learningSignal.cautionFromFailures.lesson.slice(0, 200)}`);
  }

  return {
    shouldEscalate: true,
    reasons,
    urgency,
    userMessage: urgency === "priority" ? PRIORITY_USER_MESSAGE : STANDARD_USER_MESSAGE,
    internalSummary: internalParts.join(" "),
  };
}

export function buildHumanReviewPayload(input: {
  triggerResult: HumanReviewTriggerResult;
  userEmail?: string;
  narrativeText: string;
  resultType: string | null;
  corePattern: string | null;
  topFamilies: { id: string; score: number }[];
  overallConfidence: number;
  semanticSignals: SemanticExtractionResult;
  learningSignal: LearningSignal;
}): HumanReviewPayload {
  return {
    triggeredAt: new Date().toISOString(),
    triggerResult: input.triggerResult,
    userEmail: input.userEmail,
    narrativeText: input.narrativeText,
    pipelineResult: {
      resultType: input.resultType,
      corePattern: input.corePattern,
      topFamilies: input.topFamilies,
      confidence: input.overallConfidence,
    },
    semanticExtraction: {
      ok: input.semanticSignals.ok,
      confidence: input.semanticSignals.extractionConfidence,
      signals: input.semanticSignals.affinitySignals.map((s) => ({
        id: s.id,
        strength: s.strength,
      })),
      narrativeFlags: input.semanticSignals.narrativeFlags as unknown as Record<string, boolean>,
    },
    similarCases: input.learningSignal.similarCases.slice(0, 5).map((c) => ({
      caseId: c.caseId,
      similarity: c.similarityScore,
      family: c.expectedPrimaryFamily,
    })),
    cautionFromFailures: input.learningSignal.cautionFromFailures?.active
      ? {
          matchedFailures: input.learningSignal.cautionFromFailures.matchedFailures,
          avoidFamilies: input.learningSignal.cautionFromFailures.avoidFamilies,
          lesson: input.learningSignal.cautionFromFailures.lesson,
        }
      : undefined,
  };
}
