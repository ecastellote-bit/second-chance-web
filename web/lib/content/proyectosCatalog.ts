import { TEAM_FOUNDER_PROJECTS } from "./teamFounderSeeds";

export type ProyectoListItem = {
  id: string;
  title: string;
  summary: string;
  label: string;
  participants?: number;
  image: string;
  fallbackImage?: string;
  isTeamSeed?: boolean;
  author?: string;
  category?: string;
  needs?: string[];
  cta?: string;
  description?: string;
};

export const PROYECTOS_HEADER = {
  title: "Proyectos del barrio",
  subtitle:
    "Semillas del equipo y de la ola fundadora: interés y señales. Para armar equipo con roles, usá Proyectos vivos.",
} as const;

/** Convocatorias del equipo fundador — honestas, sin autores externos fingidos */
export const TEAM_PROJECTS_CATALOG: ProyectoListItem[] = TEAM_FOUNDER_PROJECTS.map(
  (p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    description: p.description,
    label: p.badge,
    category: p.category,
    needs: p.needs,
    author: p.author,
    cta: p.cta,
    image: p.image,
    fallbackImage: p.fallbackImage,
    isTeamSeed: true,
  }),
);

/** Ilustraciones del barrio — ejemplos orientativos, separados del equipo */
export const PROYECTOS_CATALOG: ProyectoListItem[] = [
  {
    id: "manos-que-transforman",
    title: "Taller Vecinal: Manos que Transforman",
    summary: "Carpintería básica, materiales reutilizados y muebles para el barrio.",
    label: "Ilustración del barrio",
    image: "/vu/proyecto-manos-transforman.png",
  },
  {
    id: "huerta-compartida",
    title: "Huerta en la vereda",
    summary: "Vecinos armando canteros y turnos de riego en la cuadra.",
    label: "Ilustración del barrio",
    image: "/vu/proyecto-huerta-compartida.png",
  },
  {
    id: "radio-barrial",
    title: "Radio barrial de historias",
    summary: "Podcast y encuentros para contar voces del barrio.",
    label: "Ilustración del barrio",
    image: "/vu/proyecto-radio-barrial.png",
  },
];

export function getTeamProjectById(id: string): ProyectoListItem | undefined {
  return TEAM_PROJECTS_CATALOG.find((p) => p.id === id);
}

export function getAnyProjectById(id: string): ProyectoListItem | undefined {
  return getTeamProjectById(id) ?? PROYECTOS_CATALOG.find((p) => p.id === id);
}
