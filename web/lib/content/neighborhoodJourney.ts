import type { CommunityDoorId } from "./activacionCatalog";

export type NeighborhoodPath = {
  id: string;
  title: string;
  description: string;
  route: string;
  phase: "diagnostic" | "purgatory" | "plaza" | "doors" | "deep";
  requiresFoundingMember?: boolean;
};

/** Recorrido planificado del barrio — índice para fundadores y /barrio */
export const NEIGHBORHOOD_JOURNEY: NeighborhoodPath[] = [
  {
    id: "fundador",
    title: "Invitación fundadora",
    description: "Primer paso para orientar tu recorrido.",
    route: "/fundador",
    phase: "diagnostic",
  },
  {
    id: "full",
    title: "Lectura inicial",
    description: "Cinco estaciones para ordenar tu historia — y una pregunta más si hace falta.",
    route: "/full",
    phase: "diagnostic",
  },
  {
    id: "result",
    title: "Diagnóstico",
    description: "Una lectura clara para volver a consultar (miembro fundante).",
    route: "/full/result",
    phase: "diagnostic",
    requiresFoundingMember: true,
  },
  {
    id: "perfil",
    title: "Perfil en VocationUp",
    description: "Identidad en el barrio — necesaria antes de proyectos e interacción con pares.",
    route: "/perfil/crear",
    phase: "diagnostic",
    requiresFoundingMember: true,
  },
  {
    id: "themes",
    title: "Temáticas y activación",
    description: "Elegís temática y forma de activación en el barrio.",
    route: "/full/themes",
    phase: "purgatory",
    requiresFoundingMember: true,
  },
  {
    id: "plaza",
    title: "Tu plaza",
    description: "Centro del barrio: mapa, compromiso y tres puertas.",
    route: "/plaza",
    phase: "plaza",
    requiresFoundingMember: true,
  },
  {
    id: "activacion",
    title: "Carteles de activación",
    description: "Cómo entrás al ecosistema: proyecto, asociarte, empleo o explorar.",
    route: "/activacion",
    phase: "plaza",
  },
  {
    id: "sembrar",
    title: "Sembrar tu proyecto",
    description: "Revisión prioritaria del equipo durante la etapa fundadora.",
    route: "/proyectos/sembrar",
    phase: "deep",
    requiresFoundingMember: true,
  },
  {
    id: "proyectos",
    title: "Mesa de proyectos",
    description: "Proyectos del barrio y convocatorias para sumarse.",
    route: "/proyectos",
    phase: "deep",
  },
  {
    id: "circulos",
    title: "Círculos",
    description: "Encuentros y conversación con personas afines.",
    route: "/circulos",
    phase: "deep",
  },
  {
    id: "formacion",
    title: "Formación",
    description: "Recursos y caminos para entender tu dirección.",
    route: "/formacion",
    phase: "deep",
  },
  {
    id: "eventos",
    title: "Eventos",
    description: "Calendario del barrio y convocatorias.",
    route: "/eventos",
    phase: "deep",
  },
];

export const COMMUNITY_DOOR_HUBS: Record<
  CommunityDoorId,
  {
    title: string;
    intro: string;
    links: { label: string; route: string; description: string }[];
  }
> = {
  entender_camino: {
    title: "Entender mi camino",
    intro:
      "Formación, claridad y ritmo propio. Ideal si el diagnóstico ya te dio una lectura y querés profundizar sin apuro.",
    links: [
      {
        label: "Formación aliada",
        route: "/formacion",
        description: "Recursos y rutas sugeridas según tu temática.",
      },
      {
        label: "Tu diagnóstico",
        route: "/full/result",
        description: "Volver a la lectura guardada en tu perfil (si ya la completaste).",
      },
      {
        label: "La plaza",
        route: "/plaza",
        description: "Centro del barrio y mapa de caminos.",
      },
    ],
  },
  proximo_movimiento: {
    title: "Mi próximo movimiento",
    intro:
      "Proyectos concretos, oportunidades y pasos que podés dar ya. Para quien quiere actuar.",
    links: [
      {
        label: "Sembrar mi proyecto",
        route: "/proyectos/sembrar",
        description: "Fundadores: revisión prioritaria del equipo en la etapa fundadora.",
      },
      {
        label: "Mesa de proyectos",
        route: "/proyectos",
        description: "Ver iniciativas del barrio y sumarte.",
      },
      {
        label: "Eventos y convocatorias",
        route: "/eventos",
        description: "Oportunidades con fecha y lugar en el barrio.",
      },
    ],
  },
  conectar_con_otros: {
    title: "Conectar con otros",
    intro:
      "Círculos, encuentros y comunidad real. Para quien necesita volver a relacionarse.",
    links: [
      {
        label: "Círculos",
        route: "/circulos",
        description: "Conversaciones guiadas por afinidad.",
      },
      {
        label: "La plaza",
        route: "/plaza",
        description: "Compromiso con el barrio y puertas abiertas.",
      },
      {
        label: "Explorar proyectos",
        route: "/proyectos",
        description: "Encontrar aliados en iniciativas activas.",
      },
    ],
  },
};
