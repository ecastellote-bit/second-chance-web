import type { UserIntake } from "../types/intake";
import type { ProbableProfile } from "../types/profiles";
import type { ResultType } from "../types/result";
import type {
  TransitionMode,
  TransitionRecommendationBlock,
} from "../types/finalDiagnostic";

type TransitionRecommendationInput = {
  intake: UserIntake;
  dominantProfile: ProbableProfile | null | undefined;
  resultType: ResultType;
};

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function getRestrictionCount(intake: UserIntake): number {
  return intake.currentContext.restrictions?.length ?? 0;
}

function buildRecommendation(
  mode: TransitionMode,
  headline: string,
  explanation: string,
  rationale: string
): TransitionRecommendationBlock {
  return {
    mode,
    headline,
    explanation,
    rationale,
  };
}

export function buildTransitionRecommendation(
  input: TransitionRecommendationInput
): TransitionRecommendationBlock {
  const profileId = input.dominantProfile?.id;
  const restrictionCount = getRestrictionCount(input.intake);
  const hasCompressionNarrative = hasText(
    input.intake.narrative.whatFeelsCompressedNow
  );

  if (input.resultType === "insufficient_evidence" || !profileId) {
    return buildRecommendation(
      "needs_confirmation",
      "Antes de moverte, conviene confirmar mejor la dirección.",
      "Todavía hay señales útiles, pero no suficiente nitidez como para recomendar una transición fuerte o una redefinición importante. Lo más sano ahora no es forzar una identidad nueva, sino confirmar mejor el patrón dominante con más evidencia.",
      "No hay todavía una dirección suficientemente consolidada como para convertirla en movimiento serio."
    );
  }

  if (input.resultType === "compressed_life") {
    return buildRecommendation(
      "compressed_but_clear",
      "La dirección aparece, pero hoy no conviene empujar un salto fuerte.",
      "No parece faltar dirección. Lo que falta es margen real. La recomendación más sensata no es un giro abrupto, sino empezar a proteger, nombrar y validar esa línea dominante mientras seguís sosteniendo el contexto actual.",
      "Hay patrón claro, pero también señales fuertes de compresión, restricciones y uso defensivo de la capacidad dominante."
    );
  }

  if (restrictionCount >= 3 && hasCompressionNarrative) {
    return buildRecommendation(
      "not_ready_to_move",
      "La dirección puede ser válida, pero hoy el contexto todavía no acompaña un movimiento grande.",
      "Aunque ya aparece una línea dominante, el contexto actual sigue demasiado cargado como para recomendar una transición fuerte. Lo más inteligente es bajar ruido, proteger energía y abrir pequeñas pruebas antes de mover la estructura principal.",
      "La dirección existe, pero el margen real todavía no es suficiente para una transición más ambiciosa."
    );
  }

  if (
    profileId === "technical_builder" ||
    profileId === "diplomatic_social_connector" ||
    profileId === "community_builder"
  ) {
    return buildRecommendation(
      "gradual_lateral",
      "La transición más sensata parece ser lateral y gradual.",
      "Tu perfil dominante ya tiene aplicación concreta y reconocible. No hace falta una reinvención total para empezar a moverte: lo más razonable es buscar una transición progresiva hacia funciones más alineadas con tu patrón central.",
      "La dirección es suficientemente clara y compatible con movimientos laterales o reubicaciones graduales."
    );
  }

  if (
    profileId === "analytical_strategist" ||
    profileId === "creative_storyteller" ||
    profileId === "cultural_explorer" ||
    profileId === "empathic_guide"
  ) {
    return buildRecommendation(
      "guided_repositioning",
      "La transición más inteligente parece ser una reubicación guiada, no un salto ciego.",
      "Tu dirección dominante ya aparece, pero para desplegarla bien no alcanza con moverte por impulso. Conviene traducirla a contextos, funciones y pruebas concretas para que la transición no quede en una intuición linda pero vacía.",
      "Hay dirección plausible, pero necesita mejor traducción práctica para convertirse en movimiento sostenible."
    );
  }

  return buildRecommendation(
    "gradual_lateral",
    "La transición recomendable es gradual y con validación.",
    "Ya hay una dirección bastante más clara que antes. No parece necesario empujar una reinvención total: conviene moverse paso a paso, validando en la práctica que el patrón dominante también se sostenga fuera del relato.",
    "La dirección ya es usable, pero todavía conviene moverla con criterio y no con ansiedad."
  );
}