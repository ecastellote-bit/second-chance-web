export type ActivacionAction = {
  id: string;
  label: string;
  description: string;
  route: string;
  icon: "project" | "create" | "learn" | "connect" | "explore" | "opportunities";
};

export const ACTIVACION_HEADER = {
  title: "Activación",
  subtitle: "Elegí tu primer movimiento real.",
} as const;

export const ACTIVACION_ACTIONS: ActivacionAction[] = [
  {
    id: "sumarme_proyecto",
    label: "Sumarme a un proyecto",
    description: "Participar en algo que ya está en marcha",
    route: "/community/proximo_movimiento",
    icon: "project",
  },
  {
    id: "crear_proyecto",
    label: "Crear mi propio proyecto",
    description: "Dar forma a una idea y buscar aliados",
    route: "/community/proximo_movimiento",
    icon: "create",
  },
  {
    id: "formarme",
    label: "Formarme en algo nuevo",
    description: "Cursos, talleres y aprendizaje guiado",
    route: "/community/entender_camino",
    icon: "learn",
  },
  {
    id: "conectar",
    label: "Conectar con otros",
    description: "Círculos, encuentros y conversación real",
    route: "/community/conectar_con_otros",
    icon: "connect",
  },
  {
    id: "explorar",
    label: "Explorar la comunidad",
    description: "Recorrer la plaza sin presión",
    route: "/plaza",
    icon: "explore",
  },
  {
    id: "oportunidades",
    label: "Ver oportunidades",
    description: "Convocatorias y movimientos abiertos",
    route: "/community/proximo_movimiento",
    icon: "opportunities",
  },
];
