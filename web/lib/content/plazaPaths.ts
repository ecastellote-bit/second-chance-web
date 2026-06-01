export type PlazaPath = {
  id: string;
  label: string;
  route: string;
  /** Position on plaza image (percent) */
  x: number;
  y: number;
  accent: "teal" | "lime" | "navy";
};

export const PLAZA_HEADER = {
  title: "Tu plaza inicial",
  subtitle: "Explorá, conectá y crecé junto a otros.",
} as const;

/** Center of path hub (percent) — subtle lines radiate from here */
export const PLAZA_HUB = { x: 50, y: 58 };

export const PLAZA_PATHS: PlazaPath[] = [
  { id: "circulos", label: "Círculos", route: "/circulos", x: 14, y: 32, accent: "lime" },
  { id: "proyectos", label: "Proyectos", route: "/proyectos", x: 82, y: 30, accent: "teal" },
  { id: "formacion", label: "Formación", route: "/formacion", x: 10, y: 52, accent: "teal" },
  { id: "oportunidades", label: "Oportunidades", route: "/eventos", x: 88, y: 50, accent: "lime" },
  { id: "conectar", label: "Conectar", route: "/community/conectar_con_otros", x: 22, y: 72, accent: "teal" },
  { id: "eventos", label: "Eventos", route: "/eventos", x: 78, y: 74, accent: "lime" },
];

/** Fotografía propia — plaza moderna al atardecer */
export const PLAZA_IMAGE = "/vu/plaza-inicial.png";
