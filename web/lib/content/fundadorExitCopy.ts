/** Copy modal defensivo de salida — sin tono culposo. */

export type FounderExitFeedbackOptionId =
  | "unclear"
  | "no_time"
  | "want_look_first"
  | "low_trust"
  | "too_long"
  | "uncomfortable"
  | "just_browsing";

export const FUNDADOR_EXIT_COPY = {
  title: "Antes de irte, marcá una señal.",
  subtitle: "¿Qué te faltó para dar el siguiente paso?",
  freeTextLabel: "¿Querés contarnos con tus palabras qué te frenó?",
  freeTextPlaceholder: "Escribí brevemente qué te hizo salir o qué no terminó de cerrar…",
  emptyFeedbackError: "Marcá una opción o escribí una breve señal antes de enviar.",
  submitAndLeave: "Enviar y salir",
  trySixty: "Hacer mi lectura inicial",
  seeProjects: "Ver proyectos",
  options: [
    { id: "unclear" as const, label: "No entendí bien de qué se trata" },
    { id: "no_time" as const, label: "No tengo tiempo ahora" },
    { id: "want_look_first" as const, label: "Quiero mirar antes de empezar" },
    { id: "low_trust" as const, label: "No me generó confianza suficiente" },
    { id: "too_long" as const, label: "Me pareció largo" },
    { id: "uncomfortable" as const, label: "Me incomodó un poco" },
    { id: "just_browsing" as const, label: "Sólo estaba curioseando" },
  ],
} as const;

export const FOUNDER_EXIT_TEXT_MAX = 500;
export const FOUNDER_EXIT_BODY_MAX_BYTES = 4096;

export type FounderExitSubmitMode = "option_only" | "text_only" | "option_and_text";

export function resolveFounderExitSubmitMode(
  selectedOption: FounderExitFeedbackOptionId | null,
  freeText: string | null,
): FounderExitSubmitMode {
  const hasOption = Boolean(selectedOption);
  const hasText = Boolean(freeText?.trim());
  if (hasOption && hasText) return "option_and_text";
  if (hasText) return "text_only";
  return "option_only";
}
