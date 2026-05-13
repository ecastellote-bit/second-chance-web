import type { GuidedTheme, GuidedThemeLayer } from "@/lib/types/guidedThemes";

export const GUIDED_THEMES_MVP_VERSION = "mvp_v0_2";

/**
 * Pegá acá las 12 temáticas madre (una por objeto en el array).
 */
export const guidedThemesMotherV02: GuidedTheme[] = [
    {
      id: "decir_lo_que_otros_no_dicen",
      shortLabel: "Decir lo que falta decir",
      userFacingText: "Poner en palabras algo que otros sienten, piensan o no se animan a decir.",
      recognitionPhrase: "Una y otra vez aparece en vos la necesidad de decir algo que no está siendo dicho.",
      linkedFamilies: ["public_communicator", "civic_advocate", "creative_storyteller"],
      coreAffinities: ["public_expression", "editorial_framing", "agenda_detection"],
      supportingAffinities: ["narrative_creation", "civic_conflict_engagement", "audience_activation"],
      compressionSensitive: true,
      suggestedActivationPaths: ["explorar_primero_comunidad", "integrar_proyectos_existentes", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["voz_publica_y_contenido", "debate_civico_y_opinion", "escritura_mensaje_y_relato"],
      exampleUserSignals: ["me indigna que nadie diga nada", "siempre termino escribiendo lo que otros piensan", "cuando algo me importa no me puedo quedar callado"],
      avoidIfSignals: ["solo escritura íntima sin audiencia", "solo análisis privado sin voluntad de expresión", "acompañamiento uno a uno como centro principal"]
    },
    {
      id: "acompanar_a_alguien_perdido",
      shortLabel: "Acompañar a alguien perdido",
      userFacingText: "Estar cerca de alguien que necesita ser escuchado, ordenar lo que le pasa o bajar un cambio.",
      recognitionPhrase: "Sin buscarlo demasiado, muchas veces terminás siendo la persona con la que otros logran ordenarse por dentro.",
      linkedFamilies: ["empathic_guide", "educator_interpreter"],
      coreAffinities: ["empathic_attunement", "restorative_support", "care_orientation"],
      supportingAffinities: ["trust_building", "teaching_impulse", "meaning_synthesis"],
      compressionSensitive: true,
      suggestedActivationPaths: ["formarme_en_algo_nuevo", "integrar_proyectos_existentes", "explorar_primero_comunidad"],
      communitySpaceHints: ["escucha_y_acompanamiento", "orientacion_humana", "procesos_de_transicion"],
      exampleUserSignals: ["la gente me termina contando cosas", "me sale escuchar sin invadir", "me buscan cuando están confundidos"],
      avoidIfSignals: ["mediación entre varias partes como centro", "construcción de grupos como foco principal", "explicación docente más fuerte que acompañamiento humano"]
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
      suggestedActivationPaths: ["integrar_proyectos_existentes", "asociarme_con_otras_personas", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["mediacion_y_acuerdos", "coordinacion_de_equipos", "proyectos_colectivos"],
      exampleUserSignals: ["quedo en el medio", "me toca ordenar el quilombo", "hablo con uno y con otro para destrabar"],
      avoidIfSignals: ["escucha uno a uno sin conflicto entre partes", "organización operativa sin tensión humana", "análisis de escenarios sin actores cruzados"]
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
      suggestedActivationPaths: ["asociarme_con_otras_personas", "armar_mi_propio_proyecto", "integrar_proyectos_existentes"],
      communitySpaceHints: ["grupos_en_formacion", "laboratorios_de_proyectos", "afinidades_para_construir"],
      exampleUserSignals: ["me entusiasma armar algo con otros", "me sale juntar gente", "quiero construir algo pero no solo"],
      avoidIfSignals: ["acompañamiento individual como centro", "relato creativo sin intención colectiva", "ejecución técnica individual como foco dominante"]
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
      suggestedActivationPaths: ["armar_mi_propio_proyecto", "asociarme_con_otras_personas", "explorar_primero_comunidad"],
      communitySpaceHints: ["ideas_en_construccion", "proyectos_propios", "busqueda_de_colaboradores"],
      exampleUserSignals: ["tengo una idea dando vueltas", "me falta bajarlo a tierra", "veo una oportunidad pero no sé cómo arrancar"],
      avoidIfSignals: ["solo curiosidad sin intención de acción", "necesidad principal de formación antes de crear", "deseo de participar en algo ajeno antes que iniciar"]
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
      suggestedActivationPaths: ["formarme_en_algo_nuevo", "integrar_proyectos_existentes", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["ensenanza_y_divulgacion", "traduccion_de_complejidad", "contenidos_formativos"],
      exampleUserSignals: ["me sale explicar cosas complicadas", "ordeno ideas para que otros las entiendan", "la gente entiende mejor cuando yo se lo bajo"],
      avoidIfSignals: ["análisis privado sin deseo de explicar", "voz pública centrada en postura antes que enseñanza", "relato creativo como forma principal"]
    },
    {
      id: "hacer_que_algo_funcione",
      shortLabel: "Hacer que funcione",
      userFacingText: "Meter mano, ordenar lo práctico y destrabar cosas concretas hasta que salgan.",
      recognitionPhrase: "Cuando algo falla, se traba o queda a medio camino, tendés a buscar la forma de hacerlo andar.",
      linkedFamilies: ["technical_builder", "operational_organizer", "field_operator", "material_maker"],
      coreAffinities: ["practical_execution", "technical_assembly", "operational_rhythm"],
      supportingAffinities: ["material_transformation", "duty_reliability", "problem_solving"],
      compressionSensitive: true,
      suggestedActivationPaths: ["integrar_proyectos_existentes", "formarme_en_algo_nuevo", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["oficios_y_hacer_concreto", "proyectos_tecnicos", "operacion_y_soluciones_practicas"],
      exampleUserSignals: ["me doy maña para resolver", "si algo se traba meto mano", "me gusta dejar las cosas funcionando"],
      avoidIfSignals: ["análisis estratégico sin ejecución concreta", "diseño de sistemas como abstracción principal", "mediación humana como foco dominante"]
    },
    {
      id: "explorar_mundos_ideas_o_temas",
      shortLabel: "Explorar ideas y mundos",
      userFacingText: "Seguir una curiosidad fuerte por temas, culturas, historias, lugares o ideas que te abren la cabeza.",
      recognitionPhrase: "Te pasa que un tema te lleva a otro, una referencia abre otra puerta y terminás conectando mundos distintos.",
      linkedFamilies: ["cultural_explorer", "meaning_synthesizer", "scientific_investigator", "educator_interpreter"],
      coreAffinities: ["curiosity_depth", "exploratory_drive", "meaning_synthesis"],
      supportingAffinities: ["conceptual_abstraction", "evidence_validation", "teaching_impulse"],
      compressionSensitive: true,
      suggestedActivationPaths: ["explorar_primero_comunidad", "formarme_en_algo_nuevo", "integrar_proyectos_existentes"],
      communitySpaceHints: ["exploracion_cultural", "lecturas_y_referencias", "investigacion_y_aprendizaje"],
      exampleUserSignals: ["me interesa todo y conecto temas", "leo sobre historia cultura política ciencia", "un tema me lleva a otro"],
      avoidIfSignals: ["necesidad principal de crear obra propia", "postura pública como centro", "interés pasajero sin continuidad"]
    },
    {
      id: "transformar_sensibilidad_en_obra",
      shortLabel: "Transformar sensibilidad en obra",
      userFacingText: "Convertir una sensibilidad estética, artística o emocional en algo que pueda verse, escucharse o sentirse.",
      recognitionPhrase: "No es sólo que algo te guste: hay una parte tuya que necesita transformarlo en una forma sensible.",
      linkedFamilies: ["artistic_creator", "aesthetic_designer_curator", "creative_storyteller", "performer"],
      coreAffinities: ["aesthetic_sensitivity", "creative_expression", "sensory_awareness"],
      supportingAffinities: ["narrative_creation", "performance_presence", "material_transformation"],
      compressionSensitive: true,
      suggestedActivationPaths: ["armar_mi_propio_proyecto", "formarme_en_algo_nuevo", "explorar_primero_comunidad"],
      communitySpaceHints: ["creacion_artistica", "obra_en_proceso", "estetica_y_expresion"],
      exampleUserSignals: ["tengo sensibilidad para lo visual o lo sonoro", "me importa la forma", "cuando creo algo siento que vuelvo a mí"],
      avoidIfSignals: ["relato verbal como centro exclusivo", "comunicación pública como objetivo principal", "diseño funcional sin búsqueda estética"]
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
      suggestedActivationPaths: ["integrar_proyectos_existentes", "armar_mi_propio_proyecto", "asociarme_con_otras_personas"],
      communitySpaceHints: ["causas_y_accion_civica", "participacion_comunitaria", "voz_publica_y_reclamos"],
      exampleUserSignals: ["me indigna ver esto y no hacer nada", "me cuesta mirar para otro lado", "quisiera convertir esta bronca en algo útil"],
      avoidIfSignals: ["bronca personal sin orientación colectiva", "relato íntimo sin deseo de acción", "cuidado individual como foco principal"]
    },
    {
      id: "entender_sistemas_y_mejorarlos",
      shortLabel: "Entender sistemas y mejorarlos",
      userFacingText: "Mirar cómo está armado algo, detectar fallas de fondo y pensar una estructura mejor.",
      recognitionPhrase: "No te alcanza con arreglar lo que falló: muchas veces querés entender por qué el sistema sigue produciendo el mismo problema.",
      linkedFamilies: ["system_designer", "analytical_strategist", "institutional_operator", "technical_builder"],
      coreAffinities: ["system_ordering", "pattern_analysis", "structural_reasoning"],
      supportingAffinities: ["strategic_projection", "institutional_navigation", "technical_assembly"],
      compressionSensitive: true,
      suggestedActivationPaths: ["integrar_proyectos_existentes", "formarme_en_algo_nuevo", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["sistemas_y_procesos", "mejora_de_estructuras", "arquitectura_de_proyectos"],
      exampleUserSignals: ["esto está mal armado", "siempre se arregla con parches", "hay que cambiar la estructura", "veo por qué se repite el problema"],
      avoidIfSignals: ["resolver fallas puntuales sin interés por estructura", "análisis de personas antes que sistema", "mediación humana como eje dominante"]
    },
    {
      id: "crear_una_experiencia_que_otros_vivan",
      shortLabel: "Crear una experiencia",
      userFacingText: "Pensar el clima, los detalles, la bienvenida o la sensación que una persona se lleva de un espacio.",
      recognitionPhrase: "Te importa no sólo que algo exista, sino cómo se siente estar ahí.",
      linkedFamilies: ["experience_host", "aesthetic_designer_curator", "community_builder", "artistic_creator"],
      coreAffinities: ["experience_design", "aesthetic_sensitivity", "trust_building"],
      supportingAffinities: ["social_coordination", "sensory_awareness", "care_orientation"],
      compressionSensitive: true,
      suggestedActivationPaths: ["armar_mi_propio_proyecto", "integrar_proyectos_existentes", "asociarme_con_otras_personas"],
      communitySpaceHints: ["experiencias_y_eventos", "hospitalidad_y_ambiente", "diseno_de_espacios"],
      exampleUserSignals: ["me fijo mucho en el clima de un lugar", "me importa cómo se siente una experiencia", "pienso detalles que otros no ven"],
      avoidIfSignals: ["sostener comunidad a largo plazo como centro", "obra artística individual como foco", "organización operativa sin sensibilidad experiencial"]
    },
    {
      id: "escuchar_y_acompanar_sin_volverlo_trabajo",
      shortLabel: "Escuchar sin volverlo trabajo",
      userFacingText:
        "Explorar tu capacidad de escuchar y acompañar sin tener que convertirla todavía en trabajo.",
      recognitionPhrase:
        "Una y otra vez terminás siendo alguien que escucha, pero todavía no sabés si eso tiene que volverse camino, servicio o sólo una parte tuya.",
      linkedFamilies: ["empathic_guide", "educator_interpreter"],
      coreAffinities: ["empathic_attunement", "restorative_support", "trust_building"],
      supportingAffinities: ["meaning_synthesis", "care_orientation", "teaching_impulse"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "explorar_primero_comunidad",
        "formarme_en_algo_nuevo",
        "integrar_proyectos_existentes",
      ],
      communitySpaceHints: [
        "escucha_y_acompanamiento",
        "exploracion_de_ayuda",
        "orientacion_humana",
        "cuidado_y_sanacion_conceptual",
      ],
      exampleUserSignals: [
        "la gente me termina contando cosas",
        "me sale escuchar pero no sé si quiero trabajar de esto",
        "siempre acompaño pero no sé qué significa",
        "quiero explorar esto sin apurarme",
      ],
      avoidIfSignals: [
        "intención clara de monetizar inmediatamente",
        "mediación entre partes como centro principal",
        "construcción de comunidad o grupo como foco dominante",
        "explicación pedagógica más fuerte que escucha",
      ],
    },
    {
      id: "formarme_para_acompanar_mejor",
      shortLabel: "Formarme para acompañar mejor",
      userFacingText:
        "Aprender herramientas para escuchar, orientar o acompañar mejor, sin depender sólo de intuición.",
      recognitionPhrase:
        "Sentís que acompañar te sale, pero también que necesitás más estructura, límites y formación para hacerlo bien.",
      linkedFamilies: ["empathic_guide", "educator_interpreter"],
      coreAffinities: ["empathic_attunement", "teaching_impulse", "care_orientation"],
      supportingAffinities: ["trust_building", "adaptive_reframing", "meaning_synthesis"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "formarme_en_algo_nuevo",
        "explorar_primero_comunidad",
        "integrar_proyectos_existentes",
      ],
      communitySpaceHints: ["formacion_en_escucha", "acompanamiento_con_herramientas", "cuidado_y_limites"],
      exampleUserSignals: [
        "me sale acompañar pero improviso demasiado",
        "quisiera aprender a escuchar mejor",
        "necesito herramientas para no hacer daño",
        "me gustaría formarme antes de ayudar más",
      ],
      avoidIfSignals: [
        "rechazo explícito a formarse",
        "deseo principal de liderar grupo",
        "mediación organizacional como centro",
        "ayuda sólo informal sin interés de profundizar",
      ],
    },
    {
      id: "convertir_escucha_en_servicio_real",
      shortLabel: "Escucha como servicio real",
      userFacingText:
        "Explorar si tu capacidad de escuchar, ordenar y acompañar puede convertirse en una ayuda concreta y sostenible.",
      recognitionPhrase:
        "No querés vender humo ni prometer terapia: querés ver si esa capacidad que otros buscan en vos puede tener una forma seria y útil.",
      linkedFamilies: ["empathic_guide", "educator_interpreter", "commercial_connector"],
      coreAffinities: ["empathic_attunement", "trust_building", "practical_execution"],
      supportingAffinities: ["teaching_impulse", "duty_reliability", "care_orientation", "meaning_synthesis"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "armar_mi_propio_proyecto",
        "formarme_en_algo_nuevo",
        "explorar_primero_comunidad",
      ],
      communitySpaceHints: ["servicios_de_acompanamiento", "proyectos_de_ayuda", "primeras_formas_de_servicio"],
      exampleUserSignals: [
        "la gente me busca para hablar y no sé si eso puede ser un servicio",
        "quiero ayudar de forma seria",
        "no quiero hacer terapia trucha",
        "me pregunto si mi escucha puede tener un lugar real",
      ],
      avoidIfSignals: [
        "interés sólo en contención informal",
        "ausencia de deseo de ofrecer ayuda a otros",
        "búsqueda comercial sin cuidado humano",
        "rol principal de mediación entre equipos o instituciones",
      ],
    },
    {
      id: "integrarme_a_un_proyecto_para_acompanar",
      shortLabel: "Sumarme para acompañar",
      userFacingText:
        "Integrarte a un proyecto donde tu rol sea escuchar, ordenar, contener o acompañar procesos humanos.",
      recognitionPhrase:
        "Quizás no querés crear todo desde cero, pero sí participar en algo donde tu presencia ayude a que otros atraviesen mejor un proceso.",
      linkedFamilies: [
        "empathic_guide",
        "community_builder",
        "educator_interpreter",
        "diplomatic_social_connector",
      ],
      coreAffinities: ["empathic_attunement", "social_coordination", "restorative_support"],
      supportingAffinities: [
        "trust_building",
        "group_reading",
        "teaching_impulse",
        "conflict_mediation",
      ],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "integrar_proyectos_existentes",
        "asociarme_con_otras_personas",
        "explorar_primero_comunidad",
      ],
      communitySpaceHints: ["proyectos_de_acompanamiento", "equipos_con_roles_humanos", "orientacion_en_comunidad"],
      exampleUserSignals: [
        "no quiero liderar solo pero sí ayudar",
        "me gustaría sumarme a un proyecto donde pueda acompañar",
        "siento que mi rol podría ser contener u ordenar",
        "quiero aportar mi escucha a algo más grande",
      ],
      avoidIfSignals: [
        "deseo fuerte de proyecto propio como primer paso",
        "necesidad principal de formación antes de participar",
        "preferencia por trabajo individual sin equipo",
        "mediación institucional como foco exclusivo",
      ],
    },
    {
      id: "poner_mi_presencia_al_servicio_de_algo_mas_grande",
      shortLabel: "Acompañar algo más grande",
      userFacingText:
        "Poner tu escucha, presencia o capacidad de ordenar al servicio de una causa, comunidad o proyecto mayor.",
      recognitionPhrase:
        "Tu forma de acompañar parece tener más sentido cuando no queda aislada en charlas sueltas, sino conectada con algo que importa.",
      linkedFamilies: [
        "empathic_guide",
        "community_builder",
        "civic_advocate",
        "diplomatic_social_connector",
      ],
      coreAffinities: ["care_orientation", "initiative_drive", "social_coordination"],
      supportingAffinities: [
        "civic_conflict_engagement",
        "trust_building",
        "relational_bridge_building",
      ],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "integrar_proyectos_existentes",
        "asociarme_con_otras_personas",
        "armar_mi_propio_proyecto",
      ],
      communitySpaceHints: ["acompanamiento_en_causas", "comunidad_y_sosten", "proyectos_con_impacto_humano"],
      exampleUserSignals: [
        "me gustaría ayudar en algo que tenga sentido",
        "no quiero que mi escucha quede sólo en conversaciones sueltas",
        "quisiera aportar a una causa o comunidad",
        "me veo acompañando procesos dentro de algo más grande",
      ],
      avoidIfSignals: [
        "acompañamiento estrictamente uno a uno sin interés colectivo",
        "causa pública sin interés por sostén humano",
        "proyecto técnico sin dimensión interpersonal",
        "búsqueda de formación aislada antes que participación",
      ],
    },
    {
      id: "escuchar_a_fondo_sin_perderme_yo",
      shortLabel: "Escuchar sin perderme",
      userFacingText: "Escuchar a fondo sin quedar atrapado en problemas, emociones o decisiones que no son tuyas.",
      recognitionPhrase:
        "Podés estar para otros, pero necesitás que esa capacidad no te saque de tu propio eje.",
      linkedFamilies: ["empathic_guide", "educator_interpreter"],
      coreAffinities: ["empathic_attunement", "adaptive_reframing", "restorative_support"],
      supportingAffinities: ["care_orientation", "trust_building", "protective_instinct"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "formarme_en_algo_nuevo",
        "explorar_primero_comunidad",
        "integrar_proyectos_existentes",
      ],
      communitySpaceHints: ["acompanamiento_con_limites", "cuidado_sin_sobrecarga", "escucha_cuidada"],
      exampleUserSignals: [
        "escucho mucho pero después quedo drenado",
        "me cuesta no llevarme los problemas de otros",
        "quiero ayudar sin perderme yo",
        "a veces acompaño más de lo que puedo",
      ],
      avoidIfSignals: [
        "mediación entre múltiples actores como centro",
        "organización comunitaria sin desgaste emocional",
        "explicación pedagógica sin carga afectiva",
        "servicio profesional ya estructurado con límites claros",
      ],
    },
  ];

/**
 * Pegá acá las 12 temáticas de subfamilia.
 */
export const guidedThemesSubfamilyV02: GuidedTheme[] = [
    {
      id: "dar_forma_a_lo_que_te_pasa",
      shortLabel: "Dar forma a lo que pasa",
      userFacingText: "Tomar algo vivido, confuso o intenso y darle una forma que puedas mirar, decir o compartir.",
      recognitionPhrase: "A veces no necesitás opinar ni resolver: necesitás encontrar la forma justa para algo que te pasó.",
      linkedFamilies: ["creative_storyteller", "artistic_creator", "meaning_synthesizer"],
      coreAffinities: ["narrative_creation", "symbolic_elaboration", "meaning_synthesis"],
      supportingAffinities: ["aesthetic_sensitivity", "creative_expression"],
      compressionSensitive: true,
      suggestedActivationPaths: ["explorar_primero_comunidad", "formarme_en_algo_nuevo", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["relato_personal", "escritura_y_forma", "obra_intima"],
      exampleUserSignals: ["me pasan cosas y necesito escribirlas", "si no le doy forma me queda adentro", "no sé si es relato o descarga pero vuelve"],
      avoidIfSignals: ["postura pública como centro", "audiencia o agenda como motor principal", "explicación pedagógica dominante"]
    },
    {
      id: "convertir_tu_mundo_interno_en_relato",
      shortLabel: "Convertir mundo interno en relato",
      userFacingText: "Transformar pensamientos, imágenes, emociones o recuerdos en una historia propia.",
      recognitionPhrase: "Tu mundo interno no aparece sólo como idea: muchas veces pide escena, voz, personaje o relato.",
      linkedFamilies: ["creative_storyteller", "artistic_creator"],
      coreAffinities: ["narrative_creation", "inner_world_expression", "creative_expression"],
      supportingAffinities: ["aesthetic_sensitivity", "meaning_synthesis"],
      compressionSensitive: true,
      suggestedActivationPaths: ["armar_mi_propio_proyecto", "formarme_en_algo_nuevo", "explorar_primero_comunidad"],
      communitySpaceHints: ["ficcion_y_mundo_interno", "escritura_creativa", "historias_en_proceso"],
      exampleUserSignals: ["invento escenas en mi cabeza", "tengo personajes o mundos dando vueltas", "me cuesta mostrar lo que escribo"],
      avoidIfSignals: ["opinión pública como eje", "análisis cultural sin creación propia", "sensibilidad estética sin impulso narrativo"]
    },
    {
      id: "pasar_de_escenas_sueltas_a_proyecto_narrativo",
      shortLabel: "De escenas a proyecto",
      userFacingText: "Ordenar escenas, notas o ideas dispersas para convertirlas en una obra o proyecto narrativo.",
      recognitionPhrase: "No te falta material: te falta una forma de juntar lo que aparece suelto y hacerlo avanzar.",
      linkedFamilies: ["creative_storyteller", "system_designer", "aesthetic_designer_curator"],
      coreAffinities: ["narrative_creation", "project_structuring", "editorial_framing"],
      supportingAffinities: ["system_ordering", "aesthetic_sensitivity"],
      compressionSensitive: true,
      suggestedActivationPaths: ["armar_mi_propio_proyecto", "formarme_en_algo_nuevo", "asociarme_con_otras_personas"],
      communitySpaceHints: ["proyectos_narrativos", "guion_y_estructura", "obra_en_desarrollo"],
      exampleUserSignals: ["tengo notas sueltas", "me falta ordenar una historia", "empiezo cosas y no las termino", "tengo escenas pero no proyecto"],
      avoidIfSignals: ["necesidad principal de incidencia pública", "curiosidad cultural sin intención de obra", "ejecución técnica como centro"]
    },
    {
      id: "encontrar_una_puerta_para_tu_voz_narrativa",
      shortLabel: "Encontrar puerta narrativa",
      userFacingText: "Encontrar un primer lugar posible para una voz narrativa que todavía no sabe por dónde salir.",
      recognitionPhrase: "La voz aparece, pero todavía no encontraste el formato, el espacio o el primer paso para probarla.",
      linkedFamilies: ["creative_storyteller", "public_communicator", "educator_interpreter"],
      coreAffinities: ["narrative_creation", "voice_development", "editorial_framing"],
      supportingAffinities: ["public_expression", "meaning_synthesis"],
      compressionSensitive: true,
      suggestedActivationPaths: ["explorar_primero_comunidad", "armar_mi_propio_proyecto", "formarme_en_algo_nuevo"],
      communitySpaceHints: ["primeros_textos", "voz_y_formato", "publicacion_cuidada"],
      exampleUserSignals: ["no sé dónde mostrar lo que escribo", "tengo una voz pero no un formato", "me gustaría probar sin exponerme demasiado"],
      avoidIfSignals: ["voz pública ya definida y orientada a agenda", "solo lectura o análisis sin producción propia", "performance corporal como centro"]
    },
    {
      id: "construir_una_voz_publica",
      shortLabel: "Construir voz pública",
      userFacingText: "Empezar a construir una voz propia sobre temas que te importan y podrían importarle a otros.",
      recognitionPhrase: "No se trata sólo de opinar: querés encontrar una voz clara, reconocible y con sentido público.",
      linkedFamilies: ["public_communicator", "civic_advocate", "educator_interpreter"],
      coreAffinities: ["public_expression", "agenda_detection", "audience_activation"],
      supportingAffinities: ["editorial_framing", "teaching_impulse", "civic_conflict_engagement"],
      compressionSensitive: true,
      suggestedActivationPaths: ["armar_mi_propio_proyecto", "integrar_proyectos_existentes", "explorar_primero_comunidad"],
      communitySpaceHints: ["voz_publica", "opinion_y_contenido", "comunicacion_civica"],
      exampleUserSignals: ["quiero decir algo en público", "me sale ordenar temas para otros", "me gustaría tener un espacio para hablar de esto"],
      avoidIfSignals: ["relato íntimo sin audiencia", "escritura privada como centro", "acompañamiento individual como motivación principal"]
    },
    {
      id: "tomar_posicion_sin_quedar_aislado",
      shortLabel: "Tomar posición sin aislarte",
      userFacingText: "Defender una postura, causa o idea sin quedar solo, roto o peleado con todo el mundo.",
      recognitionPhrase: "Tenés postura, pero necesitás encontrar forma, aliados y contexto para que eso no te deje aislado.",
      linkedFamilies: ["public_communicator", "civic_advocate", "diplomatic_social_connector"],
      coreAffinities: ["public_expression", "civic_conflict_engagement", "relational_bridge_building"],
      supportingAffinities: ["agenda_detection", "conflict_mediation", "audience_activation"],
      compressionSensitive: true,
      suggestedActivationPaths: ["asociarme_con_otras_personas", "integrar_proyectos_existentes", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["causas_y_dialogo", "voz_publica_con_red", "participacion_civica"],
      exampleUserSignals: ["si digo lo que pienso quedo solo", "quiero defender algo sin pelearme con todos", "necesito gente que comparta esta preocupación"],
      avoidIfSignals: ["bronca sin orientación constructiva", "mediación neutral sin toma de postura", "relato expresivo sin causa ni asunto público"]
    },
    {
      id: "acompanar_sin_absorber_la_vida_del_otro",
      shortLabel: "Acompañar sin absorber",
      userFacingText: "Acompañar a alguien sin cargar con toda su vida ni perder tu propio centro.",
      recognitionPhrase: "Te sale estar para otros, pero necesitás que eso no se convierta siempre en cargar más de lo que te corresponde.",
      linkedFamilies: ["empathic_guide", "educator_interpreter"],
      coreAffinities: ["empathic_attunement", "restorative_support", "adaptive_reframing"],
      supportingAffinities: ["care_orientation", "trust_building", "meaning_synthesis"],
      compressionSensitive: true,
      suggestedActivationPaths: ["formarme_en_algo_nuevo", "explorar_primero_comunidad", "integrar_proyectos_existentes"],
      communitySpaceHints: ["acompanamiento_con_limites", "cuidado_y_formacion", "orientacion_humana"],
      exampleUserSignals: ["termino cargando problemas ajenos", "me cuesta poner límites", "ayudo pero después quedo drenado"],
      avoidIfSignals: ["mediación entre partes como centro", "organización comunitaria antes que cuidado individual", "docencia o explicación como eje principal"]
    },
    {
      id: "mediar_entre_partes_sin_ser_sosten_emocional",
      shortLabel: "Mediar sin cargar todo",
      userFacingText: "Ayudar a que personas, áreas o intereses se entiendan sin quedar convertido en sostén emocional de todos.",
      recognitionPhrase: "Sos útil en los cruces, pero no querés que cada tensión ajena termine viviendo en tu espalda.",
      linkedFamilies: ["diplomatic_social_connector", "institutional_operator", "community_builder"],
      coreAffinities: ["conflict_mediation", "multi_actor_coordination", "relational_bridge_building"],
      supportingAffinities: ["institutional_navigation", "group_reading", "boundary_awareness"],
      compressionSensitive: true,
      suggestedActivationPaths: ["integrar_proyectos_existentes", "formarme_en_algo_nuevo", "asociarme_con_otras_personas"],
      communitySpaceHints: ["mediacion_y_roles", "coordinacion_sin_sobrecarga", "equipos_y_acuerdos"],
      exampleUserSignals: ["quedo en el medio y me dreno", "destrabo entre partes pero nadie lo reconoce", "me usan para bajar tensión"],
      avoidIfSignals: ["escucha individual como foco", "acompañamiento emocional íntimo", "operación técnica sin conflicto humano"]
    },
    {
      id: "convertir_criterio_en_estrategia",
      shortLabel: "Convertir criterio en estrategia",
      userFacingText: "Usar tu capacidad de ver patrones, riesgos y alternativas para pensar mejores decisiones.",
      recognitionPhrase: "No es sólo que ves problemas: muchas veces podés ordenar opciones y anticipar consecuencias.",
      linkedFamilies: ["analytical_strategist", "institutional_operator", "system_designer"],
      coreAffinities: ["pattern_analysis", "strategic_projection", "evidence_validation"],
      supportingAffinities: ["system_ordering", "institutional_navigation", "decision_ownership"],
      compressionSensitive: true,
      suggestedActivationPaths: ["integrar_proyectos_existentes", "formarme_en_algo_nuevo", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["estrategia_y_decision", "analisis_de_proyectos", "criterio_y_rumbo"],
      exampleUserSignals: ["veo rápido qué no cierra", "me doy cuenta del riesgo antes", "pongo criterio cuando todos van a las apuradas"],
      avoidIfSignals: ["resolver fallas concretas como gratificación principal", "mediación entre personas como foco", "explicación pedagógica como centro"]
    },
    {
      id: "pasar_de_parches_a_estructura",
      shortLabel: "De parches a estructura",
      userFacingText: "Dejar de resolver sólo urgencias y empezar a pensar una estructura que evite que el problema vuelva.",
      recognitionPhrase: "Te cansa vivir corrigiendo lo mismo: muchas veces ves que el problema está en cómo está armado todo.",
      linkedFamilies: ["system_designer", "analytical_strategist", "technical_builder", "operational_organizer"],
      coreAffinities: ["system_ordering", "structural_reasoning", "process_design"],
      supportingAffinities: ["pattern_analysis", "technical_assembly", "operational_rhythm"],
      compressionSensitive: true,
      suggestedActivationPaths: ["integrar_proyectos_existentes", "armar_mi_propio_proyecto", "formarme_en_algo_nuevo"],
      communitySpaceHints: ["diseno_de_sistemas", "procesos_y_mejora", "estructura_de_proyectos"],
      exampleUserSignals: ["esto siempre se arregla con parches", "el problema es cómo está armado", "estoy cansado de apagar incendios"],
      avoidIfSignals: ["arreglo técnico puntual sin interés estructural", "análisis estratégico sin diseño de sistema", "conflicto humano como eje principal"]
    },
    {
      id: "traducir_complejidad_sin_volverte_el_estratega",
      shortLabel: "Traducir complejidad",
      userFacingText: "Hacer entendible algo difícil sin que tu rol principal sea decidir la estrategia por otros.",
      recognitionPhrase: "Muchas veces tu valor está en traducir, ordenar y hacer comprensible, no necesariamente en mandar o decidir.",
      linkedFamilies: ["educator_interpreter", "meaning_synthesizer", "public_communicator"],
      coreAffinities: ["teaching_impulse", "conceptual_translation", "meaning_synthesis"],
      supportingAffinities: ["public_expression", "pattern_analysis", "editorial_framing"],
      compressionSensitive: false,
      suggestedActivationPaths: ["formarme_en_algo_nuevo", "integrar_proyectos_existentes", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["divulgacion_y_ensenanza", "traduccion_de_ideas", "contenidos_claros"],
      exampleUserSignals: ["me sale hacer fácil algo complicado", "no decido por todos pero ayudo a entender", "ordeno una idea para que otros la usen"],
      avoidIfSignals: ["decisión estratégica como centro", "análisis privado sin voluntad de traducción", "relato artístico como eje principal"]
    },
    {
      id: "cuidar_recursos_que_nadie_ve",
      shortLabel: "Cuidar recursos invisibles",
      userFacingText: "Cuidar tiempo, energía, dinero, materiales o continuidad para que algo pueda sostenerse.",
      recognitionPhrase: "Muchas veces evitás problemas que nadie nota porque justamente no llegaron a explotar.",
      linkedFamilies: ["resource_steward", "operational_organizer", "community_builder"],
      coreAffinities: ["resource_optimization", "duty_reliability", "preventive_care"],
      supportingAffinities: ["operational_rhythm", "stewardship", "community_impulse"],
      compressionSensitive: true,
      suggestedActivationPaths: ["integrar_proyectos_existentes", "formarme_en_algo_nuevo", "asociarme_con_otras_personas"],
      communitySpaceHints: ["gestion_de_recursos", "sostenimiento_de_proyectos", "organizacion_practica"],
      exampleUserSignals: ["cuido que alcance", "veo lo que se está gastando al pedo", "evito desastres que nadie nota"],
      avoidIfSignals: ["operación de tareas sin custodia de recursos", "cuidado emocional como centro", "estrategia abstracta sin manejo material"]
    },
    {
      id: "escuchar_y_acompanar_sin_volverlo_trabajo_subfamilia",
      shortLabel: "Acompañar sin invadir",
      userFacingText:
        "Afinar tu rol de escucha cercana: estar presente y ordenar lo emocional sin tomar decisiones ajenas ni cruzar límites de intimidad.",
      recognitionPhrase:
        "Te sale contener y clarificar, pero necesitás marcar hasta dónde es tu lugar y cuándo conviene frenar o derivar.",
      linkedFamilies: ["empathic_guide", "educator_interpreter"],
      coreAffinities: ["empathic_attunement", "trust_building", "care_orientation"],
      supportingAffinities: ["meaning_synthesis", "teaching_impulse", "restorative_support"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "explorar_primero_comunidad",
        "formarme_en_algo_nuevo",
        "integrar_proyectos_existentes",
      ],
      communitySpaceHints: [
        "limites_en_escucha",
        "acompanamiento_sin_invadir",
        "rol_empatico_vs_terapeutico_informal",
      ],
      exampleUserSignals: [
        "me piden consejo y después se enojan si no hago lo que quieren",
        "no sé cuándo dejar de preguntar",
        "me cuesta no meterme en decisiones ajenas",
        "quiero ayudar sin ser la persona que manda en la vida del otro",
      ],
      avoidIfSignals: [
        "mediación entre varias partes como centro principal",
        "construcción de comunidad o grupo como foco dominante",
        "liderazgo de agenda colectiva como motor principal",
        "necesidad explícita de mediación institucional permanente",
      ],
    },
    {
      id: "formarme_para_acompanar_mejor_subfamilia",
      shortLabel: "Orientar sin dirigir la vida del otro",
      userFacingText:
        "Distinguir cuándo tu rol es clarificar marcos o enseñar (educator_interpreter) y cuándo se confunde con decidir el rumbo personal de quien escucha.",
      recognitionPhrase:
        "Te interesa formarte para acompañar mejor, pero no querés convertirte en la persona que “manda” la vida del otro.",
      linkedFamilies: ["educator_interpreter", "empathic_guide"],
      coreAffinities: ["teaching_impulse", "empathic_attunement", "meaning_synthesis"],
      supportingAffinities: ["trust_building", "care_orientation", "evidence_validation"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "formarme_en_algo_nuevo",
        "explorar_primero_comunidad",
        "integrar_proyectos_existentes",
      ],
      communitySpaceHints: [
        "ensenanza_vs_terapia_informal",
        "orientacion_con_marcos",
        "acompanamiento_pedagogico",
      ],
      exampleUserSignals: [
        "me dicen que explico bien pero no quiero mandar",
        "tengo miedo de “equipararme” y después dirigir demás",
        "quiero herramientas sin convertirme en autoridad de la vida ajena",
        "me confundo entre enseñar y aconsejar en lo personal",
      ],
      avoidIfSignals: [
        "deseo principal de liderar grupo o tribuna",
        "mediación organizacional como centro",
        "rol docente ante multitudes sin vínculo uno a uno",
      ],
    },
    {
      id: "convertir_escucha_en_servicio_real_subfamilia",
      shortLabel: "Uno a uno vs sostén comunitario",
      userFacingText:
        "Ver si tu ayuda se parece más a acompañamiento individual (empathic_guide) o a sostener grupos o redes (community_builder), sin mezclar las dos sin querer.",
      recognitionPhrase:
        "La duda no es solo si ayudás: es en qué escala y con qué responsabilidad lo hacés.",
      linkedFamilies: ["empathic_guide", "community_builder", "commercial_connector"],
      coreAffinities: ["empathic_attunement", "social_coordination", "trust_building"],
      supportingAffinities: ["group_reading", "care_orientation", "initiative_drive"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "explorar_primero_comunidad",
        "integrar_proyectos_existentes",
        "armar_mi_propio_proyecto",
      ],
      communitySpaceHints: [
        "acompanamiento_individual_vs_grupo",
        "servicio_en_red",
        "primeras_formas_de_oferta",
      ],
      exampleUserSignals: [
        "me buscan uno a uno pero también me piden armar grupo",
        "no sé si mi lugar es íntimo o comunitario",
        "me cuesta cobrar si es solo charla",
        "siento que diluyo mi energía entre muchas personas",
      ],
      avoidIfSignals: [
        "rol principal de mediación entre equipos o instituciones",
        "proyecto técnico sin dimensión interpersonal",
        "interés puramente comercial sin cuidado humano",
      ],
    },
    {
      id: "integrarme_a_un_proyecto_para_acompanar_subfamilia",
      shortLabel: "Acompañar en equipo sin ser el mediador de todos",
      userFacingText:
        "Participar en proyectos humanos sin quedar siempre como el puente oficial entre partes: distinguir diplomático de guía empático.",
      recognitionPhrase:
        "Te suman por tu calma humana, pero también te enrolean en el cruce entre áreas o personas.",
      linkedFamilies: ["diplomatic_social_connector", "empathic_guide", "institutional_operator"],
      coreAffinities: ["relational_bridge_building", "empathic_attunement", "social_coordination"],
      supportingAffinities: ["conflict_mediation", "trust_building", "group_reading", "institutional_navigation"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "integrar_proyectos_existentes",
        "asociarme_con_otras_personas",
        "explorar_primero_comunidad",
      ],
      communitySpaceHints: [
        "rol_humano_en_proyecto",
        "acompanamiento_vs_mediacion_permanente",
        "equipos_institucionales",
      ],
      exampleUserSignals: [
        "me suman al proyecto pero después quedo de intérprete entre todos",
        "no quiero ser el único que habla con cada parte",
        "mi rol humano se mezcla con el quilombo entre áreas",
        "prefiero acompañar procesos que mediar todo el tiempo",
      ],
      avoidIfSignals: [
        "acompañamiento puramente uno a uno sin tensión multi-actor",
        "preferencia por trabajo individual sin equipo",
        "necesidad exclusiva de mediación legal o formal",
      ],
    },
    {
      id: "poner_mi_presencia_al_servicio_de_algo_mas_grande_subfamilia",
      shortLabel: "Causa pública sin perder calidez",
      userFacingText:
        "Cuándo tu presencia aporta a advocacía o mensaje público (civic_advocate / public_communicator) y cuándo sigue siendo sobre todo escucha íntima.",
      recognitionPhrase:
        "Te mueve lo colectivo, pero no querés diluir la calidad de contacto humano en megáfono vacío.",
      linkedFamilies: ["civic_advocate", "community_builder", "public_communicator"],
      coreAffinities: ["civic_conflict_engagement", "public_expression", "social_coordination"],
      supportingAffinities: ["trust_building", "editorial_framing", "care_orientation", "relational_bridge_building"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "integrar_proyectos_existentes",
        "asociarme_con_otras_personas",
        "armar_mi_propio_proyecto",
      ],
      communitySpaceHints: [
        "causa_y_mensaje_publico",
        "comunidad_con_rostro_humano",
        "voz_publica_con_sosten",
      ],
      exampleUserSignals: [
        "me llaman para causas pero después es solo ruido",
        "no quiero perder la calidez por la tribuna",
        "me cuesta ver si mi rol es vocero o contención",
        "quiero impacto sin perder cercanía",
      ],
      avoidIfSignals: [
        "acompañamiento estrictamente uno a uno sin interés colectivo",
        "proyecto técnico sin dimensión interpersonal",
        "solo performance mediática sin vínculo",
      ],
    },
    {
      id: "escuchar_a_fondo_sin_perderme_yo_subfamilia",
      shortLabel: "Conversaciones difíciles sin mediar todo",
      userFacingText:
        "Ayudar a que dos o más personas se entiendan sin convertirte en el mediador permanente: entre escucha profunda y rol diplomático.",
      recognitionPhrase:
        "Podés traducir posiciones o bajar tensión en una charla, pero no querés que eso sea tu identidad obligatoria en todos lados.",
      linkedFamilies: ["empathic_guide", "diplomatic_social_connector", "educator_interpreter"],
      coreAffinities: ["empathic_attunement", "conflict_mediation", "relational_bridge_building"],
      supportingAffinities: ["trust_building", "teaching_impulse", "care_orientation", "group_reading"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "formarme_en_algo_nuevo",
        "integrar_proyectos_existentes",
        "explorar_primero_comunidad",
      ],
      communitySpaceHints: [
        "conversaciones_tensas",
        "mediacion_puntual_vs_permanente",
        "traduccion_de_posiciones",
      ],
      exampleUserSignals: [
        "me piden que hable con cada uno por separado",
        "bajo la tensión pero después me quedo como enlace",
        "no quiero ser el terapeuta informal del equipo",
        "prefiero una intervención clara a sostener el conflicto eterno",
      ],
      avoidIfSignals: [
        "servicio profesional ya estructurado con límites claros",
        "solo análisis estratégico sin personas cruzadas",
        "cuidado clínico formal como contexto principal",
      ],
    },
  ];

/**
 * Pegá acá las 12 temáticas de compresión / activación.
 */
export const guidedThemesCompressionActivationV02: GuidedTheme[] = [
    {
      id: "recuperar_una_parte_tuya_que_quedo_tapada",
      shortLabel: "Recuperar algo tapado",
      userFacingText: "Volver a mirar una capacidad, deseo o parte tuya que quedó al costado por trabajo, cuentas o responsabilidades.",
      recognitionPhrase: "Eso no desapareció del todo: aparece de a ratos, pero todavía no tiene el lugar que podría tener.",
      linkedFamilies: ["creative_storyteller", "public_communicator", "community_builder", "empathic_guide", "physical_performer", "artistic_creator"],
      coreAffinities: ["buried_capacity", "buried_desire", "meaning_synthesis"],
      supportingAffinities: ["initiative_drive", "discipline_endurance", "public_expression", "narrative_creation"],
      compressionSensitive: true,
      suggestedActivationPaths: ["explorar_primero_comunidad", "formarme_en_algo_nuevo", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["reactivacion_vocacional", "exploracion_guiada", "capacidades_en_pausa"],
      exampleUserSignals: ["lo tengo medio tapado", "eso me sale pero no lo estoy jugando", "hay una parte mía que quedó para después"],
      avoidIfSignals: ["dirección ya plenamente activa", "interés pasajero sin persistencia biográfica", "malestar general sin señal vocacional concreta"]
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
      suggestedActivationPaths: ["formarme_en_algo_nuevo", "explorar_primero_comunidad", "integrar_proyectos_existentes"],
      communitySpaceHints: ["transiciones_graduales", "aprendizaje_paso_a_paso", "proyectos_de_baja_friccion"],
      exampleUserSignals: ["no puedo largar todo de golpe", "necesito algo gradual", "quiero cambiar pero con cuidado"],
      avoidIfSignals: ["usuario listo para acción fuerte inmediata", "ausencia total de deseo de movimiento", "bloqueo severo que requiere contención antes que activación"]
    },
    {
      id: "convertir_una_oportunidad_bloqueada_en_prueba_chica",
      shortLabel: "Probar una puerta chica",
      userFacingText: "Tomar una oportunidad que nunca llegó y convertirla en una prueba pequeña, posible y concreta.",
      recognitionPhrase: "Quizás no necesitás una gran puerta de entrada todavía; necesitás una primera prueba que te permita comprobar si hay algo ahí.",
      linkedFamilies: ["venture_builder", "creative_storyteller", "technical_builder", "public_communicator", "community_builder"],
      coreAffinities: ["frustrated_opportunity", "initiative_drive", "experimentation"],
      supportingAffinities: ["buried_capacity", "adaptive_reframing", "practical_execution"],
      compressionSensitive: true,
      suggestedActivationPaths: ["armar_mi_propio_proyecto", "integrar_proyectos_existentes", "explorar_primero_comunidad"],
      communitySpaceHints: ["pruebas_chicas", "primeros_pasos", "microproyectos"],
      exampleUserSignals: ["nunca tuve la oportunidad", "no sé por dónde entrar", "quiero probar sin jugarme todo"],
      avoidIfSignals: ["dirección ya validada y activa", "fantasía sin disposición a prueba mínima", "necesidad principal de contención emocional"]
    },
    {
      id: "pasar_de_apagar_incendios_a_construir_rumbo",
      shortLabel: "De urgencia a rumbo",
      userFacingText: "Dejar de usar lo mejor de vos sólo para resolver urgencias y empezar a convertirlo en dirección.",
      recognitionPhrase: "Lo que hacés bajo presión puede estar mostrando una capacidad que merece mejor lugar.",
      linkedFamilies: ["analytical_strategist", "technical_builder", "diplomatic_social_connector", "operational_organizer"],
      coreAffinities: ["functional_adaptation", "buried_capacity", "reactive_use"],
      supportingAffinities: ["pattern_analysis", "practical_execution", "social_coordination"],
      compressionSensitive: true,
      suggestedActivationPaths: ["integrar_proyectos_existentes", "formarme_en_algo_nuevo", "armar_mi_propio_proyecto"],
      communitySpaceHints: ["salir_del_modo_bombero", "reordenar_capacidades", "proyectos_con_estructura"],
      exampleUserSignals: ["uso lo mejor mío para apagar incendios", "siempre entro cuando ya explotó", "sé que podría servir antes del quilombo"],
      avoidIfSignals: ["urgencia sin capacidad diferenciada", "cansancio puro sin patrón repetido", "dirección ya desplegada sin compresión"]
    },
    {
      id: "salir_de_sostener_todo_solo",
      shortLabel: "No sostener todo solo",
      userFacingText: "Dejar de cargar con personas, grupos o proyectos como si todo dependiera de vos.",
      recognitionPhrase: "Muchas veces sostenés más de lo que se ve, pero eso no significa que tengas que hacerlo sin red.",
      linkedFamilies: ["empathic_guide", "community_builder", "diplomatic_social_connector"],
      coreAffinities: ["duty_reliability", "care_orientation", "relational_bridge_building"],
      supportingAffinities: ["trust_building", "initiative_drive", "adaptive_reframing"],
      compressionSensitive: true,
      suggestedActivationPaths: ["asociarme_con_otras_personas", "explorar_primero_comunidad", "formarme_en_algo_nuevo"],
      communitySpaceHints: ["sosten_con_red", "roles_y_limites", "acompanamiento_sin_sobrecarga"],
      exampleUserSignals: ["me cae todo a mí", "si no estoy yo se cae", "termino sosteniendo a todos"],
      avoidIfSignals: ["liderazgo elegido y disfrutado", "acción individual sin carga de otros", "simple responsabilidad sin desgaste"]
    },
    {
      id: "volver_al_cuerpo_al_movimiento_o_al_rendimiento",
      shortLabel: "Volver al cuerpo",
      userFacingText: "Reabrir una parte tuya ligada al deporte, el movimiento, la práctica física o el rendimiento.",
      recognitionPhrase: "Cuando volvés al cuerpo, aparece una energía que quizás tu vida actual dejó demasiado afuera.",
      linkedFamilies: ["cultural_explorer", "community_builder", "creative_storyteller"],
      coreAffinities: ["physical_mastery", "discipline_endurance", "energy_transmission"],
      supportingAffinities: ["competitive_push", "care_orientation", "performance_presence"],
      compressionSensitive: true,
      suggestedActivationPaths: ["formarme_en_algo_nuevo", "asociarme_con_otras_personas", "explorar_primero_comunidad"],
      communitySpaceHints: ["cuerpo_y_movimiento", "deporte_y_practica", "disciplina_fisica"],
      exampleUserSignals: ["de chico entrenaba", "cuando me muevo vuelvo a mí", "el cuerpo quedó para después"],
      avoidIfSignals: ["salud general sin vínculo vocacional", "performance escénica sin práctica física", "cuidado sanitario como centro principal"]
    },
    {
      id: "encontrar_gente_compatible_sin_explicarte_tanto",
      shortLabel: "Encontrar gente compatible",
      userFacingText: "Encontrar personas con intereses, búsquedas o energía parecida sin tener que empezar explicándote desde cero.",
      recognitionPhrase: "A veces no te falta deseo: te falta gente con la que eso pueda respirar.",
      linkedFamilies: ["community_builder", "creative_storyteller", "public_communicator", "cultural_explorer", "venture_builder"],
      coreAffinities: ["affinity_seeking", "community_impulse", "trust_building"],
      supportingAffinities: ["relational_bridge_building", "buried_desire", "initiative_drive"],
      compressionSensitive: true,
      suggestedActivationPaths: ["asociarme_con_otras_personas", "explorar_primero_comunidad", "integrar_proyectos_existentes"],
      communitySpaceHints: ["afinidades_compartidas", "encuentros_guiados", "busqueda_de_pares"],
      exampleUserSignals: ["no tengo con quién hablar de esto", "me falta gente parecida", "siento que solo no lo voy a mover"],
      avoidIfSignals: ["necesidad principal de trabajo individual", "rechazo explícito al vínculo", "búsqueda de formación técnica antes que conexión"]
    },
    {
      id: "probar_antes_de_decidir",
      shortLabel: "Probar antes de decidir",
      userFacingText: "Entrar en una experiencia chica antes de tomar una decisión grande sobre tu camino.",
      recognitionPhrase: "No necesitás resolver toda tu vida ahora; quizás necesitás una prueba real que te dé información.",
      linkedFamilies: ["transversal"],
      coreAffinities: ["experimentation", "decision_ownership", "adaptive_reframing"],
      supportingAffinities: ["fear_of_change", "buried_desire", "growth_readiness"],
      compressionSensitive: true,
      suggestedActivationPaths: ["integrar_proyectos_existentes", "explorar_primero_comunidad", "formarme_en_algo_nuevo"],
      communitySpaceHints: ["experiencias_de_prueba", "primeros_movimientos", "exploracion_sin_volantazo"],
      exampleUserSignals: ["no sé si esto es para mí", "quiero probar antes de cambiar todo", "necesito ver cómo me siento haciéndolo"],
      avoidIfSignals: ["usuario ya listo para proyecto propio", "bloqueo extremo sin energía de prueba", "dirección completamente ausente"]
    },
    {
      id: "transformar_una_habilidad_invisible_en_camino",
      shortLabel: "Habilidad invisible en camino",
      userFacingText: "Reconocer una capacidad que otros usan o valoran, pero que todavía no tiene nombre ni camino claro.",
      recognitionPhrase: "Quizás eso que hacés casi sin darte cuenta no es menor: puede ser una pista de dirección.",
      linkedFamilies: ["diplomatic_social_connector", "empathic_guide", "operational_organizer", "resource_steward", "aesthetic_designer_curator"],
      coreAffinities: ["invisible_value", "buried_capacity", "repeated_pattern"],
      supportingAffinities: ["trust_building", "operational_rhythm", "aesthetic_sensitivity"],
      compressionSensitive: true,
      suggestedActivationPaths: ["explorar_primero_comunidad", "formarme_en_algo_nuevo", "integrar_proyectos_existentes"],
      communitySpaceHints: ["habilidades_invisibles", "patrones_repetidos", "reconocimiento_vocacional"],
      exampleUserSignals: ["siempre me buscan para eso pero no sé qué es", "eso no figura en ningún puesto", "me sale pero no sé cómo llamarlo"],
      avoidIfSignals: ["habilidad ya profesionalizada", "interés no repetido", "autopercepción sin evidencia narrativa"]
    },
    {
      id: "pasar_de_interes_a_practica",
      shortLabel: "Del interés a la práctica",
      userFacingText: "Convertir un interés que vuelve una y otra vez en una práctica concreta, aunque empiece pequeña.",
      recognitionPhrase: "Hay intereses que no se van; la pregunta es si alguno merece empezar a tener forma de práctica.",
      linkedFamilies: ["cultural_explorer", "artistic_creator", "technical_builder", "educator_interpreter", "physical_performer"],
      coreAffinities: ["persistent_interest", "practice_readiness", "discipline_endurance"],
      supportingAffinities: ["curiosity_depth", "creative_expression", "technical_assembly"],
      compressionSensitive: true,
      suggestedActivationPaths: ["formarme_en_algo_nuevo", "explorar_primero_comunidad", "integrar_proyectos_existentes"],
      communitySpaceHints: ["practicas_iniciales", "aprendizaje_concreto", "rutinas_de_exploracion"],
      exampleUserSignals: ["siempre vuelvo a esto", "me interesa hace años pero no lo practico", "quiero pasar de mirar a hacer"],
      avoidIfSignals: ["curiosidad pasajera", "proyecto ya activo", "necesidad principal de comunidad antes que práctica"]
    },
    {
      id: "pedir_apoyo_para_una_idea_propia",
      shortLabel: "Pedir apoyo para una idea",
      userFacingText: "Presentar una idea propia de forma simple para encontrar apoyo, mirada o personas que puedan ayudarla a crecer.",
      recognitionPhrase: "No tenés que tener todo resuelto para mostrar una primera versión de algo que te importa.",
      linkedFamilies: ["venture_builder", "creative_storyteller", "public_communicator", "community_builder", "system_designer"],
      coreAffinities: ["initiative_drive", "support_seeking", "venture_activation"],
      supportingAffinities: ["narrative_creation", "social_coordination", "system_ordering"],
      compressionSensitive: true,
      suggestedActivationPaths: ["armar_mi_propio_proyecto", "asociarme_con_otras_personas", "explorar_primero_comunidad"],
      communitySpaceHints: ["presentacion_de_ideas", "apoyo_a_proyectos", "colaboradores_iniciales"],
      exampleUserSignals: ["tengo una idea pero me falta gente", "no sé cómo presentarla", "necesito que alguien me ayude a ordenarla"],
      avoidIfSignals: ["usuario que prefiere sumarse a algo ajeno", "idea demasiado indefinida sin primer gesto", "interés puramente formativo"]
    },
    {
      id: "convertir_malestar_en_primer_movimiento",
      shortLabel: "Del malestar al movimiento",
      userFacingText: "Usar una incomodidad real como punto de partida para un movimiento concreto, chico y posible.",
      recognitionPhrase: "No hace falta convertir todo el malestar en una respuesta perfecta; alcanza con encontrar un primer movimiento honesto.",
      linkedFamilies: ["transversal"],
      coreAffinities: ["meaning_loss", "activation_readiness", "decision_ownership"],
      supportingAffinities: ["buried_desire", "adaptive_reframing", "fear_of_change"],
      compressionSensitive: true,
      suggestedActivationPaths: ["explorar_primero_comunidad", "formarme_en_algo_nuevo", "integrar_proyectos_existentes"],
      communitySpaceHints: ["primer_movimiento", "activacion_suave", "salida_del_estancamiento"],
      exampleUserSignals: ["no sé qué quiero pero no quiero seguir igual", "algo me incomoda hace tiempo", "necesito empezar por algo chico"],
      avoidIfSignals: ["crisis severa que requiere contención externa", "ausencia total de energía para acción", "dirección clara ya elegida"]
    },
    {
      id: "escuchar_y_acompanar_sin_volverlo_trabajo_compresion_activacion",
      shortLabel: "Vocación o carga repetida",
      userFacingText:
        "Mirar si tu escucha aparece como algo vivo o como un rol que te repiten hasta agotarte: distinguir llamado de hábito impuesto.",
      recognitionPhrase:
        "A veces no es que no quieras escuchar: es que se volvió automático y nadie pregunta si todavía te cabe.",
      linkedFamilies: ["empathic_guide", "community_builder"],
      coreAffinities: ["empathic_attunement", "restorative_support", "duty_reliability"],
      supportingAffinities: ["trust_building", "care_orientation", "adaptive_reframing"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "explorar_primero_comunidad",
        "formarme_en_algo_nuevo",
        "integrar_proyectos_existentes",
      ],
      communitySpaceHints: [
        "escucha_como_rol_impuesto",
        "fatiga_de_sostén",
        "vocacion_vs_obligacion_afectiva",
      ],
      exampleUserSignals: [
        "me siento mal si digo que no puedo escuchar",
        "me llaman para lo mismo y ya no sé si quiero",
        "siento que me usan la buena onda",
        "la escucha se volvió una carga más del día",
      ],
      avoidIfSignals: [
        "intención clara de monetizar inmediatamente",
        "mediación entre partes como centro principal",
        "dirección clara ya elegida sin conflicto interno",
      ],
    },
    {
      id: "formarme_para_acompanar_mejor_compresion_activacion",
      shortLabel: "Mi escucha quedó tapada",
      userFacingText:
        "Reconectar con la parte tuya que escucha y ordena, cuando el laburo, las cuentas o el ritmo la dejaron en segundo plano o a escondidas.",
      recognitionPhrase:
        "No es que desapareció: aparece de golpe en crisis ajenas o de noche, pero no tiene un lugar honesto en tu semana.",
      linkedFamilies: ["empathic_guide", "educator_interpreter"],
      coreAffinities: ["empathic_attunement", "teaching_impulse", "meaning_synthesis"],
      supportingAffinities: ["initiative_drive", "discipline_endurance", "trust_building"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "formarme_en_algo_nuevo",
        "explorar_primero_comunidad",
        "armar_mi_propio_proyecto",
      ],
      communitySpaceHints: [
        "capacidad_enterrada",
        "transicion_sin_romper_sosten",
        "primer_espacio_para_escucha",
      ],
      exampleUserSignals: [
        "solo escucho cuando ya estoy fundido",
        "entre el laburo y la familia no me queda espacio",
        "siento culpa si pienso en mí",
        "quiero un primer paso sin largar todo",
      ],
      avoidIfSignals: [
        "rechazo explícito a formarse",
        "crisis severa que requiere contención externa",
        "ausencia total de energía para acción",
      ],
    },
    {
      id: "convertir_escucha_en_servicio_real_compresion_activacion",
      shortLabel: "Primer paso hacia un servicio serio",
      userFacingText:
        "Bajar a tierra la idea de ofrecer ayuda concreta sin prometer terapia ni roles que no podés sostener: un primer movimiento honesto.",
      recognitionPhrase:
        "Te da vergüenza cobrar, te da miedo prometer, pero también te incomoda que quede solo en charla gratis eterna.",
      linkedFamilies: ["empathic_guide", "commercial_connector", "educator_interpreter"],
      coreAffinities: ["empathic_attunement", "practical_execution", "trust_building"],
      supportingAffinities: ["teaching_impulse", "duty_reliability", "care_orientation", "evidence_validation"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "armar_mi_propio_proyecto",
        "formarme_en_algo_nuevo",
        "explorar_primero_comunidad",
      ],
      communitySpaceHints: [
        "oferta_inicial_sin_humoo",
        "limites_y_contrato_humano",
        "servicio_pequeno_sostenible",
      ],
      exampleUserSignals: [
        "no sé cuánto cobrar o si cobrar",
        "tengo miedo de prometer sanación",
        "quiero ayudar pero con límites claros",
        "necesito una forma chica de empezar",
      ],
      avoidIfSignals: [
        "interés sólo en contención informal sin ningún gesto hacia oferta",
        "búsqueda comercial sin cuidado humano",
        "rol principal de mediación entre equipos o instituciones",
      ],
    },
    {
      id: "integrarme_a_un_proyecto_para_acompanar_compresion_activacion",
      shortLabel: "Ayudo en mil lados, sin lugar",
      userFacingText:
        "Cuando tu escucha se fragmenta entre muchos pedidos y no termina de integrarse a un proyecto con nombre y límites.",
      recognitionPhrase:
        "Sos el “puente humano” informal de varios mundos, pero eso te deja sin un lugar propio ni protección.",
      linkedFamilies: ["diplomatic_social_connector", "community_builder", "empathic_guide"],
      coreAffinities: ["relational_bridge_building", "social_coordination", "empathic_attunement"],
      supportingAffinities: ["conflict_mediation", "trust_building", "group_reading", "initiative_drive"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "integrar_proyectos_existentes",
        "explorar_primero_comunidad",
        "asociarme_con_otras_personas",
      ],
      communitySpaceHints: [
        "fragmentacion_de_ayuda",
        "rol_invisible_en_equipos",
        "pedir_lugar_con_limites",
      ],
      exampleUserSignals: [
        "estoy en todos lados pero en ningún acta",
        "me piden favores humanos fuera de horario",
        "no tengo un proyecto que me nombre el rol",
        "quiero integrarme pero con reglas",
      ],
      avoidIfSignals: [
        "deseo fuerte de proyecto propio como primer paso sin tolerancia a sumarse",
        "preferencia por trabajo individual sin equipo",
        "mediación institucional formal como único foco",
      ],
    },
    {
      id: "poner_mi_presencia_al_servicio_de_algo_mas_grande_compresion_activacion",
      shortLabel: "Causa grande, cuerpo chico",
      userFacingText:
        "Cuando te moviliza una causa o comunidad pero el cuerpo, el tiempo o la economía no dan más: activar sin quemarte.",
      recognitionPhrase:
        "Te importa lo colectivo, pero sentís que lo das todo en charlas y tareas invisibles sin sostén.",
      linkedFamilies: ["civic_advocate", "community_builder", "empathic_guide"],
      coreAffinities: ["civic_conflict_engagement", "initiative_drive", "social_coordination"],
      supportingAffinities: [
        "care_orientation",
        "trust_building",
        "relational_bridge_building",
        "duty_reliability",
      ],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "integrar_proyectos_existentes",
        "explorar_primero_comunidad",
        "formarme_en_algo_nuevo",
      ],
      communitySpaceHints: [
        "sobrecarga_en_causa",
        "sosten_del_activista",
        "comunidad_sin_autocuidado",
      ],
      exampleUserSignals: [
        "doy más de lo que puedo en la causa",
        "me siento culpable si aflojo",
        "termino conteniendo a todos en el grupo",
        "necesito ritmo y límites sin dejar de importarme",
      ],
      avoidIfSignals: [
        "proyecto técnico sin dimensión interpersonal",
        "acompañamiento estrictamente uno a uno sin interés colectivo",
        "dirección clara ya elegida sin tensión de sostén",
      ],
    },
    {
      id: "sostener_comunidad_sin_secarme_compresion_activacion",
      shortLabel: "Sostener comunidad sin secarme",
      userFacingText:
        "Reconectar con tu impulso de armar red y sostener espacio compartido, pero con reglas para que no dependa sólo de tu energía personal.",
      recognitionPhrase:
        "Sos quien empuja el hilo para que el grupo no se enfríe, pero hoy eso te deja seco y sin margen.",
      linkedFamilies: ["community_builder", "empathic_guide"],
      coreAffinities: ["social_coordination", "group_reading", "initiative_drive"],
      supportingAffinities: ["trust_building", "care_orientation", "duty_reliability", "discipline_endurance"],
      compressionSensitive: true,
      priorityWeight: 1.12,
      suggestedActivationPaths: [
        "integrar_proyectos_existentes",
        "explorar_primero_comunidad",
        "asociarme_con_otras_personas",
      ],
      communitySpaceHints: [
        "comunidad_con_limites",
        "sosten_grupal_sostenible",
        "primer_paso_sin_cargar_todo",
      ],
      exampleUserSignals: [
        "si no muevo yo se enfría todo",
        "mi impulso comunitario está ahogado",
        "no me queda resto para sostener grupos",
        "quiero volver a armar red sin ser el único motor",
      ],
      avoidIfSignals: [
        "centro exclusivamente mediación entre instituciones sin tejido comunitario",
        "dirección clara ya elegida sin tensión de sostén grupal",
        "ausencia total de señales de grupo, red o espacio compartido",
      ],
    },
    {
      id: "reactivar_red_comunitaria_con_limites_compresion_activacion",
      shortLabel: "Volver a armar red sin cargar con todo",
      userFacingText:
        "Diseñar un primer paso para que algo compartido no se muera, sin volverte el sostén invisible de cada detalle.",
      recognitionPhrase:
        "Te importa la continuidad colectiva, pero necesitás que otros también empujen y que vos no quedés como único recordatorio.",
      linkedFamilies: ["community_builder", "diplomatic_social_connector"],
      coreAffinities: ["social_coordination", "trust_building", "relational_bridge_building"],
      supportingAffinities: ["group_reading", "initiative_drive", "practical_execution"],
      compressionSensitive: true,
      priorityWeight: 1.1,
      suggestedActivationPaths: [
        "integrar_proyectos_existentes",
        "explorar_primero_comunidad",
        "formarme_en_algo_nuevo",
      ],
      communitySpaceHints: [
        "redistribuir_sosten",
        "convocatoria_con_limites",
        "continuidad_sin_heroe",
      ],
      exampleUserSignals: [
        "termino convocando y empujando yo solo",
        "quiero que el espacio compartido no dependa de mi cansancio",
        "necesito límites en cuánto sostengo del grupo",
      ],
      avoidIfSignals: [
        "relato centrado sólo en escucha uno a uno sin objeto grupal",
        "usuario sin ninguna mención de grupo, comunidad o continuidad compartida",
      ],
    },
    {
      id: "escuchar_a_fondo_sin_perderme_yo_compresion_activacion",
      shortLabel: "Ayudar sin cargarme a todos",
      userFacingText:
        "Poner límites y primeros cuidados cuando la empatía te arrastra a sostener cosas que no son tuyas: proteger tu eje sin cerrarte.",
      recognitionPhrase:
        "Podés estar para otros, pero necesitás que eso no te vacíe ni te confunda con el dolor ajeno.",
      linkedFamilies: ["empathic_guide", "educator_interpreter"],
      coreAffinities: ["empathic_attunement", "adaptive_reframing", "protective_instinct"],
      supportingAffinities: ["restorative_support", "trust_building", "care_orientation", "duty_reliability"],
      compressionSensitive: true,
      suggestedActivationPaths: [
        "formarme_en_algo_nuevo",
        "explorar_primero_comunidad",
        "integrar_proyectos_existentes",
      ],
      communitySpaceHints: [
        "limites_afectivos",
        "contencion_sin_fusion",
        "primer_cuidado_propio",
      ],
      exampleUserSignals: [
        "me llevo todo a casa",
        "me cuesta decir no aunque ya no dé más",
        "siento culpa si no estoy disponible",
        "quiero ayudar sin desaparecer yo",
      ],
      avoidIfSignals: [
        "mediación entre múltiples actores como centro sin carga emocional",
        "servicio profesional ya estructurado con límites claros",
        "solo análisis estratégico sin carga afectiva",
      ],
    },
  ];

function normalizeTheme(
  theme: GuidedTheme,
  themeLayer: GuidedThemeLayer,
): GuidedTheme {
  return {
    ...theme,
    version: GUIDED_THEMES_MVP_VERSION,
    themeLayer,
    linkedFamilies: Array.isArray(theme.linkedFamilies) ? theme.linkedFamilies : [],
    coreAffinities: Array.isArray(theme.coreAffinities) ? theme.coreAffinities : [],
    supportingAffinities: Array.isArray(theme.supportingAffinities)
      ? theme.supportingAffinities
      : [],
    suggestedActivationPaths: Array.isArray(theme.suggestedActivationPaths)
      ? theme.suggestedActivationPaths
      : [],
    communitySpaceHints: Array.isArray(theme.communitySpaceHints)
      ? theme.communitySpaceHints
      : [],
    exampleUserSignals: Array.isArray(theme.exampleUserSignals)
      ? theme.exampleUserSignals
      : [],
    avoidIfSignals: Array.isArray(theme.avoidIfSignals) ? theme.avoidIfSignals : [],
  };
}

export const guidedThemesMvpV02: GuidedTheme[] = [
  ...guidedThemesMotherV02.map((theme) => normalizeTheme(theme, "mother")),
  ...guidedThemesSubfamilyV02.map((theme) => normalizeTheme(theme, "subfamily")),
  ...guidedThemesCompressionActivationV02.map((theme) =>
    normalizeTheme(theme, "compression_activation"),
  ),
];

export function getGuidedThemesByLayer(
  layer: GuidedThemeLayer,
): GuidedTheme[] {
  return guidedThemesMvpV02.filter((theme) => theme.themeLayer === layer);
}

export function getGuidedThemeById(id: string): GuidedTheme | undefined {
  return guidedThemesMvpV02.find((theme) => theme.id === id);
}
