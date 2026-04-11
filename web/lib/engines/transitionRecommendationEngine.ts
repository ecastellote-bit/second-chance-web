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
    return `Hay patrón reconocible en ${profileLabel}, pero la transición hoy necesita recuperar margen antes de exigir expansión fuerte.`;
  }

  if (resultType === "insufficient_evidence") {
    return `Todavía no conviene hacer un movimiento grande. Primero hay que confirmar mejor el patrón dominante antes de reposicionarse.`;
  }

  if (mode === "gradual_lateral") {
    return `La dirección es plausible, pero conviene moverse por aproximaciones laterales y no con un salto brusco.`;
  }

  return `La dirección aparece con consistencia suficiente como para empezar un reposicionamiento guiado y concreto.`;
}

function buildRationale(
  resultType: ResultType,
  mode: TransitionMode,
  profileLabel: string,
): string {
  if (resultType === "compressed_life") {
    return `No falta señal. Falta aire. El patrón central (${profileLabel}) aparece, pero el presente todavía lo mantiene comprimido.`;
  }

  if (resultType === "insufficient_evidence") {
    return `El sistema detecta una hipótesis plausible, pero no una lectura lo bastante separada del segundo perfil como para justificar un movimiento serio.`;
  }

  if (mode === "gradual_lateral") {
    return `Hay dirección, pero las restricciones actuales piden una transición protegida, con pruebas pequeñas y acumulativas.`;
  }

  return `La combinación entre patrón dominante, tensión principal y direcciones plausibles permite empezar una transición con foco.`;
}

function buildFirstMoves(
  resultType: ResultType,
  mode: TransitionMode,
  profileLabel: string,
): string[] {
  if (resultType === "compressed_life") {
    return [
      `Reducir una fuente concreta de sobrecarga para recuperar margen real.`,
      `Probar una versión pequeña y lateral del patrón ${profileLabel}.`,
      `No exigir todavía un cambio completo; exigir una prueba seria.`,
    ];
  }

  if (resultType === "insufficient_evidence") {
    return [
      `Volver a entrar con más historia, más matices y más ejemplos concretos.`,
      `Agregar evidencia sobre lo que repetís cuando rendís mejor.`,
      `Evitar decisiones grandes hasta que el patrón se separe con más claridad.`,
    ];
  }

  if (mode === "gradual_lateral") {
    return [
      `Diseñar una prueba lateral de bajo riesgo alineada al patrón dominante.`,
      `Traducir el patrón ${profileLabel} a funciones concretas de trabajo.`,
      `Mover primero posicionamiento y experimentos; después estructura completa.`,
    ];
  }

  return [
    `Traducir el patrón ${profileLabel} a un lenguaje laboral claro.`,
    `Elegir una dirección plausible y convertirla en prueba concreta.`,
    `Construir validación externa antes de intentar un giro mayor.`,
  ];
}

function buildWarnings(
  resultType: ResultType,
  mode: TransitionMode,
): string[] {
  if (resultType === "compressed_life") {
    return [
      "No confundir compresión presente con falta de patrón.",
      "No forzar claridad total cuando todavía falta margen.",
    ];
  }

  if (resultType === "insufficient_evidence") {
    return [
      "No inventar una vocación cerrada solo para salir rápido de la duda.",
      "Más evidencia vale más que una conclusión elegante pero falsa.",
    ];
  }

  if (mode === "gradual_lateral") {
    return [
      "No convertir una dirección válida en un salto desordenado.",
      "La velocidad incorrecta puede arruinar una lectura correcta.",
    ];
  }

  return [
    "La dirección parece plausible, pero necesita contraste con la realidad.",
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