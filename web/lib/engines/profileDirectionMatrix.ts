import type { EmployabilityDirection } from "../types/profiles";

export const PROFILE_DIRECTION_MATRIX: Record<string, EmployabilityDirection[]> = {
  diplomatic_social_connector: [
    {
      id: "institutional_relations",
      ecosystem: "institutional_relations",
      label: "Institutional Relations",
      whyItFits:
        "Combina vínculo, representación, negociación y lectura de actores para alinear intereses y sostener acuerdos.",
      signalWeights: {
        social_coordination: 1.7,
        practical_organizing: 1.0,
        system_thinking: 0.85,
        empathic_listening: 0.35,
        pattern_analysis: 0.35,
        opportunity_detection: 0.15,
        narrative_creation: 0.05,
        cultural_curiosity: 0.05,
      },
    },
    {
      id: "partnerships",
      ecosystem: "partnerships",
      label: "Partnerships",
      whyItFits:
        "Aprovecha coordinación humana, construcción de confianza y articulación sostenida entre partes distintas.",
      signalWeights: {
        social_coordination: 1.65,
        practical_organizing: 0.95,
        system_thinking: 0.75,
        empathic_listening: 0.35,
        pattern_analysis: 0.3,
        opportunity_detection: 0.2,
        narrative_creation: 0.05,
        cultural_curiosity: 0.05,
      },
    },
  ],

  community_builder: [
    {
      id: "community_operations",
      ecosystem: "community_operations",
      label: "Community Operations",
      whyItFits:
        "Conecta con espacios de pertenencia, interacción sostenida y construcción de comunidad con orden básico.",
      signalWeights: {
        social_coordination: 1.2,
        empathic_listening: 0.7,
        practical_organizing: 0.55,
        narrative_creation: 0.35,
        system_thinking: 0.15,
        pattern_analysis: 0.1,
        cultural_curiosity: 0.05,
        opportunity_detection: 0.05,
      },
    },
    {
      id: "program_coordination",
      ecosystem: "program_coordination",
      label: "Program Coordination",
      whyItFits:
        "Aprovecha capacidad de articulación, seguimiento y sostén de procesos colectivos con más estructura.",
      signalWeights: {
        social_coordination: 1.15,
        practical_organizing: 0.95,
        empathic_listening: 0.55,
        system_thinking: 0.35,
        narrative_creation: 0.15,
        pattern_analysis: 0.15,
        cultural_curiosity: 0.05,
        opportunity_detection: 0.05,
      },
    },
  ],

  analytical_strategist: [
    {
      id: "strategy_operations",
      ecosystem: "strategy_operations",
      label: "Strategy / Operations",
      whyItFits:
        "Combina lectura estructural, patrones, criterio comparativo y capacidad de ordenar escenarios complejos.",
      signalWeights: {
        pattern_analysis: 1.7,
        system_thinking: 1.45,
        opportunity_detection: 0.95,
        practical_organizing: 0.2,
        cultural_curiosity: 0.25,
        narrative_creation: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
      },
    },
    {
      id: "business_analysis",
      ecosystem: "business_analysis",
      label: "Business Analysis",
      whyItFits:
        "Aprovecha observación, comparación, lógica y lectura de escenarios para detectar problemas y opciones.",
      signalWeights: {
        pattern_analysis: 1.6,
        system_thinking: 1.35,
        opportunity_detection: 1.0,
        practical_organizing: 0.3,
        cultural_curiosity: 0.1,
        narrative_creation: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
      },
    },
  ],

  creative_storyteller: [
    {
      id: "content_strategy",
      ecosystem: "content_strategy",
      label: "Content Strategy",
      whyItFits:
        "Transforma ideas, mensajes y enfoque en relato claro y posicionamiento comunicable.",
      signalWeights: {
        narrative_creation: 1.85,
        opportunity_detection: 1.0,
        system_thinking: 0.65,
        cultural_curiosity: 0.45,
        pattern_analysis: 0.15,
        practical_organizing: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
      },
    },
    {
      id: "editorial_projects",
      ecosystem: "editorial_projects",
      label: "Editorial Projects",
      whyItFits:
        "Aprovecha escritura, voz, forma narrativa y construcción simbólica sostenida para producir contenido.",
      signalWeights: {
        narrative_creation: 1.9,
        cultural_curiosity: 0.7,
        opportunity_detection: 0.55,
        system_thinking: 0.55,
        pattern_analysis: 0.15,
        practical_organizing: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
      },
    },
  ],

  technical_builder: [
    {
      id: "operations_design",
      ecosystem: "operations_design",
      label: "Operations Design",
      whyItFits:
        "Conecta ejecución, estructura, mejora operativa y resolución concreta de trabas.",
      signalWeights: {
        practical_organizing: 1.8,
        system_thinking: 0.95,
        pattern_analysis: 0.45,
        opportunity_detection: 0.25,
        cultural_curiosity: 0.05,
        narrative_creation: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
      },
    },
    {
      id: "project_operations",
      ecosystem: "project_operations",
      label: "Project Operations",
      whyItFits:
        "Ordena tareas, prioridades, coordinación operativa y ejecución sostenida sin dispersarse en análisis puro.",
      signalWeights: {
        practical_organizing: 1.85,
        system_thinking: 0.85,
        pattern_analysis: 0.35,
        opportunity_detection: 0.2,
        cultural_curiosity: 0.05,
        narrative_creation: 0.05,
        social_coordination: 0.1,
        empathic_listening: 0.05,
      },
    },
  ],

  cultural_explorer: [
    {
      id: "research_support",
      ecosystem: "research_support",
      label: "Research Support",
      whyItFits:
        "Convierte curiosidad sostenida, lectura profunda y conexión entre contextos en exploración aplicable.",
      signalWeights: {
        cultural_curiosity: 1.75,
        pattern_analysis: 1.25,
        system_thinking: 1.05,
        narrative_creation: 0.15,
        opportunity_detection: 0.15,
        practical_organizing: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
      },
    },
    {
      id: "learning_content",
      ecosystem: "learning_content",
      label: "Learning Content",
      whyItFits:
        "Usa exploración cultural, síntesis y relación entre ideas para construir contenido de aprendizaje sin depender del relato dominante.",
      signalWeights: {
        cultural_curiosity: 1.6,
        pattern_analysis: 1.1,
        system_thinking: 1.0,
        narrative_creation: 0.2,
        opportunity_detection: 0.15,
        practical_organizing: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
      },
    },
  ],

  empathic_guide: [
    {
      id: "customer_success",
      ecosystem: "customer_success",
      label: "Customer Success",
      whyItFits:
        "Aprovecha escucha, lectura de tensiones y acompañamiento orientado a sostener procesos humanos con foco de servicio.",
      signalWeights: {
        empathic_listening: 1.8,
        social_coordination: 0.55,
        practical_organizing: 0.2,
        system_thinking: 0.15,
        pattern_analysis: 0.05,
        narrative_creation: 0.05,
        cultural_curiosity: 0.05,
        opportunity_detection: 0,
      },
    },
    {
      id: "people_support",
      ecosystem: "people_support",
      label: "People Support",
      whyItFits:
        "Canaliza sensibilidad humana y capacidad de contención con estructura mínima, sin depender de articulación institucional.",
      signalWeights: {
        empathic_listening: 1.85,
        social_coordination: 0.5,
        practical_organizing: 0.2,
        system_thinking: 0.1,
        pattern_analysis: 0.05,
        narrative_creation: 0.05,
        cultural_curiosity: 0.05,
        opportunity_detection: 0,
      },
    },
  ],
};

export function getDirectionsForProfile(
  profileId: string,
): EmployabilityDirection[] {
  return PROFILE_DIRECTION_MATRIX[profileId] ?? [];
}