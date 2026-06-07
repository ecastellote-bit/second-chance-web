/** Copy conversión /fundador — hero, microgate, sticky (commit 1). */

export const FUNDADOR_HERO_COPY = {
  eyebrow: "VOCATIONUP · SECOND CHANCE",
  title: "No entraste por casualidad.",
  subtitle: "Algo de tu trabajo, tu etapa actual o tu camino ya no te cierra.",
  microcopy: "En 60 segundos podés saber si VocationUp tiene sentido para vos.",
  primaryCta: "Probar 60 segundos",
  secondaryCta: "Mirar proyectos y comunidad",
  trustChips: ["SIN COSTO", "SIN TARJETA", "60 SEG INICIAL", "PRIVADO"] as const,
  barrioSectionTitle: "Ya hay un barrio empezando a moverse",
  activitySectionTitle: "Actividad fundadora en movimiento",
  architectureTitle: "Una puerta, no un contenido",
  architectureLines: [
    "Lectura inicial orientadora",
    "Proyectos y mesas semilla",
    "Comunidad en formación",
  ] as const,
  alreadyHaveReadingCta: "Ya tengo mi lectura",
} as const;

export type FounderMicrogateOptionId =
  | "work_mismatch"
  | "postponed_dream"
  | "idea_no_partner"
  | "fresh_start"
  | "stuck_unknown"
  | "just_looking";

export const FUNDADOR_MICROGATE = {
  title: "¿Qué te trajo hasta acá?",
  subtitle: "Elegí lo que más se acerca — no se publica.",
  bridgeTitle: "Entonces no empieces de cero.",
  bridgeTitleAccent: "Empezá por ordenar eso.",
  bridgeSupport: "Tu respuesta no se publica. Sólo nos ayuda a orientarte mejor.",
  primaryCta: "Empezar mi lectura",
  secondaryCta: "Mirar el barrio primero",
  options: [
    {
      id: "work_mismatch" as const,
      label: "Mi trabajo ya no me representa",
    },
    {
      id: "postponed_dream" as const,
      label: "Siento que postergué algo mío",
    },
    {
      id: "idea_no_partner" as const,
      label: "Tengo una idea, pero no sé con quién moverla",
    },
    {
      id: "fresh_start" as const,
      label: "Quiero empezar algo distinto",
    },
    {
      id: "stuck_unknown" as const,
      label: "No sé qué quiero, pero sé que esto no va más",
    },
    {
      id: "just_looking" as const,
      label: "Sólo quiero mirar",
    },
  ],
} as const;

export const FUNDADOR_STICKY_NUDGE = {
  title: "Podés seguir mirando.",
  titleAccent: "O podés hacer una primera acción.",
  altLine: "Si algo te trajo hasta acá, no lo dejes pasar sin tocar una puerta.",
  primaryCta: "Probar 60 segundos",
  secondaryCta: "Mirar proyectos",
} as const;
