import type { LearningObservation } from "../types/learningObservations";

export const LEARNING_OBSERVATIONS: LearningObservation[] = [
  {
    id: "observation_creative_educator_frontier_001",
    type: "frontier_rule",
    families: ["creative_storyteller", "educator_interpreter"],
    primaryFamily: "creative_storyteller",
    secondaryFamily: "educator_interpreter",
    strength: 0.75,
    lesson:
      "Cuando una persona muestra deseo sostenido de escribir, contar historias, armar textos y poner en palabras lo que otros no logran expresar, Creative Storyteller debe quedar alto. Si además aparece explicar ideas, claridad para otros y ayuda a comprender, Educator Interpreter debe entrar como frontera fuerte.",
    conditions: [
      "aparece escritura o relato",
      "aparece explicación de ideas",
      "aparece deseo de claridad para otros",
      "no aparece necesariamente agenda pública",
      "no aparece necesariamente deseo de escena pública",
    ],
    positiveMarkers: [
      "escribir",
      "explicar ideas",
      "armar textos",
      "contar historias",
      "forma clara de decir",
      "poner en palabras",
      "voz propia",
      "que otros entiendan",
      "relatos útiles",
    ],
    negativeMarkers: [
      "postura pública",
      "agenda pública",
      "intervención social explícita",
      "audiencia masiva",
    ],
    contextualMarkers: [
      {
        marker: "voz propia",
        supportsFamilies: ["creative_storyteller"],
        contextMeaning: "expresión narrativa comprimida o postergada",
        notEnoughFor: ["public_communicator"],
      },
      {
        marker: "explicar ideas",
        supportsFamilies: ["educator_interpreter"],
        contextMeaning: "traducción de complejidad para comprensión ajena",
        notEnoughFor: ["creative_storyteller"],
      },
      {
        marker: "poner en palabras",
        supportsFamilies: ["creative_storyteller", "educator_interpreter"],
        contextMeaning:
          "dar forma verbal a algo difuso; puede ser narrativo o pedagógico según el objeto",
      },
    ],
    misreadWarnings: [
      "No llevar automáticamente escritura a Public Communicator si no hay postura pública, audiencia, agenda o intervención social explícita.",
      "No bajar Educator Interpreter si la escritura aparece al servicio de comprensión ajena.",
      "No cerrar Creative Storyteller puro cuando aparecen señales repetidas de explicación, traducción y claridad para otros.",
    ],
    sourceCaseIds: ["learned_creative_storyteller_educator_frontier_001"],
    shouldInfluenceFutureCases: true,
    requiresHumanApproval: false,
  },
  {
    id: "observation_public_vs_narrative_001",
    type: "misread_warning",
    families: ["creative_storyteller", "public_communicator"],
    primaryFamily: "creative_storyteller",
    secondaryFamily: "public_communicator",
    strength: 0.72,
    lesson:
      "La escritura, edición o construcción de tono no debe leerse automáticamente como Public Communicator. Public Communicator necesita señales de postura pública, audiencia, agenda, intervención o voluntad de incidir sobre una conversación externa.",
    conditions: [
      "hay escritura o edición",
      "hay tono o forma narrativa",
      "no aparece deseo claro de escena pública",
      "no aparece agenda pública",
    ],
    positiveMarkers: [
      "escribir",
      "editar",
      "encontrar el tono",
      "darle forma",
      "volver texto",
    ],
    negativeMarkers: [
      "no quiero estar al frente",
      "no poner la cara",
      "me interesa más la forma",
    ],
    contextualMarkers: [
      {
        marker: "no quiero estar al frente",
        supportsFamilies: ["creative_storyteller"],
        contextMeaning:
          "preferencia por la construcción narrativa o editorial sin exposición pública directa",
        notEnoughFor: ["public_communicator"],
      },
    ],
    misreadWarnings: [
      "No confundir forma narrativa con voz pública si falta postura, audiencia o intervención.",
    ],
    sourceCaseIds: ["learned_creative_storyteller_no_public_front_001"],
    shouldInfluenceFutureCases: true,
    requiresHumanApproval: false,
  },
  {
    id: "observation_technical_vs_system_designer_001",
    type: "counterweight",
    families: ["technical_builder", "system_designer"],
    primaryFamily: "technical_builder",
    secondaryFamily: "system_designer",
    strength: 0.78,
    lesson:
      "Cuando la persona habla de reparar, probar, meter mano, encontrar fallas y dejar funcionando algo real, Technical Builder debe pesar antes que System Designer. System Designer debe subir cuando el foco esté en arquitectura, estructura, flujo o prevención sistémica.",
    conditions: [
      "hay objetos o sistemas concretos",
      "hay reparación o prueba práctica",
      "hay deseo de hacer funcionar algo",
      "la persona se ve actuando sobre el problema real",
    ],
    positiveMarkers: [
      "arreglar cosas",
      "encontrar fallas",
      "probar hasta que funcione",
      "meter mano",
      "dejar andando",
      "motores",
      "instalaciones",
      "componentes eléctricos",
      "taller",
    ],
    negativeMarkers: [
      "arquitectura del sistema",
      "dependencias",
      "flujo mal diseñado",
      "evitar que vuelva a romperse",
    ],
    contextualMarkers: [
      {
        marker: "meter mano",
        supportsFamilies: ["technical_builder"],
        contextMeaning: "intervención práctica directa sobre funcionamiento real",
        notEnoughFor: ["system_designer"],
      },
      {
        marker: "evitar que vuelva a romperse",
        supportsFamilies: ["system_designer"],
        contextMeaning:
          "preocupación estructural por causa, diseño y prevención futura",
        notEnoughFor: ["technical_builder"],
      },
    ],
    misreadWarnings: [
      "No subir System Designer sólo porque aparece la palabra sistema si el relato está centrado en reparar, probar o hacer funcionar.",
      "No bajar Technical Builder cuando el deseo está puesto en taller, motores, fallas, instalaciones o componentes reales.",
    ],
    sourceCaseIds: [
      "learned_technical_builder_electric_practical_001",
      "learned_technical_builder_ex_bancario_motores_001",
      "learned_system_designer_architecture_001",
    ],
    shouldInfluenceFutureCases: true,
    requiresHumanApproval: false,
  },
];