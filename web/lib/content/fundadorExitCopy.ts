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
  freeTextPlaceholder: "Opcional — una línea alcanza.",
  submitAndLeave: "Enviar y salir",
  trySixty: "Probar 60 segundos",
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
