import type { UserIntake } from "@/lib/types/intake";

export type EvaluationCase = {
  id: string;
  label: string;
  expectation: string;
  payload: UserIntake;
};

export const EVALUATION_CASES: EvaluationCase[] = [
  {
    id: "compressed_life_case",
    label: "Vida comprimida con margen mínimo",
    expectation:
      "Debería tender a compressed_life o, como mínimo, evitar clear_direction fácil.",
    payload: {
      profile: {
        age: 46,
        country: "Argentina",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "secondary",
        dependents: 3,
      },
      currentContext: {
        currentRole: "Empleado administrativo",
        currentSituation:
          "Trabajo muchas horas, llego cansado, necesito ingresos estables y no puedo improvisar. Siento que sostengo todo pero me fui apagando.",
        energyLevel: "very_low",
        economicPressure: "very_high",
        familyLoad: "heavy",
        restrictions: [
          "Necesito ingresos estables",
          "No puedo hacer un cambio brusco",
          "Tengo poco tiempo libre",
        ],
        assets: [
          "Experiencia laboral sostenida",
          "Responsabilidad",
          "Capacidad de sostener rutina",
        ],
        transitionGoal:
          "Encontrar una salida gradual sin romper lo poco estable que tengo",
      },
      narrative: {
        childhoodMemories:
          "De chico me gustaba leer, escribir y pensar ideas, pero eso quedó muy atrás.",
        earlyFascinations:
          "Me interesaban la historia, la política y entender a la gente.",
        meaningfulSchoolSubjects:
          "Historia y lengua me dejaban algo, pero no seguí por ahí.",
        repeatedWorkPatterns:
          "Suelo cumplir, sostener, aguantar y resolver lo urgente más que construir algo propio.",
        naturalSocialRoles:
          "A veces ordeno o acompaño, pero hoy casi no me queda resto.",
        lossesOrRenunciations:
          "Fui dejando intereses, curiosidad y ganas por necesidad económica.",
        whatFeelsCompressedNow:
          "Mi vida laboral se volvió pura supervivencia y siento que me achiqué.",
        additionalContext:
          "No busco una fantasía. Busco una lectura honesta.",
      },
    },
  },
  {
    id: "insufficient_evidence_case",
    label: "Caso ambiguo con evidencia insuficiente",
    expectation:
      "Debería caer en insufficient_evidence y no inventar dirección.",
    payload: {
      profile: {
        age: 34,
        country: "Chile",
        language: "es",
        employmentStatus: "between_roles",
        educationLevel: "university",
        dependents: 0,
      },
      currentContext: {
        currentRole: "Sin rol estable",
        currentSituation:
          "Estoy entre trabajos y no tengo muy claro qué quiero.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "light",
        restrictions: ["Necesito volver a trabajar pronto"],
        assets: ["Título universitario"],
        transitionGoal: "Encontrar algo que me ordene",
      },
      narrative: {
        childhoodMemories: "Me gustaban distintas cosas.",
        earlyFascinations: "A veces me interesaban temas variados.",
        meaningfulSchoolSubjects: "No hubo una materia muy clara.",
        repeatedWorkPatterns: "Tuve trabajos distintos sin mucho patrón.",
        naturalSocialRoles: "Depende del grupo.",
        lossesOrRenunciations: "No sé si dejé algo claro atrás.",
        whatFeelsCompressedNow: "Más que comprimido, me siento confundido.",
        additionalContext: "Necesito más claridad, pero no tengo mucho más para agregar.",
      },
    },
  },
  {
    id: "analytical_strategist_case",
    label: "Perfil analítico con señales convergentes",
    expectation:
      "Debería poder acercarse a clear_direction o al menos mostrar dirección plausible más nítida.",
    payload: {
      profile: {
        age: 39,
        country: "México",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "university",
        dependents: 1,
      },
      currentContext: {
        currentRole: "Coordinador de operaciones",
        currentSituation:
          "Estoy estable, pero noto que siempre termino ordenando problemas, viendo patrones y pensando mejoras.",
        energyLevel: "high",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["No quiero perder estabilidad de golpe"],
        assets: [
          "Experiencia coordinando procesos",
          "Pensamiento estructural",
          "Capacidad analítica",
        ],
        transitionGoal:
          "Moverme gradualmente hacia algo más estratégico y menos reactivo",
      },
      narrative: {
        childhoodMemories:
          "De chico me entretenía armando sistemas, clasificando cosas y entendiendo cómo funcionaban.",
        earlyFascinations:
          "Me interesaban los mapas, la lógica, los juegos de estrategia y entender estructuras.",
        meaningfulSchoolSubjects:
          "Matemática, historia y cualquier materia donde hubiera que analizar y relacionar.",
        repeatedWorkPatterns:
          "En cualquier trabajo termino detectando patrones, ordenando procesos y proponiendo mejoras.",
        naturalSocialRoles:
          "Suelo ser quien ordena la complejidad y baja problemas a algo manejable.",
        lossesOrRenunciations:
          "Fui dejando de lado la parte más estratégica por urgencias operativas.",
        whatFeelsCompressedNow:
          "Siento que resuelvo demasiado en corto y uso poco mi capacidad de análisis de fondo.",
        additionalContext:
          "Me interesa una lectura concreta, no motivacional.",
      },
    },
  },
  {
    id: "community_builder_case",
    label: "Perfil social/articulador con señales repetidas",
    expectation:
      "Debería detectar una dirección social/articuladora sin inflarla de más.",
    payload: {
      profile: {
        age: 37,
        country: "Uruguay",
        language: "es",
        employmentStatus: "self_employed",
        educationLevel: "university",
        dependents: 1,
      },
      currentContext: {
        currentRole: "Freelance en proyectos varios",
        currentSituation:
          "Me sostengo, pero veo que lo que mejor hago es conectar personas, coordinar equipos y sostener procesos.",
        energyLevel: "medium",
        economicPressure: "high",
        familyLoad: "moderate",
        restrictions: ["Necesito más previsibilidad económica"],
        assets: [
          "Red de contactos",
          "Capacidad de coordinación",
          "Buena comunicación",
        ],
        transitionGoal:
          "Encontrar un rol más estable donde articular personas y procesos",
      },
      narrative: {
        childhoodMemories:
          "De chica organizaba juegos, reunía grupos y me gustaba que todos encontraran su lugar.",
        earlyFascinations:
          "Me atraían los grupos, los proyectos compartidos y las dinámicas entre personas.",
        meaningfulSchoolSubjects:
          "Me gustaban las actividades grupales, lengua y espacios de participación.",
        repeatedWorkPatterns:
          "Siempre termino coordinando gente, mediando tensiones y sosteniendo el funcionamiento del grupo.",
        naturalSocialRoles:
          "Ocupo un lugar de articulación, contención y orden entre personas.",
        lossesOrRenunciations:
          "Por necesidad económica acepté trabajos que no aprovechaban eso.",
        whatFeelsCompressedNow:
          "Siento que hago tareas aisladas cuando mi fuerza real aparece trabajando con otros.",
        additionalContext:
          "No quiero que me idealicen. Quiero saber si esto realmente tiene traducción laboral.",
      },
    },
  },
  {
    id: "technical_builder_case",
    label: "Perfil técnico/práctico con dirección operativa",
    expectation:
      "Debería detectar una dirección técnica/operativa plausible, sin romantizarla.",
    payload: {
      profile: {
        age: 41,
        country: "Colombia",
        language: "es",
        employmentStatus: "employed",
        educationLevel: "technical",
        dependents: 2,
      },
      currentContext: {
        currentRole: "Supervisor técnico",
        currentSituation:
          "Tengo experiencia práctica y siempre termino mejorando cómo se hacen las cosas.",
        energyLevel: "medium",
        economicPressure: "medium",
        familyLoad: "moderate",
        restrictions: ["No puedo volver a estudiar una carrera larga"],
        assets: [
          "Experiencia técnica",
          "Capacidad de ejecución",
          "Orden operativo",
        ],
        transitionGoal:
          "Pasar a algo más diseñado y menos puramente reactivo dentro del mundo operativo",
      },
      narrative: {
        childhoodMemories:
          "Me gustaba armar, desarmar, reparar y entender cómo funcionaban los objetos.",
        earlyFascinations:
          "Siempre me atrajeron las herramientas, los mecanismos y la mejora práctica.",
        meaningfulSchoolSubjects:
          "Me servían más los espacios técnicos que los puramente teóricos.",
        repeatedWorkPatterns:
          "Termino ordenando tareas, resolviendo fallas y mejorando procesos concretos.",
        naturalSocialRoles:
          "Ocupo un lugar de ejecución confiable y resolución práctica.",
        lossesOrRenunciations:
          "Dejé de lado crecimiento más estructurado por quedarme en lo urgente.",
        whatFeelsCompressedNow:
          "Siento que resuelvo demasiado sobre la marcha y diseño poco.",
        additionalContext:
          "Quiero una lectura realista y aplicable.",
      },
    },
  },
];