import type { EvaluationCase } from "./evaluationCases";
import { SEED_DIAGNOSTIC_CASES } from "./seedDiagnosticCases";

const normalizeHumanLanguageCase = (caseItem: any): EvaluationCase => {
  const rawPayload = caseItem.payload ?? {};
  const rawNarrative = rawPayload.narrative ?? caseItem.input ?? {};

  const normalizedNarrative = {
    childhoodMemories: rawNarrative.childhoodMemories ?? "",
    earlyFascinations: rawNarrative.earlyFascinations ?? "",
    meaningfulSchoolSubjects: rawNarrative.meaningfulSchoolSubjects ?? "",
    repeatedWorkPatterns: rawNarrative.repeatedWorkPatterns ?? "",
    naturalSocialRoles: rawNarrative.naturalSocialRoles ?? "",
    lossesOrRenunciations: rawNarrative.lossesOrRenunciations ?? "",
    whatFeelsCompressedNow: rawNarrative.whatFeelsCompressedNow ?? "",
    additionalContext: rawNarrative.additionalContext ?? "",
  };

  const normalizedCurrentContext = rawPayload.currentContext ?? {
    currentSituation: rawNarrative.currentSituation ?? "",
    currentRestrictions:
      rawNarrative.currentRestrictions ??
      rawNarrative.restrictions ??
      "",
    currentAssets:
      rawNarrative.currentAssets ??
      rawNarrative.assets ??
      "",
  };

  return {
    ...caseItem,
    payload: {
      ...rawPayload,
      narrative: normalizedNarrative,
      currentContext: normalizedCurrentContext,
    },
  } as EvaluationCase;
};

const LEGACY_HUMAN_LANGUAGE_CASES: EvaluationCase[] = [
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



  {
    id: "voc_human_01_voz_publica_encerrada",
    label: "Voc H01 — La voz pública que quedó encerrada",
    expectation: "Debería tender a clear_direction con public_communicator como familia principal y no confundirse con creative_storyteller puro. Puede aparecer civic_advocate como secundaria.",
    payload: {
      narrative: {
      currentSituation: "Hoy laburo de algo bastante lejos de lo que siento más mío. Cumplo, hago lo que tengo que hacer, pero cada vez que aparece un tema público que me toca, se me prende otra parte. Termino escribiendo, opinando, armando una bajada, discutiendo con gente, tratando de ordenar qué está pasando.",
      childhoodMemories: "De chico me acuerdo de estar siempre pendiente de las conversaciones de los grandes, de lo que pasaba en la tele, de las discusiones políticas o sociales. No era solamente mirar: quería entender quién tenía razón, qué se estaba diciendo y qué no.",
      earlyFascinations: "Me fascinaban la radio, los programas de opinión, los debates, la gente que podía agarrar un tema difícil y decirlo claro. También me llamaba mucho la atención cuando alguien lograba mover a otros con palabras.",
      meaningfulSchoolSubjects: "Me gustaban historia, formación cívica, literatura cuando había que argumentar, y todo lo que permitiera discutir ideas. No era tanto estudiar de memoria; me interesaba tomar posición.",
      repeatedWorkPatterns: "En distintos lugares terminé siendo el que dice lo que nadie quiere decir, o el que ordena una discusión cuando todos hablan medio mezclado. A veces eso molesta, pero también pasa que después muchos dicen 'era por ahí'.",
      naturalSocialRoles: "Suelo quedar como el que opina, el que baja una postura, el que pone en palabras lo que otros sienten pero no se animan a decir. No necesariamente busco liderar grupos, pero sí tomar la palabra cuando algo importa.",
      lossesOrRenunciations: "Dejé bastante tapada esa parte por tener que sostener laburo, cuentas y una vida más práctica. Me quedó en posteos, charlas o discusiones sueltas, no en algo con continuidad.",
      whatFeelsCompressedNow: "Siento que mi voz pública está encerrada. Aparece cuando algo me indigna o me importa, pero después vuelve a quedar guardada. Es como si lo más vivo mío saliera sólo a ratos.",
      restrictions: "No puedo largar todo para probar una vida incierta. Necesito sostén económico y algo gradual. Tampoco quiero vender humo ni hacer comunicación vacía.",
      assets: "Tengo voz propia, criterio para ordenar temas, sensibilidad para detectar agenda, facilidad para argumentar y una cierta capacidad para generar reacción cuando digo algo.",
      additionalContext: "No quiero que esto se lea sólo como 'me gusta escribir'. Lo que me mueve es intervenir sobre temas públicos, fijar postura y decir algo que tenga peso para otros."
      }
    } as any,
  },
  {
    id: "voc_human_02_narrador_sin_puerta",
    label: "Voc H02 — El narrador que no encuentra puerta",
    expectation: "Debería tender a clear_direction con creative_storyteller como familia principal y no confundirse con public_communicator. La escritura aparece como necesidad narrativa, no como toma de postura pública.",
    payload: {
      narrative: {
      currentSituation: "Trabajo en algo que me sostiene, pero por dentro siempre vuelvo a escribir. No siempre con una finalidad clara. A veces son escenas, frases sueltas, ideas, personajes, recuerdos. Es como si necesitara convertir lo que me pasa en algo con forma.",
      childhoodMemories: "De chico inventaba historias, me quedaba imaginando escenas o cambiando finales de películas y cuentos. También me gustaba observar detalles de la gente, gestos, formas de hablar, cosas mínimas que después me quedaban dando vueltas.",
      earlyFascinations: "Me fascinaban las novelas, las películas, los guiones, las canciones con letra fuerte. No sólo por el contenido, sino por cómo estaban contadas. Me pegaba mucho cuando alguien lograba decir algo que yo sentía pero no sabía nombrar.",
      meaningfulSchoolSubjects: "Lengua, literatura, historia cuando se contaba como relato. Me costaban menos los trabajos donde había que escribir, armar una mirada o explicar algo desde una escena.",
      repeatedWorkPatterns: "En trabajos o grupos termino siendo el que redacta, mejora un texto, encuentra una frase, arma un mensaje o convierte algo confuso en una historia más clara. Muchas veces lo hago sin que nadie me lo pida.",
      naturalSocialRoles: "No soy necesariamente el que quiere estar al frente. Me siento más cómodo dando forma, escribiendo, puliendo, encontrando el tono. A veces prefiero que otro lo diga, pero que la pieza esté bien armada.",
      lossesOrRenunciations: "Fui dejando esa parte para después. Quedó en archivos, notas del celular, carpetas que nadie lee. Me digo que algún día voy a hacer algo, pero ese día no llega.",
      whatFeelsCompressedNow: "La parte narrativa está viva pero escondida. Sale en ratos sueltos, de noche, cuando ya estoy cansado. No se volvió una línea real de vida.",
      restrictions: "No puedo romantizar la inestabilidad. Necesito trabajar y sostenerme. Tampoco sé por dónde se entra a ese mundo si no tenés contactos o una carrera armada.",
      assets: "Tengo sensibilidad narrativa, buen oído para el tono, facilidad para encontrar escenas, ordenar experiencias y convertir ideas en texto.",
      additionalContext: "No siento que lo mío sea necesariamente opinar sobre temas públicos. Lo mío es más dar forma, narrar, escribir, encontrar una voz o una historia."
      }
    } as any,
  },
  {
    id: "voc_human_03_guia_empatico_sin_cauce",
    label: "Voc H03 — La persona que acompaña pero no encuentra cauce",
    expectation: "Debería tender a clear_direction con empathic_guide y no confundirse con diplomatic_social_connector ni community_builder. El foco es uno a uno, escucha y clarificación subjetiva.",
    payload: {
      narrative: {
      currentSituation: "Hoy tengo un trabajo común, pero lo que más se repite en mi vida es otra cosa: la gente me termina contando cosas. Problemas, angustias, decisiones, miedos. Yo escucho, pregunto, trato de ayudar a ordenar.",
      childhoodMemories: "Desde chico me pasaba que percibía cuando alguien estaba mal, aunque no dijera nada. Me quedaba cerca, preguntaba, o simplemente escuchaba. No era algo que pensara demasiado.",
      earlyFascinations: "Me interesaban las historias personales, entender por qué alguien hacía lo que hacía, qué le dolía, qué no podía decir. Me llamaba más la atención una persona atravesando algo que una cosa abstracta.",
      meaningfulSchoolSubjects: "Me gustaban materias donde aparecían personas, historias, conflictos humanos. Literatura, psicología si había algo, formación ética, incluso historia cuando se hablaba de decisiones humanas.",
      repeatedWorkPatterns: "En todos lados alguien me termina agarrando para hablar. Compañeros, amigos, familiares. No siempre sé qué hacer, pero suelo ayudar a que la persona se calme y vea un poco más claro.",
      naturalSocialRoles: "No soy tanto de armar grupos o mediar entre sectores. Me sale más estar con una persona, escuchar sin invadir y hacer preguntas que la ayuden a ordenar lo que le pasa.",
      lossesOrRenunciations: "Nunca supe cómo convertir eso en algo real. Como no tengo título de psicólogo ni una profesión vinculada, queda como una capacidad informal, medio invisible.",
      whatFeelsCompressedNow: "Siento que esa parte aparece todo el tiempo, pero no tiene lugar. La uso para otros, pero no está integrada en mi camino laboral o vocacional.",
      restrictions: "No puedo dejar mi trabajo de golpe para estudiar muchos años sin ingresos. Necesitaría una forma gradual y seria de ver si esto puede tener cauce.",
      assets: "Escucha, paciencia, registro emocional, capacidad de hacer preguntas, cuidado para no invadir y facilidad para acompañar procesos personales.",
      additionalContext: "No me veo como alguien que organiza comunidades. Lo mío es más íntimo, más de uno a uno, de ayudar a que alguien no se pierda tanto adentro de lo que vive."
      }
    } as any,
  },
  {
    id: "voc_human_04_conector_invisible",
    label: "Voc H04 — El que destraba entre partes pero nadie lo ve",
    expectation: "Debería tender a clear_direction con diplomatic_social_connector y no confundirse con empathic_guide. La señal central es multi-actor: partes, áreas, cruces, tensión y destrabe.",
    payload: {
      narrative: {
      currentSituation: "En mis trabajos termino haciendo cosas que no figuran en ningún puesto. Hablar con uno, con otro, bajar tensión, explicar lo que quiso decir cada parte, destrabar quilombos que ni eran míos.",
      childhoodMemories: "De chico muchas veces quedaba como puente entre personas de mi familia o amigos. Si dos se peleaban, yo intentaba entender a los dos lados. No siempre salía bien, pero me salía natural.",
      earlyFascinations: "Me llamaba la atención cómo se armaban los conflictos, cómo una frase mal dicha podía trabar todo, y cómo a veces alcanzaba con traducir un poco lo que cada uno quería decir.",
      meaningfulSchoolSubjects: "Me interesaban las materias donde había debate, grupos, organización o interpretación de situaciones humanas. No tanto por memorizar, sino por entender posiciones.",
      repeatedWorkPatterns: "Siempre termino en el medio cuando hay áreas que no se entienden, jefes que piden una cosa y equipos que entienden otra, compañeros cruzados o decisiones trabadas por falta de conversación.",
      naturalSocialRoles: "Soy el que hace de puente, el que llama, aclara, acomoda, baja un cambio y trata de que la cosa avance sin que explote.",
      lossesOrRenunciations: "Esa habilidad nunca aparece reconocida. Parece que sólo cuenta lo formal, pero muchas veces si yo no hago ese trabajo invisible, las cosas se traban.",
      whatFeelsCompressedNow: "Hoy esa capacidad está usada en modo bombero. Sirve para apagar incendios, pero no como una dirección clara o reconocida.",
      restrictions: "Necesito estabilidad y no puedo irme a cualquier cosa. Además, me cansa quedar siempre en el medio de conflictos ajenos.",
      assets: "Lectura de personas, cintura social, capacidad para traducir posiciones, bajar tensión y encontrar puntos de avance.",
      additionalContext: "No es sólo que escucho a una persona. Lo que más aparece es entre partes: personas, áreas, equipos, grupos o intereses cruzados."
      }
    } as any,
  },
  {
    id: "voc_human_05_analitico_apagando_incendios",
    label: "Voc H05 — El analítico usado para apagar incendios",
    expectation: "Debería tender a clear_direction o compressed_life con analytical_strategist como familia principal. No debe confundirse con technical_builder: la señal es criterio, escenarios e inconsistencias, no arreglo técnico.",
    payload: {
      narrative: {
      currentSituation: "Laburo en algo donde todo el tiempo hay urgencias. Me doy cuenta bastante rápido cuando algo está mal pensado, pero casi siempre aparezco cuando ya explotó. Entonces uso criterio para apagar incendios, no para pensar bien antes.",
      childhoodMemories: "De chico era de mirar mucho antes de hablar. Me daba cuenta cuando una explicación no cerraba o cuando alguien estaba haciendo algo que después iba a traer problemas.",
      earlyFascinations: "Me interesaban los juegos de estrategia, los mapas, las comparaciones, entender por qué una decisión lleva a otra. Siempre me gustó pensar varios pasos adelante.",
      meaningfulSchoolSubjects: "Me gustaban historia, lógica, matemática cuando había razonamiento, economía o cualquier materia donde hubiera que comparar causas y consecuencias.",
      repeatedWorkPatterns: "En distintos trabajos terminé viendo agujeros, riesgos, inconsistencias. Muchas veces aviso y no me dan bola hasta que el problema aparece.",
      naturalSocialRoles: "Suelo ser el que frena un poco, pregunta qué no estamos viendo, compara alternativas o marca que algo está mal encarado.",
      lossesOrRenunciations: "Renuncié bastante a pensar en serio. Me acostumbré a resolver lo urgente, corregir tarde y seguir. Eso me frustra porque siento que mi cabeza podría servir mucho más en otro lugar.",
      whatFeelsCompressedNow: "Mi capacidad analítica está comprimida. La uso para que no se caiga todo, no para construir mejores decisiones.",
      restrictions: "No puedo dejar de trabajar ni ponerme a buscar algo ideal sin base. Necesito una transición realista.",
      assets: "Detección de patrones, lectura de riesgos, comparación de escenarios, criterio para decidir y capacidad para ordenar información confusa.",
      additionalContext: "No disfruto tanto meter mano técnica. Lo que me engancha es entender la lógica del problema y anticipar consecuencias."
      }
    } as any, 
  },
  {
    id: "voc_human_06_tecnico_sin_oportunidad",
    label: "Voc H06 — El técnico que necesita una oportunidad real",
    expectation: "Debería tender a clear_direction con technical_builder y no confundirse con analytical_strategist. La gratificación central es resolver fallas, ajustar y hacer funcionar.",
    payload: {
      narrative: {
      currentSituation: "Hoy estoy en laburos medio improvisados, resolviendo lo que aparece. Arreglo, acomodo, hago que algo funcione. Tengo maña, pero siento que nunca entré a un lugar donde eso pueda crecer en serio.",
      childhoodMemories: "De chico desarmaba cosas, quería entender cómo funcionaban, arreglaba juguetes o aparatos aunque a veces los rompiera más. Me gustaba probar con las manos.",
      earlyFascinations: "Me llamaban las herramientas, las máquinas, las computadoras, los cables, cualquier cosa que tuviera una lógica práctica y se pudiera mejorar o reparar.",
      meaningfulSchoolSubjects: "Me gustaban más las materias prácticas, tecnología, informática, taller, cosas donde uno pudiera hacer y no solamente estudiar teoría.",
      repeatedWorkPatterns: "Siempre termino siendo el que resuelve la falla, el que ve qué se trabó, el que ajusta algo para que salga. No siempre queda reconocido, pero me buscan cuando algo no anda.",
      naturalSocialRoles: "Soy más de resolver que de hablar mucho. Si veo un problema concreto, intento meter mano y dejarlo andando.",
      lossesOrRenunciations: "Nunca tuve una formación ordenada ni alguien que me ayude a profesionalizar eso. Me quedó como habilidad útil pero medio de supervivencia.",
      whatFeelsCompressedNow: "Siento que tengo capacidad técnica, pero usada para zafar, no para construir una carrera o un proyecto más fuerte.",
      restrictions: "Necesito seguir ganando plata. No puedo dejar todo para estudiar sin ingresos. Pero sí me gustaría formarme mejor o entrar en algo donde pueda crecer.",
      assets: "Maña técnica, resolución concreta, paciencia para probar, criterio práctico y capacidad para hacer que algo funcione.",
      additionalContext: "No me veo como analista de escenarios. Lo mío aparece más cuando hay una falla concreta y puedo arreglarla o mejorarla."
      }
    } as any, 
  },
{
    id: "voc_human_07_docente_vocacion_herida",
    label: "Voc H07 — La docente cansada de que la vocación no alcance",
    expectation: "Debería tender a clear_direction con educator_interpreter y no confundirse con empathic_guide. El núcleo es enseñar, traducir dificultad y formar, aunque haya desgaste contextual.",
    payload: {
      narrative: {
      currentSituation: "Me gusta enseñar, eso no lo puedo negar. Cuando alguien entiende algo porque yo se lo expliqué, siento que algo cierra. Pero estoy cansada de que la vocación se use como excusa para bancarse cualquier cosa.",
      childhoodMemories: "De chica jugaba a explicar, a hacer de maestra, a ordenar cuadernos o ayudar a otros a entender tareas. No era sólo mandar; me gustaba que el otro entendiera.",
      earlyFascinations: "Me gustaban los docentes que hacían fácil algo difícil. Me quedaba pensando cómo una buena explicación podía cambiar completamente un tema.",
      meaningfulSchoolSubjects: "Me gustaban materias donde podía explicar, resumir, hacer cuadros, ayudar a compañeros. A veces aprendía mejor cuando se lo enseñaba a otro.",
      repeatedWorkPatterns: "En distintos espacios termino explicando, armando ejemplos, bajando temas complicados a algo entendible. La gente suele decirme que conmigo entiende más fácil.",
      naturalSocialRoles: "Soy la que ordena una idea y la vuelve explicable. También acompaño, pero lo central es ayudar a comprender.",
      lossesOrRenunciations: "Me desgasté en contextos donde enseñar implica cargar con todo: falta de recursos, malos sueldos, demandas emocionales, presión. No quiero perder lo que amo por el contexto.",
      whatFeelsCompressedNow: "La vocación está, pero está golpeada. No quiero abandonar enseñar; quiero encontrar una forma de hacerlo sin romperme.",
      restrictions: "Tengo responsabilidades y no puedo salir corriendo a reinventarme. Necesito pensar alternativas reales dentro o cerca de la educación.",
      assets: "Claridad para explicar, paciencia, capacidad de traducir dificultad, lectura del ritmo de aprendizaje del otro.",
      additionalContext: "No es solamente escuchar o contener. Lo que más me mueve es que alguien entienda algo que antes le parecía imposible."
      }
    } as any, 
  },
 { 
    id: "voc_human_08_comunidad_ahogada",
    label: "Voc H08 — La persona que arma comunidad pero está seca",
    expectation: "Debería tender a compressed_life con community_builder como familia principal y no confundirse con empathic_guide. La señal central es sostener grupos, red y continuidad colectiva.",
    payload: {
      narrative: {
      currentSituation: "Ahora estoy bastante seco. Entre laburo, plata, familia y cansancio, siento que no me queda resto. Pero toda mi vida fui de juntar gente, armar grupos, sostener movidas, hacer que algo no se muera.",
      childhoodMemories: "De chico me gustaba juntar amigos, organizar juegos, inventar planes, hacer que todos participaran. Me molestaba cuando alguien quedaba afuera o cuando el grupo se desarmaba.",
      earlyFascinations: "Me fascinaban los clubes, los grupos, las comunidades, las bandas de amigos que hacían cosas juntos. Siempre me interesó cómo se sostiene un espacio compartido.",
      meaningfulSchoolSubjects: "Me enganchaba más cuando había trabajos grupales, proyectos, actividades donde organizar personas y hacer algo juntos.",
      repeatedWorkPatterns: "En laburos, grupos o actividades termino convocando, recordando, empujando, sosteniendo el hilo. Si no muevo yo, muchas cosas se enfrían.",
      naturalSocialRoles: "Soy el que arma red, el que conecta gente, el que trata de que no se pierda la continuidad. No necesariamente acompaño uno a uno; me tira lo colectivo.",
      lossesOrRenunciations: "Fui dejando esa parte porque no daba más. La urgencia de la vida se comió mi energía comunitaria. Eso me da bronca porque ahí me siento bastante yo.",
      whatFeelsCompressedNow: "Mi impulso comunitario está ahogado. No desapareció, pero aparece poco y sin fuerza.",
      restrictions: "No puedo dedicarme a sostener espacios si no tengo resuelto lo básico. Necesito algo que no dependa sólo de mi energía personal.",
      assets: "Convocatoria, continuidad, lectura grupal, capacidad para generar pertenencia y sostener espacios.",
      additionalContext: "No es principalmente escuchar a una persona perdida. Lo que más se repite es armar y sostener algo entre varios."
      }
    } as any,
  },
  {
    id: "voc_human_09_ojo_estetico_sin_circuito",
    label: "Voc H09 — El creador visual sin circuito",
    expectation: "Debería tender a clear_direction con aesthetic_designer_curator y no confundirse con artistic_creator puro. El núcleo es criterio visual, composición, detalle y experiencia estética aplicada.",
    payload: {
      narrative: {
      currentSituation: "Trabajo de algo que no tiene mucho que ver, pero todo el tiempo estoy mirando cómo se ve una cosa, cómo está armado un espacio, una foto, una marca, una mesa, un cartel. Veo detalles que otros ni registran.",
      childhoodMemories: "De chico acomodaba cosas por color, por forma, cambiaba muebles de lugar, me importaba cómo quedaba un dibujo, una carpeta, una habitación.",
      earlyFascinations: "Me fascinaban las revistas, las vidrieras, las casas lindas, los afiches, los logos, las películas bien cuidadas visualmente. Me quedaba mirando cómo estaba compuesto todo.",
      meaningfulSchoolSubjects: "Me gustaban arte, diseño, dibujo, actividades manuales o visuales. También me gustaban trabajos donde pudiera presentar algo prolijo y con estilo.",
      repeatedWorkPatterns: "En grupos termino opinando sobre cómo mostrar algo, qué imagen usar, cómo ordenar visualmente, qué queda feo o qué puede verse mejor.",
      naturalSocialRoles: "Me suelen decir que tengo buen gusto. A veces me piden ayuda para elegir, ordenar, decorar, mejorar una presentación o hacer que algo tenga más presencia.",
      lossesOrRenunciations: "Nunca encontré el circuito. Me quedó como 'tenés buen gusto', pero no como camino. No sé cómo convertir ese ojo en oportunidad real.",
      whatFeelsCompressedNow: "Mi sensibilidad estética está subusada. Aparece todo el tiempo, pero no tiene espacio central.",
      restrictions: "No tengo una carrera perfecta en diseño ni contactos. No puedo dejar todo para probar suerte sin base.",
      assets: "Ojo visual, sensibilidad estética, criterio de composición, atención al detalle y capacidad para mejorar cómo se presenta algo.",
      additionalContext: "No siento que lo principal sea hacer arte libre. Me interesa más dar forma visual, curar, ordenar, mejorar la experiencia estética de algo."
      }
    } as any,
  },
  {
    id: "voc_human_10_artista_sin_lujo",
    label: "Voc H10 — El artista que no puede darse el lujo",
    expectation: "Debería tender a compressed_life con artistic_creator como familia principal y no confundirse con creative_storyteller solamente. La señal central es creación artística amplia, deseo fuerte y compresión económica.",
    payload: {
      narrative: {
      currentSituation: "Yo sé que lo mío va por crear. Música, arte, algo expresivo. Pero también sé que no vivo en una película. Tengo cuentas, responsabilidades, cosas que pagar. Entonces hago lo que puedo cuando me queda energía.",
      childhoodMemories: "De chico cantaba, dibujaba, inventaba cosas, me metía mucho en lo artístico. Podía pasar horas en eso sin sentir el tiempo.",
      earlyFascinations: "Me fascinaban los músicos, los artistas, la gente que podía convertir algo interno en una obra. Me emocionaba ver a alguien crear algo propio.",
      meaningfulSchoolSubjects: "Me gustaban música, arte, literatura, cualquier espacio donde pudiera expresarme. No siempre era el mejor técnicamente, pero ahí me sentía vivo.",
      repeatedWorkPatterns: "Aunque lo deje, siempre vuelvo. Aparece una canción, una idea, una imagen, algo. No es un hobby cualquiera, porque cuando no está siento que me falta una parte.",
      naturalSocialRoles: "Soy el que aparece con ideas creativas, con sensibilidad, con necesidad de hacer algo propio. Pero muchas veces lo escondo porque siento que no es práctico.",
      lossesOrRenunciations: "Fui dejando lo artístico para después. Primero trabajar, primero pagar, primero cumplir. El problema es que ese después se hizo años.",
      whatFeelsCompressedNow: "Mi vocación artística está reducida a ratos sueltos. Lo más vivo mío aparece cuando ya estoy cansado.",
      restrictions: "No puedo largar todo por un sueño sin estructura. Necesito una forma gradual, realista, que no destruya mi vida económica.",
      assets: "Sensibilidad, impulso creativo, persistencia del deseo, capacidad expresiva y necesidad de producir algo propio.",
      additionalContext: "No es sólo narrar historias. Puede ser música, imagen, performance, creación artística en sentido amplio. Lo central es crear."
      }
      } as any,
    },
    {
      id: "voc_human_11_deportista_quedo_atras",
      label: "Voc H11 — El cuerpo que quedó para después",
      expectation: "Debería tender a clear_direction con physical_performer como familia principal y no confundirse con care_healer sólo porque habla de cuerpo y bienestar.",
      payload: {
        narrative: {
          currentSituation: "Hoy mi vida está bastante tomada por trabajo, cuentas y obligaciones. Entreno cuando puedo, pero siento que el cuerpo, el deporte y la disciplina física quedaron muy atrás de lo que alguna vez fueron para mí.",
          childhoodMemories: "De chico me la pasaba corriendo, jugando, compitiendo, probando movimientos. No era sólo hacer actividad: me gustaba mejorar, repetir, sentir que el cuerpo respondía.",
          earlyFascinations: "Me fascinaban los deportistas, la preparación física, la técnica, ver cómo alguien podía entrenar durante años para dominar algo. Me llamaba mucho la atención esa mezcla de cabeza, cuerpo y constancia.",
          meaningfulSchoolSubjects: "Educación física era de los pocos momentos donde me sentía entero. También me gustaban las actividades donde había competencia, coordinación o desafío concreto.",
          repeatedWorkPatterns: "En trabajos o grupos, cuando hay que sostener disciplina, ritmo o aguante, suelo responder bien. Me cuesta más estar todo el día quieto, sólo pensando o sentado.",
          naturalSocialRoles: "Suelo aparecer como alguien que empuja, que acompaña entrenamientos, que se engancha con mejorar, competir o sostener práctica cuando otros aflojan.",
          lossesOrRenunciations: "Fui dejando el deporte para después. Primero estudiar, después trabajar, después pagar cosas. Cuando me quise acordar, esa parte mía estaba casi archivada.",
          whatFeelsCompressedNow: "Siento que mi energía física y competitiva sigue viva, pero muy reducida. Cuando vuelvo a entrenar, aunque sea poco, aparece algo mío que en otros lados no aparece.",
          restrictions: "No puedo vivir como si tuviera dieciocho años ni largar todo por el deporte. Tengo edad, responsabilidades, horarios y cansancio acumulado.",
          assets: "Tengo disciplina, memoria corporal, tolerancia al esfuerzo, gusto por mejorar y una conexión fuerte con la práctica física.",
          additionalContext: "No es sólo que quiero estar saludable. Lo que aparece es una relación profunda con rendimiento, técnica, disciplina y movimiento.",
        },
      } as any,
    },
    {
      id: "voc_human_12_operador_institucional_sin_puerta",
      label: "Voc H12 — El que entiende cómo se mueve una institución",
      expectation: "Debería tender a clear_direction con institutional_operator y no confundirse con diplomatic_social_connector sólo porque habla de personas y conversaciones.",
      payload: {
        narrative: {
          currentSituation: "Hoy estoy en un trabajo bastante común, pero donde más rindo es cuando tengo que entender cómo se mueve una estructura. Quién decide, qué paso falta, dónde está trabado algo y por dónde conviene empujar.",
          childhoodMemories: "De chico me fijaba mucho en las reglas, en quién mandaba, quién podía resolver algo, cómo se conseguían permisos o cómo se destrababan cosas con adultos.",
          earlyFascinations: "Me llamaban la atención la política, las instituciones, los clubes, las escuelas, los municipios, cualquier lugar donde hubiera reglas formales y movimientos por detrás.",
          meaningfulSchoolSubjects: "Me interesaban historia, formación cívica, derecho cuando aparecía algo, y también los trabajos donde había que entender organización o funcionamiento de un sistema.",
          repeatedWorkPatterns: "En distintos lugares terminé ubicando qué trámite faltaba, con quién había que hablar, qué orden convenía seguir o qué error iba a trabar todo después.",
          naturalSocialRoles: "Suelo quedar como el que entiende el mapa interno. No necesariamente el más carismático, sino el que sabe por dónde entrar sin chocar al pedo.",
          lossesOrRenunciations: "Nunca supe bien cómo convertir esa lectura institucional en una trayectoria. Si no tenés cargo, título o apellido, parece que esa habilidad no cuenta.",
          whatFeelsCompressedNow: "Siento que esa capacidad está usada para resolver cosas chicas, cuando podría servir para operar estructuras más grandes o proyectos más complejos.",
          restrictions: "Necesito estabilidad y no puedo meterme en cualquier aventura política o institucional sin red. También me cuido de no quedar pegado a lugares turbios.",
          assets: "Tengo lectura de estructuras, paciencia para procesos formales, criterio para moverme sin romper todo y capacidad para destrabar dentro de marcos existentes.",
          additionalContext: "No es principalmente mediar emociones entre personas. Lo que más aparece es lectura de reglas, jerarquías, pasos, permisos y estructuras.",
        },
      } as any,
    },
    {
      id: "voc_human_13_comercial_sin_chantada",
      label: "Voc H13 — El que sabe vender pero no quiere vender humo",
      expectation: "Debería tender a clear_direction con commercial_connector y no confundirse con diplomatic_social_connector sólo porque conecta personas.",
      payload: {
        narrative: {
          currentSituation: "Me pasa que tengo facilidad para hablar con gente, detectar qué necesita y encontrar cómo presentar algo. Pero me incomoda mucho cuando la venta se vuelve manipulación o chamuyo vacío.",
          childhoodMemories: "De chico podía convencer, negociar, cambiar figuritas, vender alguna cosa, buscarle la vuelta a un intercambio. Me gustaba cuando todos sentían que salían ganando.",
          earlyFascinations: "Me llamaban la atención los negocios, la gente que sabía ofrecer algo, los vendedores buenos de verdad, los que entendían a la persona y no sólo empujaban un producto.",
          meaningfulSchoolSubjects: "Me interesaban economía, comunicación, actividades prácticas, trabajos grupales donde había que presentar una idea o defender una propuesta.",
          repeatedWorkPatterns: "En trabajos o proyectos termino hablando con clientes, conectando necesidades, mejorando una propuesta o ayudando a cerrar algo que estaba medio frío.",
          naturalSocialRoles: "Suelo aparecer como el que puede abrir una conversación, detectar oportunidad, negociar o hacer que una idea suene más clara y vendible.",
          lossesOrRenunciations: "A veces me corrí de ese mundo porque no quiero convertirme en un chanta. Me cuesta entrar en ambientes donde todo parece empujar a vender cualquier cosa.",
          whatFeelsCompressedNow: "Siento que tengo una veta comercial real, pero está frenada por una tensión ética. Quiero conectar valor, no manipular gente.",
          restrictions: "Necesito trabajar y generar ingresos, pero no quiero hacerlo a costa de vender humo. También me falta un entorno donde esa forma más limpia de vender sea valorada.",
          assets: "Tengo trato, lectura de necesidades, capacidad de explicar valor, negociación, olfato para oportunidades y energía para mover conversaciones.",
          additionalContext: "No es sólo unir personas o bajar tensiones. Lo central es detectar valor, conectar oferta y necesidad, negociar y generar movimiento comercial sin perder ética.",
        },
      } as any,
    },
    {
      id: "voc_human_14_emprendedor_sin_ecosistema",
      label: "Voc H14 — El que tuvo ideas pero nunca tuvo aire",
      expectation: "Debería tender a clear_direction con venture_builder y no confundirse con commercial_connector sólo porque habla de oportunidades.",
      payload: {
        narrative: {
          currentSituation: "Siempre tengo ideas dando vueltas. Algunas quedan en nada, otras creo que podrían funcionar. El problema es que nunca tuve demasiado aire: faltaba plata, tiempo, socios, cabeza o simplemente un lugar donde probar.",
          childhoodMemories: "De chico inventaba cosas para vender, juegos, pequeños planes, formas de mejorar algo. Me gustaba arrancar cosas aunque después me costara sostenerlas.",
          earlyFascinations: "Me fascinaba la gente que armaba algo desde cero: un negocio, una marca, un proyecto, una movida. No tanto por hacerse millonario, sino por ver una idea convertirse en algo real.",
          meaningfulSchoolSubjects: "Me interesaban las materias prácticas, economía, tecnología, comunicación y cualquier actividad donde hubiera que pensar una idea y llevarla a algo concreto.",
          repeatedWorkPatterns: "En trabajos o grupos suelo detectar posibilidades: esto podría hacerse mejor, acá falta algo, esto se podría vender, esto podría juntarse con esto otro.",
          naturalSocialRoles: "Suelo aparecer como el que propone, empuja el arranque, ve la oportunidad y contagia un poco de movimiento. A veces después necesito ayuda para ordenar y sostener.",
          lossesOrRenunciations: "Fui dejando muchas ideas por falta de red. No siempre fue falta de ganas; muchas veces fue no tener con quién, dónde o cómo probar.",
          whatFeelsCompressedNow: "Siento que mi capacidad de iniciar está viva pero dispersa. Tengo intuiciones, pero no ecosistema para bajarlas a tierra.",
          restrictions: "No puedo dejar todo y emprender a ciegas. Necesito ingresos, estructura mínima, gente confiable y pasos chicos pero reales.",
          assets: "Tengo iniciativa, olfato para oportunidades, energía de arranque, capacidad de imaginar formatos y ganas de convertir ideas en algo concreto.",
          additionalContext: "No es sólo vender ni negociar. Lo que más se repite es iniciar, combinar recursos, armar algo que antes no existía y empujarlo a la realidad.",
        },
      } as any,
    },
    {
      id: "voc_human_15_curiosidad_encerrada",
      label: "Voc H15 — La curiosidad que se achicó con la vida",
      expectation: "Debería tender a clear_direction con cultural_explorer y no confundirse con meaning_synthesizer, porque predomina exploración amplia de mundos, temas y referencias antes que síntesis filosófica profunda.",
      payload: {
        narrative: {
          currentSituation: "Mi vida se volvió bastante chica: trabajo, casa, pagar cosas, dormir. Pero yo no era así. Siempre fui de engancharme con temas, lugares, libros, culturas, historias raras, gente distinta.",
          childhoodMemories: "De chico preguntaba mucho, miraba mapas, quería saber cómo vivía la gente en otros lugares, por qué pasaban ciertas cosas, de dónde venían las costumbres.",
          earlyFascinations: "Me fascinaban los viajes, la historia, los documentales, las culturas, los idiomas, los libros que abrían mundos. Podía saltar de un tema a otro sin sentir que era dispersión.",
          meaningfulSchoolSubjects: "Me gustaban historia, geografía, literatura, idiomas y cualquier materia que me permitiera mirar otros mundos o épocas.",
          repeatedWorkPatterns: "En trabajos o conversaciones termino trayendo referencias, comparaciones, datos, ejemplos de otros lugares o de otras épocas. A veces la gente me dice que conecto cosas raras.",
          naturalSocialRoles: "Suelo ser el que abre temas, recomienda algo, encuentra una conexión cultural o trae una perspectiva distinta.",
          lossesOrRenunciations: "Fui dejando la exploración por falta de tiempo y energía. La rutina me fue cerrando el mundo.",
          whatFeelsCompressedNow: "Mi curiosidad sigue viva, pero encerrada. Leo o miro cosas a ratos, sin una dirección ni comunidad donde eso pueda crecer.",
          restrictions: "No puedo irme a viajar por el mundo ni estudiar diez carreras. Necesito formas posibles de alimentar esa parte dentro de mi vida real.",
          assets: "Tengo curiosidad sostenida, memoria de referencias, interés por culturas e historias, y facilidad para conectar mundos distintos.",
          additionalContext: "No es solamente pensar el sentido profundo de la vida. Lo que más aparece es exploración cultural, referencias, mundos, temas y experiencias distintas.",
        },
      } as any,
    },
    {
      id: "voc_human_16_sintetizador_de_sentido",
      label: "Voc H16 — El que necesita encontrar sentido",
      expectation: "Debería tender a clear_direction con meaning_synthesizer y no confundirse con cultural_explorer, porque la exploración está al servicio de integrar sentido y no sólo de recorrer temas.",
      payload: {
        narrative: {
          currentSituation: "Trabajo, cumplo, hago mi vida, pero mi cabeza siempre se va a preguntas más de fondo. Qué sentido tiene lo que hacemos, qué hay detrás de una decisión, qué dice una época sobre las personas.",
          childhoodMemories: "De chico me quedaba pensando cosas que a otros les parecían demasiado grandes: la muerte, Dios, la justicia, por qué la gente sufría, por qué algunos caminos tenían sentido y otros no.",
          earlyFascinations: "Me fascinaban la filosofía, la religión, la historia profunda, las biografías, las conversaciones largas donde alguien intentaba entender la vida y no sólo contar datos.",
          meaningfulSchoolSubjects: "Me gustaban literatura, filosofía, historia, ética y cualquier materia donde se pudiera interpretar, no sólo repetir información.",
          repeatedWorkPatterns: "En trabajos o grupos termino tratando de entender el marco más amplio. No me alcanza con saber qué hay que hacer; necesito entender para qué, desde dónde y con qué sentido.",
          naturalSocialRoles: "Suelo aparecer como el que integra ideas, pone una mirada de fondo o ayuda a darle sentido a algo que estaba suelto.",
          lossesOrRenunciations: "Fui dejando esa parte porque parece poco práctica. En el mercado muchas veces no sabés dónde poner una capacidad así sin que suene abstracta o inútil.",
          whatFeelsCompressedNow: "Siento que mi capacidad de síntesis y sentido está viva, pero sin espacio claro. La uso en conversaciones, lecturas o pensamientos sueltos, no como camino.",
          restrictions: "Necesito sostenerme económicamente y no puedo vivir sólo de pensar. Me cuesta encontrar una forma concreta de canalizar esto.",
          assets: "Tengo profundidad reflexiva, capacidad de integrar ideas, lectura simbólica, sensibilidad ética y facilidad para ordenar preguntas grandes.",
          additionalContext: "No es curiosidad por muchos temas solamente. Lo central es unirlos para encontrar sentido, marco, dirección o comprensión profunda.",
        },
      } as any,
    },
    {
      id: "voc_human_17_cuidado_invisible",
      label: "Voc H17 — La persona que cuida cuando nadie mira",
      expectation: "Debería tender a clear_direction con care_healer y no confundirse con empathic_guide, porque el cuidado aparece como sostén concreto y prolongado, no sólo escucha o clarificación.",
      payload: {
        narrative: {
          currentSituation: "En mi vida terminé cuidando mucho. Familiares, amigos, compañeros, gente que se rompe y necesita que alguien esté. No es sólo escuchar un rato; muchas veces es acompañar procesos largos.",
          childhoodMemories: "De chico me preocupaba si alguien estaba enfermo, triste o solo. Era de acercarme, traer algo, preguntar, quedarme cerca.",
          earlyFascinations: "Me llamaban la atención las personas que podían cuidar bien: enfermeros, médicos, terapeutas, cuidadores, gente que no sólo habla sino que sostiene de verdad.",
          meaningfulSchoolSubjects: "Me interesaban biología, psicología cuando había, educación para la salud, y también actividades solidarias o de ayuda concreta.",
          repeatedWorkPatterns: "En trabajos, familia o vínculos suelo terminar detectando quién necesita apoyo, quién está sobrepasado, qué hay que hacer para que alguien no se caiga.",
          naturalSocialRoles: "Soy quien sostiene, acompaña, organiza cuidados, está pendiente y hace cosas concretas cuando alguien no puede solo.",
          lossesOrRenunciations: "Cuidar me dio sentido, pero también me quemó. Muchas veces quedó invisible, como si fuera una obligación natural y no una capacidad.",
          whatFeelsCompressedNow: "Siento que mi orientación al cuidado está viva, pero desgastada. Necesitaría un cauce donde no sea sólo sacrificarme por otros.",
          restrictions: "Tengo responsabilidades y no puedo meterme en una formación larga sin pensar ingresos. También necesito aprender a no cargar con todo.",
          assets: "Tengo paciencia, presencia, responsabilidad, sensibilidad para detectar necesidad y capacidad de sostener procesos humanos concretos.",
          additionalContext: "No es sólo que la gente me habla y yo escucho. Lo central es cuidado práctico, presencia sostenida y reparación en procesos largos.",
        },
      } as any,
    },
    {
      id: "voc_human_18_organizador_sin_glamour",
      label: "Voc H18 — El que hace que las cosas pasen",
      expectation: "Debería tender a clear_direction con operational_organizer y no confundirse con technical_builder, porque el foco está en ordenar tareas, tiempos y ejecución, no en armar o reparar sistemas técnicos.",
      payload: {
        narrative: {
          currentSituation: "No soy el de la gran idea ni el del discurso. Soy el que hace que las cosas pasen: horario, lista, prioridad, quién hace qué, qué falta, qué se cayó.",
          childhoodMemories: "De chico organizaba juegos, repartía tareas, avisaba quién tenía que traer qué, o me molestaba cuando todo quedaba en palabras y nadie hacía nada.",
          earlyFascinations: "Me llamaban la atención las personas prácticas, las que podían ordenar un evento, una mudanza, un equipo, una cocina, una actividad. Eso de que algo salga gracias a una buena organización.",
          meaningfulSchoolSubjects: "Me iba mejor en actividades con pasos claros, proyectos, organización de grupos, trabajos donde había que planificar y cumplir.",
          repeatedWorkPatterns: "En trabajos o grupos termino armando listas, viendo prioridades, acomodando tiempos, repartiendo tareas y haciendo seguimiento para que no se pierda nada.",
          naturalSocialRoles: "Suelo aparecer como el que ordena la ejecución. No siempre me gusta, pero si no lo hago yo, muchas veces todo queda flotando.",
          lossesOrRenunciations: "Esa capacidad no tiene mucho glamour. Se nota cuando falta, pero cuando está parece que simplemente las cosas salieron solas.",
          whatFeelsCompressedNow: "Siento que mi capacidad de organizar está usada para sostener urgencias, pero podría servir en proyectos más importantes o mejor armados.",
          restrictions: "Necesito estabilidad. También me cuesta que me encajen siempre en el rol de resolver lo operativo sin reconocer el valor que tiene.",
          assets: "Tengo orden, seguimiento, sentido de prioridad, constancia y capacidad para convertir una idea en pasos concretos.",
          additionalContext: "No es principalmente técnico ni de reparar cosas. Lo central es coordinación operativa, ritmo, prioridades y ejecución.",
        },
      } as any,
    },
    {
      id: "voc_human_19_oficio_tapado",
      label: "Voc H19 — El oficio que fue tratado como menos",
      expectation: "Debería tender a clear_direction con material_maker y no confundirse con technical_builder, porque la señal central es transformación material, oficio, detalle y trabajo con las manos.",
      payload: {
        narrative: {
          currentSituation: "Hoy trabajo en algo más de oficina o de supervivencia, pero cuando hago algo con las manos me cambia el ánimo. Arreglar, lijar, pintar, construir, dejar algo mejor que como estaba.",
          childhoodMemories: "De chico me gustaba tocar materiales, armar cosas, desarmar, ensuciarme, probar. Podía estar horas con madera, pintura, herramientas o cualquier cosa que se pudiera transformar.",
          earlyFascinations: "Me fascinaban los talleres, los artesanos, la gente que hacía muebles, arreglaba objetos o convertía algo feo en algo cuidado.",
          meaningfulSchoolSubjects: "Me gustaban las actividades prácticas, plástica, taller, tecnología, cualquier cosa donde hubiera que hacer algo concreto y no solamente hablar.",
          repeatedWorkPatterns: "En mi casa, con amigos o en trabajos termino arreglando, acomodando, mejorando espacios o resolviendo cosas materiales. Me cuesta dejar algo mal terminado.",
          naturalSocialRoles: "Soy la persona a la que le piden ayuda para arreglar, montar, pintar, fabricar o mejorar algo concreto.",
          lossesOrRenunciations: "Fui dejando esa parte porque siempre parecía menos seria que estudiar o trabajar en una oficina. Me hicieron sentir que el oficio era poca cosa.",
          whatFeelsCompressedNow: "Siento que mi relación con lo material está viva, pero tapada por una vida que me empuja a cosas más abstractas o administrativas.",
          restrictions: "No puedo largar todo para empezar un taller sin ingresos. Me falta espacio, herramientas, contactos y una forma realista de probar.",
          assets: "Tengo paciencia, precisión, gusto por el detalle, habilidad manual y satisfacción cuando transformo algo concreto.",
          additionalContext: "No es sólo resolver una falla técnica. Lo central es hacer, transformar materia, trabajar con las manos y cuidar el acabado.",
        },
      } as any,
    },
    {
      id: "voc_human_20_sensibilidad_ambiental_sin_camino",
      label: "Voc H20 — La preocupación por la tierra que no encontró camino",
      expectation: "Debería tender a clear_direction con environmental_steward y no confundirse con civic_advocate, porque la causa está ligada a naturaleza, animales, territorio y cuidado ambiental antes que a conflicto público general.",
      payload: {
        narrative: {
          currentSituation: "Me importa mucho la tierra, los animales, el agua, los lugares. No como moda ni discurso lindo. Me pasa de verdad. Pero nunca supe cómo convertir eso en una vida posible.",
          childhoodMemories: "De chico me quedaba mirando animales, plantas, ríos, bichos. Me dolía cuando veía basura, maltrato animal o lugares arruinados.",
          earlyFascinations: "Me fascinaban los documentales de naturaleza, los viveros, el campo, los animales, la gente que trabajaba con la tierra o cuidaba espacios naturales.",
          meaningfulSchoolSubjects: "Me gustaban biología, geografía, ciencias naturales y cualquier actividad al aire libre o vinculada con ambiente.",
          repeatedWorkPatterns: "En grupos o conversaciones termino siendo quien señala el desperdicio, el maltrato, el descuido de recursos o la necesidad de hacer algo más responsable.",
          naturalSocialRoles: "Suelo aparecer como alguien que cuida el entorno, que se fija en lo vivo, que se preocupa por lo que otros naturalizan.",
          lossesOrRenunciations: "Como no soy biólogo, ingeniero ambiental ni activista de tiempo completo, esa parte quedó como preocupación personal y no como camino.",
          whatFeelsCompressedNow: "Siento que mi sensibilidad por lo ambiental está viva pero sin cauce. Me importa, pero no sé dónde ponerlo de forma útil.",
          restrictions: "Necesito trabajar y no puedo mudarme al campo ni estudiar otra carrera larga de golpe. También me cuesta encontrar oportunidades reales cerca.",
          assets: "Tengo sensibilidad ambiental, constancia, observación, preocupación por lo vivo y ganas de participar en algo que cuide recursos o territorio.",
          additionalContext: "No es sólo indignación política. Lo central es la relación con naturaleza, tierra, animales, recursos y cuidado del entorno vivo.",
        },
      } as any,
    },
    {
      id: "voc_human_21_performer_autocensurado",
      label: "Voc H21 — La persona de escenario que se autocensuró",
      expectation: "Debería tender a clear_direction con performer y no confundirse con public_communicator sólo porque aparece hablar frente a otros.",
      payload: {
        narrative: {
          currentSituation: "Hoy estoy en una vida bastante normal, con trabajo y obligaciones, pero cada vez que tengo que presentar algo, actuar un poco, hablar frente a gente o poner el cuerpo, se me despierta una energía que no aparece en otros lugares.",
          childhoodMemories: "De chico me gustaba actuar, imitar voces, inventar personajes, hacer reír, cantar o ponerme en el centro cuando había algún juego o acto escolar. Después me fui apagando por vergüenza.",
          earlyFascinations: "Me fascinaban los actores, los músicos en vivo, los conductores, la gente que podía sostener una escena y cambiar el clima de un lugar con presencia.",
          meaningfulSchoolSubjects: "Me gustaban teatro, música, actos escolares, exposiciones orales y cualquier actividad donde hubiera que poner el cuerpo o la voz frente a otros.",
          repeatedWorkPatterns: "Aunque no sea mi trabajo formal, termino apareciendo cuando hay que presentar, animar, explicar frente a un grupo o darle vida a algo que estaba muy plano.",
          naturalSocialRoles: "Suelo ser quien puede levantar un clima, poner energía, hacer una presentación más llevadera o animarse a decir algo en voz alta cuando otros se esconden.",
          lossesOrRenunciations: "Fui dejando esa parte porque me dio vergüenza, porque me dijeron que no era serio o porque sentí que ya era tarde para tomarlo en serio.",
          whatFeelsCompressedNow: "Siento que mi parte escénica está viva pero autocensurada. Aparece en momentos puntuales y después la vuelvo a guardar.",
          restrictions: "No puedo largar todo para probar suerte en actuación o música sin ninguna base. También me pesa la edad, la mirada ajena y el miedo al ridículo.",
          assets: "Tengo presencia, expresividad, energía corporal, voz, capacidad para captar la atención y cierta facilidad para cambiar el clima de un espacio.",
          additionalContext: "No es principalmente opinar sobre temas públicos. Lo central es escena, presencia, cuerpo, voz, actuación o performance frente a otros.",
        },
      } as any,
    },
    {
      id: "voc_human_22_anfitrion_de_experiencias",
      label: "Voc H22 — El anfitrión que piensa el clima completo",
      expectation: "Debería tender a clear_direction con experience_host y no confundirse con community_builder sólo porque le interesa reunir personas.",
      payload: {
        narrative: {
          currentSituation: "Trabajo en algo común, pero cada vez que organizo una reunión, una comida, un espacio o una actividad, me engancho pensando cómo se va a sentir la gente al llegar, estar y recordar eso después.",
          childhoodMemories: "De chico me gustaba preparar cosas para otros: ordenar la mesa, pensar juegos, acomodar el lugar, recibir amigos o hacer que una visita se sintiera cómoda.",
          earlyFascinations: "Me fascinaban los lugares bien armados, los hoteles, restaurantes, eventos, casas donde todo tenía clima. No sólo lo lindo, sino la sensación que te dejaba estar ahí.",
          meaningfulSchoolSubjects: "Me gustaban actividades donde hubiera que organizar muestras, actos, encuentros o presentaciones. También arte, diseño o cualquier cosa relacionada con experiencia y ambiente.",
          repeatedWorkPatterns: "En grupos termino viendo qué falta para que algo se sienta mejor: la bienvenida, el orden, el recorrido, los detalles, quién quedó incómodo o qué parte de la experiencia está floja.",
          naturalSocialRoles: "Suelo aparecer como quien cuida el ambiente, los detalles y la comodidad de otros. No necesariamente armo comunidad a largo plazo, pero sí hago que una experiencia funcione y se sienta bien.",
          lossesOrRenunciations: "Esa capacidad quedó siempre como algo doméstico o informal. Me dicen que soy buen anfitrión o que tengo ojo, pero no lo vi como camino posible.",
          whatFeelsCompressedNow: "Siento que mi sensibilidad para crear experiencias está subutilizada. Aparece en encuentros chicos, pero no como algo profesional o más grande.",
          restrictions: "No tengo formación formal en eventos, diseño o turismo. Tampoco puedo invertir plata en algo propio sin probar de a poco.",
          assets: "Tengo sensibilidad para clima, detalles, recorrido, trato humano, estética práctica y capacidad para pensar cómo se siente una experiencia.",
          additionalContext: "No es sólo juntar gente ni sostener comunidad. Lo central es diseñar una experiencia: ambiente, bienvenida, detalles, recorrido y sensación final.",
        },
      } as any,
    },
    {
      id: "voc_human_23_protector_que_reacciona",
      label: "Voc H23 — El que no puede mirar para otro lado",
      expectation: "Debería tender a clear_direction con protector_responder y no confundirse con civic_advocate sólo porque aparece injusticia o reclamo.",
      payload: {
        narrative: {
          currentSituation: "Me pasa que cuando veo a alguien expuesto, maltratado o en peligro, me cuesta quedarme quieto. A veces reacciono rápido, incluso demasiado, pero siento que si nadie hace nada todo sigue igual.",
          childhoodMemories: "De chico saltaba cuando veía que molestaban a alguien, cuando un animal sufría o cuando un adulto se pasaba con otro. No siempre medía consecuencias.",
          earlyFascinations: "Me llamaban la atención bomberos, rescatistas, policías bien entendidos, guardavidas, gente que aparece cuando algo se complica y protege a otros.",
          meaningfulSchoolSubjects: "Me interesaban educación física, actividades de primeros auxilios, formación ciudadana, defensa personal o cualquier cosa vinculada con acción y protección.",
          repeatedWorkPatterns: "En trabajos o grupos suelo reaccionar cuando alguien queda solo, cuando hay abuso o cuando una situación se está yendo de las manos. No soy de mirar desde afuera.",
          naturalSocialRoles: "Suelo aparecer como quien interviene, protege, pone el cuerpo o corta una situación injusta antes de que empeore.",
          lossesOrRenunciations: "Fui reprimiendo esa parte porque a veces me trajo problemas o me dejó como conflictivo. Entonces aprendí a callarme más de lo que quisiera.",
          whatFeelsCompressedNow: "Siento que mi impulso protector está vivo pero medio mal ubicado. Sale como bronca o reacción, cuando podría tener un cauce más útil.",
          restrictions: "Necesito estabilidad y no puedo meterme en cualquier conflicto. También tengo que aprender a actuar con más cabeza y menos impulso.",
          assets: "Tengo coraje, reacción rápida, sensibilidad ante el abuso, disposición a intervenir y capacidad de sostener tensión cuando otros se paralizan.",
          additionalContext: "No es sólo militancia o causa pública. Lo central es proteger, responder ante una situación concreta y poner el cuerpo cuando alguien queda vulnerable.",
        },
      } as any,
    },
    {
      id: "voc_human_24_investigador_sin_laboratorio",
      label: "Voc H24 — El investigador sin laboratorio",
      expectation: "Debería tender a clear_direction con scientific_investigator y no confundirse con analytical_strategist sólo porque compara información.",
      payload: {
        narrative: {
          currentSituation: "Trabajo en algo que no siempre me permite investigar, pero cuando aparece una duda me obsesiona comprobar, buscar datos, comparar fuentes y entender si algo es cierto o no.",
          childhoodMemories: "De chico desarmaba preguntas. Quería saber por qué pasaban las cosas, cómo funcionaba algo, si lo que me decían era verdad. A veces era insoportable preguntando.",
          earlyFascinations: "Me fascinaban los experimentos, los documentales, los científicos, las investigaciones policiales o médicas, cualquier proceso donde alguien buscaba evidencia real.",
          meaningfulSchoolSubjects: "Me gustaban ciencias naturales, biología, química, física, matemática cuando había razonamiento, y también trabajos de investigación donde había que demostrar algo.",
          repeatedWorkPatterns: "En grupos o trabajos termino chequeando datos, buscando fuentes, corrigiendo suposiciones o diciendo que falta evidencia antes de decidir.",
          naturalSocialRoles: "Suelo ser quien pregunta de dónde salió un dato, qué prueba hay, qué falta comprobar o si no estamos comprando una idea demasiado rápido.",
          lossesOrRenunciations: "Como no seguí una carrera científica formal, esa parte quedó medio como hobby raro. Investigo por mi cuenta, pero sin un espacio donde eso sea reconocido.",
          whatFeelsCompressedNow: "Siento que mi impulso de investigación está vivo, pero sin laboratorio ni comunidad. Lo uso en discusiones o búsquedas sueltas, no como camino.",
          restrictions: "No puedo empezar una carrera larga desde cero sin pensar en ingresos. También me falta saber dónde puede valer esta forma de mirar fuera de la academia.",
          assets: "Tengo curiosidad rigurosa, paciencia para buscar, criterio para contrastar fuentes, necesidad de evidencia y gusto por entender causas reales.",
          additionalContext: "No es sólo estrategia o decisión. Lo central es investigar, comprobar, validar evidencia y no quedarse con opiniones rápidas.",
        },
      } as any,
    },
    {
      id: "voc_human_25_juez_de_criterio",
      label: "Voc H25 — El que no soporta evaluar mal",
      expectation: "Debería tender a clear_direction con precision_judgment_operator y no confundirse con analytical_strategist, porque la señal central es criterio normativo, justicia, evaluación y aplicación correcta de estándares.",
      payload: {
        narrative: {
          currentSituation: "En mi trabajo y en la vida me pasa que me molesta mucho cuando algo se evalúa mal, cuando se decide por simpatía, acomodo, apuro o puro capricho.",
          childhoodMemories: "De chico me enojaba cuando las reglas se aplicaban distinto para unos y otros. No era sólo querer tener razón; me molestaba la injusticia o la arbitrariedad.",
          earlyFascinations: "Me llamaban la atención los jueces, árbitros, docentes justos, inspectores, evaluadores, gente que podía mirar un caso y aplicar un criterio claro.",
          meaningfulSchoolSubjects: "Me interesaban materias donde había reglas, argumentos, análisis de casos, lógica, ética, derecho o evaluación con criterios precisos.",
          repeatedWorkPatterns: "En trabajos o grupos suelo detectar cuando algo está mal medido, mal aplicado o decidido sin fundamento. A veces eso me deja como pesado, pero después se ve que había un problema.",
          naturalSocialRoles: "Suelo aparecer como quien pide criterio, regla clara, evidencia o coherencia. No me gusta decidir a ojo si hay algo importante en juego.",
          lossesOrRenunciations: "Fui aprendiendo a callarme porque muchas veces molesta. Te dicen que sos rompebolas o demasiado exigente, cuando para mí se trata de hacer las cosas bien.",
          whatFeelsCompressedNow: "Siento que mi capacidad de evaluación está viva pero mal vista. La uso para corregir errores, no en un lugar donde ese criterio sea realmente valorado.",
          restrictions: "Necesito encontrar un cauce donde esta forma de mirar no me deje aislado. Tampoco quiero volverme rígido o vivir discutiendo todo.",
          assets: "Tengo criterio, atención a reglas, sensibilidad por justicia, capacidad de evaluar casos y detectar incoherencias o aplicaciones flojas.",
          additionalContext: "No es sólo análisis general de escenarios. Lo central es evaluar con precisión, aplicar criterios, cuidar estándares y distinguir lo justo de lo arbitrario.",
        },
      } as any,
    },
    {
      id: "voc_human_26_cuidador_de_recursos",
      label: "Voc H26 — El que evita desastres que nadie nota",
      expectation: "Debería tender a clear_direction con resource_steward y no confundirse con operational_organizer sólo porque ordena tareas y recursos.",
      payload: {
        narrative: {
          currentSituation: "En mi casa, en trabajos o en grupos, termino cuidando que alcance: plata, comida, materiales, tiempo, energía. No es glamoroso, pero alguien tiene que mirar que no se desperdicie todo.",
          childhoodMemories: "De chico me fijaba si algo se gastaba de más, si había que guardar para después, si convenía cuidar una cosa para que durara. A veces parecía demasiado serio para mi edad.",
          earlyFascinations: "Me llamaban la atención las personas que administraban bien, las familias que se organizaban, los lugares donde nada sobraba pero todo alcanzaba porque alguien cuidaba.",
          meaningfulSchoolSubjects: "Me interesaban economía doméstica si aparecía, matemática práctica, administración, actividades donde había que repartir, calcular o planificar recursos.",
          repeatedWorkPatterns: "En distintos espacios termino viendo qué se está gastando al pedo, qué falta prever, qué recurso se puede usar mejor o qué decisión puede evitar un problema futuro.",
          naturalSocialRoles: "Suelo ser quien cuida el fondo, quien pregunta si alcanza, quien previene el desorden antes de que se note.",
          lossesOrRenunciations: "Eso casi nunca se reconoce. Si todo alcanza, parece magia. Si falta, recién ahí preguntan qué pasó. Me cansé de que prevenir no tenga valor visible.",
          whatFeelsCompressedNow: "Siento que mi capacidad de cuidar recursos está usada en modo supervivencia, no en proyectos donde pueda tener más peso.",
          restrictions: "Necesito estabilidad y no puedo arriesgar demasiado. También me cuesta entrar en áreas de administración formal sin credenciales específicas.",
          assets: "Tengo responsabilidad, prevención, criterio de ahorro, lectura de recursos, paciencia para sostener y capacidad para evitar desastres silenciosos.",
          additionalContext: "No es sólo organizar tareas. Lo central es custodiar recursos, prevenir pérdidas y administrar lo que permite que algo siga funcionando.",
        },
      } as any,
    },
    {
      id: "voc_human_27_hibrido_sin_etiqueta",
      label: "Voc H27 — El que siente que elegir una etiqueta lo mutila",
      expectation: "Debería tender a clear_direction con hybrid_integrator o abrir frontera de integración, sin forzar una sola familia por keywords aisladas.",
      payload: {
        narrative: {
          currentSituation: "Me cuesta mucho explicar qué soy. Tengo una parte comunicadora, una parte analítica, una parte humana y otra bastante política o social. Cuando tengo que elegir una etiqueta, siento que me mutilo.",
          childhoodMemories: "De chico podía pasar de escribir algo a discutir una idea, ayudar a alguien con un problema o tratar de entender una pelea entre adultos. No lo vivía separado.",
          earlyFascinations: "Me fascinaban las personas que podían unir mundos: comunicación, política, pensamiento, ayuda humana, organización. Gente que no entraba fácil en una sola caja.",
          meaningfulSchoolSubjects: "Me gustaban historia, literatura, formación cívica, psicología cuando había, y también actividades donde había que hablar, escribir o conectar ideas.",
          repeatedWorkPatterns: "En trabajos o grupos termino haciendo mezcla: ordeno una discusión, escribo algo, leo personas, pienso estrategia, conecto gente o detecto un tema importante.",
          naturalSocialRoles: "Suelo aparecer como alguien que cruza registros. Puedo hablar con perfiles distintos, bajar una idea, leer tensión humana y construir una mirada.",
          lossesOrRenunciations: "Muchas veces me adapté a una sola parte de mí porque era lo que el trabajo pedía. Entonces quedaba afuera todo lo demás.",
          whatFeelsCompressedNow: "Siento que mi mezcla está viva pero desordenada. No quiero usarla como excusa para no elegir nada, pero tampoco quiero partirme en pedazos.",
          restrictions: "Necesito una salida realista. No puedo inventarme una identidad profesional imposible de explicar ni depender de que otros entiendan mi mezcla de entrada.",
          assets: "Tengo versatilidad, lectura social, voz, criterio, capacidad de conectar ideas y facilidad para moverme entre mundos distintos.",
          additionalContext: "No conviene leer este caso por una sola palabra. La señal fuerte es integración de varias afinidades, no dispersión vacía ni indecisión simple.",
        },
      } as any,
    },
    {
      id: "voc_human_28_buscador_sin_crisis",
      label: "Voc H28 — El que no está mal, pero quiere algo más",
      expectation: "Debería tender a clear_direction o exploración positiva con señales de expansive_curiosity y no confundirse con compressed_life o desalineación dolorosa.",
      payload: {
        narrative: {
          currentSituation: "No estoy mal. Mi vida funciona bastante, tengo cierta estabilidad y no vengo desde una crisis. Pero hay una parte mía que quiere mirar más, entender si estoy usando lo que tengo o si hay otra capa posible.",
          childhoodMemories: "De chico era curioso y me gustaba probar cosas distintas. No desde angustia, sino por ganas de descubrir qué podía hacer o qué me interesaba.",
          earlyFascinations: "Me fascinaba ver gente que se reinventaba, aprendía cosas nuevas o encontraba caminos inesperados sin necesariamente estar rota.",
          meaningfulSchoolSubjects: "Me gustaban varias materias y actividades, sobre todo cuando me permitían explorar posibilidades: arte, historia, comunicación, tecnología, deporte, según la etapa.",
          repeatedWorkPatterns: "En mi vida suelo funcionar bien, pero cada tanto aparece la pregunta de si estoy jugando demasiado seguro o si hay algo que todavía no desplegué.",
          naturalSocialRoles: "Suelo aparecer como alguien estable, responsable, pero también inquieto. No busco romper todo, sino entender mejor por dónde crecer.",
          lossesOrRenunciations: "No siento una gran renuncia dramática, pero sí pequeñas partes que fui dejando en pausa porque la vida funcionaba y no había urgencia de mirarlas.",
          whatFeelsCompressedNow: "Más que comprimido, siento algo no desplegado. Como si hubiera potencial esperando una forma más clara.",
          restrictions: "No quiero desarmar una vida que funciona. Tengo responsabilidades y tampoco necesito una épica de cambio. Quiero explorar con inteligencia.",
          assets: "Tengo estabilidad, curiosidad, disposición a aprender, responsabilidad y energía para abrir una nueva capa sin negar lo construido.",
          additionalContext: "No debe leerse como dolor vocacional fuerte. Es una entrada por expansión, curiosidad y refinamiento de dirección, no por crisis.",
        },
      } as any,
    },
    {
      id: "voc_human_29_oportunidad_que_no_llega",
      label: "Voc H29 — El que nunca tuvo una puerta decente",
      expectation: "Debería tender a compressed_life o frontier diagnosis con familia dependiente de señales secundarias, y no confundirse con falta de agencia o baja motivación.",
      payload: {
        narrative: {
          currentSituation: "Siento que hay algo que me sale, pero nunca se me abre una puerta. No tengo el contacto, no tengo el título justo, no estoy en el lugar indicado o siempre llego tarde.",
          childhoodMemories: "De chico había cosas que me salían fácil, pero no siempre tuve adultos o espacios que ayudaran a llevar eso más lejos. Muchas veces era sólo arreglate como puedas.",
          earlyFascinations: "Me interesaban varias cosas, pero casi siempre desde afuera. Miraba gente haciendo lo que a mí me hubiera gustado probar y sentía que eso era para otros.",
          meaningfulSchoolSubjects: "Me gustaban materias o actividades donde podía mostrar algo propio, pero no tuve demasiada orientación para transformar eso en camino.",
          repeatedWorkPatterns: "En trabajos o grupos aparece mi capacidad, pero en pedazos. Ayudo, resuelvo, pienso, creo, acompaño, pero nunca se convierte en una oportunidad real.",
          naturalSocialRoles: "Suelo ser quien aporta desde atrás, quien tiene algo para dar, pero no siempre encuentra el lugar donde eso sea visto o tomado en serio.",
          lossesOrRenunciations: "Fui dejando de insistir porque cansa golpear puertas que no se abren. A veces uno empieza a pensar que no sirve, aunque en el fondo no está tan seguro de eso.",
          whatFeelsCompressedNow: "Lo que siento comprimido no es sólo una vocación, sino la posibilidad de probarme en serio. Nunca tuve un ecosistema donde ver hasta dónde podía llegar.",
          restrictions: "Me pesan la falta de contactos, plata, tiempo, red, títulos o alguien que me diga por acá puede ser. No quiero inventarme oportunidades que no existen.",
          assets: "Tengo experiencia de vida, resiliencia, algunas capacidades reales que aparecen en distintos contextos y ganas de encontrar una puerta más justa.",
          additionalContext: "Este caso no debe leerse como simple falta de voluntad. El punto central es oportunidad bloqueada o ausente, con identidad golpeada por falta de puerta real.",
        },
      } as any,
    },
    {
      id: "voc_human_30_vida_funcional_no_viva",
      label: "Voc H30 — La vida funciona, pero algo mío no participa",
      expectation: "Debería tender a compressed_life o clear_direction según señales dominantes posteriores, y no confundirse con insatisfacción genérica sin densidad vocacional.",
      payload: {
        narrative: {
          currentSituation: "Mi vida funciona. Pago cosas, cumplo, respondo, hago lo que hay que hacer. Pero no la siento viva. No me pasa nada demasiado grave, y eso también me confunde, porque no tengo una excusa clara para quejarme.",
          childhoodMemories: "De chico había partes mías más despiertas: curiosidad, ganas de crear, de moverme, de hablar, de aprender o de estar con otros. No sé exactamente cuál era la principal, pero había más vida.",
          earlyFascinations: "Me fascinaban distintas cosas según la etapa: personas que hacían algo propio, gente con pasión, lugares donde se respiraba entusiasmo, proyectos que parecían tener sentido.",
          meaningfulSchoolSubjects: "No hubo una sola materia. Me marcaban más los espacios donde sentía participación real, donde podía pensar, crear, hablar o hacer algo con otros.",
          repeatedWorkPatterns: "En trabajos y rutinas termino funcionando bien, pero muchas veces en piloto automático. Resuelvo, cumplo, sostengo, pero algo mío queda mirando desde afuera.",
          naturalSocialRoles: "Suelo ser responsable, confiable, alguien que responde. Pero no siempre aparezco con deseo, iniciativa o entusiasmo real.",
          lossesOrRenunciations: "Fui renunciando de a poco a preguntarme qué quería. Como la vida más o menos funcionaba, dejé de mirar lo que se iba apagando.",
          whatFeelsCompressedNow: "Siento comprimida una parte difícil de nombrar. No sé si es creatividad, voz, comunidad, cuerpo, aprendizaje o todo mezclado. Sólo sé que algo mío no está participando.",
          restrictions: "No puedo tirar mi vida por la borda por una sensación. Tengo responsabilidades, edad, compromisos y miedo de mover algo que más o menos se sostiene.",
          assets: "Tengo responsabilidad, experiencia, capacidad de sostener, cierta lucidez sobre lo que me pasa y ganas de encontrar una dirección sin destruir lo construido.",
          additionalContext: "Este caso necesita explorar más antes de adjudicar con dureza. La señal fuerte es vida funcional pero no viva, con posible capacidad enterrada todavía poco nombrada.",
        },
      } as any,
    },
];

export const HUMAN_LANGUAGE_CASES: EvaluationCase[] = [
  ...SEED_DIAGNOSTIC_CASES,
  ...LEGACY_HUMAN_LANGUAGE_CASES,
].map(normalizeHumanLanguageCase);