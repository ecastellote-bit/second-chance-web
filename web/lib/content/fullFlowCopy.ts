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
  } as const;