export type ActivacionCartelId =
  | "presentar_proyecto"
  | "asociarme"
  | "oportunidades_laborales"
  | "explorar_comunidad";

export type ActivacionCartelIcon = "present" | "associate" | "jobs" | "explore";

export type ActivacionCartel = {
  id: ActivacionCartelId;
  label: string;
  description: string;
  /** Mensaje en la plaza post-activación */
  plazaWelcome: string;
  icon: ActivacionCartelIcon;
  /** Primer tramo sugerido en el barrio */
  primaryLinks: { label: string; route: string }[];
};

export const ACTIVACION_HEADER = {
  title: "Activación",
  subtitle: "Elegí cómo querés entrar al barrio. Después podés usar las tres puertas.",
} as const;

export const ACTIVACION_CARTELES: ActivacionCartel[] = [
  {
    id: "presentar_proyecto",
    label: "Vengo a presentar mi propio proyecto",
    description: "Busco apoyo, visibilidad y aliados para lo que ya estoy construyendo",
    plazaWelcome: "Tu proyecto tiene lugar en el barrio. Empezá por mostrarlo y encontrar quien sume.",
    icon: "present",
    primaryLinks: [
      { label: "Proyectos del barrio", route: "/proyectos" },
      { label: "Taller vecinal destacado", route: "/proyectos/manos-que-transforman" },
    ],
  },
  {
    id: "asociarme",
    label: "Busco asociarme con alguien",
    description: "Quiero encontrar personas con intereses parecidos y avanzar juntos",
    plazaWelcome: "Te ubicamos cerca de quienes caminan un sueño parecido al tuyo.",
    icon: "associate",
    primaryLinks: [
      { label: "Círculos", route: "/circulos" },
      { label: "Proyectos para sumarse", route: "/proyectos" },
    ],
  },
  {
    id: "oportunidades_laborales",
    label: "Busco oportunidades laborales",
    description: "Empleo y convocatorias con mirada más humana — edad y formación incluidas",
    plazaWelcome: "Acá las oportunidades miran capacidad y trayectoria, no solo el título del CV.",
    icon: "jobs",
    primaryLinks: [
      { label: "Eventos y convocatorias", route: "/eventos" },
      { label: "Formación aliada", route: "/formacion" },
    ],
  },
  {
    id: "explorar_comunidad",
    label: "Quiero explorar la comunidad",
    description: "Recorrer el barrio con calma antes de decidir el próximo paso",
    plazaWelcome: "Sin prisa: las tres puertas están abiertas cuando quieras.",
    icon: "explore",
    primaryLinks: [
      { label: "Mapa de la plaza", route: "/plaza?mapa=1" },
      { label: "Círculos", route: "/circulos" },
    ],
  },
];

export type CommunityDoorId = "entender_camino" | "proximo_movimiento" | "conectar_con_otros";

export type CommunityDoor = {
  id: CommunityDoorId;
  title: string;
  subtitle: string;
  image: string;
  accent: string;
  route: string;
  /** Para quién es esta puerta (copy conceptual) */
  forWho: string;
};

export const COMMUNITY_DOORS: CommunityDoor[] = [
  {
    id: "entender_camino",
    title: "Quiero entender mi camino",
    subtitle: "Formación, claridad y dirección a tu ritmo",
    image: "/vu/puerta-entender-camino.png",
    accent: "#0B2E59",
    route: "/community/entender_camino",
    forWho: "Pasaste por el diagnóstico o buscás sentido antes de actuar.",
  },
  {
    id: "proximo_movimiento",
    title: "Quiero encontrar mi próximo movimiento",
    subtitle: "Proyectos, oportunidades y pasos concretos",
    image: "/vu/puerta-proximo-movimiento.png",
    accent: "#1A9BB0",
    route: "/community/proximo_movimiento",
    forWho: "Ya sabés qué querés hacer y querés avanzar sin demora.",
  },
  {
    id: "conectar_con_otros",
    title: "Quiero volver a conectar con otros",
    subtitle: "Círculos, encuentros y comunidad real",
    image: "/vu/puerta-conectar-otros.png",
    accent: "#C6D92D",
    route: "/community/conectar_con_otros",
    forWho: "Lo que más necesitás ahora es volver a relacionarte.",
  },
];

export function getActivacionCartel(id: string | null | undefined): ActivacionCartel | undefined {
  return ACTIVACION_CARTELES.find((c) => c.id === id);
}

/** @deprecated Usar ACTIVACION_CARTELES */
export type ActivacionAction = ActivacionCartel;
/** @deprecated Usar ACTIVACION_CARTELES */
export const ACTIVACION_ACTIONS = ACTIVACION_CARTELES;
