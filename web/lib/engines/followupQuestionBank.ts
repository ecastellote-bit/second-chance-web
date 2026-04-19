import type { AmbiguityType, FollowupPack } from "../types/followup";

const FOLLOWUP_BANK: Record<string, FollowupPack> = {
  "guide_vs_community_round_2": {
    ambiguityType: "guide_vs_community",
    round: 2,
    title: "Aclaremos si tu fuerza aparece más en una persona o en un grupo",
    objective:
      "Separar acompañamiento humano profundo de sostén de comunidad y circulación grupal.",
    questions: [
      {
        id: "gvc_r2_q1",
        round: 2,
        ambiguityType: "guide_vs_community",
        kind: "contrast_choice",
        prompt:
          "Cuando mejor rendís, ¿te sale más naturalmente acompañar a una persona o sostener a un grupo para que no se enfríe o se rompa?",
        options: [
          {
            id: "persona",
            label: "Acompañar a una persona y ayudarla a aclararse",
            leansToward: ["empathic_guide"],
          },
          {
            id: "grupo",
            label: "Sostener a un grupo, su clima y su continuidad",
            leansToward: ["community_builder"],
          },
        ],
      },
      {
        id: "gvc_r2_q2",
        round: 2,
        ambiguityType: "guide_vs_community",
        kind: "micro_narrative",
        prompt:
          "Contá una situación real, no ideal, donde hayas sido importante para que algo humano no se desordene.",
        helpText:
          "Puede ser una conversación difícil o un grupo que sin vos se enfriaba, se rompía o perdía sentido.",
      },
      {
        id: "gvc_r2_q3",
        round: 2,
        ambiguityType: "guide_vs_community",
        kind: "contrast_choice",
        prompt:
          "¿Qué te duele más ver deteriorarse?",
        options: [
          {
            id: "persona_confundida",
            label: "Una persona confundida que no encuentra claridad",
            leansToward: ["empathic_guide"],
          },
          {
            id: "grupo_deshilachado",
            label: "Un grupo que pierde vínculo, circulación o pertenencia",
            leansToward: ["community_builder"],
          },
        ],
      },
      {
        id: "gvc_r2_q4",
        round: 2,
        ambiguityType: "guide_vs_community",
        kind: "open_text",
        prompt:
          "¿Qué terminás haciendo vos, sin que nadie te lo pida, cuando un grupo se empieza a apagar o cuando alguien se empieza a quebrar?",
      },
      {
        id: "gvc_r2_q5",
        round: 2,
        ambiguityType: "guide_vs_community",
        kind: "contrast_choice",
        prompt:
          "¿Dónde sentís más potencia propia?",
        options: [
          {
            id: "conversacion_profunda",
            label: "En una conversación profunda uno a uno",
            leansToward: ["empathic_guide"],
          },
          {
            id: "trama_colectiva",
            label: "En la trama colectiva de un grupo",
            leansToward: ["community_builder"],
          },
        ],
      },
    ],
  },

  "guide_vs_community_round_3": {
    ambiguityType: "guide_vs_community",
    round: 3,
    title: "Último desempate entre guía humana y construcción de comunidad",
    objective:
      "Forzar adjudicación entre foco uno a uno y foco colectivo.",
    questions: [
      {
        id: "gvc_r3_q1",
        round: 3,
        ambiguityType: "guide_vs_community",
        kind: "forced_choice",
        prompt:
          "Elegí la frase que más te representa cuando estás en tu mejor nivel.",
        options: [
          {
            id: "clarifico_personas",
            label: "Ayudo a una persona a entender mejor lo que le pasa",
            leansToward: ["empathic_guide"],
          },
          {
            id: "sostengo_comunidad",
            label: "Hago que una comunidad siga viva, conectada y ordenada",
            leansToward: ["community_builder"],
          },
        ],
      },
      {
        id: "gvc_r3_q2",
        round: 3,
        ambiguityType: "guide_vs_community",
        kind: "forced_choice",
        prompt:
          "Si solo pudieras conservar una función tuya, ¿cuál te dolería más perder?",
        options: [
          {
            id: "escucha_profunda",
            label: "Mi capacidad de escucha y acompañamiento profundo",
            leansToward: ["empathic_guide"],
          },
          {
            id: "sosten_colectivo",
            label: "Mi capacidad de sostener clima, pertenencia y continuidad grupal",
            leansToward: ["community_builder"],
          },
        ],
      },
      {
        id: "gvc_r3_q3",
        round: 3,
        ambiguityType: "guide_vs_community",
        kind: "micro_narrative",
        prompt:
          "Dame un ejemplo reciente donde dijiste: 'sin mí, esto se desordenaba'.",
        helpText:
          "No expliques teoría. Contá qué pasó y con quién.",
      },
      {
        id: "gvc_r3_q4",
        round: 3,
        ambiguityType: "guide_vs_community",
        kind: "forced_choice",
        prompt:
          "¿Qué describe mejor tu aporte más propio?",
        options: [
          {
            id: "proceso_humano",
            label: "Acompaño procesos humanos",
            leansToward: ["empathic_guide"],
          },
          {
            id: "vida_grupal",
            label: "Sostengo vida grupal",
            leansToward: ["community_builder"],
          },
        ],
      },
    ],
  },

  "guide_vs_connector_round_2": {
    ambiguityType: "guide_vs_connector",
    round: 2,
    title: "Aclaremos si tu fuerza aparece más en la escucha o en la articulación",
    objective:
      "Separar acompañamiento humano profundo de coordinación entre actores y acuerdos.",
    questions: [
      {
        id: "gvcn_r2_q1",
        round: 2,
        ambiguityType: "guide_vs_connector",
        kind: "contrast_choice",
        prompt:
          "Cuando algo humano se complica, ¿te sale más acompañar a alguien o leer posiciones y acercar partes?",
        options: [
          {
            id: "acompanar",
            label: "Acompañar y dar claridad a alguien",
            leansToward: ["empathic_guide"],
          },
          {
            id: "articular",
            label: "Leer posiciones y acercar partes",
            leansToward: ["diplomatic_social_connector"],
          },
        ],
      },
      {
        id: "gvcn_r2_q2",
        round: 2,
        ambiguityType: "guide_vs_connector",
        kind: "micro_narrative",
        prompt:
          "Contá una situación donde fuiste valioso en medio de tensión humana.",
        helpText:
          "Puede haber sido por escucha, por mediación o por ambas. Lo importante es qué hiciste vos.",
      },
      {
        id: "gvcn_r2_q3",
        round: 2,
        ambiguityType: "guide_vs_connector",
        kind: "contrast_choice",
        prompt:
          "¿Dónde sentís más precisión propia?",
        options: [
          {
            id: "pregunta_justa",
            label: "En hacer la pregunta justa a una persona",
            leansToward: ["empathic_guide"],
          },
          {
            id: "lectura_actores",
            label: "En leer actores, intereses y bordes",
            leansToward: ["diplomatic_social_connector"],
          },
        ],
      },
      {
        id: "gvcn_r2_q4",
        round: 2,
        ambiguityType: "guide_vs_connector",
        kind: "open_text",
        prompt:
          "¿Qué parte de vos aparece antes: la que comprende por dentro o la que acomoda entre partes?",
      },
      {
        id: "gvcn_r2_q5",
        round: 2,
        ambiguityType: "guide_vs_connector",
        kind: "contrast_choice",
        prompt:
          "¿Qué te deja más sensación de haber hecho algo valioso?",
        options: [
          {
            id: "alivio_persona",
            label: "Que alguien salga más claro y menos confundido",
            leansToward: ["empathic_guide"],
          },
          {
            id: "acuerdo_funcional",
            label: "Que distintas partes puedan seguir funcionando juntas",
            leansToward: ["diplomatic_social_connector"],
          },
        ],
      },
    ],
  },

  "guide_vs_connector_round_3": {
    ambiguityType: "guide_vs_connector",
    round: 3,
    title: "Último desempate entre escucha profunda y articulación de actores",
    objective:
      "Obligar a elegir entre proceso humano interno y coordinación externa entre partes.",
    questions: [
      {
        id: "gvcn_r3_q1",
        round: 3,
        ambiguityType: "guide_vs_connector",
        kind: "forced_choice",
        prompt:
          "¿Qué te representa mejor en tu mejor versión?",
        options: [
          {
            id: "ordeno_lo_interno",
            label: "Ordeno lo humano que alguien vive por dentro",
            leansToward: ["empathic_guide"],
          },
          {
            id: "ordeno_lo_entre_partes",
            label: "Ordeno lo que pasa entre actores o partes distintas",
            leansToward: ["diplomatic_social_connector"],
          },
        ],
      },
      {
        id: "gvcn_r3_q2",
        round: 3,
        ambiguityType: "guide_vs_connector",
        kind: "forced_choice",
        prompt:
          "¿Qué perderías con más dolor?",
        options: [
          {
            id: "escucha_humana",
            label: "Mi escucha profunda",
            leansToward: ["empathic_guide"],
          },
          {
            id: "lectura_de_actores",
            label: "Mi lectura de actores e intereses",
            leansToward: ["diplomatic_social_connector"],
          },
        ],
      },
      {
        id: "gvcn_r3_q3",
        round: 3,
        ambiguityType: "guide_vs_connector",
        kind: "micro_narrative",
        prompt:
          "Contame un caso real donde destrabaste algo humano. ¿Lo hiciste entendiendo a alguien o reordenando posiciones?",
      },
      {
        id: "gvcn_r3_q4",
        round: 3,
        ambiguityType: "guide_vs_connector",
        kind: "forced_choice",
        prompt:
          "Elegí una sola frase.",
        options: [
          {
            id: "acompano",
            label: "Acompaño procesos humanos",
            leansToward: ["empathic_guide"],
          },
          {
            id: "articulo",
            label: "Articulo actores e intereses",
            leansToward: ["diplomatic_social_connector"],
          },
        ],
      },
    ],
  },

  "strategist_vs_builder_round_2": {
    ambiguityType: "strategist_vs_builder",
    round: 2,
    title: "Aclaremos si tu fuerza aparece más en leer caminos o en resolverlos vos mismo",
    objective:
      "Separar lectura estratégica de ejecución operativa con criterio.",
    questions: [
      {
        id: "svb_r2_q1",
        round: 2,
        ambiguityType: "strategist_vs_builder",
        kind: "contrast_choice",
        prompt:
          "Cuando algo importante está trabado, ¿te sale más entender qué conviene hacer o meterte a destrabarlo vos mismo?",
        options: [
          {
            id: "entender_criterio",
            label: "Entender qué conviene hacer",
            leansToward: ["analytical_strategist"],
          },
          {
            id: "resolver_yo",
            label: "Meterme a destrabarlo yo mismo",
            leansToward: ["technical_builder"],
          },
        ],
      },
      {
        id: "svb_r2_q2",
        round: 2,
        ambiguityType: "strategist_vs_builder",
        kind: "micro_narrative",
        prompt:
          "Contá una situación reciente donde fuiste especialmente útil.",
        helpText:
          "Quiero saber si tu aporte estuvo más en el criterio o en la intervención concreta.",
      },
      {
        id: "svb_r2_q3",
        round: 2,
        ambiguityType: "strategist_vs_builder",
        kind: "contrast_choice",
        prompt:
          "¿Qué te representa más cuando rendís bien?",
        options: [
          {
            id: "comparar_escenarios",
            label: "Comparar escenarios y detectar el mejor camino",
            leansToward: ["analytical_strategist"],
          },
          {
            id: "hacer_que_funcione",
            label: "Hacer que algo funcione mejor en la práctica",
            leansToward: ["technical_builder"],
          },
        ],
      },
      {
        id: "svb_r2_q4",
        round: 2,
        ambiguityType: "strategist_vs_builder",
        kind: "open_text",
        prompt:
          "¿Qué te cansa más: pensar bien algo que nadie implementa o sostener operación sin poder pensarla mejor?",
      },
      {
        id: "svb_r2_q5",
        round: 2,
        ambiguityType: "strategist_vs_builder",
        kind: "contrast_choice",
        prompt:
          "Si alguien te trae un caos, ¿qué hacés antes?",
        options: [
          {
            id: "leo_patron",
            label: "Leo patrón, estructura y alternativas",
            leansToward: ["analytical_strategist"],
          },
          {
            id: "ordeno_ejecucion",
            label: "Ordeno pasos, prioridad y ejecución",
            leansToward: ["technical_builder"],
          },
        ],
      },
    ],
  },

  "strategist_vs_builder_round_3": {
    ambiguityType: "strategist_vs_builder",
    round: 3,
    title: "Último desempate entre estrategia y operación",
    objective:
      "Obligar a elegir entre criterio previo y resolución concreta.",
    questions: [
      {
        id: "svb_r3_q1",
        round: 3,
        ambiguityType: "strategist_vs_builder",
        kind: "forced_choice",
        prompt:
          "¿Qué describe mejor tu aporte más difícil de reemplazar?",
        options: [
          {
            id: "criterio",
            label: "Mi criterio para leer caminos y decidir",
            leansToward: ["analytical_strategist"],
          },
          {
            id: "ejecucion",
            label: "Mi capacidad de ordenar y hacer que algo salga",
            leansToward: ["technical_builder"],
          },
        ],
      },
      {
        id: "svb_r3_q2",
        round: 3,
        ambiguityType: "strategist_vs_builder",
        kind: "forced_choice",
        prompt:
          "¿Dónde te sentís más en tu centro?",
        options: [
          {
            id: "antes_de_mover",
            label: "Antes de mover, leyendo qué conviene",
            leansToward: ["analytical_strategist"],
          },
          {
            id: "durante_la_intervencion",
            label: "Durante la intervención concreta",
            leansToward: ["technical_builder"],
          },
        ],
      },
      {
        id: "svb_r3_q3",
        round: 3,
        ambiguityType: "strategist_vs_builder",
        kind: "micro_narrative",
        prompt:
          "Dame un ejemplo real donde dijiste: 'acá aporté algo que otros no veían'.",
      },
      {
        id: "svb_r3_q4",
        round: 3,
        ambiguityType: "strategist_vs_builder",
        kind: "forced_choice",
        prompt:
          "Elegí una sola frase.",
        options: [
          {
            id: "veo_mejor",
            label: "Veo mejor",
            leansToward: ["analytical_strategist"],
          },
          {
            id: "resuelvo_mejor",
            label: "Resuelvo mejor",
            leansToward: ["technical_builder"],
          },
        ],
      },
    ],
  },

  "storyteller_vs_cultural_round_2": {
    ambiguityType: "storyteller_vs_cultural",
    round: 2,
    title: "Aclaremos si tu fuerza aparece más en explorar o en dar forma verbal",
    objective:
      "Separar exploración cultural/contextual de construcción narrativa dominante.",
    questions: [
      {
        id: "svc_r2_q1",
        round: 2,
        ambiguityType: "storyteller_vs_cultural",
        kind: "contrast_choice",
        prompt:
          "¿Qué aparece antes en vos: la necesidad de entender más o la necesidad de decirlo bien?",
        options: [
          {
            id: "entender_mas",
            label: "Entender más, conectar más, explorar más",
            leansToward: ["cultural_explorer"],
          },
          {
            id: "decirlo_bien",
            label: "Encontrar la forma verbal justa para decirlo",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
      {
        id: "svc_r2_q2",
        round: 2,
        ambiguityType: "storyteller_vs_cultural",
        kind: "micro_narrative",
        prompt:
          "Contá una situación donde sentiste que tu aporte fue especialmente valioso.",
        helpText:
          "Quiero ver si estuvo más en explorar y conectar o en dar voz, mensaje y claridad.",
      },
      {
        id: "svc_r2_q3",
        round: 2,
        ambiguityType: "storyteller_vs_cultural",
        kind: "contrast_choice",
        prompt:
          "¿Qué te entusiasma más cuando estás bien?",
        options: [
          {
            id: "leer_relacionar",
            label: "Leer, investigar y relacionar materiales",
            leansToward: ["cultural_explorer"],
          },
          {
            id: "escribir_nombrar",
            label: "Escribir, editar y nombrar con precisión",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
      {
        id: "svc_r2_q4",
        round: 2,
        ambiguityType: "storyteller_vs_cultural",
        kind: "open_text",
        prompt:
          "¿Qué te frustra más: no haber entendido suficiente o no haber encontrado la forma de decirlo?",
      },
      {
        id: "svc_r2_q5",
        round: 2,
        ambiguityType: "storyteller_vs_cultural",
        kind: "contrast_choice",
        prompt:
          "¿Dónde sentís más identidad propia?",
        options: [
          {
            id: "lector_contextos",
            label: "Como lector de contextos e ideas",
            leansToward: ["cultural_explorer"],
          },
          {
            id: "constructor_relato",
            label: "Como constructor de mensaje y relato",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
    ],
  },

  "storyteller_vs_cultural_round_3": {
    ambiguityType: "storyteller_vs_cultural",
    round: 3,
    title: "Último desempate entre exploración cultural y construcción narrativa",
    objective:
      "Obligar a elegir entre comprensión exploratoria y forma verbal dominante.",
    questions: [
      {
        id: "svc_r3_q1",
        round: 3,
        ambiguityType: "storyteller_vs_cultural",
        kind: "forced_choice",
        prompt:
          "Elegí la frase que más te representa cuando rendís en tu mejor nivel.",
        options: [
          {
            id: "relaciono_contextos",
            label: "Relaciono contextos, ideas y materiales que otros dejan separados",
            leansToward: ["cultural_explorer"],
          },
          {
            id: "vuelvo_comunicable",
            label: "Vuelvo claro, comunicable y recordable algo que sin mí quedaría difuso",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
      {
        id: "svc_r3_q2",
        round: 3,
        ambiguityType: "storyteller_vs_cultural",
        kind: "forced_choice",
        prompt:
          "¿Qué perderías con más dolor?",
        options: [
          {
            id: "curiosidad_contextual",
            label: "Mi capacidad de explorar y conectar contextos",
            leansToward: ["cultural_explorer"],
          },
          {
            id: "voz_mensaje",
            label: "Mi capacidad de dar voz, forma y mensaje",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
      {
        id: "svc_r3_q3",
        round: 3,
        ambiguityType: "storyteller_vs_cultural",
        kind: "micro_narrative",
        prompt:
          "Dame un ejemplo real donde dijiste: 'esto sin mí quedaba incompleto'.",
      },
      {
        id: "svc_r3_q4",
        round: 3,
        ambiguityType: "storyteller_vs_cultural",
        kind: "forced_choice",
        prompt:
          "Elegí una sola frase.",
        options: [
          {
            id: "exploro",
            label: "Exploro y relaciono",
            leansToward: ["cultural_explorer"],
          },
          {
            id: "nombro",
            label: "Nombro y doy forma",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
    ],
  },

  "connector_vs_storyteller_round_2": {
    ambiguityType: "connector_vs_storyteller",
    round: 2,
    title: "Aclaremos si tu fuerza aparece más en articular actores o en construir mensaje",
    objective:
      "Separar lectura de actores e intereses de construcción verbal dominante.",
    questions: [
      {
        id: "cvs_r2_q1",
        round: 2,
        ambiguityType: "connector_vs_storyteller",
        kind: "contrast_choice",
        prompt:
          "Cuando una situación pública o institucional se complica, ¿te sale más leer actores o construir el mensaje correcto?",
        options: [
          {
            id: "leer_actores",
            label: "Leer actores, intereses y posiciones",
            leansToward: ["diplomatic_social_connector"],
          },
          {
            id: "construir_mensaje",
            label: "Construir el mensaje, tono o relato correcto",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
      {
        id: "cvs_r2_q2",
        round: 2,
        ambiguityType: "connector_vs_storyteller",
        kind: "micro_narrative",
        prompt:
          "Contá una situación donde hayas sido decisivo.",
        helpText:
          "Quiero ver si pesó más tu lectura de personas/partes o tu capacidad de construir mensaje.",
      },
      {
        id: "cvs_r2_q3",
        round: 2,
        ambiguityType: "connector_vs_storyteller",
        kind: "contrast_choice",
        prompt:
          "¿Qué sentís más propio?",
        options: [
          {
            id: "alinear_partes",
            label: "Alinear partes, intereses o sectores",
            leansToward: ["diplomatic_social_connector"],
          },
          {
            id: "encontrar_voz",
            label: "Encontrar la voz o formulación exacta",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
      {
        id: "cvs_r2_q4",
        round: 2,
        ambiguityType: "connector_vs_storyteller",
        kind: "open_text",
        prompt:
          "¿Dónde sentís que hacés más diferencia: en lo que pasa entre actores o en cómo eso se vuelve decible?",
      },
      {
        id: "cvs_r2_q5",
        round: 2,
        ambiguityType: "connector_vs_storyteller",
        kind: "contrast_choice",
        prompt:
          "¿Qué te deja más sensación de precisión?",
        options: [
          {
            id: "negociacion_fina",
            label: "La negociación o lectura fina de posiciones",
            leansToward: ["diplomatic_social_connector"],
          },
          {
            id: "frase_justa",
            label: "La frase justa, el tono justo o el relato justo",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
    ],
  },

  "connector_vs_storyteller_round_3": {
    ambiguityType: "connector_vs_storyteller",
    round: 3,
    title: "Último desempate entre articulación de actores y construcción narrativa",
    objective:
      "Obligar a elegir entre diplomacia relacional y forma verbal dominante.",
    questions: [
      {
        id: "cvs_r3_q1",
        round: 3,
        ambiguityType: "connector_vs_storyteller",
        kind: "forced_choice",
        prompt:
          "Elegí la frase que más te representa cuando rendís en tu mejor nivel.",
        options: [
          {
            id: "ordeno_partes",
            label: "Hago que partes distintas puedan coordinarse",
            leansToward: ["diplomatic_social_connector"],
          },
          {
            id: "ordeno_sentido",
            label: "Hago que algo gane forma, voz y sentido",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
      {
        id: "cvs_r3_q2",
        round: 3,
        ambiguityType: "connector_vs_storyteller",
        kind: "forced_choice",
        prompt:
          "¿Qué perderías con más dolor?",
        options: [
          {
            id: "lectura_politica",
            label: "Mi lectura de actores e intereses",
            leansToward: ["diplomatic_social_connector"],
          },
          {
            id: "capacidad_narrativa",
            label: "Mi capacidad de construir mensaje y relato",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
      {
        id: "cvs_r3_q3",
        round: 3,
        ambiguityType: "connector_vs_storyteller",
        kind: "micro_narrative",
        prompt:
          "Dame un ejemplo real donde tu aporte cambió el resultado. ¿Pesó más tu lectura de personas o tu construcción de mensaje?",
      },
      {
        id: "cvs_r3_q4",
        round: 3,
        ambiguityType: "connector_vs_storyteller",
        kind: "forced_choice",
        prompt:
          "Elegí una sola frase.",
        options: [
          {
            id: "articulo",
            label: "Articulo actores",
            leansToward: ["diplomatic_social_connector"],
          },
          {
            id: "construyo_relato",
            label: "Construyo relato",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
    ],
  },

  "weak_signal_general_round_2": {
    ambiguityType: "weak_signal_general",
    round: 2,
    title: "Falta nitidez: necesitamos separar mejor lo que sos de lo que hacés por adaptación",
    objective:
      "Agregar evidencia general cuando todavía no hay patrón central suficientemente claro.",
    questions: [
      {
        id: "wsg_r2_q1",
        round: 2,
        ambiguityType: "weak_signal_general",
        kind: "open_text",
        prompt:
          "Contame una situación real de los últimos dos años donde sentiste: 'acá rendí mejor que de costumbre'.",
      },
      {
        id: "wsg_r2_q2",
        round: 2,
        ambiguityType: "weak_signal_general",
        kind: "open_text",
        prompt:
          "¿Qué terminás haciendo mejor que otros, incluso cuando no estaba previsto que te ocupes vos?",
      },
      {
        id: "wsg_r2_q3",
        round: 2,
        ambiguityType: "weak_signal_general",
        kind: "open_text",
        prompt:
          "¿Qué tipo de problema ajeno te atrae resolver y cuál te drena de inmediato?",
      },
      {
        id: "wsg_r2_q4",
        round: 2,
        ambiguityType: "weak_signal_general",
        kind: "open_text",
        prompt:
          "¿Qué parte de tu trabajo o de tu historia sentís que está más viva, pero menos usada?",
      },
      {
        id: "wsg_r2_q5",
        round: 2,
        ambiguityType: "weak_signal_general",
        kind: "micro_narrative",
        prompt:
          "Contá una escena concreta donde alguien haya dicho o pensado: 'menos mal que estabas vos'.",
      },
    ],
  },

  "weak_signal_general_round_3": {
    ambiguityType: "weak_signal_general",
    round: 3,
    title: "Último esfuerzo para forzar una rama principal",
    objective:
      "Obtener una inclinación dominante aunque la señal general siga débil.",
    questions: [
      {
        id: "wsg_r3_q1",
        round: 3,
        ambiguityType: "weak_signal_general",
        kind: "forced_choice",
        prompt:
          "Elegí qué te representa más cuando rendís en tu mejor nivel.",
        options: [
          {
            id: "entiendo_y_oriento",
            label: "Entiendo, comparo y oriento decisiones",
            leansToward: ["analytical_strategist"],
          },
          {
            id: "resuelvo_y_ordeno",
            label: "Resuelvo, ordeno y hago que algo funcione",
            leansToward: ["technical_builder"],
          },
          {
            id: "acompano_personas",
            label: "Escucho, acompaño y aclaro procesos humanos",
            leansToward: ["empathic_guide"],
          },
          {
            id: "sostengo_grupos",
            label: "Sostengo grupo, comunidad o circulación colectiva",
            leansToward: ["community_builder"],
          },
          {
            id: "articulo_partes",
            label: "Articulo actores, intereses o sectores",
            leansToward: ["diplomatic_social_connector"],
          },
          {
            id: "doy_forma_verbal",
            label: "Doy forma verbal, mensaje o relato",
            leansToward: ["creative_storyteller"],
          },
          {
            id: "exploro_y_relaciono",
            label: "Exploro, leo y relaciono contextos o ideas",
            leansToward: ["cultural_explorer"],
          },
        ],
      },
      {
        id: "wsg_r3_q2",
        round: 3,
        ambiguityType: "weak_signal_general",
        kind: "forced_choice",
        prompt:
          "¿Qué perderías con más dolor si desapareciera mañana?",
        options: [
          {
            id: "criterio",
            label: "Mi criterio para leer mejor las situaciones",
            leansToward: ["analytical_strategist"],
          },
          {
            id: "resolucion",
            label: "Mi capacidad de resolver y ordenar",
            leansToward: ["technical_builder"],
          },
          {
            id: "escucha",
            label: "Mi escucha y acompañamiento humano",
            leansToward: ["empathic_guide"],
          },
          {
            id: "comunidad",
            label: "Mi capacidad de sostener vínculo colectivo",
            leansToward: ["community_builder"],
          },
          {
            id: "articulacion",
            label: "Mi lectura de actores e intereses",
            leansToward: ["diplomatic_social_connector"],
          },
          {
            id: "narrativa",
            label: "Mi capacidad de dar voz y forma",
            leansToward: ["creative_storyteller"],
          },
          {
            id: "exploracion",
            label: "Mi capacidad de explorar y conectar ideas",
            leansToward: ["cultural_explorer"],
          },
        ],
      },
      {
        id: "wsg_r3_q3",
        round: 3,
        ambiguityType: "weak_signal_general",
        kind: "micro_narrative",
        prompt:
          "Dame un ejemplo real donde te sentiste más vos que de costumbre.",
      },
      {
        id: "wsg_r3_q4",
        round: 3,
        ambiguityType: "weak_signal_general",
        kind: "forced_choice",
        prompt:
          "Elegí una sola frase.",
        options: [
          {
            id: "veo",
            label: "Veo mejor",
            leansToward: ["analytical_strategist", "cultural_explorer"],
          },
          {
            id: "resuelvo",
            label: "Resuelvo mejor",
            leansToward: ["technical_builder"],
          },
          {
            id: "acompano",
            label: "Acompaño mejor",
            leansToward: ["empathic_guide"],
          },
          {
            id: "sostengo",
            label: "Sostengo mejor",
            leansToward: ["community_builder"],
          },
          {
            id: "articulo",
            label: "Articulo mejor",
            leansToward: ["diplomatic_social_connector"],
          },
          {
            id: "nombro",
            label: "Nombro mejor",
            leansToward: ["creative_storyteller"],
          },
        ],
      },
    ],
  },
};

export function getFollowupPack(
  ambiguityType: AmbiguityType,
  round: 2 | 3
): FollowupPack | null {
  return FOLLOWUP_BANK[`${ambiguityType}_round_${round}`] ?? null;
}