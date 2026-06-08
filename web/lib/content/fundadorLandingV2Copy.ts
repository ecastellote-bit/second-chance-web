/**
 * Copy y data registry — /fundador v2 (community-first).
 * Imágenes en /public/vu/incoming/ — reemplazables sin tocar componentes.
 */

/** Ruta pública para assets en incoming (espacios URL-encoded). */
export function fundadorIncomingAsset(filename: string): string {
  return `/vu/incoming/${encodeURIComponent(filename)}`;
}

export const FUNDADOR_V2_HERO = {
  title: "Hay algo en vos que sigue latiendo.",
  subtitle: "Sólo estaba esperando un lugar para volver a vivir.",
  microcopy: "Mirá qué se está moviendo y elegí por dónde empezar.",
  image: fundadorIncomingAsset("WhatsApp Image 2026-06-08 at 6.06.21 PM.jpeg"),
  fallbackImage: "/vu/patio-vivo-escena-coral.jpeg",
  objectPosition: "center 22%",
} as const;

export const FUNDADOR_V2_CTAS = {
  primary: {
    label: "Ver por dónde puedo empezar",
    href: "#por-donde-empezar",
  },
  reading: {
    label: "Hacer mi lectura inicial",
    href: "/full?founder=1",
  },
  explore: {
    label: "Explorar proyectos y comunidad",
    href: "/barrio",
  },
} as const;

export const FUNDADOR_V2_EMOTIONAL = {
  title: "¿Qué sentís que quedó esperando en vos?",
  options: [
    {
      id: "talent",
      label: "Un talento que fui dejando de lado",
      href: "/formacion",
    },
    {
      id: "idea",
      label: "Una idea que nunca terminé de mover",
      href: "/proyectos",
    },
    {
      id: "people",
      label: "Ganas de hacer algo con otras personas",
      href: "/circulos",
    },
    {
      id: "stage",
      label: "Una etapa laboral que ya no me representa",
      href: "/full?founder=1",
    },
    {
      id: "look",
      label: "No sé todavía, pero quiero mirar",
      href: "/barrio",
    },
  ],
} as const;

/** Historias semilla / recorridos inspiracionales — no afirmar testimonios reales comprobados. */
export type FounderSeedStory = {
  id: string;
  name: string;
  beforeToday: string;
  quote: string;
  image: string;
  fallbackImage: string;
};

const STORY_FILES = [
  "WhatsApp Image 2026-06-08 at 6.06.55 PM.jpeg",
  "WhatsApp Image 2026-06-08 at 6.06.55 PM (1).jpeg",
  "WhatsApp Image 2026-06-08 at 6.06.55 PM (2).jpeg",
  "WhatsApp Image 2026-06-08 at 6.06.56 PM.jpeg",
  "WhatsApp Image 2026-06-08 at 6.06.56 PM (1).jpeg",
  "WhatsApp Image 2026-06-08 at 6.06.56 PM (2).jpeg",
  "WhatsApp Image 2026-06-08 at 6.06.57 PM.jpeg",
  "WhatsApp Image 2026-06-08 at 6.06.57 PM (1).jpeg",
  "WhatsApp Image 2026-06-08 at 6.06.57 PM (2).jpeg",
] as const;

export const FUNDADOR_V2_STORIES: FounderSeedStory[] = [
  {
    id: "martina",
    name: "Martina V.",
    beforeToday: "Ex bancaria · hoy pianista",
    quote: "Durante años fui el chaleco antibalas de todos. Ahora redescubrí mi momento.",
    image: fundadorIncomingAsset(STORY_FILES[1]),
    fallbackImage: "/vu/perfil-maria-sol.png",
  },
  {
    id: "laura",
    name: "Laura C.",
    beforeToday: "Administrativa · hoy creadora textil",
    quote: "Tenía una idea guardada. Acá encontré un lugar para hacerla vivir.",
    image: fundadorIncomingAsset(STORY_FILES[3]),
    fallbackImage: "/vu/perfil-maria-sol.png",
  },
  {
    id: "sergio",
    name: "Sergio R.",
    beforeToday: "Ex administrativo · hoy impulsor radial",
    quote: "Pensé que ya era tarde. Acá encontré con quién volver a moverme.",
    image: fundadorIncomingAsset(STORY_FILES[0]),
    fallbackImage: "/vu/puerta-conectar-otros.png",
  },
  {
    id: "elena",
    name: "Elena M.",
    beforeToday: "Docente · hoy facilitadora comunitaria",
    quote: "Quería volver a sentir que lo mío importaba fuera del aula.",
    image: fundadorIncomingAsset(STORY_FILES[7]),
    fallbackImage: "/vu/perfil-maria-sol.png",
  },
  {
    id: "carlos",
    name: "Carlos D.",
    beforeToday: "Comercio · hoy mentor de proyectos",
    quote: "No buscaba un plan perfecto. Buscaba gente con la que empezar.",
    image: fundadorIncomingAsset(STORY_FILES[2]),
    fallbackImage: "/vu/puerta-conectar-otros.png",
  },
  {
    id: "patricia",
    name: "Patricia L.",
    beforeToday: "Salud · hoy artesana en red",
    quote: "Me costaba decir en voz alta lo que quería retomar. Acá pude.",
    image: fundadorIncomingAsset(STORY_FILES[6]),
    fallbackImage: "/vu/perfil-maria-sol.png",
  },
  {
    id: "andres",
    name: "Andrés G.",
    beforeToday: "Logística · hoy organizador de encuentros",
    quote: "Sentía que mi experiencia valía, pero no sabía dónde ponerla.",
    image: fundadorIncomingAsset(STORY_FILES[4]),
    fallbackImage: "/vu/puerta-conectar-otros.png",
  },
  {
    id: "silvia",
    name: "Silvia N.",
    beforeToday: "Oficina · hoy impulsora de círculos",
    quote: "Necesitaba un espacio donde no me sintieran exagerada por querer más.",
    image: fundadorIncomingAsset(STORY_FILES[5]),
    fallbackImage: "/vu/perfil-maria-sol.png",
  },
  {
    id: "roberto",
    name: "Roberto F.",
    beforeToday: "Industria · hoy co-creador de radio",
    quote: "Volví a sentir que había algo mío esperando, no apurado ni tarde.",
    image: fundadorIncomingAsset(STORY_FILES[8]),
    fallbackImage: "/vu/puerta-conectar-otros.png",
  },
];

export const FUNDADOR_V2_STORIES_SECTION = {
  title: "Historias que empiezan a moverse",
  disclaimer: "Historias inspiracionales semilla",
} as const;

export const FUNDADOR_V2_ECOSYSTEM = {
  title: "Puertas del barrio",
  doors: [
    {
      id: "projects",
      title: "Proyectos que buscan manos",
      href: "/proyectos",
      image: "/vu/proyecto-manos-transforman.png",
      fallbackImage: "/vu/proyecto-huerta-compartida.png",
    },
    {
      id: "people",
      title: "Personas impulsando ideas",
      href: "/circulos",
      image: "/vu/puerta-conectar-otros.png",
      fallbackImage: "/vu/evento-cafe-conexiones-vc.png",
    },
    {
      id: "spaces",
      title: "Espacios para volver a conectar",
      href: "/plaza",
      image: "/vu/patio-iluminado-encuentro.jpeg",
      fallbackImage: "/vu/mesa-ideas-compartidas.jpeg",
    },
    {
      id: "opportunities",
      title: "Oportunidades para empezar algo",
      href: "/eventos",
      image: "/vu/evento-emprende-proposito.png",
      fallbackImage: "/vu/evento-ideas-comunidad.png",
    },
  ],
} as const;

export const FUNDADOR_V2_GUARANTEES = [
  { id: "free", label: "Gratis" },
  { id: "nocard", label: "Sin tarjeta" },
  { id: "private", label: "Privado" },
] as const;

export const FUNDADOR_V2_ACTIVITY = {
  sectionTitle: "Actividad fundadora",
} as const;

export const FUNDADOR_V2_ALREADY_READING = {
  label: "Ya tengo mi lectura",
  href: "/full/result/recuperar",
} as const;
