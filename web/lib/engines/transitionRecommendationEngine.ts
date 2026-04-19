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

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getRestrictions(intake: UserIntake): string[] {
  return intake.currentContext?.restrictions ?? [];
}

function getSituation(intake: UserIntake): string {
  return intake.currentContext?.currentSituation ?? "";
}

function detectCompression(intake: UserIntake): boolean {
  const restrictions = getRestrictions(intake).join(" ");
  const situation = getSituation(intake);
  const haystack = normalizeText(`${restrictions} ${situation}`);

  const markers = [
    "no puedo resignar ingresos",
    "no puedo dejar ingresos",
    "necesito sostener facturacion",
    "necesito sostener facturación",
    "muy poco margen",
    "casi toda mi energia se va",
    "casi toda mi energía se va",
    "sostener funcionamiento inmediato",
    "transicion caotica",
    "transición caótica",
    "responsabilidades",
    "no puedo mover demasiadas cosas a la vez",
  ];

  return markers.some((marker) => haystack.includes(normalizeText(marker)));
}

function resolveTransitionMode(
  input: TransitionRecommendationInput,
): TransitionMode {
  const { resultType, intake } = input;

  if (resultType === "compressed_life") {
    return "compressed_but_clear";
  }

  if (resultType === "insufficient_evidence") {
    return "needs_confirmation";
  }

  if (detectCompression(intake)) {
    return "gradual_lateral";
  }

  return "guided_repositioning";
}

function buildSummary(
  resultType: ResultType,
  mode: TransitionMode,
  profileLabel: string,
): string {
  if (resultType === "compressed_life") {
    return `La dirección aparece y tiene sentido, pero hoy no conviene exigirle una expansión fuerte. Primero hay que recuperar margen para que el patrón ${profileLabel} deje de operar apretado por el presente.`;
  }

  if (resultType === "insufficient_evidence") {
    return `Todavía no conviene hacer un movimiento grande. Antes de reposicionarte, hace falta confirmar mejor cuál es tu patrón dominante y separarlo de lo que hoy hacés por adaptación o contexto.`;
  }

  if (mode === "gradual_lateral") {
    return `La dirección es plausible, pero conviene moverse de forma lateral, protegida y acumulativa. No parece el momento de un salto brusco, sino de una transición cuidada.`;
  }

  return `La dirección aparece con base suficiente como para empezar un reposicionamiento guiado. No hace falta romper todo ahora; hace falta empezar a moverte con foco y contraste con la realidad.`;
}

function buildRationale(
  resultType: ResultType,
  mode: TransitionMode,
  profileLabel: string,
): string {
  if (resultType === "compressed_life") {
    return `No parece faltar señal. Lo que falta es aire. El patrón ${profileLabel} ya se deja ver, pero el presente todavía lo mantiene comprimido y funcionando por debajo de su nivel.`;
  }

  if (resultType === "insufficient_evidence") {
    return `Ya hay hipótesis valiosas, pero todavía no una separación lo bastante firme entre el patrón principal y sus perfiles vecinos como para justificar una decisión seria.`;
  }

  if (mode === "gradual_lateral") {
    return `La lectura ya permite ver dirección, pero las restricciones actuales piden una transición protegida, con pruebas pequeñas y acumulativas en vez de un cambio total.`;
  }

  return `La combinación entre patrón dominante, tensiones actuales y direcciones plausibles ya da base suficiente para empezar una transición con más intención y menos improvisación.`;
}

function buildFirstMoves(
  resultType: ResultType,
  mode: TransitionMode,
  profileLabel: string,
): string[] {
  if (resultType === "compressed_life") {
    return [
      "Reducí una fuente concreta de sobrecarga para recuperar un poco de margen real.",
      `Probá una versión pequeña, lateral y verificable del patrón ${profileLabel}.`,
      "No te exijas un cambio completo todavía; exigite una prueba seria y bien delimitada.",
    ];
  }

  if (resultType === "insufficient_evidence") {
    return [
      "Volvé a entrar con más historia real, más matices y más ejemplos concretos.",
      "Agregá evidencia sobre lo que repetís cuando rendís mejor.",
      "Evitá decisiones grandes hasta que el patrón se separe con más claridad.",
    ];
  }

  if (mode === "gradual_lateral") {
    return [
      "Diseñá una prueba lateral de bajo riesgo alineada con tu patrón dominante.",
      `Traducí el patrón ${profileLabel} a funciones de trabajo concretas y visibles.`,
      "Mové primero posicionamiento, lenguaje y experimentos; después estructura completa.",
    ];
  }

  return [
    `Traducí el patrón ${profileLabel} a un lenguaje laboral claro y verificable.`,
    "Elegí una dirección plausible y convertí esa hipótesis en una prueba concreta.",
    "Buscá validación externa antes de intentar un giro mayor.",
  ];
}

function buildWarnings(
  resultType: ResultType,
  mode: TransitionMode,
): string[] {
  if (resultType === "compressed_life") {
    return [
      "No confundas compresión presente con falta de dirección.",
      "No te exijas claridad total cuando todavía te falta margen real.",
    ];
  }

  if (resultType === "insufficient_evidence") {
    return [
      "No inventes una vocación cerrada solo para salir rápido de la duda.",
      "Más evidencia vale más que una conclusión prolija pero falsa.",
    ];
  }

  if (mode === "gradual_lateral") {
    return [
      "No conviertas una dirección válida en un salto desordenado.",
      "La velocidad incorrecta puede arruinar una lectura correcta.",
    ];
  }

  return [
    "La dirección parece plausible, pero todavía necesita contraste con la realidad.",
  ];
}

export function buildTransitionRecommendation(
  input: TransitionRecommendationInput,
): TransitionRecommendationBlock {
  const profileLabel =
    input.dominantProfile?.label ?? "patrón todavía no del todo estabilizado";

  const transitionMode = resolveTransitionMode(input);

  return {
    title: "Recomendación de transición",
    headline: "Cómo conviene moverse desde acá",
    transitionMode,
    summary: buildSummary(input.resultType, transitionMode, profileLabel),
    rationale: buildRationale(input.resultType, transitionMode, profileLabel),
    firstMoves: buildFirstMoves(
      input.resultType,
      transitionMode,
      profileLabel,
    ),
    warnings: buildWarnings(input.resultType, transitionMode),
  };
}