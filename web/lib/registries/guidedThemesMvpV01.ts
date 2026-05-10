import type { GuidedTheme } from "@/lib/types/guidedThemes";

export const GUIDED_THEMES_MVP_VERSION = "mvp_v0_1";

export const guidedThemesMvpV01: GuidedTheme[] = [

{
    id: "decir_lo_que_otros_no_dicen",
    shortLabel: "Decir lo que falta decir",
    userFacingText: "Poner en palabras algo que otros sienten, piensan o no se animan a decir.",
    recognitionPhrase: "Una y otra vez aparece en vos la necesidad de decir algo que no está siendo dicho.",
    linkedFamilies: ["public_communicator", "civic_advocate", "creative_storyteller"],
    coreAffinities: ["public_expression", "editorial_framing", "agenda_detection"],
    supportingAffinities: ["narrative_creation", "civic_conflict_engagement", "audience_activation"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "explorar_primero_comunidad",
      "integrar_proyectos_existentes",
      "armar_mi_propio_proyecto"
    ],
    communitySpaceHints: [
      "voz_publica_y_contenido",
      "debate_civico_y_opinion",
      "escritura_mensaje_y_relato"
    ],
    exampleUserSignals: [
      "me indigna que nadie diga nada",
      "siempre termino escribiendo lo que otros piensan",
      "me sale ordenar públicamente un problema",
      "cuando algo me importa no me puedo quedar callado"
    ],
    avoidIfSignals: [
      "solo escritura íntima sin audiencia",
      "solo análisis privado sin voluntad de expresión",
      "acompañamiento uno a uno como centro principal",
      "interés cultural sin necesidad de tomar postura"
    ]
  },

  {
    id: "convertir_lo_vivido_en_relato",
    shortLabel: "Convertir lo vivido en relato",
    userFacingText: "Transformar experiencias, ideas o emociones en texto, historia, imagen, escena o forma.",
    recognitionPhrase: "Cuando algo te pasa o te toca, muchas veces necesitás darle forma para entenderlo o compartirlo.",
    linkedFamilies: ["creative_storyteller", "artistic_creator", "aesthetic_designer_curator"],
    coreAffinities: ["narrative_creation", "aesthetic_sensitivity", "meaning_synthesis"],
    supportingAffinities: ["creative_expression", "editorial_framing", "symbolic_elaboration"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "armar_mi_propio_proyecto",
      "formarme_en_algo_nuevo",
      "explorar_primero_comunidad"
    ],
    communitySpaceHints: [
      "escritura_y_relato",
      "creacion_artistica",
      "obra_en_proceso"
    ],
    exampleUserSignals: [
      "escribo cosas que después no muestro",
      "me nace convertir lo que vivo en texto o escena",
      "tengo carpetas llenas de ideas",
      "cuando algo me pega necesito darle forma"
    ],
    avoidIfSignals: [
      "voz pública y postura como centro principal",
      "análisis político o social sin impulso narrativo",
      "explicación pedagógica como función dominante",
      "comunicación comercial o estratégica como foco principal"
    ]
  },

  {
    id: "acompanar_a_alguien_que_esta_perdido",
    shortLabel: "Acompañar a alguien perdido",
    userFacingText: "Estar cerca de alguien que necesita ser escuchado, ordenar lo que le pasa o bajar un cambio.",
    recognitionPhrase: "Sin buscarlo demasiado, muchas veces terminás siendo la persona con la que otros logran ordenarse por dentro.",
    linkedFamilies: ["empathic_guide", "care_healer", "educator_interpreter"],
    coreAffinities: ["empathic_attunement", "restorative_support", "care_orientation"],
    supportingAffinities: ["trust_building", "reflective_guidance", "meaning_synthesis"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "formarme_en_algo_nuevo",
      "integrar_proyectos_existentes",
      "explorar_primero_comunidad"
    ],
    communitySpaceHints: [
      "escucha_y_acompanamiento",
      "orientacion_humana",
      "procesos_de_transicion"
    ],
    exampleUserSignals: [
      "la gente me termina contando cosas",
      "me sale escuchar sin invadir",
      "suelo ayudar a ordenar lo que alguien siente",
      "me buscan cuando están confundidos"
    ],
    avoidIfSignals: [
      "mediación entre varias partes como centro",
      "construcción de grupos o comunidad como foco principal",
      "cuidado físico o sanitario sostenido como eje dominante",
      "explicación docente más fuerte que acompañamiento humano"
    ]
  },

  {
    id: "ordenar_un_quilombo_donde_nadie_se_pone_de_acuerdo",
    shortLabel: "Ordenar un quilombo",
    userFacingText: "Destrabar situaciones donde hay personas cruzadas, intereses mezclados o decisiones frenadas.",
    recognitionPhrase: "Cuando todo se empasta entre personas, áreas o posiciones, muchas veces terminás ayudando a que algo avance.",
    linkedFamilies: ["diplomatic_social_connector", "institutional_operator", "community_builder", "operational_organizer"],
    coreAffinities: ["social_coordination", "conflict_mediation", "relational_bridge_building"],
    supportingAffinities: ["group_reading", "institutional_navigation", "operational_rhythm"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "integrar_proyectos_existentes",
      "asociarme_con_otras_personas",
      "armar_mi_propio_proyecto"
    ],
    communitySpaceHints: [
      "mediacion_y_acuerdos",
      "coordinacion_de_equipos",
      "proyectos_colectivos"
    ],
    exampleUserSignals: [
      "quedo en el medio",
      "me toca ordenar el quilombo",
      "hablo con uno y con otro para destrabar",
      "me buscan cuando nadie se pone de acuerdo"
    ],
    avoidIfSignals: [
      "escucha uno a uno sin conflicto entre partes",
      "organización operativa sin tensión humana",
      "análisis de escenarios sin actores cruzados",
      "cuidado emocional individual como eje principal"
    ]
  },

  {
    id: "armar_algo_con_otros_desde_cero",
    shortLabel: "Armar algo con otros",
    userFacingText: "Juntar personas, sostener una idea compartida y convertirla en algo que empiece a moverse.",
    recognitionPhrase: "Te interesa que algo no quede sólo en charla: querés juntar gente, moverla y ver si puede convertirse en algo real.",
    linkedFamilies: ["community_builder", "venture_builder", "diplomatic_social_connector"],
    coreAffinities: ["community_impulse", "initiative_drive", "social_coordination"],
    supportingAffinities: ["trust_building", "group_reading", "venture_activation"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "asociarme_con_otras_personas",
      "armar_mi_propio_proyecto",
      "integrar_proyectos_existentes"
    ],
    communitySpaceHints: [
      "grupos_en_formacion",
      "laboratorios_de_proyectos",
      "afinidades_para_construir"
    ],
    exampleUserSignals: [
      "me entusiasma armar algo con otros",
      "si no empujo yo el grupo se enfría",
      "me sale juntar gente",
      "quiero construir algo pero no solo"
    ],
    avoidIfSignals: [
      "acompañamiento individual como centro",
      "relato creativo sin intención colectiva",
      "análisis privado sin deseo de vincular personas",
      "ejecución técnica individual como foco dominante"
    ]
  },

  {
    id: "llevar_una_idea_propia_a_algo_real",
    shortLabel: "Llevar una idea a algo real",
    userFacingText: "Bajar a tierra una idea, intuición o proyecto que todavía está verde pero insiste.",
    recognitionPhrase: "Hay algo dando vueltas que todavía no está armado, pero sentís que podría empezar a existir si encontrás cómo ordenarlo.",
    linkedFamilies: ["venture_builder", "creative_storyteller", "public_communicator", "system_designer", "technical_builder"],
    coreAffinities: ["initiative_drive", "venture_activation", "practical_execution"],
    supportingAffinities: ["narrative_creation", "system_ordering", "public_expression"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "armar_mi_propio_proyecto",
      "asociarme_con_otras_personas",
      "explorar_primero_comunidad"
    ],
    communitySpaceHints: [
      "ideas_en_construccion",
      "proyectos_propios",
      "busqueda_de_colaboradores"
    ],
    exampleUserSignals: [
      "tengo una idea dando vueltas",
      "me falta bajarlo a tierra",
      "veo una oportunidad pero no sé cómo arrancar",
      "necesito ayuda para ordenar un proyecto"
    ],
    avoidIfSignals: [
      "solo curiosidad sin intención de acción",
      "necesidad principal de formación antes de crear",
      "deseo de participar en algo ajeno antes que iniciar",
      "fantasía sin disposición mínima a primer paso"
    ]
  },

  {
    id: "recuperar_una_parte_tuya_que_quedo_tapada",
    shortLabel: "Recuperar algo tapado",
    userFacingText: "Volver a mirar una capacidad, deseo o parte tuya que quedó al costado por trabajo, cuentas o responsabilidades.",
    recognitionPhrase: "Eso no desapareció del todo: aparece de a ratos, pero todavía no tiene el lugar que podría tener.",
    linkedFamilies: ["creative_storyteller", "public_communicator", "community_builder", "empathic_guide", "physical_performer", "artistic_creator"],
    coreAffinities: ["buried_capacity", "buried_desire", "meaning_synthesis"],
    supportingAffinities: ["initiative_drive", "discipline_endurance", "public_expression", "narrative_creation"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "explorar_primero_comunidad",
      "formarme_en_algo_nuevo",
      "armar_mi_propio_proyecto"
    ],
    communitySpaceHints: [
      "reactivacion_vocacional",
      "exploracion_guiada",
      "capacidades_en_pausa"
    ],
    exampleUserSignals: [
      "lo tengo medio tapado",
      "eso me sale pero no lo estoy jugando",
      "lo mío aparece en ratos sueltos",
      "hay una parte mía que quedó para después"
    ],
    avoidIfSignals: [
      "dirección ya plenamente activa y expresada",
      "interés pasajero sin persistencia biográfica",
      "cansancio laboral sin deseo o capacidad identificable",
      "malestar general sin señal vocacional concreta"
    ]
  },

  {
    id: "transformar_bronca_o_preocupacion_en_causa",
    shortLabel: "Transformar bronca en causa",
    userFacingText: "Convertir una preocupación, injusticia o tema que te mueve en una acción concreta con otros.",
    recognitionPhrase: "Hay cosas que te importan demasiado como para quedarte sólo mirando o comentando desde afuera.",
    linkedFamilies: ["civic_advocate", "public_communicator", "community_builder", "institutional_operator"],
    coreAffinities: ["civic_conflict_engagement", "agenda_detection", "public_expression"],
    supportingAffinities: ["social_coordination", "institutional_navigation", "protective_instinct"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "integrar_proyectos_existentes",
      "armar_mi_propio_proyecto",
      "asociarme_con_otras_personas"
    ],
    communitySpaceHints: [
      "causas_y_accion_civica",
      "participacion_comunitaria",
      "voz_publica_y_reclamos"
    ],
    exampleUserSignals: [
      "me indigna ver esto y no hacer nada",
      "me cuesta mirar para otro lado",
      "hay temas que me mueven mucho",
      "quisiera convertir esta bronca en algo útil"
    ],
    avoidIfSignals: [
      "bronca personal sin orientación colectiva",
      "relato íntimo sin deseo de acción",
      "análisis político sin intención de participación",
      "cuidado individual como foco principal"
    ]
  },

  {
    id: "empezar_de_a_poco_sin_tirar_todo_por_el_aire",
    shortLabel: "Empezar sin tirar todo",
    userFacingText: "Moverte hacia algo más propio sin romper de golpe tu economía, tu estabilidad o tus responsabilidades.",
    recognitionPhrase: "Querés moverte, pero no estás dispuesto a destruir lo que todavía necesitás sostener.",
    linkedFamilies: ["transversal"],
    coreAffinities: ["decision_ownership", "adaptive_reframing", "strategic_projection"],
    supportingAffinities: ["duty_reliability", "buried_desire", "buried_capacity"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "formarme_en_algo_nuevo",
      "explorar_primero_comunidad",
      "integrar_proyectos_existentes"
    ],
    communitySpaceHints: [
      "transiciones_graduales",
      "aprendizaje_paso_a_paso",
      "proyectos_de_baja_friccion"
    ],
    exampleUserSignals: [
      "no puedo largar todo de golpe",
      "necesito algo gradual",
      "quiero cambiar pero con cuidado",
      "no me da para hacerme el héroe"
    ],
    avoidIfSignals: [
      "usuario listo para acción fuerte inmediata",
      "ausencia total de deseo de movimiento",
      "bloqueo severo que requiere contención antes que activación",
      "interés puramente exploratorio sin presión de cambio"
    ]
  },

  {
    id: "explicar_lo_dificil_para_que_otros_lo_entiendan",
    shortLabel: "Explicar lo difícil",
    userFacingText: "Agarrar algo complejo, ordenarlo y hacerlo entendible para otras personas.",
    recognitionPhrase: "Muchas veces terminás bajando a palabras simples algo que para otros venía confuso o pesado.",
    linkedFamilies: ["educator_interpreter", "analytical_strategist", "public_communicator", "meaning_synthesizer"],
    coreAffinities: ["teaching_impulse", "meaning_synthesis", "conceptual_abstraction"],
    supportingAffinities: ["pattern_analysis", "public_expression", "editorial_framing"],
    compressionSensitive: false,
    suggestedActivationPaths: [
      "formarme_en_algo_nuevo",
      "integrar_proyectos_existentes",
      "armar_mi_propio_proyecto"
    ],
    communitySpaceHints: [
      "ensenanza_y_divulgacion",
      "traduccion_de_complejidad",
      "contenidos_formativos"
    ],
    exampleUserSignals: [
      "me sale explicar cosas complicadas",
      "la gente entiende mejor cuando yo se lo bajo",
      "ordeno ideas para que otros las entiendan",
      "me buscan cuando algo está confuso"
    ],
    avoidIfSignals: [
      "análisis privado sin deseo de explicar",
      "voz pública centrada en postura antes que enseñanza",
      "acompañamiento emocional sin contenido a traducir",
      "relato creativo como forma principal"
    ]
  },

  {
    id: "resolver_cosas_concretas_y_hacer_que_funcionen",
    shortLabel: "Hacer que funcione",
    userFacingText: "Meter mano, ordenar lo práctico y destrabar cosas concretas hasta que salgan.",
    recognitionPhrase: "Cuando algo falla, se traba o queda a medio camino, tendés a buscar la forma de hacerlo andar.",
    linkedFamilies: ["technical_builder", "operational_organizer", "field_operator", "material_maker"],
    coreAffinities: ["practical_execution", "technical_assembly", "operational_rhythm"],
    supportingAffinities: ["material_transformation", "duty_reliability", "problem_solving"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "integrar_proyectos_existentes",
      "formarme_en_algo_nuevo",
      "armar_mi_propio_proyecto"
    ],
    communitySpaceHints: [
      "oficios_y_hacer_concreto",
      "proyectos_tecnicos",
      "operacion_y_soluciones_practicas"
    ],
    exampleUserSignals: [
      "me doy maña para resolver",
      "si algo se traba meto mano",
      "me gusta dejar las cosas funcionando",
      "prefiero hacer antes que hablar tanto"
    ],
    avoidIfSignals: [
      "análisis estratégico sin ejecución concreta",
      "diseño de sistemas como abstracción principal",
      "mediación humana como foco dominante",
      "creación artística sin resolución práctica"
    ]
  },

  {
    id: "explorar_mundos_ideas_o_temas_que_abren_la_cabeza",
    shortLabel: "Explorar ideas y mundos",
    userFacingText: "Seguir una curiosidad fuerte por temas, culturas, historias, lugares o ideas que te abren la cabeza.",
    recognitionPhrase: "Te pasa que un tema te lleva a otro, una referencia abre otra puerta y terminás conectando mundos distintos.",
    linkedFamilies: ["cultural_explorer", "meaning_synthesizer", "scientific_investigator", "educator_interpreter"],
    coreAffinities: ["curiosity_depth", "exploratory_drive", "meaning_synthesis"],
    supportingAffinities: ["conceptual_abstraction", "evidence_validation", "teaching_impulse"],
    compressionSensitive: true,
    suggestedActivationPaths: [
      "explorar_primero_comunidad",
      "formarme_en_algo_nuevo",
      "integrar_proyectos_existentes"
    ],
    communitySpaceHints: [
      "exploracion_cultural",
      "lecturas_y_referencias",
      "investigacion_y_aprendizaje"
    ],
    exampleUserSignals: [
      "me interesa todo y conecto temas",
      "leo sobre historia cultura política ciencia",
      "un tema me lleva a otro",
      "siento que mi curiosidad quedó encerrada"
    ],
    avoidIfSignals: [
      "necesidad principal de crear obra propia",
      "postura pública como centro",
      "síntesis espiritual o existencial como foco dominante sin exploración amplia",
      "interés pasajero sin continuidad"
    ]
  }
];

export function getGuidedThemesMvpV01(): GuidedTheme[] {
  return guidedThemesMvpV01;
}

export function getGuidedThemeById(id: string): GuidedTheme | undefined {
  return guidedThemesMvpV01.find((theme) => theme.id === id);
}

export function getGuidedThemesByFamily(familyId: string): GuidedTheme[] {
  return guidedThemesMvpV01.filter((theme) =>
    theme.linkedFamilies.includes(familyId)
  );
}

export function getGuidedThemesByAffinity(affinityId: string): GuidedTheme[] {
    return guidedThemesMvpV01.filter((theme) => {
      const coreAffinities = theme.coreAffinities ?? [];
      const supportingAffinities = theme.supportingAffinities ?? [];
  
      return (
        coreAffinities.includes(affinityId) ||
        supportingAffinities.includes(affinityId)
      );
    });
  }