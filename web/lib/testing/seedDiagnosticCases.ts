import type { EvaluationCase } from "./evaluationCases";

export const SEED_DIAGNOSTIC_CASES: EvaluationCase[] = [
  {
    id: "seed_empathic_guide_01",
    label: "Semilla — Guía empática (clara)",
    expectation:
      "Debe tender a clear_direction con empathic_guide; foco uno a uno y profundidad humana sin eje comunitario, institucional ni operativo.",
    payload: {
      profile: {
        age: 36,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "De chica me buscaban para contarme cosas que no le contaban a nadie; me quedaba escuchando sin apurar respuestas.",
        earlyFascinations:
          "Me enganchaba entender qué le pasaba a la otra persona de verdad, no solo el relato lindo.",
        meaningfulSchoolSubjects: "Psicología por afuera, filosofía barata y muchas charlas con compañeros.",
        repeatedWorkPatterns:
          "Me sale escuchar sin apurar, hacer una pregunta justa y ayudar a que la otra persona entienda qué siente y qué necesita. No me interesa dirigir grupos ni organizar equipos; me interesa acompañar procesos personales.",
        naturalSocialRoles:
          "La que escucha de verdad, la que contiene un poco sin ser terapeuta de fantasía.",
        lossesOrRenunciations:
          "Fui posponiendo esto por tareas más medibles y por cansancio de que me tomen como muleta emocional.",
        whatFeelsCompressedNow:
          "Muchas veces sostengo emocionalmente a otros y después me cuesta encontrar un lugar donde esa capacidad tenga forma real, sin quedar como favor invisible.",
        additionalContext:
          "No me interesa coordinar grupos grandes ni ser referente de comunidad; mi energía va persona a persona.",
      },
      currentContext: {
        currentSituation:
          "En distintos momentos termino siendo la persona a la que alguien busca cuando está confundido, triste o no sabe cómo poner en palabras lo que le pasa.",
        transitionGoal:
          "Quiero que esto deje de ser solo 'ayuda gratis' y encuentre un marco laboral donde tenga peso sin quemarme.",
        restrictions: [
          "No puedo cambiar de trabajo de golpe",
          "Necesito probar esta capacidad de manera gradual y cuidada",
        ],
        assets: [
          "Escucha fina",
          "Paciencia real",
          "Preguntas que ayudan a ordenar el mundo interno de una persona",
        ],
      },
    },
  },
  {
    id: "seed_empathic_guide_02",
    label: "Semilla — Guía empática (riesgo comunitario)",
    expectation:
      "Debe tender a empathic_guide; riesgo de confundirlo con community_builder si se sobreactiva lo grupal o el clima de equipo.",
    payload: {
      profile: {
        age: 41,
        country: "Uruguay",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "secondary",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba que en el grupo yo fuera el punto donde la gente aterrizaba cuando había quilombo emocional.",
        earlyFascinations:
          "Ver cómo un espacio humano se calma cuando alguien escucha bien, aunque no sea magia.",
        meaningfulSchoolSubjects: "Educación cívica, talleres grupales, deporte donde había grupo.",
        repeatedWorkPatterns:
          "Termino en reuniones cuidando el clima, bajando tensiones y después igual quedándome con alguien en un uno a uno.",
        naturalSocialRoles:
          "El que ordena el grupo sin querer ser líder; después termino agotado.",
        lossesOrRenunciations:
          "Dejé pasar oportunidades más individuales porque el grupo siempre 'necesitaba' algo.",
        whatFeelsCompressedNow:
          "Me mezclan escuchar profundo con sostener comunidad y no es lo mismo; me siento usado en las dos direcciones.",
        additionalContext:
          "A veces hablo de 'equipo' pero lo que más me llena es cuando alguien concreto aclara algo conmigo, no el after de grupo.",
      },
      currentContext: {
        currentSituation:
          "Lidero un equipo chico y me piden que 'lleve el clima' pero lo que más me sale es la conversación seria con cada uno.",
        transitionGoal:
          "Separar mejor mi rol de acompañamiento profundo del rol de coordinar pertenencia grupal.",
        restrictions: [
          "No tengo margen para estudios largos ahora",
          "Dependencias económicas en el rol actual",
        ],
        assets: [
          "Confianza del equipo",
          "Capacidad de bajar conflictos",
          "Criterio humano",
        ],
      },
    },
  },
  {
    id: "seed_diplomatic_social_connector_01",
    label: "Semilla — Conector diplomático (claro)",
    expectation:
      "Debe tender a clear_direction con diplomatic_social_connector; articulación de actores e intereses, no terapia uno a uno.",
    payload: {
      profile: {
        age: 45,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Desde chico negociaba entre primos, entre padres y profes, siempre leyendo qué quería cada parte.",
        earlyFascinations:
          "Los cruces de poder chiquitos me aburrían menos que el relato lineal; me gustaba ver el mapa.",
        meaningfulSchoolSubjects: "Historia, modelos ONU de mentira en el colegio, lengua.",
        repeatedWorkPatterns:
          "Termino alineando áreas, traduciendo lenguajes distintos y evitando que dos jefes se coman vivos.",
        naturalSocialRoles:
          "Articulador, el que hace puente sin ser ni el duro ni el terapeuta.",
        lossesOrRenunciations:
          "Postergué cosas más creativas porque este rol siempre era 'urgente y necesario'.",
        whatFeelsCompressedNow:
          "Me confunden con buen compañero empático cuando en realidad estoy leyendo tablero y posiciones.",
        additionalContext:
          "Escucho bien pero no es mi centro; mi centro es que las partes puedan seguir en el mismo proyecto.",
      },
      currentContext: {
        currentSituation:
          "Estoy en una organización con varias áreas chocando y a mí me suelen mandar a destrabar sin titular oficial de poder.",
        transitionGoal:
          "Formalizar mejor esta función como valor explícito, no solo como apagafuegos.",
        restrictions: [
          "No puedo exponerme políticamente en exceso",
          "Cuidado con reputación interna",
        ],
        assets: [
          "Red interna",
          "Lenguaje traducible entre áreas",
          "Tino para el timing",
        ],
      },
    },
  },
  {
    id: "seed_diplomatic_social_connector_02",
    label: "Semilla — Conector (riesgo guía empática)",
    expectation:
      "Debe tender a diplomatic_social_connector; riesgo de confundirlo con empathic_guide si se enfatiza contención emocional.",
    payload: {
      profile: {
        age: 39,
        country: "Chile",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Me decían que tenía buen tacto con la gente y terminaba conteniendo situaciones familiares pesadas.",
        earlyFascinations:
          "Entender por qué la gente reacciona así en conflictos, pero siempre en clave de acuerdo, no de catarsis.",
        meaningfulSchoolSubjects: "Sociología introductoria, inglés, talleres de comunicación.",
        repeatedWorkPatterns:
          "Hago reuniones difíciles, pero después me quedo con el compañero que llora y a veces no sé si es mi rol.",
        naturalSocialRoles:
          "Mediador que termina siendo contenedor emocional de oficina.",
        lossesOrRenunciations:
          "Menos tiempo para pensar en producto o estrategia porque el humano me consume el calendario.",
        whatFeelsCompressedNow:
          "Me piden escucha profunda cuando lo que hace falta es cerrar una posición entre áreas; me desalineo.",
        additionalContext:
          "Sé escuchar pero mi valor real aparece cuando hay que alinear intereses, no cuando hay que sostener una crisis personal larga.",
      },
      currentContext: {
        currentSituation:
          "Hay un conflicto entre mi área y otra y del otro lado vienen con drama personal mezclado con lo laboral.",
        transitionGoal:
          "Volver a operar más en articulación política interna y menos en contención terapéutica informal.",
        restrictions: [
          "No soy psicólogo ni quiero hacer de uno",
          "Límites de confidencialidad con RRHH",
        ],
        assets: [
          "Credibilidad en ambas partes",
          "Capacidad de síntesis",
          "Tolerancia a la ambigüedad",
        ],
      },
    },
  },
  {
    id: "seed_community_builder_01",
    label: "Semilla — Constructor de comunidad (claro)",
    expectation:
      "Debe tender a clear_direction con community_builder; pertenencia, circulación grupal, clima colectivo.",
    payload: {
      profile: {
        age: 34,
        country: "Argentina",
        language: "es",
        employmentStatus: "self_employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Armaba cosas en el barrio, juntadas, grupos de WhatsApp antes de que existieran; me importaba que la gente se sienta parte.",
        earlyFascinations:
          "Ver cómo un espacio colectivo aguanta o se cae según quién lo sostiene.",
        meaningfulSchoolSubjects: "Comunicación, voluntariados, deportes de equipo.",
        repeatedWorkPatterns:
          "Termino diseñando encuentros, cuidando que nadie quede afuera y que el grupo no se enfríe.",
        naturalSocialRoles:
          "La que teje vínculo, anfitriona, la que mira el grupo entero.",
        lossesOrRenunciations:
          "Menos foco en carrera individual porque el colectivo siempre pedía tiempo.",
        whatFeelsCompressedNow:
          "Sostengo comunidad con poco reconocimiento económico y con culpa si digo que necesito parar.",
        additionalContext:
          "No es que quiera ser psicóloga de cada uno; me importa el tejido, la circulación, el nosotros.",
      },
      currentContext: {
        currentSituation:
          "Coordino una comunidad profesional chica con eventos, espacios online y mucho cuidado del vínculo.",
        transitionGoal:
          "Que esto sea sostenible en plata y en tiempo, sin fundirme en el rol invisible.",
        restrictions: [
          "Ingresos irregulares",
          "Poco equipo de apoyo operativo",
        ],
        assets: [
          "Red viva",
          "Capacidad de convocatoria",
          "Clima de confianza",
        ],
      },
    },
  },
  {
    id: "seed_community_builder_02",
    label: "Semilla — Comunidad (riesgo conector institucional)",
    expectation:
      "Debe tender a community_builder; riesgo de confundirlo con diplomatic_social_connector si domina negociación entre actores.",
    payload: {
      profile: {
        age: 43,
        country: "Colombia",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Siempre terminaba organizando a la gente para que no se peleen y para que el proyecto grupal siga.",
        earlyFascinations:
          "Los acuerdos entre partes y también el clima grupal; mezclaba las dos cosas sin distinguir.",
        meaningfulSchoolSubjects: "Trabajo social light, liderazgo estudiantil, proyectos grupales.",
        repeatedWorkPatterns:
          "Facilito talleres, parcheo conflictos entre líderes y después cuido que el grupo no se desintegre.",
        naturalSocialRoles:
          "Facilitadora que termina siendo puente político entre jefes.",
        lossesOrRenunciations:
          "Menos tiempo para el cuidado fino del vínculo puro porque siempre aparece la negociación.",
        whatFeelsCompressedNow:
          "Me siento más diplomatic_social_connector que community_builder y me agota no saber cómo nombrarlo.",
        additionalContext:
          "Me importa la comunidad viva, pero últimamente mi día es más alinear intereses jerárquicos que cuidar pertenencia cotidiana.",
      },
      currentContext: {
        currentSituation:
          "Estoy entre dirección de programa y facilitación; mitad del día es mesas con sponsors y mitad con participantes.",
        transitionGoal:
          "Recuperar el eje de comunidad y no quedar atrapada solo en articulación institucional.",
        restrictions: [
          "Presión de resultados medibles para financiadores",
          "Poco margen para experimentar formatos",
        ],
        assets: [
          "Experiencia mixta comunidad-institución",
          "Lenguaje claro",
          "Resiliencia",
        ],
      },
    },
  },
  {
    id: "seed_public_communicator_01",
    label: "Semilla — Comunicador público (claro)",
    expectation:
      "Debe tender a clear_direction con public_communicator; voz pública, posicionamiento, lectura de audiencia.",
    payload: {
      profile: {
        age: 38,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba exponer, debatir, que me escuchen en público aunque me temblaran las piernas.",
        earlyFascinations:
          "Cómo un mensaje cambia según a quién le hablás y en qué canal.",
        meaningfulSchoolSubjects: "Oratoria del colegio, periodismo escolar, historia.",
        repeatedWorkPatterns:
          "Termino siendo vocero, armando discursos, traduciendo políticas a lenguaje que la gente entiende.",
        naturalSocialRoles:
          "La cara visible, la que pone el cuerpo frente a otros.",
        lossesOrRenunciations:
          "Menos trabajo de fondo analítico porque siempre me necesitan 'afuera'.",
        whatFeelsCompressedNow:
          "Estar expuesto sin tiempo para pensar; miedo a quedar como liviano.",
        additionalContext:
          "No soy solo storyteller creativo; mi juego es impacto y claridad en espacio público.",
      },
      currentContext: {
        currentSituation:
          "Trabajo en comunicación institucional y soy quien sale en medios y en eventos cuando hay crisis de imagen.",
        transitionGoal:
          "Profundizar criterio de fondo para no depender solo del reflejo verbal.",
        restrictions: [
          "Línea editorial ajena",
          "Crisis que no controlás los tiempos",
        ],
        assets: [
          "Presencia",
          "Claridad oral",
          "Experiencia con prensa",
        ],
      },
    },
  },
  {
    id: "seed_public_communicator_02",
    label: "Semilla — Comunicador público (riesgo storyteller)",
    expectation:
      "Debe tender a public_communicator; riesgo de confundirlo con creative_storyteller si domina forma narrativa sobre posición pública.",
    payload: {
      profile: {
        age: 32,
        country: "México",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Escribía cosas que leían en voz alta y me elogiaban más por cómo sonaba que por el argumento.",
        earlyFascinations:
          "El ritmo de las frases, el gancho, cómo enganchar atención.",
        meaningfulSchoolSubjects: "Literatura, cine, marketing básico.",
        repeatedWorkPatterns:
          "Armo contenidos, guiones, piezas lindas; a veces me olvido de la postura política del mensaje.",
        naturalSocialRoles:
          "El creativo de la oficina que terminó siendo voz pública sin querer.",
        lossesOrRenunciations:
          "Menos espacio para el relato largo y literario porque todo es campaña corta.",
        whatFeelsCompressedNow:
          "Me piden autoridad pública pero evalúan como si fuera solo estética; me frustra.",
        additionalContext:
          "Sé construir mensaje fuerte pero mi rol real es estar del lado de una lectura pública defendible, no solo del relato bonito.",
      },
      currentContext: {
        currentSituation:
          "Lidero contenidos para una campaña de tema social y la presión es viralizar sin perder seriedad.",
        transitionGoal:
          "Equilibrar oficio narrativo con criterio de posicionamiento público explícito.",
        restrictions: [
          "Marca y mensajes aprobados arriba",
          "Plazos de redes imposibles",
        ],
        assets: [
          "Oficio redactor",
          "Oído para audiencia",
          "Versatilidad de tono",
        ],
      },
    },
  },
  {
    id: "seed_creative_storyteller_01",
    label: "Semilla — Storyteller creativo (claro)",
    expectation:
      "Debe tender a clear_direction con creative_storyteller; forma verbal, relato, edición de sentido.",
    payload: {
      profile: {
        age: 29,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Reescribía cuentos, cambiaba finales, me obsesionaba con que 'suene bien' y tenga imagen.",
        earlyFascinations:
          "Cómo algo confuso gana forma cuando le encontrás la voz justa.",
        meaningfulSchoolSubjects: "Lengua, taller literario, diseño gráfico de garra.",
        repeatedWorkPatterns:
          "Termino editando, encontrando el ángulo, bajando lo complejo a algo que se puede leer o escuchar.",
        naturalSocialRoles:
          "El que le da forma verbal a lo que el equipo tiene en la cabeza.",
        lossesOrRenunciations:
          "Menos tiempo para proyectos propios largos por la pila de encargos.",
        whatFeelsCompressedNow:
          "Me usan como corrector estético cuando en realidad construyo narrativa con criterio.",
        additionalContext:
          "No me defino por salir al micrófono en política; mi centro es el relato bien armado.",
      },
      currentContext: {
        currentSituation:
          "Trabajo en una consultora haciendo piezas, informes que 'tienen que leerse' y presentaciones que no sean un infierno.",
        transitionGoal:
          "Ir hacia proyectos donde el storytelling sea eje, no accesorio de última hora.",
        restrictions: [
          "Briefings cambiantes",
          "Poco crédito si no medís en likes",
        ],
        assets: [
          "Criterio editorial",
          "Tolerancia al feedback",
          "Velocidad",
        ],
      },
    },
  },
  {
    id: "seed_creative_storyteller_02",
    label: "Semilla — Storyteller (riesgo comunicador público)",
    expectation:
      "Debe tender a creative_storyteller; riesgo de confundirlo con public_communicator si domina exposición y vocería.",
    payload: {
      profile: {
        age: 35,
        country: "Perú",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba leer en público pero también encerrarme a pulir el texto ocho veces.",
        earlyFascinations:
          "El guión, el podcast, cómo cerrar un capítulo con gancho.",
        meaningfulSchoolSubjects: "Comunicación audiovisual, redacción, teatro amateur.",
        repeatedWorkPatterns:
          "Me convierten en cara del proyecto porque hablo bien, pero yo disfruto más armar el mensaje que ser noticia.",
        naturalSocialRoles:
          "Vocero accidental que en el fondo es editor.",
        lossesOrRenunciations:
          "Menos profundidad en oficio narrativo porque el calendario pide salidas rápidas.",
        whatFeelsCompressedNow:
          "Salgo en cámara pero me quedo con la sensación de no haber pulido el relato como corresponde.",
        additionalContext:
          "Mi fuerte es construcción de mensaje y voz; la exposición pública es herramienta a veces, no mi definición.",
      },
      currentContext: {
        currentSituation:
          "Mitad del mes soy portavoz en eventos y mitad armo línea editorial interna; el equipo me mezcla las dos cosas.",
        transitionGoal:
          "Reordenar para que el núcleo sea narrativa y edición, no solo visibilidad personal.",
        restrictions: [
          "Marca personal ligada al trabajo actual",
          "Contrato con cláusulas de imagen",
        ],
        assets: [
          "Dicción",
          "Capacidad de síntesis",
          "Ojo para el tono",
        ],
      },
    },
  },
  {
    id: "seed_educator_interpreter_01",
    label: "Semilla — Educador intérprete (claro)",
    expectation:
      "Debe tender a clear_direction con educator_interpreter; traducción de conceptos, enseñanza, hacer entender.",
    payload: {
      profile: {
        age: 44,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Explicaba los deberes a los primos y a los compañeros que no habían entendido al profe.",
        earlyFascinations:
          "Cuando alguien hace 'click' y deja de sentirse boludo frente a un tema difícil.",
        meaningfulSchoolSubjects: "Pedagogía, ciencias duras explicadas mal, lengua.",
        repeatedWorkPatterns:
          "Diseño capacitaciones, simplifico lo técnico, encuentro analogías que no insultan la inteligencia.",
        naturalSocialRoles:
          "El que traduce, el que enseña sin humillar.",
        lossesOrRenunciations:
          "Menos tiempo para producir contenido propio porque siempre estoy explicando el de otros.",
        whatFeelsCompressedNow:
          "Me toman como soporte eterno y no como rol central de valor.",
        additionalContext:
          "No soy terapeuta; mi juego es claridad pedagógica y transferencia de saber.",
      },
      currentContext: {
        currentSituation:
          "En la empresa soy referente para onboardings y para traducir políticas nuevas a lenguaje de equipo.",
        transitionGoal:
          "Institucionalizar el rol de diseño instruccional interno con reconocimiento explícito.",
        restrictions: [
          "Recursos limitados para plataformas",
          "Resistencia al cambio en parte del plantel",
        ],
        assets: [
          "Paciencia docente",
          "Dominio del tema técnico",
          "Humor para bajar ansiedad",
        ],
      },
    },
  },
  {
    id: "seed_educator_interpreter_02",
    label: "Semilla — Educador (riesgo guía empática)",
    expectation:
      "Debe tender a educator_interpreter; riesgo de confundirlo con empathic_guide si domina contención emocional en el aprendizaje.",
    payload: {
      profile: {
        age: 40,
        country: "Ecuador",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Me quedaba con el compañero frustrado hasta que entendiera, no solo hasta que se calmara.",
        earlyFascinations:
          "Ver a alguien destrabar un concepto; la emoción venía de ahí, no del abrazo.",
        meaningfulSchoolSubjects: "Matemática con profes particular, voluntariado de apoyo escolar.",
        repeatedWorkPatterns:
          "Facilito cursos y terminan contándome la vida; después no sé si fui profe o contención.",
        naturalSocialRoles:
          "Docente-contenedor híbrido que cansa.",
        lossesOrRenunciations:
          "Menos foco en diseño de secuencias porque el grupo 'necesita espacio emocional'.",
        whatFeelsCompressedNow:
          "Límites borrosos entre pedagogía y escucha terapéutica informal; me agota moralmente.",
        additionalContext:
          "Mi valor es hacer entender y ordenar saber; la escucha profunda es herramienta, no mi identidad profesional.",
      },
      currentContext: {
        currentSituation:
          "Doy talleres a adultos en reconversión y aparece mucho duelo y ansiedad mezclada con lo técnico.",
        transitionGoal:
          "Sostener calidez sin convertirme en psicólogo de facto; mantener el eje pedagógico.",
        restrictions: [
          "No estoy habilitado para clínica",
          "Grupos grandes con poca ayuda",
        ],
        assets: [
          "Estructura de clase",
          "Ejemplos memorables",
          "Escucha activa acotada",
        ],
      },
    },
  },
  {
    id: "seed_analytical_strategist_01",
    label: "Semilla — Estratega analítico (claro)",
    expectation:
      "Debe tender a clear_direction con analytical_strategist; lectura de escenarios, criterio, comparación de caminos.",
    payload: {
      profile: {
        age: 37,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Armaba tablas mentales de pros y cons antes de decidir cualquier cosa importante.",
        earlyFascinations:
          "Entender por qué una decisión es mejor que otra más allá del impulso.",
        meaningfulSchoolSubjects: "Economía, estadística sufrida, filosofía de la ciencia por curiosidad.",
        repeatedWorkPatterns:
          "Termino leyendo escenarios, detectando supuestos ocultos y diciendo 'esto no cierra' antes que ejecutar a ciegas.",
        naturalSocialRoles:
          "El que baja criterio y ordena la discusión.",
        lossesOrRenunciations:
          "Menos ejecución visible porque siempre me piden que piense primero.",
        whatFeelsCompressedNow:
          "Me usan de analista gratis y después ejecutan mal igual; desgano.",
        additionalContext:
          "No me defino por apagar incendios operativos; me defino por claridad estratégica.",
      },
      currentContext: {
        currentSituation:
          "Lidero análisis previo a inversiones chicas en una PyME; el ritmo es rápido y el dato incompleto.",
        transitionGoal:
          "Que el rol de criterio tenga peso en la decisión final, no solo informe para el cajón.",
        restrictions: [
          "Información sensible incompleta",
          "Plazos cortos",
        ],
        assets: [
          "Pensamiento estructurado",
          "Sintaxis de informes",
          "Skepticismo sano",
        ],
      },
    },
  },
  {
    id: "seed_analytical_strategist_02",
    label: "Semilla — Estratega (riesgo technical builder)",
    expectation:
      "Debe tender a analytical_strategist; riesgo de confundirlo con technical_builder si domina resolución operativa y ejecución.",
    payload: {
      profile: {
        age: 33,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba planificar pero también arreglar cosas concretas cuando salían mal.",
        earlyFascinations:
          "Ver el sistema funcionar después de ordenar procesos.",
        meaningfulSchoolSubjects: "Ingeniería que abandoné, administración, Excel como deporte.",
        repeatedWorkPatterns:
          "Empiezo leyendo el problema y termino implementando el fix porque 'no hay nadie'; me confundo yo también.",
        naturalSocialRoles:
          "El estratega que termina siendo mano derecha operativa.",
        lossesOrRenunciations:
          "Menos tiempo para pensar en horizonte largo porque el día a día me come.",
        whatFeelsCompressedNow:
          "Si solo me miden por throughput operativo, pierdo mi valor de criterio y escenario.",
        additionalContext:
          "Sé ejecutar pero mi centro es leer alternativas y criterio; la operación es circunstancial.",
      },
      currentContext: {
        currentSituation:
          "En startup chica soy 'el que piensa' pero también despliego herramientas y apago incendios de producto.",
        transitionGoal:
          "Recontratar o delegar ejecución para recuperar franja de análisis real.",
        restrictions: [
          "Presupuesto chico",
          "Equipo reducido",
        ],
        assets: [
          "Versatilidad",
          "Criterio bajo incertidumbre",
          "Comunicación con devs",
        ],
      },
    },
  },
  {
    id: "seed_system_designer_01",
    label: "Semilla — Diseñador de sistemas (claro)",
    expectation:
      "Debe tender a clear_direction con system_designer; arquitectura de proceso, reglas, coherencia entre partes.",
    payload: {
      profile: {
        age: 42,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Armaba reglas para juegos con amigos porque si no era un caos; me importaba que el sistema cierre.",
        earlyFascinations:
          "Cómo encajan piezas que parecen independientes hasta que ves el mapa entero.",
        meaningfulSchoolSubjects: "Sistemas, lógica, organización de información.",
        repeatedWorkPatterns:
          "Diseño flujos, defino criterios, alineo herramientas y roles para que la organización no dependa de héroes.",
        naturalSocialRoles:
          "El que mira el sistema, no solo la tarea del día.",
        lossesOrRenunciations:
          "Menos reconocimiento porque 'no vendés' lo invisible hasta que se rompe.",
        whatFeelsCompressedNow:
          "Parches eternos sin rediseño; cansancio de remar con procesos incoherentes.",
        additionalContext:
          "No soy solo el que ejecuta tareas; soy el que piensa cómo debería funcionar el conjunto.",
      },
      currentContext: {
        currentSituation:
          "Lidero mejora de procesos entre áreas con herramientas nuevas y resistencia cultural fuerte.",
        transitionGoal:
          "Instalar governance liviana que dure, no solo workshops con post-its.",
        restrictions: [
          "Legado tecnológico feo",
          "Política interna de silos",
        ],
        assets: [
          "Visión de flujo end-to-end",
          "Documentación clara",
          "Facilitación de acuerdos",
        ],
      },
    },
  },
  {
    id: "seed_system_designer_02",
    label: "Semilla — System designer (frontera public communicator)",
    expectation:
      "Debe tender a system_designer; riesgo de frontera con public_communicator si aparece necesidad de traducir sistema, construir mensaje o explicar complejidad para una audiencia. No debe confundirse con technical_builder si la implementación aparece como recurso táctico y no como patrón dominante.",
    payload: {
      profile: {
        age: 36,
        country: "Uruguay",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba armar cosas con fichas y después desarmarlas para entender la lógica.",
        earlyFascinations:
          "Automatizar lo repetitivo para que el equipo respire.",
        meaningfulSchoolSubjects: "Programación introductoria, gestión de proyectos, calidad.",
        repeatedWorkPatterns:
          "Empiezo mapeando el proceso y termino codeando integraciones porque el plazo aprieta.",
        naturalSocialRoles:
          "Arquitecto accidental que termina siendo operador.",
        lossesOrRenunciations:
          "Menos espacio para rediseño profundo porque siempre hay que 'salir'.",
        whatFeelsCompressedNow:
          "Si solo me evalúan por tickets cerrados, mi rol de sistema no existe en el papel.",
        additionalContext:
          "Implemento cuando hace falta, pero mi aporte distintivo es ordenar el sistema antes que picar código o tareas sueltas.",
      },
      currentContext: {
        currentSituation:
          "Equipo de producto con deuda de procesos; me piden diseño y al mismo tiempo entrega inmediata.",
        transitionGoal:
          "Negociar ventana de rediseño con sponsor ejecutivo explícito.",
        restrictions: [
          "Deuda técnica y de proceso mezcladas",
          "Expectativas irreales de velocidad",
        ],
        assets: [
          "Pensamiento en capas",
          "Comunicación con ingeniería",
          "Criterio de priorización",
        ],
      },
    },
  },
  {
    id: "seed_public_communicator_educator_interpreter_frontier_01",
    label: "Semilla — Comunicador público (frontera educador intérprete)",
    expectation:
      "Debe tender a public_communicator con frontera educator_interpreter; comunicación pública, explicación clara, traducción de complejidad y lectura pedagógica para audiencia real.",
    payload: {
      profile: {
        age: 39,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba explicar a mis amigos por qué una regla del colegio o del club no tenía sentido; terminaba armando ejemplos para que todos entendieran el problema.",
        earlyFascinations:
          "Me enganchaba ver cómo una idea complicada podía volverse clara si encontraba la frase, el ejemplo y el orden justo.",
        meaningfulSchoolSubjects:
          "Historia, comunicación, educación cívica, debates; también algo de sistemas porque me gusta entender la estructura antes de explicarla.",
        repeatedWorkPatterns:
          "En distintos trabajos termino traduciendo decisiones confusas de equipos técnicos o directivos a mensajes que la gente entienda y pueda discutir.",
        naturalSocialRoles:
          "Soy quien arma el hilo, el documento o la explicación pública cuando hay muchas partes diciendo cosas sueltas.",
        lossesOrRenunciations:
          "Me frustré cuando me empujaron a roles de proceso interno; puedo ordenar, pero me apago si eso no termina en comunicación clara hacia otros.",
        whatFeelsCompressedNow:
          "Tengo capacidad para ordenar ideas complejas, pero hoy queda encerrada en documentos internos que casi nadie lee.",
        additionalContext:
          "No busco diseñar procesos internos como objetivo principal; quiero construir voz pública y explicación clara para una audiencia real, con frontera natural hacia educator_interpreter cuando domina lo pedagógico.",
      },
      currentContext: {
        currentSituation:
          "Trabajo cerca de producto y comunicación interna; me piden ordenar información dispersa sobre cambios complejos.",
        restrictions: [
          "Necesito moverme gradualmente",
          "No puedo dejar mi trabajo actual sin una alternativa concreta",
          "Me cuesta venderme como comunicador porque vengo de roles de coordinación y proceso",
        ],
        assets: [
          "claridad escrita",
          "lectura de audiencia",
          "capacidad de síntesis",
          "criterio para ordenar argumentos",
          "facilidad para traducir complejidad a lenguaje comprensible",
        ],
        transitionGoal:
          "Probar una línea de comunicación pública o institucional donde convierta complejidad en mensajes claros para una audiencia real.",
      },
    },
  },
  {
    id: "seed_public_communicator_institutional_operator_frontier_01",
    label: "Semilla — Comunicador público (frontera operador institucional)",
    expectation:
      "Debe tender a clear_direction con public_communicator; frontera institutional_operator por comunicación pública/institucional, agenda, asuntos colectivos o estructura formal. No debe tratarse como system_designer salvo que la arquitectura de sistema sea dominante.",
    payload: {
      profile: {
        age: 39,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "De chico armaba diarios, programas o campañas inventadas. No empezaba por una frase linda: primero ordenaba secciones, roles, temas, tono y recorrido para que todo tuviera coherencia.",
        earlyFascinations:
          "Me atrapaba ver cómo una idea pública cambiaba de fuerza cuando tenía estructura: mapa de temas, orden de aparición, tono, marco y continuidad.",
        meaningfulSchoolSubjects:
          "Comunicación, historia, formación cívica, análisis de discursos y diseño de argumentos. Me interesaban los sistemas sólo cuando ayudaban a ordenar una voz pública o una agenda.",
        repeatedWorkPatterns:
          "Cuando me piden posteos, comunicados o discursos aislados, primero necesito armar el mapa completo: qué tema va primero, qué mensaje sostiene al siguiente, qué regla editorial ordena cada pieza y cómo se mantiene una línea en el tiempo.",
        naturalSocialRoles:
          "Soy quien arma la arquitectura de comunicación y después sostiene una voz pública entendible y consistente.",
        lossesOrRenunciations:
          "Me frustré cuando me pidieron sólo piezas sueltas sin continuidad. Sin estructura, una agenda pública pierde fuerza.",
        whatFeelsCompressedNow:
          "Me frustra que me pidan ocurrencias sueltas. Siento que mi aporte real aparece cuando diseño la arquitectura de comunicación: temas, secuencia, formatos, criterios de publicación y dependencias entre mensajes.",
        additionalContext:
          "No quiero diseñar sistemas por diseñarlos. Quiero que esa estructura termine en una comunicación pública clara, reconocible, con agenda, continuidad y efecto en una audiencia real.",
      },
      currentContext: {
        currentSituation:
          "Trabajo cerca de comunicación pública e institucional. Mi tarea no es explicar temas como docente, sino convertir asuntos dispersos en una voz pública reconocible, con agenda, tono y continuidad.",
        restrictions: [
          "No puedo dejar mi trabajo actual sin una alternativa concreta",
          "Vengo de roles donde se valora más entregar piezas rápidas que construir una voz pública consistente",
        ],
        assets: [
          "Lectura de audiencia",
          "criterio editorial",
          "capacidad para ordenar agenda",
          "síntesis política/institucional",
          "diseño de secuencias de comunicación",
          "continuidad narrativa y sentido de oportunidad pública",
        ],
        transitionGoal:
          "No soy diseñador de sistemas en general; soy comunicador público que necesita diseñar una arquitectura de mensajes para que una voz pública no dependa de ocurrencias sueltas.",
      },
    },
  },
  {
    id: "seed_public_communicator_system_designer_frontier_03",
    label: "Semilla — Comunicador público (frontera diseñador de sistemas)",
    expectation:
      "Debe tender a clear_direction con public_communicator como familia primaria y system_designer como frontera secundaria. La persona no diseña sistemas generales ni procesos institucionales; diseña arquitectura de comunicación pública: módulos, dependencias, plantillas, secuencia, reglas de continuidad y criterios de consistencia para sostener una voz reconocible. Evitar arrastre a creative_storyteller, educator_interpreter e institutional_operator.",
    payload: {
      profile: {
        age: 37,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba ordenar materiales para que funcionaran como un conjunto: separaba partes, definía reglas, armaba recorridos y probaba si cada elemento cumplía una función dentro del sistema.",
        earlyFascinations:
          "Me interesaba ver cómo una idea ganaba fuerza cuando dejaba de estar suelta y pasaba a tener estructura: mapa, secuencia, roles, continuidad y relación entre partes.",
        meaningfulSchoolSubjects:
          "Comunicación, escritura clara, organización de información, lógica, estructura de textos y diseño de procesos. Me interesaba entender cómo ordenar un mensaje para que pudiera sostenerse como sistema.",
        repeatedWorkPatterns:
          "Cuando tengo que comunicar algo complejo, no empiezo por escribir piezas aisladas. Primero diseño el mapa general, separo módulos, defino criterios, ordeno dependencias y recién después bajo textos concretos.",
        naturalSocialRoles:
          "Soy quien convierte información dispersa en una arquitectura de comunicación clara, repetible y reconocible.",
        lossesOrRenunciations:
          "Me frustra cuando me piden piezas sueltas sin sistema. Sin arquitectura, la comunicación pierde continuidad, cambia de tono y depende demasiado de ocurrencias.",
        whatFeelsCompressedNow:
          "Mi aporte queda comprimido cuando lo leen como simple redacción. En realidad, mi valor aparece cuando diseño el sistema que permite que una voz pública sea coherente, repetible y sostenible.",
        additionalContext:
          "No soy diseñador de sistemas en general. Mi centro es la comunicación pública. Pero para comunicar bien necesito diseñar una arquitectura de mensajes: módulos, reglas, secuencia, plantillas, dependencias y criterios que hagan que la voz sea consistente en el tiempo.",
      },
      currentContext: {
        currentSituation:
          "Trabajo creando comunicación pública para productos, servicios o proyectos complejos. Mi tarea principal es convertir información dispersa en una voz clara para una audiencia real, pero antes de escribir piezas necesito diseñar la arquitectura de mensajes: módulos, secuencia, dependencias, criterios de tono y reglas de continuidad.",
        restrictions: [
          "No puedo dejar mi trabajo actual sin una alternativa concreta",
          "Me exigen salidas rápidas aunque eso rompa continuidad",
        ],
        assets: [
          "lectura de audiencia",
          "criterio editorial",
          "diseño de arquitectura de mensajes",
          "orden de secuencias y dependencias narrativas",
          "continuidad de voz en múltiples piezas",
        ],
        transitionGoal:
          "Construir una comunicación pública reconocible y sostenida en el tiempo, no una colección de piezas sueltas. Quiero diseñar un sistema de mensajes con módulos, plantillas, flujo de publicación, reglas de consistencia y conexiones claras entre cada pieza.",
      },
    },
  },
  {
    id: "seed_technical_builder_01",
    label: "Semilla — Constructor técnico (claro)",
    expectation:
      "Debe tender a clear_direction con technical_builder; ejecución, orden operativo, que las cosas funcionen.",
    payload: {
      profile: {
        age: 31,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Arreglaba cosas en casa, en la compu del vecino, lo que fuera; me calmaba ver algo vuelva a andar.",
        earlyFascinations:
          "Checklists, herramientas, ver resultado tangible al final del día.",
        meaningfulSchoolSubjects: "Técnica, dibujo, matemática aplicada.",
        repeatedWorkPatterns:
          "Termino siendo quien cierra el plan, prioriza, ejecuta y verifica que no quede el caos.",
        naturalSocialRoles:
          "El que resuelve, el que hace que el equipo no se hunda.",
        lossesOrRenunciations:
          "Menos espacio para teoría pura porque siempre hay que entregar.",
        whatFeelsCompressedNow:
          "Cansancio de ser solo 'operativo' cuando mi criterio de ejecución también es valioso.",
        additionalContext:
          "No soy el estratega abstracto; soy el que baja lo abstracto a funcionamiento real.",
      },
      currentContext: {
        currentSituation:
          "Operaciones en e-commerce con picos de demanda y proveedores impredecibles.",
        transitionGoal:
          "Formalizar liderazgo operativo con equipo propio, no solo manos.",
        restrictions: [
          "Turnos y horarios rígidos",
          "SLA estrictos",
        ],
        assets: [
          "Capacidad de priorizar bajo presión",
          "Conocimiento de punta a punta",
          "Tolerancia al estrés",
        ],
      },
    },
  },
  {
    id: "seed_technical_builder_02",
    label: "Semilla — Technical builder (riesgo system designer)",
    expectation:
      "Debe tender a technical_builder; riesgo de confundirlo con system_designer si domina rediseño de proceso sobre ejecución inmediata.",
    payload: {
      profile: {
        age: 39,
        country: "Brasil",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba optimizar cómo hacíamos las tareas del grupo antes de hacerlas.",
        earlyFascinations:
          "Eficiencia, menos fricción, menos vueltas.",
        meaningfulSchoolSubjects: "Ingeniería industrial light, logística, Excel avanzado.",
        repeatedWorkPatterns:
          "Me piden que arregle el proceso entero cuando a veces solo había que ejecutar rápido; me despierto diseñando.",
        naturalSocialRoles:
          "Ejecutor que piensa en sistema y a veces choca con urgencias.",
        lossesOrRenunciations:
          "Menos crédito por throughput porque me ven 'pensando demasiado'.",
        whatFeelsCompressedNow:
          "Frustración cuando el sistema está mal diseñado pero me exigen solo palos de hockey.",
        additionalContext:
          "Puedo pensar arquitectura, pero mi identidad fuerte es hacer que el trabajo salga y el sistema respire hoy.",
      },
      currentContext: {
        currentSituation:
          "Jefe de planta con mandato de eficiencia y presión de no parar la línea.",
        transitionGoal:
          "Implementar mejoras chicas medibles sin quedar atrapado solo en consultoría interna.",
        restrictions: [
          "Parada de línea costosa",
          "Sindicato sensible",
        ],
        assets: [
          "Conocimiento de piso",
          "Respeto del equipo",
          "Mano firme",
        ],
      },
    },
  },
  {
    id: "seed_institutional_operator_01",
    label: "Semilla — Operador institucional (claro)",
    expectation:
      "Debe tender a clear_direction con institutional_operator; navegación de estructura formal, reglas, cumplimiento práctico.",
    payload: {
      profile: {
        age: 48,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Entendía antes que otros cómo funcionaban las reglas del colegio y cómo moverse sin romperlas del todo.",
        earlyFascinations:
          "Cómo las organizaciones grandes sobreviven aunque sean lentas.",
        meaningfulSchoolSubjects: "Derecho del trabajo por curiosidad, administración pública, contabilidad básica.",
        repeatedWorkPatterns:
          "Traduzco normativa a pasos concretos, gestiono trámites, hago viable lo que en papel parece imposible.",
        naturalSocialRoles:
          "El que sabe cómo se mueve la institución de verdad.",
        lossesOrRenunciations:
          "Menos creatividad visible porque el trabajo es contención y gestión.",
        whatFeelsCompressedNow:
          "Ser visto como burocrata cuando en realidad destrabo cosas serias.",
        additionalContext:
          "No soy conector de actores en sentido político blando; soy operador de estructura formal.",
      },
      currentContext: {
        currentSituation:
          "Área de gestión en organismo con auditorías y cambios regulatorios frecuentes.",
        transitionGoal:
          "Modernizar trámites sin perder rigor legal ni exponer al organismo.",
        restrictions: [
          "Marcos legales rígidos",
          "Escasa autonomía presupuestaria",
        ],
        assets: [
          "Red dentro del organismo",
          "Conocimiento de circuitos",
          "Paciencia administrativa",
        ],
      },
    },
  },
  {
    id: "seed_institutional_operator_02",
    label: "Semilla — Operador institucional (riesgo conector diplomático)",
    expectation:
      "Debe tender a institutional_operator; riesgo de confundirlo con diplomatic_social_connector si domina negociación entre actores sobre trámite y norma.",
    payload: {
      profile: {
        age: 44,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Negociaba permisos y excepciones con autoridades sin pelear de más.",
        earlyFascinations:
          "Cómo alinear intereses sin que explote la institución.",
        meaningfulSchoolSubjects: "Ciencia política, gestión, proyectos con estado.",
        repeatedWorkPatterns:
          "Termino en reuniones entre áreas cerrando acuerdos, pero el corazón del laburo es hacer viable el circuito formal.",
        naturalSocialRoles:
          "Interlocutor institucional que a veces parece político.",
        lossesOrRenunciations:
          "Menos tiempo en el detalle normativo fino porque las mesas me absorben.",
        whatFeelsCompressedNow:
          "Me confunden con diplomatic_social_connector; yo opero dentro de reglas y plazos, no solo articulo climas.",
        additionalContext:
          "La diplomacia me sirve, pero mi valor central es operar la máquina institucional con rigor.",
      },
      currentContext: {
        currentSituation:
          "Proyecto público-privado con muchas mesas y poco avance en los expedientes de fondo.",
        transitionGoal:
          "Bajar acuerdos a expedientes y cronogramas ejecutables con trazabilidad.",
        restrictions: [
          "Elecciones que congelan decisiones",
          "Compliance estricto",
        ],
        assets: [
          "Lenguaje de estado y de empresa",
          "Templanza",
          "Detalle en documentación",
        ],
      },
    },
  },
  {
    id: "seed_civic_advocate_01",
    label: "Semilla — Defensor cívico (claro)",
    expectation:
      "Debe tender a clear_direction con civic_advocate; causa pública, incidencia, justicia o bien común explícito.",
    payload: {
      profile: {
        age: 46,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Me indignaban cosas del barrio y armaba reclamos, firmas, idas a la municipalidad.",
        earlyFascinations:
          "Que lo público no sea solo teoría sino algo por lo que vale pelear.",
        meaningfulSchoolSubjects: "Formación ciudadana, historia social, voluntariado.",
        repeatedWorkPatterns:
          "Articulo con otros, presiono por políticas, traduzco problemas de la gente a demandas claras.",
        naturalSocialRoles:
          "La voz incómoda con datos, no solo con bronca.",
        lossesOrRenunciations:
          "Cansancio y algo de cinismo cuando las victorias son chicas.",
        whatFeelsCompressedNow:
          "Sostener causa con poca estructura y mucha carga emocional.",
        additionalContext:
          "No soy comunicador de marca; soy advocate con horizonte de derechos o bien común.",
      },
      currentContext: {
        currentSituation:
          "Coordino campaña local por acceso a servicios con equipo mínimo y presión mediática esporádica.",
        transitionGoal:
          "Institucionalizar la base de la campaña sin perder el fuego ni quemarme.",
        restrictions: [
          "Fondos inestables",
          "Riesgo de desgaste militante",
        ],
        assets: [
          "Legitimidad barrial",
          "Red con otras orgs",
          "Capacidad de argumentar",
        ],
      },
    },
  },
  {
    id: "seed_civic_advocate_02",
    label: "Semilla — Cívico (riesgo comunicador público)",
    expectation:
      "Debe tender a civic_advocate; riesgo de confundirlo con public_communicator si domina vocería y mensaje sobre incidencia y causa.",
    payload: {
      profile: {
        age: 41,
        country: "México",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba debatir en público y que me escucharan; después entendí que me movía la injusticia, no el micrófono.",
        earlyFascinations:
          "Cómo un mensaje bien puesto mueve a la gente a actuar.",
        meaningfulSchoolSubjects: "Comunicación política, derechos humanos intro, periodismo.",
        repeatedWorkPatterns:
          "Salgo a hablar, armo notas, pero en el fondo lo que quiero es cambio de política concreto.",
        naturalSocialRoles:
          "Vocero de causa que a veces queda atrapado en la imagen.",
        lossesOrRenunciations:
          "Menos tiempo en territorio porque la agenda de medios come.",
        whatFeelsCompressedNow:
          "Miedo a quedar como figura mediática y no como articulador de demanda real.",
        additionalContext:
          "Sé comunicar, pero mi eje es advocacy y presión legítima, no solo gestión de reputación.",
      },
      currentContext: {
        currentSituation:
          "Organización de sociedad civil con visibilidad creciente y presión para 'cuidar la marca'.",
        transitionGoal:
          "Rebalancear incidencia de fondo con comunicación estratégica sin vaciar el norte.",
        restrictions: [
          "Donantes que miden alcance",
          "Contexto político hostil",
        ],
        assets: [
          "Narrativa sólida",
          "Equipo movilizado",
          "Alianzas técnicas",
        ],
      },
    },
  },
  {
    id: "seed_commercial_connector_01",
    label: "Semilla — Conector comercial (claro)",
    expectation:
      "Debe tender a clear_direction con commercial_connector; crecimiento relacional, negocio, puente hacia oportunidad.",
    payload: {
      profile: {
        age: 35,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "secondary",
      },
      narrative: {
        childhoodMemories:
          "Vendía cosas en el colegio, hacía trueques, conocía a todo el mundo.",
        earlyFascinations:
          "Cerrar un trato justo donde ambos salen contentos.",
        meaningfulSchoolSubjects: "Matemática comercial, inglés, deportes donde había equipo.",
        repeatedWorkPatterns:
          "Abro puertas, genero confianza, llevo oportunidades y cuido la relación después del primer sí.",
        naturalSocialRoles:
          "El que conecta negocio sin ser garca obvio.",
        lossesOrRenunciations:
          "Menos profundidad técnica porque siempre estuve del lado de la relación.",
        whatFeelsCompressedNow:
          "Metas de venta agresivas que erosionan confianza; me desalinean.",
        additionalContext:
          "No soy articulador institucional ni terapeuta; mi juego es valor comercial con vínculo sostenible.",
      },
      currentContext: {
        currentSituation:
          "Cuentas clave B2B con ciclo largo y mucha competencia de precio.",
        transitionGoal:
          "Subir a rol de negocio más estratégico, no solo quota carrier.",
        restrictions: [
          "Comisiones variables",
          "Producto con problemas de entrega a veces",
        ],
        assets: [
          "Cartera confiable",
          "Escucha de necesidad real",
          "Persistencia",
        ],
      },
    },
  },
  {
    id: "seed_commercial_connector_02",
    label: "Semilla — Comercial (riesgo conector diplomático)",
    expectation:
      "Debe tender a commercial_connector; riesgo de confundirlo con diplomatic_social_connector si domina alineación de partes sin eje de negocio explícito.",
    payload: {
      profile: {
        age: 38,
        country: "Colombia",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba que las partes se entendieran; después descubrí que podía cobrar por eso en contextos de negocio.",
        earlyFascinations:
          "Negociación, lectura de interés, crear espacios donde se puede hablar.",
        meaningfulSchoolSubjects: "Relaciones internacionales light, ventas consultivas, psicología pop.",
        repeatedWorkPatterns:
          "Facilito conversaciones entre cliente y área técnica; a veces parezco HR o político interno.",
        naturalSocialRoles:
          "Puente que diluye si es vendedor o mediador.",
        lossesOrRenunciations:
          "Menos foco en número cerrado porque me enamoro del acuerdo 'lindo'.",
        whatFeelsCompressedNow:
          "Si no cierro, no comemos; me tensiona la parte puramente comercial.",
        additionalContext:
          "Sé alinear actores, pero mi norte tiene que ser resultado comercial sostenible, no solo armonía.",
      },
      currentContext: {
        currentSituation:
          "Key account con múltiples stakeholders internos en el cliente y presión de renovación.",
        transitionGoal:
          "Clarificar propuesta de valor y cerrar con métricas sin perder el vínculo.",
        restrictions: [
          "Contraparte con poder de compra concentrado",
          "Producto maduro con poco diferencial",
        ],
        assets: [
          "Mapeo de poder en cuenta",
          "Paciencia para ciclos largos",
          "Credibilidad personal",
        ],
      },
    },
  },
];
