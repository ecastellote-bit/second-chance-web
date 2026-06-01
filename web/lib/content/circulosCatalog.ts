export type CircleStatus = "activo" | "nuevo" | "muy_activo" | "proximo_encuentro";

export type CircleItem = {
  id: string;
  title: string;
  description: string;
  status: CircleStatus;
  members: number;
  online: number;
  image: string;
  /** Iniciales para avatares de muestra */
  avatars: string[];
};

export const CIRCULOS_HEADER = {
  title: "Círculos del barrio",
  subtitle:
    "Espacios para encontrarte con otros alrededor de una búsqueda, una capacidad o una inquietud compartida.",
} as const;

export const CIRCLE_STATUS_LABEL: Record<CircleStatus, string> = {
  activo: "Activo",
  nuevo: "Nuevo",
  muy_activo: "Muy activo",
  proximo_encuentro: "Próximo encuentro",
};

export const CIRCULOS_CATALOG: CircleItem[] = [
  {
    id: "volver-a-escribir",
    title: "Volver a escribir",
    description: "Diarios, talleres y lecturas en voz baja — sin presión de publicar.",
    status: "muy_activo",
    members: 48,
    online: 6,
    image: "/vu/circulo-volver-a-escribir.png",
    avatars: ["ML", "JP", "AS", "RK"],
  },
  {
    id: "tecnologia-acompanado",
    title: "Aprender tecnología acompañado",
    description: "Caminar la tech sin quedar solo frente a la pantalla.",
    status: "activo",
    members: 72,
    online: 11,
    image: "/vu/circulo-tecnologia-acompanado.png",
    avatars: ["TC", "LV", "DM", "NF"],
  },
  {
    id: "impacto-social",
    title: "Proyectos con impacto social",
    description: "Armar ideas con otros y llevarlas al barrio con pasos reales.",
    status: "proximo_encuentro",
    members: 35,
    online: 4,
    image: "/vu/circulo-impacto-social.png",
    avatars: ["CG", "PM", "HO"],
  },
  {
    id: "reinicio-40",
    title: "Reinicio profesional 40+",
    description: "Transiciones con calma, sin compararte con quien empieza de cero.",
    status: "activo",
    members: 61,
    online: 8,
    image: "/vu/circulo-reinicio-40.png",
    avatars: ["MR", "SL", "EV", "KT"],
  },
  {
    id: "encuentros-presenciales",
    title: "Encuentros presenciales",
    description: "Cafés, caminatas y mesas redondas en la ciudad.",
    status: "proximo_encuentro",
    members: 29,
    online: 2,
    image: "/vu/circulo-encuentros-presenciales.png",
    avatars: ["FB", "AN", "JC"],
  },
  {
    id: "creatividad-cotidiana",
    title: "Creatividad cotidiana",
    description: "Manualidades, música y gestos chicos que sostienen el ánimo.",
    status: "nuevo",
    members: 18,
    online: 5,
    image: "/vu/circulo-creatividad-cotidiana.png",
    avatars: ["IL", "VR", "ZO"],
  },
  {
    id: "economia-solidaria",
    title: "Economía solidaria",
    description: "Trueque, cooperativas y formas de sostenerse entre pares.",
    status: "activo",
    members: 44,
    online: 7,
    image: "/vu/circulo-economia-solidaria.png",
    avatars: ["ES", "BR", "LM", "PQ"],
  },
  {
    id: "bienestar-equilibrio",
    title: "Bienestar y equilibrio",
    description: "Ritmos, límites y cuidado mutuo sin discurso clínico.",
    status: "muy_activo",
    members: 53,
    online: 9,
    image: "/vu/circulo-bienestar-equilibrio.png",
    avatars: ["WB", "GH", "TY", "UX"],
  },
];

/** Espacios sugeridos para explorar (semilla, no membresía) */
export const SUGERIDOS_IDS = ["reinicio-40", "creatividad-cotidiana", "impacto-social"];

export const COMMUNITY_NAV = [
  { id: "plaza", label: "Plaza", href: "/plaza", icon: "plaza" as const },
  { id: "circulos", label: "Círculos", href: "/circulos", icon: "circulos" as const },
  { id: "proyectos", label: "Proyectos", href: "/proyectos/manos-que-transforman", icon: "proyectos" as const },
  { id: "formacion", label: "Formación", href: "/formacion", icon: "formacion" as const },
  { id: "oportunidades", label: "Oportunidades", href: "/eventos", icon: "oportunidades" as const },
  { id: "eventos", label: "Eventos", href: "/eventos", icon: "eventos" as const },
] as const;
