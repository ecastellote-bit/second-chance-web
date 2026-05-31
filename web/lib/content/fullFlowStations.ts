/** Metadatos de presentación — no alteran lógica del cuestionario. */
export const FULL_FLOW_PROGRESS_TRAIL = [
  "Inicio",
  "Historia",
  "Señales",
  "Dirección",
  "Lectura",
] as const;

export type FullFlowStationId = 1 | 2 | 3 | 4 | 5;

export const FULL_FLOW_STATIONS: Record<
  FullFlowStationId,
  {
    trailIndex: number;
    stationTitle: string;
    trailLabel: string;
  }
> = {
  1: {
    trailIndex: 0,
    stationTitle: "Tu punto de partida",
    trailLabel: "Inicio",
  },
  2: {
    trailIndex: 1,
    stationTitle: "Lo que se repite en tu historia",
    trailLabel: "Historia",
  },
  3: {
    trailIndex: 2,
    stationTitle: "Lo que todavía aparece vivo",
    trailLabel: "Señales",
  },
  4: {
    trailIndex: 3,
    stationTitle: "Dónde aparece tu energía real",
    trailLabel: "Dirección",
  },
  5: {
    trailIndex: 4,
    stationTitle: "Qué movimiento tendría sentido ahora",
    trailLabel: "Lectura",
  },
};

export const FULL_FLOW_SHELL_COPY = {
  brandEyebrow: "VocationUp",
  readingTitle: "Lectura fundadora",
  readingTitleAlt: "Lectura vocacional",
  preservationNote:
    "Tu respuesta queda preservada en este dispositivo para poder construir una lectura más justa.",
  backStation: "Volver",
  continueReading: "Continuar mi lectura",
  saveAndContinue: "Guardar y seguir",
} as const;
