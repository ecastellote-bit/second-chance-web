import type { EvaluationCase } from "./evaluationCases";

export const HUMAN_LANGUAGE_CASES: EvaluationCase[] = [
  {
    id: "voc_t1_escucha_uno_a_uno",
    label: "Voc T1 – Escucha humana uno a uno",
    expectation:
      "Debería tender a clear_direction con empathic_guide y no confundirse con diplomatic_social_connector.",
    payload: {
      profile: {
        age: 40,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "De chico era a quien le contaban cosas difíciles porque podía escuchar a fondo sin apurar ni juzgar.",
        earlyFascinations:
          "Me interesaba entender qué le pasaba de verdad a la gente y hacer preguntas que ayudaran a ordenar lo confuso.",
        meaningfulSchoolSubjects: "Lengua, Filosofía, Psicología",
        repeatedWorkPatterns:
          "Siempre termino escuchando a fondo, conteniendo, haciendo preguntas justas y ayudando a otros a entender situaciones personales complejas.",
        naturalSocialRoles:
          "Acompañante, escucha profunda, presencia humana con criterio.",
        lossesOrRenunciations:
          "Fui dejando ese costado en segundo plano por tareas más funcionales y menos humanas.",
        whatFeelsCompressedNow:
          "Sostengo mucho a otros, pero eso todavía no está canalizado en una dirección propia clara.",
        additionalContext:
          "Puedo trabajar con equipos, pero mi aporte real no es sostener comunidad sino acompañar personas una por una con escucha y claridad.",
      },
      currentContext: {
        currentSituation:
          "Trabajo dentro de una organización, pero donde más rindo es escuchando a fondo a personas sobrepasadas, ordenando conversaciones difíciles y ayudando a entender conflictos humanos sin invadir.",
        restrictions: [
          "Necesito una transición gradual",
          "No puedo perder estabilidad de golpe",
        ],
        assets: [
          "Escucha profunda",
          "Capacidad de acompañar",
          "Presencia humana",
          "Sensibilidad interpersonal",
        ],
      },
    },
  },
  {
    id: "voc_t2_articulador_de_actores",
    label: "Voc T2 – Articulador de actores, no terapéutico",
    expectation:
      "Debería tender a clear_direction con diplomatic_social_connector y no caer en empathic_guide.",
    payload: {
      profile: {
        age: 47,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Desde chico tendía a ordenar grupos, leer climas y acercar posiciones entre personas que pensaban distinto.",
        earlyFascinations:
          "Me atraían los espacios donde había que interpretar intereses, construir acuerdos y destrabar conflictos entre actores.",
        meaningfulSchoolSubjects: "Historia, Educación cívica, Lengua",
        repeatedWorkPatterns:
          "Siempre termino articulando personas, mediando tensiones, negociando posiciones y haciendo que distintas partes puedan convivir en un mismo esquema.",
        naturalSocialRoles:
          "Articulador, mediador, lector de actores.",
        lossesOrRenunciations:
          "Postergué un desarrollo más expansivo por necesidad de sostener estructura e ingresos.",
        whatFeelsCompressedNow:
          "Siento que esa capacidad está usada de forma defensiva y táctica, no como una función expansiva y bien ubicada.",
        additionalContext:
          "Tiene sensibilidad interpersonal, pero su fuerza principal aparece en la lectura de actores y la coordinación política, no en la contención emocional.",
      },
      currentContext: {
        currentSituation:
          "Estoy estable, pero donde mejor rindo es coordinando actores, leyendo intereses, conectando sectores y ordenando cruces para destrabar situaciones.",
        restrictions: [
          "Necesito previsibilidad económica",
          "No puedo asumir una transición caótica",
        ],
        assets: [
          "Red de contactos",
          "Negociación",
          "Lectura de actores",
          "Orden de gestión",
        ],
      },
    },
  },
  {
    id: "voc_t3_tejedor_de_comunidad",
    label: "Voc T3 – Tejedor de comunidad, no conector institucional",
    expectation:
      "Debería tender a clear_direction con community_builder y no derivar a diplomatic_social_connector ni a empathic_guide por inercia.",
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
          "De chico armaba clubes, grupos y espacios de pertenencia; me gustaba que la gente se sintiera parte.",
        earlyFascinations:
          "Me interesaban las comunidades, los grupos, la circulación entre personas y cómo sostener interacción.",
        meaningfulSchoolSubjects:
          "Literatura, Comunicación, Historia social",
        repeatedWorkPatterns:
          "Siempre termino sosteniendo comunidad, coordinando grupos, escuchando a la gente y construyendo mensajes claros para ordenar la interacción.",
        naturalSocialRoles:
          "Coordinador de comunidad, anfitrión, lector del clima grupal.",
        lossesOrRenunciations:
          "Dejé en segundo plano mi propia dirección por quedarme sosteniendo espacios colectivos.",
        whatFeelsCompressedNow:
          "Mi capacidad de pertenencia y circulación existe, pero hoy aparece más como sostén invisible que como función clara.",
        additionalContext:
          "Me sale nombrar lo que pasa, cuidar el clima, sostener comunidad y construir relato compartido para que la interacción no se rompa.",
      },
      currentContext: {
        currentSituation:
          "Hoy donde mejor rindo es sosteniendo comunidad, coordinando grupos, escuchando a la gente y ordenando la circulación entre personas.",
        restrictions: [
          "Necesito continuidad de ingresos",
          "No puedo hacer un salto totalmente incierto",
        ],
        assets: [
          "Construcción de comunidad",
          "Escucha",
          "Mensajes claros",
          "Sostén de grupos",
        ],
      },
    },
  },
  {
    id: "voc_t4_analista_de_criterio",
    label: "Voc T4 – Analista de criterio, no ejecutor",
    expectation:
      "Debería tender a clear_direction con analytical_strategist y no caer en technical_builder.",
    payload: {
      profile: {
        age: 41,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "De chico me entretenía comparando caminos posibles y viendo cuál tenía más lógica antes de mover una pieza.",
        earlyFascinations:
          "Me interesaban los modelos, la estrategia, los escenarios y cómo funciona un sistema por dentro.",
        meaningfulSchoolSubjects:
          "Historia, Economía, Matemática, Filosofía",
        repeatedWorkPatterns:
          "Siempre termino comparando escenarios, ordenando criterios, leyendo estructura, evaluando alternativas y detectando oportunidades.",
        naturalSocialRoles:
          "Analista, comparador, diseñador de decisiones.",
        lossesOrRenunciations:
          "Muchas veces usé esa capacidad solo para responder urgencias en vez de ponerla al centro de mi trabajo.",
        whatFeelsCompressedNow:
          "Mi parte más fuerte aparece pensando escenarios y decisiones, pero hoy queda parcialmente tapada.",
        additionalContext:
          "Mi diferencial real no es ejecutar rápido sino ver el modelo, la lógica detrás del negocio y el costo de cada camino.",
      },
      currentContext: {
        currentSituation:
          "Trabajo bien con equipos y clientes, pero donde más rindo es comparando escenarios, leyendo estructura, detectando criterio y viendo oportunidades.",
        restrictions: [
          "Necesito sostener facturación",
          "No puedo entrar en una transición larga sin resultados",
        ],
        assets: [
          "Pensamiento estratégico",
          "Criterio comparativo",
          "Lectura de oportunidades",
          "Análisis de negocio",
        ],
      },
    },
  },
  {
    id: "voc_t5_resolvedor_operativo",
    label: "Voc T5 – Resolvedor operativo con lenguaje de análisis",
    expectation:
      "Debería tender a clear_direction con technical_builder y no derivar a analytical_strategist solo por vocabulario de criterio.",
    payload: {
      profile: {
        age: 39,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "secondary",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba arreglar cosas, ordenar tareas y hacer que algo que no funcionaba volviera a salir.",
        earlyFascinations:
          "Me atraían los mecanismos, los procesos concretos y cómo mejorar algo que estaba trabado.",
        meaningfulSchoolSubjects:
          "Taller, Matemática, Física aplicada",
        repeatedWorkPatterns:
          "Siempre termino resolviendo fallas, ajustando procesos, priorizando, mejorando la operación y haciendo que salga sin trabarse.",
        naturalSocialRoles:
          "Resolvedor, operador, organizador práctico.",
        lossesOrRenunciations:
          "Dejé en pausa ideas más grandes por quedarme sosteniendo crisis y operación.",
        whatFeelsCompressedNow:
          "Apago incendios sobre la marcha y uso menos de lo que podría en diseño operativo más estable.",
        additionalContext:
          "Tengo criterio y análisis, sí, pero puestos al servicio de ejecución, pasos concretos y mejora de procesos.",
      },
      currentContext: {
        currentSituation:
          "Hoy rindo mejor cuando tengo que resolver fallas, ajustar procesos, ordenar prioridad y hacer que la operación salga sin trabarse.",
        restrictions: [
          "No puedo dejar mi estabilidad actual",
          "Necesito pasos concretos",
        ],
        assets: [
          "Capacidad de ejecución",
          "Experiencia técnica",
          "Orden operativo",
          "Mejora de procesos",
        ],
      },
    },
  },
  {
    id: "voc_t6_curador_de_contextos",
    label: "Voc T6 – Curador de contextos que escribe, no narrador central",
    expectation:
      "Debería tender a clear_direction con cultural_explorer y no inflarse hacia creative_storyteller solo porque también escribe.",
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
          "Desde chico acumulaba autores, épocas, mapas y relaciones entre temas que parecían lejanos.",
        earlyFascinations:
          "Me interesaban la historia, la cultura, los idiomas y la conexión entre contextos distintos.",
        meaningfulSchoolSubjects:
          "Historia, Literatura, Filosofía",
        repeatedWorkPatterns:
          "Siempre termino investigando contextos, comparando procesos sociales, relacionando autores y escribiendo síntesis para ordenar ideas de distintos campos.",
        naturalSocialRoles:
          "Curador de ideas, lector de contextos, relacionador de materiales.",
        lossesOrRenunciations:
          "Aprendí mucho y conecté mucho, pero pocas veces convertí eso en una trayectoria visible.",
        whatFeelsCompressedNow:
          "Mi curiosidad cultural sigue viva, pero no siempre se traduce en una dirección laboral reconocible.",
        additionalContext:
          "Escribo para ordenar y sintetizar, no porque mi impulso central sea construir relato o voz propia.",
      },
      currentContext: {
        currentSituation:
          "Trabajo en algo estable, pero mi interés persistente está en leer historia, cultura, procesos sociales y conectar contextos.",
        restrictions: [
          "Necesito que cualquier cambio sea gradual",
          "No puedo desordenar mi base económica actual",
        ],
        assets: [
          "Lectura profunda",
          "Curiosidad cultural sostenida",
          "Capacidad de relacionar contextos",
          "Síntesis conceptual",
        ],
      },
    },
  },
  {
    id: "voc_t7_narradora_con_fondo_cultural",
    label: "Voc T7 – Narradora con fondo cultural, no curadora",
    expectation:
      "Debería tender a clear_direction con creative_storyteller y no derivar a cultural_explorer solo por tener referencias culturales fuertes.",
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
          "Desde chica escribía, nombraba cosas con precisión y armaba relatos para que otros entendieran mejor una escena.",
        earlyFascinations:
          "Me fascinaban la literatura, la voz, los mensajes, el tono y cómo construir relato con lenguaje.",
        meaningfulSchoolSubjects:
          "Lengua, Literatura, Historia",
        repeatedWorkPatterns:
          "Siempre termino escribiendo, editando, nombrando, construyendo relato y dándole forma verbal a ideas complejas para volverlas comunicables.",
        naturalSocialRoles:
          "Narradora, editora, constructora de mensajes.",
        lossesOrRenunciations:
          "Usé mucho lenguaje funcional o comercial y no siempre pude sostener mi veta más narrativa como eje principal.",
        whatFeelsCompressedNow:
          "Escribo y sintetizo todos los días, pero no siempre desde una dirección reconocible de contenido o relato.",
        additionalContext:
          "La cultura me nutre, pero no me define como exploradora sino como constructora de voz, mensajes y relato claro.",
      },
      currentContext: {
        currentSituation:
          "Pienso enfoque y referencias culturales, pero donde realmente rindo es escribiendo, editando, construyendo mensajes y dando claridad narrativa.",
        restrictions: [
          "Necesito sostener facturación",
          "No puedo hacer un giro desordenado",
        ],
        assets: [
          "Escritura",
          "Síntesis",
          "Capacidad de comunicar",
          "Construcción de voz",
        ],
      },
    },
  },
  {
    id: "voc_t8_operador_institucional",
    label: "Voc T8 – Operador institucional, no mediador relacional",
    expectation:
      "Debería tender a clear_direction con institutional_operator y no confundirse con diplomatic_social_connector.",
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
          "Me interesaban los ámbitos donde había normas, roles, intereses cruzados y necesidad de coordinación fina.",
        earlyFascinations:
          "Me atraía entender cómo se mueve una estructura y por dónde conviene empujar sin chocar al pedo.",
        meaningfulSchoolSubjects:
          "Historia, Formación ética, Lengua",
        repeatedWorkPatterns:
          "Siempre termino leyendo el marco, entendiendo con quién hay que hablar y ubicando qué paso falta para que algo avance dentro del sistema.",
        naturalSocialRoles:
          "Enlace institucional, negociador de bordes, operador de estructura.",
        lossesOrRenunciations:
          "Dejé en segundo plano otros intereses para sostener una trayectoria más ordenada y compatible con obligaciones actuales.",
        whatFeelsCompressedNow:
          "Uso mi capacidad para sostener equilibrios, pero no siempre en una dirección propia con más expansión.",
        additionalContext:
          "No es tanto mediar entre personas como moverme bien dentro del sistema.",
      },
      currentContext: {
        currentSituation:
          "Hoy rindo mejor cuando tengo que cuidar vínculos institucionales, leer marcos formales y alinear intereses entre áreas o sectores.",
        restrictions: [
          "No puedo hacer cambios bruscos",
          "Necesito sostener reputación y estabilidad",
        ],
        assets: [
          "Negociación institucional",
          "Lectura política",
          "Orden estructural",
          "Coordinación formal",
        ],
      },
    },
  },
  {
    id: "voc_t9_publico_con_postura",
    label: "Voc T9 – Voz pública con postura, no solo narración",
    expectation:
      "Debería tender a clear_direction con public_communicator y no irse a creative_storyteller.",
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
          "De chico me gustaba explicar, opinar y encontrar una forma clara de decir lo que pensaba sobre temas que me importaban.",
        earlyFascinations:
          "Me atraían la escena pública, los mensajes, la bajada y cómo una idea puede mover algo cuando está bien dicha.",
        meaningfulSchoolSubjects:
          "Lengua, Historia, Comunicación",
        repeatedWorkPatterns:
          "Siempre termino ordenando postura, escribiendo mensajes, fijando enfoque y diciendo las cosas de una forma que pega.",
        naturalSocialRoles:
          "Voz pública, constructor de postura, editor de agenda.",
        lossesOrRenunciations:
          "Eso hoy aparece en posteos, conversaciones o momentos sueltos, no como línea sostenida.",
        whatFeelsCompressedNow:
          "Tengo voz y postura, pero hoy esa parte está bastante tapada por una vida más funcional.",
        additionalContext:
          "No escribo solo por escribir; me interesa bajar una idea, fijar posición y mover algo.",
      },
      currentContext: {
        currentSituation:
          "Cuando un tema me importa, me sale ordenar la postura y decirla de una forma que pegue, pero hoy eso aparece de forma lateral.",
        restrictions: [
          "Necesito sostener ingresos",
          "No puedo hacer un salto desordenado",
        ],
        assets: [
          "Claridad discursiva",
          "Capacidad de fijar postura",
          "Escritura",
          "Sensibilidad pública",
        ],
      },
    },
  },
  {
    id: "voc_t10_storyteller_con_olfato",
    label: "Voc T10 – Narrador con olfato de oportunidad",
    expectation:
      "Debería tender a clear_direction con creative_storyteller y no drift a analytical_strategist por vocabulario estratégico.",
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
          "De chico me gustaba relatar, explicar, poner en palabras lo que pasaba y hacer que otros entendieran mejor una situación.",
        earlyFascinations:
          "Me atraían la escritura, los mensajes, el tono, la escena pública y la construcción de relato.",
        meaningfulSchoolSubjects:
          "Lengua, Historia, Literatura",
        repeatedWorkPatterns:
          "Siempre termino escribiendo, editando, explicando procesos y dándole forma verbal a ideas complejas.",
        naturalSocialRoles:
          "Narrador, editor, constructor de mensaje.",
        lossesOrRenunciations:
          "Usé mucho lenguaje funcional y estratégico, pero no siempre pude sostener mi veta más narrativa como eje principal.",
        whatFeelsCompressedNow:
          "Uso lenguaje funcional todos los días, pero no toda mi fuerza real de construir relato.",
        additionalContext:
          "Tiene vocabulario de posicionamiento y estrategia, pero el núcleo aparece cuando nombra, sintetiza y arma relato claro.",
      },
      currentContext: {
        currentSituation:
          "Pienso estrategia, posicionamiento y mensajes, pero mi fuerza real aparece cuando escribo, nombro y construyo relato con claridad.",
        restrictions: [
          "Necesito sostener facturación",
          "No puedo hacer un giro desordenado",
        ],
        assets: [
          "Escritura",
          "Síntesis",
          "Capacidad de comunicar",
          "Olfato de oportunidad",
        ],
      },
    },
  },
  {
    id: "voc_t11_conector_comprimido",
    label: "Voc T11 – Conector social fuertemente comprimido",
    expectation:
      "Debería tender a compressed_life con diplomatic_social_connector y no a clear_direction.",
    payload: {
      profile: {
        age: 47,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Desde chico me resultaba natural ordenar grupos, acercar posiciones y hacer que personas distintas pudieran convivir mejor.",
        earlyFascinations:
          "Me atraían los lugares donde había que leer actores, mediar tensiones y construir acuerdos entre intereses cruzados.",
        meaningfulSchoolSubjects:
          "Historia, Lengua, Formación cívica",
        repeatedWorkPatterns:
          "En cualquier trabajo termino articulando personas, negociando posiciones, conectando sectores y sosteniendo funcionamiento entre áreas.",
        naturalSocialRoles:
          "Articulador, mediador práctico, coordinador de actores.",
        lossesOrRenunciations:
          "Durante años postergué movimientos más alineados para sostener obligaciones, ingresos y funcionamiento inmediato.",
        whatFeelsCompressedNow:
          "La vida actual está claramente comprimida: uso esa capacidad solo de forma defensiva, reactiva y táctica, muy por debajo de lo que podría desplegar.",
        additionalContext:
          "El patrón es fuerte y consistente, pero hoy casi toda mi energía se va en sostener urgencias y evitar que todo se desordene.",
      },
      currentContext: {
        currentSituation:
          "Trabajo en algo estable pero muy reactivo; casi toda mi energía se va en sostener funcionamiento inmediato, bajar tensiones urgentes y evitar rupturas entre personas o áreas.",
        restrictions: [
          "No puedo resignar ingresos ahora",
          "No puedo mover demasiadas cosas a la vez",
          "Tengo responsabilidades que me dejan muy poco margen real",
        ],
        assets: [
          "Capacidad de coordinación",
          "Lectura de actores",
          "Negociación",
          "Sostén de funcionamiento",
        ],
      },
    },
  },
  {
    id: "voc_t12_conector_claro",
    label: "Voc T12 – Conector social claro con restricciones manejables",
    expectation:
      "Debería tender a clear_direction con diplomatic_social_connector y no leerse como compressed_life solo por tener restricciones normales.",
    payload: {
      profile: {
        age: 41,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Desde chico tendía a ordenar grupos, acercar posiciones y hacer que distintas partes pudieran avanzar sin romperse.",
        earlyFascinations:
          "Me interesaban la negociación, la lectura de actores y la posibilidad de conectar intereses distintos dentro de un mismo esquema.",
        meaningfulSchoolSubjects:
          "Historia, Lengua, Educación cívica",
        repeatedWorkPatterns:
          "Siempre termino coordinando actores, conectando áreas, negociando posiciones y ordenando cruces para destrabar situaciones.",
        naturalSocialRoles:
          "Articulador, coordinador humano, lector de intereses.",
        lossesOrRenunciations:
          "No siempre pude darle forma visible a esa capacidad, pero no siento que esté completamente anulada por el contexto.",
        whatFeelsCompressedNow:
          "Hay partes subutilizadas, pero todavía veo una línea posible y no solo compresión.",
        additionalContext:
          "El patrón es claramente social e institucional; hay restricciones reales, pero no una compresión extrema que impida leer dirección.",
      },
      currentContext: {
        currentSituation:
          "Estoy estable y donde mejor rindo es coordinando actores, conectando sectores, leyendo intereses y ordenando cruces para que el funcionamiento avance.",
        restrictions: [
          "Necesito continuidad de ingresos",
          "No puedo hacer un salto desordenado",
        ],
        assets: [
          "Red de contactos",
          "Negociación",
          "Lectura de actores",
          "Capacidad de articulación",
        ],
      },
    },
  },
];