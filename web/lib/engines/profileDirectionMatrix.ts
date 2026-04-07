import type { EmployabilityDirection } from "../types/profiles";

export const PROFILE_DIRECTION_MATRIX: Record<string, EmployabilityDirection[]> = {
  diplomatic_social_connector: [
    {
      id: "institutional_relations",
      ecosystem: "institutional_relations",
      label: "Institutional Relations",
      whyItFits: "Combina vínculo, representación, negociación y lectura de actores.",
      signalWeights: {
        social_coordination: 1.45,
        practical_organizing: 0.75,
        system_thinking: 0.45,
        empathic_listening: 0.45,
        pattern_analysis: 0.15,
        narrative_creation: 0.05,
        cultural_curiosity: 0.05,
        opportunity_detection: 0.05,
      }
    },
    {
      id: "partnerships",
      ecosystem: "partnerships",
      label: "Partnerships",
      whyItFits: "Aprovecha coordinación humana, construcción de confianza y articulación.",
      signalWeights: {
        social_coordination: 1.45,
        practical_organizing: 0.75,
        system_thinking: 0.45,
        empathic_listening: 0.45,
        pattern_analysis: 0.15,
        narrative_creation: 0.05,
        cultural_curiosity: 0.05,
        opportunity_detection: 0.05,
      }
    },
  ],
  community_builder: [
    {
      id: "community_operations",
      ecosystem: "community_operations",
      label: "Community Operations",
      whyItFits: "Conecta con espacios de pertenencia, interacción sostenida y construcción de comunidad.",
      signalWeights: {
        social_coordination: 1.2,
        empathic_listening: 0.7,
        practical_organizing: 0.55,
        narrative_creation: 0.35,
        system_thinking: 0.15,
        pattern_analysis: 0.1,
        cultural_curiosity: 0.05,
        opportunity_detection: 0.05,
      }
    },
    {
      id: "program_coordination",
      ecosystem: "program_coordination",
      label: "Program Coordination",
      whyItFits: "Aprovecha capacidad de articulación, seguimiento y sostén de procesos colectivos.",
      signalWeights: {
  social_coordination: 1.2,
  empathic_listening: 0.7,
  practical_organizing: 0.55,
  narrative_creation: 0.35,
  system_thinking: 0.15,
  pattern_analysis: 0.1,
  cultural_curiosity: 0.05,
  opportunity_detection: 0.05,
}
    },
  ],
  analytical_strategist: [
    {
      id: "strategy_operations",
      ecosystem: "strategy_operations",
      label: "Strategy / Operations",
      whyItFits: "Combina lectura estructural, patrones y ordenamiento de decisiones.",
      signalWeights: {
        pattern_analysis: 1.4,
        system_thinking: 1.2,
        opportunity_detection: 0.9,
        practical_organizing: 0.35,
        cultural_curiosity: 0.15,
        narrative_creation: 0.1,
        social_coordination: 0.1,
        empathic_listening: 0.05,
      }
    },
    {
      id: "business_analysis",
      ecosystem: "business_analysis",
      label: "Business Analysis",
      whyItFits: "Aprovecha observación, comparación, lógica y lectura de sistemas.",
      signalWeights: {
        pattern_analysis: 1.4,
        system_thinking: 1.2,
        opportunity_detection: 0.9,
        practical_organizing: 0.35,
        cultural_curiosity: 0.15,
        narrative_creation: 0.1,
        social_coordination: 0.1,
        empathic_listening: 0.05,
      }
    },
  ],
  creative_storyteller: [
    {
      id: "content_strategy",
      ecosystem: "content_strategy",
      label: "Content Strategy",
      whyItFits: "Conecta relato, claridad expresiva y construcción de sentido comunicable.",
      signalWeights: {
        narrative_creation: 1.55,
        cultural_curiosity: 0.5,
        pattern_analysis: 0.25,
        system_thinking: 0.15,
        opportunity_detection: 0.2,
        practical_organizing: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
      }
    },
    {
      id: "editorial_projects",
      ecosystem: "editorial_projects",
      label: "Editorial Projects",
      whyItFits: "Permite transformar experiencia, ideas y narración en producción útil.",
      signalWeights: {
        narrative_creation: 1.55,
        cultural_curiosity: 0.5,
        pattern_analysis: 0.25,
        system_thinking: 0.15,
        opportunity_detection: 0.2,
        practical_organizing: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
      }
    },
  ],
  technical_builder: [
    {
      id: "operations_design",
      ecosystem: "operations_design",
      label: "Operations Design",
      whyItFits: "Aprovecha estructura mental, ejecución y mejora de procesos.",
      signalWeights: {
        practical_organizing: 1.45,
        system_thinking: 1.15,
        pattern_analysis: 0.75,
        opportunity_detection: 0.2,
        social_coordination: 0.1,
        empathic_listening: 0.05,
        narrative_creation: 0.05,
        cultural_curiosity: 0.05,
      }
    },
    {
      id: "project_operations",
      ecosystem: "project_operations",
      label: "Project Operations",
      whyItFits: "Conecta orden, implementación y continuidad práctica.",
      signalWeights: {
        practical_organizing: 1.45,
        system_thinking: 1.15,
        pattern_analysis: 0.75,
        opportunity_detection: 0.2,
        social_coordination: 0.1,
        empathic_listening: 0.05,
        narrative_creation: 0.05,
        cultural_curiosity: 0.05,
      }
    },
  ],
  cultural_explorer: [
    {
      id: "research_support",
      ecosystem: "research_support",
      label: "Research Support",
      whyItFits: "Canaliza curiosidad cultural, lectura contextual y producción de insumos.",
      signalWeights: {
        cultural_curiosity: 1.55,
        pattern_analysis: 0.6,
        narrative_creation: 0.2,
        system_thinking: 0.15,
        practical_organizing: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
        opportunity_detection: 0.05,
      }
    },
    {
      id: "learning_content",
      ecosystem: "learning_content",
      label: "Learning Content",
      whyItFits: "Conecta exploración de ideas con producción de materiales claros y útiles.",
      signalWeights: {
        cultural_curiosity: 1.55,
        pattern_analysis: 0.6,
        narrative_creation: 0.2,
        system_thinking: 0.15,
        practical_organizing: 0.05,
        social_coordination: 0.05,
        empathic_listening: 0.05,
        opportunity_detection: 0.05,
      }
    },
  ],
  empathic_guide: [
    {
      id: "customer_success",
      ecosystem: "customer_success",
      label: "Customer Success",
      whyItFits: "Aprovecha escucha, lectura de tensiones y acompañamiento orientado a resolución.",
      signalWeights: {
        empathic_listening: 1.55,
        social_coordination: 0.55,
        practical_organizing: 0.3,
        system_thinking: 0.2,
        pattern_analysis: 0.1,
        narrative_creation: 0.05,
        cultural_curiosity: 0.05,
        opportunity_detection: 0,
      }
    },
    {
      id: "people_support",
      ecosystem: "people_support",
      label: "People Support",
      whyItFits: "Canaliza sensibilidad humana y capacidad de contención con estructura.",
      signalWeights: {
        empathic_listening: 1.55,
        social_coordination: 0.55,
        practical_organizing: 0.3,
        system_thinking: 0.2,
        pattern_analysis: 0.1,
        narrative_creation: 0.05,
        cultural_curiosity: 0.05,
        opportunity_detection: 0,
      }
    },
  ],
};

export function getDirectionsForProfile(profileId: string): EmployabilityDirection[] {
  return PROFILE_DIRECTION_MATRIX[profileId] ?? [];
}