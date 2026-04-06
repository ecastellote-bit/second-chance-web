import type { EmployabilityDirection } from "../types/profiles";

export const PROFILE_DIRECTION_MATRIX: Record<string, EmployabilityDirection[]> = {
  diplomatic_social_connector: [
    {
      id: "institutional_relations",
      ecosystem: "institutional_relations",
      label: "Institutional Relations",
      whyItFits: "Combina vínculo, representación, negociación y lectura de actores.",
    },
    {
      id: "partnerships",
      ecosystem: "partnerships",
      label: "Partnerships",
      whyItFits: "Aprovecha coordinación humana, construcción de confianza y articulación.",
    },
  ],
  community_builder: [
    {
      id: "community_operations",
      ecosystem: "community_operations",
      label: "Community Operations",
      whyItFits: "Conecta con espacios de pertenencia, interacción sostenida y construcción de comunidad.",
    },
    {
      id: "program_coordination",
      ecosystem: "program_coordination",
      label: "Program Coordination",
      whyItFits: "Aprovecha capacidad de articulación, seguimiento y sostén de procesos colectivos.",
    },
  ],
  analytical_strategist: [
    {
      id: "strategy_operations",
      ecosystem: "strategy_operations",
      label: "Strategy / Operations",
      whyItFits: "Combina lectura estructural, patrones y ordenamiento de decisiones.",
    },
    {
      id: "business_analysis",
      ecosystem: "business_analysis",
      label: "Business Analysis",
      whyItFits: "Aprovecha observación, comparación, lógica y lectura de sistemas.",
    },
  ],
  creative_storyteller: [
    {
      id: "content_strategy",
      ecosystem: "content_strategy",
      label: "Content Strategy",
      whyItFits: "Conecta relato, claridad expresiva y construcción de sentido comunicable.",
    },
    {
      id: "editorial_projects",
      ecosystem: "editorial_projects",
      label: "Editorial Projects",
      whyItFits: "Permite transformar experiencia, ideas y narración en producción útil.",
    },
  ],
  technical_builder: [
    {
      id: "operations_design",
      ecosystem: "operations_design",
      label: "Operations Design",
      whyItFits: "Aprovecha estructura mental, ejecución y mejora de procesos.",
    },
    {
      id: "project_operations",
      ecosystem: "project_operations",
      label: "Project Operations",
      whyItFits: "Conecta orden, implementación y continuidad práctica.",
    },
  ],
  cultural_explorer: [
    {
      id: "research_support",
      ecosystem: "research_support",
      label: "Research Support",
      whyItFits: "Canaliza curiosidad cultural, lectura contextual y producción de insumos.",
    },
    {
      id: "learning_content",
      ecosystem: "learning_content",
      label: "Learning Content",
      whyItFits: "Conecta exploración de ideas con producción de materiales claros y útiles.",
    },
  ],
  empathic_guide: [
    {
      id: "customer_success",
      ecosystem: "customer_success",
      label: "Customer Success",
      whyItFits: "Aprovecha escucha, lectura de tensiones y acompañamiento orientado a resolución.",
    },
    {
      id: "people_support",
      ecosystem: "people_support",
      label: "People Support",
      whyItFits: "Canaliza sensibilidad humana y capacidad de contención con estructura.",
    },
  ],
};

export function getDirectionsForProfile(profileId: string): EmployabilityDirection[] {
  return PROFILE_DIRECTION_MATRIX[profileId] ?? [];
}