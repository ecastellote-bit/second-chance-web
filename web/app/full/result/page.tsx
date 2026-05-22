"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFullAnswers } from "../fullAnswersContext";
import { persistContextualFromFinalReading } from "@/lib/tematicas/persistContextualOnAnalyze";
import { HumanCaseArchiveGate } from "@/components/diagnostic/HumanCaseArchiveGate";
import { buildFoundationalClientMeta } from "@/lib/learning/foundationalCohort";
import {
  PersonalizedDiagnosticDeliverable,
  type PresentationForView,
} from "@/components/diagnostic/PersonalizedDiagnosticDeliverable";

type TextItemForView =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>;

type FamilyScoreForView = {
  id?: string;
  familyId?: string;
  label?: string;
  familyLabel?: string;
  family?: string;
  summary?: string;
  score?: number;
  confidence?: number;
  rationale?: TextItemForView[];
};

type SimilarCaseForView = {
  id?: string;
  caseId?: string;
  title?: string;
  similarityScore?: number;
  expectedPrimaryFamily?: string;
  acceptableFamilies?: string[];
  rivalFamilies?: string[];
  matchedLanguage?: string[];
  keyHumanLanguage?: string[];
  lesson?: string;
};

type LearningAssistedHypothesisForView = {
  family: string;
  reason: string;
  confidence: number;
  basedOnCases: number;
};

type LearningSignalForView = {
  strongestHistoricalFamily?: string;
  similarCases?: SimilarCaseForView[];
  warning?: string;
  shouldRaiseRedFlag?: boolean;
  learningAssistedHypothesis?: LearningAssistedHypothesisForView;
};

type DiagnosticJudgeFindingForView = {
  judgeId?: string;
  verdict?: string;
  family?: string;
  confidence?: number;
  reason?: string;
  evidence?: TextItemForView[];
};

type DiagnosticReviewForView = {
  finalVerdict?: string;
  recommendedPrimaryFamily?: string;
  recommendedFrontier?: string[];
  shouldRequestHumanReview?: boolean;
  findings?: DiagnosticJudgeFindingForView[];
};

type ContextualMarkerForView = {
  marker?: string;
  supportsFamilies?: string[];
  contextMeaning?: string;
  notEnoughFor?: string[];
};

type ExtractedLearningLessonForView = {
  type?: string;
  families?: string[];
  primaryFamily?: string;
  secondaryFamily?: string;
  strength?: number;
  lesson?: string;
  conditions?: TextItemForView[];
  positiveMarkers?: TextItemForView[];
  negativeMarkers?: TextItemForView[];
  contextualMarkers?: ContextualMarkerForView[];
  misreadWarnings?: TextItemForView[];
  requiresHumanApproval?: boolean;
};

type DiagnosticLearningTraceForView = {
  shouldStoreTrace?: boolean;
  learningTier?: string;
  shouldInfluenceFutureCases?: boolean;
  influenceStrength?: number;
  lesson?: string;
  whyNotStronger?: string;
  familiesInvolved?: string[];
  riskPrevented?: string;
  requiresHumanApproval?: boolean;
};

type ExperienceDistillationForView = {
  verdict?: string;
  recommendedLearningUse?: string;
  shouldBecomeFullLearnedCase?: boolean;
  shouldCreateObservation?: boolean;
  shouldRaiseRedFlag?: boolean;
  confidence?: number;
  summary?: string;

  extractedLessons?: ExtractedLearningLessonForView[];
  lessons?: ExtractedLearningLessonForView[];
  distilledLessons?: ExtractedLearningLessonForView[];

  contextualMarkers?: ContextualMarkerForView[];
  misreadWarnings?: TextItemForView[];
  warnings?: TextItemForView[];
  notes?: TextItemForView[];

  learningTrace?: DiagnosticLearningTraceForView;
  shouldStoreTrace?: boolean;
  learningTier?: string;
  shouldInfluenceFutureCases?: boolean;
  influenceStrength?: number;
  whyNotStronger?: string;
};

type ContextualForceForView = {
  type?: string;
  kind?: string;
  label?: string;
  family?: string;
  families?: string[];
  strength?: number;
  evidence?: TextItemForView[];
  interpretation?: TextItemForView;
  reason?: TextItemForView;
};

type ContextualSituationReviewForView = {
  verdict?: string;
  recommendedUse?: string;
  dominantContext?: string;
  contextSummary?: string;
  summary?: string;

  suggestedPrimaryFamily?: string;
  suggestedFrontier?: string[];
  shouldAdjustDiagnosis?: boolean;
  shouldOpenFrontier?: boolean;
  shouldRequestHumanReview?: boolean;

  forces?: ContextualForceForView[];
  contextualForces?: ContextualForceForView[];

  activationHints?: TextItemForView[];
  suggestedThemes?: TextItemForView[];
  warnings?: TextItemForView[];
  notes?: TextItemForView[];
};

type DiagnosticCaseStatisticsForView = {
  caseId?: string;
  createdAt?: string;
  resultType?: string;
  primaryFamily?: string;
  dominantFamily?: string;
  suggestedPrimaryFamily?: string;

  topFamilies?: TextItemForView[];
  frontierFamilies?: string[];
  involvedFamilies?: string[];

  contextualForces?: TextItemForView[];
  strongestContextualForces?: TextItemForView[];

  learningTraceType?: string;
  learningFootprintType?: string;
  shouldStore?: boolean;
  shouldInfluenceFutureCases?: boolean;
  influenceStrength?: number;

  compressionDetected?: boolean;
  humanReviewSuggested?: boolean;
  frontierDetected?: boolean;
  conflictDetected?: boolean;

  statisticalTags?: string[];
  tags?: string[];

  summary?: string;
  notes?: TextItemForView[];
};

type FamilyRaceForView = {
  topLabel?: string | null;
  secondLabel?: string | null;
  topScore?: number;
  secondScore?: number;
  scoreGap?: number;
  isCloseRace?: boolean;
  isVeryCloseRace?: boolean;
  shouldAvoidSingleClearClaim?: boolean;
};

type SummaryForUserForView = {
  diagnostico?: string;
  hilo_conductor?: string;
  tensiones?: string;
  direccion?: string;
  action?: string;
  camino_minimo?: string;
  cierre?: string;
};

type ResultForView = {
  resultType?: string;
  corePattern?: string;
  dominantTension?: string;
  currentCost?: string;

  familyScores?: FamilyScoreForView[];
  learningSignal?: LearningSignalForView;
  similarCases?: SimilarCaseForView[];

  diagnosticReview?: DiagnosticReviewForView | null;
  diagnosticJudgeReview?: DiagnosticReviewForView | null;

  experienceDistillation?: ExperienceDistillationForView | null;
  diagnosticExperienceDistillation?: ExperienceDistillationForView | null;
  diagnosticSurgery?: ExperienceDistillationForView | null;
  learningDistillation?: ExperienceDistillationForView | null;

  contextualSituationReview?: ContextualSituationReviewForView | null;
  contextualReview?: ContextualSituationReviewForView | null;
  situationReview?: ContextualSituationReviewForView | null;

  diagnosticCaseStatistics?: DiagnosticCaseStatisticsForView | null;
  caseStatistics?: DiagnosticCaseStatisticsForView | null;
  statisticalTrace?: DiagnosticCaseStatisticsForView | null;

  summaryForUser?: SummaryForUserForView;
  personalizedPresentation?: PresentationForView | null;

  trace?: {
    familyRace?: FamilyRaceForView;
  };
};

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function itemToText(value: TextItemForView): string {
  if (value === null || typeof value === "undefined") return "";

  if (typeof value === "string") return value.trim();

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (isRecord(value)) {
    const path = value.path;
    const fit = value.fit;
    const reason = value.reason;

    if (
      typeof path === "string" ||
      typeof fit === "string" ||
      typeof reason === "string"
    ) {
      return uniqueStrings([
        typeof path === "string" ? path : "",
        typeof fit === "string" ? fit : "",
        typeof reason === "string" ? reason : "",
      ]).join(" — ");
    }

    const primaryKeys = [
      "text",
      "label",
      "title",
      "summary",
      "value",
      "theme",
      "name",
      "description",
      "family",
      "familyId",
      "id",
      "kind",
      "type",
    ];

    const secondaryKeys = ["reason", "interpretation", "fit", "note"];

    const primary = primaryKeys
      .map((key) => value[key])
      .find((item) => typeof item === "string" && item.trim().length > 0);

    const secondary = secondaryKeys
      .map((key) => value[key])
      .filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      );

    if (typeof primary === "string") {
      const pieces = uniqueStrings([primary, ...secondary]);
      return pieces.join(" — ");
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return String(value);
}

function toTextItems(value: unknown): string[] {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  return uniqueStrings(items.map((item) => itemToText(item as TextItemForView)));
}

function getFamilyLabel(family: FamilyScoreForView): string {
  return (
    family.label ??
    family.familyLabel ??
    family.family ??
    family.id ??
    family.familyId ??
    "Dirección sin nombre"
  );
}

function getFamilyScore(family: FamilyScoreForView): number {
  return typeof family.score === "number" && Number.isFinite(family.score)
    ? family.score
    : 0;
}

function getFamilyConfidence(family: FamilyScoreForView): number {
  return typeof family.confidence === "number" &&
    Number.isFinite(family.confidence)
    ? family.confidence
    : 0;
}

function formatPercent(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "0%";

  if (value > 1 && value <= 100) {
    return `${Math.round(value)}%`;
  }

  return `${Math.round(value * 100)}%`;
}

function normalizeLabel(value: string | undefined | null): string {
  if (!value) return "Sin dato";

  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeForComparison(value: string | undefined | null): string {
  if (!value) return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getDirectionParts(direction: string): string[] {
  return direction
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

function getSimilarCaseId(similarCase: SimilarCaseForView): string {
  return similarCase.caseId ?? similarCase.id ?? "case";
}

function getMatchedLanguage(similarCase: SimilarCaseForView): string[] {
  const matchedLanguage = safeArray(similarCase.matchedLanguage);
  if (matchedLanguage.length > 0) return matchedLanguage;

  return safeArray(similarCase.keyHumanLanguage);
}

function getExperienceDistillation(
  rawResult: ResultForView,
): ExperienceDistillationForView | null {
  return (
    rawResult.experienceDistillation ??
    rawResult.diagnosticExperienceDistillation ??
    rawResult.diagnosticSurgery ??
    rawResult.learningDistillation ??
    null
  );
}

function getContextualSituationReview(
  rawResult: ResultForView,
): ContextualSituationReviewForView | null {
  return (
    rawResult.contextualSituationReview ??
    rawResult.contextualReview ??
    rawResult.situationReview ??
    null
  );
}

function getDiagnosticCaseStatistics(
  rawResult: ResultForView,
): DiagnosticCaseStatisticsForView | null {
  return (
    rawResult.diagnosticCaseStatistics ??
    rawResult.caseStatistics ??
    rawResult.statisticalTrace ??
    null
  );
}

function getExtractedLessons(
  experienceDistillation: ExperienceDistillationForView | null,
): ExtractedLearningLessonForView[] {
  if (!experienceDistillation) return [];

  const extractedLessons = safeArray(experienceDistillation.extractedLessons);
  if (extractedLessons.length > 0) return extractedLessons;

  const lessons = safeArray(experienceDistillation.lessons);
  if (lessons.length > 0) return lessons;

  return safeArray(experienceDistillation.distilledLessons);
}

function getLearningTrace(
  experienceDistillation: ExperienceDistillationForView | null,
): DiagnosticLearningTraceForView | null {
  if (!experienceDistillation) return null;

  if (experienceDistillation.learningTrace) {
    return experienceDistillation.learningTrace;
  }

  return {
    shouldStoreTrace: true,
    learningTier: experienceDistillation.learningTier ?? "calibration_only",
    shouldInfluenceFutureCases:
      experienceDistillation.shouldInfluenceFutureCases ?? false,
    influenceStrength: experienceDistillation.influenceStrength ?? 0,
    whyNotStronger:
      experienceDistillation.whyNotStronger ??
      experienceDistillation.summary ??
      "El caso todavía no deja una enseñanza suficientemente limpia para influir en futuros diagnósticos.",
    lesson:
      "El caso debe dejar al menos una traza mínima de calibración, aunque no influya todavía en futuros diagnósticos.",
    riskPrevented:
      "Evitar que una corrida diagnóstica pase por el sistema sin dejar registro útil.",
    requiresHumanApproval: false,
  };
}

function toSerializableSnapshot(value: unknown): unknown {
  const seen = new WeakSet<object>();

  function clean(input: unknown): unknown {
    if (input === null) return null;

    if (
      typeof input === "string" ||
      typeof input === "number" ||
      typeof input === "boolean"
    ) {
      return input;
    }

    if (typeof input === "undefined") return null;

    if (typeof input === "function" || typeof input === "symbol") {
      return undefined;
    }

    if (input instanceof Date) {
      return input.toISOString();
    }

    if (Array.isArray(input)) {
      return input
        .map((item) => clean(item))
        .filter((item) => typeof item !== "undefined");
    }

    if (typeof input === "object") {
      if (seen.has(input)) return "[Circular]";
      seen.add(input);

      const output: Record<string, unknown> = {};

      for (const [key, item] of Object.entries(input)) {
        const cleaned = clean(item);
        if (typeof cleaned !== "undefined") {
          output[key] = cleaned;
        }
      }

      return output;
    }

    return String(input);
  }

  return clean(value);
}

function buildSourceInputSnapshot(fullAnswersContext: unknown): unknown {
  const context = fullAnswersContext as Record<string, unknown>;

  return toSerializableSnapshot({
    state: context.state ?? null,
    followup: context.followup ?? null,
    isHydrated: context.isHydrated ?? null,
    fallbackContext:
      typeof context.state === "undefined" ? fullAnswersContext : undefined,
  });
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Clipboard copy failed");
  }
}

function simpleArchiveHash(value: string): string {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(16);
}

function safeArchiveStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "payload_not_serializable";
  }
}

function buildHeadline(params: {
  resultType?: string;
  isFrontierReading: boolean;
  isConflictReading: boolean;
}): string {
  if (params.isConflictReading) {
    return "La lectura principal necesita revisión de matices que conviene revisar juntas";
  }

  if (params.resultType === "insufficient_evidence") {
    return "Todavía no hay evidencia suficiente para cerrar una dirección";
  }

  if (params.resultType === "compressed_life") {
    return "Aparece una vida comprimida antes que una dirección nítida";
  }

  if (params.isFrontierReading) {
    return "Aparecen dos direcciones fuertes que conviene revisar juntas";
  }

  return "Hay una dirección que aparece con claridad";
}

function buildDirectionLabel(params: {
  resultType?: string;
  isFrontierReading: boolean;
  isConflictReading: boolean;
}): string {
  if (params.isConflictReading) {
    return "Lectura principal bajo revisión";
  }

  if (params.resultType === "insufficient_evidence") {
    return "Estado de la lectura";
  }

  if (params.isFrontierReading) {
    return "Frontera principal";
  }

  return "Dirección principal";
}

function buildMainExplanation(params: {
  resultType?: string;
  isFrontierReading: boolean;
  isConflictReading: boolean;
  dominantTension?: string;
  diagnosticSummary?: string;
}): string {
  if (params.isConflictReading) {
    return (
      params.dominantTension ??
      "La lectura principal trae señales fuertes, pero al contrastarla con los jueces, la memoria de casos y la extracción quirúrgica aparece una tensión que conviene revisar antes de cerrar una sentencia."
    );
  }

  if (params.diagnosticSummary) {
    return params.diagnosticSummary;
  }

  if (params.resultType === "insufficient_evidence") {
    return "La información reunida todavía no alcanza para afirmar una dirección sin inventar.";
  }

  if (params.resultType === "compressed_life") {
    return "La lectura detecta que parte importante de tu energía está puesta en sostener lo inmediato.";
  }

  if (params.isFrontierReading) {
    return (
      params.dominantTension ??
      "Tu caso no queda reducido a una sola etiqueta: aparecen dos líneas fuertes que necesitan revisarse juntas."
    );
  }

  return (
    params.dominantTension ??
    "Esta dirección aparece porque hay patrones consistentes en cómo leés situaciones, tomás decisiones y respondés a lo que te toca sostener."
  );
}

function buildAssistedHypothesis(params: {
  learningSignal: LearningSignalForView | null;
  similarCases: SimilarCaseForView[];
  shouldRaiseRedFlag: boolean;
}): LearningAssistedHypothesisForView | null {
  if (params.learningSignal?.learningAssistedHypothesis) {
    return params.learningSignal.learningAssistedHypothesis;
  }

  const fallbackFamily =
    params.shouldRaiseRedFlag && params.learningSignal?.strongestHistoricalFamily
      ? params.learningSignal.strongestHistoricalFamily
      : null;

  if (!fallbackFamily) return null;

  return {
    family: fallbackFamily,
    reason:
      "El diagnóstico principal y la memoria de casos aprendidos no están completamente alineados. La comparación histórica sugiere revisar esta dirección antes de cerrar la lectura.",
    confidence: params.similarCases[0]?.similarityScore ?? 0,
    basedOnCases: params.similarCases.length,
  };
}

function buildFallbackDiagnosticCaseStatistics(params: {
  rawResult: ResultForView;
  displayedMainDirection: string;
  familyScores: FamilyScoreForView[];
  frontierParts: string[];
  contextualSituationReview: ContextualSituationReviewForView | null;
  contextualForces: ContextualForceForView[];
  learningTrace: DiagnosticLearningTraceForView | null;
  isConflictReading: boolean;
  displayFrontierReading: boolean;
  isCompressed: boolean;
  diagnosticReview: DiagnosticReviewForView | null;
}): DiagnosticCaseStatisticsForView {
  const topFamilies = params.familyScores
    .slice(0, 5)
    .map((family) => {
      const label = getFamilyLabel(family);
      const score = formatPercent(getFamilyScore(family));
      return `${label}: ${score}`;
    });

  const contextualForceLabels = params.contextualForces
    .slice(0, 6)
    .map((force) => force.label ?? force.kind ?? force.type ?? "")
    .filter(Boolean);

  const involvedFamilies = uniqueStrings([
    params.rawResult.corePattern ?? "",
    params.displayedMainDirection,
    ...params.frontierParts,
    params.contextualSituationReview?.suggestedPrimaryFamily ?? "",
    ...safeArray(params.contextualSituationReview?.suggestedFrontier),
    ...safeArray(params.learningTrace?.familiesInvolved),
    ...params.familyScores.slice(0, 3).map((family) => getFamilyLabel(family)),
  ]);

  const tags = uniqueStrings([
    params.rawResult.resultType ?? "",
    params.displayFrontierReading ? "frontier_detected" : "",
    params.isConflictReading ? "conflict_detected" : "",
    params.isCompressed ? "compression_detected" : "",
    params.learningTrace?.learningTier ?? "",
    params.contextualSituationReview?.dominantContext ?? "",
    params.diagnosticReview?.finalVerdict ?? "",
  ]);

  return {
    createdAt: new Date().toISOString(),
    resultType: params.rawResult.resultType,
    primaryFamily: params.displayedMainDirection,
    dominantFamily: params.rawResult.corePattern,
    suggestedPrimaryFamily:
      params.contextualSituationReview?.suggestedPrimaryFamily,

    topFamilies,
    frontierFamilies: params.frontierParts,
    involvedFamilies,

    contextualForces: contextualForceLabels,
    strongestContextualForces: contextualForceLabels.slice(0, 3),

    learningTraceType: params.learningTrace?.learningTier ?? "calibration_only",
    learningFootprintType:
      params.learningTrace?.learningTier ?? "calibration_only",
    shouldStore: params.learningTrace?.shouldStoreTrace ?? true,
    shouldInfluenceFutureCases:
      params.learningTrace?.shouldInfluenceFutureCases ?? false,
    influenceStrength: params.learningTrace?.influenceStrength ?? 0,

    compressionDetected: params.isCompressed,
    humanReviewSuggested:
      params.contextualSituationReview?.shouldRequestHumanReview ??
      params.diagnosticReview?.shouldRequestHumanReview ??
      false,
    frontierDetected: params.displayFrontierReading,
    conflictDetected: params.isConflictReading,

    statisticalTags: tags,
    tags,

    summary:
      "Traza estadística derivada para que esta corrida deje registro agregable aunque todavía no exista una traza persistida perfecta desde backend.",
    notes: [
      "Esta traza sirve para contar patrones, fronteras, familias involucradas, señales contextuales y huella de aprendizaje.",
      "No decide el diagnóstico. Alimenta memoria estadística y auditoría futura.",
    ],
  };
}

type DiagnosticArchivePayload = Record<string, unknown>;

type ArchiveConfirmationTrace = {
  traceId: string;
  archivedAt: string;
  archiveKey: string;
  resultType: string;
  primaryFamily: string;
  frontierFamilies: string[];
  textPreview: string;
  payloadHash: string;
  status: "archived" | "failed";
  storageKey: string;
  error?: string;
};

function safeArchiveText(value: unknown): string {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return String(value ?? "");
  }
}

function buildArchiveConfirmationTrace(args: {
  archiveKey: string;
  autoArchivePayload: unknown;
  displayedMainDirection: string | null | undefined;
  frontierFamilies?: string[];
  resultType?: string | null;
  status: "archived" | "failed";
}): ArchiveConfirmationTrace {
  const payloadText = safeArchiveText(args.autoArchivePayload);
  const payloadHash = simpleArchiveHash(payloadText);

  return {
    traceId: `archive_${Date.now()}_${payloadHash}`,
    archivedAt: new Date().toISOString(),
    archiveKey: args.archiveKey,
    resultType: args.resultType ?? "unknown_result_type",
    primaryFamily: args.displayedMainDirection ?? "unknown_family",
    frontierFamilies: args.frontierFamilies ?? [],
    textPreview: payloadText.slice(0, 260),
    payloadHash,
    status: args.status,
    storageKey: "VOCATIONUP_LAST_ARCHIVE_CONFIRMATION",
  };
}

function persistArchiveConfirmationTrace(trace: ArchiveConfirmationTrace): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    "VOCATIONUP_LAST_ARCHIVE_CONFIRMATION",
    JSON.stringify(trace, null, 2),
  );

  const rawIndex = localStorage.getItem("VOCATIONUP_ARCHIVE_CONFIRMATION_INDEX");

  let previous: ArchiveConfirmationTrace[] = [];

  try {
    previous = rawIndex ? JSON.parse(rawIndex) : [];
  } catch {
    previous = [];
  }

  const nextIndex = [trace, ...previous].slice(0, 50);

  localStorage.setItem(
    "VOCATIONUP_ARCHIVE_CONFIRMATION_INDEX",
    JSON.stringify(nextIndex, null, 2),
  );
}

export default function ResultPage() {
  const router = useRouter();
  const fullAnswersContext = useFullAnswers();
  const { analysis } = fullAnswersContext;

  const result = analysis?.result;

  useEffect(() => {
    if (result) {
      persistContextualFromFinalReading(result);
    }
  }, [result]);

  if (!result) {
    return <div>No hay resultado disponible</div>;
  }

  const rawResult = result as unknown as ResultForView;
  const presentation = rawResult.personalizedPresentation ?? null;
  const hasPersonalizedPresentation = Boolean(
    presentation?.lecturaCentral?.sentenciaRevelacion?.trim() ||
      presentation?.lecturaCentral?.resumen?.trim(),
  );

  const mainDirection =
    rawResult.corePattern ?? "Todavía no aparece una dirección clara";

  const familyScores: FamilyScoreForView[] = Array.isArray(rawResult.familyScores)
    ? rawResult.familyScores
    : [];

  const sortedFamilyScores = [...familyScores].sort(
    (a: FamilyScoreForView, b: FamilyScoreForView) => {
      const scoreDelta = getFamilyScore(b) - getFamilyScore(a);
      if (scoreDelta !== 0) return scoreDelta;

      return getFamilyConfidence(b) - getFamilyConfidence(a);
    },
  );

  const usefulFamilyScores = sortedFamilyScores.filter((family) => {
    const score = getFamilyScore(family);
    return score >= 0.05;
  });

  const visibleFamilyScores = usefulFamilyScores.slice(0, 5);

  const familyRace = rawResult.trace?.familyRace ?? null;
  const mainDirectionParts = getDirectionParts(mainDirection);

  const learningSignal: LearningSignalForView | null =
    rawResult.learningSignal ?? null;

  const diagnosticReview: DiagnosticReviewForView | null =
    rawResult.diagnosticReview ?? rawResult.diagnosticJudgeReview ?? null;

  const experienceDistillation = getExperienceDistillation(rawResult);
  const contextualSituationReview = getContextualSituationReview(rawResult);
  const learningTrace = getLearningTrace(experienceDistillation);
  const rawDiagnosticCaseStatistics = getDiagnosticCaseStatistics(rawResult);

  const familyRaceFrontierParts =
    familyRace?.topLabel && familyRace?.secondLabel
      ? [familyRace.topLabel, familyRace.secondLabel]
      : [];

  const contextualFrontierParts = safeArray(
    contextualSituationReview?.suggestedFrontier,
  );

  const frontierParts =
    mainDirectionParts.length > 1
      ? mainDirectionParts
      : familyRaceFrontierParts.length >= 2
        ? familyRaceFrontierParts
        : contextualFrontierParts.length >= 2
          ? contextualFrontierParts
          : [];

  const hasDisplayableFrontier = frontierParts.length >= 2;

  const contextualForces = [
    ...safeArray(contextualSituationReview?.forces),
    ...safeArray(contextualSituationReview?.contextualForces),
  ];

  const contextualActivationHints = toTextItems(
    contextualSituationReview?.activationHints,
  );

  const contextualSuggestedThemes = toTextItems(
    contextualSituationReview?.suggestedThemes,
  );

  const contextualWarnings = toTextItems(contextualSituationReview?.warnings);
  const contextualNotes = toTextItems(contextualSituationReview?.notes);

  const diagnosticVerdictKey = normalizeForComparison(
    diagnosticReview?.finalVerdict,
  );

  const distillationUseKey = normalizeForComparison(
    experienceDistillation?.recommendedLearningUse,
  );

  const contextualVerdictKey = normalizeForComparison(
    contextualSituationReview?.verdict,
  );

  const contextualUseKey = normalizeForComparison(
    contextualSituationReview?.recommendedUse,
  );

  const isConflictReading =
    diagnosticVerdictKey === "conflict" ||
    distillationUseKey === "misread warning" ||
    contextualVerdictKey === "conflict" ||
    contextualUseKey === "misread warning";

  const isFrontierSupportReading =
    !isConflictReading &&
    (diagnosticVerdictKey === "frontier" ||
      distillationUseKey === "frontier support" ||
      contextualVerdictKey === "frontier" ||
      contextualUseKey === "frontier support" ||
      Boolean(familyRace?.shouldAvoidSingleClearClaim));

  const displayFrontierReading =
    isFrontierSupportReading && hasDisplayableFrontier;

  const displayedMainDirection = displayFrontierReading
    ? frontierParts.join(" / ")
    : mainDirection;

  const mainDirectionKeys = new Set(
    [
      ...mainDirectionParts,
      ...frontierParts,
      familyRace?.topLabel ?? "",
      familyRace?.secondLabel ?? "",
    ].map((part) => normalizeForComparison(part)),
  );

  const secondaryDirections = sortedFamilyScores
    .filter((family) => {
      const label = normalizeForComparison(getFamilyLabel(family));
      const score = getFamilyScore(family);

      if (!label) return false;
      if (mainDirectionKeys.has(label)) return false;
      if (score < 0.05) return false;

      return true;
    })
    .slice(0, 2);

  const effectiveLearningRedFlag =
    experienceDistillation?.shouldRaiseRedFlag ??
    learningSignal?.shouldRaiseRedFlag ??
    false;

  const diagnosticFindings: DiagnosticJudgeFindingForView[] = Array.isArray(
    diagnosticReview?.findings,
  )
    ? diagnosticReview.findings
    : [];

  const extractedLessons = getExtractedLessons(experienceDistillation);

  const distillationContextualMarkers = safeArray(
    experienceDistillation?.contextualMarkers,
  );

  const distillationWarnings = uniqueStrings([
    ...toTextItems(experienceDistillation?.misreadWarnings),
    ...toTextItems(experienceDistillation?.warnings),
  ]);

  const distillationNotes = uniqueStrings(
    toTextItems(experienceDistillation?.notes),
  );

  const similarCases: SimilarCaseForView[] = Array.isArray(rawResult.similarCases)
    ? rawResult.similarCases
    : Array.isArray(learningSignal?.similarCases)
      ? learningSignal.similarCases
      : [];

  const assistedHypothesis = buildAssistedHypothesis({
    learningSignal,
    similarCases,
    shouldRaiseRedFlag: effectiveLearningRedFlag,
  });

  const headline = buildHeadline({
    resultType: rawResult.resultType,
    isFrontierReading: displayFrontierReading,
    isConflictReading,
  });

  const directionLabel = buildDirectionLabel({
    resultType: rawResult.resultType,
    isFrontierReading: displayFrontierReading,
    isConflictReading,
  });

  const explanation = buildMainExplanation({
    resultType: rawResult.resultType,
    isFrontierReading: displayFrontierReading,
    isConflictReading,
    dominantTension: rawResult.dominantTension,
    diagnosticSummary: rawResult.summaryForUser?.diagnostico,
  });

  const isCompressed = rawResult.resultType === "compressed_life";

  const diagnosticCaseStatistics =
    rawDiagnosticCaseStatistics ??
    buildFallbackDiagnosticCaseStatistics({
      rawResult,
      displayedMainDirection,
      familyScores: visibleFamilyScores,
      frontierParts,
      contextualSituationReview,
      contextualForces,
      learningTrace,
      isConflictReading,
      displayFrontierReading,
      isCompressed,
      diagnosticReview,
    });

  const compressionText =
    rawResult.currentCost ??
    "Hoy parte de esta capacidad no está desplegada como podría, porque gran parte de tu energía está en sostener lo inmediato.";

  const secondaryDirectionText = displayFrontierReading
    ? "También aparece como línea posible, aunque con menos fuerza que la frontera principal."
    : "También aparece como línea posible, aunque con menos fuerza que la dirección principal.";

  const autoArchivePayload = {
    archiveVersion: "human_case_depot_v1",
    createdAt: new Date().toISOString(),
    source: "browser_human_case_v1",
    sourceInput: {
      fullAnswersContext: buildSourceInputSnapshot(fullAnswersContext),
    },
    currentResult: {
      resultType: rawResult.resultType,
      corePattern: rawResult.corePattern,
      displayedMainDirection,
      dominantTension: rawResult.dominantTension,
      currentCost: rawResult.currentCost,
      familyScores: rawResult.familyScores ?? [],
      learningSignal: rawResult.learningSignal ?? null,
      similarCases,
      diagnosticReview,
      experienceDistillation,
      learningTrace,
      diagnosticCaseStatistics,
      caseStatistics: diagnosticCaseStatistics,
      statisticalTrace: diagnosticCaseStatistics,
      contextualSituationReview,
      effectiveLearningRedFlag,
      isConflictReading,
      isFrontierSupportReading,
      displayFrontierReading,
      summaryForUser: rawResult.summaryForUser ?? null,
      personalizedPresentation: rawResult.personalizedPresentation ?? null,
      trace: rawResult.trace ?? null,
    },
    humanReview: {
      expectedPrimaryFamily: "",
      acceptableFamilies: [],
      rivalFamilies: [],
      verdict: "pending_human_review",
      correctionNote: "",
      shouldBecomeLearnedCase: false,
    },
    clientMeta: buildFoundationalClientMeta({
      phase: "diagnostic_result_archived",
    }),
  };

  return (
    <HumanCaseArchiveGate archivePayload={autoArchivePayload}>
      {() => (
    <main className="min-h-screen bg-white text-black px-4 sm:px-8 py-10 md:py-14">
      <div
        className={`mx-auto space-y-10 ${
          hasPersonalizedPresentation ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        {/* HEADER */}
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Resultado de tu lectura
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {hasPersonalizedPresentation
              ? "Tu lectura"
              : headline}
          </h1>

          <p className="text-base md:text-lg text-neutral-700 leading-relaxed">
            {hasPersonalizedPresentation
              ? "Cada sección está fundamentada en una capa del sistema que ya leyó tu historia. Esto no es una etiqueta: es una sentencia armada con evidencia."
              : "Esto no es una etiqueta. Es una lectura basada en patrones que aparecen en tu historia."}
          </p>
        </div>

        {hasPersonalizedPresentation && presentation && (
          <PersonalizedDiagnosticDeliverable presentation={presentation} />
        )}

        {!hasPersonalizedPresentation && (
          <>
        {/* DIRECCIÓN / FRONTERA PRINCIPAL */}
        <div className="border border-neutral-200 rounded-xl p-6 space-y-3">
          <p className="text-sm text-neutral-500">{directionLabel}</p>

          <h2 className="text-2xl font-semibold">{displayedMainDirection}</h2>

          <p className="text-sm text-neutral-700 leading-6">{explanation}</p>

          {displayFrontierReading &&
            familyRace?.topLabel &&
            familyRace?.secondLabel && (
              <p className="text-sm text-neutral-600 leading-6">
                La diferencia entre <strong>{familyRace.topLabel}</strong> y{" "}
                <strong>{familyRace.secondLabel}</strong> es suficientemente
                chica como para no cerrar esta lectura como una sentencia única.
              </p>
            )}
        </div>
          </>
        )}

        {/* TENSIÓN DIAGNÓSTICA INTERNA */}
        {isConflictReading && (
          <div className="border border-red-300 bg-red-50 rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-red-700">
                Contradicción diagnóstica
              </p>

              <h3 className="text-lg font-medium">
                La lectura merece revisión antes de cerrarse
              </h3>

              <p className="text-sm text-neutral-700 leading-6">
                Hay señales fuertes, pero las capas de auditoría no están
                completamente alineadas. Este caso no debe tomarse como sentencia
                automática: conviene usarlo como caso de revisión, contraste y
                aprendizaje controlado.
              </p>
            </div>
          </div>
        )}

        {/* RANKING REAL — vista técnica cuando hay presentación personalizada */}
        {visibleFamilyScores.length > 0 && !hasPersonalizedPresentation && (
          <div className="border border-neutral-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-medium">
              Cómo se ordenan las direcciones en tu caso
            </h3>

            <div className="space-y-4">
              {visibleFamilyScores.map((family, index) => (
                <div
                  key={`${getFamilyLabel(family)}-${index}`}
                  className="space-y-1"
                >
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-medium">{getFamilyLabel(family)}</span>
                    <span className="text-neutral-600">
                      {formatPercent(getFamilyScore(family))}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500">
                    Confianza: {formatPercent(getFamilyConfidence(family))}
                  </p>

                  {family.summary && (
                    <p className="text-sm text-neutral-700 leading-6">
                      {family.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {hasPersonalizedPresentation && visibleFamilyScores.length > 0 && (
          <details className="border border-neutral-200 rounded-xl p-6">
            <summary className="cursor-pointer text-sm font-medium text-neutral-600">
              Ver detalle técnico (scores y familias internas)
            </summary>
            <div className="mt-4 space-y-4">
              {visibleFamilyScores.map((family, index) => (
                <div
                  key={`tech-family-${getFamilyLabel(family)}-${index}`}
                  className="space-y-1"
                >
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-medium">{getFamilyLabel(family)}</span>
                    <span className="text-neutral-600">
                      {formatPercent(getFamilyScore(family))}
                    </span>
                  </div>
                  {family.summary && (
                    <p className="text-xs text-neutral-500">{family.summary}</p>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* OTRAS DIRECCIONES */}
        {secondaryDirections.length > 0 && !hasPersonalizedPresentation && (
          <div className="border border-neutral-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-medium">
              Otras direcciones que también aparecen
            </h3>

            <div className="space-y-3">
              {secondaryDirections.map((family, index) => (
                <div key={`${getFamilyLabel(family)}-secondary-${index}`}>
                  <p className="font-medium">{getFamilyLabel(family)}</p>
                  <p className="text-sm text-neutral-700">
                    {secondaryDirectionText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APRENDIZAJE DIAGNÓSTICO */}
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-blue-700">
              Aprendizaje diagnóstico
            </p>

            <h3 className="text-lg font-medium">
              Comparación con casos aprendidos
            </h3>

            <p className="text-sm text-neutral-700 leading-6">
              Esta capa compara tu caso con experiencias diagnósticas anteriores.
              Por ahora funciona como juez auditor: advierte similitudes, pero no
              reemplaza automáticamente el resultado principal.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              Casos similares encontrados:{" "}
              <strong>{similarCases.length}</strong>
            </p>

            <p>
              Familia histórica dominante:{" "}
              <strong>
                {normalizeLabel(
                  learningSignal?.strongestHistoricalFamily ??
                    assistedHypothesis?.family,
                )}
              </strong>
            </p>

            <p>
              Red flag de aprendizaje:{" "}
              <strong>{effectiveLearningRedFlag ? "Sí" : "No"}</strong>
            </p>

            {learningSignal?.warning && effectiveLearningRedFlag && (
              <p className="text-neutral-700 leading-6">
                Advertencia: {learningSignal.warning}
              </p>
            )}
          </div>

          {similarCases.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Casos más parecidos</h4>

              {similarCases.slice(0, 5).map((similarCase, index) => {
                const matchedLanguage = getMatchedLanguage(similarCase);

                return (
                  <div
                    key={`${getSimilarCaseId(similarCase)}-${index}`}
                    className="bg-white border border-blue-100 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between gap-4 text-sm">
                      <p className="font-medium">
                        {similarCase.title ?? "Caso aprendido"}
                      </p>

                      <p className="text-neutral-500">
                        Similitud: {formatPercent(similarCase.similarityScore)}
                      </p>
                    </div>

                    <p className="text-sm text-neutral-700">
                      Familia esperada en ese caso:{" "}
                      <strong>
                        {normalizeLabel(similarCase.expectedPrimaryFamily)}
                      </strong>
                    </p>

                    {matchedLanguage.length > 0 && (
                      <p className="text-sm text-neutral-700">
                        Lenguaje coincidente: {matchedLanguage.join(", ")}
                      </p>
                    )}

                    {similarCase.lesson && (
                      <p className="text-sm text-neutral-700 leading-6">
                        Lección: {similarCase.lesson}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* REVISIÓN DE JUECES DIAGNÓSTICOS */}
        {diagnosticReview && (
          <div className="border border-amber-300 bg-amber-50 rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-amber-700">
                Revisión de jueces diagnósticos
              </p>

              <h3 className="text-lg font-medium">
                Auditoría interna del resultado
              </h3>

              <p className="text-sm text-neutral-700 leading-6">
                Esta capa revisa si el diagnóstico principal, el ranking
                familiar, el aprendizaje por casos similares y la evidencia del
                usuario están alineados o si conviene abrir una frontera antes de
                cerrar la lectura.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                Veredicto general:{" "}
                <strong>{normalizeLabel(diagnosticReview.finalVerdict)}</strong>
              </p>

              {diagnosticReview.recommendedPrimaryFamily && (
                <p>
                  Familia recomendada por jueces:{" "}
                  <strong>
                    {normalizeLabel(diagnosticReview.recommendedPrimaryFamily)}
                  </strong>
                </p>
              )}

              {safeArray(diagnosticReview.recommendedFrontier).length > 0 && (
                <p>
                  Frontera recomendada:{" "}
                  <strong>
                    {safeArray(diagnosticReview.recommendedFrontier)
                      .map((family) => normalizeLabel(family))
                      .join(" / ")}
                  </strong>
                </p>
              )}

              <p>
                Revisión humana sugerida:{" "}
                <strong>
                  {diagnosticReview.shouldRequestHumanReview ? "Sí" : "No"}
                </strong>
              </p>
            </div>

            {diagnosticFindings.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Hallazgos de los jueces</h4>

                {diagnosticFindings.map((finding, index) => (
                  <div
                    key={`${finding.judgeId ?? "judge"}-${index}`}
                    className="bg-white border border-amber-100 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between gap-4 text-sm">
                      <p className="font-medium">
                        {normalizeLabel(finding.judgeId)}
                      </p>

                      <p className="text-neutral-500">
                        {normalizeLabel(finding.verdict)}
                      </p>
                    </div>

                    {finding.family && (
                      <p className="text-sm text-neutral-700">
                        Familia señalada:{" "}
                        <strong>{normalizeLabel(finding.family)}</strong>
                      </p>
                    )}

                    {finding.reason && (
                      <p className="text-sm text-neutral-700 leading-6">
                        {finding.reason}
                      </p>
                    )}

                    {toTextItems(finding.evidence).length > 0 && (
                      <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                        {toTextItems(finding.evidence)
                          .slice(0, 4)
                          .map((item, itemIndex) => (
                            <li
                              key={`${
                                finding.judgeId ?? "judge"
                              }-evidence-${itemIndex}`}
                            >
                              {item}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* JUEZ CONTEXTUAL DE SITUACIÓN */}
        {contextualSituationReview && (
          <div className="border border-violet-300 bg-violet-50 rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-violet-700">
                Juez contextual de situación
              </p>

              <h3 className="text-lg font-medium">
                Lectura del conjunto del caso
              </h3>

              <p className="text-sm text-neutral-700 leading-6">
                Esta capa mira el caso desde arriba: situación actual, contexto
                vital, fuerzas personales, restricciones, dirección probable y
                riesgo de mala lectura si se toman sólo palabras aisladas.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                Veredicto contextual:{" "}
                <strong>
                  {normalizeLabel(contextualSituationReview.verdict)}
                </strong>
              </p>

              {contextualSituationReview.recommendedUse && (
                <p>
                  Uso recomendado:{" "}
                  <strong>
                    {normalizeLabel(contextualSituationReview.recommendedUse)}
                  </strong>
                </p>
              )}

              {contextualSituationReview.dominantContext && (
                <p>
                  Contexto dominante:{" "}
                  <strong>
                    {normalizeLabel(contextualSituationReview.dominantContext)}
                  </strong>
                </p>
              )}

              {safeArray(contextualSituationReview.suggestedFrontier).length >
                0 && (
                <p>
                  Frontera contextual sugerida:{" "}
                  <strong>
                    {safeArray(contextualSituationReview.suggestedFrontier)
                      .map((family) => normalizeLabel(family))
                      .join(" / ")}
                  </strong>
                </p>
              )}

              <p>
                Sugiere ajustar diagnóstico:{" "}
                <strong>
                  {contextualSituationReview.shouldAdjustDiagnosis
                    ? "Sí"
                    : "No"}
                </strong>
              </p>

              <p>
                Sugiere abrir frontera:{" "}
                <strong>
                  {contextualSituationReview.shouldOpenFrontier ? "Sí" : "No"}
                </strong>
              </p>

              <p>
                Sugiere revisión humana:{" "}
                <strong>
                  {contextualSituationReview.shouldRequestHumanReview
                    ? "Sí"
                    : "No"}
                </strong>
              </p>

              {(contextualSituationReview.contextSummary ||
                contextualSituationReview.summary) && (
                <p className="text-neutral-700 leading-6">
                  {contextualSituationReview.contextSummary ??
                    contextualSituationReview.summary}
                </p>
              )}
            </div>

            {contextualForces.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Fuerzas contextuales detectadas</h4>

                {contextualForces.slice(0, 5).map((force, index) => (
                  <div
                    key={`${
                      force.kind ?? force.type ?? force.label ?? "force"
                    }-${index}`}
                    className="bg-white border border-violet-100 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between gap-4 text-sm">
                      <p className="font-medium">
                        {normalizeLabel(force.label ?? force.kind ?? force.type)}
                      </p>

                      <p className="text-neutral-500">
                        Fuerza: {formatPercent(force.strength)}
                      </p>
                    </div>

                    {(force.interpretation || force.reason) && (
                      <p className="text-sm text-neutral-700 leading-6">
                        {itemToText(
                          (force.interpretation ??
                            force.reason) as TextItemForView,
                        )}
                      </p>
                    )}

                    {toTextItems(force.evidence).length > 0 && (
                      <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                        {toTextItems(force.evidence)
                          .slice(0, 4)
                          .map((item, itemIndex) => (
                            <li key={`context-force-${index}-${itemIndex}`}>
                              {item}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {contextualActivationHints.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Pistas para activación</h4>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {contextualActivationHints.slice(0, 5).map((hint, index) => (
                    <li key={`context-activation-${index}`}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {contextualSuggestedThemes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Temáticas que podrían calzar</h4>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {contextualSuggestedThemes.slice(0, 5).map((theme, index) => (
                    <li key={`context-theme-${index}`}>{theme}</li>
                  ))}
                </ul>
              </div>
            )}

            {contextualWarnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Advertencias contextuales</h4>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {contextualWarnings.slice(0, 5).map((warning, index) => (
                    <li key={`context-warning-${index}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {contextualNotes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Notas internas</h4>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {contextualNotes.slice(0, 5).map((note, index) => (
                    <li key={`context-note-${index}`}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TRAZA ESTADÍSTICA DEL CASO */}
        {diagnosticCaseStatistics && (
          <div className="border border-slate-300 bg-slate-50 rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-slate-700">
                Traza estadística del caso
              </p>

              <h3 className="text-lg font-medium">
                Qué valor estadístico deja esta corrida
              </h3>

              <p className="text-sm text-neutral-700 leading-6">
                Esta capa no decide el diagnóstico. Guarda información agregable
                para detectar patrones, fronteras frecuentes, tensiones
                repetidas, familias más confundidas y señales útiles a escala.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              {diagnosticCaseStatistics.resultType && (
                <p>
                  Tipo de resultado:{" "}
                  <strong>
                    {normalizeLabel(diagnosticCaseStatistics.resultType)}
                  </strong>
                </p>
              )}

              {(diagnosticCaseStatistics.primaryFamily ||
                diagnosticCaseStatistics.dominantFamily ||
                diagnosticCaseStatistics.suggestedPrimaryFamily) && (
                <p>
                  Familia principal estadística:{" "}
                  <strong>
                    {normalizeLabel(
                      diagnosticCaseStatistics.primaryFamily ??
                        diagnosticCaseStatistics.dominantFamily ??
                        diagnosticCaseStatistics.suggestedPrimaryFamily,
                    )}
                  </strong>
                </p>
              )}

              {(diagnosticCaseStatistics.learningTraceType ||
                diagnosticCaseStatistics.learningFootprintType) && (
                <p>
                  Tipo de huella:{" "}
                  <strong>
                    {normalizeLabel(
                      diagnosticCaseStatistics.learningTraceType ??
                        diagnosticCaseStatistics.learningFootprintType,
                    )}
                  </strong>
                </p>
              )}

              {typeof diagnosticCaseStatistics.shouldStore === "boolean" && (
                <p>
                  ¿Debe guardarse?:{" "}
                  <strong>
                    {diagnosticCaseStatistics.shouldStore ? "Sí" : "No"}
                  </strong>
                </p>
              )}

              {typeof diagnosticCaseStatistics.shouldInfluenceFutureCases ===
                "boolean" && (
                <p>
                  ¿Influye en futuros casos?:{" "}
                  <strong>
                    {diagnosticCaseStatistics.shouldInfluenceFutureCases
                      ? "Sí"
                      : "No"}
                  </strong>
                </p>
              )}

              {typeof diagnosticCaseStatistics.influenceStrength ===
                "number" && (
                <p>
                  Fuerza de influencia:{" "}
                  <strong>
                    {formatPercent(diagnosticCaseStatistics.influenceStrength)}
                  </strong>
                </p>
              )}

              {typeof diagnosticCaseStatistics.frontierDetected ===
                "boolean" && (
                <p>
                  Frontera detectada:{" "}
                  <strong>
                    {diagnosticCaseStatistics.frontierDetected ? "Sí" : "No"}
                  </strong>
                </p>
              )}

              {typeof diagnosticCaseStatistics.conflictDetected ===
                "boolean" && (
                <p>
                  Conflicto detectado:{" "}
                  <strong>
                    {diagnosticCaseStatistics.conflictDetected ? "Sí" : "No"}
                  </strong>
                </p>
              )}

              {typeof diagnosticCaseStatistics.compressionDetected ===
                "boolean" && (
                <p>
                  Compresión detectada:{" "}
                  <strong>
                    {diagnosticCaseStatistics.compressionDetected ? "Sí" : "No"}
                  </strong>
                </p>
              )}

              {typeof diagnosticCaseStatistics.humanReviewSuggested ===
                "boolean" && (
                <p>
                  Revisión humana sugerida:{" "}
                  <strong>
                    {diagnosticCaseStatistics.humanReviewSuggested
                      ? "Sí"
                      : "No"}
                  </strong>
                </p>
              )}

              {diagnosticCaseStatistics.summary && (
                <p className="text-neutral-700 leading-6">
                  {diagnosticCaseStatistics.summary}
                </p>
              )}
            </div>

            {safeArray(diagnosticCaseStatistics.frontierFamilies).length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Familias en frontera</p>
                <p className="text-sm text-neutral-700 leading-6">
                  {safeArray(diagnosticCaseStatistics.frontierFamilies)
                    .map((family) => normalizeLabel(family))
                    .join(" / ")}
                </p>
              </div>
            )}

            {toTextItems(diagnosticCaseStatistics.topFamilies).length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Familias superiores</p>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {toTextItems(diagnosticCaseStatistics.topFamilies)
                    .slice(0, 5)
                    .map((item, index) => (
                      <li key={`statistics-top-family-${index}`}>{item}</li>
                    ))}
                </ul>
              </div>
            )}

            {toTextItems(diagnosticCaseStatistics.contextualForces).length >
              0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Fuerzas contextuales registradas
                </p>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {toTextItems(diagnosticCaseStatistics.contextualForces)
                    .slice(0, 6)
                    .map((item, index) => (
                      <li key={`statistics-contextual-force-${index}`}>
                        {item}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {uniqueStrings([
              ...safeArray(diagnosticCaseStatistics.statisticalTags ?? []),
              ...safeArray(diagnosticCaseStatistics.tags ?? []),
            ]).length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Tags estadísticos</p>
                <p className="text-sm text-neutral-700 leading-6">
                  {uniqueStrings([
                    ...safeArray(diagnosticCaseStatistics.statisticalTags ?? []),
                    ...safeArray(diagnosticCaseStatistics.tags ?? []),
                  ]).join(", ")}
                </p>
              </div>
            )}

            {toTextItems(diagnosticCaseStatistics.notes).length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Notas estadísticas internas
                </p>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {toTextItems(diagnosticCaseStatistics.notes)
                    .slice(0, 5)
                    .map((note, index) => (
                      <li key={`statistics-note-${index}`}>{note}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* EXTRACCIÓN QUIRÚRGICA DE APRENDIZAJE */}
        {experienceDistillation && (
          <div className="border border-emerald-300 bg-emerald-50 rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-emerald-700">
                Extracción quirúrgica de aprendizaje
              </p>

              <h3 className="text-lg font-medium">
                Qué enseñanza deja este caso
              </h3>

              <p className="text-sm text-neutral-700 leading-6">
                Esta capa no decide el diagnóstico. Separa qué parte del caso
                puede servir como aprendizaje, qué parte debe quedar sólo como
                observación y qué riesgos de mala lectura conviene guardar.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                Veredicto del cirujano:{" "}
                <strong>
                  {normalizeLabel(experienceDistillation.verdict)}
                </strong>
              </p>

              <p>
                Uso recomendado:{" "}
                <strong>
                  {normalizeLabel(
                    experienceDistillation.recommendedLearningUse,
                  )}
                </strong>
              </p>

              <p>
                ¿Convertir en caso aprendido completo?:{" "}
                <strong>
                  {experienceDistillation.shouldBecomeFullLearnedCase
                    ? "Sí"
                    : "No"}
                </strong>
              </p>

              <p>
                ¿Crear observación parcial?:{" "}
                <strong>
                  {experienceDistillation.shouldCreateObservation ? "Sí" : "No"}
                </strong>
              </p>

              <p>
                ¿Sostener red flag?:{" "}
                <strong>
                  {experienceDistillation.shouldRaiseRedFlag ? "Sí" : "No"}
                </strong>
              </p>

              <p>
                Confianza del cirujano:{" "}
                <strong>
                  {formatPercent(experienceDistillation.confidence)}
                </strong>
              </p>

              {experienceDistillation.summary && (
                <p className="text-neutral-700 leading-6">
                  {experienceDistillation.summary}
                </p>
              )}
            </div>

            {learningTrace && (
              <div className="bg-white border border-emerald-100 rounded-lg p-4 space-y-2">
                <p className="text-sm uppercase tracking-wide text-emerald-700">
                  Huella de aprendizaje
                </p>

                <p className="text-sm">
                  Tipo de huella:{" "}
                  <strong>{normalizeLabel(learningTrace.learningTier)}</strong>
                </p>

                <p className="text-sm">
                  ¿Debe guardarse?:{" "}
                  <strong>
                    {learningTrace.shouldStoreTrace === false ? "No" : "Sí"}
                  </strong>
                </p>

                <p className="text-sm">
                  ¿Influye en futuros casos?:{" "}
                  <strong>
                    {learningTrace.shouldInfluenceFutureCases ? "Sí" : "No"}
                  </strong>
                </p>

                <p className="text-sm">
                  Fuerza de influencia:{" "}
                  <strong>
                    {formatPercent(learningTrace.influenceStrength)}
                  </strong>
                </p>

                {learningTrace.requiresHumanApproval !== undefined && (
                  <p className="text-sm">
                    ¿Requiere aprobación humana?:{" "}
                    <strong>
                      {learningTrace.requiresHumanApproval ? "Sí" : "No"}
                    </strong>
                  </p>
                )}

                {learningTrace.lesson && (
                  <p className="text-sm text-neutral-700 leading-6">
                    Lección mínima: {learningTrace.lesson}
                  </p>
                )}

                {learningTrace.whyNotStronger && (
                  <p className="text-sm text-neutral-700 leading-6">
                    Por qué no pesa más todavía:{" "}
                    {learningTrace.whyNotStronger}
                  </p>
                )}

                {learningTrace.riskPrevented && (
                  <p className="text-sm text-neutral-700 leading-6">
                    Riesgo que ayuda a prevenir: {learningTrace.riskPrevented}
                  </p>
                )}

                {safeArray(learningTrace.familiesInvolved).length > 0 && (
                  <p className="text-sm text-neutral-700 leading-6">
                    Familias involucradas:{" "}
                    <strong>
                      {safeArray(learningTrace.familiesInvolved)
                        .map((family) => normalizeLabel(family))
                        .join(" / ")}
                    </strong>
                  </p>
                )}
              </div>
            )}

            {extractedLessons.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Lecciones extraídas</h4>

                {extractedLessons.map((lesson, index) => {
                  const lessonConditions = toTextItems(lesson.conditions);
                  const lessonPositiveMarkers = toTextItems(
                    lesson.positiveMarkers,
                  );
                  const lessonNegativeMarkers = toTextItems(
                    lesson.negativeMarkers,
                  );
                  const lessonWarnings = toTextItems(lesson.misreadWarnings);

                  return (
                    <div
                      key={`${lesson.type ?? "lesson"}-${index}`}
                      className="bg-white border border-emerald-100 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between gap-4 text-sm">
                        <p className="font-medium">
                          {normalizeLabel(lesson.type)}
                        </p>

                        <p className="text-neutral-500">
                          Fuerza: {formatPercent(lesson.strength)}
                        </p>
                      </div>

                      {safeArray(lesson.families).length > 0 && (
                        <p className="text-sm text-neutral-700">
                          Familias:{" "}
                          <strong>
                            {safeArray(lesson.families)
                              .map((family) => normalizeLabel(family))
                              .join(" / ")}
                          </strong>
                        </p>
                      )}

                      {!safeArray(lesson.families).length &&
                        (lesson.primaryFamily || lesson.secondaryFamily) && (
                          <p className="text-sm text-neutral-700">
                            Familias:{" "}
                            <strong>
                              {[lesson.primaryFamily, lesson.secondaryFamily]
                                .filter(Boolean)
                                .map((family) => normalizeLabel(family))
                                .join(" / ")}
                            </strong>
                          </p>
                        )}

                      {lesson.lesson && (
                        <p className="text-sm text-neutral-700 leading-6">
                          {lesson.lesson}
                        </p>
                      )}

                      {lessonConditions.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Condiciones</p>
                          <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                            {lessonConditions
                              .slice(0, 5)
                              .map((item, itemIndex) => (
                                <li
                                  key={`lesson-condition-${index}-${itemIndex}`}
                                >
                                  {item}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {lessonPositiveMarkers.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Marcadores positivos
                          </p>
                          <p className="text-sm text-neutral-700 leading-6">
                            {lessonPositiveMarkers.join(", ")}
                          </p>
                        </div>
                      )}

                      {lessonNegativeMarkers.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Marcadores que limitan la lectura
                          </p>
                          <p className="text-sm text-neutral-700 leading-6">
                            {lessonNegativeMarkers.join(", ")}
                          </p>
                        </div>
                      )}

                      {lessonWarnings.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Riesgos de mala lectura
                          </p>
                          <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                            {lessonWarnings
                              .slice(0, 4)
                              .map((item, itemIndex) => (
                                <li key={`lesson-warning-${index}-${itemIndex}`}>
                                  {item}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {lesson.requiresHumanApproval && (
                        <p className="text-sm text-neutral-700 leading-6">
                          Esta lección requiere aprobación humana antes de
                          convertirse en aprendizaje estable.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {distillationContextualMarkers.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Marcadores contextuales</h4>

                {distillationContextualMarkers
                  .slice(0, 6)
                  .map((marker, index) => (
                    <div
                      key={`${marker.marker ?? "marker"}-${index}`}
                      className="bg-white border border-emerald-100 rounded-lg p-4 space-y-2"
                    >
                      <p className="font-medium">
                        {marker.marker ?? "Marcador sin nombre"}
                      </p>

                      {marker.contextMeaning && (
                        <p className="text-sm text-neutral-700 leading-6">
                          {marker.contextMeaning}
                        </p>
                      )}

                      {safeArray(marker.supportsFamilies).length > 0 && (
                        <p className="text-sm text-neutral-700">
                          Apoya:{" "}
                          <strong>
                            {safeArray(marker.supportsFamilies)
                              .map((family) => normalizeLabel(family))
                              .join(" / ")}
                          </strong>
                        </p>
                      )}

                      {safeArray(marker.notEnoughFor).length > 0 && (
                        <p className="text-sm text-neutral-700">
                          No alcanza por sí solo para:{" "}
                          <strong>
                            {safeArray(marker.notEnoughFor)
                              .map((family) => normalizeLabel(family))
                              .join(" / ")}
                          </strong>
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {distillationWarnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Advertencias preservadas</h4>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {distillationWarnings.slice(0, 5).map((warning, index) => (
                    <li key={`distillation-warning-${index}`}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {distillationNotes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Notas internas</h4>
                <ul className="list-disc pl-5 text-sm text-neutral-700 space-y-1">
                  {distillationNotes.slice(0, 5).map((note, index) => (
                    <li key={`distillation-note-${index}`}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* COMPRESIÓN */}
        {isCompressed && (
          <div className="border border-neutral-300 bg-neutral-50 rounded-xl p-6 space-y-3">
            <h3 className="text-lg font-medium">
              Algo importante a tener en cuenta
            </h3>

            <p className="text-sm text-neutral-700 leading-6">
              {compressionText}
            </p>
          </div>
        )}

        {/* EXPORTAR CASO PARA APRENDIZAJE */}
        <div className="border border-neutral-300 bg-neutral-50 rounded-xl p-6 space-y-3">
          <h3 className="text-lg font-medium">
            Exportar caso para aprendizaje
          </h3>

          <p className="text-sm text-neutral-700 leading-6">
            Usá esto sólo después de revisar humanamente el resultado. No todo
            caso corrido debe convertirse en caso aprendido.
          </p>

          <button
            type="button"
            className="border border-neutral-400 rounded-lg px-4 py-2 text-sm hover:bg-neutral-100"
            onClick={async () => {
              const payload = {
                exportedAt: new Date().toISOString(),

                sourceInput: {
                  fullAnswersContext: buildSourceInputSnapshot(
                    fullAnswersContext,
                  ),
                },

                currentResult: {
                  resultType: rawResult.resultType,
                  corePattern: rawResult.corePattern,
                  displayedMainDirection,
                  dominantTension: rawResult.dominantTension,
                  currentCost: rawResult.currentCost,
                  familyScores: rawResult.familyScores ?? [],
                  learningSignal: rawResult.learningSignal ?? null,
                  similarCases,
                  diagnosticReview,
                  experienceDistillation,
                  learningTrace,
                  diagnosticCaseStatistics,
                  caseStatistics: diagnosticCaseStatistics,
                  statisticalTrace: diagnosticCaseStatistics,
                  contextualSituationReview,
                  effectiveLearningRedFlag,
                  isConflictReading,
                  isFrontierSupportReading,
                  displayFrontierReading,
                  summaryForUser: rawResult.summaryForUser ?? null,
                  trace: rawResult.trace ?? null,
                },

                humanReview: {
                  expectedPrimaryFamily: "",
                  acceptableFamilies: [],
                  rivalFamilies: [],
                  verdict: "pending_human_review",
                  correctionNote: "",
                  shouldBecomeLearnedCase: false,
                },
              };

              try {
                await copyTextToClipboard(JSON.stringify(payload, null, 2));

                alert("Caso copiado al portapapeles para revisión/aprendizaje.");
              } catch (error) {
                console.error("No se pudo copiar el caso:", error);
                alert(
                  "No se pudo copiar automáticamente. Revisá la consola del navegador.",
                );
              }
            }}
          >
            Copiar caso para revisión
          </button>
        </div>

        {/* CIERRE */}
        {!hasPersonalizedPresentation && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Qué hacer con esto</h3>

          <p className="text-sm text-neutral-700 leading-6">
            {rawResult.summaryForUser?.cierre ??
              "Esto no es una conclusión final. Es un punto de partida más claro para empezar a moverte con dirección."}
          </p>

          {rawResult.summaryForUser?.action && (
            <p className="text-sm text-neutral-700 leading-6">
              {rawResult.summaryForUser.action}
            </p>
          )}
        </div>
        )}

        {/* CTA HACIA TEMÁTICAS */}
        {!hasPersonalizedPresentation && (
        <div className="border-2 border-black rounded-xl p-6 space-y-4 text-center">
          <h3 className="text-xl font-semibold">
            Tu lectura está lista. Ahora elegí hacia dónde moverte.
          </h3>
          <p className="text-sm text-neutral-700 leading-6">
            Te preparamos algunas temáticas que resuenan con lo que apareció en tu caso.
          </p>
          <button
            onClick={() => router.push("/full/themes")}
            className="px-8 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Elegir mi temática
          </button>
        </div>
        )}

        {hasPersonalizedPresentation && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => router.push("/full/themes")}
              className="px-10 py-4 bg-black text-white rounded-xl text-base font-medium hover:bg-neutral-800 transition-colors"
            >
              Elegir mi temática y dar el siguiente paso
            </button>
          </div>
        )}
      </div>
    </main>
      )}
    </HumanCaseArchiveGate>
  );
}