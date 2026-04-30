import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";

type ContextualForceKind =
  | "public_voice_or_communication"
  | "civic_or_social_incidence"
  | "group_building_or_leadership"
  | "creative_narrative_expression"
  | "interpretation_or_explanation_for_others"
  | "care_listening_or_emotional_support"
  | "technical_practical_construction"
  | "organizational_institutional_sense"
  | "analytical_strategic_reading"
  | "aesthetic_visual_creation"
  | "entrepreneurial_initiative"
  | "community_belonging_and_sustainment"
  | "compressed_capacity"
  | "stability_constraint"
  | "exposure_fear"
  | "available_assets";

type ContextualForce = {
  kind: ContextualForceKind;
  label: string;
  strength: number;
  evidence: string[];
  interpretation: string;
};

type FamilyAdjustment = {
  family: string;
  direction: "raise" | "keep" | "watch" | "lower";
  strength: number;
  reason: string;
};

type ThemeHint = {
  themeId: string;
  label: string;
  reason: string;
  linkedFamilies: string[];
  activationFit: "high" | "medium" | "low";
  caution?: string;
};

type ActivationHint = {
  path:
    | "asociarme_con_otras_personas"
    | "formarme_en_algo_nuevo"
    | "integrar_proyectos_existentes"
    | "armar_mi_propio_proyecto"
    | "explorar_primero_la_comunidad";
  fit: "high" | "medium" | "low";
  reason: string;
};

export type ContextualSituationReview = {
  judgeId: "contextual_situation_judge";
  verdict:
    | "context_supports_current_reading"
    | "context_suggests_frontier"
    | "context_suggests_human_review"
    | "context_insufficient";

  confidence: number;
  situationFrame: string;
  summary: string;
  forces: ContextualForce[];
  familyAdjustments: FamilyAdjustment[];
  themeHints: ThemeHint[];
  activationHints: ActivationHint[];
  cautions: string[];
  shouldInfluenceDiagnostic: boolean;
  shouldInfluenceGuidedSelection: boolean;

  recommendedUse?: string;
  dominantContext?: string;
  contextSummary?: string;
  suggestedPrimaryFamily?: string;
  suggestedFrontier?: string[];
  shouldAdjustDiagnosis?: boolean;
  shouldOpenFrontier?: boolean;
  shouldRequestHumanReview?: boolean;
  contextualForces?: ContextualForce[];
  suggestedThemes?: ThemeHint[];
  warnings?: string[];
  notes?: string[];
};

type SignalGroup = {
  label: string;
  terms: string[];
};

type ForceDefinition = {
  kind: ContextualForceKind;
  label: string;
  minEvidence: number;
  baseStrength: number;
  evidenceWeight: number;
  signalGroups: SignalGroup[];
  interpretation: string;
};

const STRONG_FORCE_THRESHOLD = 0.7;
const MEDIUM_FORCE_THRESHOLD = 0.58;

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFamilyKey(value: unknown): string {
  return normalizeText(value)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(normalizeText(term)));
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .filter((value) => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function collectText(intake: UserIntake): string {
  const safe = intake as any;

  return [
    safe?.profile?.age,
    safe?.profile?.country,
    safe?.profile?.language,
    safe?.profile?.occupation,
    safe?.profile?.employmentStatus,
    safe?.profile?.educationLevel,
    safe?.profile?.dependents,

    safe?.currentContext?.currentRole,
    safe?.currentContext?.currentSituation,
    safe?.currentContext?.energyLevel,
    safe?.currentContext?.economicPressure,
    safe?.currentContext?.familyLoad,
    safe?.currentContext?.restrictionsText,
    safe?.currentContext?.assetsText,
    safe?.currentContext?.transitionGoal,

    safe?.currentContext?.constraints,
    safe?.currentContext?.assets,

    safe?.narrative?.childhoodMemories,
    safe?.narrative?.earlyFascinations,
    safe?.narrative?.meaningfulSchoolSubjects,
    safe?.narrative?.repeatedWorkPatterns,
    safe?.narrative?.naturalSocialRoles,
    safe?.narrative?.lossesOrRenunciations,
    safe?.narrative?.whatFeelsCompressedNow,
    safe?.narrative?.additionalContext,
  ]
    .filter((item) => item !== null && typeof item !== "undefined")
    .join("\n");
}

function scoreFromEvidence(
  count: number,
  base = 0.35,
  evidenceWeight = 0.14,
): number {
  return Math.min(0.95, base + count * evidenceWeight);
}

function collectEvidence(text: string, groups: SignalGroup[]): string[] {
  return uniqueStrings(
    groups
      .filter((group) => includesAny(text, group.terms))
      .map((group) => group.label),
  );
}

function buildForce(
  text: string,
  definition: ForceDefinition,
): ContextualForce | null {
  const evidence = collectEvidence(text, definition.signalGroups);

  /**
   * Anti-cebado:
   * La mayoría de las fuerzas necesitan dos grupos de evidencia independientes.
   * Algunas fuerzas de contexto duro permiten una sola evidencia, pero con términos
   * más específicos para evitar que palabras genéricas decidan demasiado.
   */
  if (evidence.length < definition.minEvidence) return null;

  return {
    kind: definition.kind,
    label: definition.label,
    strength: scoreFromEvidence(
      evidence.length,
      definition.baseStrength,
      definition.evidenceWeight,
    ),
    evidence,
    interpretation: definition.interpretation,
  };
}

function getForce(
  forces: ContextualForce[],
  kind: ContextualForceKind,
): ContextualForce | undefined {
  return forces.find((force) => force.kind === kind);
}

function hasForce(
  forces: ContextualForce[],
  kind: ContextualForceKind,
): boolean {
  return Boolean(getForce(forces, kind));
}

function getTopFamilies(params: {
  finalReading: FinalReading;
  familyScores?: unknown[];
}): string[] {
  const safeReading = params.finalReading as any;
  const familyScores = Array.isArray(params.familyScores)
    ? params.familyScores
    : Array.isArray(safeReading?.familyScores)
      ? safeReading.familyScores
      : [];

  return familyScores
    .slice()
    .sort((a: any, b: any) => {
      const scoreA = typeof a?.score === "number" ? a.score : 0;
      const scoreB = typeof b?.score === "number" ? b.score : 0;
      return scoreB - scoreA;
    })
    .slice(0, 5)
    .map((item: any) => item?.id ?? item?.familyId ?? item?.family ?? item?.label)
    .filter((item: unknown): item is string => typeof item === "string");
}

const FORCE_DEFINITIONS: ForceDefinition[] = [
  {
    kind: "public_voice_or_communication",
    label: "Voz pública o comunicación hacia otros",
    minEvidence: 2,
    baseStrength: 0.38,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "comunicación hacia otros",
        terms: ["comunicar", "comunicacion", "transmitir", "mensaje"],
      },
      {
        label: "audiencia o público explícito",
        terms: ["audiencia", "publico", "pública", "publica", "frente a otros"],
      },
      {
        label: "voz, postura o decir",
        terms: ["voz", "decir", "decirlo", "postura", "opinar", "opinion"],
      },
      {
        label: "medios o escena pública",
        terms: ["radio", "tv", "television", "medios", "programa", "entrevista"],
      },
      {
        label: "formatos editoriales o de contenido",
        terms: ["columna", "columnas", "editorial", "hilo", "contenido", "video"],
      },
      {
        label: "agenda o conversación pública",
        terms: ["agenda", "conversacion publica", "instalar una idea"],
      },
    ],
    interpretation:
      "Aparecen señales de comunicación orientada a otros, audiencia, voz, postura o circulación pública. No debe confundirse automáticamente con escritura privada.",
  },
  {
    kind: "civic_or_social_incidence",
    label: "Incidencia cívica, social o política",
    minEvidence: 2,
    baseStrength: 0.38,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "política o vida pública",
        terms: ["politica", "politico", "politicos", "partido", "elecciones"],
      },
      {
        label: "Estado, gobierno o instituciones públicas",
        terms: ["estado", "gobierno", "municipio", "legislatura", "institucion"],
      },
      {
        label: "causa, injusticia o problema colectivo",
        terms: [
          "causa",
          "injusticia",
          "problema colectivo",
          "asuntos colectivos",
          "reclamo",
        ],
      },
      {
        label: "incidencia, presión o cambio",
        terms: [
          "incidir",
          "presionar",
          "denunciar",
          "cambiar algo",
          "respuesta concreta",
        ],
      },
      {
        label: "dirigencia, militancia o activismo",
        terms: [
          "dirigente",
          "militancia",
          "militar",
          "activista",
          "lider politico",
        ],
      },
    ],
    interpretation:
      "Aparece una orientación hacia asuntos colectivos, vida pública, instituciones, causas o incidencia. Esto puede modificar la lectura de una simple comunicación.",
  },
  {
    kind: "group_building_or_leadership",
    label: "Construcción grupal o liderazgo",
    minEvidence: 2,
    baseStrength: 0.36,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "grupos o equipos",
        terms: ["grupo", "grupos", "equipo", "equipos", "comunidad"],
      },
      {
        label: "liderar o conducir",
        terms: ["liderar", "liderazgo", "conducir", "coordinar", "organizar gente"],
      },
      {
        label: "armado colectivo",
        terms: ["armar con otros", "crear grupos", "conformacion", "convocar"],
      },
      {
        label: "pertenencia o circulación grupal",
        terms: ["pertenencia", "participacion", "red", "redes", "vinculos"],
      },
    ],
    interpretation:
      "Hay señales de armado social, coordinación, liderazgo o construcción con otros. No debe leerse sólo como rasgo social liviano.",
  },
  {
    kind: "creative_narrative_expression",
    label: "Expresión creativa o narrativa",
    minEvidence: 2,
    baseStrength: 0.36,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "escritura o relato",
        terms: ["escribir", "historias", "relatos", "cuento", "novela", "dialogos"],
      },
      {
        label: "imaginación o creación",
        terms: ["inventar", "imaginacion", "imaginaba", "crear mundos", "fantasia"],
      },
      {
        label: "tono, forma o frase",
        terms: ["tono", "frase", "forma", "estilo", "atmósfera", "atmosfera"],
      },
      {
        label: "escena o personajes",
        terms: ["personajes", "escenas", "actor", "actuar", "protagonista"],
      },
      {
        label: "material expresivo infantil o temprano",
        terms: ["dibujar", "dibujos", "revistas caseras", "actuaciones"],
      },
    ],
    interpretation:
      "Aparecen señales de creación, imaginación, relato, tono o construcción expresiva. Puede ser núcleo creativo o soporte de comunicación pública.",
  },
  {
    kind: "interpretation_or_explanation_for_others",
    label: "Explicación o traducción de complejidad para otros",
    minEvidence: 2,
    baseStrength: 0.36,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "explicar o hacer comprender",
        terms: ["explicar", "hacer entender", "comprender", "que entiendan"],
      },
      {
        label: "traducir complejidad",
        terms: ["traducir", "hacerlo simple", "lenguaje simple", "claridad"],
      },
      {
        label: "enseñar o formar",
        terms: ["enseñar", "formar", "formacion", "capacitar", "aprendizaje"],
      },
      {
        label: "ordenar ideas para otros",
        terms: ["ordenar ideas", "paso a paso", "ejemplos", "desarmarlo en partes"],
      },
    ],
    interpretation:
      "La comunicación parece orientada a que otros comprendan. Esto puede sostener Educator Interpreter o quedar como apoyo de otra familia.",
  },
  {
    kind: "care_listening_or_emotional_support",
    label: "Escucha, cuidado o acompañamiento humano",
    minEvidence: 2,
    baseStrength: 0.36,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "escucha o confidencia",
        terms: ["escuchar", "me cuentan cosas", "confian en mi", "desahogarse"],
      },
      {
        label: "acompañar o contener",
        terms: ["acompañar", "contener", "apoyar", "sin invadir"],
      },
      {
        label: "procesos internos de otros",
        terms: ["lo que le pasa", "emociones", "ansiedad", "crisis", "dolor"],
      },
      {
        label: "preguntas o clarificación personal",
        terms: ["hacer preguntas", "ayudar a ordenar", "orientar personas"],
      },
      {
        label: "formación psicológica o humana",
        terms: ["psicologia", "terapia", "salud mental", "pacientes"],
      },
    ],
    interpretation:
      "Aparecen señales de escucha, cuidado, acompañamiento o lectura de procesos humanos. No debe quedar invisible por falta de palabras técnicas.",
  },
  {
    kind: "technical_practical_construction",
    label: "Construcción técnica o resolución práctica",
    minEvidence: 2,
    baseStrength: 0.36,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "arreglar o reparar",
        terms: ["arreglar", "reparar", "fallas", "dejar funcionando", "dejar andando"],
      },
      {
        label: "herramientas o taller",
        terms: ["herramientas", "taller", "meter mano", "piezas"],
      },
      {
        label: "motores, electricidad o mecánica",
        terms: ["motores", "motor", "electricos", "electricidad", "mecanica"],
      },
      {
        label: "instalaciones o tableros",
        terms: ["instalaciones", "tableros", "cables", "componentes"],
      },
      {
        label: "probar hasta que funcione",
        terms: ["probar", "funcione", "hacer funcionar", "testear"],
      },
    ],
    interpretation:
      "Hay señales de acción práctica sobre objetos, sistemas físicos o funcionamiento concreto. Esto debe diferenciarse de análisis abstracto.",
  },
  {
    kind: "organizational_institutional_sense",
    label: "Sentido organizacional o institucional",
    minEvidence: 2,
    baseStrength: 0.35,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "reglas, normas o procedimientos",
        terms: ["reglas", "normas", "procedimientos", "protocolo", "circuito"],
      },
      {
        label: "jerarquías o decisiones formales",
        terms: ["jerarquias", "quien decide", "autoridad", "estructura formal"],
      },
      {
        label: "expedientes, trámites o administración",
        terms: ["expediente", "expedientes", "tramite", "administrativo"],
      },
      {
        label: "áreas o funcionamiento interno",
        terms: ["areas", "departamentos", "organizacion", "institucion"],
      },
    ],
    interpretation:
      "Aparece capacidad o interés por moverse dentro de estructuras, reglas, procesos o instituciones.",
  },
  {
    kind: "analytical_strategic_reading",
    label: "Lectura analítica o estratégica",
    minEvidence: 2,
    baseStrength: 0.35,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "análisis de patrones",
        terms: ["patrones", "analizar", "leer la situacion", "estructura"],
      },
      {
        label: "escenarios o decisiones",
        terms: ["escenarios", "decisiones", "comparar opciones", "estrategia"],
      },
      {
        label: "problemas complejos",
        terms: ["complejidad", "problema complejo", "variables", "sistema"],
      },
      {
        label: "anticipar consecuencias",
        terms: ["anticipar", "prever", "consecuencias", "riesgos"],
      },
    ],
    interpretation:
      "El caso muestra lectura de estructura, escenarios, patrones o complejidad. Puede apoyar estrategia, sistemas o comunicación analítica.",
  },
  {
    kind: "aesthetic_visual_creation",
    label: "Creación estética o visual",
    minEvidence: 2,
    baseStrength: 0.35,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "diseño, imagen o estética",
        terms: ["diseño", "imagen", "estetica", "visual", "belleza"],
      },
      {
        label: "color, composición o forma visual",
        terms: ["color", "composicion", "forma visual", "estilo visual"],
      },
      {
        label: "foto, video o arte visual",
        terms: ["fotografia", "video", "arte", "ilustracion"],
      },
      {
        label: "marca o identidad visual",
        terms: ["marca", "logo", "identidad visual", "branding"],
      },
    ],
    interpretation:
      "Aparecen señales de sensibilidad visual, estética o construcción de forma. No debe reducirse a comunicación verbal.",
  },
  {
    kind: "entrepreneurial_initiative",
    label: "Iniciativa emprendedora o construcción propia",
    minEvidence: 2,
    baseStrength: 0.35,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "proyecto propio",
        terms: ["proyecto propio", "emprender", "emprendimiento", "negocio propio"],
      },
      {
        label: "crear algo desde cero",
        terms: ["crear desde cero", "armar algo", "levantar algo", "fundar"],
      },
      {
        label: "vender, mercado o clientes",
        terms: ["vender", "clientes", "mercado", "oferta", "servicio"],
      },
      {
        label: "autonomía o independencia",
        terms: ["independencia", "autonomia", "por mi cuenta", "mi propio camino"],
      },
    ],
    interpretation:
      "Hay señales de construcción propia, iniciativa o deseo de convertir una capacidad en proyecto real.",
  },
  {
    kind: "community_belonging_and_sustainment",
    label: "Pertenencia, comunidad o sostenimiento social",
    minEvidence: 2,
    baseStrength: 0.35,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "pertenencia o comunidad",
        terms: ["pertenencia", "comunidad", "sentirme parte", "grupo humano"],
      },
      {
        label: "sostener vínculos o participación",
        terms: ["sostener vinculos", "participacion", "convivencia", "red de apoyo"],
      },
      {
        label: "hacer circular ayuda o recursos",
        terms: ["ayuda mutua", "recursos", "colaborar", "apoyo entre personas"],
      },
      {
        label: "facilitar espacios grupales",
        terms: ["espacio grupal", "encuentros", "reuniones", "círculo", "circulo"],
      },
    ],
    interpretation:
      "Aparece sensibilidad por pertenencia, circulación social o espacios compartidos. Puede sostener Community Builder.",
  },
  {
    kind: "compressed_capacity",
    label: "Capacidad comprimida",
    minEvidence: 1,
    baseStrength: 0.42,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "apagamiento o desgaste",
        terms: [
          "me apago",
          "apagado",
          "agotado",
          "agotamiento",
          "estres",
          "no la soporto",
        ],
      },
      {
        label: "capacidad o deseo tapado",
        terms: ["comprimida", "comprimido", "tapada", "quedo tapada", "enterrada"],
      },
      {
        label: "renuncia o postergación",
        terms: ["deje de lado", "renuncie", "renuncias", "postergue", "perdidas"],
      },
      {
        label: "trabajo actual desalineado",
        terms: ["no me llena", "no me representa", "tareas repetitivas", "hace años"],
      },
    ],
    interpretation:
      "Hay señales de capacidad o deseo relegado por trayectoria, presión, miedo o vida práctica.",
  },
  {
    kind: "stability_constraint",
    label: "Restricciones reales de transición",
    minEvidence: 1,
    baseStrength: 0.38,
    evidenceWeight: 0.13,
    signalGroups: [
      {
        label: "presión económica explícita",
        terms: ["presion economica", "problema economico", "deuda", "ingresos bajos"],
      },
      {
        label: "carga familiar o dependientes",
        terms: ["carga familiar", "hijos a cargo", "dependientes", "mantener a mi familia"],
      },
      {
        label: "poca energía o cansancio",
        terms: ["energia baja", "sin energia", "muy cansado", "agotado"],
      },
      {
        label: "trabajo actual sostenido por necesidad",
        terms: [
          "actualmente estoy ejerciendo",
          "trabajo actual",
          "mi trabajo actual",
          "sostener mi trabajo",
        ],
      },
      {
        label: "presión social o familiar",
        terms: ["presion social", "presion familiar", "que diran"],
      },
    ],
    interpretation:
      "La transición debe considerar presión económica, familia, energía, trabajo actual o margen real.",
  },
  {
    kind: "exposure_fear",
    label: "Miedo o freno ante exposición",
    minEvidence: 1,
    baseStrength: 0.45,
    evidenceWeight: 0.14,
    signalGroups: [
      {
        label: "miedo a exposición",
        terms: ["miedo a exponerme", "me da miedo exponerme", "temor a exponerme"],
      },
      {
        label: "vergüenza o reputación",
        terms: ["verguenza", "reputacion", "que diran", "quedar expuesto"],
      },
      {
        label: "deseo público con freno",
        terms: ["quiero mostrarme pero", "me gustaria exponerme pero", "no me animo"],
      },
    ],
    interpretation:
      "El miedo a exposición no invalida una orientación pública o expresiva; exige activación gradual.",
  },
  {
    kind: "available_assets",
    label: "Activos aprovechables",
    minEvidence: 2,
    baseStrength: 0.4,
    evidenceWeight: 0.13,
    signalGroups: [
      {
        label: "experiencia previa útil",
        terms: ["experiencia previa", "ya hice", "trabaje en", "trayectoria"],
      },
      {
        label: "habilidades declaradas",
        terms: ["buena escritura", "facilidad para", "capacidad de", "habilidad para"],
      },
      {
        label: "red, contactos o reputación",
        terms: ["contactos", "red de contactos", "reputacion", "audiencia propia"],
      },
      {
        label: "formación o conocimientos",
        terms: ["formacion", "titulo", "cursos", "conocimiento en"],
      },
    ],
    interpretation:
      "El caso trae recursos previos que pueden volver más viable una transición o activación inicial.",
  },
];

function buildFamilyAdjustments(params: {
  forces: ContextualForce[];
  topFamilies: string[];
}): FamilyAdjustment[] {
  const { forces, topFamilies } = params;
  const adjustments: FamilyAdjustment[] = [];

  const publicVoice = getForce(forces, "public_voice_or_communication");
  const civic = getForce(forces, "civic_or_social_incidence");
  const group = getForce(forces, "group_building_or_leadership");
  const creative = getForce(forces, "creative_narrative_expression");
  const teaching = getForce(forces, "interpretation_or_explanation_for_others");
  const care = getForce(forces, "care_listening_or_emotional_support");
  const technical = getForce(forces, "technical_practical_construction");
  const institutional = getForce(forces, "organizational_institutional_sense");
  const analytical = getForce(forces, "analytical_strategic_reading");
  const aesthetic = getForce(forces, "aesthetic_visual_creation");
  const entrepreneurial = getForce(forces, "entrepreneurial_initiative");
  const community = getForce(forces, "community_belonging_and_sustainment");
  const exposureFear = getForce(forces, "exposure_fear");
  const compression = getForce(forces, "compressed_capacity");

  if (publicVoice) {
    adjustments.push({
      family: "public_communicator",
      direction: "raise",
      strength: civic ? 0.82 : 0.7,
      reason:
        "La evidencia contextual muestra comunicación orientada a otros, audiencia, voz, postura o circulación pública. No debe leerse sólo como expresión privada.",
    });
  }

  if (civic) {
    adjustments.push({
      family: "civic_advocate",
      direction: "raise",
      strength: 0.76,
      reason:
        "La orientación hacia asuntos colectivos, vida pública, instituciones o causas puede señalar incidencia cívica, no sólo comunicación.",
    });
  }

  if (group) {
    adjustments.push({
      family: "community_builder",
      direction: "raise",
      strength: 0.72,
      reason:
        "La aparición combinada de grupos, coordinación, liderazgo o armado colectivo sugiere construcción social.",
    });
  }

  if (creative && publicVoice) {
    adjustments.push({
      family: "creative_storyteller",
      direction: "keep",
      strength: 0.6,
      reason:
        "La dimensión narrativa existe, pero puede estar funcionando como soporte de voz pública si también hay audiencia, postura o circulación.",
    });
  } else if (creative) {
    adjustments.push({
      family: "creative_storyteller",
      direction: "raise",
      strength: 0.72,
      reason:
        "La evidencia contextual muestra relato, imaginación, tono, escenas o construcción expresiva como línea humana relevante.",
    });
  }

  if (teaching) {
    adjustments.push({
      family: "educator_interpreter",
      direction: publicVoice ? "watch" : "raise",
      strength: publicVoice ? 0.62 : 0.74,
      reason:
        "La comunicación parece orientada a que otros comprendan; esto puede sostener Educator Interpreter o funcionar como apoyo de otra familia.",
    });
  }

  if (care) {
    adjustments.push({
      family: "empathic_guide",
      direction: "raise",
      strength: 0.76,
      reason:
        "La evidencia contextual apunta a escucha, contención, acompañamiento o lectura de procesos humanos.",
    });
  }

  if (technical) {
    adjustments.push({
      family: "technical_builder",
      direction: "raise",
      strength: 0.78,
      reason:
        "La evidencia muestra acción práctica sobre objetos, herramientas, sistemas físicos o funcionamiento concreto.",
    });
  }

  if (institutional) {
    adjustments.push({
      family: "institutional_operator",
      direction: "raise",
      strength: 0.72,
      reason:
        "La evidencia muestra orientación a reglas, procesos, jerarquías, trámites o estructuras formales.",
    });
  }

  if (analytical) {
    adjustments.push({
      family: "analytical_strategist",
      direction: "watch",
      strength: 0.68,
      reason:
        "La evidencia muestra lectura de patrones, escenarios, estrategia o complejidad; conviene vigilar esta línea.",
    });
  }

  if (aesthetic) {
    adjustments.push({
      family: "creative_storyteller",
      direction: "watch",
      strength: 0.55,
      reason:
        "La sensibilidad estética o visual puede sostener familias creativas, pero necesita más evidencia para una adjudicación fuerte.",
    });
  }

  if (entrepreneurial) {
    adjustments.push({
      family: "commercial_connector",
      direction: "watch",
      strength: 0.55,
      reason:
        "La iniciativa propia o emprendedora puede orientar activación o proyecto, aunque no necesariamente define por sí sola la familia vocacional.",
    });
  }

  if (community) {
    adjustments.push({
      family: "community_builder",
      direction: "watch",
      strength: 0.64,
      reason:
        "La sensibilidad por pertenencia, comunidad o circulación social puede apoyar Community Builder si aparece acción grupal concreta.",
    });
  }

  if (exposureFear && publicVoice) {
    adjustments.push({
      family: "public_communicator",
      direction: "watch",
      strength: 0.68,
      reason:
        "El miedo a exposición no elimina una dirección pública; indica que la activación debe ser gradual y no un salto brusco.",
    });
  }

  if (compression) {
    for (const family of topFamilies.slice(0, 3)) {
      adjustments.push({
        family,
        direction: "watch",
        strength: 0.56,
        reason:
          "La dirección aparece dentro de un contexto de compresión o desgaste; conviene evitar una sentencia triunfalista y pensar una transición viable.",
      });
    }
  }

  return adjustments;
}

function buildThemeHints(params: {
  forces: ContextualForce[];
  familyAdjustments: FamilyAdjustment[];
}): ThemeHint[] {
  const { forces, familyAdjustments } = params;

  const has = (kind: ContextualForceKind) => hasForce(forces, kind);

  const familyRaisedOrWatched = (family: string) =>
    familyAdjustments.some(
      (adjustment) =>
        adjustment.family === family &&
        ["raise", "keep", "watch"].includes(adjustment.direction),
    );

  const hints: ThemeHint[] = [];

  if (has("public_voice_or_communication")) {
    hints.push({
      themeId: "armar_voz_publica_propia",
      label: "Armar una voz pública propia",
      reason:
        "Aparecen señales de comunicación hacia otros, voz, postura, audiencia o circulación pública.",
      linkedFamilies: ["public_communicator", "creative_storyteller"],
      activationFit: "high",
      caution: has("exposure_fear")
        ? "Conviene empezar con exposición gradual, no con salto público masivo."
        : undefined,
    });
  }

  if (has("civic_or_social_incidence")) {
    hints.push({
      themeId: "decir_lo_que_otros_no_dicen",
      label: "Decir lo que otros no están diciendo",
      reason:
        "La orientación cívica, social o política sugiere deseo de intervenir en conversaciones colectivas.",
      linkedFamilies: ["public_communicator", "civic_advocate"],
      activationFit: "high",
    });
  }

  if (has("group_building_or_leadership")) {
    hints.push({
      themeId: "construir_algo_con_otros",
      label: "Construir algo con otros",
      reason:
        "Aparecen señales de liderazgo, coordinación, grupos o armado colectivo.",
      linkedFamilies: ["community_builder", "diplomatic_social_connector"],
      activationFit: "high",
    });
  }

  if (has("creative_narrative_expression")) {
    hints.push({
      themeId: "convertir_experiencia_en_relato",
      label: "Convertir experiencia en relato",
      reason:
        "Aparecen señales de relato, imaginación, escritura, tono o creación expresiva.",
      linkedFamilies: ["creative_storyteller"],
      activationFit: familyRaisedOrWatched("public_communicator")
        ? "medium"
        : "high",
    });
  }

  if (has("interpretation_or_explanation_for_others")) {
    hints.push({
      themeId: "explicar_lo_complejo_con_claridad",
      label: "Explicar lo complejo con claridad",
      reason:
        "Aparece capacidad de traducir ideas, ordenar complejidad o ayudar a otros a comprender.",
      linkedFamilies: ["educator_interpreter"],
      activationFit: "medium",
    });
  }

  if (has("care_listening_or_emotional_support")) {
    hints.push({
      themeId: "acompanar_a_alguien_que_esta_perdido",
      label: "Acompañar a alguien que está perdido",
      reason:
        "La evidencia contextual muestra escucha, contención o acompañamiento humano.",
      linkedFamilies: ["empathic_guide"],
      activationFit: "high",
    });
  }

  if (has("technical_practical_construction")) {
    hints.push({
      themeId: "hacer_funcionar_algo_real",
      label: "Hacer funcionar algo real",
      reason:
        "Aparecen señales de reparación, herramientas, prueba, técnica o funcionamiento concreto.",
      linkedFamilies: ["technical_builder"],
      activationFit: "high",
    });
  }

  if (has("organizational_institutional_sense")) {
    hints.push({
      themeId: "ordenar_un_sistema_desde_adentro",
      label: "Ordenar un sistema desde adentro",
      reason:
        "El caso muestra orientación a reglas, procesos, circuitos o estructuras formales.",
      linkedFamilies: ["institutional_operator", "system_designer"],
      activationFit: "medium",
    });
  }

  if (has("compressed_capacity")) {
    hints.push({
      themeId: "recuperar_parte_tuya_tapada",
      label: "Recuperar una parte tuya que quedó tapada",
      reason:
        "El caso muestra capacidades o deseos que no están encontrando espacio real en la vida actual.",
      linkedFamilies: [
        "creative_storyteller",
        "public_communicator",
        "empathic_guide",
      ],
      activationFit: "medium",
      caution:
        "Debe conectarse con una acción concreta, no quedar como introspección indefinida.",
    });
  }

  return hints.slice(0, 5);
}

function buildActivationHints(forces: ContextualForce[]): ActivationHint[] {
  const has = (kind: ContextualForceKind) => hasForce(forces, kind);
  const hints: ActivationHint[] = [];

  if (
    has("public_voice_or_communication") ||
    has("civic_or_social_incidence") ||
    has("entrepreneurial_initiative")
  ) {
    hints.push({
      path: "armar_mi_propio_proyecto",
      fit: "high",
      reason:
        "La persona parece necesitar ordenar una voz, una idea, una intervención o una construcción propia.",
    });
  }

  if (
    has("group_building_or_leadership") ||
    has("community_belonging_and_sustainment")
  ) {
    hints.push({
      path: "asociarme_con_otras_personas",
      fit: "high",
      reason:
        "La presencia de grupos, comunidad, coordinación o liderazgo sugiere que el avance puede potenciarse con otros.",
    });
  }

  if (
    has("stability_constraint") ||
    has("exposure_fear") ||
    has("compressed_capacity")
  ) {
    hints.push({
      path: "explorar_primero_la_comunidad",
      fit: "medium",
      reason:
        "Si hay presión, miedo, compresión o restricciones, conviene ofrecer una entrada de bajo riesgo antes de exigir exposición o decisión grande.",
    });
  }

  if (
    has("interpretation_or_explanation_for_others") ||
    has("technical_practical_construction") ||
    has("organizational_institutional_sense")
  ) {
    hints.push({
      path: "formarme_en_algo_nuevo",
      fit: "medium",
      reason:
        "Puede ser útil convertir una capacidad detectada en habilidad comunicable, enseñable, técnica o profesionalizable.",
    });
  }

  if (
    has("care_listening_or_emotional_support") ||
    has("organizational_institutional_sense")
  ) {
    hints.push({
      path: "integrar_proyectos_existentes",
      fit: "medium",
      reason:
        "La persona podría probar su capacidad en un espacio ya existente antes de crear algo propio.",
    });
  }

  return hints.slice(0, 4);
}

function buildCautions(params: {
  forces: ContextualForce[];
  strongForces: ContextualForce[];
}): string[] {
  const { forces, strongForces } = params;
  const cautions: string[] = [];

  if (hasForce(forces, "exposure_fear")) {
    cautions.push(
      "No empujar a exposición pública brusca si el caso muestra miedo, vergüenza o dudas a exponerse.",
    );
  }

  if (hasForce(forces, "compressed_capacity")) {
    cautions.push(
      "No presentar la dirección como solución mágica: hay compresión, desgaste o restricciones reales.",
    );
  }

  if (
    hasForce(forces, "public_voice_or_communication") &&
    hasForce(forces, "civic_or_social_incidence")
  ) {
    cautions.push(
      "No reducir el caso a escritura o comunicación genérica: el objeto cívico/social puede cambiar la interpretación.",
    );
  }

  if (hasForce(forces, "group_building_or_leadership")) {
    cautions.push(
      "No leer liderazgo, grupos o conducción como simple rasgo social; puede ser señal de construcción colectiva.",
    );
  }

  if (
    hasForce(forces, "care_listening_or_emotional_support") &&
    !hasForce(forces, "group_building_or_leadership")
  ) {
    cautions.push(
      "No convertir acompañamiento uno a uno en Community Builder si el objeto principal es una persona y su mundo interno.",
    );
  }

  if (
    hasForce(forces, "technical_practical_construction") &&
    !hasForce(forces, "analytical_strategic_reading")
  ) {
    cautions.push(
      "No convertir reparación o funcionamiento concreto en análisis abstracto si el foco está en hacer que algo real funcione.",
    );
  }

  if (strongForces.length === 1) {
    cautions.push(
      "Hay concentración en una sola fuerza contextual. Usar como apoyo, no como verdad única, hasta contrastar con más evidencia.",
    );
  }

  if (strongForces.length >= 5) {
    cautions.push(
      "Hay muchas fuerzas contextuales fuertes. Esto no implica automáticamente revisión humana: puede tratarse de una historia rica. Priorizar la combinación más coherente con la historia completa.",
    );
  }

  return uniqueStrings(cautions);
}

function buildSituationFrame(forces: ContextualForce[]): string {
  const has = (kind: ContextualForceKind) => hasForce(forces, kind);

  if (
    has("public_voice_or_communication") &&
    has("civic_or_social_incidence") &&
    has("group_building_or_leadership")
  ) {
    return "public_voice_with_civic_and_group_building_context";
  }

  if (
    has("care_listening_or_emotional_support") &&
    has("interpretation_or_explanation_for_others")
  ) {
    return "human_support_with_interpretive_clarity_context";
  }

  if (has("technical_practical_construction")) {
    return "technical_practical_transition_context";
  }

  if (
    has("organizational_institutional_sense") &&
    has("analytical_strategic_reading")
  ) {
    return "organizational_strategic_context";
  }

  if (
    has("creative_narrative_expression") &&
    has("public_voice_or_communication")
  ) {
    return "narrative_expression_with_public_voice_context";
  }

  if (has("creative_narrative_expression")) {
    return "creative_expression_context";
  }

  if (has("compressed_capacity")) {
    return "compressed_capacity_context";
  }

  return "general_transition_context";
}

function buildSummary(situationFrame: string): string {
  switch (situationFrame) {
    case "public_voice_with_civic_and_group_building_context":
      return "El caso no debe leerse sólo como comunicación. La historia combina voz pública, interés cívico/social y señales de conducción o armado colectivo. Conviene interpretar la dirección como posible intervención pública gradual, no como simple contenido.";
    case "human_support_with_interpretive_clarity_context":
      return "El caso combina lectura humana, escucha o acompañamiento con capacidad de ordenar y explicar. Conviene mirar una frontera entre guía humana, interpretación y acompañamiento, sin reducirlo a sociabilidad genérica.";
    case "technical_practical_transition_context":
      return "El caso muestra una orientación práctica hacia hacer funcionar cosas reales. Conviene priorizar evidencia técnica, prueba, reparación o construcción concreta antes que análisis abstracto.";
    case "organizational_strategic_context":
      return "El caso combina lectura de estructura, reglas, procesos o estrategia. Conviene distinguir si la persona quiere operar dentro de sistemas, diseñarlos o analizarlos.";
    case "narrative_expression_with_public_voice_context":
      return "El caso combina expresión narrativa con comunicación hacia otros. Conviene distinguir si el relato funciona como creación personal, voz pública, enseñanza o intervención.";
    case "creative_expression_context":
      return "El caso muestra una corriente creativa o narrativa relevante. Conviene protegerla sin convertirla automáticamente en comunicación pública si no hay audiencia o postura.";
    case "compressed_capacity_context":
      return "La lectura debe considerar que parte de la energía vital está absorbida por sostener la situación actual. La transición necesita prudencia y pasos realistas.";
    default:
      return "El contexto aporta información útil, pero todavía no modifica de forma fuerte la lectura principal. Conviene usar esta capa como apoyo y no como sentencia.";
  }
}

function inferSuggestedPrimaryFamily(
  adjustments: FamilyAdjustment[],
): string | undefined {
  return adjustments
    .filter((adjustment) => adjustment.direction === "raise")
    .slice()
    .sort((a, b) => b.strength - a.strength)[0]?.family;
}

function inferSuggestedFrontier(adjustments: FamilyAdjustment[]): string[] {
  return uniqueStrings(
    adjustments
      .filter((adjustment) => adjustment.strength >= 0.62)
      .slice()
      .sort((a, b) => b.strength - a.strength)
      .map((adjustment) => adjustment.family),
  ).slice(0, 4);
}

function countFamilyOverlap(a: string[], b: string[]): number {
  const normalizedA = new Set(a.map((item) => normalizeFamilyKey(item)));
  return b.filter((item) => normalizedA.has(normalizeFamilyKey(item))).length;
}

export function runContextualSituationJudge(params: {
  intake: UserIntake;
  finalReading: FinalReading;
  familyScores?: unknown[];
  affinityScores?: unknown[];
  similarCases?: unknown[];
  learningSignal?: unknown;
  diagnosticReview?: unknown;
  experienceDistillation?: unknown;
}): ContextualSituationReview {
  const rawText = collectText(params.intake);
  const text = normalizeText(rawText);

  const topFamilies = getTopFamilies({
    finalReading: params.finalReading,
    familyScores: params.familyScores,
  });

  const forces = FORCE_DEFINITIONS.map((definition) =>
    buildForce(text, definition),
  ).filter((force): force is ContextualForce => Boolean(force));

  const strongForces = forces.filter(
    (force) => force.strength >= STRONG_FORCE_THRESHOLD,
  );

  const mediumForces = forces.filter(
    (force) => force.strength >= MEDIUM_FORCE_THRESHOLD,
  );

  const familyAdjustments = buildFamilyAdjustments({
    forces,
    topFamilies,
  });

  const themeHints = buildThemeHints({ forces, familyAdjustments });
  const activationHints = buildActivationHints(forces);
  const cautions = buildCautions({ forces, strongForces });

  const situationFrame = buildSituationFrame(forces);
  const summary = buildSummary(situationFrame);

  const contextualFrontier = inferSuggestedFrontier(familyAdjustments);
  const suggestedPrimaryFamily = inferSuggestedPrimaryFamily(familyAdjustments);

  const topThreeFamilies = topFamilies.slice(0, 3);
  const frontierOverlapWithTopThree = countFamilyOverlap(
    topThreeFamilies,
    contextualFrontier,
  );

  const contextualFrontierIsMostlyAligned =
    contextualFrontier.length > 0 && frontierOverlapWithTopThree > 0;

  const contextualFrontierIsOutsideCurrentReading =
    contextualFrontier.length >= 2 && frontierOverlapWithTopThree === 0;

  const hasHardCompressionContext =
    hasForce(forces, "compressed_capacity") &&
    hasForce(forces, "stability_constraint") &&
    hasForce(forces, "exposure_fear");

  const highComplexityButNotContradiction =
    strongForces.length >= 5 && contextualFrontierIsMostlyAligned;

  const shouldInfluenceDiagnostic =
    contextualFrontier.length >= 2 ||
    familyAdjustments.some((item) => item.strength >= 0.76) ||
    (strongForces.length >= 2 &&
      familyAdjustments.some((item) => item.strength >= 0.7));

  const shouldInfluenceGuidedSelection = themeHints.length > 0;

  const shouldOpenFrontier =
    shouldInfluenceDiagnostic && contextualFrontier.length >= 2;

  /**
   * Regla anti-cebado fuerte:
   * - Muchas fuerzas no equivalen a revisión humana.
   * - La revisión humana se pide cuando el contexto empuja con fuerza hacia
   *   una zona que el diagnóstico actual no está contemplando, o cuando hay
   *   compresión dura + frontera contextual externa.
   */
  const shouldRequestHumanReview =
    (contextualFrontierIsOutsideCurrentReading && strongForces.length >= 2) ||
    (hasHardCompressionContext && contextualFrontierIsOutsideCurrentReading) ||
    (strongForces.length >= 6 &&
      contextualFrontier.length >= 4 &&
      frontierOverlapWithTopThree <= 1 &&
      !highComplexityButNotContradiction);

  const verdict =
    forces.length === 0
      ? "context_insufficient"
      : shouldRequestHumanReview
        ? "context_suggests_human_review"
        : shouldOpenFrontier
          ? "context_suggests_frontier"
          : "context_supports_current_reading";

  const confidence =
    forces.length === 0
      ? 0.2
      : Math.min(
          0.9,
          0.42 +
            strongForces.length * 0.08 +
            Math.max(0, mediumForces.length - strongForces.length) * 0.035,
        );

  const notes = uniqueStrings([
    "Anti-cebado activo: ninguna palabra aislada decide una fuerza contextual fuerte.",
    "Las fuerzas contextuales funcionan como lectura de situación, no como reemplazo automático del diagnóstico.",
    "Muchas fuerzas contextuales no implican por sí solas revisión humana.",
    contextualFrontierIsMostlyAligned
      ? "La frontera contextual tiene solapamiento con el ranking actual; debe usarse como refinamiento, no como contradicción."
      : "",
    contextualFrontierIsOutsideCurrentReading
      ? "La frontera contextual aparece fuera del ranking principal actual; conviene contrastar antes de cerrar."
      : "",
    forces.length === 0
      ? "No se detectaron fuerzas contextuales fuertes; usar esta capa con prudencia."
      : "",
  ]);

  return {
    judgeId: "contextual_situation_judge",
    verdict,
    confidence,
    situationFrame,
    summary,
    forces,
    familyAdjustments,
    themeHints,
    activationHints,
    cautions,
    shouldInfluenceDiagnostic,
    shouldInfluenceGuidedSelection,

    recommendedUse: shouldRequestHumanReview
      ? "human_review_support"
      : shouldOpenFrontier
        ? "frontier_support"
        : "contextual_support",
    dominantContext: situationFrame,
    contextSummary: summary,
    suggestedPrimaryFamily,
    suggestedFrontier: contextualFrontier,
    shouldAdjustDiagnosis: shouldInfluenceDiagnostic,
    shouldOpenFrontier,
    shouldRequestHumanReview,
    contextualForces: forces,
    suggestedThemes: themeHints,
    warnings: cautions,
    notes,
  };
}