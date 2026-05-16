export type ProyectoListItem = {
  id: string;
  title: string;
  summary: string;
  label: string;
  participants: number;
  image: string;
};

export const PROYECTOS_HEADER = {
  title: "Proyectos del barrio",
  subtitle: "Ideas que necesitan manos, voces y caminos.",
} as const;

export const PROYECTOS_CATALOG: ProyectoListItem[] = [
  {
    id: "manos-que-transforman",
    title: "Taller Vecinal: Manos que Transforman",
    summary: "Carpintería básica, materiales reutilizados y muebles para el barrio.",
    label: "En marcha",
    participants: 24,
    image: "/vu/proyecto-manos-transforman.png",
  },
  {
    id: "huerta-compartida",
    title: "Huerta en la vereda",
    summary: "Vecinos armando canteros y turnos de riego en la cuadra.",
    label: "Buscando manos",
    participants: 11,
    image: "/vu/proyecto-huerta-compartida.png",
  },
  {
    id: "radio-barrial",
    title: "Radio barrial de historias",
    summary: "Podcast y encuentros para contar voces del barrio.",
    label: "Nuevo",
    participants: 8,
    image: "/vu/proyecto-radio-barrial.png",
  },
];
