import type { CircleSignalStatus, CircleSignalType } from "@/lib/learning/circleSignals";

export const CIRCLE_SIGNAL_TYPE_LABEL: Record<CircleSignalType, string> = {
  circle_interest: "Me interesa",
  circle_receive_updates: "Recibir movimiento",
  circle_access_request: "Solicitar acceso",
  circle_idea: "Idea para el círculo",
};

export const CIRCLE_SIGNAL_STATUS_LABEL: Record<CircleSignalStatus, string> = {
  active: "Activa",
  reviewed: "Vista por el equipo",
  flagged: "Con alerta",
  archived: "Cerrada",
};

export const CIRCLE_SIGNAL_STATUS_FILTER: { id: "" | CircleSignalStatus; label: string }[] = [
  { id: "", label: "Todas" },
  { id: "active", label: "Activas" },
  { id: "reviewed", label: "Vistas por el equipo" },
  { id: "flagged", label: "Con alerta" },
  { id: "archived", label: "Cerradas" },
];

export const CIRCLE_SIGNAL_ADMIN_MODERATION_HELP = [
  {
    action: "Vista por el equipo",
    meaning:
      "La señal ya fue leída y registrada. No publica nada en el barrio ni habilita contacto automático.",
  },
  {
    action: "Marcar alerta",
    meaning:
      "Requiere atención de moderación (contenido delicado, posible incumplimiento de reglas).",
  },
  {
    action: "Cerrar",
    meaning: "Sacar de la bandeja activa: caso resuelto, descartado o sin seguimiento por ahora.",
  },
  {
    action: "Aprobar visibilidad (ideas)",
    meaning:
      "Solo para ideas de círculo: publicar texto curado y anónimo. No usa la nota cruda del usuario.",
  },
] as const;
