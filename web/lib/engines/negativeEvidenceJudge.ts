import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";
import type { ProfileFamilyScore } from "../types/profileFamilies";
import type {
  NegativeEvidenceFinding,
  NegativeEvidenceRankingItem,
  NegativeEvidenceShadowRankingItem,
  NegativeEvidenceReview,
  NegativeEvidenceVerdict,
} from "../types/negativeEvidenceJudge";
import type { HumanAffinityScore } from "../types/humanAffinity";
import { PROFILE_FAMILIES } from "../registries/profileFamilies";

const FAMILY_LABELS: Record<string, string> = {
  diplomatic_social_connector: "Diplomatic Social Connector",
  community_builder: "Community Builder",
  analytical_strategist: "Analytical Strategist",
  creative_storyteller: "Creative Storyteller",
  technical_builder: "Technical Builder",
  cultural_explorer: "Cultural Explorer",
  empathic_guide: "Empathic Guide",
  public_communicator: "Public Communicator",
  institutional_operator: "Institutional Operator",
  commercial_connector: "Commercial Connector",
  educator_interpreter: "Educator Interpreter",
  system_designer: "System Designer",
  civic_advocate: "Civic Advocate",
};

function normalizeText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectHumanText(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (Array.isArray(value)) return value.flatMap(collectHumanText);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectHumanText);
  }
  return [];
}

function buildIntakeText(intake: UserIntake): string {
  return normalizeText(collectHumanText(intake).join(" "));
}

function scoreOf(family: ProfileFamilyScore): number {
  return typeof family.score === "number" && Number.isFinite(family.score)
    ? family.score
    : 0;
}

function confidenceOf(family: ProfileFamilyScore): number {
  return typeof family.confidence === "number" && Number.isFinite(family.confidence)
    ? family.confidence
    : 0;
}

function toFamilyId(family: ProfileFamilyScore): string {
  return String((family as any).id ?? (family as any).familyId ?? "").trim();
}

/** Lexical hits (normalized substrings) counted once per marker matched */
function countHits(text: string, markers: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of markers) {
    const n = normalizeText(m);
    if (n && text.includes(n) && !seen.has(n)) {
      seen.add(n);
      out.push(m);
    }
  }
  return out;
}

type SemanticSignals = {
  /** Centro narrativo fuerte: relato, voz, forma expresiva */
  narrativeCore: string[];
  /** Escritura como herramienta de orden/síntesis sin núcleo narrativo */
  instrumentalWriting: string[];
  /** Centro de exploración cultural / contextos */
  culturalCenter: string[];
  /** Cultura como insumo para mensaje o relato */
  culturalAsBackdrop: string[];
  /** Traducción pedagógica explícita */
  educatorCore: string[];
  /** Síntesis u orden sin foco en que otros aprendan */
  educatorWeak: string[];
  /** Claridad / síntesis / explicar sin vocación formativa explícita */
  educatorVocabWeak: string[];
  /** Marco formal, institución, procedimiento como centro */
  institutionalCore: string[];
  /** Mediación entre actores/intereses */
  diplomaticCore: string[];
  /** Vínculo institucional sin mediación de partes */
  diplomaticWeakFormalOnly: string[];
  ejecucionTecnica: string[];
  analisisEstrategico: string[];
  analisisSubordinadoOperativo: string[];
  systemDesignCore: string[];
  operacionPuntualVsDiseno: string[];
  /** Comunidad, pertenencia, circulación grupal */
  communityCore: string[];
  /** Señales uno a uno creíbles (no sólo “escuchar” genérico) */
  empathicCoreOneToOne: string[];
  /** Vocabulario de ayuda/escucha fácilmente compartido con CB */
  empathicInflationLexicon: string[];
  /** Superficie interpersonal cualquiera (core + inflación) para contrastes CB/EG */
  empathicInterpersonalSurface: string[];
  /** Escucha al servicio del grupo/comunidad */
  empathicForCollective: string[];
  publicVoice: string[];
  /** Incidencia pública, debate, postura — más allá de “voz” o “mensaje” */
  publicCommunicatorCore: string[];
};

function buildSemanticSignals(text: string): SemanticSignals {
  const empathicCoreOneToOne = countHits(text, [
    "una persona",
    "conversacion individual",
    "conversación individual",
    "acompañamiento personal",
    "acompanamiento personal",
    "escuchar a fondo",
    "contener proceso individual",
    "preguntas justas",
    "orientacion interpersonal directa",
    "orientación interpersonal directa",
    "uno a uno",
    "acompañamiento uno a uno",
    "acompanamiento uno a uno",
    "escuchar a una persona",
    "escuchar a alguien",
    "acompanar a alguien",
    "acompañar a alguien",
    "contencion individual",
    "contención individual",
    "proceso personal",
    "procesos personales",
    "sin invadir",
  ]);
  const empathicInflationLexicon = countHits(text, [
    "escuchar",
    "acompañar",
    "acompanar",
    "ayudar",
    "personas",
    "sostener",
    "contener",
    "procesos humanos",
  ]);
  const empathicInterpersonalSurface = Array.from(
    new Set([...empathicCoreOneToOne, ...empathicInflationLexicon]),
  );

  return {
    narrativeCore: countHits(text, [
      "relato",
      "relatos",
      "narrar",
      "narrativa",
      "voz narrativa",
      "tono",
      "escena",
      "personaje",
      "personajes",
      "mundo interno",
      "forma verbal",
      "claridad narrativa",
      "editando",
      "edicion narrativa",
      "edición narrativa",
      "construir mensajes",
      "construccion expresiva",
      "construcción expresiva",
      "lenguaje expresivo",
      "atmósfera",
      "atmosfera",
      "historias",
      "cuento",
      "dialogos",
      "recuerdos convertidos en relato",
      "escritura como necesidad",
      "necesidad expresiva",
    ]),
    instrumentalWriting: countHits(text, [
      "sintesis",
      "escribo para ordenar",
      "ordenar ideas",
      "investigando contextos",
      "comparando procesos",
      "conectar contextos",
      "para ordenar",
      "sintetizar",
    ]),
    culturalCenter: countHits(text, [
      "historia",
      "cultura",
      "epocas",
      "autores",
      "mapas",
      "contextos",
      "idiomas",
      "marcos de sentido",
      "curiosidad cultural",
      "relaciones entre campos",
      "procesos sociales",
    ]),
    culturalAsBackdrop: countHits(text, [
      "la cultura me nutre",
      "referencias culturales",
      "fondo cultural",
      "insumo",
    ]),
    educatorCore: countHits(text, [
      "explicar",
      "explicar para que",
      "que otros entiendan",
      "hacer entender",
      "traducir complejidad",
      "ensenar",
      "enseñar",
      "formar",
      "guiar aprendizaje",
      "vocacion docente",
      "vocación docente",
      "pedagog",
      "comprender mejor",
      "ejemplos simples",
      "paso a paso para otros",
    ]),
    educatorWeak: countHits(text, [
      "sintesis interna",
      "solo escribo",
      "ordenar para mi",
      "notas para mi",
    ]),
    educatorVocabWeak: countHits(text, [
      "claridad",
      "sintesis",
      "síntesis",
      "explicar",
      "ordenar ideas",
      "ordenar la idea",
    ]),
    institutionalCore: countHits(text, [
      "normas",
      "marcos formales",
      "procedimientos",
      "areas",
      "sectores institucionales",
      "reputacion",
      "estabilidad",
      "estructura formal",
      "circuito",
      "institucional",
      "roles",
      "que paso falta dentro del sistema",
      "avance dentro del sistema",
    ]),
    diplomaticCore: countHits(text, [
      "actores",
      "intereses cruzados",
      "medi",
      "negoci",
      "partes",
      "destrabar entre",
      "acuerdos entre",
      "coordinar actores",
      "leer posiciones",
      "tensiones entre",
    ]),
    diplomaticWeakFormalOnly: countHits(text, [
      "vinculos institucionales",
      "alinear intereses entre areas",
      "equilibrios institucionales",
    ]),
    ejecucionTecnica: countHits(text, [
      "resolver fallas",
      "ajustar procesos",
      "operacion",
      "arreglar",
      "destrabar",
      "hacer que funcione",
      "hacer que salga",
      "meter mano",
      "ejecucion",
      "urgencia",
      "incendios",
      "mecanismos",
    ]),
    analisisEstrategico: countHits(text, [
      "escenarios",
      "alternativas",
      "comparando escenarios",
      "oportunidades",
      "evaluar alternativas",
      "detectar criterio",
      "leer estructura",
      "orientar decisiones",
      "decisiones",
      "logica del negocio",
      "modelo",
    ]),
    analisisSubordinadoOperativo: countHits(text, [
      "criterio al servicio",
      "analisis subordinado",
      "analisis para ejecutar",
      "priorizar para salir",
    ]),
    systemDesignCore: countHits(text, [
      "diseno de sistema",
      "arquitectura del proceso",
      "flujo end to end",
      "dependencias",
      "marco transferible",
      "secuencia",
      "reglas de funcionamiento del sistema",
      "evitar que vuelva a romperse",
      "rediseño",
    ]),
    operacionPuntualVsDiseno: countHits(text, [
      "apago incendios",
      "parche",
      "tickets",
      "solo urgencias",
    ]),
    communityCore: countHits(text, [
      "comunidad",
      "comunidades",
      "pertenencia",
      "circulacion",
      "coordinacion colectiva",
      "grupos",
      "grupo",
      "espacios colectivos",
      "espacio compartido",
      "participacion",
      "tejido",
      "clima grupal",
      "sostener comunidad",
      "juntar gente",
      "armar grupos",
      "armar grupo",
      "convocar",
      "convocando",
      "redes",
      "clubes",
      "continuidad colectiva",
      "continuidad grupal",
      "sostener el hilo",
      "sosteniendo el hilo",
      "si no muevo yo",
      "se enfrían",
      "se enfrian",
      "convocatoria",
      "trabajos grupales",
      "proyectos grupales",
      "sostener movidas",
      "organizar participacion",
      "organizar participación",
      "todos participen",
      "proyecto colectivo",
    ]),
    empathicCoreOneToOne,
    empathicInflationLexicon,
    empathicInterpersonalSurface,
    empathicForCollective: countHits(text, [
      "para que el grupo",
      "para la comunidad no se rompa",
      "instrumental para el grupo",
      "escucha para sostener la comunidad",
    ]),
    publicVoice: countHits(text, [
      "audiencia",
      "postura",
      "agenda",
      "opinion publica",
      "incidir",
      "exposicion",
      "mensaje publico",
      "voz publica",
      "frente publico",
    ]),
    publicCommunicatorCore: countHits(text, [
      "tema publico",
      "tema público",
      "opinion publica",
      "discusion publica",
      "discusión pública",
      "debate",
      "debate publico",
      "posicion publica",
      "posición pública",
      "intervencion publica",
      "intervención pública",
      "tomar posicion",
      "tomar posición",
      "incidencia publica",
      "incidencia pública",
      "decir lo que nadie",
      "contexto social",
      "contexto politico",
      "contexto político",
      "contexto civico",
      "contexto cívico",
      "cuestion publica",
      "cuestión pública",
    ]),
  };
}

function hasAny(ids: string[], want: Set<string>): boolean {
  return ids.some((id) => want.has(id));
}

function penaltyFromVerdict(
  verdict: NegativeEvidenceVerdict,
  strength: number,
): number {
  if (
    verdict === "keep_candidate" ||
    verdict === "insufficient_negative_evidence" ||
    verdict === "watch_candidate" ||
    verdict === "frontier_candidate"
  ) {
    return 0;
  }
  if (verdict === "strong_discard") {
    return Math.min(0.25, Math.max(0.13, 0.13 + strength * 0.12));
  }
  if (verdict === "soft_discard") {
    return Math.min(0.12, Math.max(0.05, 0.05 + strength * 0.07));
  }
  return 0;
}

function computeStrength(params: {
  supportingLen: number;
  contradictLen: number;
  priorityBoost: boolean;
}): number {
  let s =
    0.18 +
    params.supportingLen * 0.07 +
    params.contradictLen * 0.09;
  if (params.priorityBoost) s += 0.12;
  return Math.min(0.95, s);
}

function riskInflation(verdict: NegativeEvidenceVerdict): string[] {
  if (
    verdict === "insufficient_negative_evidence" ||
    verdict === "keep_candidate" ||
    verdict === "watch_candidate" ||
    verdict === "frontier_candidate"
  ) {
    return [];
  }
  return [
    "Posible inflación semántica: vocabulario compartido entre familias rivales puede subir scores sin núcleo vocacional claro.",
  ];
}

const DISCARD_SCORE_GAP_MAX = 0.12;

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function parseAffinityScores(raw: unknown[] | undefined): HumanAffinityScore[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.filter((x): x is HumanAffinityScore => {
    if (!x || typeof x !== "object") return false;
    const o = x as HumanAffinityScore;
    return typeof o.id === "string" && typeof o.score === "number";
  });
}

/** Fuerza de afinidades núcleo expresadas para una familia (0–1). */
export function affinityExpressedCoreForFamily(
  familyId: string,
  affinityScores: unknown[] | undefined,
): number {
  const def = PROFILE_FAMILIES.find((f) => f.id === familyId);
  if (!def) return 0;
  const scores = parseAffinityScores(affinityScores);
  const byId = new Map(scores.map((s) => [s.id, s]));
  let sum = 0;
  let w = 0;
  for (const id of def.coreAffinities) {
    const a = byId.get(id);
    if (!a) continue;
    if (a.status !== "expressed") continue;
    const wt = Math.max(0.15, Math.min(1, a.confidence));
    sum += clamp01(a.score) * wt;
    w += wt;
  }
  return w > 0 ? clamp01(sum / w) : 0;
}

export function semanticCoreStrengthForFamily(
  familyId: string,
  signals: SemanticSignals,
): number {
  switch (familyId) {
    case "empathic_guide":
      return clamp01(
        signals.empathicCoreOneToOne.length * 0.28 +
          signals.empathicForCollective.length * 0.08,
      );
    case "community_builder":
      return clamp01(signals.communityCore.length * 0.22 + signals.empathicForCollective.length * 0.12);
    case "creative_storyteller":
      return clamp01(signals.narrativeCore.length * 0.2 + signals.culturalAsBackdrop.length * 0.06);
    case "public_communicator":
      return clamp01(
        signals.publicCommunicatorCore.length * 0.22 +
          signals.publicVoice.length * 0.18,
      );
    case "educator_interpreter":
      return clamp01(signals.educatorCore.length * 0.26);
    case "cultural_explorer":
      return clamp01(signals.culturalCenter.length * 0.18);
    case "institutional_operator":
      return clamp01(signals.institutionalCore.length * 0.2);
    case "diplomatic_social_connector":
      return clamp01(signals.diplomaticCore.length * 0.22);
    default:
      return 0;
  }
}

export type DiscardFinalGateInput = {
  topFamilyId: string;
  secondFamilyId: string;
  topVerdict: NegativeEvidenceVerdict;
  secondVerdict: NegativeEvidenceVerdict;
  topScore: number;
  secondScore: number;
  signals: SemanticSignals;
  affinityScores?: unknown[];
};

/**
 * Gates estrictos: el juez sólo puede “morder” el ranking final si se cumplen todas las condiciones.
 * No inventa ganador: sólo permite penalizar al top actual cuando un rival creíble está muy cerca.
 */
export function shouldApplyDiscardToFinal(input: DiscardFinalGateInput): boolean {
  const { topVerdict, secondVerdict, topScore, secondScore } = input;
  if (topVerdict !== "soft_discard" && topVerdict !== "strong_discard") {
    return false;
  }
  if (!Number.isFinite(topScore) || !Number.isFinite(secondScore)) return false;
  if (topScore - secondScore > DISCARD_SCORE_GAP_MAX) return false;

  if (secondVerdict === "strong_discard") return false;

  const topAffinity = affinityExpressedCoreForFamily(input.topFamilyId, input.affinityScores);
  const secondAffinity = affinityExpressedCoreForFamily(
    input.secondFamilyId,
    input.affinityScores,
  );
  const topSem = semanticCoreStrengthForFamily(input.topFamilyId, input.signals);
  const secondSem = semanticCoreStrengthForFamily(input.secondFamilyId, input.signals);

  const topCoreStrong = topAffinity >= 0.42 || topSem >= 0.52;
  if (topCoreStrong) return false;

  const secondKeep = secondVerdict === "keep_candidate";
  const secondCoreClearer =
    secondSem >= topSem + 0.1 ||
    secondAffinity >= topAffinity + 0.08 ||
    (secondSem >= 0.38 && secondSem > topSem);

  if (!secondKeep && !secondCoreClearer) return false;

  if (secondVerdict === "soft_discard" && !secondCoreClearer) return false;

  return true;
}

type EvalCtx = {
  text: string;
  signals: SemanticSignals;
  familyId: string;
  rank: number;
  score: number;
  topFiveIds: string[];
};

function evaluateCreativeStoryteller(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;
  const culturalInTop = hasAny(ctx.topFiveIds, new Set(["cultural_explorer"]));
  const eduInTop = hasAny(ctx.topFiveIds, new Set(["educator_interpreter"]));
  const pcInTop = hasAny(ctx.topFiveIds, new Set(["public_communicator"]));

  const narrHits = signals.narrativeCore.length;
  const instrHits = signals.instrumentalWriting.length;
  const culturalStrong = signals.culturalCenter.length >= 3;
  const eduStrong = signals.educatorCore.length >= 2;
  const pubLayer = signals.publicCommunicatorCore.length + signals.publicVoice.length;

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = [...signals.narrativeCore, ...signals.instrumentalWriting].slice(0, 12);
  let contradicting: string[] = [
    ...signals.culturalCenter.slice(0, 5),
    ...signals.educatorCore.slice(0, 5),
    ...signals.publicCommunicatorCore.slice(0, 6),
    ...signals.publicVoice.slice(0, 4),
  ];

  if (narrHits >= 2 && pubLayer <= 3) {
    verdict = "keep_candidate";
    reasons = [
      "Hay centro narrativo explícito (relato, escena, voz, forma, edición o construcción expresiva) suficiente para proteger al candidato.",
    ];
    contradicting = [];
  } else if (signals.publicCommunicatorCore.length >= 2 && narrHits <= 1 && pcInTop) {
    verdict = "strong_discard";
    reasons = [
      "El núcleo parece incidencia, debate o posición pública más que intimidad narrativa; Creative Storyteller puede estar inflado frente a Public Communicator.",
    ];
  } else if (narrHits >= 2) {
    verdict = "frontier_candidate";
    reasons = [
      "Conviven relato/narrativa con varias señales de espacio público; frontera Creative Storyteller vs Public Communicator.",
    ];
    contradicting = [];
  } else if (
    (signals.publicCommunicatorCore.length >= 1 || signals.publicVoice.length >= 2) &&
    narrHits <= 1 &&
    pcInTop
  ) {
    verdict = "soft_discard";
    reasons = [
      "Hay tema o intervención pública clara con relato débil; Creative Storyteller no debería ganar sólo por ‘mensaje’ o ‘voz’ genéricos.",
    ];
  } else if (instrHits >= 2 && culturalStrong) {
    verdict = culturalInTop || eduInTop ? "strong_discard" : "soft_discard";
    reasons = [
      "La escritura aparece como herramienta para ordenar investigación, síntesis cultural o comprensión de contextos más que como núcleo narrativo.",
    ];
  } else if (instrHits >= 1 && (signals.culturalCenter.length >= 2 || eduStrong)) {
    verdict = "frontier_candidate";
    reasons = [
      "Convive escritura/síntesis con exploración cultural o traducción para otros; frontera activa entre Creative Storyteller, Cultural Explorer y Educator Interpreter.",
    ];
  } else if (narrHits === 1 && instrHits >= 1) {
    verdict = "frontier_candidate";
    reasons = [
      "Señales narrativas débiles frente a escritura instrumental o contextual; revisión humana sugerida frente a Cultural Explorer / Educator Interpreter.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["No hay evidencia negativa suficiente para este candidato en esta pasada."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateCulturalExplorer(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;
  const csInTop = hasAny(ctx.topFiveIds, new Set(["creative_storyteller"]));
  const narrStrong = signals.narrativeCore.length >= 3;

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = signals.culturalCenter;
  let contradicting = [...signals.narrativeCore, ...signals.culturalAsBackdrop];

  if (signals.culturalCenter.length >= 3 && !narrStrong) {
    verdict = "keep_candidate";
    reasons = [
      "El centro parece ser historia, cultura, contextos y curiosidad cultural sostenida, no sólo relato o mensaje.",
    ];
  } else if (signals.culturalCenter.length >= 2 && narrStrong && csInTop) {
    verdict = "soft_discard";
    reasons = [
      "La cultura puede estar actuando como insumo para voz, relato o mensaje; Cultural Explorer podría estar inflado frente a Creative Storyteller.",
    ];
  } else if (signals.culturalCenter.length >= 1 && narrStrong) {
    verdict = "frontier_candidate";
    reasons = [
      "Conviven referencias culturales con núcleo narrativo fuerte; frontera entre exploración contextual y relato como centro.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Marcadores culturales insuficientes para descarte negativo fuerte."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateEducatorInterpreter(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;
  const pcInTop = hasAny(ctx.topFiveIds, new Set(["public_communicator"]));
  const pubLayer = signals.publicCommunicatorCore.length + signals.publicVoice.length;

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = signals.educatorCore;
  const contradicting = [
    ...signals.instrumentalWriting,
    ...signals.educatorWeak,
    ...signals.publicCommunicatorCore.slice(0, 5),
  ];

  if (signals.educatorCore.length >= 2) {
    verdict = "keep_candidate";
    reasons = [
      "Hay foco en traducir complejidad para que otros aprendan o entiendan (centro pedagógico).",
    ];
  } else if (pubLayer >= 3 && signals.educatorCore.length < 2 && pcInTop) {
    verdict = "soft_discard";
    reasons = [
      "Predomina explicar u opinar en espacio público sin señales formativas claras; Educator Interpreter puede estar inflado frente a Public Communicator.",
    ];
  } else if (
    signals.educatorVocabWeak.length >= 3 &&
    signals.educatorCore.length === 0 &&
    pubLayer >= 2
  ) {
    verdict = "soft_discard";
    reasons = [
      "Hay claridad/síntesis/explicar sin enseñar o formar explícitamente; Educator Interpreter puede subir por vocabulario compartido con comunicación pública.",
    ];
  } else if (
    signals.instrumentalWriting.length >= 2 &&
    signals.educatorCore.length === 0
  ) {
    verdict = "soft_discard";
    reasons = [
      "Predomina síntesis u orden interno sin intención pedagógica explícita hacia otros; Educator Interpreter puede estar inflado.",
    ];
  } else if (signals.educatorCore.length === 1 && signals.instrumentalWriting.length >= 1) {
    verdict = "frontier_candidate";
    reasons = [
      "Hay algo de enseñanza/explicar pero también escritura instrumental; frontera con Creative Storyteller o síntesis.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["No hay señales claras para penalizar Educator Interpreter en esta lectura."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateInstitutionalOperator(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;
  const dscInTop = hasAny(ctx.topFiveIds, new Set(["diplomatic_social_connector"]));
  const cbInTop = hasAny(ctx.topFiveIds, new Set(["community_builder"]));

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = signals.institutionalCore;
  let contradicting = [...signals.diplomaticCore];

  const formalStrong = signals.institutionalCore.length >= 3;
  const mediacionFuerte = signals.diplomaticCore.length >= 3;

  if (formalStrong && !mediacionFuerte) {
    verdict = "keep_candidate";
    reasons = [
      "El relato enfatiza marcos formales, procedimientos, reputación y avance dentro del sistema más que mediación entre actores como objeto único.",
    ];
  } else if (!formalStrong && mediacionFuerte && dscInTop) {
    verdict = "soft_discard";
    reasons = [
      "Las instituciones parecen escenario; el centro puede ser mediación relacional (Diplomatic Social Connector) más que operación institucional pura.",
    ];
  } else if (signals.communityCore.length >= 3 && !formalStrong && cbInTop) {
    verdict = "soft_discard";
    reasons = [
      "Predomina lenguaje de grupo/comunidad sin marco formal o poder institucional claro; Institutional Operator puede estar inflado frente a Community Builder.",
    ];
  } else if (formalStrong && mediacionFuerte) {
    verdict = "frontier_candidate";
    reasons = [
      "Conviven marco formal fuerte y mediación entre partes; frontera Institutional Operator vs Diplomatic Social Connector.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Marcadores institucionales mixtos; sin descarte negativo claro."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateDiplomaticConnector(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;
  const ioInTop = hasAny(ctx.topFiveIds, new Set(["institutional_operator"]));
  const cbInTop = hasAny(ctx.topFiveIds, new Set(["community_builder"]));

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = [...signals.diplomaticCore, ...signals.diplomaticWeakFormalOnly];
  const contradicting = [
    ...signals.institutionalCore,
    ...(cbInTop ? signals.communityCore : []),
  ];

  const mediacionFuerte = signals.diplomaticCore.length >= 2;
  const soloFormal =
    signals.diplomaticWeakFormalOnly.length >= 1 &&
    signals.diplomaticCore.length < 2;

  if (mediacionFuerte) {
    verdict = "keep_candidate";
    reasons = [
      "Hay mediación entre actores, intereses o posiciones como línea central plausible.",
    ];
  } else if (soloFormal && ioInTop) {
    verdict = "soft_discard";
    reasons = [
      "El vínculo parece subordinado a marco formal o institucional; Diplomatic Social Connector puede estar inflado frente a Institutional Operator.",
    ];
  } else if (signals.communityCore.length >= 3 && signals.diplomaticCore.length < 2 && cbInTop) {
    verdict = "soft_discard";
    reasons = [
      "La coordinación parece orientada a comunidad/pertenencia más que a negociación entre actores con intereses divergentes.",
    ];
  } else if (signals.diplomaticCore.length >= 1 && signals.institutionalCore.length >= 2) {
    verdict = "frontier_candidate";
    reasons = [
      "Conviven mediación leve con fuerte lenguaje institucional; frontera relacional vs formal.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["No hay evidencia negativa suficiente para DSC en esta pasada."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateTechnicalBuilder(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = signals.ejecucionTecnica;
  const contradicting = [
    ...signals.analisisEstrategico,
    ...signals.systemDesignCore,
  ];

  const ejecFuerte = signals.ejecucionTecnica.length >= 2;
  const soloAbstracto =
    signals.analisisEstrategico.length >= 2 && signals.ejecucionTecnica.length === 0;

  if (ejecFuerte) {
    verdict = "keep_candidate";
    reasons = [
      "Hay acción concreta sobre funcionamiento, fallas, operación o mejora práctica como núcleo.",
    ];
  } else if (soloAbstracto) {
    verdict = "soft_discard";
    reasons = [
      "Predominan escenarios/análisis sin señal fuerte de ejecución o meter mano; Technical Builder puede estar inflado.",
    ];
  } else if (signals.ejecucionTecnica.length === 1 && signals.analisisEstrategico.length >= 2) {
    verdict = "watch_candidate";
    reasons = [
      "Conviven ejecución puntual con análisis fuerte; vigilar si lo técnico es núcleo o apoyo.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Marcadores de ejecución técnica débiles para descarte claro."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateAnalyticalStrategist(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;
  const tbInTop = hasAny(ctx.topFiveIds, new Set(["technical_builder"]));

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = signals.analisisEstrategico;
  const contradicting = [
    ...signals.ejecucionTecnica,
    ...signals.analisisSubordinadoOperativo,
  ];

  const analisisFuerte = signals.analisisEstrategico.length >= 3;
  const operativoDomina =
    signals.ejecucionTecnica.length >= 2 &&
    signals.analisisEstrategico.length <= 2;

  if (analisisFuerte && !operativoDomina) {
    verdict = "keep_candidate";
    reasons = [
      "El centro parece comparación de escenarios, lectura de estructura y orientación de decisiones.",
    ];
  } else if (operativoDomina && tbInTop) {
    verdict = "soft_discard";
    reasons = [
      "El análisis aparece subordinado a ejecución inmediata o resolución operativa; Analytical Strategist puede estar inflado frente a Technical Builder.",
    ];
  } else if (signals.analisisSubordinadoOperativo.length >= 1) {
    verdict = "watch_candidate";
    reasons = [
      "Hay lenguaje de criterio/análisis al servicio de destrabar operación; vigilar frontera con ejecución técnica.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Sin contraste claro entre análisis estratégico y operación en esta lectura."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateSystemDesigner(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = signals.systemDesignCore;
  const contradicting = [
    ...signals.operacionPuntualVsDiseno,
    ...signals.ejecucionTecnica,
    ...(signals.systemDesignCore.length < 2 ? signals.analisisEstrategico : []),
  ];

  const disenoFuerte = signals.systemDesignCore.length >= 2;
  const soloOps =
    signals.operacionPuntualVsDiseno.length >= 1 ||
    (signals.ejecucionTecnica.length >= 2 && signals.systemDesignCore.length === 0);

  if (disenoFuerte) {
    verdict = "keep_candidate";
    reasons = [
      "Hay señal de diseño de estructura, marco, secuencia o sistema transferible, no sólo tarea puntual.",
    ];
  } else if (soloOps && !disenoFuerte) {
    verdict = "soft_discard";
    reasons = [
      "Predomina operación puntual, urgencia o parche sin arquitectura de funcionamiento; System Designer puede estar inflado.",
    ];
  } else if (signals.systemDesignCore.length === 1 && signals.analisisEstrategico.length >= 2) {
    verdict = "watch_candidate";
    reasons = [
      "Hay estructura/proceso mencionado pero también fuerte análisis comparativo; vigilar frontera con Analytical Strategist.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Marcadores de diseño sistémico insuficientes para descarte fuerte."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateCommunityBuilder(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;
  const egInTop = hasAny(ctx.topFiveIds, new Set(["empathic_guide"]));

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = signals.communityCore;
  const contradicting = [...signals.empathicCoreOneToOne, ...signals.empathicInflationLexicon.slice(0, 6)];

  const grupoFuerte = signals.communityCore.length >= 2;
  const soloIndividuoFuerte =
    signals.empathicCoreOneToOne.length >= 2 && signals.communityCore.length === 0;

  // Caso ambiguo: una sola señal grupal aislada — no forzar CB
  if (signals.communityCore.length === 1 && signals.empathicForCollective.length === 0) {
    verdict = "frontier_candidate";
    reasons = [
      "Hay una señal colectiva aislada; insuficiente para afirmar núcleo de Community Builder (evitar forzar por una sola palabra como ‘grupo’).",
    ];
  } else if (grupoFuerte) {
    verdict = "keep_candidate";
    reasons = [
      "Hay pertenencia, red, convocatoria, participación o sostenimiento de espacio común como núcleo plausible.",
    ];
  } else if (soloIndividuoFuerte && egInTop) {
    verdict = "soft_discard";
    reasons = [
      "Predomina acompañamiento uno a uno sin núcleo comunitario claro; Community Builder puede estar inflado frente a Empathic Guide.",
    ];
  } else if (signals.empathicForCollective.length >= 1) {
    verdict = "frontier_candidate";
    reasons = [
      "La escucha aparece al servicio del grupo/comunidad; frontera entre tejido colectivo y acompañamiento instrumental.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Marcadores de comunidad débiles; no hay base suficiente para descarte negativo."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateEmpathicGuide(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;
  const cbInTop = hasAny(ctx.topFiveIds, new Set(["community_builder"]));

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = [...signals.empathicCoreOneToOne, ...signals.empathicInflationLexicon.slice(0, 4)];
  const contradicting = [...signals.communityCore, ...signals.diplomaticCore.slice(0, 4)];

  const coreFuerte = signals.empathicCoreOneToOne.length >= 2;
  const inflacionGenerica =
    signals.empathicInflationLexicon.length >= 4 && signals.empathicCoreOneToOne.length < 2;
  const grupoDomina =
    signals.communityCore.length >= 2 || signals.empathicForCollective.length >= 1;
  const evidenciaColectivaFuerte = signals.communityCore.length >= 4;

  if (coreFuerte && !grupoDomina) {
    verdict = "keep_candidate";
    reasons = [
      "Hay señales uno a uno creíbles (persona, proceso individual, escucha a fondo) más que función grupal o mediación entre actores.",
    ];
  } else if (evidenciaColectivaFuerte && !coreFuerte && (cbInTop || ctx.rank <= 2)) {
    verdict = "strong_discard";
    reasons = [
      "Predomina comunidad/red/participación colectiva sin acompañamiento individual explícito; Empathic Guide no debe ganar sólo por vocabulario de ayuda/escucha.",
    ];
  } else if (grupoDomina && (cbInTop || signals.communityCore.length >= 3) && !coreFuerte) {
    verdict = inflacionGenerica ? "strong_discard" : "soft_discard";
    reasons = [
      inflacionGenerica
        ? "Muchas señales comunitarias y vocabulario genérico de escucha/ayuda sin núcleo uno a uno; Empathic Guide muy probablemente inflado frente a Community Builder."
        : "La evidencia apunta a grupo, red o continuidad colectiva más que a acompañamiento individual profundo; Empathic Guide puede estar inflado frente a Community Builder.",
    ];
  } else if (signals.diplomaticCore.length >= 2 && signals.empathicCoreOneToOne.length <= 1) {
    verdict = "frontier_candidate";
    reasons = [
      "Conviven escucha con mediación entre partes; frontera con Diplomatic Social Connector.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Marcadores de guía empática mixtos; no hay base suficiente para descarte fuerte."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  let suggestedPenalty = penaltyFromVerdict(verdict, strength);
  if (verdict === "soft_discard" && evidenciaColectivaFuerte) {
    suggestedPenalty = Math.min(0.2, suggestedPenalty + 0.045);
  }

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty,
  };
}

function evaluatePublicCommunicator(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;
  const csInTop = hasAny(ctx.topFiveIds, new Set(["creative_storyteller"]));

  const pubLayer = signals.publicCommunicatorCore.length + signals.publicVoice.length;
  const narrHits = signals.narrativeCore.length;

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = [...signals.publicVoice, ...signals.publicCommunicatorCore].slice(0, 14);
  const contradicting = [...signals.instrumentalWriting, ...signals.narrativeCore.slice(0, 8)];

  if (signals.publicCommunicatorCore.length >= 2 || pubLayer >= 3) {
    verdict = "keep_candidate";
    reasons = [
      "Hay tema público, audiencia, postura, debate o incidencia clara — núcleo de voz pública más allá de ‘mensaje’ íntimo.",
    ];
  } else if (narrHits >= 3 && pubLayer <= 1 && csInTop) {
    verdict = "soft_discard";
    reasons = [
      "Predomina intimidad narrativa o mundo interno sin intervención pública explícita; Public Communicator puede estar inflado frente a Creative Storyteller.",
    ];
  } else if (signals.instrumentalWriting.length >= 2 && pubLayer === 0) {
    verdict = "soft_discard";
    reasons = [
      "Hay escritura o síntesis sin señal clara de audiencia o asunto público; Public Communicator puede estar inflado.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Marcadores públicos ambiguos para descarte fuerte."];
  }

  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const strength = computeStrength({
    supportingLen: supporting.length,
    contradictLen: contradicting.length,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    supportingEvidence: supporting.length ? supporting : undefined,
    contradictingEvidence: contradicting.length ? contradicting : undefined,
    riskNotes: riskInflation(verdict),
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateGenericFamily(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const priorityBoost = ctx.rank <= 5 && ctx.score > 0;
  const verdict: NegativeEvidenceVerdict = priorityBoost
    ? "frontier_candidate"
    : "insufficient_negative_evidence";
  const reasons =
    priorityBoost
      ? [
          "Candidato en top 5 con score positivo: sin reglas de rivalidad específicas; frontera o revisión humana si compite con lectura principal.",
        ]
      : ["Sin reglas de descarte específicas para esta familia en esta iteración."];
  const strength = computeStrength({
    supportingLen: 0,
    contradictLen: 0,
    priorityBoost,
  });

  return {
    verdict,
    strength,
    reasons,
    riskNotes:
      verdict === "frontier_candidate"
        ? [
            "Auditoría conservadora: familia competidora en ranking alto merece contraste manual si hay tensión con el relato.",
          ]
        : [],
    suggestedPenalty: penaltyFromVerdict(verdict, strength),
  };
}

function evaluateFamily(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  switch (ctx.familyId) {
    case "creative_storyteller":
      return evaluateCreativeStoryteller(ctx);
    case "cultural_explorer":
      return evaluateCulturalExplorer(ctx);
    case "educator_interpreter":
      return evaluateEducatorInterpreter(ctx);
    case "institutional_operator":
      return evaluateInstitutionalOperator(ctx);
    case "diplomatic_social_connector":
      return evaluateDiplomaticConnector(ctx);
    case "technical_builder":
      return evaluateTechnicalBuilder(ctx);
    case "analytical_strategist":
      return evaluateAnalyticalStrategist(ctx);
    case "system_designer":
      return evaluateSystemDesigner(ctx);
    case "community_builder":
      return evaluateCommunityBuilder(ctx);
    case "empathic_guide":
      return evaluateEmpathicGuide(ctx);
    case "public_communicator":
      return evaluatePublicCommunicator(ctx);
    default:
      return evaluateGenericFamily(ctx);
  }
}

function buildOriginalRanking(
  familyScores: ProfileFamilyScore[],
): NegativeEvidenceRankingItem[] {
  return familyScores.map((item, index) => ({
    familyId: toFamilyId(item),
    score: scoreOf(item),
    rank: index + 1,
  }));
}

function buildShadowPreview(params: {
  originalRanking: NegativeEvidenceRankingItem[];
  findingsByFamily: Map<string, NegativeEvidenceFinding>;
}): NegativeEvidenceShadowRankingItem[] {
  const originalByFamily = new Map(
    params.originalRanking.map((item) => [item.familyId, item]),
  );

  const shadowSorted = params.originalRanking
    .map((item) => {
      const finding = params.findingsByFamily.get(item.familyId);
      const penalty =
        finding?.shouldAffectScoreNow && typeof finding.suggestedPenalty === "number"
          ? finding.suggestedPenalty
          : 0;
      return {
        familyId: item.familyId,
        originalScore: item.score,
        shadowScore: Math.max(0, Number((item.score - penalty).toFixed(4))),
        originalRank: item.rank,
      };
    })
    .sort((a, b) => b.shadowScore - a.shadowScore || a.originalRank - b.originalRank)
    .map((item, index) => ({
      ...item,
      shadowRank: index + 1,
    }));

  return shadowSorted
    .map((item) => {
      const original = originalByFamily.get(item.familyId);
      if (!original) return null;
      return {
        familyId: item.familyId,
        originalScore: item.originalScore,
        shadowScore: item.shadowScore,
        originalRank: original.rank,
        shadowRank: item.shadowRank,
      };
    })
    .filter((item): item is NegativeEvidenceShadowRankingItem => Boolean(item));
}

function isFrontier(scores: { score: number }[]): boolean {
  if (scores.length < 2) return false;
  const gap = scores[0].score - scores[1].score;
  return scores[0].score >= 0.45 && scores[1].score >= 0.4 && gap <= 0.1;
}

export function runNegativeEvidenceJudge(params: {
  intake: UserIntake;
  finalReading: FinalReading;
  familyScores?: ProfileFamilyScore[];
  affinityScores?: unknown[];
  similarCases?: unknown[];
}): NegativeEvidenceReview {
  const text = buildIntakeText(params.intake);
  const signals = buildSemanticSignals(text);

  const familyScores = (params.familyScores ?? [])
    .slice()
    .sort((a, b) => scoreOf(b) - scoreOf(a) || confidenceOf(b) - confidenceOf(a));

  /** Top 5 competidores reales + hasta 3 más para contexto */
  const evaluatedRows = familyScores.slice(0, 8);
  const topFiveIds = evaluatedRows.slice(0, 5).map(toFamilyId).filter(Boolean);

  const evaluatedFamiliesDraft: NegativeEvidenceFinding[] = evaluatedRows.map((family, index) => {
    const familyId = toFamilyId(family);
    const rank = index + 1;
    const score = scoreOf(family);
    const base = evaluateFamily({
      text,
      signals,
      familyId,
      rank,
      score,
      topFiveIds,
    });

    return {
      familyId,
      familyLabel: FAMILY_LABELS[familyId] ?? familyId,
      originalRank: rank,
      originalScore: score,
      ...base,
      shouldAffectScoreNow: false,
    };
  });

  const findingsByFamily = new Map(
    evaluatedFamiliesDraft.map((item) => [String(item.familyId), item]),
  );

  const originalRanking = buildOriginalRanking(evaluatedRows);
  const topId = originalRanking[0]?.familyId ?? "";
  const secondId = originalRanking[1]?.familyId ?? "";
  const topFinding = topId ? findingsByFamily.get(topId) : undefined;
  const secondFinding = secondId ? findingsByFamily.get(secondId) : undefined;
  const topScore = originalRanking[0]?.score ?? 0;
  const secondScore = originalRanking[1]?.score ?? 0;

  let discardGateExplanation = "";
  const gatePasses =
    topFinding &&
    secondFinding &&
    shouldApplyDiscardToFinal({
      topFamilyId: topId,
      secondFamilyId: secondId,
      topVerdict: topFinding.verdict,
      secondVerdict: secondFinding.verdict,
      topScore,
      secondScore,
      signals,
      affinityScores: params.affinityScores,
    });

  if (topFinding && secondFinding) {
    if (gatePasses) {
      topFinding.shouldAffectScoreNow = true;
      discardGateExplanation =
        "Gates de descarte cumplidos: el top tiene soft/strong_discard, el rival es creíble, brecha de score ≤ 0.12 y el top no muestra núcleo de afinidades/texto lo bastante fuerte.";
    } else {
      discardGateExplanation =
        "Gates de descarte no cumplidos: no se aplica penalización al ranking sombra (control de rivalidad conservador).";
    }
  }

  const humanReviewSuggested =
    Boolean(topFinding && secondFinding) &&
    topScore > 0 &&
    secondScore > 0 &&
    topScore - secondScore <= 0.12 &&
    ((topFinding?.verdict === "frontier_candidate" &&
      (secondFinding?.verdict === "keep_candidate" ||
        secondFinding?.verdict === "frontier_candidate")) ||
      (topFinding?.verdict === "keep_candidate" && secondFinding?.verdict === "keep_candidate"));

  const frontierPatternNeedsReview =
    Boolean(topFinding?.verdict === "frontier_candidate" || secondFinding?.verdict === "frontier_candidate") &&
    topScore - secondScore <= 0.14;

  const evaluatedFamilies = evaluatedFamiliesDraft;

  const shadowAdjustedRankingPreview = buildShadowPreview({
    originalRanking,
    findingsByFamily,
  });

  const originalTop = originalRanking[0]?.familyId ?? null;
  const shadowTop = shadowAdjustedRankingPreview[0]?.familyId ?? null;
  const wouldChangeTopFamily = Boolean(originalTop && shadowTop && originalTop !== shadowTop);
  const wouldAffectRealResult = wouldChangeTopFamily;

  const originalFrontier = isFrontier(originalRanking);
  const shadowFrontier = isFrontier(
    shadowAdjustedRankingPreview.map((item) => ({ score: item.shadowScore })),
  );

  return {
    mode: "audit_only_shadow_preview",
    evaluatedFamilies,
    originalRanking,
    shadowAdjustedRankingPreview,
    wouldChangeTopFamily,
    wouldOpenFrontier: !originalFrontier && shadowFrontier,
    wouldCloseFrontier: originalFrontier && !shadowFrontier,
    wouldAffectRealResult,
    humanReviewSuggested,
    frontierPatternNeedsReview,
    summary:
      "Juez de Descarte (audit-only): rivalidades y vocabulario compartido; el ranking sombra sólo aplica penalizaciones si `shouldAffectScoreNow` pasa gates estrictos (no inventa ganador).",
    warnings: [
      "Este preview no modifica familyScores ni resultado publicado.",
      "Las penalizaciones sugeridas (`suggestedPenalty`) son auditivas; el sombra usa sólo las marcadas con `shouldAffectScoreNow`.",
      discardGateExplanation || "Sin par top/segundo evaluable para gates de aplicación.",
    ],
  };
}
