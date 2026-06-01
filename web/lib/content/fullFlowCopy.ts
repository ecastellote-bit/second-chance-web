export const FULL_FLOW_COPY = {
  intro: {
    eyebrow: "Lectura vocacional",
    title: "Tu lectura empieza acá",
    description:
      "No es un test de personalidad ni un formulario para “quedar bien”. Es una lectura seria de tu historia y tu momento actual, para orientar tu próximo movimiento con honestidad.",
    bullets: [
      "Contá tu situación y tu historia con tus palabras",
      "Una escena concreta vale más que una respuesta prolija",
      "Recibís una devolución estructurada — no una etiqueta vacía",
      "Podés pausar; lo que escribís queda preservado en este dispositivo",
    ],
    primaryCta: "Empezar mi lectura",
    secondaryCta: "Volver",
  },

  step1: {
    stepLabel: "Estación 1 de 5",
    title: "Tu punto de partida",
    subtitle:
      "No hace falta escribir perfecto. Lo importante es que aparezca una escena real de tu vida, no una respuesta preparada.",
    containment:
      "Podés escribir con tus palabras. Si dudás entre varias cosas, contá la que más se repite hoy.",
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
        label: "Situación laboral hoy",
      },
      currentRole: {
        label: "¿A qué te dedicás actualmente?",
        placeholder: "Ej: administración, ventas, docencia, oficio propio",
      },
      currentSituation: {
        label:
          "¿Dónde estás parado/a hoy — en el trabajo, en lo personal o en ambos? ¿Sobre qué necesitás pensar ahora?",
        placeholder:
          "Escribí como hablarías con alguien que intenta entenderte de verdad. Una escena concreta ayuda más que un resumen prolijo.",
      },
      energyLevel: {
        label: "Energía disponible",
      },
      economicPressure: {
        label: "Presión económica",
      },
      familyLoad: {
        label: "Carga familiar o práctica",
      },
    },
    validation: {
      summaryTitle: "Antes de seguir, completá esto:",
      ageRequired: "La edad no puede quedar vacía.",
      countryRequired: "El país no puede quedar vacío.",
      currentSituationRequired: "Contanos al menos una escena de dónde estás hoy.",
    },
    backLabel: "Volver",
    nextLabel: "Continuar mi lectura",
  },

  step2: {
    stepLabel: "Estación 2 de 5",
    title: "Lo que se repite en tu historia",
    subtitle:
      "Buscamos patrones y recuerdos concretos — no una biografía ordenada.",
    containment:
      "No estamos buscando una etiqueta rápida. Esta lectura mejora cuando aparecen detalles reales.",
    fields: {
      childhoodMemories: {
        label:
          "De chico/a, ¿qué te absorbía antes de los 12 años? Contá una escena o un interés que todavía reconozcas.",
      },
      earlyFascinations: {
        label:
          "En la adolescencia, ¿qué seguía importándote? ¿Qué soñabas ser o hacer?",
      },
      meaningfulSchoolSubjects: {
        label:
          "En el secundario, ¿qué materias o momentos te despertaban curiosidad?",
      },
      repeatedWorkPatterns: {
        label:
          "¿Qué situación se repitió más de una vez en tu vida laboral o personal — aunque cambien los trabajos?",
      },
      naturalSocialRoles: {
        label:
          "Entre otras personas, ¿qué rol ocupás con naturalidad? (ej: ordenar, cuidar, explicar, impulsar)",
      },
    },
    validation: {
      summaryTitle: "Antes de seguir, completá esto:",
      childhoodMemoriesRequired: "Contá al menos un recuerdo de la infancia.",
      earlyFascinationsRequired: "Contá al menos algo de la adolescencia.",
      repeatedWorkPatternsRequired: "Contá al menos un patrón que se repite en vos.",
    },
    backLabel: "Volver",
    nextLabel: "Continuar mi lectura",
  },

  step3: {
    stepLabel: "Estación 3 de 5",
    title: "Lo que todavía aparece vivo",
    subtitle:
      "Acá importa nombrar qué se fue apagando y qué parte de tu vida sentís comprimida hoy.",
    containment:
      "Una escena concreta vale más que una respuesta perfecta. No hace falta escribir lindo.",
    fields: {
      lossesOrRenunciations: {
        label:
          "¿Qué fuiste dejando de lado por necesidad, cansancio o por adaptarte a lo que había?",
      },
      whatFeelsCompressedNow: {
        label:
          "¿Qué parte de tu vida laboral o personal sentís que se comprimió demasiado?",
      },
    },
    validation: {
      summaryTitle: "Antes de seguir, completá esto:",
      lossesRequired: "Contá al menos algo que fuiste dejando de lado.",
      compressedRequired: "Contá qué se siente comprimido o postergado hoy.",
    },
    backLabel: "Volver",
    nextLabel: "Continuar mi lectura",
  },

  step4: {
    stepLabel: "Estación 4 de 5",
    title: "Dónde aparece tu energía real",
    subtitle:
      "Tu lectura también necesita leer con qué margen contás hoy — ataduras y recursos.",
    containment:
      "Si dudás entre varias cosas, elegí las que más pesan en tu día a día.",
    fields: {
      restrictionsText: {
        label: "¿Qué te ata hoy? (tiempo, dinero, miedo, responsabilidades)",
        placeholder: "Una por línea o separadas por comas",
      },
      assetsText: {
        label: "¿En qué sos especialmente bueno/a o confiable?",
        placeholder: "Experiencia, contactos, oficio, paciencia, ideas, etc.",
      },
      transitionGoal: {
        label: "¿Qué movimiento te gustaría probar sin romper tu realidad actual?",
        placeholder: "Ej: un rol lateral, un proyecto chico, una formación concreta",
      },
    },
    validation: {
      summaryTitle: "Antes de seguir, completá esto:",
      restrictionsRequired: "Contá al menos una atadura o límite real.",
      assetsRequired: "Contá al menos un recurso o fortaleza.",
      goalRequired: "Contá al menos un movimiento que te gustaría probar.",
    },
    backLabel: "Volver",
    nextLabel: "Continuar mi lectura",
  },

  step5: {
    stepLabel: "Estación 5 de 5",
    title: "Qué movimiento tendría sentido ahora",
    subtitle:
      "Revisá con calma. No buscamos perfección: buscamos suficiente verdad para una lectura justa.",
    containment:
      "Si algo quedó corto, podés volver a la estación anterior antes de generar tu lectura.",
    reviewLabels: {
      currentSituation: "Dónde estás y sobre qué querés reflexionar",
      childhoodMemories: "Infancia (antes de los 12)",
      earlyFascinations: "Adolescencia y sueños",
      repeatedWorkPatterns: "Patrones que volvés cuando hay margen",
      lossesOrRenunciations: "Lo que fuiste dejando de lado",
      whatFeelsCompressedNow: "Parte comprimida hoy",
      restrictionsText: "Lo que te ata hoy",
      assetsText: "En qué sos bueno/a",
      transitionGoal: "Movimiento que te gustaría probar",
      missingValue: "Todavía vacío",
    },
    validation: {
      summaryTitle: "Antes de seguir, completá esto:",
    },
    backLabel: "Volver",
    nextLabel: "Generar mi lectura",
    hydratingLabel: "Recuperando tu lectura en curso…",
  },

  processing: {
    eyebrow: "Preparando tu lectura",
    title: "Estamos preparando tu lectura",
    description:
      "Ordenamos las señales principales de tu historia para devolverte una lectura que puedas revisar con calma. Esto puede tardar unos minutos.",
    waitNotice:
      "Puede demorar hasta 2 minutos. No cierres esta pantalla — tu lectura sigue en curso.",
    progressItems: [
      "ordenando las señales principales de tu historia",
      "conectando tus respuestas con posibles caminos",
      "buscando una forma clara de devolverte lo que aparece",
      "preparando una lectura que puedas revisar con calma",
      "viendo si hace falta una aclaración más",
    ],
    recovery: {
      title: "No pudimos completar la lectura",
      hint: "Tus respuestas siguen en este dispositivo. Podés reintentar, volver al cuestionario o descargar una copia.",
      retry: "Reintentar lectura",
      download: "Descargar copia de seguridad",
      backToQuestionnaire: "Volver a mi lectura",
      recoverLater: "Recuperar más tarde",
    },
    preservation: {
      title: "Todavía no confirmamos que tu lectura quedó disponible",
      hint: "Antes de devolverte la lectura, necesitamos asegurarnos de que podés volver a verla. Podés reintentar o descargar un respaldo en este dispositivo.",
      retry: "Reintentar",
      download: "Descargar respaldo",
      backToQuestionnaire: "Volver a mi lectura",
    },
    preservationPostAnalyze: {
      title: "Lectura lista — confirmación pendiente",
      hint: "Tu lectura está lista en este dispositivo. Estamos confirmando que quede disponible para que puedas volver a verla.",
      retry: "Reintentar confirmación",
    },
  },

  result: {
    eyebrow: "Tu devolución",
    sections: {
      dominantTension: "Tensión dominante",
      hiloConductor: "Hilo conductor",
      plausibleDirections: "Direcciones plausibles",
      actionVectors: "Vectores de acción",
      caminoMinimo: "Camino mínimo",
    },
    fallbacks: {
      noDirections: "Todavía no conviene forzar una dirección específica.",
      noActionVectors: "Antes de mover demasiado, hace falta ampliar lo que contaste.",
    },
    buttons: {
      reentry: "Reingresar",
      nextStep: "Ver siguiente paso",
    },
  },

  nextStep: {
    eyebrow: "Después de tu lectura",
    title: "Qué hacer ahora",
    subtitle:
      "Una guía breve para tu próximo movimiento en VocationUp.",
    sections: {
      routing: "Camino sugerido",
      cierre: "Cierre actual",
      action: "Movimiento más razonable ahora",
    },
    routingLabels: {
      discord_recommended: "Continuidad abierta recomendada",
      cohort_candidate: "Candidato/a a círculo guiado",
      reentry_first: "Conviene reingresar antes del barrio",
      self_guided_next_step: "Siguiente paso autoguiado",
      unknown: "Sin camino específico todavía",
    },
    detectedResultPrefix: "Lectura detectada:",
    buttons: {
      backToResult: "Volver a mi devolución",
      reentry: "Reingresar",
    },
  },
} as const;
