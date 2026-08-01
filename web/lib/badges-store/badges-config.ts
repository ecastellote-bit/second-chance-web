export const BADGES_CONFIG = [
  {
    slug: "primer_paso",
    name: "Primer paso",
    description: "Descubriste tu dirección vocacional completando el diagnóstico",
    icon: "🎯",
    condition: "diagnostico_completado",
  },
  {
    slug: "te_presentaste",
    name: "Te presentaste al mundo",
    description: "Hiciste público tu perfil para que otros te encuentren",
    icon: "🌎",
    condition: "perfil_publico",
  },
  {
    slug: "conector",
    name: "Conector",
    description: "Iniciaste tu primera conversación con alguien del directorio",
    icon: "💬",
    condition: "primer_mensaje",
  },
  {
    slug: "visionario",
    name: "Visionario",
    description: "Creaste tu primer proyecto colaborativo y lo pusiste en marcha",
    icon: "🚀",
    condition: "primer_proyecto",
  },
  {
    slug: "en_accion",
    name: "En acción",
    description: "Te postulaste a un proyecto o compartiste tu voz en la comunidad",
    icon: "⚡",
    condition: "primera_accion",
  },
] as const;

export type BadgeConfig = (typeof BADGES_CONFIG)[number];
export type BadgeSlug = BadgeConfig["slug"];
export type BadgeCondition = BadgeConfig["condition"];

export function findBadgeByCondition(
  condition: string,
): BadgeConfig | undefined {
  return BADGES_CONFIG.find((b) => b.condition === condition);
}

export function findBadgeBySlug(slug: string): BadgeConfig | undefined {
  return BADGES_CONFIG.find((b) => b.slug === slug);
}
