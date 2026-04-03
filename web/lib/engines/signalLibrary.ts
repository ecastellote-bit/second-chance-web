import type { SignalLibraryEntry } from "../types/signals";

export const SIGNAL_LIBRARY: SignalLibraryEntry[] = [
  {
    key: "social_coordination",
    label: "Social Coordination",
    description: "Tendencia a organizar, vincular, mediar o articular personas.",
    defaultWeight: 0.74,
  },
  {
    key: "pattern_analysis",
    label: "Pattern Analysis",
    description: "Capacidad para detectar regularidades, relaciones y estructuras.",
    defaultWeight: 0.78,
  },
  {
    key: "narrative_creation",
    label: "Narrative Creation",
    description: "Facilidad para construir sentido, relato o explicación comunicable.",
    defaultWeight: 0.7,
  },
  {
    key: "cultural_curiosity",
    label: "Cultural Curiosity",
    description: "Interés persistente por ideas, contextos, historia, sociedad o cultura.",
    defaultWeight: 0.68,
  },
  {
    key: "opportunity_detection",
    label: "Opportunity Detection",
    description: "Capacidad para ver huecos, posibilidades prácticas o movimiento potencial.",
    defaultWeight: 0.72,
  },
  {
    key: "system_thinking",
    label: "System Thinking",
    description: "Capacidad para comprender conjuntos, procesos y lógica estructural.",
    defaultWeight: 0.8,
  },
  {
    key: "empathic_listening",
    label: "Empathic Listening",
    description: "Capacidad para captar matices humanos, escuchar y leer tensiones ajenas.",
    defaultWeight: 0.67,
  },
  {
    key: "practical_organizing",
    label: "Practical Organizing",
    description: "Capacidad para ordenar acciones, recursos, prioridades o ejecución.",
    defaultWeight: 0.71,
  },
];

export function getSignalLibraryEntry(key: string): SignalLibraryEntry | undefined {
  return SIGNAL_LIBRARY.find((entry) => entry.key === key);
}