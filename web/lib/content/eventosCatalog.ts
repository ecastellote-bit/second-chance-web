import {
  TEAM_SEED_OPPORTUNITIES,
  TEAM_TENTATIVE_EVENTS,
} from "./teamFounderSeeds";

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
  participants?: number;
  image: string;
  fallbackImage?: string;
  categories: EventFilterId[];
  cta: string;
  /** Semilla del equipo — copy honesto */
  isTeamSeed?: boolean;
  isTentative?: boolean;
  seedBadge?: string;
  tentativeDisclaimer?: string;
  city?: string;
  zone?: string;
  duration?: string;
  entryNote?: string;
  description?: string;
};

export const EVENTOS_HEADER = {
  title: "Eventos, talleres y oportunidades",
  subtitle:
    "Primeras mesas tentativas Second Chance, convocatorias semilla y calendario del barrio.",
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

const TEAM_MESAS: OpportunityEvent[] = TEAM_TENTATIVE_EVENTS.map((e) => ({
  id: e.id,
  title: e.title,
  label: e.badge,
  date: e.date,
  dateShort: e.dateShort,
  modality: "presencial" as const,
  modalityLabel: "Presencial tentativo",
  image: e.image,
  fallbackImage: e.fallbackImage,
  categories: e.categories,
  cta: e.cta,
  isTeamSeed: true,
  isTentative: true,
  seedBadge: e.badge,
  tentativeDisclaimer: e.disclaimer,
  city: e.city,
  zone: e.zone,
  duration: e.duration,
  entryNote: e.entryNote,
}));

const TEAM_OPPORTUNITIES: OpportunityEvent[] = TEAM_SEED_OPPORTUNITIES.map((o) => ({
  id: o.id,
  title: o.title,
  label: o.badge,
  date: "Convocatoria abierta",
  dateShort: "Semilla",
  modality: "online" as const,
  modalityLabel: "Interés remoto",
  image: o.image,
  fallbackImage: o.fallbackImage,
  categories: o.categories,
  cta: o.cta,
  isTeamSeed: true,
  seedBadge: o.badge,
  description: o.description,
}));

/** Ilustraciones de calendario — complemento, claramente semilla */
const LEGACY_EVENTS: OpportunityEvent[] = [
  {
    id: "cafe-conexiones-vc",
    title: "Café & Conexiones Villa Crespo",
    label: "Ilustración",
    date: "Ejemplo · fecha orientativa",
    dateShort: "Ejemplo",
    modality: "presencial",
    modalityLabel: "Presencial",
    image: "/vu/evento-cafe-conexiones-vc.png",
    categories: ["todas", "networking", "talleres"],
    cta: "Ver ejemplo",
  },
  {
    id: "carpinteria-primeros-proyectos",
    title: "Carpintería básica: primeros proyectos",
    label: "Ilustración",
    date: "Ejemplo · fecha orientativa",
    dateShort: "Ejemplo",
    modality: "presencial",
    modalityLabel: "Presencial",
    image: "/vu/evento-carpinteria-primeros-proyectos.png",
    categories: ["todas", "talleres"],
    cta: "Ver ejemplo",
  },
  {
    id: "emprende-proposito",
    title: "Emprendé con propósito y sustentabilidad",
    label: "Ilustración",
    date: "Ejemplo · fecha orientativa",
    dateShort: "Ejemplo",
    modality: "hibrido",
    modalityLabel: "Híbrido",
    image: "/vu/evento-emprende-proposito.png",
    categories: ["todas", "charlas", "talleres"],
    cta: "Ver ejemplo",
  },
];

export const EVENTOS_CATALOG: OpportunityEvent[] = [
  ...TEAM_MESAS,
  ...TEAM_OPPORTUNITIES,
  ...LEGACY_EVENTS,
];

/** Próximos en la franja inferior — mesas tentativas primero */
export const UPCOMING_STRIP = EVENTOS_CATALOG.filter((e) => e.isTentative)
  .slice(0, 4)
  .map((e) => ({
    id: e.id,
    title: e.title,
    dateShort: e.dateShort,
    label: e.label,
  }));

export function filterEvents(filter: EventFilterId): OpportunityEvent[] {
  if (filter === "todas") return EVENTOS_CATALOG;
  return EVENTOS_CATALOG.filter((e) => e.categories.includes(filter));
}

export function getEventById(id: string): OpportunityEvent | undefined {
  return EVENTOS_CATALOG.find((e) => e.id === id);
}
