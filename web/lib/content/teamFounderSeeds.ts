/**
 * Semillas visibles del equipo fundador — honestas, sin actividad fingida.
 * Imágenes futuras en /vu/seeds/... con fallback a assets existentes.
 */

export type TeamSeedBadge =
  | "Convocatoria semilla"
  | "Propuesta inicial del equipo"
  | "Mesa en formación"
  | "Círculo semilla"
  | "Primer encuentro tentativo";

export type TeamFounderProject = {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  needs: string[];
  badge: TeamSeedBadge;
  author: string;
  cta: string;
  /** Path futuro — VuWarmImage cae al fallback si no existe */
  image: string;
  fallbackImage: string;
};

export type TeamFounderCircle = {
  id: string;
  title: string;
  description: string;
  badge: TeamSeedBadge;
  cta: string;
  image: string;
  fallbackImage: string;
};

export type TeamTentativeEvent = {
  id: string;
  title: string;
  city: string;
  zone: string;
  date: string;
  dateShort: string;
  duration: string;
  entryNote: string;
  badge: TeamSeedBadge;
  cta: string;
  disclaimer: string;
  image: string;
  fallbackImage: string;
  categories: ("todas" | "talleres" | "charlas" | "networking")[];
};

export type TeamSeedOpportunity = {
  id: string;
  title: string;
  description: string;
  badge: TeamSeedBadge;
  cta: string;
  image: string;
  fallbackImage: string;
  categories: ("todas" | "voluntariado" | "empleo")[];
};

const BASE = "/vu/seeds";

export const TEAM_FOUNDER_PROJECTS: TeamFounderProject[] = [
  {
    id: "radio-second-chance",
    title: "Radio Second Chance — Voces que vuelven",
    summary:
      "Un espacio para personas que sienten que tienen algo para decir, entrevistar, narrar o comunicar, aunque nunca hayan trabajado formalmente en medios.",
    description:
      "Un espacio para personas que sienten que tienen algo para decir, entrevistar, narrar o comunicar, aunque nunca hayan trabajado formalmente en medios.",
    category: "Comunicación · historias · radio · podcast",
    needs: [
      "voces",
      "entrevistas",
      "edición simple",
      "producción",
      "difusión",
      "historias reales",
    ],
    badge: "Convocatoria semilla",
    author: "Equipo VocationUp",
    cta: "Me interesa participar",
    image: `${BASE}/projects/radio-second-chance.jpg`,
    fallbackImage: "/vu/proyecto-radio-barrial.png",
  },
  {
    id: "reinicio-laboral-adulto",
    title: "Taller de Reinicio Laboral Adulto",
    summary:
      "Una mesa para ordenar experiencias, capacidades y próximos movimientos posibles cuando el trabajo actual ya no representa a la persona.",
    description:
      "Una mesa para ordenar experiencias, capacidades y próximos movimientos posibles cuando el trabajo actual ya no representa a la persona.",
    category: "Reinvención laboral · orientación práctica",
    needs: [
      "personas con experiencia en RRHH",
      "orientación",
      "escritura de CV",
      "entrevistas",
      "oficios",
      "reinvención laboral",
    ],
    badge: "Propuesta inicial del equipo",
    author: "Second Chance",
    cta: "Quiero sumarme a esta mesa",
    image: `${BASE}/projects/reinicio-laboral-adulto.jpg`,
    fallbackImage: "/vu/circulo-reinicio-40.png",
  },
  {
    id: "banco-ideas-dormidas",
    title: "Banco de Ideas Dormidas",
    summary:
      "Un espacio para rescatar ideas que alguien tuvo durante años y nunca pudo ordenar, probar o compartir con otros.",
    description:
      "Un espacio para rescatar ideas que alguien tuvo durante años y nunca pudo ordenar, probar o compartir con otros.",
    category: "Proyectos · incubación comunitaria",
    needs: [
      "personas con ideas",
      "organizadores",
      "diseñadores",
      "comunicadores",
      "gente con criterio práctico",
    ],
    badge: "Convocatoria semilla",
    author: "Equipo VocationUp",
    cta: "Tengo una idea dormida",
    image: `${BASE}/projects/banco-ideas-dormidas.jpg`,
    fallbackImage: "/vu/mesa-ideas-compartidas.jpeg",
  },
  {
    id: "oficios-que-ensenan",
    title: "Oficios que Enseñan",
    summary:
      "Una red inicial para que personas con experiencia en oficios, tareas prácticas o saberes concretos puedan enseñar a otros desde lo vivido.",
    description:
      "Una red inicial para que personas con experiencia en oficios, tareas prácticas o saberes concretos puedan enseñar a otros desde lo vivido.",
    category: "Formación práctica · oficios · transmisión de saberes",
    needs: [
      "carpintería",
      "cocina",
      "costura",
      "reparación",
      "estética",
      "administración",
      "ventas",
      "herramientas digitales",
      "oficios barriales",
    ],
    badge: "Propuesta inicial del equipo",
    author: "Second Chance",
    cta: "Sé hacer algo y podría enseñarlo",
    image: `${BASE}/projects/oficios-que-ensenan.jpg`,
    fallbackImage: "/vu/proyecto-manos-transforman.png",
  },
];

export const TEAM_FOUNDER_CIRCLES: TeamFounderCircle[] = [
  {
    id: "empezar-de-nuevo",
    title: "Los que quieren empezar de nuevo",
    description:
      "Una mesa para ordenar el ruido, mirar posibilidades y no atravesar el reinicio en soledad.",
    badge: "Mesa en formación",
    cta: "Quiero estar en este círculo",
    image: `${BASE}/circles/empezar-de-nuevo.jpg`,
    fallbackImage: "/vu/circulo-reinicio-40.png",
  },
  {
    id: "comunicacion-radio-escritura",
    title: "Comunicación, radio y escritura",
    description:
      "Para quienes siempre tuvieron una voz guardada y quieren empezar a darle forma.",
    badge: "Círculo semilla",
    cta: "Me interesa este espacio",
    image: `${BASE}/circles/comunicacion-radio-escritura.jpg`,
    fallbackImage: "/vu/circulo-volver-a-escribir.png",
  },
  {
    id: "emprender-sin-hacerlo-solo",
    title: "Emprender sin hacerlo solo",
    description:
      "Ideas, primeras pruebas, aliados posibles y proyectos en etapa cero.",
    badge: "Mesa en formación",
    cta: "Quiero conectar con esta mesa",
    image: `${BASE}/circles/emprender-sin-hacerlo-solo.jpg`,
    fallbackImage: "/vu/circulo-impacto-social.png",
  },
  {
    id: "oficios-saberes-aprendizajes",
    title: "Oficios, saberes y aprendizajes",
    description:
      "Un espacio para que los saberes no queden encerrados en una sola vida.",
    badge: "Círculo semilla",
    cta: "Quiero aprender o enseñar algo",
    image: `${BASE}/circles/oficios-saberes-aprendizajes.jpg`,
    fallbackImage: "/vu/proyecto-manos-transforman.png",
  },
];

const MESA_TITLE =
  "Primera Mesa Second Chance: reiniciar caminos laborales y vocacionales";

const MESA_DISCLAIMER =
  "Estamos midiendo interés para organizar las primeras mesas presenciales de Second Chance. Marcá interés y te avisamos cuando se confirme fecha y lugar.";

export const TEAM_TENTATIVE_EVENTS: TeamTentativeEvent[] = [
  {
    id: "mesa-sc-caba",
    title: `${MESA_TITLE} · CABA`,
    city: "CABA",
    zone: "Palermo / Villa Crespo / Caballito",
    date: "Julio 2026 · fecha y lugar a confirmar",
    dateShort: "Jul 2026",
    duration: "90 minutos",
    entryNote: "Sin costo, cupo a confirmar",
    badge: "Primer encuentro tentativo",
    cta: "Quiero recibir aviso",
    disclaimer: MESA_DISCLAIMER,
    image: `${BASE}/events/mesa-second-chance-caba.jpg`,
    fallbackImage: "/vu/evento-cafe-conexiones-vc.png",
    categories: ["todas", "talleres", "networking", "charlas"],
  },
  {
    id: "mesa-sc-cordoba",
    title: `${MESA_TITLE} · Córdoba`,
    city: "Córdoba Capital",
    zone: "Nueva Córdoba / Güemes",
    date: "Julio–Agosto 2026 · fecha y lugar a confirmar",
    dateShort: "Jul–Ago 2026",
    duration: "90 minutos",
    entryNote: "Sin costo, cupo a confirmar",
    badge: "Primer encuentro tentativo",
    cta: "Quiero recibir aviso",
    disclaimer: MESA_DISCLAIMER,
    image: `${BASE}/events/mesa-second-chance-cordoba.jpg`,
    fallbackImage: "/vu/evento-emprende-proposito.png",
    categories: ["todas", "talleres", "networking"],
  },
  {
    id: "mesa-sc-la-plata",
    title: `${MESA_TITLE} · La Plata`,
    city: "La Plata",
    zone: "Centro / zona universitaria",
    date: "Agosto 2026 · fecha y lugar a confirmar",
    dateShort: "Ago 2026",
    duration: "90 minutos",
    entryNote: "Sin costo, cupo a confirmar",
    badge: "Primer encuentro tentativo",
    cta: "Quiero recibir aviso",
    disclaimer: MESA_DISCLAIMER,
    image: `${BASE}/events/mesa-second-chance-la-plata.jpg`,
    fallbackImage: "/vu/evento-ideas-comunidad.png",
    categories: ["todas", "talleres", "charlas"],
  },
  {
    id: "mesa-sc-rosario",
    title: `${MESA_TITLE} · Rosario`,
    city: "Rosario",
    zone: "Pichincha / centro",
    date: "Agosto 2026 · fecha y lugar a confirmar",
    dateShort: "Ago 2026",
    duration: "90 minutos",
    entryNote: "Sin costo, cupo a confirmar",
    badge: "Primer encuentro tentativo",
    cta: "Quiero recibir aviso",
    disclaimer: MESA_DISCLAIMER,
    image: `${BASE}/events/mesa-second-chance-rosario.jpg`,
    fallbackImage: "/vu/evento-carpinteria-primeros-proyectos.png",
    categories: ["todas", "talleres", "networking"],
  },
  {
    id: "mesa-sc-santa-fe",
    title: `${MESA_TITLE} · Santa Fe`,
    city: "Santa Fe Capital",
    zone: "Centro / Candioti",
    date: "Agosto 2026 · fecha y lugar a confirmar",
    dateShort: "Ago 2026",
    duration: "90 minutos",
    entryNote: "Sin costo, cupo a confirmar",
    badge: "Primer encuentro tentativo",
    cta: "Quiero recibir aviso",
    disclaimer: MESA_DISCLAIMER,
    image: `${BASE}/events/mesa-second-chance-santa-fe.jpg`,
    fallbackImage: "/vu/evento-bosque-urbano-voluntarios.png",
    categories: ["todas", "talleres", "charlas"],
  },
  {
    id: "mesa-sc-tucuman",
    title: `${MESA_TITLE} · Tucumán`,
    city: "San Miguel de Tucumán",
    zone: "Yerba Buena / Barrio Norte / centro",
    date: "Julio–Agosto 2026 · fecha y lugar a confirmar",
    dateShort: "Jul–Ago 2026",
    duration: "90 minutos",
    entryNote: "Sin costo, cupo a confirmar",
    badge: "Primer encuentro tentativo",
    cta: "Quiero recibir aviso",
    disclaimer: MESA_DISCLAIMER,
    image: `${BASE}/events/mesa-second-chance-tucuman.jpg`,
    fallbackImage: "/vu/patio-vivo-escena-coral.jpeg",
    categories: ["todas", "talleres", "networking"],
  },
];

export const TEAM_SEED_OPPORTUNITIES: TeamSeedOpportunity[] = [
  {
    id: "opp-radio-voces",
    title: "Buscamos voces para Radio Second Chance",
    description:
      "Para entrevistas, columnas, historias, lectura de textos o producción.",
    badge: "Convocatoria semilla",
    cta: "Quiero sumarme",
    image: `${BASE}/projects/radio-second-chance.jpg`,
    fallbackImage: "/vu/proyecto-radio-barrial.png",
    categories: ["todas", "voluntariado"],
  },
  {
    id: "opp-ideas-dormidas",
    title: "Buscamos personas con una idea dormida",
    description:
      "Queremos abrir primeras mesas para ideas que necesitan orden, criterio y primeras manos.",
    badge: "Convocatoria semilla",
    cta: "Tengo una idea dormida",
    image: `${BASE}/projects/banco-ideas-dormidas.jpg`,
    fallbackImage: "/vu/mesa-ideas-compartidas.jpeg",
    categories: ["todas", "voluntariado", "empleo"],
  },
  {
    id: "opp-anfitriones-locales",
    title: "Buscamos anfitriones locales",
    description:
      "Personas que podrían ayudar a impulsar una mesa Second Chance en su ciudad.",
    badge: "Convocatoria semilla",
    cta: "Quiero ayudar en mi ciudad",
    image: `${BASE}/events/mesa-second-chance-caba.jpg`,
    fallbackImage: "/vu/puerta-conectar-otros.png",
    categories: ["todas", "voluntariado"],
  },
];

/** Assets futuros documentados — ver comentarios en cada seed arriba */
export const TEAM_SEED_IMAGE_PATHS = {
  projects: [
    `${BASE}/projects/radio-second-chance.jpg`,
    `${BASE}/projects/reinicio-laboral-adulto.jpg`,
    `${BASE}/projects/banco-ideas-dormidas.jpg`,
    `${BASE}/projects/oficios-que-ensenan.jpg`,
  ],
  circles: [
    `${BASE}/circles/empezar-de-nuevo.jpg`,
    `${BASE}/circles/comunicacion-radio-escritura.jpg`,
    `${BASE}/circles/emprender-sin-hacerlo-solo.jpg`,
    `${BASE}/circles/oficios-saberes-aprendizajes.jpg`,
  ],
  events: [
    `${BASE}/events/mesa-second-chance-caba.jpg`,
    `${BASE}/events/mesa-second-chance-cordoba.jpg`,
    `${BASE}/events/mesa-second-chance-la-plata.jpg`,
    `${BASE}/events/mesa-second-chance-rosario.jpg`,
    `${BASE}/events/mesa-second-chance-santa-fe.jpg`,
    `${BASE}/events/mesa-second-chance-tucuman.jpg`,
  ],
  heroOptional: `${BASE}/hero/fundador-primera-pantalla.jpg`,
} as const;

/**
 * Manifiesto de imágenes oficiales — orden de tanda = índice batchOrder.
 * Copiar cada archivo generado a targetPath bajo web/public/ (jpg o png; actualizar extensión en seed si hace falta).
 * Tanda 1 (ítems 1–9): ya cableada en seeds arriba. Tanda 2 (10–14): eventos regionales. #10 opcional: hero /fundador.
 */
export const TEAM_SEED_IMAGE_MANIFEST = [
  {
    batchOrder: 1,
    batch: 1 as const,
    targetPath: `${BASE}/projects/radio-second-chance.jpg`,
    kind: "project" as const,
    seedId: "radio-second-chance",
    title: "Radio Second Chance — Voces que vuelven",
    uiDescription:
      "Grupo de adultos en patio cálido, mesa de trabajo/conversación, clima cooperativo.",
    usedIn: ["/proyectos", "/proyectos/radio-second-chance", "/fundador barrio hooks indirecto"],
  },
  {
    batchOrder: 2,
    batch: 1 as const,
    targetPath: `${BASE}/projects/reinicio-laboral-adulto.jpg`,
    kind: "project" as const,
    seedId: "reinicio-laboral-adulto",
    title: "Taller de Reinicio Laboral Adulto",
    uiDescription: "Adultos reorganizando ideas en mesa grande, tono serio y esperanzado.",
    usedIn: ["/proyectos", "/proyectos/reinicio-laboral-adulto"],
  },
  {
    batchOrder: 3,
    batch: 1 as const,
    targetPath: `${BASE}/projects/banco-ideas-dormidas.jpg`,
    kind: "project" as const,
    seedId: "banco-ideas-dormidas",
    title: "Banco de Ideas Dormidas",
    uiDescription: "Mesa con cuadernos, papeles y notas — ideas que vuelven a abrirse.",
    usedIn: ["/proyectos", "/proyectos/banco-ideas-dormidas", "opp-ideas-dormidas"],
  },
  {
    batchOrder: 4,
    batch: 1 as const,
    targetPath: `${BASE}/projects/oficios-que-ensenan.jpg`,
    kind: "project" as const,
    seedId: "oficios-que-ensenan",
    title: "Oficios que Enseñan",
    uiDescription: "Aprendizaje y transmisión práctica en patio/taller barrial, energía cooperativa.",
    usedIn: ["/proyectos", "/proyectos/oficios-que-ensenan"],
  },
  {
    batchOrder: 5,
    batch: 1 as const,
    targetPath: `${BASE}/circles/empezar-de-nuevo.jpg`,
    kind: "circle" as const,
    seedId: "empezar-de-nuevo",
    title: "Los que quieren empezar de nuevo",
    uiDescription: "Ronda íntima de adultos, reinicio, escucha y posibilidad.",
    usedIn: ["/circulos", "/circulos/empezar-de-nuevo"],
  },
  {
    batchOrder: 6,
    batch: 1 as const,
    targetPath: `${BASE}/circles/comunicacion-radio-escritura.jpg`,
    kind: "circle" as const,
    seedId: "comunicacion-radio-escritura",
    title: "Comunicación, radio y escritura",
    uiDescription: "Mesa con cuadernos y conversación creativa, clave escritura/comunicación.",
    usedIn: ["/circulos", "/circulos/comunicacion-radio-escritura"],
  },
  {
    batchOrder: 7,
    batch: 1 as const,
    targetPath: `${BASE}/circles/emprender-sin-hacerlo-solo.jpg`,
    kind: "circle" as const,
    seedId: "emprender-sin-hacerlo-solo",
    title: "Emprender sin hacerlo solo",
    uiDescription: "Grupo planificando juntos, papeles y notas, espíritu de proyecto compartido.",
    usedIn: ["/circulos", "/circulos/emprender-sin-hacerlo-solo"],
  },
  {
    batchOrder: 8,
    batch: 1 as const,
    targetPath: `${BASE}/circles/oficios-saberes-aprendizajes.jpg`,
    kind: "circle" as const,
    seedId: "oficios-saberes-aprendizajes",
    title: "Oficios, saberes y aprendizajes",
    uiDescription: "Escena intergeneracional, conversación práctica, aprendizaje comunitario.",
    usedIn: ["/circulos", "/circulos/oficios-saberes-aprendizajes"],
  },
  {
    batchOrder: 9,
    batch: 1 as const,
    targetPath: `${BASE}/events/mesa-second-chance-caba.jpg`,
    kind: "event" as const,
    seedId: "mesa-sc-caba",
    title: "Primera Mesa Second Chance · CABA",
    uiDescription: "Mesa barrial/café-patio, pequeña, humana, posible — no masiva.",
    usedIn: ["/eventos", "/eventos/mesa-sc-caba", "opp-anfitriones-locales"],
  },
  {
    batchOrder: 10,
    batch: 1 as const,
    targetPath: `${BASE}/hero/fundador-primera-pantalla.jpg`,
    kind: "hero" as const,
    seedId: null,
    title: "Hero opcional /fundador",
    uiDescription: "Primera pantalla predictiva — reemplaza patio-vivo cuando se confirme.",
    usedIn: ["/fundador FUNDADOR_HERO_ASSETS (manual swap)"],
    optional: true,
  },
  {
    batchOrder: 11,
    batch: 2 as const,
    targetPath: `${BASE}/events/mesa-second-chance-cordoba.jpg`,
    kind: "event" as const,
    seedId: "mesa-sc-cordoba",
    title: "Primera Mesa Second Chance · Córdoba",
    uiDescription: "Encuentro tentativo — pendiente tanda 2.",
    usedIn: ["/eventos", "/eventos/mesa-sc-cordoba"],
    pendingAsset: true,
  },
  {
    batchOrder: 12,
    batch: 2 as const,
    targetPath: `${BASE}/events/mesa-second-chance-la-plata.jpg`,
    kind: "event" as const,
    seedId: "mesa-sc-la-plata",
    title: "Primera Mesa Second Chance · La Plata",
    uiDescription: "Encuentro tentativo — pendiente tanda 2.",
    usedIn: ["/eventos", "/eventos/mesa-sc-la-plata"],
    pendingAsset: true,
  },
  {
    batchOrder: 13,
    batch: 2 as const,
    targetPath: `${BASE}/events/mesa-second-chance-rosario.jpg`,
    kind: "event" as const,
    seedId: "mesa-sc-rosario",
    title: "Primera Mesa Second Chance · Rosario",
    uiDescription: "Encuentro tentativo — pendiente tanda 2.",
    usedIn: ["/eventos", "/eventos/mesa-sc-rosario"],
    pendingAsset: true,
  },
  {
    batchOrder: 14,
    batch: 2 as const,
    targetPath: `${BASE}/events/mesa-second-chance-santa-fe.jpg`,
    kind: "event" as const,
    seedId: "mesa-sc-santa-fe",
    title: "Primera Mesa Second Chance · Santa Fe",
    uiDescription: "Encuentro tentativo — pendiente tanda 2.",
    usedIn: ["/eventos", "/eventos/mesa-sc-santa-fe"],
    pendingAsset: true,
  },
  {
    batchOrder: 15,
    batch: 2 as const,
    targetPath: `${BASE}/events/mesa-second-chance-tucuman.jpg`,
    kind: "event" as const,
    seedId: "mesa-sc-tucuman",
    title: "Primera Mesa Second Chance · Tucumán",
    uiDescription: "Encuentro tentativo — pendiente tanda 2.",
    usedIn: ["/eventos", "/eventos/mesa-sc-tucuman"],
    pendingAsset: true,
  },
] as const;
