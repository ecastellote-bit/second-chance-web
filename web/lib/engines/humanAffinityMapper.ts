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
  technicalPracticalHits: number;
  civicCauseHits: number;
  commercialValueHits: number;
  artisticFormHits: number;
  operationalExecutionHits: number;
  ventureInitiativeHits: number;
  resourceCareHits: number;
  experienceHostHits: number;
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
    technicalPracticalHits: 0,
    civicCauseHits: 0,
    commercialValueHits: 0,
    artisticFormHits: 0,
    operationalExecutionHits: 0,
    ventureInitiativeHits: 0,
    resourceCareHits: 0,
    experienceHostHits: 0,
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
    technicalPracticalHits: a.technicalPracticalHits + b.technicalPracticalHits,
    civicCauseHits: a.civicCauseHits + b.civicCauseHits,
    commercialValueHits: a.commercialValueHits + b.commercialValueHits,
    artisticFormHits: a.artisticFormHits + b.artisticFormHits,
    operationalExecutionHits: a.operationalExecutionHits + b.operationalExecutionHits,
    ventureInitiativeHits: a.ventureInitiativeHits + b.ventureInitiativeHits,
    resourceCareHits: a.resourceCareHits + b.resourceCareHits,
    experienceHostHits: a.experienceHostHits + b.experienceHostHits,
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
  "espacio compartido",
  "clima grupal",
  "sosten de grupos",
  "sostén de grupos",
  "grupo no se rompa",
  "gente se sintiera parte",
  "juntar gente",
  "armar grupos",
  "armar grupo",
  "sostener movidas",
  "convocar",
  "convocando",
  "sostener el hilo",
  "sosteniendo el hilo",
  "si no muevo yo",
  "se enfrían",
  "se enfrian",
  "continuidad colectiva",
  "proyectos grupales",
  "trabajos grupales",
  "organizar personas",
  "clubes",
  "redes",
  "participacion",
  "participación",
  "hacer que todos participen",
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
  "armar grupos",
  "armar grupo",
  "juntar gente",
  "sostener comunidad",
  "sostener un grupo",
  "sostener movidas",
  "coordinar grupos",
  "pertenencia",
  "continuidad grupal",
  "continuidad colectiva",
  "que no se enfrie",
  "que no se enfríe",
  "que no se rompa",
  "cuidar el clima grupal",
  "hacer circular",
  "mover gente",
  "comunidad",
  "clubes",
  "redes",
  "barrio",
  "espacio colectivo",
  "espacio compartido",
  "sostener un espacio",
  "que la gente se encuentre",
  "gente se sintiera parte",
  "clima grupal",
  "convocar",
  "convocando",
  "proyectos grupales",
  "trabajos grupales",
  "organizar personas",
  "actividades grupales",
  "participacion",
  "participación",
  "hacer que todos participen",
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
  "conversacion individual",
  "proceso personal",
  "situacion personal",
  "lo que le pasa por dentro",
  "escuchar de verdad",
  "acompanar a una persona",
  "acompañar a una persona",
  "estar para alguien",
  "sostener a alguien",
  "confidencia",
  "confianza personal",
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
  "mecanismo",
  "mecanismos",
  "roles",
  "responsabilidades",
  "circuito",
  "procedimiento",
  "procedimientos",
  "proceso",
  "reglas",
  "diseño de sistema",
  "disenar sistema",
  "diseñar sistema",
  "que funcione sin depender de una persona",
  "sin depender de una persona",
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
  "viajes",
  "viajar",
  "tradiciones",
  "cine",
  "peliculas",
  "películas",
  "mundo simbolico",
  "mundo simbólico",
  "culturas distintas",
  "ampliar mirada",
  "exposicion cultural",
  "exposición cultural",
  "otras culturas",
  "museos",
  "festivales",
  "referencias culturales",
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

const TECHNICAL_PRACTICAL_CUES = [
  "arreglar",
  "reparar",
  "instalar",
  "desarmar",
  "cablear",
  "configurar",
  "herramientas",
  "taller",
  "meter mano",
  "dejar funcionando",
  "dejar andando",
  "probar hasta que anda",
  "probar hasta que funciona",
  "falla",
  "fallas",
  "no funciona",
  "no anda",
  "hacer andar",
  "armar algo concreto",
  "maña",
  "habilidad manual",
  "habilidad practica",
  "habilidad práctica",
  "aparatos",
  "maquinas",
  "máquinas",
  "cables",
  "motores",
  "computadoras",
  "tecnologia",
  "tecnología",
  "debuggear",
  "automatizar",
  "implementar",
  "implementacion",
  "implementación",
  "codigo",
  "código",
  "dispositivo",
  "herramienta funcional",
  "construir herramienta",
  "probar hasta",
  "solucionar fallas",
];

const CIVIC_CAUSE_CUES = [
  "injusticia",
  "causa",
  "derechos",
  "abuso",
  "reclamo",
  "organizarse para",
  "defender a",
  "no puede quedar asi",
  "no puede quedar así",
  "mover algo concreto",
  "accion concreta",
  "acción concreta",
  "problema social",
  "problema del barrio",
  "ciudadania",
  "ciudadanía",
  "bronca",
  "indigna",
  "lucha social",
  "luchas sociales",
  "referentes barriales",
  "tratado mal",
  "tratado injustamente",
  "no mirar al costado",
];

const COMMERCIAL_VALUE_CUES = [
  "vender",
  "venta",
  "ventas",
  "cliente",
  "clientes",
  "negociar",
  "negociacion",
  "negociación",
  "propuesta",
  "ofrecer",
  "cerrar algo",
  "cerrar acuerdos",
  "detectar necesidad",
  "necesidad del otro",
  "explicar valor",
  "generar confianza",
  "comision",
  "comisión",
  "intercambio",
  "convencer",
  "presentar propuesta",
  "conectar necesidad",
  "servicio",
  "atencion al cliente",
  "atención al cliente",
  "valor real",
  "confianza comercial",
  "abrir oportunidades",
  "oportunidades comerciales",
  "sin presion",
  "sin presión",
  "traducir valor",
  "sin humo",
  "necesidad real",
  "lo que necesita el otro",
  "comprador",
  "oferta honesta",
];

const ARTISTIC_FORM_CUES = [
  "musica",
  "música",
  "dibujo",
  "pintar",
  "cantar",
  "tocar",
  "actuar",
  "fotos",
  "visual",
  "escenario",
  "obra",
  "pieza",
  "crear algo que no estaba",
  "composicion",
  "composición",
  "color",
  "sonido",
  "imagen",
  "cuerpo",
  "forma sensible",
  "impulso creativo",
  "creacion artistica",
  "creación artística",
  "expresion artistica",
  "expresión artística",
  "sensibilidad artistica",
  "sensibilidad artística",
];

const OPERATIONAL_EXECUTION_CUES = [
  "tareas",
  "lista",
  "listas",
  "prioridades",
  "horarios",
  "seguimiento",
  "responsables",
  "repartir tareas",
  "logistica",
  "logística",
  "que salga",
  "hacer que salga",
  "que las cosas pasen",
  "sacar adelante",
  "coordinacion practica",
  "coordinación práctica",
  "resolver detalles",
  "que no se caiga",
  "ejecucion organizada",
  "ejecución organizada",
  "administrar",
  "mover cajas",
  "llamar a alguien",
  "conseguir algo",
  "proveedores",
  "turnos",
  "plazos",
  "dia a dia",
  "día a día",
  "operativo",
  "operativa",
  "cumplir con plazos",
  "resolver el dia",
  "resolver el día",
  "cronograma",
  "entregas",
  "deadline",
];

const VENTURE_INITIATIVE_CUES = [
  "emprender",
  "proyecto propio",
  "mi propio",
  "arrancar algo",
  "armar un negocio",
  "oportunidad",
  "oportunidades",
  "modelo de negocio",
  "validar",
  "lanzar",
  "escalar",
  "socios",
  "idea propia",
  "formato propio",
  "ingresos propios",
  "armar empresa",
];

const RESOURCE_CARE_CUES = [
  "que alcance",
  "presupuesto",
  "no desperdiciar",
  "cuidar recursos",
  "administrar",
  "inventario",
  "prever",
  "reservar",
  "hacer rendir",
  "eficiencia",
  "gastando de mas",
  "gastando de más",
  "fondos",
  "cuentas",
  "economia domestica",
  "economía doméstica",
  "cuidar que no falte",
  "asegurar que alcance",
];

const EXPERIENCE_HOST_CUES = [
  "clima",
  "ambiente",
  "bienvenida",
  "recibir gente",
  "anfitrion",
  "anfitrión",
  "hospitalidad",
  "evento",
  "detalles",
  "como se siente el lugar",
  "cómo se siente el lugar",
  "experiencia",
  "que todos la pasen bien",
  "preparar el espacio",
  "crear ambiente",
  "recorrido",
  "calidez",
  "comodos",
  "cómodos",
  "hoteles",
  "restaurantes",
  "mesa",
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
  "sobrepasado",
  "sobrepasada",
  "perdido",
  "perdida",
  "no sabe que hacer",
  "no sabe qué hacer",
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
  "partes enfrentadas",
  "intereses contrapuestos",
  "posiciones opuestas",
  "acuerdo entre partes",
  "conflicto entre areas",
  "conflicto entre áreas",
  "negociacion entre",
  "negociación entre",
];

const GROUP_CONTINUITY_CUES = [
  "sostener comunidad",
  "sosteniendo comunidad",
  "coordinar grupos",
  "coordinando grupos",
  "sostener el hilo",
  "sosteniendo el hilo",
  "si no muevo yo",
  "muchas cosas se enfrían",
  "muchas cosas se enfrian",
  "grupo se enfria",
  "grupo se enfría",
  "grupo se desarma",
  "grupo se cae",
  "espacio se cae",
  "espacio colectivo",
  "pertenencia",
  "hacer sentir parte",
  "circulacion entre personas",
  "circulación entre personas",
  "sosten de grupos",
  "sostén de grupos",
  "continuidad",
  "recordando",
  "empujando",
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

const PUBLIC_FRONT_CUES = [
  "poner la cara",
  "poner el cuerpo",
  "salir al frente",
  "dar la cara",
  "tomar la palabra",
  "fijar postura",
  "tomar postura",
  "decirlo claro",
  "decirlo de frente",
  "intervenir públicamente",
  "intervención pública",
  "voz pública",
  "postura pública",
  "lectura pública",
  "meterse en la conversación pública",
  "salir a decir",
  "instalar tema",
  "marcar agenda",
  "encuadrar el tema para otros",
  "decir las cosas de una forma que pegue",
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
  "tono",
  "ángulo",
  "angulo",
  "encontrando el ángulo",
  "encontrando el angulo",
  "editar",
  "edito",
  "edición",
  "edicion",
  "escritura",
  "escribir",
  "narrar",
  "narro",
  "relato",
  "texto",
  "síntesis narrativa",
  "sintesis narrativa",
  "acomodar ideas",
  "darle forma verbal",
];

const PUBLIC_SUPPRESSOR_CUES = [
  "no quiero estar yo al frente",
  "no quiero poner la cara",
  "no quiero poner el cuerpo",
  "sin frente público",
  "sin frente publico",
  "sin poner la cara",
  "sin poner el cuerpo",
  "prefiero editar",
  "me interesa más darle forma que ocupar la voz",
  "me interesa mas darle forma que ocupar la voz",
  "no sé si quiero estar yo al frente",
  "no se si quiero estar yo al frente",
  "no quiero una exposición improvisada",
  "no quiero una exposicion improvisada",
  "no como frente principal",
  "aparece lateral",
  "aparece de a ratos",
];

const CREATIVE_SUPPRESSOR_CUES = [
  "no me sale quedarme tibio",
  "cuando veo qué está en juego",
  "cuando veo que está en juego",
  "cuando veo que esta en juego",
  "fijar postura",
  "capacidad de fijar postura",
  "lectura pública",
  "lectura publica",
  "postura pública",
  "postura publica",
  "voz pública",
  "voz publica",
  "salir a decir",
  "decirlo claro",
  "tomar la palabra",
  "intervención pública",
  "intervencion publica",
  "meterse en la conversación pública",
  "meterse en la conversacion publica",
  "instalar tema",
  "marcar agenda",
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
    "cuidar el clima grupal",
    "pertenencia",
    "continuidad grupal",
    "grupo",
    "comunidad",
    "espacio colectivo",
    "que la gente se encuentre",
    "sostener un espacio",
  ],
  trust_building: [
    "generar confianza grupal",
    "sostener vinculo entre personas",
    "sostener vínculo entre personas",
    "que nadie quede colgado",
    "cuidar el clima grupal",
    "hacer sentir parte",
    "hacer sentir comodo en el grupo",
    "hacer sentir cómodo en el grupo",
    "dar confianza al grupo",
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
  technical_assembly: [
    "arreglar",
    "desarmar",
    "instalar",
    "ajustar",
    "configurar",
    "cablear",
    "conectar cables",
    "hacer funcionar",
    "dejar andando",
    "meter mano",
    "armar algo",
    "probar hasta que anda",
    "entender la falla",
    "leer la falla",
    "ver por que no funciona",
    "ver por qué no funciona",
    "herramientas",
    "taller",
    "reparar",
  ],
  operational_rhythm: [
    "seguimiento",
    "hacer que salga",
    "que las cosas pasen",
    "armar listas",
    "prioridades",
    "tareas",
    "repartir tareas",
    "horarios",
    "agenda",
    "responsables",
    "logistica",
    "logística",
    "hacer funcionar",
    "que no se caiga",
    "sacar adelante",
    "coordinacion operativa",
    "coordinación operativa",
  ],
  resource_optimization: [
    "que alcance",
    "no desperdiciar",
    "administrar",
    "cuidar recursos",
    "presupuesto",
    "inventario",
    "prever",
    "reservar",
    "hacer rendir",
    "eficiencia",
    "ahorro",
    "gastando de mas",
    "gastando de más",
    "fondos",
    "cuentas",
    "custodiar",
  ],
  venture_activation: [
    "emprender",
    "armar algo propio",
    "arrancar un proyecto",
    "modelo de negocio",
    "lanzar",
    "mi propio proyecto",
    "oportunidad de negocio",
    "detectar oportunidades",
    "escalar",
    "ingresos propios",
    "armar empresa",
    "armar negocio",
    "validar idea",
    "buscar socios",
    "combinar recursos",
  ],
  craft_precision: [
    "detalle",
    "cuidar la forma",
    "prolijidad",
    "terminacion",
    "terminación",
    "pulir",
    "pieza",
    "obra",
    "composicion",
    "composición",
    "dibujar",
    "pintar",
    "esculpir",
    "diseñar",
    "musica",
    "música",
    "tocar",
    "cantar",
    "actuar",
    "cuerpo",
  ],
  sensory_awareness: [
    "clima",
    "ambiente",
    "luz",
    "bienvenida",
    "recibir gente",
    "que se sientan comodos",
    "que se sientan cómodos",
    "anfitrion",
    "anfitrión",
    "hospitalidad",
    "experiencia",
    "detalles del lugar",
    "recorrido",
    "como se siente el espacio",
    "cómo se siente el espacio",
    "preparar el espacio",
    "calidez",
    "evento",
  ],
  civic_conflict_engagement: [
    "injusticia",
    "causa",
    "reclamo",
    "derechos",
    "abuso",
    "barrio",
    "organizarse",
    "no puede quedar asi",
    "no puede quedar así",
    "mover algo",
    "accion concreta",
    "acción concreta",
    "problema social",
    "defender",
    "bronca por injusticia",
    "ciudadania",
    "ciudadanía",
  ],
  protective_instinct: [
    "defender a otros",
    "no mirar al costado",
    "proteger",
    "cuidar que no pase",
    "alguien tratado mal",
    "que nadie quede afuera",
    "ponerse al frente cuando hay abuso",
  ],
  stewardship: [
    "cuidar lo que hay",
    "que no se pierda",
    "responsabilidad",
    "sostener lo que funciona",
    "prevenir problemas",
    "evitar desperdicio",
    "cuidar continuidad",
    "asegurar que alcance",
    "mantener lo que anda",
  ],
  duty_reliability: [
    "responsable",
    "cumplir",
    "constancia",
    "no dejar colgado",
    "compromiso",
    "puntualidad",
    "seguimiento",
    "no aflojo",
  ],
  material_transformation: [
    "con las manos",
    "transformar material",
    "crear objetos",
    "fabricar",
    "moldear",
    "dar forma fisica",
    "dar forma física",
    "produccion",
    "producción",
    "carpinteria",
    "carpintería",
  ],
  performance_presence: [
    "actuar",
    "escena",
    "presencia",
    "frente a otros",
    "escenario",
    "interpretar",
    "poner el cuerpo",
    "cantar",
    "tocar",
    "mostrar",
  ],
  aesthetic_sensitivity: [
    "forma",
    "belleza",
    "estetica",
    "estética",
    "composicion",
    "composición",
    "color",
    "textura",
    "atmósfera",
    "atmosfera",
    "imagen",
    "ojo para el detalle",
    "mirada estética",
    "sensibilidad visual",
    "visual",
  ],
  decision_ownership: [
    "hacerme cargo",
    "tomar decisiones",
    "bancarmela",
    "bancármela",
    "no esperar que otro decida",
    "asumir responsabilidad",
    "decidir",
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
  technical_assembly: [
    "currentsituation",
    "repeatedworkpatterns",
    "childhoodmemories",
    "earlyfascinations",
    "additionalcontext",
  ],
  operational_rhythm: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
    "additionalcontext",
  ],
  resource_optimization: [
    "currentsituation",
    "repeatedworkpatterns",
    "additionalcontext",
  ],
  venture_activation: [
    "currentsituation",
    "repeatedworkpatterns",
    "earlyfascinations",
    "additionalcontext",
  ],
  craft_precision: [
    "childhoodmemories",
    "earlyfascinations",
    "currentsituation",
    "repeatedworkpatterns",
  ],
  sensory_awareness: [
    "currentsituation",
    "repeatedworkpatterns",
    "earlyfascinations",
    "additionalcontext",
  ],
  civic_conflict_engagement: [
    "currentsituation",
    "repeatedworkpatterns",
    "childhoodmemories",
    "earlyfascinations",
    "naturalsocialroles",
    "additionalcontext",
  ],
  protective_instinct: [
    "currentsituation",
    "repeatedworkpatterns",
    "childhoodmemories",
    "naturalsocialroles",
  ],
  stewardship: [
    "currentsituation",
    "repeatedworkpatterns",
    "additionalcontext",
  ],
  duty_reliability: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
  ],
  material_transformation: [
    "childhoodmemories",
    "earlyfascinations",
    "currentsituation",
    "repeatedworkpatterns",
  ],
  performance_presence: [
    "childhoodmemories",
    "earlyfascinations",
    "currentsituation",
    "repeatedworkpatterns",
  ],
  aesthetic_sensitivity: [
    "childhoodmemories",
    "earlyfascinations",
    "currentsituation",
    "repeatedworkpatterns",
    "additionalcontext",
  ],
  decision_ownership: [
    "currentsituation",
    "repeatedworkpatterns",
    "naturalsocialroles",
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
    technicalPracticalHits: countPhraseHits(text, TECHNICAL_PRACTICAL_CUES),
    civicCauseHits: countPhraseHits(text, CIVIC_CAUSE_CUES),
    commercialValueHits: countPhraseHits(text, COMMERCIAL_VALUE_CUES),
    artisticFormHits: countPhraseHits(text, ARTISTIC_FORM_CUES),
    operationalExecutionHits: countPhraseHits(text, OPERATIONAL_EXECUTION_CUES),
    ventureInitiativeHits: countPhraseHits(text, VENTURE_INITIATIVE_CUES),
    resourceCareHits: countPhraseHits(text, RESOURCE_CARE_CUES),
    experienceHostHits: countPhraseHits(text, EXPERIENCE_HOST_CUES),
  };
}

function hasExplicitCollectiveSignal(cues: CueProfile): boolean {
  return (
    cues.groupContinuityHits > 0 ||
    cues.groupHits >= 2 ||
    (cues.groupHits >= 1 && cues.multiActorHits >= 1) ||
    (cues.groupHits >= 1 && cues.multiPartyFrictionHits >= 1)
  );
}

function hasGuideDominantWithoutCollective(cues: CueProfile): boolean {
  return (
    cues.guideHits + cues.personDistressHits >= 2 &&
    !hasExplicitCollectiveSignal(cues)
  );
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
      if (cues.commercialValueHits >= 2) bonus += 0.05;
      if (hasGuide && !hasMultiActor && !hasCommercial) bonus -= 0.08;
      if (hasNarrativeForm && !hasPublicPosture && !hasCommercial) bonus -= 0.03;
      return bonus;
    }

    case "social_coordination": {
      let bonus = 0;
      const hasCollective = hasExplicitCollectiveSignal(cues);
      const guideOnly = hasGuideDominantWithoutCollective(cues);

      if (hasCollective) bonus += 0.09;
      if (hasGroupContinuity) bonus += 0.06;
      if (hasMultiActor && hasCollective) bonus += 0.03;
      if (guideOnly) bonus -= 0.12;
      if (hasGuide && !hasCollective) bonus -= 0.08;

      return bonus;
    }

    case "group_reading": {
      let bonus = 0;
      const hasCollective = hasExplicitCollectiveSignal(cues);
      const guideOnly = hasGuideDominantWithoutCollective(cues);

      if (hasCollective) bonus += 0.08;
      if (hasGroupContinuity) bonus += 0.06;
      if (hasMultiActor && hasCollective) bonus += 0.02;
      if (guideOnly) bonus -= 0.11;
      if (hasGuide && !hasCollective) bonus -= 0.07;

      return bonus;
    }

    case "trust_building": {
      let bonus = 0;
      const hasCollective = hasExplicitCollectiveSignal(cues);
      const guideOnly = hasGuideDominantWithoutCollective(cues);

      if (hasCollective) bonus += 0.05;
      if (hasGroupContinuity) bonus += 0.05;
      if (hasMultiActor && hasCollective) bonus += 0.02;
      if (guideOnly) bonus -= 0.06;

      return bonus;
    }

    case "empathic_attunement": {
      let bonus = 0;
      if (hasGuide) bonus += 0.08;
      if (hasPersonDistress) bonus += 0.08;
      if (cues.guideHits >= 2 && cues.personDistressHits >= 1) bonus += 0.06;
      if (hasMultiActor && !hasGuide) bonus -= 0.08;
      if (hasGroupContinuity && !hasGuide) bonus -= 0.04;
      if (hasExplicitCollectiveSignal(cues) && cues.groupHits + cues.groupContinuityHits >= 3) {
        bonus -= 0.09;
      }
      return bonus;
    }

    case "restorative_support":
    case "care_orientation": {
      let bonus = 0;
      if (hasGuide) bonus += 0.08;
      if (hasPersonDistress) bonus += 0.07;
      if (hasMultiActor && !hasGuide) bonus -= 0.08;
      if (hasGroupContinuity && !hasGuide) bonus -= 0.04;
      if (hasExplicitCollectiveSignal(cues) && cues.groupHits + cues.groupContinuityHits >= 3) {
        bonus -= 0.07;
      }
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
      if (cues.structuralHits >= 3 && cues.technicalPracticalHits <= 1) bonus += 0.05;
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
      if (hasExplicitCollectiveSignal(cues)) bonus += 0.05;
      if (hasGroupContinuity) bonus += 0.04;
      if (hasMultiActor && hasExplicitCollectiveSignal(cues)) bonus += 0.02;
      return bonus;
    }

    case "practical_execution": {
      let bonus = 0;
      if (hasStructural) bonus += 0.02;
      if (hasGroupContinuity) bonus += 0.01;
      return bonus;
    }

    case "technical_assembly":
    case "craft_precision": {
      let bonus = 0;
      if (cues.technicalPracticalHits > 0) bonus += 0.1;
      if (cues.technicalPracticalHits >= 3) bonus += 0.06;
      if (cues.structuralHits >= 2 && cues.technicalPracticalHits === 0) bonus -= 0.06;
      if (hasNarrativeForm && !cues.technicalPracticalHits) bonus -= 0.06;
      if (hasStructural && !cues.technicalPracticalHits) bonus -= 0.04;
      return bonus;
    }

    case "operational_rhythm": {
      let bonus = 0;
      if (cues.operationalExecutionHits > 0) bonus += 0.1;
      if (cues.operationalExecutionHits >= 3) bonus += 0.06;
      if (hasStructural && !cues.operationalExecutionHits) bonus -= 0.05;
      return bonus;
    }

    case "resource_optimization":
    case "stewardship": {
      let bonus = 0;
      if (cues.resourceCareHits > 0) bonus += 0.1;
      if (cues.resourceCareHits >= 3) bonus += 0.06;
      return bonus;
    }

    case "venture_activation": {
      let bonus = 0;
      if (cues.ventureInitiativeHits > 0) bonus += 0.1;
      if (cues.ventureInitiativeHits >= 3) bonus += 0.06;
      if (hasCommercial && cues.ventureInitiativeHits > 0) bonus += 0.04;
      return bonus;
    }

    case "civic_conflict_engagement":
    case "protective_instinct": {
      let bonus = 0;
      if (cues.civicCauseHits > 0) bonus += 0.1;
      if (cues.civicCauseHits >= 3) bonus += 0.06;
      if (hasPublic && cues.civicCauseHits > 0) bonus += 0.03;
      return bonus;
    }

    case "sensory_awareness": {
      let bonus = 0;
      if (cues.experienceHostHits > 0) bonus += 0.1;
      if (cues.experienceHostHits >= 3) bonus += 0.06;
      if (cues.artisticFormHits > 0) bonus += 0.04;
      return bonus;
    }

    case "material_transformation": {
      let bonus = 0;
      if (cues.technicalPracticalHits > 0) bonus += 0.04;
      if (cues.artisticFormHits > 0) bonus += 0.06;
      return bonus;
    }

    case "performance_presence": {
      let bonus = 0;
      if (cues.artisticFormHits > 0) bonus += 0.08;
      if (cues.artisticFormHits >= 3) bonus += 0.04;
      return bonus;
    }

    case "aesthetic_sensitivity": {
      let bonus = 0;
      if (cues.artisticFormHits > 0) bonus += 0.08;
      if (cues.artisticFormHits >= 3) bonus += 0.06;
      if (cues.experienceHostHits > 0) bonus += 0.04;
      return bonus;
    }

    case "decision_ownership": {
      let bonus = 0;
      if (cues.ventureInitiativeHits > 0) bonus += 0.04;
      if (hasStructural) bonus += 0.02;
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

    case "influence_negotiation":
      if (cues.commercialValueHits >= 2) return 1;
      if (
        cues.guideHits >= 2 &&
        cues.multiActorHits === 0 &&
        cues.multiPartyFrictionHits === 0
      ) {
        return 0.78;
      }
      if (
        cues.groupHits >= 2 &&
        cues.multiActorHits === 0 &&
        cues.multiPartyFrictionHits === 0
      ) {
        return 0.82;
      }
      if (
        cues.multiActorHits === 0 &&
        cues.multiPartyFrictionHits === 0 &&
        cues.guideHits < 2
      ) {
        return 0.80;
      }
      return 1;

    case "social_coordination":
    case "group_reading": {
      if (hasGuideDominantWithoutCollective(cues)) return 0.42;
      if (!hasExplicitCollectiveSignal(cues)) return 0.68;
      return 1;
    }

    case "trust_building": {
      if (hasGuideDominantWithoutCollective(cues)) return 0.5;

      if (
        cues.groupHits === 0 &&
        cues.groupContinuityHits === 0 &&
        cues.multiActorHits === 0
      ) {
        return 0.82;
      }

      return 1;
    }

    case "empathic_attunement":
    case "restorative_support":
    case "care_orientation":
      if (
        hasExplicitCollectiveSignal(cues) &&
        cues.groupHits + cues.groupContinuityHits >= 3 &&
        cues.guideHits + cues.personDistressHits <= 4
      ) {
        return 0.72;
      }
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
      if (
        cues.publicHits === 0 &&
        cues.publicPostureHits === 0 &&
        cues.narrativeFormHits >= 2
      ) {
        return 0.55;
      }
      if (
        cues.publicHits === 0 &&
        cues.publicPostureHits === 0
      ) {
        return 0.72;
      }
      if (cues.narrativeFormHits >= 2 && cues.publicPostureHits === 0) return 0.64;
      if (
        cues.pedagogicHits >= 2 &&
        cues.publicHits === 0 &&
        cues.publicPostureHits === 0
      ) {
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
      if (
        cues.multiActorHits >= 2 &&
        cues.publicHits === 0 &&
        cues.narrativeHits === 0
      ) {
        return 0.84;
      }
      return 1;

    case "narrative_creation":
      if (cues.publicPostureHits >= 2 && cues.narrativeFormHits === 0) return 0.58;
      if (
        cues.multiActorHits >= 2 &&
        cues.narrativeHits === 0 &&
        cues.publicHits === 0
      ) {
        return 0.82;
      }
      return 1;

    case "teaching_impulse":
      if (cues.pedagogicHits === 0 && cues.publicPostureHits >= 2) return 0.7;
      if (cues.pedagogicHits === 0 && cues.narrativeFormHits >= 2) return 0.76;
      return 1;

    case "technical_assembly":
    case "craft_precision":
      if (cues.technicalPracticalHits === 0 && cues.artisticFormHits === 0) {
        if (cues.structuralHits >= 2) return 0.7;
        if (cues.narrativeFormHits >= 2) return 0.6;
        return 0.85;
      }
      return 1;

    case "operational_rhythm":
      if (cues.operationalExecutionHits === 0) {
        if (cues.structuralHits >= 2) return 0.65;
        if (cues.narrativeFormHits >= 2) return 0.6;
        return 0.82;
      }
      return 1;

    case "resource_optimization":
    case "stewardship":
      if (cues.resourceCareHits === 0) {
        if (cues.operationalExecutionHits >= 2) return 0.8;
        return 0.85;
      }
      return 1;

    case "venture_activation":
      if (cues.ventureInitiativeHits === 0) {
        if (cues.commercialValueHits >= 2) return 0.8;
        return 0.82;
      }
      return 1;

    case "civic_conflict_engagement":
    case "protective_instinct":
      if (cues.civicCauseHits === 0) {
        if (cues.publicPostureHits >= 2) return 0.7;
        return 0.82;
      }
      return 1;

    case "sensory_awareness":
      if (cues.experienceHostHits === 0 && cues.artisticFormHits === 0) return 0.8;
      return 1;

    case "material_transformation":
      if (cues.technicalPracticalHits === 0 && cues.artisticFormHits === 0) return 0.7;
      return 1;

    case "performance_presence":
      if (cues.artisticFormHits === 0) {
        if (cues.publicPostureHits >= 2) return 0.8;
        return 0.82;
      }
      return 1;

    case "aesthetic_sensitivity":
      if (cues.artisticFormHits === 0 && cues.experienceHostHits === 0) {
        if (cues.narrativeFormHits >= 2) return 0.65;
        return 0.72;
      }
      return 1;

    case "creative_expression":
      if (cues.artisticFormHits === 0) {
        if (cues.narrativeFormHits >= 2) return 0.70;
        return 0.76;
      }
      return 1;

    default:
      return 1;
  }
}

function getAggregatePenalty(affinityId: string, cues: CueProfile): number {
  switch (affinityId) {
    case "relational_bridge_building":
    case "conflict_mediation":
      if (cues.multiActorHits === 0 && cues.multiPartyFrictionHits === 0) {
        if (cues.guideHits >= 2) return 0.48;
        if (cues.groupHits >= 2) return 0.72;
        return 0.84;
      }
      return 1;

    case "influence_negotiation":
      if (cues.multiActorHits === 0 && cues.multiPartyFrictionHits === 0) {
        if (cues.commercialValueHits >= 2) return 0.92;
        if (cues.guideHits >= 2) return 0.42;
        if (cues.groupHits >= 2) return 0.72;
        return 0.76;
      }
      if (cues.guideHits >= 2 && cues.multiActorHits === 0) return 0.42;
      return 1;

    case "social_coordination":
    case "group_reading": {
      if (hasGuideDominantWithoutCollective(cues)) return 0.38;
      if (!hasExplicitCollectiveSignal(cues)) return 0.72;
      return 1;
    }

    case "trust_building": {
      if (hasGuideDominantWithoutCollective(cues)) return 0.45;

      if (
        cues.groupHits === 0 &&
        cues.guideHits === 0 &&
        cues.multiActorHits === 0
      ) {
        return 0.82;
      }

      return 1;
    }

    case "empathic_attunement":
    case "restorative_support":
    case "care_orientation":
      if (
        hasExplicitCollectiveSignal(cues) &&
        cues.groupHits + cues.groupContinuityHits >= 3 &&
        cues.guideHits + cues.personDistressHits <= 4
      ) {
        return 0.74;
      }
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
        if (cues.narrativeFormHits >= 2) return 0.50;
        return 0.68;
      }
      return 1;

    case "editorial_framing":
      if (
        cues.publicHits === 0 &&
        cues.narrativeHits === 0 &&
        cues.narrativeFormHits === 0
      ) {
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
      if (
        cues.publicHits === 0 &&
        cues.publicPostureHits === 0 &&
        cues.explorationHits === 0
      ) {
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

    case "technical_assembly":
    case "craft_precision":
      if (cues.technicalPracticalHits === 0 && cues.artisticFormHits === 0) {
        if (cues.structuralHits >= 2) return 0.6;
        if (cues.narrativeFormHits >= 2) return 0.5;
        return 0.78;
      }
      return 1;

    case "operational_rhythm":
      if (cues.operationalExecutionHits === 0) {
        if (cues.structuralHits >= 2) return 0.55;
        return 0.75;
      }
      return 1;

    case "resource_optimization":
    case "stewardship":
      if (cues.resourceCareHits === 0) return 0.78;
      return 1;

    case "venture_activation":
      if (cues.ventureInitiativeHits === 0) return 0.75;
      return 1;

    case "civic_conflict_engagement":
    case "protective_instinct":
      if (cues.civicCauseHits === 0) {
        if (cues.publicPostureHits >= 2) return 0.62;
        return 0.75;
      }
      return 1;

    case "sensory_awareness":
      if (cues.experienceHostHits === 0 && cues.artisticFormHits === 0) return 0.72;
      return 1;

    case "material_transformation":
      if (cues.technicalPracticalHits === 0 && cues.artisticFormHits === 0) return 0.62;
      return 1;

    case "performance_presence":
      if (cues.artisticFormHits === 0) return 0.76;
      return 1;

    case "aesthetic_sensitivity":
      if (cues.artisticFormHits === 0 && cues.experienceHostHits === 0) {
        if (cues.narrativeFormHits >= 2) return 0.58;
        return 0.66;
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

  const normalizedText = normalizedEvidence
    .map((fragment) => fragment.normalizedText)
    .join(" | ");

  const hasCreativeFormSurface = NARRATIVE_FORM_CUES.some((cue) =>
    normalizedText.includes(normalizeText(cue)),
  );

  const hasPublicFrontSurface = PUBLIC_FRONT_CUES.some((cue) =>
    normalizedText.includes(normalizeText(cue)),
  );

  const hasPublicSuppressionSurface = PUBLIC_SUPPRESSOR_CUES.some((cue) =>
    normalizedText.includes(normalizeText(cue)),
  );

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

      const affinityId = String(affinity.id);

      const profileSpecificBoost =
        affinityId === "relational_bridge_building" ||
        affinityId === "conflict_mediation" ||
        affinityId === "influence_negotiation"
          ? countPhraseHits(fragment.normalizedText, CONNECTOR_SOCIAL_PHRASES) *
            0.025
          : affinityId === "institutional_navigation"
            ? countPhraseHits(
                fragment.normalizedText,
                INSTITUTIONAL_OPERATOR_PHRASES,
              ) * 0.03
            : affinityId === "social_coordination" ||
                affinityId === "group_reading" ||
                affinityId === "trust_building"
              ? countPhraseHits(fragment.normalizedText, COMMUNITY_PHRASES) *
                0.025
              : affinityId === "narrative_creation"
                ? countPhraseHits(
                    fragment.normalizedText,
                    NARRATIVE_EXPLICIT_PHRASES,
                  ) * 0.025
                : affinityId === "technical_assembly" || affinityId === "craft_precision"
                ? countPhraseHits(fragment.normalizedText, TECHNICAL_PRACTICAL_CUES) * 0.025
                : affinityId === "civic_conflict_engagement" || affinityId === "protective_instinct"
                ? countPhraseHits(fragment.normalizedText, CIVIC_CAUSE_CUES) * 0.025
                : affinityId === "operational_rhythm"
                ? countPhraseHits(fragment.normalizedText, OPERATIONAL_EXECUTION_CUES) * 0.025
                : affinityId === "venture_activation"
                ? countPhraseHits(fragment.normalizedText, VENTURE_INITIATIVE_CUES) * 0.025
                : affinityId === "resource_optimization" || affinityId === "stewardship"
                ? countPhraseHits(fragment.normalizedText, RESOURCE_CARE_CUES) * 0.025
                : affinityId === "sensory_awareness"
                ? countPhraseHits(fragment.normalizedText, EXPERIENCE_HOST_CUES) * 0.025
                : affinityId === "aesthetic_sensitivity" || affinityId === "performance_presence"
                ? countPhraseHits(fragment.normalizedText, ARTISTIC_FORM_CUES) * 0.025
                : 0;

      const baseSignalHits = registryHits + semanticHits;
      if (baseSignalHits <= 0 && profileSpecificBoost <= 0) continue;

      const fieldBoost = getFieldBoost(affinityId, fragment);
      const semanticAdjustment = getSemanticAdjustment(affinityId, cueProfile);
      const suppressionMultiplier = getSuppressionMultiplier(
        affinityId,
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

    let contrastiveMultiplier = 1.12;

    if (hasCreativeFormSurface && !hasPublicFrontSurface) {
      if (String(affinity.id) === "narrative_creation") {
        contrastiveMultiplier *= 1.18;
        rationale.push(
          "creative_form_without_public_front boosts narrative_creation",
        );
      }

      if (String(affinity.id) === "aesthetic_sensitivity") {
        contrastiveMultiplier *= 1.12;
        rationale.push(
          "creative_form_without_public_front boosts aesthetic_sensitivity",
        );
      }

      if (String(affinity.id) === "public_expression") {
        contrastiveMultiplier *= 0.92;
        rationale.push(
          "creative_form_without_public_front dampens public_expression",
        );
      }

      if (String(affinity.id) === "editorial_framing") {
        contrastiveMultiplier *= 0.78;
        rationale.push(
          "creative_form_without_public_front dampens editorial_framing",
        );
      }
    }

    if (affinity.id === "narrative_creation") {
      if (hasCreativeFormSurface && hasPublicSuppressionSurface) {
        rawScore += 0.22;
        rationale.push(
          "Contraste narrativo: aparece forma/edición/tono con supresión explícita del frente público.",
        );
      } else if (hasCreativeFormSurface && !hasPublicFrontSurface) {
        rawScore += 0.14;
        rationale.push(
          "Superficie creativa: aparece trabajo de relato/forma sin marca de escenario público.",
        );
      }
    }

    if (affinity.id === "aesthetic_sensitivity") {
      if (hasCreativeFormSurface && hasPublicSuppressionSurface) {
        rawScore += 0.12;
        rationale.push(
          "Sensibilidad formal: aparece afinidad por tono/forma con rechazo del frente público.",
        );
      } else if (hasCreativeFormSurface && !hasPublicFrontSurface) {
        rawScore += 0.08;
        rationale.push(
          "Sensibilidad formal: aparece trabajo de forma sin orientación central a exposición pública.",
        );
      }
    }

    if (affinity.id === "public_expression") {
      if (hasPublicFrontSurface) {
        rawScore += 0.22;
        rationale.push(
          "Superficie pública: aparecen postura, voz pública, intervención o deseo de decir hacia otros.",
        );
      }

      if (hasPublicSuppressionSurface) {
        rawScore = Math.max(0, rawScore - 0.18);
        rationale.push(
          "Supresor público: el texto niega explícitamente querer frente, cara o exposición pública.",
        );
      }
    }

    if (affinity.id === "editorial_framing") {
      if (hasPublicFrontSurface) {
        rawScore += 0.14;
        rationale.push(
          "Encuadre público: aparece organizar tema, marcar agenda o encuadrar para audiencia.",
        );
      }

      if (hasCreativeFormSurface && hasPublicSuppressionSurface) {
        rawScore = Math.max(0, rawScore - 0.06 + 0.05);
        rationale.push(
          "Ajuste editorial: hay trabajo de forma, pero no como vocación central de frente público.",
        );
      }
    }

    const scoreDenominator = Math.max(
      evidenceCount + (distinctTagCount >= 2 ? 0 : 0.5),
      1,
    );

    const score = clamp(
      (rawScore * aggregatePenalty * contrastiveMultiplier) / scoreDenominator,
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