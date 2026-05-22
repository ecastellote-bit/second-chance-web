export const FULL_FLOW_COPY_V2 = {
  intro: {
    eyebrow: "VocationUp — Cuestionario v2 (prueba)",
    title: "Lectura inicial seria, sin promesas vacías",
    description:
      "Versión de prueba con consignas reformuladas. El flujo y el motor de lectura son los mismos; solo cambian las preguntas.",
    bullets: [
      "ordenar tu contexto actual",
      "recuperar señales de historia personal",
      "distinguir entre cansancio, refugio y dirección",
      "recibir una lectura inicial estructurada",
    ],
    primaryCta: "Empezar cuestionario v2",
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
          'Cuando tenés un rato libre durante el trabajo o actividades, ¿a dónde va tu mente? ¿Qué pensamientos o actividades funcionan como tu "escape"?',
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
        'No dejes vacía la pregunta sobre tu "escape".',
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
          "¿Qué sentís que te frustra o te bajonea de tu vida laboral actual? ¿Qué podría cambiar esa situación para bien?",
      },
    },
    validation: {
      summaryTitle: "Antes de seguir, corregí esto:",
      lossesRequired:
        "No dejes vacía la parte sobre lo que fuiste dejando de lado.",
      compressedRequired:
        "No dejes vacía la parte sobre frustración o bajón laboral.",
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
          "Si no existiera ningún impedimento, ¿qué te gustaría ser? ¿O qué te gustaría desarrollar o lograr?",
        placeholder:
          "¿Qué tipo de movimiento te gustaría poder hacer sin romper todo?",
      },
    },
    validation: {
      summaryTitle: "Antes de seguir, corregí esto:",
      restrictionsRequired: "No dejes vacía la parte sobre lo que te ata.",
      assetsRequired: "No dejes vacía la parte sobre en qué sos bueno/a.",
      goalRequired: "No dejes vacía la parte sobre lo que te gustaría ser.",
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
      repeatedWorkPatterns: 'Tu "escape" en el trabajo',
      lossesOrRenunciations: "Lo que fuiste dejando de lado",
      whatFeelsCompressedNow: "Frustración o bajón laboral",
      restrictionsText: "Lo que te ata hoy",
      assetsText: "En qué sos bueno/a",
      transitionGoal: "Lo que te gustaría ser o lograr",
      missingValue: "Todavía vacío",
    },
    backLabel: "Volver",
    nextLabel: "Generar lectura inicial",
    hydratingLabel: "Recuperando tu progreso...",
  },

  result: {
    eyebrow: "Resultado inicial (cuestionario v2)",
    sections: {
      dominantTension: "Tensión dominante",
      hiloConductor: "Hilo conductor",
      plausibleDirections: "Direcciones plausibles",
      actionVectors: "Vectores de acción",
      caminoMinimo: "Camino mínimo",
    },
    fallbacks: {
      noDirections: "Todavía no conviene forzar una dirección específica.",
      noActionVectors:
        "Antes de mover demasiado, hace falta ampliar evidencia.",
    },
    buttons: {
      reentry: "Reiniciar cuestionario v2",
      backToIntro: "Volver al inicio v2",
    },
  },
} as const;
