import type { UserIntake } from "@/lib/types/intake";

export type EvaluationCase = {
  id: string;
  label: string;
  expectation: string;
  payload: UserIntake;
};

export const EVALUATION_CASES: EvaluationCase[] = [
  {
    id: "compressed_life_case",
    label: "Vida comprimida con margen minimo",
    expectation:
      "Deberia tender a compressed_life o, como minimo, evitar clear_direction facil.",
    payload: {
      profile: {
        age: 46,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "secondary",
        dependents: 3,
      },
      currentContext: {
        currentRole: "Empleado administrativo",
        currentSituation:
          "Trabajo muchas horas, llego cansado, necesito ingresos estables y no puedo improvisar. Siento que sostengo todo pero me fui apagando.",
        energyLevel: "very_low",
        economicPressure: "very_high",
        familyLoad: "heavy",
        restrictions: [
          "Necesito ingresos estables",
          "No puedo hacer un cambio brusco",
          "Tengo poco tiempo libre",
        ],
        assets: [
          "Experiencia laboral sostenida",
          "Responsabilidad",
          "Capacidad de sostener rutina",
        ],
        transitionGoal:
          "Encontrar una salida gradual sin romper lo poco estable que tengo",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba leer, escribir y pensar ideas, pero eso quedo muy atras.",
        earlyFascinations:
          "Me interesaban la historia, la politica y entender a la gente.",
        meaningfulSchoolSubjects:
          "Historia y lengua me dejaban algo, pero no segui por ahi.",
        repeatedWorkPatterns:
          "Suelo cumplir, sostener, aguantar y resolver lo urgente mas que construir algo propio.",
        naturalSocialRoles:
          "A veces ordeno o acompano, pero hoy casi no me queda resto.",
        lossesOrRenunciations:
          "Fui dejando intereses, curiosidad y ganas por necesidad economica.",
        whatFeelsCompressedNow:
          "Mi vida laboral se volvio pura supervivencia y siento que me achique.",
        additionalContext:
          "No busco una fantasia. Busco una lectura honesta.",
      },
    },
  },
  {
    id: "insufficient_evidence_case",
    label: "Caso ambiguo con evidencia insuficiente",
    expectation:
      "Deberia caer en insufficient_evidence y no inventar direccion.",
    payload: {
      profile: {
        age: 34,
        country: "Chile",
        language: "es",
        employmentStatus: "between_roles",
        educationLevel: "university",
        dependents: 0,
      },
      currentContext: {
        currentRole: "Sin rol estable",
        currentSituation:
          "Estoy entre trabajos y no tengo muy claro que quiero.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "light",
        restrictions: ["Necesito volver a trabajar pronto"],
        assets: ["Titulo universitario"],
        transitionGoal: "Encontrar algo que me ordene",
      },
      narrative: {
        childhoodMemories: "Me gustaban distintas cosas.",
        earlyFascinations: "A veces me interesaban temas variados.",
        meaningfulSchoolSubjects: "No hubo una materia muy clara.",
        repeatedWorkPatterns: "Tuve trabajos distintos sin mucho patron.",
        naturalSocialRoles: "Depende del grupo.",
        lossesOrRenunciations: "No se si deje algo claro atras.",
        whatFeelsCompressedNow:
          "Mas que comprimido, me siento confundido.",
        additionalContext:
          "Necesito mas claridad, pero no tengo mucho mas para agregar.",
      },
    },
  },
  {
    id: "analytical_strategist_case",
    label: "Perfil analitico con senales convergentes",
    expectation:
      "Deberia poder acercarse a clear_direction o al menos mostrar direccion plausible mas nitida.",
    payload: {
      profile: {
        age: 39,
        country: "Mexico",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 1,
      },
      currentContext: {
        currentRole: "Coordinador de operaciones",
        currentSituation:
          "Estoy estable, pero noto que siempre termino ordenando problemas, viendo patrones y pensando mejoras.",
        energyLevel: "high",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["No quiero perder estabilidad de golpe"],
        assets: [
          "Experiencia coordinando procesos",
          "Pensamiento estructural",
          "Capacidad analitica",
        ],
        transitionGoal:
          "Moverme gradualmente hacia algo mas estrategico y menos reactivo",
      },
      narrative: {
        childhoodMemories:
          "De chico me entretenia armando sistemas, clasificando cosas y entendiendo como funcionaban.",
        earlyFascinations:
          "Me interesaban los mapas, la logica, los juegos de estrategia y entender estructuras.",
        meaningfulSchoolSubjects:
          "Matematica, historia y cualquier materia donde hubiera que analizar y relacionar.",
        repeatedWorkPatterns:
          "En cualquier trabajo termino detectando patrones, ordenando procesos y proponiendo mejoras.",
        naturalSocialRoles:
          "Suelo ser quien ordena la complejidad y baja problemas a algo manejable.",
        lossesOrRenunciations:
          "Fui dejando de lado la parte mas estrategica por urgencias operativas.",
        whatFeelsCompressedNow:
          "Siento que resuelvo demasiado en corto y uso poco mi capacidad de analisis de fondo.",
        additionalContext: "Me interesa una lectura concreta, no motivacional.",
      },
    },
  },
  {
    id: "community_builder_case",
    label: "Perfil social/articulador con senales repetidas",
    expectation:
      "Deberia detectar una direccion social/articuladora sin inflarla de mas.",
    payload: {
      profile: {
        age: 37,
        country: "Uruguay",
        language: "es",
        employmentStatus: "self_employed",
        educationLevel: "university",
        dependents: 1,
      },
      currentContext: {
        currentRole: "Freelance en proyectos varios",
        currentSituation:
          "Me sostengo, pero veo que lo que mejor hago es conectar personas, coordinar equipos y sostener procesos.",
        energyLevel: "medium",
        economicPressure: "high",
        familyLoad: "moderate",
        restrictions: ["Necesito mas previsibilidad economica"],
        assets: [
          "Red de contactos",
          "Capacidad de coordinacion",
          "Buena comunicacion",
        ],
        transitionGoal:
          "Encontrar un rol mas estable donde articular personas y procesos",
      },
      narrative: {
        childhoodMemories:
          "De chica organizaba juegos, reunia grupos y me gustaba que todos encontraran su lugar.",
        earlyFascinations:
          "Me atraian los grupos, los proyectos compartidos y las dinamicas entre personas.",
        meaningfulSchoolSubjects:
          "Me gustaban las actividades grupales, lengua y espacios de participacion.",
        repeatedWorkPatterns:
          "Siempre termino coordinando gente, mediando tensiones y sosteniendo el funcionamiento del grupo.",
        naturalSocialRoles:
          "Ocupo un lugar de articulacion, contencion y orden entre personas.",
        lossesOrRenunciations:
          "Por necesidad economica acepte trabajos que no aprovechaban eso.",
        whatFeelsCompressedNow:
          "Siento que hago tareas aisladas cuando mi fuerza real aparece trabajando con otros.",
        additionalContext:
          "No quiero que me idealicen. Quiero saber si esto realmente tiene traduccion laboral.",
      },
    },
  },
  {
    id: "technical_builder_case",
    label: "Perfil tecnico/practico con direccion operativa",
    expectation:
      "Deberia detectar una direccion tecnica/operativa plausible, sin romantizarla.",
    payload: {
      profile: {
        age: 41,
        country: "Colombia",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "technical",
        dependents: 2,
      },
      currentContext: {
        currentRole: "Supervisor tecnico",
        currentSituation:
          "Tengo experiencia practica y siempre termino mejorando como se hacen las cosas.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["No puedo volver a estudiar una carrera larga"],
        assets: [
          "Experiencia tecnica",
          "Capacidad de ejecucion",
          "Orden operativo",
        ],
        transitionGoal:
          "Pasar a algo mas disenado y menos puramente reactivo dentro del mundo operativo",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba armar, desarmar, reparar y entender como funcionaban los objetos.",
        earlyFascinations:
          "Siempre me atrajeron las herramientas, los mecanismos y la mejora practica.",
        meaningfulSchoolSubjects:
          "Me servian mas los espacios tecnicos que los puramente teoricos.",
        repeatedWorkPatterns:
          "Termino ordenando tareas, resolviendo fallas y mejorando procesos concretos.",
        naturalSocialRoles:
          "Ocupo un lugar de ejecucion confiable y resolucion practica.",
        lossesOrRenunciations:
          "Deje de lado crecimiento mas estructurado por quedarme en lo urgente.",
        whatFeelsCompressedNow:
          "Siento que resuelvo demasiado sobre la marcha y diseno poco.",
        additionalContext: "Quiero una lectura realista y aplicable.",
      },
    },
  },
  {
    id: "social_connector_clear_case",
    label: "Articulador social dominante, no terapeutico",
    expectation:
      "Deberia tender a clear_direction con perfil diplomatic_social_connector y no caer por defecto en empathic_guide.",
    payload: {
      profile: {
        age: 38,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 1,
      },
      currentContext: {
        currentRole: "Coordinadora de alianzas",
        currentSituation:
          "Estoy estable, pero donde mas rindo es cuando tengo que coordinar equipos, ordenar procesos entre personas y conectar areas para que el grupo avance.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["Necesito previsibilidad economica"],
        assets: [
          "Red de contactos",
          "Capacidad para coordinar",
          "Orden de gestion",
        ],
        transitionGoal:
          "Consolidar un rol donde pueda articular personas, procesos y alianzas",
      },
      narrative: {
        childhoodMemories:
          "De chica organizaba juegos, repartia roles y buscaba que el grupo funcionara bien.",
        earlyFascinations:
          "Me atraian los grupos, los proyectos compartidos y ver como conectar personas distintas.",
        meaningfulSchoolSubjects:
          "Disfrutaba lengua, actividades grupales y espacios donde hubiera que organizar.",
        repeatedWorkPatterns:
          "Siempre termino coordinando gente, mediando intereses, gestionando cruces y sosteniendo el orden del equipo.",
        naturalSocialRoles:
          "Suelo ocupar un lugar de articulacion y coordinacion entre personas y areas.",
        lossesOrRenunciations:
          "Por necesidad economica acepte tareas mas aisladas y menos conectadas con esa fuerza.",
        whatFeelsCompressedNow:
          "Siento que uso mi capacidad de articulacion para apagar incendios y no para construir algo mas grande.",
        additionalContext:
          "Quiero saber si esto tiene salida laboral concreta y no solo valor humano.",
      },
    },
  },
  {
    id: "empathic_guide_case",
    label: "Empatico guia puro",
    expectation:
      "Deberia tender a empathic_guide y no confundirse con social connector institucional.",
    payload: {
      profile: {
        age: 35,
        country: "Peru",
        language: "es",
        employmentStatus: "self_employed",
        educationLevel: "university",
        dependents: 0,
      },
      currentContext: {
        currentRole: "Consultora independiente",
        currentSituation:
          "Lo que mejor hago es escuchar personas, entender conflictos y ayudar a ordenar situaciones complejas.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "light",
        restrictions: ["Necesito una transicion gradual"],
        assets: [
          "Escucha profunda",
          "Sensibilidad interpersonal",
          "Capacidad de acompanar",
        ],
        transitionGoal:
          "Encontrar una salida laboral donde la escucha y la comprension tengan valor real",
      },
      narrative: {
        childhoodMemories:
          "Desde chica la gente me contaba cosas y yo trataba de entender lo que les pasaba.",
        earlyFascinations:
          "Me interesaban las personas, los conflictos humanos y por que alguien se siente como se siente.",
        meaningfulSchoolSubjects:
          "Me servian lengua, filosofia y todo espacio donde hubiera que interpretar personas.",
        repeatedWorkPatterns:
          "Siempre termino escuchando, acompanando y ayudando a otros a entender situaciones tensas.",
        naturalSocialRoles:
          "Ocupo un lugar de escucha, contencion y acompanamiento mas que de coordinacion.",
        lossesOrRenunciations:
          "Por priorizar ingresos deje de lado espacios donde podia ayudar de manera mas clara.",
        whatFeelsCompressedNow:
          "Sostengo a otros, pero no termino de ordenar mi propia direccion.",
        additionalContext:
          "No quiero una lectura mistica. Quiero saber si esta fuerza tiene traduccion laboral seria.",
      },
    },
  },
  {
    id: "creative_storyteller_case",
    label: "Creativo narrativo claro",
    expectation:
      "Deberia tender a creative_storyteller y no desdibujarse como simple curiosidad cultural.",
    payload: {
      profile: {
        age: 33,
        country: "Spain",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 0,
      },
      currentContext: {
        currentRole: "Asistente de comunicacion",
        currentSituation:
          "Estoy en un rol administrativo, pero donde mas rindo es escribiendo, explicando ideas y comunicando con claridad.",
        energyLevel: "high",
        economicPressure: "medium",
        familyLoad: "light",
        restrictions: ["No quiero quemar mi ingreso actual"],
        assets: [
          "Escritura",
          "Sintesis",
          "Capacidad de comunicar",
        ],
        transitionGoal:
          "Moverme hacia un rol donde escribir, contar y traducir ideas sea parte central del trabajo",
      },
      narrative: {
        childhoodMemories:
          "De chica escribia cuentos, relataba escenas y me inventaba formas de contar lo que veia.",
        earlyFascinations:
          "Me atraian los libros, la historia, las palabras y como una idea cambia segun como se la cuente.",
        meaningfulSchoolSubjects:
          "Lengua, historia y cualquier espacio donde hubiera que escribir, relatar o explicar.",
        repeatedWorkPatterns:
          "Siempre termino redactando, contando, explicando procesos y comunicando mejor que otros.",
        naturalSocialRoles:
          "Suelo ocupar el lugar de quien baja ideas complejas a un lenguaje claro.",
        lossesOrRenunciations:
          "Fui dejando la parte mas narrativa por tareas administrativas y operativas.",
        whatFeelsCompressedNow:
          "Siento que uso lenguaje funcional, pero poco mi capacidad real de construir relato.",
        additionalContext:
          "Quiero una lectura laboral, no una etiqueta linda.",
      },
    },
  },
  {
    id: "cultural_explorer_case",
    label: "Explorador cultural sin narrativa dominante",
    expectation:
      "Deberia tender a cultural_explorer sin inflarse de mas hacia storyteller claro.",
    payload: {
      profile: {
        age: 36,
        country: "Mexico",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 1,
      },
      currentContext: {
        currentRole: "Analista documental",
        currentSituation:
          "Trabajo en algo estable, pero mi interes persistente esta en leer sobre historia, cultura, idiomas e ideas.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["Necesito que cualquier cambio sea gradual"],
        assets: [
          "Lectura profunda",
          "Curiosidad sostenida",
          "Capacidad de relacionar contextos",
        ],
        transitionGoal:
          "Encontrar una salida donde investigar, leer y conectar ideas tenga mas peso",
      },
      narrative: {
        childhoodMemories:
          "De chico me perdia leyendo atlas, enciclopedias y textos sobre otros paises.",
        earlyFascinations:
          "Siempre me atrajeron la historia, la cultura, los idiomas y como cambia una sociedad.",
        meaningfulSchoolSubjects:
          "Historia, geografia y espacios donde hubiera que comparar contextos e ideas.",
        repeatedWorkPatterns:
          "Siempre termino investigando, comparando contextos, leyendo y conectando ideas de distintos campos.",
        naturalSocialRoles:
          "No suelo liderar grupos; mas bien observo, entiendo y comparo lo que pasa.",
        lossesOrRenunciations:
          "Fui dejando exploraciones mas abiertas por necesidad de trabajar en algo mas cerrado.",
        whatFeelsCompressedNow:
          "Aprendo mucho, pero convierto poco de eso en un camino laboral reconocible.",
        additionalContext:
          "No quiero que me sobrediagnostiquen solo por curiosidad intelectual.",
      },
    },
  },
  {
    id: "analytical_compressed_case",
    label: "Analitico comprimido por supervivencia",
    expectation:
      "Deberia mostrar patron analitico fuerte, pero leerlo como compressed_life por el presente.",
    payload: {
      profile: {
        age: 42,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 2,
      },
      currentContext: {
        currentRole: "Jefe operativo",
        currentSituation:
          "Trabajo en algo estable pero muy reactivo. Llego agotado y casi no me queda energia mental.",
        energyLevel: "very_low",
        economicPressure: "very_high",
        familyLoad: "heavy",
        restrictions: [
          "No puedo resignar ingresos ahora",
          "No puedo mover demasiado a la vez",
        ],
        assets: [
          "Pensamiento estructural",
          "Capacidad de analisis",
          "Experiencia coordinando procesos",
        ],
        transitionGoal:
          "Recuperar margen y despues moverme hacia algo mas analitico y estrategico",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba entender sistemas, mapas, reglas y como encajaban las partes.",
        earlyFascinations:
          "Siempre me atrajeron la logica, la estructura, la estrategia y detectar patrones.",
        meaningfulSchoolSubjects:
          "Matematica, historia y cualquier materia donde hubiera que analizar y comparar.",
        repeatedWorkPatterns:
          "En cualquier trabajo termino detectando patrones, ordenando estructura y proponiendo mejoras.",
        naturalSocialRoles:
          "Ocupo el lugar de quien compara opciones, baja la complejidad y ve el mapa general.",
        lossesOrRenunciations:
          "Fui dejando de lado exploracion mas profunda por necesidad economica y urgencia familiar.",
        whatFeelsCompressedNow:
          "Mi vida actual me deja usar solo una parte muy reducida de mi capacidad analitica.",
        additionalContext:
          "No necesito entusiasmo. Necesito saber si esto es direccion o solo nostalgia.",
      },
    },
  },
  {
    id: "social_compressed_case",
    label: "Social fuerte pero comprimido por contexto",
    expectation:
      "Deberia detectar patron social claro, pero priorizar compressed_life si el margen es minimo.",
    payload: {
      profile: {
        age: 40,
        country: "Uruguay",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 3,
      },
      currentContext: {
        currentRole: "Administrativa senior",
        currentSituation:
          "Entre trabajo, familia y obligaciones quede reducida a sostener la rueda.",
        energyLevel: "very_low",
        economicPressure: "very_high",
        familyLoad: "heavy",
        restrictions: [
          "Necesito ingresos previsibles",
          "No puedo asumir riesgos grandes",
        ],
        assets: [
          "Red de contactos",
          "Capacidad para coordinar",
          "Buena comunicacion",
        ],
        transitionGoal:
          "Encontrar una salida gradual donde pueda usar mejor mi fuerza con personas",
      },
      narrative: {
        childhoodMemories:
          "De chica reunia gente, organizaba grupos y hacia de puente cuando habia roces.",
        earlyFascinations:
          "Me interesaban los proyectos compartidos, los grupos y el lugar de cada persona en una dinamica.",
        meaningfulSchoolSubjects:
          "Me gustaban lengua, trabajo grupal y espacios de participacion.",
        repeatedWorkPatterns:
          "Siempre termino conectando personas, coordinando equipos y destrabando tensiones.",
        naturalSocialRoles:
          "Suelo ocupar un lugar de articulacion, orden y contencion entre personas.",
        lossesOrRenunciations:
          "Fui aceptando tareas mas cerradas por necesidad economica y familiar.",
        whatFeelsCompressedNow:
          "Mi direccion aparece con otros, pero hoy casi no tengo margen de maniobra.",
        additionalContext:
          "Quiero saber si hay una lectura seria sin obligarme a moverme ahora.",
      },
    },
  },
  {
    id: "lexical_trap_humanistic_business_case",
    label: "Humanistico con vocabulario de negocio",
    expectation:
      "No deberia irse facil a analitico u oportunidad solo por palabras de negocio.",
    payload: {
      profile: {
        age: 31,
        country: "Argentina",
        language: "es",
        employmentStatus: "self_employed",
        educationLevel: "university",
        dependents: 0,
      },
      currentContext: {
        currentRole: "Freelance de contenido",
        currentSituation:
          "Me interesa pensar proyectos, posicionamiento y estrategia, pero lo que mas disfruto es escribir, interpretar climas y construir mensajes con sentido.",
        energyLevel: "medium",
        economicPressure: "high",
        familyLoad: "light",
        restrictions: ["Necesito sostener facturacion"],
        assets: [
          "Escritura",
          "Lectura cultural",
          "Capacidad de comunicar",
        ],
        transitionGoal:
          "Encontrar un rol donde la comunicacion, el contenido y la narrativa tengan mas centralidad",
      },
      narrative: {
        childhoodMemories:
          "Desde chico escribia, relataba escenas y me gustaba darle forma a ideas en palabras.",
        earlyFascinations:
          "Me atraian los libros, la historia, las ideas y tambien pensar como hacer que un proyecto llegue mejor.",
        meaningfulSchoolSubjects:
          "Lengua, historia y todo espacio donde hubiera que contar, explicar o comunicar.",
        repeatedWorkPatterns:
          "Siempre termino escribiendo, explicando mejor, comunicando ideas y pensando como posicionarlas.",
        naturalSocialRoles:
          "Suelo ocupar el lugar de quien interpreta el clima, baja mensajes y encuentra el tono correcto.",
        lossesOrRenunciations:
          "Por necesidad de facturar empece a hablar mas en lenguaje de negocio que en lenguaje propio.",
        whatFeelsCompressedNow:
          "Siento que uso palabras de estrategia, pero en el fondo lo mio es narrativo y expresivo.",
        additionalContext:
          "Quiero evitar que el sistema confunda vocabulario de mercado con direccion real.",
      },
    },
  },
  {
    id: "hybrid_analytical_technical_case",
    label: "Hibrido analitico-tecnico legitimo",
    expectation:
      "No deberia caer en insufficient_evidence solo por mezcla; deberia admitir clear_direction hibrida.",
    payload: {
      profile: {
        age: 38,
        country: "Chile",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "technical",
        dependents: 1,
      },
      currentContext: {
        currentRole: "Lider de mejora continua",
        currentSituation:
          "Disfruto tanto pensar estructura y mejoras como bajar eso a procesos concretos y operacion.",
        energyLevel: "high",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["No quiero cambiar de sector de golpe"],
        assets: [
          "Pensamiento estructural",
          "Ejecucion",
          "Mejora continua",
        ],
        transitionGoal:
          "Consolidar una salida donde estrategia operativa y ejecucion convivan",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba entender como funcionaban los sistemas y tambien arreglar cosas concretas.",
        earlyFascinations:
          "Me interesaban la logica, los procesos, los mecanismos y como mejorar lo que ya existia.",
        meaningfulSchoolSubjects:
          "Me servian tanto las materias tecnicas como los espacios donde habia que analizar y relacionar.",
        repeatedWorkPatterns:
          "Siempre termino viendo el mapa general, detectando patrones y corrigiendo como se ejecuta el proceso.",
        naturalSocialRoles:
          "Ocupo un lugar de orden, comparacion y resolucion aplicada.",
        lossesOrRenunciations:
          "Por urgencia del dia a dia quede mas pegado a la ejecucion que al diseno mas amplio.",
        whatFeelsCompressedNow:
          "Resuelvo bien en operacion, pero todavia uso poco mi parte mas estrategica.",
        additionalContext:
          "No quiero que la mezcla se lea como confusion si en realidad es una combinacion legitima.",
      },
    },
  },
  {
    id: "technical_with_emotional_lexicon_case",
    label: "Tecnico con lenguaje emocional superficial",
    expectation:
      "No deberia irse a empathic_guide solo por palabras como ayudar o personas.",
    payload: {
      profile: {
        age: 36,
        country: "Colombia",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "technical",
        dependents: 2,
      },
      currentContext: {
        currentRole: "Encargado de mantenimiento",
        currentSituation:
          "Me gusta ayudar, pero donde de verdad aporto es ordenando operaciones, resolviendo fallas y mejorando procesos.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["No puedo dejar mi estabilidad actual"],
        assets: [
          "Capacidad de ejecucion",
          "Orden operativo",
          "Experiencia tecnica",
        ],
        transitionGoal:
          "Moverme hacia una funcion mas tecnica y menos reactiva",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba armar, desarmar y reparar cosas hasta entender como funcionaban.",
        earlyFascinations:
          "Siempre me atrajeron las herramientas, los mecanismos y la mejora practica.",
        meaningfulSchoolSubjects:
          "Me iba mejor en talleres, espacios tecnicos y practicos.",
        repeatedWorkPatterns:
          "Siempre termino resolviendo fallas, ordenando tareas, gestionando prioridad y mejorando procesos concretos.",
        naturalSocialRoles:
          "Suelo ocupar un lugar confiable de ejecucion y resolucion, aunque tambien me gusta ayudar a otros.",
        lossesOrRenunciations:
          "Deje de lado crecimiento mas estructurado por quedarme en lo urgente.",
        whatFeelsCompressedNow:
          "Apago incendios sobre la marcha y diseno poco.",
        additionalContext:
          "Quiero evitar una lectura blanda si mi fuerza real es operativa.",
      },
    },
  },
  {
    id: "weak_cultural_signal_case",
    label: "Curiosidad cultural aislada no suficiente",
    expectation:
      "Deberia caer en insufficient_evidence aunque aparezca una senal cultural suelta.",
    payload: {
      profile: {
        age: 29,
        country: "Peru",
        language: "es",
        employmentStatus: "between_roles",
        educationLevel: "university",
        dependents: 0,
      },
      currentContext: {
        currentRole: "Sin rol estable",
        currentSituation:
          "Estoy buscando trabajo y una de las pocas cosas que me interesa de verdad es la historia y la cultura.",
        energyLevel: "medium",
        economicPressure: "high",
        familyLoad: "light",
        restrictions: ["Necesito volver a trabajar pronto"],
        assets: ["Curiosidad"],
        transitionGoal: "Encontrar algo que no me desconecte del todo",
      },
      narrative: {
        childhoodMemories: "Me gustaba leer algunas cosas sueltas.",
        earlyFascinations: "Me interesaban la historia y ciertos temas de cultura.",
        meaningfulSchoolSubjects: "Historia a veces me gustaba.",
        repeatedWorkPatterns: "No tengo un patron claro.",
        naturalSocialRoles: "No se bien.",
        lossesOrRenunciations: "No identifico una renuncia clara.",
        whatFeelsCompressedNow:
          "Mas que comprimido, me siento en pausa.",
        additionalContext:
          "No quiero que una curiosidad aislada se lea como direccion seria.",
      },
    },
  },
  {
    id: "institutional_connector_clear_case",
    label: "Articulador institucional puro",
    expectation:
      "Deberia tender a diplomatic_social_connector y no confundirse con empathic_guide.",
    payload: {
      profile: {
        age: 42,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 2,
      },
      currentContext: {
        currentRole: "Enlace institucional",
        currentSituation:
          "Lo que mejor hago es alinear actores, mediar entre areas y sostener acuerdos funcionales entre equipos y organizaciones.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["No quiero perder estabilidad de golpe"],
        assets: [
          "Red de contactos",
          "Capacidad de articulacion",
          "Experiencia coordinando actores",
        ],
        transitionGoal:
          "Moverme hacia un rol mas claro de articulacion institucional y alianzas",
      },
      narrative: {
        childhoodMemories:
          "De chico me atraian los grupos, los liderazgos y ver como se ordenaban las personas.",
        earlyFascinations:
          "Me interesaban la politica, las instituciones, los acuerdos y las negociaciones.",
        meaningfulSchoolSubjects:
          "Historia, lengua y cualquier espacio de debate o participacion.",
        repeatedWorkPatterns:
          "Siempre termino coordinando actores, mediando tensiones y logrando que el grupo funcione.",
        naturalSocialRoles:
          "Suelo ocupar el lugar de puente entre sectores con intereses distintos.",
        lossesOrRenunciations:
          "Fui dejando de lado la parte mas estrategica por sostener la gestion diaria.",
        whatFeelsCompressedNow:
          "Estoy resolviendo mucho en lo inmediato y usando poco mi capacidad de articulacion de fondo.",
        additionalContext:
          "No busco que me idealicen. Quiero saber si esto tiene traduccion laboral concreta.",
      },
    },
  },
  {
    id: "empathic_listener_clear_case",
    label: "Escucha humana profunda",
    expectation:
      "Deberia tender a empathic_guide y no depender de lenguaje institucional para lograrlo.",
    payload: {
      profile: {
        age: 36,
        country: "Chile",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 1,
      },
      currentContext: {
        currentRole: "Acompanamiento al cliente",
        currentSituation:
          "Lo que mejor hago es escuchar, contener, hacer preguntas justas y ayudar a otros a entender situaciones personales complejas.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["Necesito una transicion gradual"],
        assets: [
          "Escucha profunda",
          "Capacidad de acompanar",
          "Sensibilidad interpersonal",
        ],
        transitionGoal:
          "Encontrar un rol donde mi valor principal sea acompanar y ordenar procesos humanos",
      },
      narrative: {
        childhoodMemories:
          "Desde chica la gente me buscaba para contarme cosas y yo trataba de entenderlas sin juzgar.",
        earlyFascinations:
          "Siempre me intereso entender a las personas, los vinculos y los conflictos.",
        meaningfulSchoolSubjects:
          "Psicologia, lengua y espacios donde habia que interpretar a otros.",
        repeatedWorkPatterns:
          "Siempre termino escuchando, acompanando y ayudando a otros a entender situaciones tensas.",
        naturalSocialRoles:
          "Ocupo un lugar de escucha, contencion y lectura humana fina.",
        lossesOrRenunciations:
          "Fui priorizando trabajos funcionales y dejando atras espacios donde podia acompanar de verdad.",
        whatFeelsCompressedNow:
          "Sostengo a otros, pero no termino de ordenar mi propia direccion.",
        additionalContext:
          "No quiero un diagnostico motivacional. Quiero una lectura seria.",
      },
    },
  },
  {
    id: "storyteller_with_strategy_words_case",
    label: "Narrador con vocabulario estrategico",
    expectation:
      "Deberia seguir yendose a creative_storyteller aunque aparezcan palabras como estrategia, posicionamiento o marca.",
    payload: {
      profile: {
        age: 38,
        country: "Mexico",
        language: "es",
        employmentStatus: "self_employed",
        educationLevel: "university",
        dependents: 1,
      },
      currentContext: {
        currentRole: "Comunicacion freelance",
        currentSituation:
          "Pienso estrategia, posicionamiento y mensajes, pero mi fuerza real aparece cuando escribo, nombro y construyo relato con claridad.",
        energyLevel: "medium",
        economicPressure: "high",
        familyLoad: "moderate",
        restrictions: ["Necesito sostener facturacion"],
        assets: [
          "Escritura",
          "Sintesis",
          "Capacidad de comunicar",
        ],
        transitionGoal:
          "Encontrar una salida mas clara dentro de contenido, relato o proyectos editoriales",
      },
      narrative: {
        childhoodMemories:
          "De chica escribia historias, inventaba personajes y me gustaba explicar el mundo con palabras.",
        earlyFascinations:
          "Siempre me atraparon los libros, el cine, los personajes y la forma en que se cuenta una idea.",
        meaningfulSchoolSubjects:
          "Lengua, literatura, historia y todo lo que implicara interpretar y narrar.",
        repeatedWorkPatterns:
          "Siempre termino escribiendo, editando, explicando procesos y dandole forma verbal a ideas complejas.",
        naturalSocialRoles:
          "Suelo ser quien encuentra el lenguaje para que otros entiendan una historia o una idea.",
        lossesOrRenunciations:
          "Fui usando mi escritura para sobrevivir mas que para construir una direccion propia.",
        whatFeelsCompressedNow:
          "Uso lenguaje funcional todos los dias, pero no toda mi capacidad real de construir relato.",
        additionalContext:
          "No quiero que palabras de negocio tapen una evidencia narrativa clara.",
      },
    },
  },
  {
    id: "cultural_explorer_clear_case",
    label: "Explorador cultural riguroso",
    expectation:
      "Deberia tender a cultural_explorer sin inflarse hacia storyteller si no aparece construccion narrativa dominante.",
    payload: {
      profile: {
        age: 35,
        country: "Uruguay",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 0,
      },
      currentContext: {
        currentRole: "Administrativo",
        currentSituation:
          "Trabajo en algo estable, pero mi interes persistente esta en leer historia, comparar procesos sociales, aprender idiomas y conectar contextos.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "light",
        restrictions: ["Necesito que cualquier cambio sea gradual"],
        assets: [
          "Lectura profunda",
          "Curiosidad sostenida",
          "Capacidad de relacionar contextos",
        ],
        transitionGoal:
          "Moverme hacia algo donde investigar, ordenar contexto y aprender tenga mas lugar",
      },
      narrative: {
        childhoodMemories:
          "De chico pasaba horas leyendo atlas, historia y temas culturales por pura curiosidad.",
        earlyFascinations:
          "Me interesaban la historia, las culturas, los idiomas y entender como pensaban otras sociedades.",
        meaningfulSchoolSubjects:
          "Historia, geografia y cualquier materia donde hubiera contexto y comparacion.",
        repeatedWorkPatterns:
          "Siempre termino investigando, comparando contextos, leyendo y conectando ideas de distintos campos.",
        naturalSocialRoles:
          "Suelo ser quien trae contexto, referencias y conexiones que los demas no ven.",
        lossesOrRenunciations:
          "Fui dejando este interes en segundo plano por sostener un trabajo estable.",
        whatFeelsCompressedNow:
          "Aprendo mucho, pero convierto poco de eso en un camino laboral reconocible.",
        additionalContext:
          "No quiero que me inventen narrativa si lo que aparece es exploracion cultural seria.",
      },
    },
  },
  {
    id: "technical_builder_clean_case",
    label: "Tecnico operativo limpio",
    expectation:
      "Deberia tender a technical_builder sin contaminarse por lenguaje social o emocional superficial.",
    payload: {
      profile: {
        age: 41,
        country: "Colombia",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "technical",
        dependents: 2,
      },
      currentContext: {
        currentRole: "Supervisor tecnico",
        currentSituation:
          "Resuelvo fallas, ordeno tareas, ajusto procesos y hago que la operacion salga sin trabarse.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["No puedo dejar mi estabilidad actual"],
        assets: [
          "Capacidad de ejecucion",
          "Experiencia tecnica",
          "Orden operativo",
        ],
        transitionGoal:
          "Pasar a algo mas disenado y menos reactivo dentro del mundo operativo",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba armar, desarmar, reparar y entender como funcionaban los objetos.",
        earlyFascinations:
          "Siempre me atrajeron las herramientas, los mecanismos y la mejora practica.",
        meaningfulSchoolSubjects:
          "Me servian mas los espacios tecnicos que los puramente teoricos.",
        repeatedWorkPatterns:
          "Siempre termino resolviendo fallas, ordenando tareas, gestionando prioridad y mejorando procesos concretos.",
        naturalSocialRoles:
          "Ocupo un lugar de ejecucion confiable y resolucion practica.",
        lossesOrRenunciations:
          "Deje de lado crecimiento mas estructurado por quedarme atrapado en la urgencia operativa.",
        whatFeelsCompressedNow:
          "Apago incendios sobre la marcha y diseno poco.",
        additionalContext:
          "No quiero que palabras blandas tapen una evidencia tecnica clara.",
      },
    },
  },
  {
    id: "social_compressed_priority_case",
    label: "Social fuerte pero comprimido por contexto",
    expectation:
      "Deberia detectar patron social claro, pero priorizar compressed_life si el margen es minimo.",
    payload: {
      profile: {
        age: 39,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 3,
      },
      currentContext: {
        currentRole: "Coordinacion informal",
        currentSituation:
          "Entre trabajo, familia y obligaciones quede reducido a sostener la rueda y llegar como puedo.",
        energyLevel: "very_low",
        economicPressure: "very_high",
        familyLoad: "heavy",
        restrictions: [
          "Necesito ingresos previsibles",
          "No puedo asumir riesgos grandes",
          "No tengo margen de maniobra real",
        ],
        assets: [
          "Red de contactos",
          "Capacidad para coordinar",
          "Buena comunicacion",
        ],
        transitionGoal:
          "Encontrar una salida gradual sin romper lo poco estable que todavia sostengo",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba reunir personas, ordenar grupos y ver que cada uno encontrara su lugar.",
        earlyFascinations:
          "Siempre me atrajeron los grupos, las dinamicas compartidas y la coordinacion entre personas.",
        meaningfulSchoolSubjects:
          "Me gustaban las actividades grupales, lengua y espacios de participacion.",
        repeatedWorkPatterns:
          "Siempre termino conectando personas, coordinando equipos y destrabando tensiones.",
        naturalSocialRoles:
          "Ocupo un lugar de articulacion, contencion y orden entre personas.",
        lossesOrRenunciations:
          "Por necesidad economica acepte trabajos que no aprovechaban esa fuerza.",
        whatFeelsCompressedNow:
          "Mi direccion aparece con otros, pero hoy casi no tengo margen de maniobra.",
        additionalContext:
          "No quiero que el sistema ignore el patron social, pero tampoco que subestime el ahogo actual.",
      },
    },
  },
];