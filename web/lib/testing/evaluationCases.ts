export type EvaluationCase = {
    id: string;
    label: string;
    expectation: string;
    payload: {
      profile: {
        age: number;
        country: string;
        language: string;
        employmentStatus: string;
        educationLevel: string;
      };
      narrative: {
        childhoodMemories: string;
        earlyFascinations: string;
        meaningfulSchoolSubjects: string;
        repeatedWorkPatterns: string;
        naturalSocialRoles: string;
        lossesOrRenunciations: string;
        whatFeelsCompressedNow: string;
        additionalContext: string;
      };
      currentContext: {
        currentSituation: string;
        restrictions: string[];
        assets: string[];
      };
    };
  };
  
  export const EVALUATION_CASES: EvaluationCase[] = [
    {
      id: "analista_criterio_no_ejecutor",
      label: "Analista de criterio, no ejecutor",
      expectation:
        "Debería tender a clear_direction con analytical_strategist y no caer por inercia en technical_builder.",
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
            "De chico me pasaba horas comparando versiones de una misma historia, detectando contradicciones y ordenando argumentos antes de hablar.",
          earlyFascinations:
            "Me fascinaba leer estructura, comparar escenarios y entender por qué una decisión era más sólida que otra.",
          meaningfulSchoolSubjects: "Historia, Lengua, Formación cívica",
          repeatedWorkPatterns:
            "Siempre termino detectando patrones, ordenando criterios, comparando alternativas y señalando inconsistencias.",
          naturalSocialRoles:
            "Suelo ocupar el lugar de quien baja criterio, separa lo central de lo accesorio y ayuda a pensar mejor.",
          lossesOrRenunciations:
            "Fui dejando espacios de análisis más profundo por trabajos reactivos y urgencias del presente.",
          whatFeelsCompressedNow:
            "Hoy uso esa capacidad para responder urgencias puntuales, pero casi no la despliego como línea principal.",
          additionalContext:
            "No me define ejecutar rápido sino leer estructura y detectar criterio.",
        },
        currentContext: {
          currentSituation:
            "Estoy en un rol estable, pero donde más rindo no es ejecutando rápido sino comparando escenarios, leyendo estructura y detectando criterio.",
          restrictions: [
            "No puedo hacer un giro brusco",
            "No puedo resignar ingresos de golpe",
          ],
          assets: [
            "Lectura estructural",
            "Criterio comparativo",
            "Capacidad de priorización",
          ],
        },
      },
    },
    {
      id: "coordinador_de_actores_no_terapeutico",
      label: "Coordinador de actores, no terapéutico",
      expectation:
        "Debería tender a clear_direction con diplomatic_social_connector y no confundirse con empathic_guide.",
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
            "Desde chico terminaba organizando grupos, repartiendo roles y evitando que todo se desordene.",
          earlyFascinations:
            "Me atraía ver cómo hacer que varias partes distintas funcionen juntas sin chocar.",
          meaningfulSchoolSubjects: "Historia, Sociales, Lengua",
          repeatedWorkPatterns:
            "Siempre termino articulando personas, coordinando cruces, ordenando procesos entre áreas y destrabando situaciones.",
          naturalSocialRoles:
            "Ocupo el rol de articulador, mediador práctico y coordinador de actores.",
          lossesOrRenunciations:
            "Muchas veces usé esa capacidad solo para apagar incendios y no para construir algo más grande.",
          whatFeelsCompressedNow:
            "Siento que mi capacidad de articulación está usada de modo defensivo, no expansivo.",
          additionalContext:
            "No me define contener emocionalmente; me define coordinar actores y sostener funcionamiento.",
        },
        currentContext: {
          currentSituation:
            "Estoy estable, pero donde más rindo es cuando tengo que coordinar personas, conectar áreas y ordenar cruces para que el grupo avance.",
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
      id: "escucha_humana_con_criterio_no_conector_institucional",
      label: "Escucha humana con criterio, no conector institucional",
      expectation:
        "Debería tender a clear_direction con empathic_guide y no depender de lenguaje institucional para lograrlo.",
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
            "De chico era a quien venían a contarle problemas porque sabía escuchar sin invadir ni juzgar rápido.",
          earlyFascinations:
            "Me interesaba entender a fondo lo que le pasaba a la gente y hacer preguntas que ordenaran lo confuso.",
          meaningfulSchoolSubjects: "Lengua, Psicología, Filosofía",
          repeatedWorkPatterns:
            "Siempre termino conteniendo, acompañando procesos, ordenando lo confuso y ayudando a otros a entender mejor lo que viven.",
          naturalSocialRoles:
            "Ocupo el lugar de escucha profunda, acompañante y guía humana con criterio.",
          lossesOrRenunciations:
            "Dejé de darle lugar central a esa capacidad por trabajos más funcionales y menos humanos.",
          whatFeelsCompressedNow:
            "Sostengo mucho a otros, pero casi nunca puedo usar esa capacidad en una dirección clara y reconocible.",
          additionalContext:
            "No me define construir alianzas institucionales sino presencia humana, escucha y preguntas justas.",
        },
        currentContext: {
          currentSituation:
            "Lo que mejor hago es escuchar sin invadir, hacer preguntas justas y ayudar a otros a entender situaciones personales complejas.",
          restrictions: [
            "Necesito una transición gradual",
            "No puedo cortar mis ingresos actuales",
          ],
          assets: [
            "Escucha profunda",
            "Presencia humana",
            "Sensibilidad interpersonal",
            "Capacidad de acompañar",
          ],
        },
      },
    },
    {
      id: "curador_de_ideas_no_narrador",
      label: "Curador de ideas, no narrador",
      expectation:
        "Debería tender a clear_direction con cultural_explorer y no inflarse hacia creative_storyteller.",
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
            "Desde chico acumulaba datos, autores, contextos y relaciones entre temas que parecían lejanos.",
          earlyFascinations:
            "Me fascinaba leer historia, cultura, procesos sociales y encontrar conexiones entre campos distintos.",
          meaningfulSchoolSubjects: "Historia, Literatura, Filosofía",
          repeatedWorkPatterns:
            "Siempre termino investigando, relacionando autores, comparando procesos y conectando ideas de distintos campos.",
          naturalSocialRoles:
            "Suelo ser curador de ideas, lector de contextos y relacionador de materiales.",
          lossesOrRenunciations:
            "Muchas veces aprendí y conecté mucho, pero sin convertir eso en una línea visible.",
          whatFeelsCompressedNow:
            "Aprendo mucho y conecto muchas ideas, pero casi nunca transformo eso en una dirección laboral reconocible.",
          additionalContext:
            "No me define construir relato propio; me define leer, curar y relacionar.",
        },
        currentContext: {
          currentSituation:
            "Trabajo en algo estable, pero mi interés persistente está en leer historia, cultura y procesos sociales, y conectar contextos.",
          restrictions: [
            "Necesito que cualquier cambio sea gradual",
            "No puedo desordenar mi base económica actual",
          ],
          assets: [
            "Lectura profunda",
            "Curiosidad cultural sostenida",
            "Capacidad de relación entre contextos",
          ],
        },
      },
    },
    {
      id: "tecnico_operativo_limpio",
      label: "Técnico operativo limpio",
      expectation:
        "Debería tender a technical_builder sin contaminarse por lenguaje social o emocional superficial.",
      payload: {
        profile: {
          age: 38,
          country: "Argentina",
          language: "es",
          employmentStatus: "employed",
          educationLevel: "secondary",
        },
        narrative: {
          childhoodMemories:
            "De chico me gustaba arreglar cosas, desarmar objetos y entender cómo hacer que funcionen mejor.",
          earlyFascinations:
            "Me atraía resolver fallas, ajustar mecanismos y ordenar procesos.",
          meaningfulSchoolSubjects: "Matemática, Técnica, Física",
          repeatedWorkPatterns:
            "Siempre termino resolviendo fallas, ordenando tareas, gestionando prioridad y mejorando procesos concretos.",
          naturalSocialRoles:
            "Ocupo el rol de ejecutor técnico y organizador operativo.",
          lossesOrRenunciations:
            "A veces siento que diseño poco y apago incendios demasiado.",
          whatFeelsCompressedNow:
            "Apago incendios sobre la marcha y uso menos de lo que podría en diseño más estable.",
          additionalContext:
            "Mi aporte real está en resolver, ajustar y hacer que la operación salga sin trabas.",
        },
        currentContext: {
          currentSituation:
            "Resuelvo fallas, ordeno tareas, ajusto procesos y hago que la operación salga sin trabarse.",
          restrictions: [
            "No puedo dejar mi estabilidad actual",
            "Necesito pasos concretos",
          ],
          assets: [
            "Capacidad de ejecución",
            "Experiencia técnica",
            "Orden operativo",
          ],
        },
      },
    },
    {
      id: "narrador_con_vocabulario_estrategico",
      label: "Narrador con vocabulario estratégico",
      expectation:
        "Debería seguir yéndose a creative_storyteller aunque aparezcan palabras como estrategia, posicionamiento o marca.",
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
            "De chico escribía relatos, armaba personajes y me gustaba nombrar con precisión lo que veía.",
          earlyFascinations:
            "Me fascinaba contar historias, explicar ideas complejas con claridad y dar forma verbal a lo difuso.",
          meaningfulSchoolSubjects: "Lengua, Literatura, Historia",
          repeatedWorkPatterns:
            "Siempre termino escribiendo, editando, explicando procesos y dándole forma verbal a ideas complejas.",
          naturalSocialRoles:
            "Ocupo el rol de narrador, sintetizador y constructor de mensajes.",
          lossesOrRenunciations:
            "Usé mucho lenguaje funcional o comercial, pero no siempre toda mi capacidad narrativa real.",
          whatFeelsCompressedNow:
            "Uso lenguaje funcional todos los días, pero no toda mi fuerza real de construir relato.",
          additionalContext:
            "Aunque aparezca vocabulario estratégico, mi núcleo es narrativo.",
        },
        currentContext: {
          currentSituation:
            "Pienso estrategia, posicionamiento y mensajes, pero mi fuerza real aparece cuando escribo, nombro y construyo relato con claridad.",
          restrictions: [
            "Necesito sostener facturación",
            "No puedo hacer un giro desordenado",
          ],
          assets: ["Escritura", "Síntesis", "Capacidad de comunicar"],
        },
      },
    },
    {
      id: "explorador_cultural_riguroso",
      label: "Explorador cultural riguroso",
      expectation:
        "Debería tender a cultural_explorer sin inflarse hacia storyteller si no aparece construcción narrativa dominante.",
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
            "Desde chico leía por mi cuenta, comparaba épocas, países y maneras de vivir.",
          earlyFascinations:
            "Me atraían historia, idiomas, cultura y la conexión entre contextos distintos.",
          meaningfulSchoolSubjects: "Historia, Geografía, Lenguas",
          repeatedWorkPatterns:
            "Siempre termino investigando, comparando contextos, leyendo y conectando ideas de distintos campos.",
          naturalSocialRoles:
            "Suelo ser explorador cultural y lector riguroso de contextos.",
          lossesOrRenunciations:
            "Aprendo mucho, pero muchas veces no convierto eso en una dirección laboral clara.",
          whatFeelsCompressedNow:
            "Mi curiosidad sigue viva, pero no siempre se traduce en una trayectoria visible.",
          additionalContext:
            "No hay impulso narrativo dominante; hay lectura y exploración rigurosa.",
        },
        currentContext: {
          currentSituation:
            "Trabajo en algo estable, pero mi interés persistente está en leer historia, comparar procesos sociales, aprender idiomas y conectar contextos.",
          restrictions: [
            "Necesito que cualquier cambio sea gradual",
            "No puedo romper mi base económica",
          ],
          assets: [
            "Lectura profunda",
            "Curiosidad sostenida",
            "Capacidad de relacionar contextos",
          ],
        },
      },
    },
    {
      id: "escucha_humana_profunda",
      label: "Escucha humana profunda",
      expectation:
        "Debería tender a empathic_guide y no depender de lenguaje institucional para lograrlo.",
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
            "Desde chico era quien escuchaba a fondo, calmaba a otros y ayudaba a poner en palabras lo que sentían.",
          earlyFascinations:
            "Me interesaba entender conflictos humanos y acompañar sin invadir.",
          meaningfulSchoolSubjects: "Lengua, Psicología, Filosofía",
          repeatedWorkPatterns:
            "Siempre termino escuchando, acompañando y ayudando a otros a entender situaciones tensas.",
          naturalSocialRoles:
            "Ocupo el rol de escucha profunda y acompañante con criterio humano.",
          lossesOrRenunciations:
            "Esa capacidad quedó muchas veces en segundo plano por trabajos más funcionales.",
          whatFeelsCompressedNow:
            "Sostengo a otros, pero no termino de ordenar mi propia dirección.",
          additionalContext:
            "Mi núcleo no es institucional sino humano y relacional.",
        },
        currentContext: {
          currentSituation:
            "Lo que mejor hago es escuchar, contener, hacer preguntas justas y ayudar a otros a entender situaciones personales complejas.",
          restrictions: [
            "Necesito una transición gradual",
            "No puedo perder estabilidad de golpe",
          ],
          assets: [
            "Escucha profunda",
            "Capacidad de acompañar",
            "Sensibilidad interpersonal",
          ],
        },
      },
    },
    {
      id: "social_fuerte_pero_comprimido_por_contexto",
      label: "Social fuerte pero comprimido por contexto",
      expectation:
        "Debería mostrar patrón social fuerte, pero leerlo como compressed_life por el presente.",
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
            "Desde chico me resultaba natural juntar personas, ordenar grupos y hacer que distintos perfiles convivan mejor.",
          earlyFascinations:
            "Me interesaba conectar gente, mediar tensiones y generar funcionamiento entre partes distintas.",
          meaningfulSchoolSubjects: "Historia, Sociales, Lengua",
          repeatedWorkPatterns:
            "En cualquier trabajo termino articulando personas, mediando intereses y sosteniendo funcionamiento entre áreas.",
          naturalSocialRoles:
            "Ocupo el rol de articulador social y coordinador humano.",
          lossesOrRenunciations:
            "Hoy esa capacidad se usa casi siempre para apagar urgencias y no para construir una dirección propia.",
          whatFeelsCompressedNow:
            "La vida actual parece más comprimida que alineada; uso solo una parte de lo que podría desplegar.",
          additionalContext:
            "Hay patrón social fuerte, pero muy condicionado por la supervivencia presente.",
        },
        currentContext: {
          currentSituation:
            "Trabajo en algo estable, pero muy reactivo; casi toda mi energía se va en sostener funcionamiento inmediato.",
          restrictions: [
            "No puedo resignar ingresos ahora",
            "No puedo mover demasiado a la vez",
          ],
          assets: [
            "Capacidad de coordinación",
            "Lectura de actores",
            "Vínculo interpersonal",
          ],
        },
      },
    },
    {
        id: "articulador_politico_no_terapeutico",
        label: "Articulador político, no terapéutico",
        expectation:
          "Debería tender a clear_direction con diplomatic_social_connector y no caer en empathic_guide solo por lenguaje humano o sensibilidad interpersonal.",
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
            meaningfulSchoolSubjects:
              "Historia, educación cívica, lengua",
            repeatedWorkPatterns:
              "Siempre termino articulando personas, mediando tensiones, negociando posiciones y haciendo que distintas partes puedan convivir en un mismo esquema.",
            naturalSocialRoles:
              "Articulador, mediador, lector de actores",
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
        id: "negociador_institucional_no_narrador",
        label: "Negociador institucional, no narrador",
        expectation:
          "Debería tender a clear_direction con diplomatic_social_connector y no inflarse hacia creative_storyteller si la construcción narrativa no es dominante.",
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
              "De chico era el que hablaba con unos y otros para que las cosas no terminaran mal y pudieran seguir funcionando.",
            earlyFascinations:
              "Me interesaban los ámbitos donde había normas, roles, intereses cruzados y necesidad de coordinación fina.",
            meaningfulSchoolSubjects:
              "Historia, formación ética, lengua",
            repeatedWorkPatterns:
              "Siempre termino representando posiciones, negociando bordes, sosteniendo vínculos y generando condiciones para que otros puedan avanzar.",
            naturalSocialRoles:
              "Enlace, negociador, coordinador institucional",
            lossesOrRenunciations:
              "Dejé en segundo plano otros intereses para sostener una trayectoria más ordenada y compatible con obligaciones actuales.",
            whatFeelsCompressedNow:
              "Uso mi capacidad para sostener equilibrios, pero no siempre en una dirección propia con más expansión.",
            additionalContext:
              "Usa lenguaje público e institucional, pero eso no lo convierte automáticamente en narrador creativo.",
          },
          currentContext: {
            currentSituation:
              "Hoy rindo mejor cuando tengo que cuidar vínculos institucionales, bajar tensiones y alinear intereses entre áreas o sectores.",
            restrictions: [
              "No puedo hacer cambios bruscos",
              "Necesito sostener reputación y estabilidad",
            ],
            assets: [
              "Negociación institucional",
              "Diplomacia",
              "Lectura política",
              "Coordinación de actores",
            ],
          },
        },
      },
      {
        id: "lector_de_escenarios_no_operador",
        label: "Lector de escenarios, no operador",
        expectation:
          "Debería tender a clear_direction con analytical_strategist y no caer por inercia en technical_builder.",
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
              "De chico me gustaba observar cómo funcionaban las cosas, comparar alternativas y detectar por qué algo no cerraba del todo.",
            earlyFascinations:
              "Me atraían los mapas, los sistemas, los escenarios posibles y la lectura de consecuencias.",
            meaningfulSchoolSubjects:
              "Historia, matemáticas, geografía",
            repeatedWorkPatterns:
              "Siempre termino detectando patrones, ordenando criterios, comparando escenarios y señalando inconsistencias.",
            naturalSocialRoles:
              "Analista, comparador, lector de estructura",
            lossesOrRenunciations:
              "Fui dejando de lado una línea más estratégica para resolver urgencias y sostener funcionamiento inmediato.",
            whatFeelsCompressedNow:
              "Hoy uso esa capacidad para responder urgencias puntuales, pero casi no la despliego como línea principal.",
            additionalContext:
              "Tiene criterio y lectura estructural, pero no disfruta ni prioriza la ejecución operativa intensa.",
          },
          currentContext: {
            currentSituation:
              "Estoy en un rol estable, pero donde más rindo no es ejecutando rápido sino comparando escenarios, leyendo estructura y detectando criterio.",
            restrictions: [
              "No puedo hacer un giro brusco",
              "No puedo resignar ingresos de golpe",
            ],
            assets: [
              "Lectura estructural",
              "Criterio comparativo",
              "Capacidad de priorización",
            ],
          },
        },
      },
      {
        id: "estratega_de_negocio_con_lenguaje_humano",
        label: "Estratega de negocio con lenguaje humano",
        expectation:
          "Debería tender a clear_direction con analytical_strategist y no confundirse con diplomatic_social_connector solo por el vocabulario social.",
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
              "De chico me gustaba entender por qué una decisión funcionaba mejor que otra y cómo ordenar opciones posibles.",
            earlyFascinations:
              "Me atraía detectar oportunidades, comparar caminos y pensar estrategias antes de actuar.",
            meaningfulSchoolSubjects:
              "Matemáticas, economía, lengua",
            repeatedWorkPatterns:
              "Siempre termino viendo el modelo, la lógica detrás del negocio, las alternativas y el costo de cada camino.",
            naturalSocialRoles:
              "Estratega, analista de opciones, lector de oportunidades",
            lossesOrRenunciations:
              "Fui aceptando tareas más inmediatas que me quitaron tiempo para pensar arquitectura y dirección.",
            whatFeelsCompressedNow:
              "Siento que mi parte más potente aparece pensando escenarios y decisiones, pero hoy queda parcialmente tapada.",
            additionalContext:
              "Puede hablar bien con personas y clientes, pero su fuerza real no está en la mediación social sino en la lectura estratégica.",
          },
          currentContext: {
            currentSituation:
              "Trabajo bien con equipos y clientes, pero mi diferencial aparece cuando ordeno alternativas, detecto oportunidades y doy criterio para decidir.",
            restrictions: [
              "Necesito sostener facturación",
              "No puedo entrar en una transición larga sin resultados",
            ],
            assets: [
              "Análisis de negocio",
              "Pensamiento estratégico",
              "Criterio comparativo",
              "Lectura de oportunidades",
            ],
          },
        },
      },
      {
        id: "curador_cultural_con_estructura",
        label: "Curador cultural con estructura",
        expectation:
          "Debería tender a clear_direction con cultural_explorer y no inflarse hacia creative_storyteller si no aparece construcción narrativa dominante.",
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
              "Desde chico me interesaba leer, relacionar autores, conectar épocas y entender por qué ciertos procesos se repetían.",
            earlyFascinations:
              "Me atraían la historia, la cultura, los idiomas y la posibilidad de unir contextos distintos en una mirada más amplia.",
            meaningfulSchoolSubjects:
              "Historia, literatura, filosofía",
            repeatedWorkPatterns:
              "Siempre termino investigando, relacionando autores, comparando procesos y conectando ideas de distintos campos.",
            naturalSocialRoles:
              "Curador, explorador cultural, conectador de contextos",
            lossesOrRenunciations:
              "No pude convertir esa línea en una trayectoria visible y consistente por tener que sostener otras obligaciones.",
            whatFeelsCompressedNow:
              "Aprendo mucho y conecto muchas ideas, pero casi nunca transformo eso en una dirección laboral reconocible.",
            additionalContext:
              "Produce sentido por conexión y lectura cultural, no necesariamente por impulso narrativo fuerte.",
          },
          currentContext: {
            currentSituation:
              "Trabajo en algo estable, pero mi interés persistente está en leer historia, cultura y procesos sociales, y conectar contextos.",
            restrictions: [
              "Necesito que cualquier cambio sea gradual",
              "No puedo desordenar mi base económica actual",
            ],
            assets: [
              "Lectura profunda",
              "Curiosidad cultural sostenida",
              "Capacidad de relación entre contextos",
            ],
          },
        },
      },
      {
        id: "mediador_social_comprimido_por_contexto",
        label: "Mediador social comprimido por contexto",
        expectation:
          "Debería mostrar señales fuertes de diplomatic_social_connector, pero leerse como compressed_life por la compresión actual.",
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
              "De chico solía acercar personas, evitar que los conflictos escalaran y ayudar a que un grupo pudiera seguir funcionando.",
            earlyFascinations:
              "Me atraían los lugares donde había que coordinar personas, leer tensiones y lograr acuerdos prácticos.",
            meaningfulSchoolSubjects:
              "Historia, lengua, formación ética",
            repeatedWorkPatterns:
              "En cualquier trabajo termino articulando personas, mediando intereses y sosteniendo funcionamiento entre áreas.",
            naturalSocialRoles:
              "Mediador, coordinador humano, enlace",
            lossesOrRenunciations:
              "Tuve que elegir estabilidad y urgencia por encima de una línea más alineada con esta capacidad.",
            whatFeelsCompressedNow:
              "La vida actual parece más comprimida que alineada; uso solo una parte de lo que podría desplegar.",
            additionalContext:
              "Hay patrón social fuerte, pero hoy está absorbido por supervivencia y sobrecarga.",
          },
          currentContext: {
            currentSituation:
              "Trabajo en algo estable pero muy reactivo; casi toda mi energía se va en sostener funcionamiento inmediato.",
            restrictions: [
              "No puedo resignar ingresos ahora",
              "No puedo mover demasiado a la vez",
            ],
            assets: [
              "Capacidad de coordinación",
              "Lectura de actores",
              "Vínculo interpersonal",
            ],
          },
        },
      },
      {
        id: "operador_de_crisis_con_criterio",
        label: "Operador de crisis con criterio",
        expectation:
          "Debería tender a clear_direction con technical_builder y no derivar a analytical_strategist solo por el lenguaje de criterio y análisis.",
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
              "De chico me gustaba arreglar, ordenar y encontrar la manera concreta de que algo volviera a funcionar.",
            earlyFascinations:
              "Me atraían los sistemas, la resolución de fallas y la organización práctica de tareas y recursos.",
            meaningfulSchoolSubjects:
              "Matemáticas, técnica, física",
            repeatedWorkPatterns:
              "Siempre termino resolviendo fallas, ordenando tareas, priorizando, ajustando procesos y haciendo que la operación salga sin trabarse.",
            naturalSocialRoles:
              "Resolvedor, operador, organizador práctico",
            lossesOrRenunciations:
              "Dejé para después una versión más diseñada de mi trabajo para responder a urgencias constantes.",
            whatFeelsCompressedNow:
              "Apago incendios sobre la marcha y uso menos de lo que podría en diseño más estable.",
            additionalContext:
              "Tiene criterio, pero su patrón dominante sigue siendo operativo y de resolución concreta.",
          },
          currentContext: {
            currentSituation:
              "Resuelvo fallas, ordeno tareas, ajusto procesos y hago que la operación salga sin trabarse.",
            restrictions: [
              "No puedo dejar mi estabilidad actual",
              "Necesito pasos concretos",
            ],
            assets: [
              "Capacidad de ejecución",
              "Experiencia técnica",
              "Orden operativo",
            ],
          },
        },
      },
      {
        id: "narrador_publico_con_olfato_de_oportunidad",
        label: "Narrador público con olfato de oportunidad",
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
              "Lengua, historia, literatura",
            repeatedWorkPatterns:
              "Siempre termino escribiendo, editando, explicando procesos y dándole forma verbal a ideas complejas.",
            naturalSocialRoles:
              "Narrador, editor, constructor de mensaje",
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
  ];