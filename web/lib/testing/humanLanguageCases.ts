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
  {
    id: "voc_t13_criterio_comprimido_por_urgencia",
    label: "Voc T13 🧠 Criterio comprimido por urgencia",
    expectation:
      "Debería tender a compressed_life con analytical_strategist y no confundirse con technical_builder.",
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
          "De chico me la pasaba pensando por qué algunas cosas funcionaban mal y cómo se podrían ordenar mejor.",
        earlyFascinations:
          "Me interesaban los esquemas, los criterios, entender la lógica de fondo y ver qué no cerraba.",
        meaningfulSchoolSubjects:
          "Historia, Lengua, Filosofía",
        repeatedWorkPatterns:
          "Siempre termino viendo dónde está la falla de criterio, comparando caminos y ordenando decisiones antes de mover.",
        naturalSocialRoles:
          "Lector de estructura, persona de criterio, alguien que detecta rápido por dónde conviene.",
        lossesOrRenunciations:
          "Fui dejando en segundo plano esa parte más estratégica por urgencias de trabajo y necesidad de sostener lo inmediato.",
        whatFeelsCompressedNow:
          "Laburo bien, sí, pero siento que uso lo mejor mío para apagar lo urgente. Esa capacidad hoy sale en modo bombero, no en algo propio.",
        additionalContext:
          "No disfruto tanto meter mano y salir corriendo; me importa más entender la lógica y recién ahí decidir por dónde conviene.",
      },
      currentContext: {
        currentSituation:
          "Hoy funciono resolviendo urgencias y destrabando problemas de corto plazo, pero casi no puedo usar mi mejor criterio para pensar con profundidad.",
        restrictions: [
          "Necesito continuidad de ingresos",
          "Tengo poco margen mental para cambios bruscos",
        ],
        assets: [
          "Criterio",
          "Lectura estructural",
          "Comparación de escenarios",
          "Orden conceptual",
        ],
      },
    },
  },
  {
    id: "voc_t14_malestar_difuso_sin_familia_clara",
    label: "Voc T14 🌫️ Malestar difuso, no familia única",
    expectation:
      "No debería forzar una familia dominante solo por malestar general; debería leerse como caso abierto o insuficientemente definido.",
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
          "Nunca fui una persona totalmente desconectada, pero tampoco tuve una sola cosa clarísima desde siempre.",
        earlyFascinations:
          "Me interesaban cosas distintas según el momento, sin una línea totalmente estable.",
        meaningfulSchoolSubjects:
          "Lengua, Biología, Historia",
        repeatedWorkPatterns:
          "Cumplo, sostengo, me adapto, pero no siento que haya algo que me termine de encender de verdad.",
        naturalSocialRoles:
          "Persona cumplidora, funcional, adaptable.",
        lossesOrRenunciations:
          "Fui acomodándome bastante a lo que tocaba, sin hacer una búsqueda más propia.",
        whatFeelsCompressedNow:
          "No me veo haciendo esto mucho más. No estoy destruido, pero tampoco me da alegría decir que éste es mi lugar. Más que cansado estoy medio desenchufado.",
        additionalContext:
          "No siento una vocación muerta clarísima ni una dirección evidente; más bien una especie de apagamiento o pérdida de sentido.",
      },
      currentContext: {
        currentSituation:
          "Trabajo y funciono, pero no siento ni gran alineación ni una alternativa nítida.",
        restrictions: [
          "Necesito sostener estabilidad",
          "No quiero tomar decisiones apresuradas",
        ],
        assets: [
          "Capacidad de adaptación",
          "Sostén funcional",
          "Responsabilidad",
        ],
      },
    },
  },
  {
    id: "voc_t15_continuidad_grupal_con_restriccion_manejable",
    label: "Voc T15 👥 Continuidad grupal con restricción manejable",
    expectation:
      "Debería tender a clear_direction con community_builder y no derivar a diplomatic_social_connector.",
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
          "De chico armaba clubes, grupos y espacios de pertenencia; me gustaba que la gente se encontrara.",
        earlyFascinations:
          "Me interesaban las comunidades, los grupos, la circulación entre personas y el clima colectivo.",
        meaningfulSchoolSubjects:
          "Literatura, Comunicación, Historia social",
        repeatedWorkPatterns:
          "Siempre termino juntando gente, sosteniendo espacios y empujando para que los grupos no se enfríen.",
        naturalSocialRoles:
          "Coordinador de comunidad, anfitrión, lector del clima grupal.",
        lossesOrRenunciations:
          "Dejé en segundo plano parte de mi propia dirección por quedarme sosteniendo espacios colectivos.",
        whatFeelsCompressedNow:
          "Lo colectivo me tira, aunque hoy no tenga tanto resto como quisiera. No puedo largar todo, pero tampoco siento que esta parte esté muerta.",
        additionalContext:
          "Si no empujo yo, muchas veces el grupo se enfría. Ahí siento que hago una diferencia real.",
      },
      currentContext: {
        currentSituation:
          "Hoy donde más rindo es sosteniendo comunidad, coordinando grupos y dando continuidad a espacios que si no se caerían.",
        restrictions: [
          "Necesito continuidad de ingresos",
          "No puedo hacer un salto totalmente incierto",
        ],
        assets: [
          "Construcción de comunidad",
          "Lectura grupal",
          "Mensajes claros",
          "Sostén de grupos",
        ],
      },
    },
  },
  {
    id: "voc_t16_operador_institucional_no_mediador",
    label: "Voc T16 🏛️ Operador institucional, no mediador relacional",
    expectation:
      "Debería tender a clear_direction con institutional_operator y no irse a diplomatic_social_connector.",
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
          "Siempre me salía entender rápido quién decidía qué y cómo moverse sin chocar al pedo.",
        earlyFascinations:
          "Me interesaban las estructuras formales, las reglas, el poder y cómo se ordenaban las decisiones.",
        meaningfulSchoolSubjects:
          "Historia, Formación cívica, Lengua",
        repeatedWorkPatterns:
          "Suelo detectar con quién hablar, qué paso falta y por dónde conviene empujar dentro del sistema.",
        naturalSocialRoles:
          "Operador institucional, lector de estructura formal, articulador dentro de marcos establecidos.",
        lossesOrRenunciations:
          "Fui usando esta capacidad para sostener funcionamiento, más que como una dirección propia desplegada.",
        whatFeelsCompressedNow:
          "No estoy roto ni nada, pero tampoco siento que hoy esté jugando esta capacidad en su mejor nivel.",
        additionalContext:
          "No es tanto mediar emociones o hacer de puente humano íntimo; es moverme bien dentro de una estructura.",
      },
      currentContext: {
        currentSituation:
          "Hoy me sale bastante natural leer marcos, detectar autoridades, entender reglas y mover procesos sin chocar innecesariamente.",
        restrictions: [
          "Necesito estabilidad económica",
          "No puedo improvisar demasiado",
        ],
        assets: [
          "Lectura institucional",
          "Orden formal",
          "Criterio político",
          "Navegación de estructuras",
        ],
      },
    },
  },
  {
    id: "voc_t17_conector_comprimido_en_piloto_automatico",
    label: "Voc T17 🔧 Conector comprimido en piloto automático",
    expectation:
      "Debería tender a compressed_life con diplomatic_social_connector y no confundirse con institutional_operator.",
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
          "Desde chico me salía quedar en el medio, leer rápido a las partes y ayudar a que se entendieran.",
        earlyFascinations:
          "Me interesaban los cruces entre personas, grupos y posiciones distintas.",
        meaningfulSchoolSubjects:
          "Historia, Lengua, Comunicación",
        repeatedWorkPatterns:
          "Siempre termino destrabando gente, áreas o situaciones, hablando con uno y con otro para que algo avance.",
        naturalSocialRoles:
          "Puente entre partes, mediador, articulador de actores.",
        lossesOrRenunciations:
          "Mi capacidad de articulación quedó usada sobre todo para sostener quilombos ajenos y apagar tensiones.",
        whatFeelsCompressedNow:
          "Lo hago porque si no se empasta todo, no porque me esté desplegando yo. Ya sale bastante en piloto automático y me drena.",
        additionalContext:
          "No lo vivo como dirección limpia hoy; más bien como una capacidad real usada en modo defensivo.",
      },
      currentContext: {
        currentSituation:
          "Hoy sigo destrabando relaciones y sosteniendo funcionamiento entre partes, pero más para evitar que explote todo que por una dirección propia desplegada.",
        restrictions: [
          "Necesito seguir sosteniendo ingresos",
          "Tengo poco margen real para mover demasiadas cosas",
        ],
        assets: [
          "Lectura de actores",
          "Mediación",
          "Puente relacional",
          "Negociación",
        ],
      },
    },
  },
  {
    id: "voc_t18_forma_narrativa_sin_frente_publico",
    label: "Voc T18 ✍️ Forma narrativa sin frente público",
    expectation:
      "Debería tender a clear_direction con creative_storyteller y no irse a public_communicator.",
    payload: {
      profile: {
        age: 35,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Desde chico me gustaba escribir, corregir, cambiar tonos y encontrarle forma a lo que me pasaba o veía.",
        earlyFascinations:
          "Me interesaban la escritura, la narración, el estilo, el tono y la posibilidad de volver experiencia en texto.",
        meaningfulSchoolSubjects:
          "Lengua, Literatura, Historia",
        repeatedWorkPatterns:
          "Siempre termino escribiendo, editando, acomodando ideas y encontrando el ángulo para contarlas mejor.",
        naturalSocialRoles:
          "Narrador, editor espontáneo, persona que da forma verbal.",
        lossesOrRenunciations:
          "Fui dejando esa parte más narrativa en segundo plano por trabajos más funcionales y por necesidad de sostenerme.",
        whatFeelsCompressedNow:
          "Escribo bastante y le encuentro la vuelta a casi todo, pero no sé si quiero estar yo al frente. Me interesa más darle forma que ocupar la voz.",
        additionalContext:
          "Cuando algo me pega, me nace volverlo texto antes que bajarlo como postura pública.",
      },
      currentContext: {
        currentSituation:
          "Hoy uso lenguaje y síntesis, pero siento que mi parte más propia aparece cuando narro, edito y doy forma, no cuando tomo la palabra públicamente.",
        restrictions: [
          "Necesito seguir facturando",
          "No puedo hacer un giro totalmente desordenado",
        ],
        assets: [
          "Escritura",
          "Edición",
          "Síntesis",
          "Narrativa",
        ],
      },
    },
  },
  {
    id: "voc_t19_escucha_cruda_uno_a_uno",
    label: "Voc T19 🫂 Escucha cruda uno a uno, no sostén grupal",
    expectation:
      "Debería tender a clear_direction con empathic_guide y no derivar a community_builder ni a diplomatic_social_connector.",
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
          "Siempre me terminaban contando cosas a mí, incluso cuando no éramos tan amigos. Me salía escuchar sin apurar.",
        earlyFascinations:
          "Me interesaba entender qué le pasaba de verdad a alguien y ayudar a que pudiera ordenarlo un poco.",
        meaningfulSchoolSubjects:
          "Lengua, Filosofía, Psicología",
        repeatedWorkPatterns:
          "La gente me termina contando cosas y a mí me sale sentarme, escuchar, bajar un cambio y ayudar a ordenar lo que le pasa.",
        naturalSocialRoles:
          "Escucha profunda, acompañante, presencia humana calma.",
        lossesOrRenunciations:
          "Fui dejando eso medio al costado por trabajos más funcionales y menos humanos.",
        whatFeelsCompressedNow:
          "Esa parte sigue viva, pero hoy queda medio arrumbada por laburo, cansancio y cosas que resolver.",
        additionalContext:
          "No soy tan de empujar grupos ni de quedar en el medio entre áreas; donde más aparezco es en el uno a uno.",
      },
      currentContext: {
        currentSituation:
          "Trabajo y funciono, pero donde más rindo es cuando alguien está pasado de vueltas y puedo escucharlo sin invadir, ayudar a poner claridad y acomodar un poco el desorden interno.",
        restrictions: [
          "Necesito sostener estabilidad",
          "No puedo hacer cambios bruscos",
        ],
        assets: [
          "Escucha",
          "Calma interpersonal",
          "Capacidad de ordenar subjetivamente",
          "Presencia humana",
        ],
      },
    },
  },
  {
    id: "voc_t20_puente_en_modo_bombero",
    label: "Voc T20 🚨 Puente entre partes en modo bombero",
    expectation:
      "Debería tender a compressed_life con diplomatic_social_connector y no confundirse con institutional_operator.",
    payload: {
      profile: {
        age: 43,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Desde chico me salía quedar en el medio, entender rápido a cada uno y hacer que se entendieran mejor.",
        earlyFascinations:
          "Me atraían los cruces entre personas, intereses y posiciones distintas.",
        meaningfulSchoolSubjects:
          "Historia, Lengua, Comunicación",
        repeatedWorkPatterns:
          "Siempre termino hablando con uno, con otro, acomodando posiciones, destrabando vínculos y haciendo de puente para que algo avance.",
        naturalSocialRoles:
          "Articulador, mediador, puente entre partes.",
        lossesOrRenunciations:
          "Mi capacidad de articulación quedó bastante tomada por sostener quilombos ajenos y urgencias permanentes.",
        whatFeelsCompressedNow:
          "Hago de puente, sí, pero más para que no explote nada que por otra cosa. Ya sale bastante en piloto automático y me drena.",
        additionalContext:
          "No es solo moverse bien dentro de una estructura; el núcleo aparece leyendo a las partes y sosteniendo el ida y vuelta entre personas o sectores.",
      },
      currentContext: {
        currentSituation:
          "Estoy en algo estable, pero casi toda mi energía se va en apagar roces, bajar tensiones, evitar choques y hacer que distintas partes no se empasten.",
        restrictions: [
          "No puedo resignar ingresos",
          "Tengo poco margen real para mover demasiadas cosas",
          "Vengo bastante tomado por obligaciones",
        ],
        assets: [
          "Lectura de actores",
          "Negociación",
          "Mediación",
          "Puente relacional",
        ],
      },
    },
  },
  {
    id: "voc_t21_comunidad_que_no_se_caiga",
    label: "Voc T21 👥 Comunidad que no se caiga",
    expectation:
      "Debería tender a clear_direction con community_builder y no derivar a diplomatic_social_connector.",
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
          "De chico armaba grupos, proponía planes y me gustaba que la gente se sintiera parte de algo.",
        earlyFascinations:
          "Me interesaban los espacios colectivos, la pertenencia, el clima grupal y cómo sostener interacción.",
        meaningfulSchoolSubjects:
          "Comunicación, Literatura, Historia social",
        repeatedWorkPatterns:
          "Siempre termino juntando gente, sosteniendo espacios, leyendo el clima y empujando para que los grupos no se enfríen.",
        naturalSocialRoles:
          "Anfitrión, sostén grupal, lector del clima colectivo.",
        lossesOrRenunciations:
          "Muchas veces me quedé sosteniendo comunidad y dejé en segundo plano mi propia dirección.",
        whatFeelsCompressedNow:
          "No estoy libre, pero tampoco tomado del todo. Lo colectivo sigue vivo y usable, aunque hoy tenga que moverme con cuidado.",
        additionalContext:
          "Si no empujo yo, varias veces el grupo se cae o queda todo en palabras. Ahí siento que hago diferencia real.",
      },
      currentContext: {
        currentSituation:
          "Hoy donde más rindo es sosteniendo comunidad, coordinando grupos y dando continuidad a espacios que sin alguien atrás se enfrían.",
        restrictions: [
          "Necesito continuidad de ingresos",
          "No puedo hacer un salto heroico ni desordenado",
        ],
        assets: [
          "Lectura grupal",
          "Construcción de pertenencia",
          "Mensajes claros",
          "Sostén de comunidad",
        ],
      },
    },
  },
  {
    id: "voc_t22_postura_publica_sin_tibieza",
    label: "Voc T22 📣 Postura pública sin tibieza",
    expectation:
      "Debería tender a clear_direction con public_communicator y no irse a creative_storyteller.",
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
          "De chico me gustaba opinar, explicar y encontrar una forma clara de decir lo que veía.",
        earlyFascinations:
          "Me atraían la escena pública, los mensajes, la agenda y la posibilidad de fijar una postura que mueva algo.",
        meaningfulSchoolSubjects:
          "Lengua, Historia, Comunicación",
        repeatedWorkPatterns:
          "Cuando un tema me importa, termino ordenándolo, bajando postura y diciendo las cosas de una forma que pegue.",
        naturalSocialRoles:
          "Voz pública, ordenador de agenda, constructor de postura.",
        lossesOrRenunciations:
          "Eso muchas veces quedó lateral, en posteos, conversaciones o momentos sueltos, más que como línea sostenida.",
        whatFeelsCompressedNow:
          "No escribo solo por escribir; necesito fijar una posición. El tema es que hoy eso aparece de a ratos y no como eje.",
        additionalContext:
          "La escritura está al servicio de una postura pública; no es solamente gusto por narrar o por dar forma.",
      },
      currentContext: {
        currentSituation:
          "Estoy funcional, pero cuando un tema me pega me sale ordenar el asunto y decirlo claro. No me sale quedar tibio cuando veo qué está en juego.",
        restrictions: [
          "Necesito sostener ingresos",
          "No puedo improvisar una transición pública total",
        ],
        assets: [
          "Claridad discursiva",
          "Capacidad de fijar postura",
          "Lectura pública",
          "Escritura",
        ],
      },
    },
  },
  {
    id: "voc_t23_forma_narrativa_sin_poner_la_cara",
    label: "Voc T23 ✍️ Forma narrativa sin poner la cara",
    expectation:
      "Debería tender a clear_direction con creative_storyteller y no derivar a public_communicator.",
    payload: {
      profile: {
        age: 34,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "Desde chico me la pasaba escribiendo, corrigiendo, cambiando palabras y buscando el tono justo.",
        earlyFascinations:
          "Me interesaban la escritura, la narración, el estilo y la posibilidad de volver algo difuso en texto claro.",
        meaningfulSchoolSubjects:
          "Lengua, Literatura, Historia",
        repeatedWorkPatterns:
          "Siempre termino editando, acomodando ideas, encontrando el ángulo y dándole forma verbal a lo que otros todavía tienen suelto.",
        naturalSocialRoles:
          "Narrador, editor espontáneo, armador de tono.",
        lossesOrRenunciations:
          "Esa parte más narrativa quedó bastante mezclada con trabajos más funcionales y menos propios.",
        whatFeelsCompressedNow:
          "Escribo y le encuentro la vuelta a casi todo, pero no sé si quiero estar yo al frente. Me interesa más darle forma que ocupar la voz.",
        additionalContext:
          "Cuando algo me pega, me nace volverlo texto antes que bajarlo como postura pública o salir a ocupar escena.",
      },
      currentContext: {
        currentSituation:
          "Hoy uso lenguaje todos los días, pero siento que mi parte más propia aparece cuando edito, narro y doy forma, no cuando tengo que fijar posición pública.",
        restrictions: [
          "Necesito seguir facturando",
          "No puedo hacer un giro totalmente desordenado",
        ],
        assets: [
          "Escritura",
          "Edición",
          "Síntesis",
          "Narrativa",
        ],
      },
    },
  },
  {
    id: "voc_t24_criterio_antes_que_mano",
    label: "Voc T24 🧠 Criterio antes que mano",
    expectation:
      "Debería tender a clear_direction con analytical_strategist y no caer en technical_builder.",
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
          "De chico me entretenía entendiendo por qué algo estaba mal armado antes de salir a tocarlo.",
        earlyFascinations:
          "Me interesaban la lógica, la estructura, los escenarios y el criterio para decidir.",
        meaningfulSchoolSubjects:
          "Historia, Filosofía, Economía",
        repeatedWorkPatterns:
          "Siempre termino comparando caminos, viendo costos y consecuencias, leyendo estructura y marcando por dónde conviene mover.",
        naturalSocialRoles:
          "Persona de criterio, lector de estructura, comparador de escenarios.",
        lossesOrRenunciations:
          "Muchas veces esa parte quedó usada solo para responder urgencias y no como centro del trabajo.",
        whatFeelsCompressedNow:
          "No está muerta, pero se usa menos de lo que debería y muchas veces queda tapada por lo inmediato.",
        additionalContext:
          "No disfruto tanto meter mano y salir corriendo; me importa más entender la lógica y recién ahí decidir por dónde conviene.",
      },
      currentContext: {
        currentSituation:
          "Donde mejor rindo es cuando puedo leer estructura, comparar escenarios y ordenar decisiones con criterio, no tanto cuando todo se reduce a apagar fallas una por una.",
        restrictions: [
          "Necesito sostener ingresos",
          "No puedo entrar en una transición larga sin resultados",
        ],
        assets: [
          "Pensamiento estratégico",
          "Lectura estructural",
          "Comparación de escenarios",
          "Criterio",
        ],
      },
    },
  },
  {
    id: "voc_t25_meto_mano_hasta_que_ande",
    label: "Voc T25 🛠️ Meto mano hasta que ande",
    expectation:
      "Debería tender a clear_direction con technical_builder y no derivar a analytical_strategist.",
    payload: {
      profile: {
        age: 40,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "secondary",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba desarmar, arreglar, ordenar y dejar andando lo que estaba trabado.",
        earlyFascinations:
          "Me atraían los procesos concretos, los mecanismos y la mejora práctica de cosas que no funcionaban.",
        meaningfulSchoolSubjects:
          "Taller, Matemática, Física aplicada",
        repeatedWorkPatterns:
          "Cuando algo falla, meto mano hasta dejarlo andando. Siempre termino resolviendo trabas, ajustando pasos y haciendo que salga.",
        naturalSocialRoles:
          "Resolvedor, operador, mejorador práctico.",
        lossesOrRenunciations:
          "Muchas veces quedé pegado a apagar problemas en vez de poder diseñar una operación más limpia y estable.",
        whatFeelsCompressedNow:
          "Estoy usando mucho mi capacidad en modo parche, pero el centro sigue estando en resolver, ajustar y hacer funcionar.",
        additionalContext:
          "Tengo criterio, sí, pero puesto al servicio de ejecución concreta, mejora operativa y resolución, no de análisis abstracto como fin en sí mismo.",
      },
      currentContext: {
        currentSituation:
          "Hoy donde más rindo es cuando hay que sacar un problema, ordenar prioridades y dejar funcionando algo que venía trabado.",
        restrictions: [
          "No puedo dejar mi estabilidad actual",
          "Necesito pasos concretos",
        ],
        assets: [
          "Resolución práctica",
          "Experiencia operativa",
          "Orden de ejecución",
          "Mejora de procesos",
        ],
      },
    },
  },
  {
    id: "voc_t26_superficie_enganosa_sin_objeto_claro",
    label: "Voc T26 🌫️ Superficie engañosa sin objeto claro",
    expectation:
      "No debería forzar una familia dominante; debería tender a insufficient_evidence o a lectura abierta.",
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
          "Siempre fui de adaptarme bastante y de interesarme por cosas distintas según el momento.",
        earlyFascinations:
          "Hubo etapas con escritura, otras con gente, otras con ideas, pero nada del todo sostenido.",
        meaningfulSchoolSubjects:
          "Lengua, Historia, Biología",
        repeatedWorkPatterns:
          "Ayudo a ordenar, escribo bastante, quedo en el medio y trato de que las cosas salgan.",
        naturalSocialRoles:
          "Persona funcional, adaptable, bastante cumplidora.",
        lossesOrRenunciations:
          "Me fui acomodando a lo que tocaba sin terminar de ver una línea propia clara.",
        whatFeelsCompressedNow:
          "No estoy destruido, pero tampoco siento que esté donde debería. Hay algo apagado, aunque no sé bien qué forma tendría si saliera.",
        additionalContext:
          "La superficie mezcla ayuda, escritura, orden y adaptación, pero sin objeto claro ni señal dominante suficientemente defendible.",
      },
      currentContext: {
        currentSituation:
          "Trabajo, cumplo y me adapto, pero no termino de ver si lo mío pasa por gente, por ideas, por escritura o por otra cosa.",
        restrictions: [
          "Necesito estabilidad",
          "No quiero tomar una decisión apurada",
        ],
        assets: [
          "Adaptación",
          "Responsabilidad",
          "Capacidad funcional",
        ],
      },
    },
  },
  
  {
    id: "voc_t27_escucha_que_baja_un_cambio",
    label: "Voc T27 🫂 Escucha que baja un cambio",
    expectation:
      "Debería tender a clear_direction con empathic_guide y no derivar a community_builder ni a diplomatic_social_connector.",
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
          "De pibe era bastante al que le caían con cosas pesadas. No porque hablara mucho, sino porque me quedaba, escuchaba y no metía presión.",
        earlyFascinations:
          "Siempre me tiró entender qué le pasaba de verdad a alguien cuando estaba pasado de vueltas o medio perdido.",
        meaningfulSchoolSubjects:
          "Lengua, Psicología, Filosofía",
        repeatedWorkPatterns:
          "Me termina pasando seguido que alguien se sienta conmigo, baja un cambio y en un rato ya puede ver un poco más claro qué le pasa.",
        naturalSocialRoles:
          "Escucha, acompañante, presencia tranquila, alguien que ordena sin invadir.",
        lossesOrRenunciations:
          "Fui dejando esa parte bastante al costado por laburo, cansancio y porque no siempre supe dónde ponerla sin vender humo.",
        whatFeelsCompressedNow:
          "Eso sigue estando, pero me queda medio arrumbado. Estoy más en modo cumplir que en modo acompañar bien.",
        additionalContext:
          "No me sale tanto sostener grupos o hacer de puente entre sectores. Lo mío aparece más uno a uno, cuando alguien viene roto o confundido.",
      },
      currentContext: {
        currentSituation:
          "Trabajo y funciono, pero donde más rindo es cuando alguien está desordenado por dentro y yo puedo escucharlo sin invadir, bajar ansiedad y ayudar a que acomode un poco la cabeza.",
        restrictions: [
          "Necesito sostener estabilidad",
          "No puedo hacer cambios bruscos",
        ],
        assets: [
          "Escucha",
          "Calma interpersonal",
          "Capacidad de ordenar subjetivamente",
          "Presencia humana",
        ],
      },
    },
  },
  {
    id: "voc_t28_puente_quemado_de_sostener_tensiones",
    label: "Voc T28 🚒 Puente quemado de sostener tensiones",
    expectation:
      "Debería tender a compressed_life con diplomatic_social_connector y no confundirse con institutional_operator.",
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
          "Desde chico me salía quedar en el medio, leer rápido por dónde venía cada uno y evitar que todo terminara mal.",
        earlyFascinations:
          "Me interesaban los cruces entre personas, los acuerdos difíciles y ese punto fino donde algo se destraba o se rompe.",
        meaningfulSchoolSubjects:
          "Historia, Lengua, Formación cívica",
        repeatedWorkPatterns:
          "Siempre termino hablando con uno, con otro, acomodando posiciones, suavizando roces y haciendo de puente para que algo avance.",
        naturalSocialRoles:
          "Puente, mediador práctico, articulador entre partes.",
        lossesOrRenunciations:
          "Hace años que esa capacidad está más al servicio de sostener quilombos ajenos que de una dirección mía más limpia.",
        whatFeelsCompressedNow:
          "Estoy haciendo de puente, sí, pero más para que no explote nada que por otra cosa. Ya sale bastante en piloto automático y me drena.",
        additionalContext:
          "No es tanto moverme dentro de una estructura formal; es leer a las partes, destrabar vínculos y evitar choques cuando todo se empieza a espesar.",
      },
      currentContext: {
        currentSituation:
          "Estoy en algo estable, pero casi toda mi energía se va en apagar roces, bajar tensiones, evitar choques y hacer que distintas partes no se empasten.",
        restrictions: [
          "No puedo resignar ingresos",
          "Tengo poco margen real para mover demasiadas cosas",
          "Vengo bastante tomado por obligaciones",
        ],
        assets: [
          "Lectura de actores",
          "Negociación",
          "Mediación",
          "Puente relacional",
        ],
      },
    },
  },
  {
    id: "voc_t29_comunidad_que_si_no_la_empujas_se_cae",
    label: "Voc T29 👥 Comunidad que si no la empujás se cae",
    expectation:
      "Debería tender a clear_direction con community_builder y no derivar a diplomatic_social_connector.",
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
          "De chico armaba grupos, inventaba espacios y me gustaba que la gente se encontrara y no quedara cada uno por su lado.",
        earlyFascinations:
          "Siempre me tiró más el clima colectivo, la pertenencia y que las cosas no se enfríen que la negociación fina entre actores.",
        meaningfulSchoolSubjects:
          "Literatura, Comunicación, Historia social",
        repeatedWorkPatterns:
          "Se me repite mucho eso de juntar gente, sostener espacios, leer el clima y empujar un poco para que los grupos no se desarmen.",
        naturalSocialRoles:
          "Anfitrión, sostén de comunidad, lector grupal.",
        lossesOrRenunciations:
          "Terminé poniendo mucha energía en sostener lo colectivo y menos en construir una vía más visible para mí.",
        whatFeelsCompressedNow:
          "No estoy libre ni sobrado, pero tampoco siento que esta parte esté muerta. Sigue viva y usable, aunque con menos resto del que me gustaría.",
        additionalContext:
          "Lo mío no pasa tanto por mediar intereses entre partes pesadas. Pasa más por sostener comunidad, continuidad y circulación entre personas.",
      },
      currentContext: {
        currentSituation:
          "Hoy donde más rindo es sosteniendo comunidad, coordinando grupos y dando continuidad a espacios que si no alguien atrás se enfrían.",
        restrictions: [
          "Necesito continuidad de ingresos",
          "No puedo hacer un salto heroico ni desordenado",
        ],
        assets: [
          "Lectura grupal",
          "Construcción de pertenencia",
          "Mensajes claros",
          "Sostén de comunidad",
        ],
      },
    },
  },
  {
    id: "voc_t30_postura_que_sale_sin_pedir_permiso",
    label: "Voc T30 📣 Postura que sale sin pedir permiso",
    expectation:
      "Debería tender a clear_direction con public_communicator y no irse a creative_storyteller.",
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
          "De chico me gustaba explicar, opinar y decir las cosas de una manera que quedara clara y pegara.",
        earlyFascinations:
          "Siempre me atrajo más la postura, el enfoque, la agenda y cómo se baja un tema al lenguaje de la gente que la escritura por sí sola.",
        meaningfulSchoolSubjects:
          "Lengua, Historia, Comunicación",
        repeatedWorkPatterns:
          "Cuando un tema me importa termino ordenándolo, bajando postura y diciendo las cosas de una forma que pega.",
        naturalSocialRoles:
          "Voz pública, alguien que fija posición, ordenador de agenda.",
        lossesOrRenunciations:
          "Eso hoy aparece de a ratos, en posteos, charlas o momentos sueltos, pero no como línea sostenida.",
        whatFeelsCompressedNow:
          "No escribo solo por escribir; necesito fijar una posición. El tema es que hoy eso aparece lateral, no como eje.",
        additionalContext:
          "La escritura está, pero no como fin en sí mismo. Lo central es decir algo con postura y mover lectura pública.",
      },
      currentContext: {
        currentSituation:
          "Estoy funcional, pero cuando un tema me pega me sale ordenar el asunto y decirlo claro. No me sale quedar tibio cuando veo qué está en juego.",
        restrictions: [
          "Necesito sostener ingresos",
          "No puedo improvisar una transición pública total",
        ],
        assets: [
          "Claridad discursiva",
          "Capacidad de fijar postura",
          "Lectura pública",
          "Escritura",
        ],
      },
    },
  },
  {
    id: "voc_t31_forma_narrativa_sin_poner_el_cuerpo",
    label: "Voc T31 ✍️ Forma narrativa sin poner el cuerpo",
    expectation:
      "Debería tender a clear_direction con creative_storyteller y no derivar a public_communicator.",
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
          "Desde chico escribía, corregía, cambiaba tonos y le encontraba forma verbal a cosas que otros sentían pero no sabían decir.",
        earlyFascinations:
          "Siempre me tiraron la escritura, el tono, el ángulo y eso de volver experiencia en relato o texto con forma.",
        meaningfulSchoolSubjects:
          "Lengua, Literatura, Historia",
        repeatedWorkPatterns:
          "Siempre termino editando, acomodando ideas, encontrando el ángulo y dándole forma verbal a lo que otros todavía tienen suelto.",
        naturalSocialRoles:
          "Narrador, editor espontáneo, alguien que da forma.",
        lossesOrRenunciations:
          "Fui usando mucho lenguaje en modo funcional y comercial, pero no tanto mi veta más narrativa como eje central.",
        whatFeelsCompressedNow:
          "Escribo y le encuentro la vuelta a casi todo, pero no sé si quiero estar yo al frente. Me interesa más darle forma que ocupar la voz.",
        additionalContext:
          "No me aparece tan fuerte la necesidad de fijar postura pública. Me sale más narrar, editar, ordenar tono y construir forma.",
      },
      currentContext: {
        currentSituation:
          "Hoy uso lenguaje todos los días, pero siento que mi parte más propia aparece cuando edito, narro y doy forma, no cuando tengo que fijar posición pública.",
        restrictions: [
          "Necesito seguir facturando",
          "No puedo hacer un giro totalmente desordenado",
        ],
        assets: [
          "Escritura",
          "Edición",
          "Síntesis",
          "Narrativa",
        ],
      },
    },
  },
  {
    id: "voc_t32_criterio_tapado_por_el_dia_a_dia",
    label: "Voc T32 🧠 Criterio tapado por el día a día",
    expectation:
      "Debería tender a compressed_life con analytical_strategist y no confundirse con technical_builder.",
    payload: {
      profile: {
        age: 43,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories:
          "De chico me colgaba pensando por qué algunas cosas estaban mal armadas y qué decisión tenía más lógica antes de mover nada.",
        earlyFascinations:
          "Me interesaban los esquemas, la estrategia, ver por dónde convenía y entender la lógica de fondo.",
        meaningfulSchoolSubjects:
          "Historia, Filosofía, Economía",
        repeatedWorkPatterns:
          "Se me da bastante eso de comparar escenarios, ver dónde está la falla de criterio y ordenar decisiones antes de actuar.",
        naturalSocialRoles:
          "Lector de estructura, comparador, persona de criterio.",
        lossesOrRenunciations:
          "Fui usando esa capacidad cada vez más para salir del paso y menos para pensar con aire algo más propio.",
        whatFeelsCompressedNow:
          "Puedo resolver, sí, pero me drena tener que pensar todo en chiquito y a los ponchazos. Siento que uso lo mejor mío para apagar lo urgente.",
        additionalContext:
          "No disfruto tanto meter mano y salir corriendo. Me importa más entender la lógica, comparar caminos y recién ahí definir por dónde conviene.",
      },
      currentContext: {
        currentSituation:
          "Hoy funciono destrabando temas cortos y resolviendo urgencias, pero casi no puedo usar mi mejor criterio para pensar con profundidad.",
        restrictions: [
          "Necesito continuidad de ingresos",
          "Tengo poco margen mental para cambios bruscos",
        ],
        assets: [
          "Criterio",
          "Lectura estructural",
          "Comparación de escenarios",
          "Orden conceptual",
        ],
      },
    },
  },
  {
    id: "voc_t33_moverse_dentro_del_sistema_sin_chocar",
    label: "Voc T33 🏛️ Moverse dentro del sistema sin chocar",
    expectation:
      "Debería tender a clear_direction con institutional_operator y no irse a diplomatic_social_connector.",
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
          "Siempre me salía entender rápido quién decidía qué, por dónde convenía entrar y qué cosas no había que hacer al pedo.",
        earlyFascinations:
          "Me interesaban las reglas, la estructura, el poder formal y cómo moverse con criterio dentro de eso.",
        meaningfulSchoolSubjects:
          "Historia, Formación cívica, Lengua",
        repeatedWorkPatterns:
          "Suelo detectar con quién hablar, qué paso falta y por dónde conviene empujar dentro del sistema para que algo se mueva.",
        naturalSocialRoles:
          "Operador institucional, lector de estructura formal, articulador dentro de marcos establecidos.",
        lossesOrRenunciations:
          "Terminé usando bastante esta capacidad para sostener funcionamiento, más que para desplegar una dirección propia más visible.",
        whatFeelsCompressedNow:
          "No estoy roto ni pasado por arriba, pero tampoco siento que hoy esté jugando esta capacidad en un nivel realmente bueno.",
        additionalContext:
          "No es tanto mediar emociones o hacer puente humano fino. Es leer el marco, detectar autoridades y moverse bien dentro de una estructura.",
      },
      currentContext: {
        currentSituation:
          "Hoy me sale natural leer marcos, detectar autoridades, entender reglas y mover procesos sin chocar innecesariamente.",
        restrictions: [
          "Necesito estabilidad económica",
          "No puedo improvisar demasiado",
        ],
        assets: [
          "Lectura institucional",
          "Orden formal",
          "Criterio político",
          "Navegación de estructuras",
        ],
      },
    },
  },
  {
    id: "voc_t34_operacion_que_tiene_que_salir",
    label: "Voc T34 ⚙️ Operación que tiene que salir",
    expectation:
      "Debería tender a clear_direction con technical_builder y no derivar a analytical_strategist.",
    payload: {
      profile: {
        age: 40,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "secondary",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba meter mano, ordenar pasos y hacer que algo que venía mal armado volviera a andar.",
        earlyFascinations:
          "Siempre me tiró más el funcionamiento concreto, los procesos, los mecanismos y cómo mejorar algo que estaba trabado.",
        meaningfulSchoolSubjects:
          "Taller, Matemática, Física aplicada",
        repeatedWorkPatterns:
          "Termino resolviendo fallas, ajustando procesos, ordenando prioridades y haciendo que la operación salga sin tantas vueltas.",
        naturalSocialRoles:
          "Resolvedor, operador, organizador práctico.",
        lossesOrRenunciations:
          "Quedé bastante absorbido por crisis y urgencias y no tanto por construir algo operativo más ordenado y estable.",
        whatFeelsCompressedNow:
          "Estoy más en modo apagar quilombos que en modo diseñar una operación que quede bien parada, pero la veta sigue siendo práctica y de ejecución.",
        additionalContext:
          "Puedo analizar, obvio, pero cuando todos siguen hablando yo ya estoy viendo el paso, el orden y cómo hacerlo salir.",
      },
      currentContext: {
        currentSituation:
          "Hoy rindo mejor cuando tengo que resolver fallas, acomodar procesos, ordenar prioridad y hacer que algo salga sin trabarse.",
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
    id: "voc_t35_apagado_sin_objeto_claro",
    label: "Voc T35 🌫️ Apagado sin objeto claro",
    expectation:
      "No debería forzar una familia dominante; debería tender a insufficient_evidence o lectura abierta.",
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
          "Nunca fui alguien totalmente vacío, pero tampoco tuve una sola cosa clarísima que me llevara puesto desde chico.",
        earlyFascinations:
          "Me interesaban cosas distintas según la etapa. Algunas por gente, otras por ideas, otras por escribir o por ordenar.",
        meaningfulSchoolSubjects:
          "Lengua, Historia, Biología",
        repeatedWorkPatterns:
          "Cumplo, me adapto, doy una mano y generalmente hago que las cosas salgan, pero no termino de ver bien por dónde pasa lo más mío.",
        naturalSocialRoles:
          "Persona funcional, adaptable, responsable.",
        lossesOrRenunciations:
          "Más que renunciar a algo clarísimo, me fui acomodando a lo que tocaba y pateando una búsqueda más propia.",
        whatFeelsCompressedNow:
          "No estoy destruido, pero tampoco siento que esté donde debería. Hay algo apagado, aunque no sé bien qué forma tendría si saliera.",
        additionalContext:
          "A veces parezco más de gente, a veces más de ideas, a veces más de lenguaje. No veo todavía un objeto dominante limpio.",
      },
      currentContext: {
        currentSituation:
          "Trabajo, cumplo y me adapto, pero no termino de ver si lo mío pasa por gente, por ideas, por escritura o por otra cosa.",
        restrictions: [
          "Necesito estabilidad",
          "No quiero tomar una decisión apurada",
        ],
        assets: [
          "Adaptación",
          "Responsabilidad",
          "Capacidad funcional",
        ],
      },
    },
  },
  {
    id: "voc_t36_postura_publica_sin_modo_docente",
    label: "Voc T36 🎙️ Postura pública sin modo docente",
    expectation:
      "Debería tender a clear_direction con public_communicator y no derivar a educator_interpreter ni a creative_storyteller.",
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
          "De chico me gustaba opinar, discutir ideas y encontrar una forma clara de decir algo cuando sentía que importaba.",
        earlyFascinations:
          "Me tiraban la escena pública, la voz, la postura y cómo un mensaje bien bajado puede mover lectura en otros.",
        meaningfulSchoolSubjects:
          "Lengua, Historia, Comunicación",
        repeatedWorkPatterns:
          "Cuando un tema me importa termino ordenando el asunto, encontrando la bajada y diciendo las cosas de una forma bastante frontal.",
        naturalSocialRoles:
          "Voz, fijador de postura, alguien que ordena agenda.",
        lossesOrRenunciations:
          "Eso no siempre pudo ser eje; muchas veces quedó escondido detrás de laburo más funcional o más de supervivencia.",
        whatFeelsCompressedNow:
          "No estoy mudo ni apagado del todo, pero hoy esa parte aparece de a ratos y no como frente principal.",
        additionalContext:
          "No me sale tanto explicar para enseñar. Me sale más fijar posición, bajar una idea y dejar claro qué se está jugando.",
      },
      currentContext: {
        currentSituation:
          "Estoy funcional, pero cuando un tema me pega me sale ordenar el asunto y decirlo claro. No me sale quedar tibio cuando veo qué está en juego.",
        restrictions: [
          "Necesito sostener ingresos",
          "No puedo improvisar una transición pública total",
        ],
        assets: [
          "Claridad discursiva",
          "Capacidad de fijar postura",
          "Lectura pública",
          "Escritura",
        ],
      },
    },
  },
  {
    id: "voc_t37_relato_con_olfato_pero_sin_frente_publico",
    label: "Voc T37 📝 Relato con olfato, sin frente público",
    expectation:
      "Debería tender a clear_direction con creative_storyteller y no irse a public_communicator.",
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
          "Desde chico escribía bastante, le daba vueltas a las palabras y me gustaba encontrar la forma justa para contar algo.",
        earlyFascinations:
          "Siempre me atrajeron la escritura, el tono, el mensaje y cómo armar relato con lenguaje claro.",
        meaningfulSchoolSubjects:
          "Lengua, Literatura, Historia",
        repeatedWorkPatterns:
          "Termino escribiendo, editando, bajando ideas, encontrando el ángulo y dándole forma verbal a cosas que todavía están medio crudas.",
        naturalSocialRoles:
          "Narrador, editor, constructor de mensaje.",
        lossesOrRenunciations:
          "Usé mucho lenguaje en clave funcional, comercial o práctica, y menos en clave de relato como eje más propio.",
        whatFeelsCompressedNow:
          "Escribo todo el tiempo, pero muchas veces para resolver o salir del paso. Mi parte más viva no aparece tanto cuando fijo postura, sino cuando encuentro forma.",
        additionalContext:
          "Tengo olfato para mensajes y oportunidad, sí, pero no necesariamente ganas de ponerme yo al frente como voz pública.",
      },
      currentContext: {
        currentSituation:
          "Hoy uso lenguaje a diario, pero mi parte más propia aparece cuando edito, nombro y construyo forma, no tanto cuando tengo que ocupar la voz pública.",
        restrictions: [
          "Necesito sostener facturación",
          "No puedo hacer un giro desordenado",
        ],
        assets: [
          "Escritura",
          "Síntesis",
          "Narrativa",
          "Olfato de mensaje",
        ],
      },
    },
  },
  {
    id: "voc_t38_curiosidad_estrategica_sin_ruptura",
    label: "Voc T38 🧭 Curiosidad estratégica sin ruptura",
    expectation:
      "Debería tender a clear_direction con analytical_strategist y no derivar a system_designer ni a technical_builder.",
    payload: {
      profile: {
        age: 37,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "universitario completo",
      },
      currentContext: {
        currentSituation:
          "Estoy bien, no estoy roto ni desesperado por irme. Pero cada vez que aparece un problema complejo, comparo escenarios, ordeno variables y veo bastante rápido por dónde conviene entrar.",
        restrictions: [
          "No quiero romper una estructura laboral que hoy me da estabilidad",
          "No necesito una salida urgente",
        ],
        assets: [
          "Criterio para comparar opciones",
          "Capacidad de ordenar complejidad",
          "Lectura estratégica",
        ],
        transitionGoal:
          "Quiero entender si mi dirección más propia pasa por pensar estrategia y arquitectura de decisiones, aunque hoy no esté viviendo una crisis.",
      },
      narrative: {
        childhoodMemories:
          "De chico me entretenía armando mapas, planes, comparaciones y buscando la mejor forma de resolver cosas.",
        earlyFascinations:
          "Siempre me atrajeron los sistemas, la lógica detrás de los problemas y cómo cambian los resultados según la decisión que se tome.",
        meaningfulSchoolSubjects:
          "Historia, economía, lengua y materias donde hubiera que comparar escenarios o entender procesos.",
        repeatedWorkPatterns:
          "Termino ordenando problemas, viendo relaciones entre partes y detectando rápido qué camino parece más sensato.",
        naturalSocialRoles:
          "Suelo ser el que baja complejidad, pone criterio y ayuda a decidir sin dramatizar.",
        lossesOrRenunciations:
          "No siento una pérdida grande, más bien una subutilización de una parte mía que aparece seguido pero no está del todo en el centro.",
        whatFeelsCompressedNow:
          "No me siento aplastado. Más bien siento que cumplo bien, pero podría estar usando más mi capacidad de leer estructura y pensar mejor los movimientos.",
        additionalContext:
          "No vengo desde el dolor. Vengo desde la curiosidad de ver si mi dirección más propia está más cerca de la estrategia que de la ejecución pura.",
      },
    },
  },
  {
    id: "voc_t39_comunidad_viva_sin_crisis",
    label: "Voc T39 👥 Comunidad viva sin crisis",
    expectation:
      "Debería tender a clear_direction con community_builder y no derivar a diplomatic_social_connector ni a empathic_guide.",
    payload: {
      profile: {
        age: 35,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "universitario completo",
      },
      currentContext: {
        currentSituation:
          "No estoy en crisis. Estoy bastante bien. Pero donde más noto que rindo distinto es cuando hay que sostener un espacio grupal, darle continuidad y hacer que la gente no se desconecte.",
        restrictions: [
          "No quiero hacer un salto brusco",
          "Necesito mantener continuidad económica",
        ],
        assets: [
          "Lectura grupal",
          "Construcción de pertenencia",
          "Capacidad de sostén",
        ],
        transitionGoal:
          "Quiero entender si mi dirección real pasa por construir y coordinar comunidad, aunque hoy no esté desbordado ni buscando rescatarme de nada.",
      },
      narrative: {
        childhoodMemories:
          "Desde chico tendía a juntar gente, organizar juegos o armar espacios donde otros se sintieran incluidos.",
        earlyFascinations:
          "Me interesó siempre cómo se arma un grupo, cómo se sostiene un clima y qué hace que un espacio tenga vida o se enfríe.",
        meaningfulSchoolSubjects:
          "Lengua, ciencias sociales y actividades donde hubiera que coordinar, presentar o sostener trabajo colectivo.",
        repeatedWorkPatterns:
          "Termino dando continuidad, armando pertenencia, empujando participación y evitando que los grupos se caigan.",
        naturalSocialRoles:
          "Suelo quedar en el lugar del que sostiene, conecta y organiza la circulación para que un grupo siga vivo.",
        lossesOrRenunciations:
          "No siento una pérdida dramática. Siento más bien que esta parte mía aparece, funciona y da resultado, pero no siempre es reconocida como dirección principal.",
        whatFeelsCompressedNow:
          "No estoy destruido. Lo colectivo sigue vivo y usable en mí; simplemente hoy no está llevado a su máxima expresión.",
        additionalContext:
          "No llego roto. Llego con curiosidad seria: quiero ver si lo mío no es solo colaborar con grupos, sino directamente construir comunidad.",
      },
    },
  },
  {
    id: "voc_t40_voz_publica_por_curiosidad_no_por_herida",
    label: "Voc T40 📣 Voz pública por curiosidad, no por herida",
    expectation:
      "Debería tender a clear_direction con public_communicator y no derivar a creative_storyteller ni a educator_interpreter.",
    payload: {
      profile: {
        age: 41,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "universitario completo",
      },
      currentContext: {
        currentSituation:
          "No estoy quebrado ni buscando una salida desesperada. Pero cuando un tema me importa, me sale encuadrarlo, fijar postura y decirlo con claridad para otros.",
        restrictions: [
          "No quiero una exposición improvisada",
          "Necesito moverme con criterio y sin romper todo",
        ],
        assets: [
          "Claridad discursiva",
          "Capacidad de fijar postura",
          "Lectura de agenda",
        ],
        transitionGoal:
          "Quiero verificar si mi dirección principal pasa por la comunicación pública y la construcción de voz, aunque hoy no venga desde una crisis.",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba explicar, argumentar y tomar la palabra cuando sentía que algo estaba mal planteado.",
        earlyFascinations:
          "Siempre me atrajo interpretar lo que pasa, ordenar temas y volverlos comprensibles o contundentes para otros.",
        meaningfulSchoolSubjects:
          "Lengua, historia, política, formación ética y materias donde hubiera que argumentar y exponer.",
        repeatedWorkPatterns:
          "Cuando algo me importa, termino ordenando el asunto, bajando postura y diciendo las cosas de una manera que pega.",
        naturalSocialRoles:
          "Suelo ser el que toma la palabra, encuadra el tema y hace que otros entiendan qué está en juego.",
        lossesOrRenunciations:
          "No siento una pérdida grande. Siento más bien que esa voz existe y aparece, pero no siempre como eje principal de mi trabajo.",
        whatFeelsCompressedNow:
          "No estoy apagado del todo. Esa parte aparece con fuerza cuando algo me toca, aunque todavía no esté del todo organizada como frente principal.",
        additionalContext:
          "No vengo desde el dolor. Vengo desde la curiosidad de ver si mi dirección más propia es más pública y editorial de lo que hoy estoy usando.",
      },
    },
  },
  {
    id: "voc_t41_relato_fino_sin_hambre_de_escenario",
    label: "Voc T41 ✍️ Relato fino sin hambre de escenario",
    expectation:
      "Debería tender a clear_direction con creative_storyteller y no derivar a public_communicator ni a educator_interpreter.",
    payload: {
      profile: {
        age: 39,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "universitario completo",
      },
      currentContext: {
        currentSituation:
          "No estoy roto ni desesperado. Pero hay una parte mía que se enciende cuando tengo que editar, narrar, darle forma a una idea o encontrarle tono y lenguaje a algo todavía suelto.",
        restrictions: [
          "No quiero dejar ingresos por una intuición",
          "Necesito probar antes de mover demasiado",
        ],
        assets: [
          "Escritura",
          "Edición",
          "Síntesis narrativa",
        ],
        transitionGoal:
          "Quiero verificar si mi dirección principal pasa más por dar forma narrativa que por ocupar una voz pública frontal.",
      },
      narrative: {
        childhoodMemories:
          "Desde chico me gustó escribir, reformular cosas, elegir palabras y encontrar una forma más expresiva de decirlas.",
        earlyFascinations:
          "Siempre me atrajeron la forma, el lenguaje, el tono y la posibilidad de transformar una idea en relato.",
        meaningfulSchoolSubjects:
          "Lengua, literatura, historia y espacios donde hubiera que redactar, interpretar o construir sentido con palabras.",
        repeatedWorkPatterns:
          "Termino editando, acomodando ideas, encontrando el ángulo y dándole forma verbal a lo que otros todavía tienen suelto.",
        naturalSocialRoles:
          "Suelo ser el que encuentra la forma, afina el mensaje y mejora cómo queda dicho algo.",
        lossesOrRenunciations:
          "No siento una gran pérdida. Más bien siento que esta parte mía existe, está viva y aparece bastante, aunque no siempre ocupa el centro.",
        whatFeelsCompressedNow:
          "No me siento aplastado. Siento más bien una subutilización de una capacidad narrativa que está presente, pero todavía no organizada como eje.",
        additionalContext:
          "No llego roto. Llego con curiosidad real por entender si lo mío pasa más por construir relato que por fijar postura pública o enseñar.",
      },
    },
  },
  // ==========================
// CASOS — NO CRISIS / EXPLORACIÓN
// ==========================


];