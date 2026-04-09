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
        transitionGoal?: string;
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
    {
      id: "alliance_architect_not_therapist",
      label: "Arquitecto de alianzas, no terapéutico",
      expectation:
        "Debería tender a clear_direction con diplomatic_social_connector y no caer en empathic_guide solo por lenguaje humano o sensibilidad interpersonal.",
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
            "De chico me fascinaba ordenar juegos entre grupos y armar acuerdos cuando aparecían conflictos o intereses cruzados.",
          earlyFascinations:
            "Me interesaban la política, la historia, las alianzas y cómo conviven sectores distintos dentro de un mismo esquema.",
          meaningfulSchoolSubjects:
            "Historia, sociología, literatura política.",
          naturalSocialRoles:
            "Suelo articular personas, mediar tensiones y alinear sectores cuando hay posiciones enfrentadas.",
          repeatedWorkPatterns:
            "Siempre termino coordinando actores, negociando posiciones, conectando áreas y ordenando cruces para destrabar situaciones.",
          lossesOrRenunciations:
            "Dejé pasar funciones institucionales más visibles por priorizar estabilidad y previsibilidad económica.",
          whatFeelsCompressedNow:
            "Siento que esa capacidad está usada de forma táctica y defensiva, no como una función expansiva y bien ubicada.",
          additionalContext:
            "Mi diferencial no es terapéutico. Es leer actores, cuidar vínculos, bajar tensiones, representar posiciones y sostener articulación institucional.",
        },
        currentContext: {
          currentSituation:
            "Estoy estable, pero donde mejor rindo es coordinando actores, leyendo intereses, conectando sectores y ordenando cruces para destrabar situaciones.",
          transitionGoal:
            "Quiero moverme hacia una función de articulación institucional, institutional relations o partnerships.",
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
      id: "crisis_companion_not_political_operator",
      label: "Acompañante de crisis, no operador político",
      expectation:
        "Debería tender a clear_direction con empathic_guide y no confundirse con diplomatic_social_connector solo por ordenar conversaciones o ayudar en contextos tensos.",
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
            "De chico me quedaba escuchando a otros cuando estaban mal y trataba de entender qué les pasaba antes de decir algo.",
          earlyFascinations:
            "Me intrigaban los conflictos humanos, la psicología cotidiana y las preguntas profundas.",
          meaningfulSchoolSubjects:
            "Literatura, filosofía, psicología.",
          naturalSocialRoles:
            "Suelo escuchar, acompañar y hacer preguntas justas cuando alguien está confundido o sobrepasado.",
          repeatedWorkPatterns:
            "Siempre termino escuchando a fondo, acompañando procesos, conteniendo situaciones personales complejas y ayudando a otros a ordenar lo confuso.",
          lossesOrRenunciations:
            "Postergué caminos más claros porque muchas veces quedé sosteniendo a otros.",
          whatFeelsCompressedNow:
            "Siento que doy mucha presencia humana y claridad, pero eso todavía no está canalizado en una dirección propia reconocible.",
          additionalContext:
            "Cuando la tensión sube, mi aporte real es escucha profunda, presencia humana, contención y capacidad de hacer buenas preguntas.",
        },
        currentContext: {
          currentSituation:
            "Hoy sostengo personas en crisis, doy estructura a conversaciones difíciles y ayudo a entender conflictos humanos sin invadir.",
          transitionGoal:
            "Quiero moverme hacia una función de acompañamiento humano con estructura, people support o customer success.",
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
      id: "community_weaver_not_institutional_connector",
      label: "Tejedor de comunidad, no conector institucional",
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
            "Literatura, comunicación, historia social.",
          naturalSocialRoles:
            "Suelo coordinar grupos, escuchar a la gente y dar lenguaje a lo que pasa para que el grupo avance.",
          repeatedWorkPatterns:
            "Siempre termino sosteniendo comunidad, coordinando grupos, escuchando a las personas y construyendo mensajes claros para ordenar la interacción.",
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
          transitionGoal:
            "Quiero moverme hacia community operations o program coordination.",
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
      id: "decision_designer_not_operator",
      label: "Diseñador de decisiones, no operador",
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
            "De chico me entretenía comparando caminos posibles y viendo cuál tenía más lógica antes de mover una pieza.",
          earlyFascinations:
            "Me interesaban los modelos, la estrategia, los escenarios y cómo funciona un sistema por dentro.",
          meaningfulSchoolSubjects:
            "Historia, economía, matemática, filosofía.",
          naturalSocialRoles:
            "Suelo ordenar criterios, comparar alternativas y ayudar a decidir cuando hay complejidad.",
          repeatedWorkPatterns:
            "Siempre termino comparando escenarios, ordenando criterios, leyendo estructura, evaluando alternativas y detectando oportunidades.",
          lossesOrRenunciations:
            "Muchas veces usé esa capacidad solo para responder urgencias en vez de ponerla al centro de mi trabajo.",
          whatFeelsCompressedNow:
            "Mi parte más fuerte aparece pensando escenarios y decisiones, pero hoy queda parcialmente tapada.",
          additionalContext:
            "Mi diferencial real no es ejecutar rápido sino ver el modelo, la lógica detrás del negocio, el costo de cada camino y la oportunidad más sólida.",
        },
        currentContext: {
          currentSituation:
            "Trabajo bien con equipos y clientes, pero donde más rindo es comparando escenarios, leyendo estructura, detectando criterio y viendo oportunidades.",
          transitionGoal:
            "Quiero moverme hacia strategy operations o business analysis.",
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
      id: "execution_operator_with_analysis_language",
      label: "Resolvedor operativo con lenguaje de análisis",
      expectation:
        "Debería tender a clear_direction con technical_builder y no derivar a analytical_strategist solo por vocabulario de criterio o estructura.",
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
            "Taller, matemática, física aplicada.",
          naturalSocialRoles:
            "Suelo ser quien ordena, destraba y hace que la operación no se caiga.",
          repeatedWorkPatterns:
            "Siempre termino resolviendo fallas, ajustando procesos, priorizando, mejorando la operación y haciendo que salga sin trabarse.",
          lossesOrRenunciations:
            "Dejé en pausa ideas más grandes por quedarme sosteniendo crisis y operación.",
          whatFeelsCompressedNow:
            "Apago incendios sobre la marcha y uso menos de lo que podría en diseño operativo más estable.",
          additionalContext:
            "Tengo criterio y análisis, sí, pero puestos al servicio de ejecución, pasos concretos, prioridad y mejora de procesos.",
        },
        currentContext: {
          currentSituation:
            "Hoy rindo mejor cuando tengo que resolver fallas, ajustar procesos, ordenar prioridad y hacer que la operación salga sin trabarse.",
          transitionGoal:
            "Quiero moverme hacia operations design o project operations.",
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
      id: "context_researcher_not_storyteller",
      label: "Investigador de contextos, no narrador",
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
            "De chico podía pasar horas leyendo sobre historia, mapas, culturas y comparando épocas o países.",
          earlyFascinations:
            "Me interesaban la historia, la cultura, los idiomas, los procesos sociales y los contextos culturales.",
          meaningfulSchoolSubjects:
            "Historia, geografía, sociología, idiomas.",
          naturalSocialRoles:
            "Suelo ser quien relaciona autores, compara contextos y conecta ideas de distintos campos.",
          repeatedWorkPatterns:
            "Siempre termino investigando, comparando contextos, leyendo historia, relacionando procesos sociales y conectando ideas de distintos campos.",
          lossesOrRenunciations:
            "Fui dejando en segundo plano esa curiosidad sostenida por priorizar trabajo estable.",
          whatFeelsCompressedNow:
            "Aprendo mucho y conecto muchas ideas, pero casi nunca transformo eso en una trayectoria visible.",
          additionalContext:
            "Mi interés persistente está en comprender cultura, marcos culturales, idiomas y contextos, no en construir mensajes ni relato público.",
        },
        currentContext: {
          currentSituation:
            "Trabajo en algo estable, pero mi interés persistente está en leer historia, cultura, procesos sociales y conectar contextos.",
          transitionGoal:
            "Quiero moverme hacia research support o learning content.",
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
      id: "brand_storyteller_with_cultural_background",
      label: "Narrador de marca con fondo cultural",
      expectation:
        "Debería tender a clear_direction con creative_storyteller y no derivar a cultural_explorer o analytical_strategist por vocabulario sofisticado.",
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
            "De chico me salía escribir, ponerle nombre a las cosas y encontrar la forma verbal más clara para lo que quería decir.",
          earlyFascinations:
            "Me interesaban la escritura, la literatura, la voz, los mensajes y cómo construir sentido con lenguaje.",
          meaningfulSchoolSubjects:
            "Literatura, historia, comunicación.",
          naturalSocialRoles:
            "Suelo ser quien nombra, redacta, edita y transforma ideas dispersas en un relato claro.",
          repeatedWorkPatterns:
            "Siempre termino escribiendo, editando, explicando procesos, dando forma verbal a ideas complejas y construyendo relato para mensajes y posicionamiento.",
          lossesOrRenunciations:
            "Usé mucho lenguaje funcional de trabajo y dejé relegada mi parte más fuerte de construcción narrativa.",
          whatFeelsCompressedNow:
            "Escribo y sintetizo todos los días, pero no siempre desde una dirección reconocible de contenido o relato.",
          additionalContext:
            "Tengo fondo cultural y estratégico, pero mi fuerza real aparece cuando redacto, nombro, verbalizo, construyo mensajes y doy forma a una voz clara.",
        },
        currentContext: {
          currentSituation:
            "Pienso estrategia y enfoque, pero donde realmente rindo es escribiendo, editando, construyendo mensajes y dando claridad narrativa.",
          transitionGoal:
            "Quiero moverme hacia content strategy o editorial projects.",
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
      id: "tactical_support_without_dominant_pattern",
      label: "Sostén táctico sin patrón dominante",
      expectation:
        "Debería tender a insufficient_evidence y no inventar clear_direction cuando solo hay sostén táctico y organización inmediata.",
      payload: {
        profile: {
          age: 42,
          country: "Argentina",
          language: "es",
          employmentStatus: "employed",
          educationLevel: "secondary",
        },
        narrative: {
          childhoodMemories:
            "De chico ayudaba a que las cosas siguieran funcionando, pero sin una fascinación clara y dominante por un tema en particular.",
          earlyFascinations:
            "No había una inclinación nítida; me adaptaba bastante a lo que hacía falta en cada contexto.",
          meaningfulSchoolSubjects:
            "Rendimiento parejo, sin una materia claramente dominante.",
          naturalSocialRoles:
            "Suelo acomodar lo inmediato para que el grupo no se trabe, pero sin una función muy definida.",
          repeatedWorkPatterns:
            "Siempre termino ordenando reuniones, acomodando agendas y destrabando lo inmediato para que el grupo siga.",
          lossesOrRenunciations:
            "Más que renunciar a algo claro, fui entrando en un modo de sostén táctico y adaptación continua.",
          whatFeelsCompressedNow:
            "Siento que respondo a lo urgente y mantengo funcionamiento, pero no aparece todavía un patrón central serio.",
          additionalContext:
            "Hago soporte táctico, acomodo lo que se desordena y ayudo a que no se frene lo inmediato, sin una dirección dominante reconocible.",
        },
        currentContext: {
          currentSituation:
            "Hoy mi trabajo real es sostener lo inmediato, acomodar agendas, ordenar reuniones y destrabar lo que se traba en el día.",
          transitionGoal:
            "Quiero entender primero si hay un patrón real antes de moverme.",
          restrictions: [
            "No puedo dejar ingresos ahora",
            "No puedo mover demasiadas cosas a la vez",
          ],
          assets: [
            "Adaptación",
            "Orden táctico",
            "Sostén inmediato",
            "Disponibilidad",
          ],
        },
      },
    },
    {
        id: "arquitecta_comunitaria_no_terapeuta_individual",
        label: "Arquitecta comunitaria, no terapeuta individual",
        expectation:
          "Debería tender a clear_direction con community_builder y no derivar a empathic_guide solo por la presencia de escucha.",
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
              "De chica armaba grupos, clubes y espacios donde otros pudieran sentirse parte y seguir viniendo.",
            earlyFascinations:
              "Me interesaban las comunidades, la circulación entre personas y cómo sostener pertenencia sin que el grupo se rompa.",
            meaningfulSchoolSubjects:
              "Literatura, historia social, comunicación",
            repeatedWorkPatterns:
              "Siempre termino sosteniendo comunidad, coordinando grupos, escribiendo mensajes claros y ordenando la interacción para que la circulación entre personas no se trabe.",
            naturalSocialRoles:
              "Coordinadora de comunidad, anfitriona, traductora del clima grupal",
            lossesOrRenunciations:
              "Muchas veces quedé sosteniendo espacios colectivos y dejé en segundo plano mi propia dirección.",
            whatFeelsCompressedNow:
              "Mi capacidad de pertenencia y circulación existe, pero hoy aparece más como sostén invisible que como función clara.",
            additionalContext:
              "Escucho, sí, pero al servicio del grupo y la interacción compartida, no desde un acompañamiento individual profundo.",
          },
          currentContext: {
            currentSituation:
              "Hoy donde mejor rindo es sosteniendo comunidad, coordinando grupos, escribiendo mensajes claros y ordenando la circulación entre personas.",
            restrictions: [
              "Necesito continuidad de ingresos",
              "No puedo hacer un salto totalmente incierto",
            ],
            assets: [
              "Construcción de comunidad",
              "Escucha grupal",
              "Mensajes claros",
              "Sostén de grupos",
            ],
          },
        },
      },
      {
        id: "escucha_profunda_no_constructora_de_comunidad",
        label: "Escucha profunda, no constructora de comunidad",
        expectation:
          "Debería tender a clear_direction con empathic_guide y no derivar a community_builder aunque aparezcan equipos o grupos en el contexto.",
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
              "De chica era a quien le contaban cosas difíciles porque podía escuchar a fondo sin apurar ni juzgar.",
            earlyFascinations:
              "Me interesaba entender conflictos humanos, escuchar de verdad y hacer preguntas que ayudaran a ordenar lo confuso.",
            meaningfulSchoolSubjects:
              "Lengua, filosofía, psicología",
            repeatedWorkPatterns:
              "Siempre termino escuchando a fondo, conteniendo, haciendo preguntas justas y ayudando a otros a entender situaciones personales complejas.",
            naturalSocialRoles:
              "Acompañante, escucha profunda, presencia humana con criterio",
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
        id: "negociadora_de_actores_con_sensibilidad",
        label: "Negociadora de actores con sensibilidad, no guía humana",
        expectation:
          "Debería tender a clear_direction con diplomatic_social_connector y no caer en empathic_guide por tener sensibilidad interpersonal.",
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
              "De chica me salía ordenar grupos, acercar posiciones y evitar que distintos intereses chocaran de frente.",
            earlyFascinations:
              "Me atraían la política, la negociación, las alianzas y la lectura de actores con intereses cruzados.",
            meaningfulSchoolSubjects:
              "Historia, formación cívica, lengua",
            repeatedWorkPatterns:
              "Siempre termino articulando actores, negociando posiciones, mediando tensiones, conectando áreas y sosteniendo vínculos institucionales.",
            naturalSocialRoles:
              "Articuladora, negociadora, lectora de actores",
            lossesOrRenunciations:
              "Usé mucho esta capacidad para sostener estructuras y apagar fricciones, no siempre para una línea propia más expansiva.",
            whatFeelsCompressedNow:
              "Mi función aparece muy táctica y defensiva, más que plenamente alineada.",
            additionalContext:
              "Tengo sensibilidad interpersonal, pero no hago contención profunda como centro; mi diferencial real es leer actores, representar posiciones y ordenar acuerdos.",
          },
          currentContext: {
            currentSituation:
              "Estoy estable, pero donde más rindo es coordinando actores, leyendo intereses, conectando sectores y ordenando cruces para destrabar situaciones.",
            restrictions: [
              "Necesito previsibilidad económica",
              "No puedo asumir una transición caótica",
            ],
            assets: [
              "Negociación",
              "Red de contactos",
              "Lectura de actores",
              "Orden de gestión",
            ],
          },
        },
      },
      {
        id: "acompanante_institucional_con_nucleo_humano",
        label: "Acompañante institucional con núcleo humano",
        expectation:
          "Debería tender a clear_direction con empathic_guide y no confundirse con diplomatic_social_connector aunque aparezcan equipos, áreas o institución.",
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
              "De chica era la que escuchaba cuando alguien estaba mal y ayudaba a poner en palabras lo que no podía decir.",
            earlyFascinations:
              "Me interesaban la escucha profunda, los conflictos humanos y la posibilidad de acompañar sin invadir.",
            meaningfulSchoolSubjects:
              "Lengua, psicología, filosofía",
            repeatedWorkPatterns:
              "Siempre termino escuchando a fondo, acompañando procesos, conteniendo y ayudando a otros a ordenar lo confuso, incluso dentro de equipos o instituciones.",
            naturalSocialRoles:
              "Escucha profunda, acompañante, presencia humana",
            lossesOrRenunciations:
              "Muchas veces quedé cumpliendo funciones estables y dejé en segundo plano esa dirección más propia.",
            whatFeelsCompressedNow:
              "Doy mucha claridad y contención, pero todavía no está del todo canalizado en una función reconocible.",
            additionalContext:
              "Aunque aparezcan áreas o equipos, mi diferencial no es negociar posiciones ni alinear sectores, sino comprender el conflicto humano y acompañarlo con criterio.",
          },
          currentContext: {
            currentSituation:
              "Trabajo dentro de una institución, pero donde más rindo es escuchando a fondo a personas sobrepasadas, ordenando conversaciones difíciles y ayudando a entender situaciones personales complejas.",
            restrictions: [
              "Necesito una transición gradual",
              "No puedo perder ingresos de golpe",
            ],
            assets: [
              "Escucha profunda",
              "Capacidad de acompañar",
              "Sensibilidad interpersonal",
              "Presencia humana",
            ],
          },
        },
      },
      {
        id: "curadora_de_contextos_que_escribe_pero_no_narra",
        label: "Curadora de contextos que escribe, no narradora central",
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
              "Desde chica acumulaba autores, épocas, mapas y relaciones entre temas que parecían lejanos.",
            earlyFascinations:
              "Me interesaban la historia, la cultura, los idiomas y la conexión entre contextos distintos.",
            meaningfulSchoolSubjects:
              "Historia, literatura, filosofía",
            repeatedWorkPatterns:
              "Siempre termino investigando contextos, comparando procesos sociales, relacionando autores y escribiendo síntesis para ordenar ideas de distintos campos.",
            naturalSocialRoles:
              "Curadora de ideas, lectora de contextos, relacionadora de materiales",
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
        id: "narradora_con_fondo_cultural_no_curadora",
        label: "Narradora con fondo cultural, no curadora",
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
              "Lengua, literatura, historia",
            repeatedWorkPatterns:
              "Siempre termino escribiendo, editando, nombrando, construyendo relato y dándole forma verbal a ideas complejas para volverlas comunicables.",
            naturalSocialRoles:
              "Narradora, editora, constructora de mensajes",
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
        id: "disenador_estrategico_con_roce_operativo",
        label: "Diseñador estratégico con roce operativo",
        expectation:
          "Debería tender a clear_direction con analytical_strategist y no caer en technical_builder aunque aparezca organización práctica.",
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
              "De chico me gustaba comparar caminos posibles, ver consecuencias y decidir cuál tenía más lógica antes de mover nada.",
            earlyFascinations:
              "Me atraían los escenarios, los modelos, la estrategia y la lectura de oportunidades.",
            meaningfulSchoolSubjects:
              "Historia, matemática, economía",
            repeatedWorkPatterns:
              "Siempre termino comparando escenarios, ordenando criterios, evaluando alternativas, detectando oportunidades y leyendo estructura antes de decidir.",
            naturalSocialRoles:
              "Analista, comparador, diseñador de decisiones",
            lossesOrRenunciations:
              "Fui usando esa capacidad más para responder urgencias puntuales que para ponerla en el centro de mi trabajo.",
            whatFeelsCompressedNow:
              "Mi parte más fuerte aparece pensando escenarios y decisiones, pero hoy queda parcialmente tapada.",
            additionalContext:
              "Puedo ordenar procesos y bajar complejidad, pero eso no es el centro; mi diferencial real está en el análisis, el criterio y la oportunidad.",
          },
          currentContext: {
            currentSituation:
              "Trabajo con equipos y clientes, pero donde más rindo es comparando escenarios, leyendo estructura, detectando criterio y viendo oportunidades.",
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
        id: "jefe_operativo_con_lenguaje_de_criterio",
        label: "Jefe operativo con lenguaje de criterio",
        expectation:
          "Debería tender a clear_direction con technical_builder y no derivar a analytical_strategist solo por usar vocabulario de estructura o criterio.",
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
              "De chico me gustaba arreglar cosas, ordenar tareas y hacer que algo que fallaba volviera a funcionar.",
            earlyFascinations:
              "Me atraían los mecanismos, los procesos concretos y cómo mejorar algo que estaba trabado.",
            meaningfulSchoolSubjects:
              "Técnica, matemática, física",
            repeatedWorkPatterns:
              "Siempre termino resolviendo fallas, ajustando procesos, priorizando, mejorando la operación y haciendo que salga sin trabarse.",
            naturalSocialRoles:
              "Resolvedor, operador, organizador práctico",
            lossesOrRenunciations:
              "Muchas veces dejé en pausa ideas más amplias por quedarme sosteniendo crisis y operación.",
            whatFeelsCompressedNow:
              "Apago incendios sobre la marcha y uso menos de lo que podría en diseño operativo más estable.",
            additionalContext:
              "Tengo criterio, sí, pero al servicio de ejecución, pasos concretos, prioridad y mejora de procesos; mi patrón dominante no es estratégico sino operativo.",
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
        id: "conector_social_fuertemente_comprimido",
        label: "Conector social fuertemente comprimido",
        expectation:
          "Debería tender a compressed_life con diplomatic_social_connector y no a clear_direction, porque el patrón está fuerte pero la vida actual está demasiado comprimida.",
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
              "Historia, lengua, formación cívica",
            repeatedWorkPatterns:
              "En cualquier trabajo termino articulando personas, negociando posiciones, conectando sectores y sosteniendo funcionamiento entre áreas.",
            naturalSocialRoles:
              "Articulador, mediador práctico, coordinador de actores",
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
        id: "conector_social_claro_con_restricciones_manejables",
        label: "Conector social claro con restricciones manejables",
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
              "Historia, lengua, educación cívica",
            repeatedWorkPatterns:
              "Siempre termino coordinando actores, conectando áreas, negociando posiciones y ordenando cruces para destrabar situaciones.",
            naturalSocialRoles:
              "Articulador, coordinador humano, lector de intereses",
            lossesOrRenunciations:
              "No siempre pude darle forma visible a esa capacidad, pero no siento que esté completamente anulada por el contexto.",
            whatFeelsCompressedNow:
              "Hay partes subutilizadas, pero todavía veo una línea posible y no sólo compresión.",
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
      }
  ];