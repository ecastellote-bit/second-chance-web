export const FULL_FLOW_COPY = {
    intro: {
      eyebrow: "Second Chance — Full Flow v1",
      title: "Lectura inicial seria, sin promesas vacías",
      description:
        "Este flujo no intenta adivinar una vocación mágica. Intenta leer tu historia, tu contexto actual y tus restricciones para detectar qué movimientos laborales tienen más sentido ahora.",
      bullets: [
        "ordenar tu contexto actual",
        "recuperar señales de historia personal",
        "distinguir entre cansancio, refugio y dirección",
        "recibir una lectura inicial estructurada",
      ],
      primaryCta: "Empezar",
      secondaryCta: "Volver",
    },

    step1: {
      stepLabel: "Paso 1 de 5",
      title: "Tu situación actual",
      subtitle: "Acá no busques lucirte. Buscá precisión.",
      fields: {
        age: {
          label: "Edad",
          placeholder: "Ej: 42",
        },
        country: {
          label: "País",
          placeholder: "Ej: Argentina",
        },
        employmentStatus: {
          label: "Situación laboral",
        },
        currentRole: {
          label: "¿A qué te dedicas actualmente?",
          placeholder: "Ej: administrativo, ventas, docencia, operaciones",
        },
        currentSituation: {
          label:
            "Describí dónde estás parado hoy en tu vida, y sobre qué te gustaría pensar o reflexionar en este momento. Puede ser sobre tu trabajo o tus actividades.",
          placeholder:
            "Describí dónde estás parado hoy, sin épica y sin maquillaje.",
        },
        energyLevel: {
          label: "Energía disponible",
        },
        economicPressure: {
          label: "Presión económica",
        },
        familyLoad: {
          label: "Carga familiar/práctica",
        },
      },
      validation: {
        summaryTitle: "Antes de seguir, corregí esto:",
        ageRequired: "La edad no puede quedar vacía.",
        countryRequired: "El país no puede quedar vacío.",
        currentSituationRequired: "Esta respuesta no puede quedar vacía.",
      },
      backLabel: "Volver",
      nextLabel: "Guardar y seguir",
    },

    step2: {
      stepLabel: "Paso 2 de 5",
      title: "Memoria vocacional inicial",
      subtitle:
        "No busques quedar bien. Buscá hechos, patrones y recuerdos concretos.",
      fields: {
        childhoodMemories: {
          label:
            "¿Qué era lo que más disfrutabas de chico/a? Cuéntame sobre lo que más te interesaba antes de los 12 años.",
        },
        earlyFascinations: {
          label:
            "¿Qué cosas siguieron siendo importantes para vos en la adolescencia? ¿Qué soñabas ser en aquel momento?",
        },
        meaningfulSchoolSubjects: {
          label:
            "En el secundario, ¿qué materias o experiencias dentro de la escuela te llamaban la atención o te interesaban?",
        },
        repeatedWorkPatterns: {
          label:
            "Cuando tenés un poco de libertad, energía o margen, ¿a qué tipo de cosas volvés? ¿Qué se repite en vos, aunque cambien los trabajos o etapas?",
        },
        naturalSocialRoles: {
          label:
            "En tu trabajo o actividades, ¿qué lugar ocupas entre las personas que te rodean? ¿Cuál es tu rol entre ellos?",
        },
      },
      validation: {
        summaryTitle: "Antes de seguir, corregí esto:",
        childhoodMemoriesRequired:
          "No dejes vacía la pregunta sobre la infancia.",
        earlyFascinationsRequired:
          "No dejes vacía la pregunta sobre la adolescencia.",
        repeatedWorkPatternsRequired:
          "No dejes vacía la pregunta sobre patrones que se repiten en vos.",
      },
      backLabel: "Volver",
      nextLabel: "Guardar y seguir",
    },

    step3: {
      stepLabel: "Paso 3 de 5",
      title: "Pérdidas, renuncias y compresión",
      subtitle:
        "Acá importa detectar qué se fue apagando y qué parte de tu vida actual te redujo.",
      fields: {
        lossesOrRenunciations: {
          label:
            "¿Qué fuiste dejando de lado por necesidad, cansancio o por haber tenido que adaptarte?",
        },
        whatFeelsCompressedNow: {
          label:
            "¿Qué parte tuya sentís que quedó tapada, achicada o postergada por trabajo, cuentas, responsabilidades o cansancio?",
        },
      },
      validation: {
        summaryTitle: "Antes de seguir, corregí esto:",
        lossesRequired:
          "No dejes vacía la parte sobre lo que fuiste dejando de lado.",
        compressedRequired:
          "No dejes vacía la parte sobre lo que hoy se siente tapado o postergado.",
      },
      backLabel: "Volver",
      nextLabel: "Guardar y seguir",
    },

    step4: {
      stepLabel: "Paso 4 de 5",
      title: "Restricciones y activos actuales",
      subtitle:
        "El sistema también tiene que leer con qué margen real contás hoy.",
      fields: {
        restrictionsText: {
          label:
            '¿Cuáles son las cosas que más "te atan" hoy? ¿Qué obstáculos te impiden lograr lo que querés ser?',
          placeholder: "Una por línea o separadas por comas",
        },
        assetsText: {
          label:
            '¿Qué cosas hacés mejor que otros? O sea, ¿en qué pensás que "sos bueno"?',
          placeholder:
            "Experiencia, contactos, habilidades, credibilidad, herramientas, etc.",
        },
        transitionGoal: {
          label:
            "¿Qué tipo de movimiento te gustaría empezar a probar, sin romper tu realidad actual?",
          placeholder:
            "Ej: probar un rol lateral, un proyecto chico, una formación concreta",
        },
      },
      validation: {
        summaryTitle: "Antes de seguir, corregí esto:",
        restrictionsRequired: "No dejes vacía la parte sobre lo que te ata.",
        assetsRequired: "No dejes vacía la parte sobre en qué sos bueno/a.",
        goalRequired:
          "No dejes vacía la parte sobre el movimiento que te gustaría probar.",
      },
      backLabel: "Volver",
      nextLabel: "Guardar y seguir",
    },

    step5: {
      stepLabel: "Paso 5 de 5",
      title: "Revisión final y envío",
      subtitle:
        "No estamos buscando una respuesta perfecta. Estamos buscando suficiente evidencia para una lectura seria.",
      reviewLabels: {
        currentSituation: "Dónde estás y sobre qué querés reflexionar",
        childhoodMemories: "Infancia (antes de los 12)",
        earlyFascinations: "Adolescencia y sueños",
        repeatedWorkPatterns: "Patrones que volvés cuando hay margen",
        lossesOrRenunciations: "Lo que fuiste dejando de lado",
        whatFeelsCompressedNow: "Parte tapada o postergada",
        restrictionsText: "Lo que te ata hoy",
        assetsText: "En qué sos bueno/a",
        transitionGoal: "Movimiento que te gustaría probar",
        missingValue: "Todavía vacío",
      },
      backLabel: "Volver",
      nextLabel: "Generar lectura inicial",
      hydratingLabel: "Recuperando tu progreso...",
    },

    processing: {
      eyebrow: "Procesando",
      title: "Ordenando señales y restricciones",
      description:
        "Estamos generando una lectura inicial a partir de tu historia y tu situación actual.",
      progressItems: [
        "normalizando contexto actual",
        "leyendo señales autobiográficas",
        "estimando margen de transición",
        "generando vectores de acción plausibles",
        "verificando si hace falta una ronda extra de clarificación",
      ],
      recovery: {
        title: "No pudimos completar la lectura",
        hint: "Tus respuestas siguen guardadas en este dispositivo. Podés reintentar, volver al cuestionario o guardar una copia.",
        retry: "Reintentar lectura",
        download: "Descargar copia de seguridad",
        backToQuestionnaire: "Volver al cuestionario",
        recoverLater: "Recuperar más tarde",
      },
      preservation: {
        title: "No pudimos guardar tu caso con seguridad todavía",
        hint: "Antes de analizar tu lectura, necesitamos confirmar que tus respuestas quedaron preservadas. Podés reintentar ahora o descargar un respaldo.",
        retry: "Reintentar guardado",
        download: "Descargar respaldo",
        backToQuestionnaire: "Volver al cuestionario",
      },
      preservationPostAnalyze: {
        title: "Lectura generada, preservación pendiente",
        hint: "Tu lectura está en este dispositivo. Todavía no confirmamos la copia segura; podés reintentar la preservación.",
        retry: "Reintentar preservación",
      },
    },
  
    result: {
      eyebrow: "Resultado inicial",
      sections: {
        dominantTension: "Tensión dominante",
        hiloConductor: "Hilo conductor",
        plausibleDirections: "Direcciones plausibles",
        actionVectors: "Vectores de acción",
        caminoMinimo: "Camino mínimo",
      },
      fallbacks: {
        noDirections:
          "Todavía no conviene forzar una dirección específica.",
        noActionVectors:
          "Antes de mover demasiado, hace falta ampliar evidencia.",
      },
      buttons: {
        reentry: "Re-entry",
        nextStep: "Ver siguiente paso",
      },
    },
  
    nextStep: {
      eyebrow: "Next step",
      title: "Qué hacer después de esta lectura",
      subtitle:
        "Esto es un placeholder real de continuidad. No es todavía la comunidad completa.",
      sections: {
        routing: "Routing sugerido",
        cierre: "Cierre actual",
        action: "Movimiento más razonable ahora",
      },
      routingLabels: {
        discord_recommended: "Continuidad abierta recomendada",
        cohort_candidate: "Candidato/a a círculo guiado",
        reentry_first: "Conviene reingresar antes de una comunidad",
        self_guided_next_step: "Siguiente paso autoguiado",
        unknown: "Sin routing específico todavía",
      },
      detectedResultPrefix: "Resultado detectado:",
      buttons: {
        backToResult: "Volver al resultado",
        reentry: "Re-entry",
      },
    },
  } as const;