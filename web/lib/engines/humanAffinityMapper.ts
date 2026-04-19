import type { EvidenceFragment } from "../types/evidence";
import type {
  HumanAffinityId,
  HumanAffinityScore,
  HumanAffinityStatus,
} from "../types/humanAffinity";
import { HUMAN_AFFINITIES } from "../registries/humanAffinities";

type MapperInput = {
  evidence: EvidenceFragment[];
};

type CueProfile = {
  multiActorHits: number;
  groupHits: number;
  guideHits: number;
  structuralHits: number;
  institutionalHits: number;
  publicHits: number;
  narrativeHits: number;
  commercialHits: number;
  explorationHits: number;
  pedagogicHits: number;
  personDistressHits: number;
  multiPartyFrictionHits: number;
  groupContinuityHits: number;
  publicPostureHits: number;
  narrativeFormHits: number;
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeKey(text: string): string {
  return normalizeText(text).replace(/[^a-z0-9]/g, "");
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function countHintHits(text: string, hints: string[]): number {
  return hints.filter((hint) => text.includes(normalizeText(hint))).length;
}

function countPhraseHits(text: string, phrases: string[]): number {
  return phrases.filter((phrase) => text.includes(normalizeText(phrase))).length;
}

function countDistinctTags(evidence: EvidenceFragment[]): number {
  return new Set(
    evidence.flatMap((fragment) => fragment.tags ?? [fragment.id]),
  ).size;
}

function getFragmentKeys(fragment: EvidenceFragment): string[] {
  const rawKeys = [fragment.id, ...(fragment.tags ?? [])];
  return Array.from(new Set(rawKeys.map((key) => normalizeKey(String(key)))));
}

function emptyCueProfile(): CueProfile {
  return {
    multiActorHits: 0,
    groupHits: 0,
    guideHits: 0,
    structuralHits: 0,
    institutionalHits: 0,
    publicHits: 0,
    narrativeHits: 0,
    commercialHits: 0,
    explorationHits: 0,
    pedagogicHits: 0,
    personDistressHits: 0,
    multiPartyFrictionHits: 0,
    groupContinuityHits: 0,
    publicPostureHits: 0,
    narrativeFormHits: 0,
  };
}

function mergeCueProfiles(a: CueProfile, b: CueProfile): CueProfile {
  return {
    multiActorHits: a.multiActorHits + b.multiActorHits,
    groupHits: a.groupHits + b.groupHits,
    guideHits: a.guideHits + b.guideHits,
    structuralHits: a.structuralHits + b.structuralHits,
    institutionalHits: a.institutionalHits + b.institutionalHits,
    publicHits: a.publicHits + b.publicHits,
    narrativeHits: a.narrativeHits + b.narrativeHits,
    commercialHits: a.commercialHits + b.commercialHits,
    explorationHits: a.explorationHits + b.explorationHits,
    pedagogicHits: a.pedagogicHits + b.pedagogicHits,
    personDistressHits: a.personDistressHits + b.personDistressHits,
    multiPartyFrictionHits:
      a.multiPartyFrictionHits + b.multiPartyFrictionHits,
    groupContinuityHits: a.groupContinuityHits + b.groupContinuityHits,
    publicPostureHits: a.publicPostureHits + b.publicPostureHits,
    narrativeFormHits: a.narrativeFormHits + b.narrativeFormHits,
  };
}

const CONNECTOR_SOCIAL_PHRASES = [
  "acercar posiciones",
  "leer actores",
  "mediar tensiones",
  "construir acuerdos",
  "intereses cruzados",
  "articulando personas",
  "articulando actores",
  "negociando posiciones",
  "conectando sectores",
  "coordinando actores",
  "ordenando cruces",
  "destrabar situaciones",
  "alinear intereses",
  "bajar tensiones",
  "puente entre partes",
  "hablar con uno y con otro",
  "quedar en el medio",
  "sosteniendo funcionamiento entre areas",
  "sosteniendo funcionamiento entre áreas",
];

const INSTITUTIONAL_OPERATOR_PHRASES = [
  "estructura formal",
  "reglas",
  "marco",
  "institucion",
  "institución",
  "areas",
  "áreas",
  "sectores",
  "con quien hablar",
  "con quién hablar",
  "dentro del sistema",
  "que paso falta",
  "qué paso falta",
  "sin chocar",
  "vinculos institucionales",
  "vínculos institucionales",
  "alinear intereses entre areas",
  "alinear intereses entre áreas",
];

const COMMUNITY_PHRASES = [
  "sosteniendo comunidad",
  "coordinando grupos",
  "pertenencia",
  "circulacion entre personas",
  "circulación entre personas",
  "espacios colectivos",
  "clima grupal",
  "sosten de grupos",
  "sostén de grupos",
  "grupo no se rompa",
  "gente se sintiera parte",
];

const NARRATIVE_EXPLICIT_PHRASES = [
  "escribir",
  "escribiendo",
  "editar",
  "editando",
  "relato",
  "narrar",
  "narrativa",
  "voz",
  "mensaje",
  "mensajes",
  "poner en palabras",
  "nombrar",
  "dar forma verbal",
  "contenido",
  "texto",
  "contar las cosas",
  "construir relato",
  "construccion de voz",
  "construcción de voz",
];

const COMPRESSION_PHRASES = [
  "reactivo",
  "urgencias",
  "supervivencia",
  "sostener funcionamiento inmediato",
  "apagar incendios",
  "defensiva",
  "tactica",
  "táctica",
  "muy por debajo",
  "poco margen",
  "obligaciones",
  "no puedo mover demasiadas cosas",
  "no puedo resignar ingresos",
  "responsabilidades",
];

const MULTI_ACTOR_CUES = [
  "hablar con uno y con otro",
  "uno y otro",
  "dos partes",
  "entre partes",
  "entre areas",
  "entre áreas",
  "areas que no se entienden",
  "gente cruzada",
  "alinear posiciones",
  "hacer de puente",
  "conectar partes",
  "conectar gente",
  "se sienten a hablar",
  "destrabar entre areas",
  "destrabar entre partes",
  "malos entendidos",
  "armar alianzas",
  "stakeholders",
  "sectores",
  "actores",
  "intereses cruzados",
  "alinear intereses",
  "negociando posiciones",
  "conectando sectores",
];

const GROUP_COMMUNITY_CUES = [
  "armar red",
  "juntar gente",
  "sostener comunidad",
  "sostener un grupo",
  "coordinar grupos",
  "pertenencia",
  "continuidad",
  "que no se enfrie",
  "que no se enfríe",
  "que no se rompa",
  "cuidar el clima",
  "hacer circular",
  "mover gente",
  "grupo",
  "comunidad",
  "barrio",
  "espacio colectivo",
  "sostener un espacio",
  "que la gente se encuentre",
  "gente se sintiera parte",
  "clima grupal",
];

const INDIVIDUAL_GUIDE_CUES = [
  "uno a uno",
  "sin invadir",
  "preguntas justas",
  "poner en palabras",
  "lo que le pasa",
  "lo que siente",
  "bajar un cambio",
  "escuchar bien",
  "escuchar a fondo",
  "esta hecho un nudo",
  "está hecho un nudo",
  "hecho un nudo",
  "hecho bolsa",
  "acompanar procesos",
  "acompañar procesos",
  "contener",
  "registro del otro",
  "ayudar a entender",
  "ordenar lo que le pasa",
  "presencia humana",
];

const STRUCTURAL_CUES = [
  "estructura",
  "marco",
  "secuencia",
  "criterio",
  "criterios",
  "arquitectura",
  "modelo",
  "sistema",
  "logica de fondo",
  "lógica de fondo",
  "variables",
  "escenarios",
  "comparar caminos",
  "comparar alternativas",
  "no cierra",
  "inconsistencia",
  "inconsistencias",
  "por donde conviene",
  "por dónde conviene",
  "antes de mover",
  "leer escenarios",
  "leer estructura",
  "ordenar complejidad",
];

const INSTITUTIONAL_CUES = [
  "institucion",
  "institución",
  "institucional",
  "reglas",
  "poder formal",
  "con quien hay que hablar",
  "con quién hay que hablar",
  "por donde conviene empujar",
  "por dónde conviene empujar",
  "estructura formal",
  "gobierno",
  "gestion",
  "gestión",
  "marco formal",
  "autoridad",
  "autoridades",
  "estructura institucional",
  "dentro del sistema",
];

const PUBLIC_CUES = [
  "voz publica",
  "voz pública",
  "tomar la palabra",
  "intervenir publicamente",
  "intervenir públicamente",
  "poner la cara",
  "salir a decir",
  "decirlo para otros",
  "instalar tema",
  "meterse en la conversacion",
  "meterse en la conversación",
  "opinar",
  "decir lo que pienso",
  "posteos",
  "audiencia",
  "hablar en publico",
  "hablar en público",
  "salir al aire",
  "radio",
  "programa",
  "fijar postura",
  "bajada",
  "tema publico",
  "tema público",
];

const NARRATIVE_CUES = [
  "darle forma",
  "poner en palabras",
  "relato",
  "escribir",
  "editar",
  "voz",
  "texto",
  "narrar",
  "historia",
  "escena",
  "pieza",
  "construir relato",
  "dar forma verbal",
];

const COMMERCIAL_CUES = [
  "oportunidad",
  "cerrar acuerdos",
  "negocio",
  "negociar",
  "cliente",
  "clientes",
  "venta",
  "ventas",
  "mover algo",
  "hacer que se mueva",
  "detectar oportunidades",
  "facturacion",
  "facturación",
];

const EXPLORATION_CUES = [
  "leer de todo",
  "historia",
  "cultura",
  "politica",
  "política",
  "autores",
  "contextos",
  "procesos",
  "investigar",
  "relacionar ideas",
  "conectar ideas",
  "juntar referencias",
  "ver conexiones",
  "dialogan",
  "curiosidad",
  "explorar",
  "profundizar",
  "idiomas",
  "mapas",
];

const PEDAGOGIC_CUES = [
  "explicar",
  "explicando",
  "hacer entender",
  "para que se entienda",
  "se entienda",
  "bajar a tierra",
  "traducir",
  "traduciendo",
  "lo bajo al resto",
  "ordenar para otros",
  "enseñar",
  "aprendan",
  "comprendan",
  "aclarar",
  "claridad para otros",
];

const PERSON_DISTRESS_CUES = [
  "cuando alguien esta mal",
  "cuando alguien está mal",
  "alguien esta mal",
  "alguien está mal",
  "persona sobrepasada",
  "personas sobrepasadas",
  "hecho un nudo",
  "hecha un nudo",
  "hecho bolsa",
  "hecha bolsa",
  "confundido",
  "confundida",
  "lo que le pasa",
  "lo que siente",
  "situaciones personales complejas",
  "escuchar a fondo",
  "preguntas justas",
];

const MULTI_PARTY_FRICTION_CUES = [
  "gente cruzada",
  "partes distintas",
  "entre partes",
  "entre areas",
  "entre áreas",
  "coordinar actores",
  "leer actores",
  "intereses cruzados",
  "acercar posiciones",
  "alinear intereses",
  "ordenando cruces",
  "destrabar situaciones",
  "quedo en el medio",
  "quedar en el medio",
  "hago que se entiendan",
  "hacer que se entiendan",
];

const GROUP_CONTINUITY_CUES = [
  "sostener comunidad",
  "sosteniendo comunidad",
  "coordinar grupos",
  "coordinando grupos",
  "grupo se enfria",
  "grupo se enfría",
  "grupo se cae",
  "espacio se cae",
  "espacio colectivo",
  "pertenencia",
  "hacer sentir parte",
  "circulacion entre personas",
  "circulación entre personas",
  "sosten de grupos",
  "sostén de grupos",
];

const PUBLIC_POSTURE_CUES = [
  "fijar postura",
  "decirlo claro",
  "decirla claro",
  "ordenar la postura",
  "tema publico",
  "tema público",
  "asuntos colectivos",
  "decir lo que pienso",
  "tomar la palabra",
  "salir a decir",
  "meterse en la conversacion",
  "meterse en la conversación",
  "instalar tema",
  "audiencia",
];

const NARRATIVE_FORM_CUES = [
  "volverlo texto",
  "volverlo relato",
  "necesito contarlo",
  "darle forma",
  "construir relato",
  "armar una historia",
  "pieza con forma",
  "escena",
  "forma verbal",
  "voz propia",
  "nombro",
  "nombrar",
  "editar",
  "escribir",
];

const AFFINITY_PHRASE_BANKS: Record<string, string[]> = {
  social_coordination: [
    "coordinar grupos",
    "hacer circular",
    "ordenar la interaccion",
    "ordenar la interacción",
    "juntar gente",
    "sostener comunidad",
    "mover gente",
    "hacer que avance",
    "que no se enfrie",
    "que no se enfríe",
    "articular actores",
  ],
  relational_bridge_building: [
    "hacer de puente",
    "conectar partes",
    "conectar gente",
    "hablar con uno y con otro",
    "dos partes",
    "entre partes",
    "alinear posiciones",
    "armar alianzas",
    "acercar posiciones",
  ],
  conflict_mediation: [
    "bajar tension",
    "bajar tensión",
    "malos entendidos",
    "destrabar",
    "se sienten a hablar",
    "gente cruzada",
    "ruido entre partes",
    "evitar que se trabe",
    "mediar",
  ],
  influence_negotiation: [
    "negociar",
    "alinear posiciones",
    "mover posiciones",
    "cerrar acuerdos",
    "destrabar acuerdos",
    "convencer",
    "incidir",
    "leer actores",
  ],
  group_reading: [
    "cuidar el clima",
    "pertenencia",
    "continuidad",
    "grupo",
    "comunidad",
    "espacio colectivo",
    "que la gente se encuentre",
    "sostener un espacio",
  ],
  trust_building: [
    "generar confianza",
    "sostener vinculo",
    "sostener vínculo",
    "que nadie quede colgado",
    "buen trato",
    "cuidar el clima",
    "hacer sentir parte",
    "hacer sentir comodo",
    "hacer sentir cómodo",
    "dar confianza",
  ],
  empathic_attunement: [
    "sin invadir",
    "preguntas justas",
    "poner en palabras",
    "lo que le pasa",
    "lo que siente",
    "escuchar bien",
    "uno a uno",
    "bajar un cambio",
  ],
  restorative_support: [
    "acompanar procesos",
    "acompañar procesos",
    "contener",
    "bajar ansiedad",
    "ordenar lo que le pasa",
    "ayudar a entender",
    "escuchar a fondo",
    "presencia humana",
    "registro del otro",
  ],
  care_orientation: [
    "poner el hombro",
    "estar para alguien",
    "contener",
    "acompanar",
    "acompañar",
    "cuidar al otro",
    "registro del otro",
    "presencia humana",
  ],
  pattern_analysis: [
    "no cierra",
    "inconsistencias",
    "comparar caminos",
    "comparar escenarios",
    "variables",
    "criterio",
    "decision floja",
    "decisión floja",
    "decidir de apuro",
    "leer estructura",
  ],
  system_ordering: [
    "estructura",
    "marco",
    "secuencia",
    "criterios",
    "arquitectura",
    "modelo",
    "sistema",
    "ordenar complejidad",
  ],
  strategic_projection: [
    "escenarios",
    "alternativas",
    "por donde conviene",
    "por dónde conviene",
    "antes de mover",
    "comparar caminos",
    "pensar estrategias",
    "lectura estrategica",
    "lectura estratégica",
  ],
  institutional_navigation: [
    "institucional",
    "quien decide",
    "quién decide",
    "reglas",
    "poder formal",
    "estructura formal",
    "con quien hay que hablar",
    "con quién hay que hablar",
    "por donde conviene empujar",
    "por dónde conviene empujar",
    "gobierno",
  ],
  narrative_creation: [
    "darle forma",
    "poner en palabras",
    "relato",
    "escribir",
    "editar",
    "voz",
    "texto",
    "narrar",
    "volverlo texto",
    "volverlo relato",
    "construir relato",
  ],
  editorial_framing: [
    "bajada",
    "ordenar el tema",
    "mensaje",
    "agenda",
    "postura",
    "decirlo claro",
    "audiencia",
    "titular",
    "leer el momento",
    "olfato de oportunidad",
    "encontrar angulo",
    "encontrar ángulo",
    "ver por donde entra",
    "ver por dónde entra",
    "dar encuadre",
  ],
  public_expression: [
    "opinar",
    "decir lo que pienso",
    "voz publica",
    "voz pública",
    "posteos",
    "hablar en publico",
    "hablar en público",
    "fijar postura",
    "bajada",
    "audiencia",
    "tomar la palabra",
    "intervenir publicamente",
    "intervenir públicamente",
    "poner la cara",
    "salir a decir",
    "instalar tema",
  ],
  agenda_detection: [
    "agenda",
    "leer clima",
    "leer el momento",
    "tema que prende",
    "tema que puede crecer",
    "ver que tema empuja",
    "ver qué tema empuja",
    "captar el momento",
    "olfato de oportunidad",
    "donde hay ventana",
    "dónde hay ventana",
    "cuando conviene entrar",
  ],
  initiative_drive: [
    "arranque yo",
    "arranqué yo",
    "arranque algo",
    "arranqué algo",
    "tome la iniciativa",
    "tomé la iniciativa",
    "empece algo",
    "empecé algo",
    "lo impulse",
    "lo impulsé",
    "no espere",
    "no esperé",
  ],
  practical_execution: [
    "hacer que salga",
    "resolver",
    "concretar",
    "llevar a la practica",
    "llevar a la práctica",
    "dejar funcionando",
    "meter mano",
  ],
  teaching_impulse: [
    "explicar",
    "hacer entender",
    "bajar a tierra",
    "traducir",
    "para que se entienda",
    "se entienda",
    "enseñar",
    "comprendan",
    "aprendan",
  ],
  meaning_synthesis: [
    "dar sentido",
    "conectar ideas",
    "unir piezas",
    "sintetizar",
    "explicar el fondo",
    "relacionar ideas",
  ],
  curiosity_depth: [
    "leer de todo",
    "profundizar",
    "ir al fondo",
    "seguir investigando",
    "entender a fondo",
    "juntar referencias",
  ],
  exploratory_drive: [
    "explorar",
    "recorrer",
    "averiguar",
    "probar",
    "moverme",
    "conocer lugares",
  ],
};

const AFFINITY_FIELD_BOOSTS: Record<string, string[]> = {
  social_coordination: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  relational_bridge_building: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  conflict_mediation: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  influence_negotiation: [
    "currentsituation",
    "repeatedworkpatterns",
    "additionalcontext",
  ],
  group_reading: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  trust_building: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  empathic_attunement: [
    "childhoodmemories",
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  restorative_support: [
    "childhoodmemories",
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  care_orientation: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  pattern_analysis: [
    "currentsituation",
    "repeatedworkpatterns",
    "whatfeelscompressednow",
    "additionalcontext",
  ],
  system_ordering: [
    "currentsituation",
    "repeatedworkpatterns",
    "additionalcontext",
  ],
  strategic_projection: [
    "currentsituation",
    "repeatedworkpatterns",
    "whatfeelscompressednow",
    "additionalcontext",
  ],
  institutional_navigation: [
    "currentsituation",
    "repeatedworkpatterns",
    "additionalcontext",
  ],
  narrative_creation: [
    "childhoodmemories",
    "earlyfascinations",
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  editorial_framing: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  public_expression: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  agenda_detection: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  initiative_drive: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  practical_execution: [
    "currentsituation",
    "repeatedworkpatterns",
    "additionalcontext",
  ],
  teaching_impulse: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  meaning_synthesis: [
    "childhoodmemories",
    "earlyfascinations",
    "currentsituation",
    "repeatedworkpatterns",
    "additionalcontext",
  ],
  curiosity_depth: [
    "childhoodmemories",
    "earlyfascinations",
    "meaningfulschoolsubjects",
    "currentsituation",
    "repeatedworkpatterns",
    "additionalcontext",
  ],
  exploratory_drive: [
    "childhoodmemories",
    "earlyfascinations",
    "meaningfulschoolsubjects",
    "currentsituation",
    "repeatedworkpatterns",
    "additionalcontext",
  ],
};

function getCueProfile(text: string): CueProfile {
  return {
    multiActorHits: countPhraseHits(text, MULTI_ACTOR_CUES),
    groupHits: countPhraseHits(text, GROUP_COMMUNITY_CUES),
    guideHits: countPhraseHits(text, INDIVIDUAL_GUIDE_CUES),
    structuralHits: countPhraseHits(text, STRUCTURAL_CUES),
    institutionalHits: countPhraseHits(text, INSTITUTIONAL_CUES),
    publicHits: countPhraseHits(text, PUBLIC_CUES),
    narrativeHits: countPhraseHits(text, NARRATIVE_CUES),
    commercialHits: countPhraseHits(text, COMMERCIAL_CUES),
    explorationHits: countPhraseHits(text, EXPLORATION_CUES),
    pedagogicHits: countPhraseHits(text, PEDAGOGIC_CUES),
    personDistressHits: countPhraseHits(text, PERSON_DISTRESS_CUES),
    multiPartyFrictionHits: countPhraseHits(text, MULTI_PARTY_FRICTION_CUES),
    groupContinuityHits: countPhraseHits(text, GROUP_CONTINUITY_CUES),
    publicPostureHits: countPhraseHits(text, PUBLIC_POSTURE_CUES),
    narrativeFormHits: countPhraseHits(text, NARRATIVE_FORM_CUES),
  };
}

function getFieldBoost(affinityId: string, fragment: EvidenceFragment): number {
  const expectedKeys = AFFINITY_FIELD_BOOSTS[affinityId] ?? [];
  if (expectedKeys.length === 0) return 0;

  const fragmentKeys = getFragmentKeys(fragment);

  return expectedKeys.some((key) => fragmentKeys.includes(normalizeKey(key)))
    ? 0.04
    : 0;
}

function getSemanticAdjustment(affinityId: string, cues: CueProfile): number {
  const hasMultiActor = cues.multiActorHits > 0;
  const hasGroup = cues.groupHits > 0;
  const hasGuide = cues.guideHits > 0;
  const hasStructural = cues.structuralHits > 0;
  const hasInstitutional = cues.institutionalHits > 0;
  const hasPublic = cues.publicHits > 0;
  const hasNarrative = cues.narrativeHits > 0;
  const hasCommercial = cues.commercialHits > 0;
  const hasExploration = cues.explorationHits > 0;
  const hasPedagogic = cues.pedagogicHits > 0;
  const hasPublicPosture = cues.publicPostureHits > 0;
  const hasNarrativeForm = cues.narrativeFormHits > 0;
  const hasPersonDistress = cues.personDistressHits > 0;
  const hasMultiPartyFriction = cues.multiPartyFrictionHits > 0;
  const hasGroupContinuity = cues.groupContinuityHits > 0;

  switch (affinityId) {
    case "relational_bridge_building": {
      let bonus = 0;
      if (hasMultiActor) bonus += 0.08;
      if (hasMultiPartyFriction) bonus += 0.08;
      if (hasInstitutional) bonus += 0.03;
      if (hasGuide && !hasMultiActor && !hasMultiPartyFriction) bonus -= 0.09;
      if (hasGroup && !hasMultiActor && !hasMultiPartyFriction) bonus -= 0.04;
      if (hasNarrativeForm && !hasMultiActor && !hasPublicPosture) bonus -= 0.03;
      return bonus;
    }

    case "conflict_mediation": {
      let bonus = 0;
      if (hasMultiPartyFriction) bonus += 0.1;
      if (hasMultiActor) bonus += 0.06;
      if (hasGuide && hasPersonDistress && !hasMultiPartyFriction) bonus -= 0.07;
      if (hasGroup && !hasMultiPartyFriction && !hasMultiActor) bonus -= 0.04;
      return bonus;
    }

    case "influence_negotiation": {
      let bonus = 0;
      if (hasMultiActor) bonus += 0.07;
      if (hasMultiPartyFriction) bonus += 0.05;
      if (hasInstitutional) bonus += 0.03;
      if (hasCommercial) bonus += 0.04;
      if (hasGuide && !hasMultiActor && !hasCommercial) bonus -= 0.08;
      if (hasNarrativeForm && !hasPublicPosture && !hasCommercial) bonus -= 0.03;
      return bonus;
    }

    case "social_coordination": {
      let bonus = 0;
      if (hasGroup) bonus += 0.08;
      if (hasGroupContinuity) bonus += 0.08;
      if (hasMultiActor) bonus += 0.02;
      if (hasGuide && !hasGroup && !hasGroupContinuity) bonus -= 0.07;
      return bonus;
    }

    case "group_reading": {
      let bonus = 0;
      if (hasGroup) bonus += 0.07;
      if (hasGroupContinuity) bonus += 0.07;
      if (hasMultiActor) bonus += 0.02;
      if (hasGuide && !hasGroup && !hasGroupContinuity) bonus -= 0.06;
      return bonus;
    }

    case "trust_building": {
      let bonus = 0;
      if (hasGroup) bonus += 0.05;
      if (hasGuide) bonus += 0.04;
      if (hasGroupContinuity) bonus += 0.05;
      if (hasMultiActor) bonus += 0.02;
      return bonus;
    }

    case "empathic_attunement": {
      let bonus = 0;
      if (hasGuide) bonus += 0.08;
      if (hasPersonDistress) bonus += 0.08;
      if (hasMultiActor && !hasGuide) bonus -= 0.08;
      if (hasGroupContinuity && !hasGuide) bonus -= 0.04;
      return bonus;
    }

    case "restorative_support":
    case "care_orientation": {
      let bonus = 0;
      if (hasGuide) bonus += 0.08;
      if (hasPersonDistress) bonus += 0.07;
      if (hasMultiActor && !hasGuide) bonus -= 0.08;
      if (hasGroupContinuity && !hasGuide) bonus -= 0.04;
      return bonus;
    }

    case "pattern_analysis": {
      let bonus = 0;
      if (hasStructural) bonus += 0.09;
      if (hasExploration) bonus += 0.02;
      if (hasMultiActor && !hasStructural) bonus -= 0.06;
      if (hasGuide && !hasStructural) bonus -= 0.05;
      return bonus;
    }

    case "system_ordering": {
      let bonus = 0;
      if (hasStructural) bonus += 0.1;
      if (cues.structuralHits >= 2) bonus += 0.04;
      if ((hasMultiActor || hasGroup) && !hasStructural) bonus -= 0.12;
      if (hasGuide && !hasStructural) bonus -= 0.06;
      if (hasNarrativeForm && !hasStructural) bonus -= 0.04;
      return bonus;
    }

    case "strategic_projection": {
      let bonus = 0;
      if (hasStructural) bonus += 0.08;
      if (hasInstitutional) bonus += 0.02;
      if (hasMultiActor && !hasStructural) bonus -= 0.07;
      if (hasGuide && !hasStructural) bonus -= 0.05;
      return bonus;
    }

    case "institutional_navigation": {
      let bonus = 0;
      if (hasInstitutional) bonus += 0.1;
      if (hasMultiActor && hasInstitutional) bonus += 0.04;
      if (hasMultiPartyFriction && hasInstitutional) bonus += 0.03;
      if (hasGuide && !hasInstitutional) bonus -= 0.05;
      if (hasGroup && !hasInstitutional) bonus -= 0.04;
      return bonus;
    }

    case "public_expression": {
      let bonus = 0;
      if (hasPublic) bonus += 0.07;
      if (hasPublicPosture) bonus += 0.1;
      if (hasNarrative) bonus += 0.01;
      if (hasNarrativeForm && !hasPublicPosture) bonus -= 0.08;
      if (hasPedagogic && !hasPublicPosture && !hasPublic) bonus -= 0.03;
      if (hasInstitutional && !hasPublicPosture && !hasPublic) bonus -= 0.03;
      return bonus;
    }

    case "editorial_framing": {
      let bonus = 0;
      if (hasPublic) bonus += 0.04;
      if (hasPublicPosture) bonus += 0.05;
      if (hasNarrative) bonus += 0.04;
      if (hasNarrativeForm) bonus += 0.03;
      if (hasPedagogic) bonus += 0.02;
      if (hasExploration) bonus += 0.02;
      if (hasMultiActor && !hasPublic && !hasNarrative) bonus -= 0.03;
      return bonus;
    }

    case "narrative_creation": {
      let bonus = 0;
      if (hasNarrative) bonus += 0.08;
      if (hasNarrativeForm) bonus += 0.1;
      if (hasPublic && hasNarrativeForm) bonus += 0.01;
      if (hasPublicPosture && !hasNarrativeForm) bonus -= 0.1;
      if (hasExploration && !hasNarrative && !hasNarrativeForm) bonus -= 0.04;
      if (hasMultiActor && !hasNarrative && !hasNarrativeForm) bonus -= 0.03;
      return bonus;
    }

    case "agenda_detection": {
      let bonus = 0;
      if (hasPublic) bonus += 0.04;
      if (hasPublicPosture) bonus += 0.04;
      if (hasExploration) bonus += 0.04;
      if (hasNarrative) bonus += 0.02;
      return bonus;
    }

    case "teaching_impulse": {
      let bonus = 0;
      if (hasPedagogic) bonus += 0.12;
      if (hasPublic) bonus += 0.02;
      if (hasNarrative) bonus += 0.01;
      if (!hasPedagogic && hasPublicPosture) bonus -= 0.05;
      if (!hasPedagogic && hasNarrativeForm) bonus -= 0.04;
      return bonus;
    }

    case "meaning_synthesis": {
      let bonus = 0;
      if (hasExploration) bonus += 0.05;
      if (hasNarrativeForm) bonus += 0.03;
      if (hasPedagogic) bonus += 0.03;
      if (hasStructural) bonus += 0.03;
      return bonus;
    }

    case "curiosity_depth":
    case "exploratory_drive": {
      let bonus = 0;
      if (hasExploration) bonus += 0.08;
      if (hasStructural) bonus += 0.02;
      if (hasGuide && !hasExploration) bonus -= 0.03;
      return bonus;
    }

    case "initiative_drive": {
      let bonus = 0;
      if (hasPublicPosture) bonus += 0.02;
      if (hasStructural) bonus += 0.01;
      return bonus;
    }

    case "practical_execution": {
      let bonus = 0;
      if (hasStructural) bonus += 0.02;
      if (hasGroupContinuity) bonus += 0.01;
      return bonus;
    }

    default:
      return 0;
  }
}

function getSuppressionMultiplier(
  affinityId: string,
  cues: CueProfile,
): number {
  switch (affinityId) {
    case "relational_bridge_building":
    case "conflict_mediation":
    case "influence_negotiation":
      if (
        cues.guideHits >= 2 &&
        cues.multiActorHits === 0 &&
        cues.multiPartyFrictionHits === 0
      ) {
        return 0.6;
      }
      if (
        cues.groupHits >= 2 &&
        cues.multiActorHits === 0 &&
        cues.multiPartyFrictionHits === 0
      ) {
        return 0.82;
      }
      return 1;

    case "social_coordination":
    case "group_reading":
      if (
        cues.guideHits >= 2 &&
        cues.groupHits === 0 &&
        cues.groupContinuityHits === 0 &&
        cues.multiActorHits === 0
      ) {
        return 0.7;
      }
      return 1;

    case "trust_building":
      return 1;

    case "empathic_attunement":
    case "restorative_support":
    case "care_orientation":
      if (
        cues.multiActorHits >= 2 &&
        cues.multiPartyFrictionHits >= 1 &&
        cues.guideHits === 0
      ) {
        return 0.56;
      }
      if (cues.groupHits >= 2 && cues.guideHits === 0) return 0.76;
      return 1;

    case "pattern_analysis":
    case "strategic_projection":
      if (cues.multiActorHits >= 2 && cues.structuralHits === 0) return 0.7;
      if (cues.guideHits >= 2 && cues.structuralHits === 0) return 0.7;
      if (cues.groupHits >= 2 && cues.structuralHits === 0) return 0.82;
      return 1;

    case "system_ordering":
      if (cues.multiActorHits >= 2 && cues.structuralHits === 0) return 0.56;
      if (cues.groupHits >= 2 && cues.structuralHits === 0) return 0.66;
      if (cues.guideHits >= 2 && cues.structuralHits === 0) return 0.62;
      if (cues.narrativeFormHits >= 2 && cues.structuralHits === 0) return 0.74;
      return 1;

    case "institutional_navigation":
      if (cues.guideHits >= 2 && cues.institutionalHits === 0) return 0.68;
      if (cues.groupHits >= 2 && cues.institutionalHits === 0) return 0.82;
      return 1;

    case "public_expression":
      if (cues.narrativeFormHits >= 2 && cues.publicPostureHits === 0) return 0.64;
      if (cues.pedagogicHits >= 2 && cues.publicHits === 0 && cues.publicPostureHits === 0) {
        return 0.8;
      }
      if (
        cues.multiActorHits >= 2 &&
        cues.publicHits === 0 &&
        cues.publicPostureHits === 0 &&
        cues.narrativeHits === 0
      ) {
        return 0.8;
      }
      return 1;

    case "editorial_framing":
      if (cues.multiActorHits >= 2 && cues.publicHits === 0 && cues.narrativeHits === 0) {
        return 0.84;
      }
      return 1;

    case "narrative_creation":
      if (cues.publicPostureHits >= 2 && cues.narrativeFormHits === 0) return 0.58;
      if (cues.multiActorHits >= 2 && cues.narrativeHits === 0 && cues.publicHits === 0) {
        return 0.82;
      }
      return 1;

    case "teaching_impulse":
      if (cues.pedagogicHits === 0 && cues.publicPostureHits >= 2) return 0.7;
      if (cues.pedagogicHits === 0 && cues.narrativeFormHits >= 2) return 0.76;
      return 1;

    default:
      return 1;
  }
}

function getAggregatePenalty(affinityId: string, cues: CueProfile): number {
  switch (affinityId) {
    case "relational_bridge_building":
    case "conflict_mediation":
    case "influence_negotiation":
      if (cues.multiActorHits === 0 && cues.multiPartyFrictionHits === 0) {
        if (cues.guideHits >= 2) return 0.48;
        if (cues.groupHits >= 2) return 0.72;
        return 0.84;
      }
      return 1;

    case "social_coordination":
    case "group_reading":
      if (
        cues.groupHits === 0 &&
        cues.groupContinuityHits === 0 &&
        cues.multiActorHits === 0
      ) {
        if (cues.guideHits >= 2) return 0.54;
        return 0.8;
      }
      return 1;

    case "trust_building":
      if (cues.groupHits === 0 && cues.guideHits === 0 && cues.multiActorHits === 0) {
        return 0.82;
      }
      return 1;

    case "empathic_attunement":
    case "restorative_support":
    case "care_orientation":
      if (cues.guideHits === 0 && cues.personDistressHits === 0) {
        if (cues.multiActorHits >= 2) return 0.42;
        if (cues.groupHits >= 2) return 0.7;
        return 0.84;
      }
      return 1;

    case "pattern_analysis":
    case "strategic_projection":
      if (cues.structuralHits === 0) {
        if (cues.multiActorHits >= 2 || cues.guideHits >= 2) return 0.58;
        if (cues.groupHits >= 2) return 0.76;
        return 0.86;
      }
      return 1;

    case "system_ordering":
      if (cues.structuralHits === 0) {
        if (cues.multiActorHits >= 2) return 0.44;
        if (cues.groupHits >= 2) return 0.56;
        if (cues.guideHits >= 2) return 0.52;
        if (cues.narrativeFormHits >= 2) return 0.6;
        return 0.82;
      }
      return 1;

    case "institutional_navigation":
      if (cues.institutionalHits === 0) {
        if (cues.multiActorHits >= 2) return 0.62;
        if (cues.guideHits >= 2) return 0.58;
        if (cues.groupHits >= 2) return 0.74;
        return 0.88;
      }
      return 1;

    case "public_expression":
      if (cues.publicHits === 0 && cues.publicPostureHits === 0) {
        if (cues.narrativeFormHits >= 2) return 0.6;
        return 0.8;
      }
      return 1;

    case "editorial_framing":
      if (cues.publicHits === 0 && cues.narrativeHits === 0 && cues.narrativeFormHits === 0) {
        return 0.8;
      }
      return 1;

    case "narrative_creation":
      if (cues.narrativeHits === 0 && cues.narrativeFormHits === 0) {
        if (cues.explorationHits >= 2) return 0.68;
        if (cues.publicPostureHits >= 2) return 0.58;
        return 0.84;
      }
      return 1;

    case "agenda_detection":
      if (cues.publicHits === 0 && cues.publicPostureHits === 0 && cues.explorationHits === 0) {
        return 0.82;
      }
      return 1;

    case "teaching_impulse":
      if (cues.pedagogicHits === 0) {
        if (cues.publicPostureHits >= 2) return 0.7;
        if (cues.narrativeFormHits >= 2) return 0.76;
        return 0.86;
      }
      return 1;

    case "meaning_synthesis":
    case "curiosity_depth":
    case "exploratory_drive":
      if (cues.explorationHits === 0 && cues.structuralHits === 0) {
        if (cues.multiActorHits >= 2 || cues.guideHits >= 2) return 0.7;
        return 0.86;
      }
      return 1;

    default:
      return 1;
  }
}

function detectStatus(args: {
  score: number;
  confidence: number;
  evidenceCount: number;
  distinctTagCount: number;
  hasPositiveValence: boolean;
  hasNegativeValence: boolean;
  hasCurrentCompression: boolean;
  hasSacrificeEvidence: boolean;
  hasExternalRecognition: boolean;
}): HumanAffinityStatus {
  const {
    score,
    confidence,
    evidenceCount,
    distinctTagCount,
    hasPositiveValence,
    hasNegativeValence,
    hasCurrentCompression,
    hasSacrificeEvidence,
    hasExternalRecognition,
  } = args;

  const strongBase =
    score >= 0.52 &&
    confidence >= 0.5 &&
    evidenceCount >= 2 &&
    distinctTagCount >= 2;

  const buriedBase =
    score >= 0.34 &&
    confidence >= 0.48 &&
    evidenceCount >= 2;

  const mediumBase =
    score >= 0.28 &&
    confidence >= 0.35 &&
    evidenceCount >= 1;

  if (
    strongBase &&
    !hasCurrentCompression &&
    !hasSacrificeEvidence &&
    (hasPositiveValence || hasExternalRecognition)
  ) {
    return "expressed";
  }

  if (
    buriedBase &&
    (hasCurrentCompression || hasSacrificeEvidence) &&
    (hasPositiveValence || hasExternalRecognition || distinctTagCount >= 2)
  ) {
    return "buried";
  }

  if (
    mediumBase &&
    hasNegativeValence &&
    hasCurrentCompression &&
    !hasPositiveValence &&
    !hasExternalRecognition
  ) {
    return "blocked";
  }

  if (score >= 0.24 && confidence >= 0.35) {
    return "latent";
  }

  return "compensatory";
}

export function mapEvidenceToHumanAffinities(
  input: MapperInput,
): HumanAffinityScore[] {
  const normalizedEvidence = input.evidence.map((fragment) => ({
    ...fragment,
    normalizedText: normalizeText(fragment.text),
  }));

  const results: HumanAffinityScore[] = [];

  for (const affinity of HUMAN_AFFINITIES) {
    let rawScore = 0;
    let evidenceCount = 0;
    let semanticMatchCount = 0;

    const rationale: string[] = [];
    const evidenceSources = new Set<
      "intake" | "cvme" | "followup" | "behavioral_note"
    >();
    const matchedEvidence: EvidenceFragment[] = [];

    let hasPositiveValence = false;
    let hasNegativeValence = false;
    let hasCurrentCompression = false;
    let hasSacrificeEvidence = false;
    let hasExternalRecognition = false;

    for (const fragment of normalizedEvidence) {
      const registryHits = countHintHits(
        fragment.normalizedText,
        affinity.detectionHints,
      );

      const semanticHits = countPhraseHits(
        fragment.normalizedText,
        AFFINITY_PHRASE_BANKS[String(affinity.id)] ?? [],
      );

      const cueProfile = getCueProfile(fragment.normalizedText);
      const compressionHits = countPhraseHits(
        fragment.normalizedText,
        COMPRESSION_PHRASES,
      );

      const profileSpecificBoost =
        String(affinity.id) === "relational_bridge_building" ||
        String(affinity.id) === "conflict_mediation" ||
        String(affinity.id) === "influence_negotiation"
          ? countPhraseHits(fragment.normalizedText, CONNECTOR_SOCIAL_PHRASES) * 0.025
          : String(affinity.id) === "institutional_navigation"
            ? countPhraseHits(fragment.normalizedText, INSTITUTIONAL_OPERATOR_PHRASES) * 0.03
            : String(affinity.id) === "social_coordination" ||
                String(affinity.id) === "group_reading" ||
                String(affinity.id) === "trust_building"
              ? countPhraseHits(fragment.normalizedText, COMMUNITY_PHRASES) * 0.025
              : String(affinity.id) === "narrative_creation"
                ? countPhraseHits(fragment.normalizedText, NARRATIVE_EXPLICIT_PHRASES) * 0.025
                : 0;

      const baseSignalHits = registryHits + semanticHits;
      if (baseSignalHits <= 0 && profileSpecificBoost <= 0) continue;

      const fieldBoost = getFieldBoost(String(affinity.id), fragment);
      const semanticAdjustment = getSemanticAdjustment(String(affinity.id), cueProfile);
      const suppressionMultiplier = getSuppressionMultiplier(
        String(affinity.id),
        cueProfile,
      );

      const weakSingleRegistryOnly =
        registryHits === 1 &&
        semanticHits === 0 &&
        profileSpecificBoost === 0 &&
        fieldBoost === 0 &&
        semanticAdjustment <= 0;

      if (weakSingleRegistryOnly) continue;

      evidenceCount += 1;
      evidenceSources.add(fragment.source);
      matchedEvidence.push(fragment);

      if (semanticHits > 0 || profileSpecificBoost > 0) {
        semanticMatchCount += 1;
      }

      const lexicalWeight =
        baseSignalHits >= 5
          ? 0.25
          : baseSignalHits === 4
            ? 0.21
            : baseSignalHits === 3
              ? 0.17
              : baseSignalHits === 2
                ? 0.12
                : baseSignalHits === 1
                  ? 0.07
                  : 0;

      const semanticWeight =
        semanticHits >= 4
          ? 0.18
          : semanticHits === 3
            ? 0.13
            : semanticHits === 2
              ? 0.09
              : semanticHits === 1
                ? 0.05
                : 0;

      const intensityWeight =
        fragment.intensity === 3 ? 0.16 : fragment.intensity === 2 ? 0.1 : 0.05;

      const temporalWeight =
        fragment.temporalWeight === "childhood"
          ? 0.12
          : fragment.temporalWeight === "past"
            ? 0.1
            : fragment.temporalWeight === "current"
              ? 0.16
              : 0.08;

      const repetitionWeight =
        fragment.repetition && fragment.repetition > 1
          ? Math.min(fragment.repetition * 0.04, 0.12)
          : 0.03;

      const recognitionWeight = fragment.externalRecognition ? 0.12 : 0;
      const sacrificeWeight = fragment.sacrificedFor ? 0.14 : 0;
      const compressionWeight =
        compressionHits > 0 && fragment.temporalWeight === "current" ? 0.02 : 0;

      const subtotal =
        lexicalWeight +
        semanticWeight +
        profileSpecificBoost +
        fieldBoost +
        intensityWeight +
        temporalWeight +
        repetitionWeight +
        recognitionWeight +
        sacrificeWeight +
        compressionWeight;

      rawScore += Math.max(
        0,
        subtotal * suppressionMultiplier + semanticAdjustment,
      );

      if (fragment.valence === "positive" || fragment.valence === "ambivalent") {
        hasPositiveValence = true;
      }

      if (fragment.valence === "negative" || fragment.valence === "ambivalent") {
        hasNegativeValence = true;
      }

      if (
        fragment.temporalWeight === "current" &&
        ((fragment.valence === "negative" || fragment.sacrificedFor) ||
          compressionHits > 0)
      ) {
        hasCurrentCompression = true;
      }

      if (fragment.sacrificedFor) {
        hasSacrificeEvidence = true;
      }

      if (fragment.externalRecognition) {
        hasExternalRecognition = true;
      }

      const debugParts: string[] = [];
      if (registryHits > 0) debugParts.push(`registry:${registryHits}`);
      if (semanticHits > 0) debugParts.push(`semantic:${semanticHits}`);
      if (profileSpecificBoost > 0) {
        debugParts.push(`profile:+${profileSpecificBoost.toFixed(2)}`);
      }
      if (fieldBoost > 0) debugParts.push(`field:+${fieldBoost.toFixed(2)}`);
      if (compressionHits > 0) debugParts.push(`compression:${compressionHits}`);
      if (semanticAdjustment !== 0) {
        debugParts.push(`adj:${semanticAdjustment.toFixed(2)}`);
      }
      if (suppressionMultiplier !== 1) {
        debugParts.push(`mult:${suppressionMultiplier.toFixed(2)}`);
      }

      rationale.push(
        `Match en ${fragment.tags?.[0] ?? fragment.id} [${
          debugParts.join(" | ") || "signal"
        }]: ${fragment.text.slice(0, 140)}`,
      );
    }

    if (evidenceCount === 0) continue;

    const distinctTagCount = countDistinctTags(matchedEvidence);

    const aggregateCues = matchedEvidence.reduce<CueProfile>(
      (acc, fragment) =>
        mergeCueProfiles(acc, getCueProfile(normalizeText(fragment.text))),
      emptyCueProfile(),
    );

    const aggregatePenalty = getAggregatePenalty(
      String(affinity.id),
      aggregateCues,
    );

    const score = clamp(
      (rawScore * aggregatePenalty) /
        Math.max(evidenceCount + (distinctTagCount >= 2 ? 0 : 0.5), 1),
    );

    const confidence = clamp(
      0.22 +
        evidenceCount * 0.11 +
        distinctTagCount * 0.07 +
        (evidenceSources.size > 1 ? 0.08 : 0) +
        (hasExternalRecognition ? 0.08 : 0) +
        (hasSacrificeEvidence ? 0.05 : 0) +
        Math.min(semanticMatchCount * 0.03, 0.12),
    );

    const status = detectStatus({
      score,
      confidence,
      evidenceCount,
      distinctTagCount,
      hasPositiveValence,
      hasNegativeValence,
      hasCurrentCompression,
      hasSacrificeEvidence,
      hasExternalRecognition,
    });

    results.push({
      id: affinity.id as HumanAffinityId,
      score,
      confidence,
      status,
      evidenceCount,
      evidenceSources: Array.from(evidenceSources),
      rationale: rationale.slice(0, 4),
    });
  }

  return results
    .filter((item) => item.score >= 0.18 || item.confidence >= 0.35)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return b.evidenceCount - a.evidenceCount;
    });
}