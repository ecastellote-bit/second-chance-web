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

export function buildFinalReading(input: OrchestratorInput): FinalReading {
  const decision = evaluateResultDecision(input);
  const resultType = decision.resultType;
  const topProfile = input.profiles[0];

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
        topProfile?.summary ??
        "Todavía no hay un hilo conductor suficientemente sostenido para organizar una lectura fuerte.",
      tensiones: input.transitionAssessment.summary,
      direccion:
        input.plausibleDirections.length > 0
          ? `Las direcciones más plausibles hoy son ${input.plausibleDirections
              .map((direction) => direction.label)
              .join(" y ")}.`
          : "Todavía no conviene forzar una dirección específica.",
      action:
        input.actionVectors[0]?.description ??
        "El siguiente paso correcto es ampliar evidencia antes de mover demasiado.",
      camino_minimo:
        input.actionVectors[0]?.microActions[0] ??
        "Volver a entrar al sistema con más historia, más matices y más contexto.",
      cierre:
        resultType === "clear_direction"
          ? "No hace falta romper todo ahora. Hace falta probar bien."
          : resultType === "compressed_life"
            ? "Antes de exigir claridad total, hay que recuperar espacio interno y margen de maniobra."
            : "Más evidencia ahora vale más que una conclusión linda pero falsa.",
    },
  };
}