export type EventFilterId =
  | "todas"
  | "talleres"
  | "charlas"
  | "networking"
  | "en_vivo"
  | "empleo"
  | "voluntariado";

export type EventModality = "presencial" | "online" | "hibrido" | "en_vivo";

export type OpportunityEvent = {
  id: string;
  title: string;
  label: string;
  date: string;
  dateShort: string;
  modality: EventModality;
  modalityLabel: string;
  participants: number;
  image: string;
  categories: EventFilterId[];
  cta: string;
};

export const EVENTOS_HEADER = {
  title: "Eventos, talleres y oportunidades",
  subtitle: "Cosas que pasan. Personas que se encuentran. Caminos que se abren.",
} as const;

export const EVENT_FILTERS: { id: EventFilterId; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "talleres", label: "Talleres" },
  { id: "charlas", label: "Charlas" },
  { id: "networking", label: "Networking" },
  { id: "en_vivo", label: "En vivo" },
  { id: "empleo", label: "Empleo" },
  { id: "voluntariado", label: "Voluntariado" },
];

export const EVENTOS_CATALOG: OpportunityEvent[] = [
  {
    id: "cafe-conexiones-vc",
    title: "Café & Conexiones Villa Crespo",
    label: "Networking",
    date: "Sáb 24 may · 10:00",
    dateShort: "24 may",
    modality: "presencial",
    modalityLabel: "Presencial",
    participants: 18,
    image: "/vu/evento-cafe-conexiones-vc.png",
    categories: ["todas", "networking", "talleres"],
    cta: "Quiero ir",
  },
  {
    id: "carpinteria-primeros-proyectos",
    title: "Carpintería básica: primeros proyectos",
    label: "Taller",
    date: "Mié 28 may · 18:30",
    dateShort: "28 may",
    modality: "presencial",
    modalityLabel: "Presencial",
    participants: 12,
    image: "/vu/evento-carpinteria-primeros-proyectos.png",
    categories: ["todas", "talleres"],
    cta: "Reservar lugar",
  },
  {
    id: "emprende-proposito",
    title: "Emprendé con propósito y sustentabilidad",
    label: "Charla",
    date: "Jue 5 jun · 19:00",
    dateShort: "5 jun",
    modality: "hibrido",
    modalityLabel: "Híbrido",
    participants: 34,
    image: "/vu/evento-emprende-proposito.png",
    categories: ["todas", "charlas", "talleres"],
    cta: "Sumarme",
  },
  {
    id: "ideas-comunidad",
    title: "Ideas que construyen comunidad",
    label: "Charla",
    date: "Mar 10 jun · 17:30",
    dateShort: "10 jun",
    modality: "en_vivo",
    modalityLabel: "En vivo",
    participants: 41,
    image: "/vu/evento-ideas-comunidad.png",
    categories: ["todas", "charlas", "en_vivo", "networking"],
    cta: "Entrar en vivo",
  },
  {
    id: "bosque-urbano-voluntarios",
    title: "Bosque Urbano busca voluntarios y aprendices",
    label: "Voluntariado",
    date: "Dom 15 jun · 9:00",
    dateShort: "15 jun",
    modality: "presencial",
    modalityLabel: "Presencial",
    participants: 22,
    image: "/vu/evento-bosque-urbano-voluntarios.png",
    categories: ["todas", "voluntariado", "empleo", "talleres"],
    cta: "Ofrecer ayuda",
  },
];

/** Próximos en la franja inferior */
export const UPCOMING_STRIP = EVENTOS_CATALOG.slice(0, 4).map((e) => ({
  id: e.id,
  title: e.title,
  dateShort: e.dateShort,
  label: e.label,
}));

export function filterEvents(filter: EventFilterId): OpportunityEvent[] {
  if (filter === "todas") return EVENTOS_CATALOG;
  return EVENTOS_CATALOG.filter((e) => e.categories.includes(filter));
}
