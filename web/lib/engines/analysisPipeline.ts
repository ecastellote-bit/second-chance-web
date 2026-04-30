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
import { buildFinalReading } from "./resultOrchestrator";
import { buildFollowupOrchestration } from "./followupOrchestrator";
import { runAffinityPipelineBridge } from "./affinityPipelineBridge";
import {
  buildLearningSignal,
  findSimilarLearnedCases,
} from "./similarCaseEngine";
import { runDiagnosticJudgeEngine } from "./diagnosticJudgeEngine";
import { runDiagnosticExperienceDistiller } from "./diagnosticExperienceDistiller";
import { runContextualSituationJudge } from "./contextualSituationJudge";
import { ensureDiagnosticLearningTrace } from "./diagnosticLearningTrace";
import { buildDiagnosticCaseStatistics } from "./diagnosticCaseStatistics";

type ClarificationMetaPayload = {
  roundsCompleted?: number;
  requestedRound?: FollowupRound;
  lockedAmbiguityType?: AmbiguityType | null;
};

type PipelineInput = Partial<UserIntake> & {
  clarificationMeta?: ClarificationMetaPayload;
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
  const affinityBridge = runAffinityPipelineBridge({ intake });
  const profiles = runTDM(signals, affinityBridge.affinityScores);
  const transitionAssessment = runLTE(intake);
  const plausibleDirections = runSEL(profiles, affinityBridge.familyScores);
  const actionVectors = runAVE(plausibleDirections, transitionAssessment);

  const finalReading = buildFinalReading({
    intake,
    signals,
    profiles,
    transitionAssessment,
    plausibleDirections,
    actionVectors,
    familyScores: affinityBridge.familyScores,
    clarificationMeta,
  });

  /**
   * Capa 1: aprendizaje diagnóstico.
   *
   * Compara el caso actual contra casos aprendidos.
   * No reemplaza el diagnóstico principal: aporta memoria y auditoría.
   */
  const learningInputText = buildLearningInputText(rawInput, intake);

  const similarCases = findSimilarLearnedCases(learningInputText, undefined, {
    minSimilarity: 0.08,
    limit: 5,
  });

  const learningSignal = buildLearningSignal(
    similarCases,
    finalReading.corePattern,
  );

  /**
   * Capa 2: juzgado de jueces diagnósticos.
   *
   * Revisa coherencia entre:
   * - resultado principal
   * - ranking familiar
   * - casos similares
   * - aprendizaje histórico
   * - lenguaje humano detectado
   */
  const diagnosticReview = runDiagnosticJudgeEngine({
    intake,
    finalReading,
    familyScores: affinityBridge.familyScores ?? [],
    affinityScores: affinityBridge.affinityScores ?? [],
    similarCases,
    learningSignal,
  });

  /**
   * Capa 3: cirujano de experiencia diagnóstica.
   *
   * No decide el diagnóstico.
   * Extrae qué enseñanza parcial o total puede dejar este caso:
   * - regla de frontera
   * - contrapeso
   * - advertencia de mala lectura
   * - marcador contextual
   */
  const rawExperienceDistillation = runDiagnosticExperienceDistiller({
    sourceInput: {
      rawInput,
      intake,
    },
    finalReading,
    learningSignal,
    diagnosticReview,
  });

  /**
   * Capa 4: juez contextual de situación.
   *
   * Mira el caso desde arriba:
   * - situación vital
   * - restricciones
   * - activos
   * - fuerzas contextuales
   * - riesgo de mala lectura por palabras aisladas
   */
  const contextualSituationReview = runContextualSituationJudge({
    intake,
    finalReading,
    familyScores: affinityBridge.familyScores ?? [],
    affinityScores: affinityBridge.affinityScores ?? [],
    similarCases,
    learningSignal,
    diagnosticReview,
    experienceDistillation: rawExperienceDistillation,
  });

  /**
   * Capa 5: huella obligatoria de aprendizaje.
   *
   * Garantiza que todo caso deje al menos:
   * - traza de calibración
   * - tipo de huella
   * - fuerza de influencia
   * - enseñanza mínima
   * - familias involucradas
   *
   * Regla madre:
   * guardar ampliamente, influir selectivamente.
   */
  const experienceDistillation = ensureDiagnosticLearningTrace(
    rawExperienceDistillation,
    {
      finalReading,
      diagnosticReview,
      contextualSituationReview,
      similarCases,
      learningSignal,
    },
  );

  const diagnosticCaseStatistics = buildDiagnosticCaseStatistics({
    sourceInput: {
      rawInput,
      intake,
    },
    finalReading,
    familyScores: affinityBridge.familyScores ?? [],
    affinityScores: affinityBridge.affinityScores ?? [],
    similarCases,
    learningSignal,
    diagnosticReview,
    experienceDistillation,
    contextualSituationReview,
  });

  /**
   * Puente explícito hacia frontend.
   *
   * El resultado público recibe:
   * - familyScores
   * - affinityScores
   * - learningSignal
   * - similarCases
   * - diagnosticReview
   * - experienceDistillation
   * - contextualSituationReview
   */
  const finalReadingWithDiagnosticBridge = {
    ...finalReading,
    familyScores: affinityBridge.familyScores ?? [],
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

    experienceDistillation,
    diagnosticExperienceDistillation: experienceDistillation,
    diagnosticSurgery: experienceDistillation,
    learningDistillation: experienceDistillation,

    contextualSituationReview,
    contextualSituationJudge: contextualSituationReview,
    contextualReview: contextualSituationReview,
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