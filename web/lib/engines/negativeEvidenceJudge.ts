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
  /** Escucha/acompañamiento uno a uno */
  empathicOneToOne: string[];
  /** Escucha al servicio del grupo/comunidad */
  empathicForCollective: string[];
  publicVoice: string[];
};

function buildSemanticSignals(text: string): SemanticSignals {
  return {
    narrativeCore: countHits(text, [
      "relato",
      "relatos",
      "narrar",
      "narrativa",
      "voz",
      "tono",
      "escena",
      "forma verbal",
      "claridad narrativa",
      "editando",
      "construir mensajes",
      "construccion expresiva",
      "historias",
      "cuento",
      "dialogos",
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
      "pertenencia",
      "circulacion",
      "coordinacion colectiva",
      "grupos",
      "espacios colectivos",
      "participacion",
      "tejido",
      "clima grupal",
      "sostener comunidad",
    ]),
    empathicOneToOne: countHits(text, [
      "uno a uno",
      "persona",
      "acompanar",
      "escuchar",
      "contener",
      "preguntas justas",
      "procesos personales",
      "sin invadir",
      "procesos humanos",
    ]),
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
      "publica",
      "opinion publica",
      "incidir",
      "exposicion",
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
  if (verdict === "strong_discard") {
    return Math.min(0.25, Math.max(0.13, 0.13 + strength * 0.12));
  }
  if (verdict === "soft_discard") {
    return Math.min(0.12, Math.max(0.05, 0.05 + strength * 0.07));
  }
  if (verdict === "watch_candidate") {
    return Math.min(0.07, Math.max(0.03, 0.03 + strength * 0.04));
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
  if (verdict === "insufficient_negative_evidence" || verdict === "keep_candidate") {
    return [];
  }
  return [
    "Posible inflación semántica: vocabulario compartido entre familias rivales puede subir scores sin núcleo vocacional claro.",
  ];
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
  const { signals, text } = ctx;
  const culturalInTop = hasAny(ctx.topFiveIds, new Set(["cultural_explorer"]));
  const eduInTop = hasAny(ctx.topFiveIds, new Set(["educator_interpreter"]));

  const narrHits = signals.narrativeCore.length;
  const instrHits = signals.instrumentalWriting.length;
  const culturalStrong = signals.culturalCenter.length >= 3;
  const eduStrong = signals.educatorCore.length >= 2;

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = [...signals.narrativeCore, ...signals.instrumentalWriting].slice(0, 12);
  let contradicting: string[] = [...signals.culturalCenter.slice(0, 5), ...signals.educatorCore.slice(0, 5)];

  if (narrHits >= 2) {
    verdict = "keep_candidate";
    reasons = [
      "Hay centro narrativo explícito (relato, voz, forma, edición o construcción expresiva) suficiente para no marcar inflación fuerte.",
    ];
    contradicting = [];
  } else if (instrHits >= 2 && culturalStrong) {
    verdict = culturalInTop || eduInTop ? "strong_discard" : "soft_discard";
    reasons = [
      "La escritura aparece como herramienta para ordenar investigación, síntesis cultural o comprensión de contextos más que como núcleo narrativo.",
    ];
  } else if (instrHits >= 1 && (signals.culturalCenter.length >= 2 || eduStrong)) {
    verdict = "watch_candidate";
    reasons = [
      "Convive escritura/síntesis con exploración cultural o traducción para otros; vigilar si Creative Storyteller está inflado frente a Cultural Explorer o Educator Interpreter.",
    ];
  } else if (narrHits === 1 && instrHits >= 1) {
    verdict = "watch_candidate";
    reasons = [
      "Señales narrativas débiles frente a escritura instrumental o contextual; conviene contrastar con Cultural Explorer / Educator Interpreter.",
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
    verdict = "watch_candidate";
    reasons = [
      "Conviven referencias culturales con núcleo narrativo fuerte; vigilar si la exploración contextual es centro o fondo.",
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

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = signals.educatorCore;
  const contradicting = [...signals.instrumentalWriting, ...signals.educatorWeak];

  if (signals.educatorCore.length >= 2) {
    verdict = "keep_candidate";
    reasons = [
      "Hay foco en traducir complejidad para que otros aprendan o entiendan (centro pedagógico).",
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
    verdict = "watch_candidate";
    reasons = [
      "Hay algo de enseñanza explicar pero también mucha escritura instrumental; vigilar frontera con Creative Storyteller o síntesis.",
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
  } else if (formalStrong && mediacionFuerte) {
    verdict = "watch_candidate";
    reasons = [
      "Conviven marco formal fuerte y mediación entre partes; vigilar frontera Institutional Operator vs Diplomatic Social Connector.",
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
    verdict = "watch_candidate";
    reasons = [
      "Conviven mediación leve con fuerte lenguaje institucional; revisar si el centro es relacional o formal.",
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
  const contradicting = [...signals.empathicOneToOne];

  const grupoFuerte = signals.communityCore.length >= 2;
  const soloIndividuo =
    signals.empathicOneToOne.length >= 2 && signals.communityCore.length === 0;

  if (grupoFuerte) {
    verdict = "keep_candidate";
    reasons = [
      "Hay pertenencia, circulación grupal o sostenimiento de espacio común como núcleo plausible.",
    ];
  } else if (soloIndividuo && egInTop) {
    verdict = "soft_discard";
    reasons = [
      "Predomina escucha o sostén individual sin núcleo comunitario claro; Community Builder puede estar inflado frente a Empathic Guide.",
    ];
  } else if (signals.empathicForCollective.length >= 1) {
    verdict = "watch_candidate";
    reasons = [
      "La escucha aparece al servicio del grupo/comunidad; vigilar si el centro es tejido colectivo o acompañamiento instrumental.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Marcadores de comunidad débiles para descarte claro."];
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
  const supporting = signals.empathicOneToOne;
  const contradicting = [...signals.communityCore, ...signals.diplomaticCore.slice(0, 4)];

  const unoAUnoFuerte = signals.empathicOneToOne.length >= 3;
  const grupoDomina = signals.communityCore.length >= 2 || signals.empathicForCollective.length >= 1;

  if (unoAUnoFuerte && !grupoDomina) {
    verdict = "keep_candidate";
    reasons = [
      "El centro parece acompañamiento uno a uno, escucha y procesos personales más que función grupal o mediación entre actores.",
    ];
  } else if (grupoDomina && cbInTop) {
    verdict = "soft_discard";
    reasons = [
      "La escucha parece al servicio de comunidad o grupo; Empathic Guide puede estar inflado frente a Community Builder.",
    ];
  } else if (signals.diplomaticCore.length >= 2 && signals.empathicOneToOne.length <= 2) {
    verdict = "watch_candidate";
    reasons = [
      "Conviven escucha con mediación entre partes; vigilar frontera con Diplomatic Social Connector.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Marcadores de guía empática mixtos; sin descarte fuerte."];
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

function evaluatePublicCommunicator(ctx: EvalCtx): Omit<NegativeEvidenceFinding, "familyId" | "familyLabel" | "shouldAffectScoreNow"> {
  const { signals } = ctx;

  let verdict: NegativeEvidenceVerdict = "insufficient_negative_evidence";
  let reasons: string[] = [];
  const supporting = signals.publicVoice;
  const contradicting = [...signals.instrumentalWriting];

  if (signals.publicVoice.length >= 2) {
    verdict = "keep_candidate";
    reasons = ["Hay audiencia, postura, agenda o voluntad de incidir en espacio público."];
  } else if (signals.instrumentalWriting.length >= 2 && signals.publicVoice.length === 0) {
    verdict = "soft_discard";
    reasons = [
      "Hay escritura o mensajes sin señal clara de audiencia pública o intervención; Public Communicator puede estar inflado.",
    ];
  } else {
    verdict = "insufficient_negative_evidence";
    reasons = ["Marcadores públicos ambiguos."];
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
    ? "watch_candidate"
    : "insufficient_negative_evidence";
  const reasons =
    priorityBoost
      ? [
          "Candidato en top 5 con score positivo: sin reglas de rivalidad específicas para esta familia; vigilar coherencia global del ranking.",
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
      verdict === "watch_candidate"
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
      const penalty = finding?.suggestedPenalty ?? 0;
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

  const evaluatedFamilies: NegativeEvidenceFinding[] = evaluatedRows.map((family, index) => {
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
    evaluatedFamilies.map((item) => [String(item.familyId), item]),
  );
  const originalRanking = buildOriginalRanking(evaluatedRows);
  const shadowAdjustedRankingPreview = buildShadowPreview({
    originalRanking,
    findingsByFamily,
  });

  const originalTop = originalRanking[0]?.familyId ?? null;
  const shadowTop = shadowAdjustedRankingPreview[0]?.familyId ?? null;
  const wouldChangeTopFamily = Boolean(originalTop && shadowTop && originalTop !== shadowTop);

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
    summary:
      "Juez de Descarte (audit-only): rivalidades prioritarias evaluadas sobre candidatos top; ranking en sombra simula penalizaciones hipotéticas (incl. watch_candidate) sin alterar scores reales.",
    warnings: [
      "Este preview no modifica el resultado real.",
      "No altera familyScores reales, resultType, corePattern, finalDiagnostic ni thresholds.",
      "No aplica boosts positivos; suggestedPenalty es sólo informativa para simulación.",
    ],
  };
}
