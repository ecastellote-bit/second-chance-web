import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";
import type { AmbiguityType, FollowupRound } from "../types/followup";
import type { FollowupOrchestratorResult } from "./followupOrchestrator";
import { normalizeUserIntake, validateUserIntake } from "./intakeEngine";
import { runCVME } from "./cvmeEngine";
import { runTDM } from "./tdmEngine";
import { runLTE } from "./lteEngine";
import { runSEL } from "./selEngine";
import { runAVE } from "./aveEngine";
import {
  buildFinalReading,
  finalizeReadingAfterDiagnosticReview,
} from "./resultOrchestrator";
import { buildFollowupOrchestration } from "./followupOrchestrator";
import { runAffinityPipelineBridge } from "./affinityPipelineBridge";
import {
  buildLearningSignal,
  findSimilarLearnedCases,
} from "./similarCaseEngine";
import {
  mergeSemanticMatchesIntoLearningSignal,
  prepareSemanticMatchesForLearning,
  shouldMergeSemanticSimilarityIntoLearning,
} from "./semanticSimilarityEngine";
import { runDiagnosticJudgeEngine } from "./diagnosticJudgeEngine";
import { runDiagnosticExperienceDistiller } from "./diagnosticExperienceDistiller";
import { runContextualSituationJudge } from "./contextualSituationJudge";
import { runNegativeEvidenceJudge } from "./negativeEvidenceJudge";
import { applyDiscardExclusions } from "./discardJudgeAdjudication";
import { ensureDiagnosticLearningTrace } from "./diagnosticLearningTrace";
import { buildDiagnosticCaseStatistics } from "./diagnosticCaseStatistics";
import { calibrateDiagnosticReviewIntensity } from "./diagnosticReviewCalibrator";

type ClarificationMetaPayload = {
  roundsCompleted?: number;
  requestedRound?: FollowupRound;
  lockedAmbiguityType?: AmbiguityType | null;
};

type PipelineInput = Partial<UserIntake> & {
  clarificationMeta?: ClarificationMetaPayload;
  _semanticSignals?: import("../types/semantic").SemanticExtractionResult;
  _semanticSimilarity?: import("./semanticSimilarityEngine").SemanticSimilarityResult;
};

export type PipelineSuccess = {
  ok: true;
  data: FinalReading;
  warnings: string[];
  followup: FollowupOrchestratorResult | null;
};

export type PipelineFailure = {
  ok: false;
  missingFields: string[];
  warnings: string[];
};

export type PipelineResult = PipelineSuccess | PipelineFailure;

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

function uniqueTextLines(lines: string[]): string[] {
  const seen = new Set<string>();

  return lines.filter((line) => {
    const normalized = line.toLowerCase().trim();

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function buildLearningInputText(
  rawInput: PipelineInput,
  intake: UserIntake,
): string {
  /**
   * Importante:
   * usamos rawInput + intake normalizado.
   *
   * Así el aprendizaje no queda ciego ante:
   * - campos nuevos del formulario
   * - respuestas de follow-up
   * - restricciones / activos
   * - textos que todavía no estén mapeados manualmente
   */
  const rawText = collectHumanText(rawInput);
  const normalizedText = collectHumanText(intake);

  return uniqueTextLines([...rawText, ...normalizedText]).join("\n");
}

function normalizeDiagnosticKey(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function diagnosticReviewHasWeakSimilarityWarning(
  diagnosticReview: unknown,
): boolean {
  const review = diagnosticReview as any;

  if (!review || typeof review !== "object") return false;

  const findings = Array.isArray(review.findings) ? review.findings : [];

  return findings.some((finding: any) => {
    const judgeId = normalizeDiagnosticKey(finding?.judgeId);
    const verdict = normalizeDiagnosticKey(finding?.verdict);
    const reason = normalizeDiagnosticKey(finding?.reason);

    return (
      judgeId.includes("similar") &&
      (verdict.includes("weak similarity warning") ||
        reason.includes("similitud mas alta es baja") ||
        reason.includes("similarity"))
    );
  });
}

function diagnosticReviewIsOtherwiseAligned(diagnosticReview: unknown): boolean {
  const review = diagnosticReview as any;

  if (!review || typeof review !== "object") return false;

  const verdict = normalizeDiagnosticKey(review.finalVerdict);

  return (
    verdict === "aligned" ||
    verdict === "aligned with caution" ||
    verdict.includes("aligned")
  );
}

function downgradeWeakSimilarityDistillation(params: {
  rawExperienceDistillation: unknown;
  diagnosticReview: unknown;
}): unknown {
  const distillation = params.rawExperienceDistillation as any;

  if (!distillation || typeof distillation !== "object") {
    return params.rawExperienceDistillation;
  }

  const hasWeakSimilarityWarning = diagnosticReviewHasWeakSimilarityWarning(
    params.diagnosticReview,
  );

  const otherwiseAligned = diagnosticReviewIsOtherwiseAligned(
    params.diagnosticReview,
  );

  if (!hasWeakSimilarityWarning || !otherwiseAligned) {
    return params.rawExperienceDistillation;
  }

  return {
    ...distillation,

    verdict: "collect_partial_learning",
    recommendedLearningUse: "calibration_only",
    shouldBecomeFullLearnedCase: false,
    shouldCreateObservation: true,
    shouldRaiseRedFlag: false,
    confidence:
      typeof distillation.confidence === "number"
        ? Math.min(distillation.confidence, 0.45)
        : 0.4,

    summary:
      "La memoria de casos detecta una tensión débil por similitud baja, pero no contradice de forma fuerte el diagnóstico principal. Debe guardarse como calibración, no como misread warning.",

    learningTrace: {
      ...(distillation.learningTrace ?? {}),
      shouldStoreTrace: true,
      learningTier: "calibration_only",
      shouldInfluenceFutureCases: false,
      influenceStrength: 0,
      requiresHumanApproval: false,
      lesson:
        "Cuando la memoria histórica empuja hacia otra familia con similitud baja, y los jueces principales están alineados, el caso debe dejar traza de calibración pero no conflicto fuerte.",
      whyNotStronger:
        "La similitud histórica es baja y no alcanza para desplazar una lectura principal consistente.",
      riskPrevented:
        "Evitar que casos aprendidos de baja similitud generen falsas contradicciones diagnósticas.",
      familiesInvolved: [],
    },
  };
}

function extractFinalAdjudication(reading: FinalReading): unknown | null {
  const trace = (reading as any)?.trace;

  if (trace && typeof trace === "object" && !Array.isArray(trace)) {
    return (trace as any).finalAdjudication ?? null;
  }

  return null;
}

function ensureTraceCarriesFinalAdjudication(
  reading: FinalReading,
): { trace: unknown; finalAdjudication: unknown | null } {
  const existingTrace = (reading as any)?.trace ?? null;
  const finalAdjudication = extractFinalAdjudication(reading);

  if (
    existingTrace &&
    typeof existingTrace === "object" &&
    !Array.isArray(existingTrace)
  ) {
    return {
      trace: {
        ...existingTrace,
        finalAdjudication,
      },
      finalAdjudication,
    };
  }

  return {
    trace: {
      rawTrace: existingTrace,
      finalAdjudication,
    },
    finalAdjudication,
  };
}

export function runAnalysisPipeline(rawInput: PipelineInput): PipelineResult {
  const clarificationMeta = rawInput.clarificationMeta;
  const intake = normalizeUserIntake(rawInput);
  const validation = validateUserIntake(intake);

  if (!validation.isValid) {
    return {
      ok: false,
      missingFields: validation.missingFields,
      warnings: validation.warnings,
    };
  }

  const signals = runCVME(intake);
  const affinityBridge = runAffinityPipelineBridge({
    intake,
    semanticSignals: rawInput._semanticSignals,
  });

  /**
   * Capa 0: Juez de Descarte — exclusión de familias imposibles.
   * Corre antes de la lectura provisoria. No elige ganador; reduce el universo candidato.
   */
  const negativeEvidenceReviewDraft = runNegativeEvidenceJudge({
    intake,
    familyScores: affinityBridge.familyScores ?? [],
    affinityScores: affinityBridge.affinityScores ?? [],
  });

  const discardExclusion = applyDiscardExclusions(
    affinityBridge.familyScores ?? [],
    negativeEvidenceReviewDraft,
  );

  const effectiveFamilyScores = discardExclusion.familyScores;

  const negativeEvidenceReview = {
    ...negativeEvidenceReviewDraft,
    effectiveTopFamilyId: discardExclusion.effectiveTopFamilyId,
    topFamilyChangedByExclusion: discardExclusion.topFamilyChangedByExclusion,
    wouldAffectRealResult:
      negativeEvidenceReviewDraft.exclusionsApplied &&
      discardExclusion.topFamilyChangedByExclusion,
  };

  const profiles = runTDM(signals, affinityBridge.affinityScores);
  const transitionAssessment = runLTE(intake);
  const plausibleDirections = runSEL(profiles, effectiveFamilyScores);
  const actionVectors = runAVE(plausibleDirections, transitionAssessment);

  /**
   * Lectura inicial.
   *
   * Esta lectura es deliberadamente provisoria:
   * todavía no consultó memoria histórica ni fue auditada por jueces.
   * Usa familyScores ya filtrados por el Juez de Descarte.
   */
  const provisionalReading = buildFinalReading({
    intake,
    signals,
    profiles,
    transitionAssessment,
    plausibleDirections,
    actionVectors,
    familyScores: effectiveFamilyScores,
    clarificationMeta,
  });

  /**
   * Capa 1: aprendizaje diagnóstico.
   *
   * Compara el caso actual contra casos aprendidos / archivados.
   */
  const learningInputText = buildLearningInputText(rawInput, intake);

  const tokenSimilarCases = findSimilarLearnedCases(learningInputText, undefined, {
    minSimilarity: 0.08,
    limit: 5,
  });

  const semanticMatchesPrepared = rawInput._semanticSimilarity?.ok
    ? prepareSemanticMatchesForLearning(rawInput._semanticSimilarity.matches)
    : [];

  const similarCases =
    rawInput._semanticSimilarity?.ok &&
    shouldMergeSemanticSimilarityIntoLearning(semanticMatchesPrepared)
      ? mergeSemanticMatchesIntoLearningSignal(
          semanticMatchesPrepared,
          tokenSimilarCases,
        )
      : tokenSimilarCases;

  const learningSignal = buildLearningSignal(
    similarCases,
    provisionalReading.corePattern,
  );

  /**
   * Capa 2: juzgado de jueces diagnósticos.
   *
   * Revisa coherencia entre:
   * - resultado principal provisorio
   * - ranking familiar
   * - casos similares
   * - aprendizaje histórico
   * - lenguaje humano detectado
   */
  const rawDiagnosticReview = runDiagnosticJudgeEngine({
    intake,
    finalReading: provisionalReading,
    familyScores: effectiveFamilyScores,
    affinityScores: affinityBridge.affinityScores ?? [],
    similarCases,
    learningSignal,
    excludedFamilyIds: negativeEvidenceReview.excludedFamilyIds,
  });

  const diagnosticReview = calibrateDiagnosticReviewIntensity(
    rawDiagnosticReview,
    {
      similarCases,
      familyScores: effectiveFamilyScores,
      finalReading: provisionalReading,
    },
  );

  /**
   * Capa 3: cirujano de experiencia diagnóstica.
   *
   * No decide la sentencia final.
   * Extrae qué enseñanza puede dejar la corrida.
   */
  const rawExperienceDistillation = runDiagnosticExperienceDistiller({
    sourceInput: {
      rawInput,
      intake,
    },
    finalReading: provisionalReading,
    learningSignal,
    diagnosticReview,
  });

  const stabilizedExperienceDistillation = downgradeWeakSimilarityDistillation({
    rawExperienceDistillation,
    diagnosticReview,
  });

  /**
   * Capa 4: juez contextual de situación.
   *
   * Usa la distillation estabilizada, no la cruda.
   */
  const contextualSituationReview = runContextualSituationJudge({
    intake,
    finalReading: provisionalReading,
    familyScores: effectiveFamilyScores,
    affinityScores: affinityBridge.affinityScores ?? [],
    similarCases,
    learningSignal,
    diagnosticReview,
    experienceDistillation: stabilizedExperienceDistillation,
    excludedFamilyIds: negativeEvidenceReview.excludedFamilyIds,
  });

  /**
   * Capa 5: huella obligatoria de aprendizaje.
   *
   * Regla madre:
   * guardar ampliamente, influir selectivamente.
   */
  const experienceDistillation = ensureDiagnosticLearningTrace(
    stabilizedExperienceDistillation,
    {
      finalReading: provisionalReading,
      diagnosticReview,
      contextualSituationReview,
      similarCases,
      learningSignal,
    },
  );

  /**
   * Capa 6: adjudicación final.
   *
   * Esta es la pieza crítica:
   * la lectura pública final ya no debe salir sólo de la lectura provisoria.
   * Debe pasar por memoria, jueces y contexto.
   */
  const adjudicatedFinalReading = finalizeReadingAfterDiagnosticReview({
    provisionalReading,
    familyScores: effectiveFamilyScores,
    similarCases,
    learningSignal,
    diagnosticReview,
    contextualSituationReview,
    transitionAssessment,
  });

  const {
    trace: adjudicatedTraceWithFinalAdjudication,
    finalAdjudication,
  } = ensureTraceCarriesFinalAdjudication(adjudicatedFinalReading);

  const traceWithNegativeEvidenceReview =
    adjudicatedTraceWithFinalAdjudication &&
    typeof adjudicatedTraceWithFinalAdjudication === "object" &&
    !Array.isArray(adjudicatedTraceWithFinalAdjudication)
      ? {
          ...(adjudicatedTraceWithFinalAdjudication as Record<string, unknown>),
          negativeEvidenceReview,
        }
      : {
          rawTrace: adjudicatedTraceWithFinalAdjudication ?? null,
          negativeEvidenceReview,
        };

  /**
   * Capa 7: traza estadística del caso.
   *
   * Importante:
   * usamos adjudicatedFinalReading, no provisionalReading,
   * para que la estadística refleje la sentencia final auditada.
   */
  const diagnosticCaseStatistics = buildDiagnosticCaseStatistics({
    sourceInput: {
      rawInput,
      intake,
    },
    finalReading: {
      ...adjudicatedFinalReading,
      trace: traceWithNegativeEvidenceReview,
    } as FinalReading,
    familyScores: effectiveFamilyScores,
    affinityScores: affinityBridge.affinityScores ?? [],
    similarCases,
    learningSignal,
    diagnosticReview,
    experienceDistillation,
    contextualSituationReview,
  });

  /**
   * Puente explícito hacia frontend y archivo.
   *
   * El resultado público recibe y preserva:
   * - sentencia final adjudicada
   * - trace.finalAdjudication
   * - finalAdjudication top-level
   * - familyScores / affinityScores
   * - learningSignal / similarCases
   * - diagnosticReview
   * - experienceDistillation
   * - contextualSituationReview
   * - diagnosticCaseStatistics
   */
  const finalReadingWithDiagnosticBridge = {
    ...adjudicatedFinalReading,

    trace: traceWithNegativeEvidenceReview,
    finalAdjudication,

    familyScores: effectiveFamilyScores,
    affinityScores: affinityBridge.affinityScores ?? [],
    topAffinities: affinityBridge.topAffinities ?? [],
    buriedCapacities: affinityBridge.buriedCapacities ?? [],
    likelyContributionModes: affinityBridge.likelyContributionModes ?? [],
    likelyFlourishingConditions:
      affinityBridge.likelyFlourishingConditions ?? [],

    learningSignal,
    similarCases,

    diagnosticReview,
    diagnosticJudgeReview: diagnosticReview,

    negativeEvidenceReview,
    discardJudgeReview: negativeEvidenceReview,

    experienceDistillation,
    diagnosticExperienceDistillation: experienceDistillation,
    diagnosticSurgery: experienceDistillation,
    learningDistillation: experienceDistillation,

    contextualSituationReview,
    contextualSituationJudge: contextualSituationReview,
    contextualReview: contextualSituationReview,

    diagnosticCaseStatistics,
    diagnosticStatistics: diagnosticCaseStatistics,
    statisticalTrace: diagnosticCaseStatistics,
  } as unknown as FinalReading;

  const followup =
    finalReadingWithDiagnosticBridge.resultType === "insufficient_evidence"
      ? buildFollowupOrchestration({
          resultType: finalReadingWithDiagnosticBridge.resultType,
          profiles,
          signals,
          transitionAssessment,
          requestedRound: clarificationMeta?.requestedRound,
          lockedAmbiguityType: clarificationMeta?.lockedAmbiguityType,
          roundsCompleted: clarificationMeta?.roundsCompleted ?? 0,
        })
      : null;

  return {
    ok: true,
    data: finalReadingWithDiagnosticBridge,
    warnings: validation.warnings,
    followup,
  };
}