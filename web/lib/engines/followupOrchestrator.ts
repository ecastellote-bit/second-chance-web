import type { ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import type { ResultType, TransitionAssessment } from "../types/result";
import type {
  AmbiguityType,
  FollowupPack,
  FollowupRound,
} from "../types/followup";
import {
  assessAmbiguity,
  type AmbiguityAssessment,
} from "./ambiguityEngine";
import { getFollowupPack } from "./followupQuestionBank";

export type AdjudicationSource =
  | "none"
  | "initial_clear"
  | "after_round_2"
  | "after_round_3"
  | "after_round_3_forced";

export type FollowupOrchestratorInput = {
  resultType: ResultType;
  profiles: ProbableProfile[];
  signals: DetectedSignal[];
  transitionAssessment?: TransitionAssessment;
  requestedRound?: FollowupRound;
  lockedAmbiguityType?: AmbiguityType | null;

  /**
   * Cantidad de rondas de clarificación ya completadas.
   * 0 = ninguna todavía
   * 1 = ya respondió Ronda 2
   * 2 = ya respondió Ronda 2 y Ronda 3
   */
  roundsCompleted?: number;
};

export type FollowupOrchestratorResult = {
  shouldAskFollowup: boolean;
  shouldForceAdjudication: boolean;
  round: FollowupRound | null;
  ambiguityType: AmbiguityType | null;
  pack: FollowupPack | null;
  assessment: AmbiguityAssessment;
  completedRounds: number;
  adjudicationSource: AdjudicationSource;
  canAskAnotherRound: boolean;
  status:
    | "no_followup_needed"
    | "round_ready"
    | "no_pack_available"
    | "round_not_allowed"
    | "forced_adjudication_required";
  reason: string;
};

function buildFallbackAssessment(
  input: FollowupOrchestratorInput,
): AmbiguityAssessment {
  return assessAmbiguity({
    resultType: input.resultType,
    profiles: input.profiles,
    signals: input.signals,
    transitionAssessment: input.transitionAssessment,
  });
}

function getCompletedRounds(input: FollowupOrchestratorInput): number {
  const raw = input.roundsCompleted ?? 0;

  if (!Number.isFinite(raw)) return 0;
  if (raw <= 0) return 0;
  if (raw >= 2) return 2;

  return 1;
}

function resolveAdjudicationSource(
  completedRounds: number,
  shouldForceAdjudication: boolean,
): AdjudicationSource {
  if (shouldForceAdjudication && completedRounds >= 2) {
    return "after_round_3_forced";
  }

  if (completedRounds >= 2) {
    return "after_round_3";
  }

  if (completedRounds === 1) {
    return "after_round_2";
  }

  return "initial_clear";
}

function resolveRound(
  input: FollowupOrchestratorInput,
  assessment: AmbiguityAssessment,
  completedRounds: number,
): FollowupRound | null {
  if (!assessment.needsFollowupRound) return null;

  /**
   * Regla dura de máquina de estados:
   * - 0 rondas completas -> Ronda 2
   * - 1 ronda completa   -> Ronda 3
   * - 2 rondas completas -> no más preguntas
   */
  if (completedRounds <= 0) {
    return 2;
  }

  if (completedRounds === 1) {
    return 3;
  }

  return null;
}

function resolveAmbiguityType(
  input: FollowupOrchestratorInput,
  assessment: AmbiguityAssessment,
  round: FollowupRound | null,
): AmbiguityType | null {
  if (!round) return null;

  if (input.lockedAmbiguityType) {
    return input.lockedAmbiguityType;
  }

  if (assessment.ambiguityType) {
    return assessment.ambiguityType;
  }

  return "weak_signal_general";
}

export function buildFollowupOrchestration(
  input: FollowupOrchestratorInput,
): FollowupOrchestratorResult {
  const assessment = buildFallbackAssessment(input);
  const completedRounds = getCompletedRounds(input);

  /**
   * Caso 1:
   * La lectura ya no necesita followup.
   * Esto incluye:
   * - lectura clara inicial
   * - lectura clara después de Ronda 2
   * - lectura clara después de Ronda 3
   */
  if (!assessment.needsFollowupRound) {
    return {
      shouldAskFollowup: false,
      shouldForceAdjudication: false,
      round: null,
      ambiguityType: null,
      pack: null,
      assessment,
      completedRounds,
      adjudicationSource: resolveAdjudicationSource(
        completedRounds,
        false,
      ),
      canAskAnotherRound: completedRounds < 2,
      status: "no_followup_needed",
      reason:
        completedRounds === 0
          ? "La lectura inicial ya alcanza para una conclusión defendible sin ronda extra."
          : completedRounds === 1
            ? "La Ronda 2 ya aportó evidencia suficiente para cerrar o acotar bien la lectura."
            : "La evidencia adicional ya alcanzó para cerrar sin pedir más rondas.",
    };
  }

  /**
   * Caso 2:
   * Sigue habiendo ambigüedad, pero ya se agotaron Ronda 2 y Ronda 3.
   * Acá no puede seguir devolviendo loops.
   * Hay que forzar adjudicación.
   */
  if (completedRounds >= 2) {
    return {
      shouldAskFollowup: false,
      shouldForceAdjudication: true,
      round: null,
      ambiguityType: assessment.ambiguityType,
      pack: null,
      assessment,
      completedRounds,
      adjudicationSource: "after_round_3_forced",
      canAskAnotherRound: false,
      status: "forced_adjudication_required",
      reason:
        "La lectura sigue ambigua incluso después de Ronda 2 y Ronda 3. Ya no corresponde abrir más rondas: conviene cerrar con la mejor lectura posible y confianza acotada.",
    };
  }

  const round = resolveRound(input, assessment, completedRounds);

  if (!round) {
    return {
      shouldAskFollowup: false,
      shouldForceAdjudication: false,
      round: null,
      ambiguityType: assessment.ambiguityType,
      pack: null,
      assessment,
      completedRounds,
      adjudicationSource: "none",
      canAskAnotherRound: completedRounds < 2,
      status: "round_not_allowed",
      reason:
        "La lectura necesita clarificación, pero no se pudo resolver una ronda válida dentro del estado actual del proceso.",
    };
  }

  const ambiguityType = resolveAmbiguityType(input, assessment, round);
  const pack = ambiguityType ? getFollowupPack(ambiguityType, round) : null;

  /**
   * Si falta el pack de Ronda 3, tampoco vamos a quedar en loop:
   * obligamos adjudicación con lo reunido hasta acá.
   */
  if (!pack && round === 3) {
    return {
      shouldAskFollowup: false,
      shouldForceAdjudication: true,
      round: null,
      ambiguityType,
      pack: null,
      assessment,
      completedRounds,
      adjudicationSource: "after_round_3_forced",
      canAskAnotherRound: false,
      status: "forced_adjudication_required",
      reason:
        "La lectura necesitaba una Ronda 3, pero no existe un paquete cargado para esa ambigüedad. En vez de dejar el flujo bloqueado, conviene cerrar con la mejor evidencia disponible.",
    };
  }

  if (!pack) {
    return {
      shouldAskFollowup: false,
      shouldForceAdjudication: false,
      round,
      ambiguityType,
      pack: null,
      assessment,
      completedRounds,
      adjudicationSource: "none",
      canAskAnotherRound: true,
      status: "no_pack_available",
      reason:
        "La ambigüedad fue detectada, pero todavía no existe un paquete de preguntas cargado para esa ronda.",
    };
  }

  return {
    shouldAskFollowup: true,
    shouldForceAdjudication: false,
    round,
    ambiguityType,
    pack,
    assessment,
    completedRounds,
    adjudicationSource: "none",
    canAskAnotherRound: round === 2,
    status: "round_ready",
    reason:
      round === 2
        ? "La lectura necesita una Ronda 2 para separar mejor dos direcciones posibles."
        : "Una última aclaración (Ronda 3) ayuda a distinguir cuál pesa más, sin forzar una etiqueta cerrada.",
  };
}