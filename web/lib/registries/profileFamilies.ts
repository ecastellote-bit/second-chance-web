import type {
  ProfileFamilyDefinition,
  ProfileFamilyId,
} from "../types/profileFamilies";

export const PROFILE_FAMILIES: ProfileFamilyDefinition[] = [
  {
    id: "analytical_strategist",
    label: "Analytical Strategist",
    summary:
      "Lee estructura, compara escenarios, ordena complejidad y orienta decisiones con criterio.",
    coreAffinities: [
      "pattern_analysis",
      "strategic_projection",
      "evidence_validation",
    ],
    supportingAffinities: [
      "system_ordering",
      "meaning_synthesis",
      "conceptual_abstraction",
    ],
    tensionAffinities: ["practical_execution", "pressure_functioning"],
    subtypeCandidates: [
      "strategic_pattern_reader",
      "scenario_comparer",
      "decision_architect",
      "structural_interpreter",
    ],
    misreadAs: ["technical_builder", "cultural_explorer", "system_designer"],
  },
  {
    id: "technical_builder",
    label: "Technical Builder",
    summary:
      "Convierte complejidad en funcionamiento concreto, ajusta procesos y resuelve fricción operativa.",
    coreAffinities: [
      "practical_execution",
      "technical_assembly",
      "resource_optimization",
    ],
    supportingAffinities: [
      "system_ordering",
      "operational_rhythm",
      "craft_precision",
    ],
    tensionAffinities: ["public_expression", "conceptual_abstraction"],
    subtypeCandidates: [
      "operational_system_solver",
      "process_optimizer",
      "technical_implementer",
      "execution_lead",
    ],
    misreadAs: ["analytical_strategist", "system_designer"],
  },
  {
    id: "diplomatic_social_connector",
    label: "Diplomatic Social Connector",
    summary:
      "Articula actores, cuida vínculos, media tensiones y sostiene funcionamiento entre partes distintas.",
    coreAffinities: [
      "relational_bridge_building",
      "conflict_mediation",
      "influence_negotiation",
    ],
    supportingAffinities: [
      "social_coordination",
      "institutional_navigation",
      "trust_building",
    ],
    tensionAffinities: ["care_orientation", "restorative_support"],
    subtypeCandidates: [
      "institutional_articulator",
      "stakeholder_aligner",
      "cross_sector_mediator",
      "relational_negotiator",
    ],
    misreadAs: ["empathic_guide", "community_builder", "institutional_operator"],
  },
  {
    id: "community_builder",
    label: "Community Builder",
    summary:
      "Construye pertenencia, circulación, coordinación social y sostenibilidad grupal.",
    coreAffinities: [
      "social_coordination",
      "group_reading",
      "trust_building",
    ],
    supportingAffinities: [
      "relational_bridge_building",
      "care_orientation",
      "public_expression",
    ],
    tensionAffinities: ["institutional_navigation", "decision_ownership"],
    subtypeCandidates: [
      "community_orchestrator",
      "group_flow_builder",
      "belonging_designer",
      "participation_catalyst",
    ],
    misreadAs: ["diplomatic_social_connector", "empathic_guide"],
  },
  {
    id: "empathic_guide",
    label: "Empathic Guide",
    summary:
      "Sintoniza con procesos humanos, acompaña tensiones internas y ayuda a reordenar situaciones complejas.",
    coreAffinities: [
      "empathic_attunement",
      "restorative_support",
      "care_orientation",
    ],
    supportingAffinities: [
      "trust_building",
      "group_reading",
      "conflict_mediation",
    ],
    tensionAffinities: ["institutional_navigation", "agenda_detection"],
    subtypeCandidates: [
      "human_process_guide",
      "restorative_listener",
      "clarifying_companion",
      "transition_support_guide",
    ],
    misreadAs: ["community_builder", "diplomatic_social_connector"],
  },
  {
    id: "creative_storyteller",
    label: "Creative Storyteller",
    summary:
      "Transforma experiencia, ideas o sensibilidad en relato, forma y lenguaje expresivo.",
    coreAffinities: [
      "narrative_creation",
      "aesthetic_sensitivity",
      "meaning_synthesis",
    ],
    supportingAffinities: [
      "public_expression",
      "editorial_framing",
      "performance_presence",
      "editorial_framing",
      "aesthetic_sensitivity",
    ],
    tensionAffinities: [
      "practical_execution",
      "operational_rhythm",
      "social_coordination",
      "group_reading",
      "trust_building",
    ],
    subtypeCandidates: [
      "narrative_message_builder",
      "story_world_creator",
      "expressive_interpreter",
      "aesthetic_narrator",
    ],
    misreadAs: ["public_communicator", "cultural_explorer", "community_builder"],
  },
  {
    id: "cultural_explorer",
    label: "Cultural Explorer",
    summary:
      "Explora contextos, ideas, cultura y marcos de sentido con curiosidad sostenida.",
    coreAffinities: [
      "curiosity_depth",
      "exploratory_drive",
      "meaning_synthesis",
    ],
    supportingAffinities: [
      "conceptual_abstraction",
      "adaptive_reframing",
      "aesthetic_sensitivity",
    ],
    tensionAffinities: ["practical_execution", "operational_rhythm"],
    subtypeCandidates: [
      "cultural_context_reader",
      "meaning_explorer",
      "idea_cartographer",
      "cross_context_interpreter",
    ],
    misreadAs: ["analytical_strategist", "creative_storyteller"],
  },
    {
      id: "public_communicator",
      label: "Public Communicator",
      summary:
        "Construye voz pública, interpreta asuntos colectivos y ordena agenda para una audiencia.",
      coreAffinities: [
        "public_expression",
      ],
      supportingAffinities: [
        "narrative_creation",
        "audience_activation",
        "agenda_detection",
        "performance_presence",
        "editorial_framing",
      ],
      tensionAffinities: ["care_orientation", "technical_assembly"],
      subtypeCandidates: [
        "editorial_voice",
        "civic_media_host",
        "public_affairs_translator",
        "opinion_format_builder",
      ],
      misreadAs: ["creative_storyteller", "civic_advocate"],
    },
  {
    id: "institutional_operator",
    label: "Institutional Operator",
    summary:
      "Se mueve con criterio dentro de estructuras, reglas y relaciones de poder formal.",
    coreAffinities: [
      "institutional_navigation",
      "decision_ownership",
      "agenda_detection",
    ],
    supportingAffinities: [
      "influence_negotiation",
      "system_ordering",
      "social_coordination",
    ],
    tensionAffinities: ["restorative_support", "experimental_play"],
    subtypeCandidates: [
      "institutional_relations_operator",
      "policy_interface_operator",
      "organizational_bridge_operator",
      "formal_structure_navigator",
    ],
    misreadAs: ["diplomatic_social_connector", "analytical_strategist"],
  },
  {
    id: "civic_advocate",
    label: "Civic Advocate",
    summary:
      "Interviene en asuntos colectivos, causas públicas o tensiones cívicas con impulso de incidencia.",
    coreAffinities: [
      "civic_conflict_engagement",
      "agenda_detection",
      "influence_negotiation",
    ],
    supportingAffinities: [
      "public_expression",
      "institutional_navigation",
      "protective_instinct",
    ],
    tensionAffinities: ["restorative_support", "craft_precision"],
    subtypeCandidates: [
      "cause_articulator",
      "civic_pressure_builder",
      "public_interest_advocate",
      "issue_mobilizer",
    ],
    misreadAs: ["public_communicator", "diplomatic_social_connector"],
  },
  {
    id: "educator_interpreter",
    label: "Educator Interpreter",
    summary:
      "Traduce complejidad para que otros comprendan, aprendan y se orienten mejor.",
    coreAffinities: [
      "teaching_impulse",
      "meaning_synthesis",
      "public_expression",
    ],
    supportingAffinities: [
      "pattern_analysis",
      "empathic_attunement",
      "narrative_creation",
    ],
    tensionAffinities: ["pressure_functioning", "competitive_push"],
    subtypeCandidates: [
      "concept_translator",
      "learning_guide",
      "clarity_builder",
      "pedagogic_interpreter",
    ],
    misreadAs: ["empathic_guide", "public_communicator", "analytical_strategist"],
  },
  {
    id: "commercial_connector",
    label: "Commercial Connector",
    summary:
      "Conecta necesidades, personas, oferta y valor en movimiento comercial o relacional.",
    coreAffinities: [
      "influence_negotiation",
      "relational_bridge_building",
      "initiative_drive",
    ],
    supportingAffinities: [
      "audience_activation",
      "social_coordination",
      "agenda_detection",
    ],
    tensionAffinities: ["restorative_support", "conceptual_abstraction"],
    subtypeCandidates: [
      "relationship_developer",
      "deal_connector",
      "market_bridge_builder",
      "growth_partnership_connector",
    ],
    misreadAs: ["diplomatic_social_connector", "public_communicator"],
  },
      {
        id: "system_designer",
        label: "System Designer",
        summary:
          "Diseña estructuras, marcos, secuencias y criterios para que un sistema funcione mejor cuando además hay intención de bajarlo a operación real.",
        coreAffinities: [
          "system_ordering",
          "practical_execution",
        ],
        supportingAffinities: [
          "resource_optimization",
          "conceptual_abstraction",
        ],
        tensionAffinities: [
          "performance_presence",
          "audience_activation",
          "empathic_attunement",
          "restorative_support",
          "public_expression",
          "group_reading",
        ],
        subtypeCandidates: [
          "framework_designer",
          "process_architect",
          "system_logic_builder",
          "structural_designer",
        ],
        misreadAs: ["analytical_strategist", "technical_builder"],
      },
  {
    id: "operational_organizer",
    label: "Operational Organizer",
    summary: "Coordina ejecución, logística y seguimiento para que las cosas pasen.",
    coreAffinities: ["operational_rhythm", "practical_execution", "resource_optimization"],
    supportingAffinities: ["duty_reliability", "social_coordination", "initiative_drive"],
    tensionAffinities: ["conceptual_abstraction", "narrative_creation"],
    subtypeCandidates: ["logistics_coordinator", "execution_driver", "task_orchestrator"],
    misreadAs: ["system_designer", "technical_builder"],
  },
  {
    id: "venture_builder",
    label: "Venture Builder",
    summary: "Inicia proyectos, detecta oportunidades y construye emprendimientos con lógica económica.",
    coreAffinities: ["venture_activation", "initiative_drive", "influence_negotiation"],
    supportingAffinities: ["practical_execution", "social_coordination", "decision_ownership"],
    tensionAffinities: ["restorative_support", "conceptual_abstraction"],
    subtypeCandidates: ["startup_launcher", "opportunity_activator", "project_initiator"],
    misreadAs: ["commercial_connector", "analytical_strategist"],
  },
  {
    id: "resource_steward",
    label: "Resource Steward",
    summary: "Cuida, optimiza y asigna recursos escasos con responsabilidad y previsión.",
    coreAffinities: ["resource_optimization", "stewardship", "duty_reliability"],
    supportingAffinities: ["operational_rhythm", "practical_execution", "evidence_validation"],
    tensionAffinities: ["performance_presence", "narrative_creation"],
    subtypeCandidates: ["budget_guardian", "resource_allocator", "efficiency_steward"],
    misreadAs: ["operational_organizer", "analytical_strategist"],
  },
  {
    id: "experience_host",
    label: "Experience Host",
    summary: "Diseña experiencias, cuida clima y crea ambientes donde otros se sienten bienvenidos.",
    coreAffinities: ["sensory_awareness", "aesthetic_sensitivity", "care_orientation"],
    supportingAffinities: ["social_coordination", "trust_building", "operational_rhythm"],
    tensionAffinities: ["pattern_analysis", "civic_conflict_engagement"],
    subtypeCandidates: ["atmosphere_designer", "hospitality_curator", "event_orchestrator"],
    misreadAs: ["community_builder", "operational_organizer"],
  },
  {
    id: "artistic_creator",
    label: "Artistic Creator",
    summary: "Transforma sensibilidad en obra: sonido, imagen, cuerpo, objeto o forma estética.",
    coreAffinities: ["aesthetic_sensitivity", "craft_precision", "performance_presence"],
    supportingAffinities: ["narrative_creation", "sensory_awareness", "material_transformation"],
    tensionAffinities: ["institutional_navigation", "resource_optimization"],
    subtypeCandidates: ["visual_creator", "sound_artist", "performing_artist", "mixed_media_creator"],
    misreadAs: ["creative_storyteller", "cultural_explorer"],
  },
];

export const PROFILE_FAMILY_MAP: Record<ProfileFamilyId, ProfileFamilyDefinition> =
  PROFILE_FAMILIES.reduce(
    (acc, family) => {
      acc[family.id] = family;
      return acc;
    },
    {} as Record<ProfileFamilyId, ProfileFamilyDefinition>,
  );

export function getProfileFamilyDefinition(
  id: ProfileFamilyId,
): ProfileFamilyDefinition {
  return PROFILE_FAMILY_MAP[id];
}