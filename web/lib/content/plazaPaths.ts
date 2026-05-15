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
  subtitle:
    "Explorá, conectá y crecé junto a otros que también están construyendo su segundo chance.",
} as const;

/** Center of path hub (percent) — subtle lines radiate from here */
export const PLAZA_HUB = { x: 50, y: 58 };

export const PLAZA_PATHS: PlazaPath[] = [
  { id: "circulos", label: "Círculos", route: "/community/conectar_con_otros", x: 14, y: 32, accent: "lime" },
  { id: "proyectos", label: "Proyectos", route: "/community/proximo_movimiento", x: 82, y: 30, accent: "teal" },
  { id: "formacion", label: "Formación", route: "/community/entender_camino", x: 10, y: 52, accent: "teal" },
  { id: "oportunidades", label: "Oportunidades", route: "/community/proximo_movimiento", x: 88, y: 50, accent: "lime" },
  { id: "conectar", label: "Conectar", route: "/community/conectar_con_otros", x: 22, y: 72, accent: "teal" },
  { id: "eventos", label: "Eventos", route: "/community", x: 78, y: 74, accent: "lime" },
];

export const PLAZA_IMAGE =
  "https://images.unsplash.com/photo-1511632765486-a01980e01e44?w=1200&auto=format&fit=crop&q=85";
