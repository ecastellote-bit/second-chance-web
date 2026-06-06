import { TEAM_FOUNDER_CIRCLES } from "./teamFounderSeeds";

export type CircleStatus = "activo" | "nuevo" | "muy_activo" | "proximo_encuentro";

export type CircleItem = {
  id: string;
  title: string;
  description: string;
  status: CircleStatus;
  members?: number;
  online?: number;
  image: string;
  fallbackImage?: string;
  avatars?: string[];
  /** Etiqueta honesta para semillas del equipo */
  seedBadge?: string;
  /** CTA personalizado en detalle */
  interestCta?: string;
  isTeamSeed?: boolean;
};

export const CIRCULOS_HEADER = {
  title: "Círculos del barrio",
  subtitle: "Mesas en formación — entrá, mirá la mesa y marcá interés.",
} as const;

export const CIRCLE_STATUS_LABEL: Record<CircleStatus, string> = {
  activo: "Activo",
  nuevo: "Nuevo",
  muy_activo: "Muy activo",
  proximo_encuentro: "Próximo encuentro",
};

const TEAM_CIRCLES: CircleItem[] = TEAM_FOUNDER_CIRCLES.map((c) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  status: "nuevo" as const,
  image: c.image,
  fallbackImage: c.fallbackImage,
  seedBadge: c.badge,
  interestCta: c.cta,
  isTeamSeed: true,
}));

/** Círculos ilustrativos del barrio — complemento, no actividad fingida */
const LEGACY_CIRCLES: CircleItem[] = [
  {
    id: "volver-a-escribir",
    title: "Volver a escribir",
    description: "Diarios, talleres y lecturas en voz baja — sin presión de publicar.",
    status: "nuevo",
    image: "/vu/circulo-volver-a-escribir.png",
  },
  {
    id: "tecnologia-acompanado",
    title: "Aprender tecnología acompañado",
    description: "Caminar la tech sin quedar solo frente a la pantalla.",
    status: "nuevo",
    image: "/vu/circulo-tecnologia-acompanado.png",
  },
  {
    id: "impacto-social",
    title: "Proyectos con impacto social",
    description: "Armar ideas con otros y llevarlas al barrio con pasos reales.",
    status: "proximo_encuentro",
    image: "/vu/circulo-impacto-social.png",
  },
  {
    id: "creatividad-cotidiana",
    title: "Creatividad cotidiana",
    description: "Manualidades, música y gestos chicos que sostienen el ánimo.",
    status: "nuevo",
    image: "/vu/circulo-creatividad-cotidiana.png",
  },
];

export const CIRCULOS_CATALOG: CircleItem[] = [...TEAM_CIRCLES, ...LEGACY_CIRCLES];

/** Espacios sugeridos para explorar (semilla, no membresía) */
export const SUGERIDOS_IDS = [
  "empezar-de-nuevo",
  "comunicacion-radio-escritura",
  "emprender-sin-hacerlo-solo",
];

export const COMMUNITY_NAV = [
  { id: "plaza", label: "Plaza", href: "/plaza", icon: "plaza" as const },
  { id: "circulos", label: "Círculos", href: "/circulos", icon: "circulos" as const },
  { id: "proyectos", label: "Proyectos", href: "/proyectos/radio-second-chance", icon: "proyectos" as const },
  { id: "formacion", label: "Formación", href: "/formacion", icon: "formacion" as const },
  { id: "oportunidades", label: "Oportunidades", href: "/eventos", icon: "oportunidades" as const },
  { id: "eventos", label: "Eventos", href: "/eventos", icon: "eventos" as const },
] as const;
