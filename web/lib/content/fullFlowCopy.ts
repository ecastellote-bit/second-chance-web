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
          label: "Rol actual",
          placeholder: "Ej: administrativo, ventas, docencia, operaciones",
        },
        currentSituation: {
          label: "Situación actual",
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
        currentSituationRequired:
          "La situación actual no puede quedar vacía.",
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
          label: "¿Qué te gustaba hacer de chico/a sin que nadie te lo pidiera?",
        },
        earlyFascinations: {
          label: "¿Qué te fascinaba o te atraía de forma persistente?",
        },
        meaningfulSchoolSubjects: {
          label: "¿Qué materias o experiencias educativas te dejaban algo?",
        },
        repeatedWorkPatterns: {
          label: "¿Qué patrones se repiten en tus trabajos o actividades?",
        },
        naturalSocialRoles: {
          label: "¿Qué lugar solés ocupar naturalmente entre otras personas?",
        },
      },
      validation: {
        summaryTitle: "Antes de seguir, corregí esto:",
        childhoodMemoriesRequired:
          "No dejes vacía la pregunta sobre infancia.",
        earlyFascinationsRequired:
          "No dejes vacía la pregunta sobre fascinaciones.",
        repeatedWorkPatternsRequired:
          "No dejes vacía la pregunta sobre patrones repetidos.",
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
            "¿Qué fuiste dejando de lado por necesidad, cansancio o adaptación?",
        },
        whatFeelsCompressedNow: {
          label:
            "¿Qué sentís hoy más comprimido o achicado en tu vida laboral?",
        },
      },
      validation: {
        summaryTitle: "Antes de seguir, corregí esto:",
        lossesRequired:
          "No dejes vacía la parte sobre pérdidas o renuncias.",
        compressedRequired:
          "No dejes vacía la parte sobre lo que hoy se siente comprimido.",
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
          label: "Restricciones actuales",
          placeholder: "Una por línea o separadas por comas",
        },
        assetsText: {
          label: "Activos actuales",
          placeholder:
            "Experiencia, contactos, habilidades, credibilidad, herramientas, etc.",
        },
        transitionGoal: {
          label: "Objetivo de transición",
          placeholder:
            "¿Qué tipo de movimiento te gustaría poder hacer sin romper todo?",
        },
      },
      validation: {
        summaryTitle: "Antes de seguir, corregí esto:",
        restrictionsRequired:
          "No dejes vacías las restricciones actuales.",
        assetsRequired:
          "No dejes vacíos los activos actuales.",
        goalRequired:
          "No dejes vacío el objetivo de transición.",
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
        currentSituation: "Situación actual",
        childhoodMemories: "Infancia / memoria inicial",
        earlyFascinations: "Fascinaciones",
        repeatedWorkPatterns: "Patrones repetidos",
        lossesOrRenunciations: "Pérdidas o renuncias",
        whatFeelsCompressedNow: "Vida comprimida hoy",
        restrictionsText: "Restricciones actuales",
        assetsText: "Activos actuales",
        transitionGoal: "Objetivo de transición",
        missingValue: "Todavía vacío",
      },
      backLabel: "Volver",
      nextLabel: "Generar lectura inicial",
      hydratingLabel: "Recuperando tu progreso...",
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