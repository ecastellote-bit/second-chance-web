import type { CalibrationCase } from "../calibrationTypes";

export const vocationalCalibrationV03Cases: CalibrationCase[] = [
  {
    id: "V03_01",
    title: "Analytical capacity compressed by urgent firefighting",
    entryMode: "compression",
    focus: "compression_boundary",
    fragments: [
      {
        field: "currentSituation",
        text: "Laburo bien, sí, pero siento que uso lo mejor mío para apagar lo urgente.",
      },
      {
        field: "repeatedWorkPatterns",
        text: "No es que no tenga nada; al revés, sé que hay una parte mía viva.",
      },
      {
        field: "whatFeelsCompressedNow",
        text: "El tema es que hoy sale en modo bombero, no en algo propio.",
      },
    ],
    expectation: {
      resultType: "compressed_life",
      topFamily: "Analytical Strategist",
      rivalFamily: "Technical Builder",
      notes: "criterio comprimido, no mano técnica como gratificación principal",
    },
    tags: ["compression", "analytical_capacity_compressed", "firefighting"],
  },
  {
    id: "V03_02",
    title: "Diffuse malaise without clear family",
    entryMode: "pain",
    focus: "compression_boundary",
    fragments: [
      {
        field: "currentSituation",
        text: "No me veo haciendo esto mucho más.",
      },
      {
        field: "additionalContext",
        text: "No estoy destruido ni nada, pero tampoco me da alegría decir “éste es mi lugar”.",
      },
      {
        field: "whatFeelsCompressedNow",
        text: "Si me preguntás, más que cansado estoy medio desenchufado.",
      },
    ],
    expectation: {
      notes:
        "caso abierto; no debería forzar familia única por superficie de malestar",
    },
    tags: ["meaning_loss", "open_case", "mild_compression"],
  },
  {
    id: "V03_03",
    title: "One to one listening over group movement",
    entryMode: "pain",
    focus: "connector_viability",
    fragments: [
      {
        field: "currentSituation",
        text: "Cuando alguien está pasado de vueltas, me sale escucharlo y ayudar a que baje un cambio.",
      },
      {
        field: "naturalSocialRoles",
        text: "No soy tan de armar grupos ni mover gente.",
      },
      {
        field: "repeatedWorkPatterns",
        text: "Más bien me sirve estar ahí, uno a uno, sin invadir demasiado.",
      },
    ],
    expectation: {
      resultType: "clear_direction",
      topFamily: "Empathic Guide",
      rivalFamily: "Community Builder",
      notes: "foco individual y subjetivo",
    },
    tags: ["one_to_one", "empathic", "guide"],
  },
  {
    id: "V03_04",
    title: "Multi-party bridge with viable energy",
    entryMode: "compression",
    focus: "connector_viability",
    fragments: [
      {
        field: "currentSituation",
        text: "Quedo bastante en el medio cuando hay gente cruzada.",
      },
      {
        field: "repeatedWorkPatterns",
        text: "Hablo con uno, con otro, acomodo un poco y destrabo.",
      },
      {
        field: "additionalContext",
        text: "No sé si me gusta el quilombo, pero la verdad es que ahí hago diferencia.",
      },
    ],
    expectation: {
      resultType: "clear_direction",
      topFamily: "Diplomatic Social Connector",
      rivalFamily: "Empathic Guide",
      notes: "multiparte y puente, no acompañamiento íntimo",
    },
    tags: ["multi_actor", "connector", "viable"],
  },
  {
    id: "V03_05",
    title: "Collective continuity with limited but living energy",
    entryMode: "compression",
    focus: "connector_viability",
    fragments: [
      {
        field: "repeatedWorkPatterns",
        text: "Siempre termino juntando gente para que no se caiga el espacio.",
      },
      {
        field: "naturalSocialRoles",
        text: "Si no empujo yo, se enfría.",
      },
      {
        field: "whatFeelsCompressedNow",
        text: "Lo colectivo me tira, aunque hoy no tenga tanto resto para sostenerlo como quisiera.",
      },
    ],
    expectation: {
      resultType: "clear_direction",
      topFamily: "Community Builder",
      rivalFamily: "Diplomatic Social Connector",
      notes: "continuidad grupal, no destrabe puntual entre partes",
    },
    tags: ["group_continuity", "community", "manageable_restriction"],
  },
  {
    id: "V03_06",
    title: "One to one clarifier explicitly suppressing connector",
    entryMode: "pain",
    focus: "connector_viability",
    fragments: [
      {
        field: "naturalSocialRoles",
        text: "La gente me termina contando cosas y yo suelo ayudar a poner un poco de orden.",
      },
      {
        field: "additionalContext",
        text: "No hago de puente entre sectores ni nada de eso.",
      },
      {
        field: "repeatedWorkPatterns",
        text: "Es más chico, más de estar bien con uno.",
      },
    ],
    expectation: {
      resultType: "clear_direction",
      topFamily: "Empathic Guide",
      rivalFamily: "Diplomatic Social Connector",
      notes: "suprime explícitamente el rival",
    },
    tags: ["one_to_one", "guide", "rival_suppression"],
  },
  {
    id: "V03_07",
    title: "Structure first, execution second",
    entryMode: "curiosity",
    focus: "strategy_vs_narrative",
    fragments: [
      {
        field: "repeatedWorkPatterns",
        text: "Me sale mirar por qué algo está mal armado.",
      },
      {
        field: "additionalContext",
        text: "No disfruto tanto meter mano y salir corriendo.",
      },
      {
        field: "currentSituation",
        text: "Prefiero entender la lógica y recién ahí pensar por dónde conviene.",
      },
    ],
    expectation: {
      resultType: "clear_direction",
      topFamily: "Analytical Strategist",
      rivalFamily: "Technical Builder",
      notes: "estructura y criterio antes que resolución concreta",
    },
    tags: ["structure", "analysis", "strategist"],
  },
  {
    id: "V03_08",
    title: "Execution first, model second",
    entryMode: "curiosity",
    focus: "strategy_vs_narrative",
    fragments: [
      {
        field: "repeatedWorkPatterns",
        text: "Cuando algo falla, yo meto mano hasta dejarlo andando.",
      },
      {
        field: "additionalContext",
        text: "No me quedo tan enganchado con el modelo de fondo.",
      },
      {
        field: "currentSituation",
        text: "Me importa más que funcione.",
      },
    ],
    expectation: {
      resultType: "clear_direction",
      topFamily: "Technical Builder",
      rivalFamily: "Analytical Strategist",
      notes: "ejecución y arreglo como centro",
    },
    tags: ["execution", "technical", "builder"],
  },
  {
    id: "V03_09",
    title: "Public stance with partially buried voice",
    entryMode: "compression",
    focus: "public_vs_narrative",
    fragments: [
      {
        field: "currentSituation",
        text: "Cuando un tema me importa, me sale ordenarlo y decirlo claro.",
      },
      {
        field: "repeatedWorkPatterns",
        text: "No escribo solo por escribir; necesito bajar una postura.",
      },
      {
        field: "whatFeelsCompressedNow",
        text: "El tema es que hoy eso aparece de a ratos nomás.",
      },
    ],
    expectation: {
      resultType: "clear_direction",
      topFamily: "Public Communicator",
      rivalFamily: "Creative Storyteller",
      notes: "postura y asunto colectivo con compresión manejable",
    },
    tags: ["public_expression", "stance", "manageable_compression"],
  },
  {
    id: "V03_10",
    title: "Narrative form without desire for public front",
    entryMode: "expansion",
    focus: "public_vs_narrative",
    fragments: [
      {
        field: "repeatedWorkPatterns",
        text: "Escribo bastante y le encuentro la vuelta a casi todo, pero no sé si quiero estar yo al frente.",
      },
      {
        field: "additionalContext",
        text: "Me interesa más darle forma que ocupar la voz.",
      },
      {
        field: "currentSituation",
        text: "Ahí siento algo bastante mío.",
      },
    ],
    expectation: {
      resultType: "clear_direction",
      topFamily: "Creative Storyteller",
      rivalFamily: "Public Communicator",
      notes: "forma y narración, no toma de palabra pública",
    },
    tags: ["narrative_form", "creative", "not_public_front"],
  },
  {
    id: "V03_11",
    title: "Formal structure navigation over human mediation",
    entryMode: "curiosity",
    focus: "connector_viability",
    fragments: [
      {
        field: "repeatedWorkPatterns",
        text: "Sé con quién hablar y por dónde empujar sin chocar al pedo.",
      },
      {
        field: "additionalContext",
        text: "No es tanto mediar emociones como moverme bien dentro de una estructura.",
      },
      {
        field: "naturalSocialRoles",
        text: "Eso me sale bastante natural.",
      },
    ],
    expectation: {
      resultType: "clear_direction",
      topFamily: "Institutional Operator",
      rivalFamily: "Diplomatic Social Connector",
      notes: "marco formal como objeto del relato",
    },
    tags: ["institutional_navigation", "formal_structure", "operator"],
  },
  {
    id: "V03_12",
    title: "Compressed connector in automatic pilot",
    entryMode: "compression",
    focus: "connector_viability",
    fragments: [
      {
        field: "repeatedWorkPatterns",
        text: "Siempre termino destrabando gente, áreas o situaciones, pero honestamente ya medio en piloto automático.",
      },
      {
        field: "whatFeelsCompressedNow",
        text: "Lo hago porque si no se empasta todo, no porque me esté desplegando yo.",
      },
      {
        field: "additionalContext",
        text: "Eso me drena bastante.",
      },
    ],
    expectation: {
      resultType: "compressed_life",
      topFamily: "Diplomatic Social Connector",
      rivalFamily: "Institutional Operator",
      notes: "multiparte humana con uso defensivo",
    },
    tags: ["connector", "compressed", "defensive_use"],
  },
  {
    id: "V03_13",
    title: "Prudent transition with living line",
    entryMode: "compression",
    focus: "compression_boundary",
    fragments: [
      {
        field: "currentSituation",
        text: "No es que quiera tirar todo por la ventana.",
      },
      {
        field: "whatFeelsCompressedNow",
        text: "Veo una punta, pero hoy necesito cuidar ingresos y moverme despacio.",
      },
      {
        field: "additionalContext",
        text: "Hay algo, no está muerto, pero tampoco me da para una épica.",
      },
    ],
    expectation: {
      resultType: "clear_direction",
      notes: "calibración de compresión manejable; hay margen, no captura total",
    },
    tags: ["manageable_compression", "prudent_transition", "income_care"],
  },
  {
    id: "V03_14",
    title: "Buried capacity under work, bills and exhaustion",
    entryMode: "compression",
    focus: "compression_boundary",
    fragments: [
      {
        field: "whatFeelsCompressedNow",
        text: "Lo mío quedó tapado abajo de laburo, cuentas y cansancio.",
      },
      {
        field: "additionalContext",
        text: "Aparece, sí, pero en ratos sueltos, cuando ya estoy fundido.",
      },
      {
        field: "currentSituation",
        text: "No siento que esté jugando de verdad lo que tengo.",
      },
    ],
    expectation: {
      resultType: "compressed_life",
      notes: "sacrificio estructural con buried_capacity",
    },
    tags: ["hard_compression", "buried_capacity", "structural_sacrifice"],
  },
  {
    id: "V03_D01",
    title: "Ambiguous fragment: Ayudo a ordenar",
    entryMode: "pain",
    focus: "ambiguous_fragment",
    fragments: [
      {
        field: "currentSituation",
        text: "Ayudo a ordenar.",
      },
    ],
    expectation: {
      notes:
        "no debería disparar lectura inflada; falta objeto, foco y secuencia",
    },
    tags: ["ambiguous", "ordering_language", "stress_test"],
  },
  {
    id: "V03_D02",
    title: "Ambiguous fragment: Escribo bastante",
    entryMode: "expansion",
    focus: "ambiguous_fragment",
    fragments: [
      {
        field: "currentSituation",
        text: "Escribo bastante.",
      },
    ],
    expectation: {
      notes:
        "no distingue por sí sola postura pública de forma narrativa",
    },
    tags: ["ambiguous", "writing_keyword", "stress_test"],
  },
  {
    id: "V03_D03",
    title: "Ambiguous fragment: Quedo en el medio",
    entryMode: "compression",
    focus: "ambiguous_fragment",
    fragments: [
      {
        field: "currentSituation",
        text: "Quedo en el medio.",
      },
    ],
    expectation: {
      notes:
        "puede ser puente, sostén, mediación o sobrecarga; no cerrar por keyword",
    },
    tags: ["ambiguous", "middle_position", "stress_test"],
  },
  {
    id: "V03_D04",
    title: "Ambiguous fragment: Veo por dónde viene la mano",
    entryMode: "curiosity",
    focus: "ambiguous_fragment",
    fragments: [
      {
        field: "currentSituation",
        text: "Veo por dónde viene la mano.",
      },
    ],
    expectation: {
      notes:
        "puede ir a criterio, lectura social o intuición comercial; no apresurarse",
    },
    tags: ["ambiguous", "context_reading", "stress_test"],
  },
];