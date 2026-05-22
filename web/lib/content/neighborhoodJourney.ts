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
    description: "Oferta, requisito y entrada al cuestionario.",
    route: "/fundador",
    phase: "diagnostic",
  },
  {
    id: "full",
    title: "Cuestionario vocacional",
    description: "Cinco pasos + purgatorio (followup) si el sistema lo pide.",
    route: "/full",
    phase: "diagnostic",
  },
  {
    id: "result",
    title: "Diagnóstico",
    description: "Lectura personalizada y archivo del caso (miembro fundante).",
    route: "/full/result",
    phase: "diagnostic",
    requiresFoundingMember: true,
  },
  {
    id: "perfil",
    title: "Perfil en VocationUp",
    description: "Identidad en el barrio — obligatorio antes de proyectos e interacción con pares.",
    route: "/perfil/crear",
    phase: "diagnostic",
    requiresFoundingMember: true,
  },
  {
    id: "themes",
    title: "Purgatorio de temáticas",
    description: "Elegís temática y forma de activación en la Comunidad.",
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
    description: "Visibilidad prioritaria para fundadores (6 meses).",
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
        description: "Volver a la lectura archivada (si ya la completaste).",
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
        description: "Fundadores: visibilidad prioritaria por 6 meses.",
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
