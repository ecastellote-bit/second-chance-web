import type { UserIntake } from "../types/intake";
import type { EmployabilityDirection, ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type {
  ActionVector,
  CommunityRoutingRecommendation,
  FinalReading,
  ResultType,
  TransitionAssessment,
} from "../types/result";
import { toDiagnosticProfileSnapshot } from "../types/finalDiagnostic";
import { buildValueGeneration } from "./valueGenerationEngine";
import { buildCurrentMisalignment } from "./misalignmentEngine";
import { buildBestWorkContexts } from "./workContextEngine";
import { buildMisreadRisk } from "./misreadRiskEngine";
import { buildTransitionRecommendation } from "./transitionRecommendationEngine";
import { evaluateResultDecision } from "./resultDecision";

type OrchestratorInput = {
  intake: UserIntake;
  signals: DetectedSignal[];
  profiles: ProbableProfile[];
  transitionAssessment: TransitionAssessment;
  plausibleDirections: EmployabilityDirection[];
  actionVectors: ActionVector[];
};

function decideCommunityRouting(
  resultType: ResultType,
): CommunityRoutingRecommendation {
  if (resultType === "compressed_life") return "cohort_candidate";
  if (resultType === "insufficient_evidence") return "reentry_first";
  return "discord_recommended";
}

function resolveSeverity(
  resultType: ResultType,
  transitionAssessment: TransitionAssessment,
): "low" | "medium" | "high" {
  if (
    resultType === "compressed_life" ||
    transitionAssessment.transitionMargin === "minimal"
  ) {
    return "high";
  }

  if (
    resultType === "insufficient_evidence" ||
    transitionAssessment.transitionMargin === "narrow"
  ) {
    return "medium";
  }

  return "low";
}

function resolveFunctionalSubtype(
  profile: ProbableProfile | null | undefined,
): string {
  switch (profile?.id) {
    case "diplomatic_social_connector":
      return "institutional_articulator";
    case "community_builder":
      return "community_orchestrator";
    case "analytical_strategist":
      return "strategic_pattern_reader";
    case "creative_storyteller":
      return "narrative_message_builder";
    case "technical_builder":
      return "operational_system_solver";
    case "cultural_explorer":
      return "cultural_context_reader";
    case "empathic_guide":
      return "human_process_guide";
    default:
      return "undetermined";
  }
}

function buildNextMoveBlock(
  actionVectors: ActionVector[],
  resultType: ResultType,
) {
  const firstVector = actionVectors[0];

  const transitionMode =
    resultType === "compressed_life"
      ? "compressed_but_clear"
      : resultType === "insufficient_evidence"
        ? "needs_confirmation"
        : "guided_repositioning";

  if (!firstVector) {
    return {
      title: "Próximo movimiento",
      headline: "Todavía no conviene mover demasiado",
      summary:
        resultType === "insufficient_evidence"
          ? "Primero hace falta ampliar evidencia real antes de definir una dirección fuerte."
          : "Conviene avanzar con un movimiento pequeño, concreto y reversible.",
      transitionMode,
      items: [
        "Agregar más historia real al intake",
        "Nombrar mejor qué se repite y qué drena",
        "Volver a correr el sistema con más matices",
      ],
    };
  }

  return {
    title: "Próximo movimiento",
    headline: firstVector.label,
    summary: firstVector.description,
    transitionMode,
    items:
      firstVector.microActions?.length > 0
        ? firstVector.microActions
        : ["Hacer un primer movimiento pequeño y verificable"],
  };
}

function buildFallbackTrace(input: OrchestratorInput, resultType: ResultType) {
  const topProfile = input.profiles[0] ?? null;
  const secondProfile = input.profiles[1] ?? null;

  return {
    signalCount: input.signals.length,
    signalKeys: input.signals.map((signal) => signal.key),
    topProfileLabel: topProfile?.label ?? null,
    topProfileConfidence: topProfile?.confidence ?? null,
    secondProfileLabel: secondProfile?.label ?? null,
    secondProfileConfidence: secondProfile?.confidence ?? null,
    plausibleDirectionLabels: input.plausibleDirections.map(
      (direction) => direction.label,
    ),
    transitionMargin: input.transitionAssessment.transitionMargin,
    hasCompressionNarrative: Boolean(
      input.intake?.narrative?.whatFeelsCompressedNow?.trim(),
    ),
    decisionReason: "ORCHESTRATOR_FALLBACK_TRACE",
    resultTypePreview: resultType,
  };
}

export function buildFinalReading(input: OrchestratorInput): FinalReading {
  const decision = evaluateResultDecision(input);
  const resultType = decision.resultType;
  const topProfile = input.profiles[0] ?? null;
  const secondProfile = input.profiles[1] ?? null;

  const valueGeneration = buildValueGeneration({
    intake: input.intake,
    dominantProfile: topProfile,
    signals: input.signals,
  });

  const currentMisalignment = buildCurrentMisalignment({
    intake: input.intake,
    dominantProfile: topProfile,
    signals: input.signals,
    resultType,
  });

  const bestWorkContexts = buildBestWorkContexts({
    intake: input.intake,
    dominantProfile: topProfile,
    signals: input.signals,
    resultType,
  });

  const misreadRisk = buildMisreadRisk({
    dominantProfile: topProfile,
    secondaryProfile: secondProfile,
    signals: input.signals,
    resultType,
  });

  const transitionRecommendation = buildTransitionRecommendation({
    intake: input.intake,
    dominantProfile: topProfile,
    resultType,
  });

  const nextMove = buildNextMoveBlock(input.actionVectors, resultType);

  const finalDiagnostic = {
    severity: resolveSeverity(resultType, input.transitionAssessment),
    functionalSubtype: resolveFunctionalSubtype(topProfile),
    profileSnapshot: toDiagnosticProfileSnapshot(topProfile),
    valueGeneration,
    currentMisalignment,
    bestWorkContexts,
    misreadRisk,
    transitionRecommendation,
    nextMove,
  };

  const directionsText =
    input.plausibleDirections.length > 0
      ? `Las direcciones más plausibles hoy son ${input.plausibleDirections
          .map((direction) => direction.label)
          .join(" y ")}.`
      : "Todavía no conviene forzar una dirección específica.";

  const actionText =
    transitionRecommendation.summary ??
    input.actionVectors[0]?.description ??
    "El siguiente paso correcto es ampliar evidencia antes de mover demasiado.";

  const minimalPath =
    nextMove.items?.[0] ??
    input.actionVectors[0]?.microActions?.[0] ??
    "Volver a entrar al sistema con más historia, más matices y más contexto.";

  const trace =
    (decision as { trace?: unknown })?.trace ??
    buildFallbackTrace(input, resultType);

  return {
    resultType,
    corePattern:
      topProfile?.label ??
      "Todavía no aparece un patrón dominante suficientemente claro.",
    dominantTension:
      resultType === "compressed_life"
        ? "La vida actual parece más comprimida que alineada."
        : resultType === "insufficient_evidence"
          ? "La evidencia todavía no alcanza para afirmar una dirección seria."
          : "Hay una dirección plausible, pero debe probarse contra la realidad.",
    currentCost:
      input.transitionAssessment.transitionMargin === "minimal"
        ? "El costo actual de mover demasiado es alto."
        : "El costo actual permite movimientos graduales si se sostienen con criterio.",
    plausibleDirections: input.plausibleDirections,
    actionVectors: input.actionVectors,
    transitionAssessment: input.transitionAssessment,
    supportingProfiles: input.profiles,
    detectedSignals: input.signals,
    communityRouting: decideCommunityRouting(resultType),
    summaryForUser: {
      diagnostico:
        resultType === "clear_direction"
          ? "Aparece una dirección plausible con señales repetidas y compatibles."
          : resultType === "compressed_life"
            ? "No aparece todavía una vocación nítida; aparece una vida comprimida por el presente."
            : "La lectura todavía no tiene evidencia suficiente para afirmar una dirección sin inventar.",
      hilo_conductor:
        valueGeneration.summary ??
        topProfile?.summary ??
        "Todavía no hay un hilo conductor suficientemente sostenido para organizar una lectura fuerte.",
      tensiones:
        currentMisalignment.summary ?? input.transitionAssessment.summary,
      direccion: directionsText,
      action: actionText,
      camino_minimo: minimalPath,
      cierre:
        resultType === "clear_direction"
          ? "No hace falta romper todo ahora. Hace falta probar bien."
          : resultType === "compressed_life"
            ? "Antes de exigir claridad total, hay que recuperar espacio interno y margen de maniobra."
            : "Más evidencia ahora vale más que una conclusión linda pero falsa.",
    },
    finalDiagnostic,
    trace,
  };
}