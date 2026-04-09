import type { ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import { normalizeConfidence } from "../utils/scoring";

type ProfileTemplate = {
  id: string;
  label: string;
  summary: string;
  supportingSignalKeys: string[];
};

type ScoredProfile = ProbableProfile & {
  rawScore: number;
};

const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    id: "diplomatic_social_connector",
    label: "Diplomatic Social Connector",
    summary:
      "Tiende a articular personas, coordinar actores, mediar entre intereses y sostener funcionamiento colectivo.",
    supportingSignalKeys: [
      "social_coordination",
      "practical_organizing",
      "system_thinking",
    ],
  },
  {
    id: "community_builder",
    label: "Community Builder",
    summary:
      "Tiende a construir pertenencia, circulación e interacción humana sostenida en grupos o comunidades.",
    supportingSignalKeys: [
      "social_coordination",
      "empathic_listening",
      "narrative_creation",
      "practical_organizing",
    ],
  },
  {
    id: "analytical_strategist",
    label: "Analytical Strategist",
    summary:
      "Tiende a detectar patrones, ordenar complejidad y pensar movimientos con lógica estructural.",
    supportingSignalKeys: [
      "pattern_analysis",
      "system_thinking",
      "opportunity_detection",
    ],
  },
  {
    id: "creative_storyteller",
    label: "Creative Storyteller",
    summary:
      "Tiende a expresar sentido, construir relato y transformar experiencia en lenguaje.",
    supportingSignalKeys: [
      "narrative_creation",
      "cultural_curiosity",
      "opportunity_detection",
    ],
  },
  {
    id: "technical_builder",
    label: "Technical Builder",
    summary:
      "Tiende a estructurar, ejecutar y mejorar procesos o sistemas concretos.",
    supportingSignalKeys: [
      "system_thinking",
      "practical_organizing",
      "pattern_analysis",
    ],
  },
  {
    id: "cultural_explorer",
    label: "Cultural Explorer",
    summary:
      "Tiende a orientarse por ideas, contextos, cultura y aprendizaje persistente.",
    supportingSignalKeys: [
      "cultural_curiosity",
      "pattern_analysis",
      "system_thinking",
    ],
  },
  {
    id: "empathic_guide",
    label: "Empathic Guide",
    summary:
      "Tiende a leer tensiones humanas, escuchar en profundidad y ayudar a otros a ordenar situaciones complejas.",
    supportingSignalKeys: [
      "empathic_listening",
      "social_coordination",
      "practical_organizing",
    ],
  },
];

const HUMAN_GUIDE_CUES = [
  "escuchar",
  "escucha",
  "acompanar",
  "acompañar",
  "acompanando",
  "acompañando",
  "acompanamiento",
  "acompañamiento",
  "entender",
  "ayudar",
  "ayudar a otros",
  "contener",
  "contencion",
  "contención",
  "presencia humana",
  "hacer preguntas justas",
  "hacer buenas preguntas",
  "conflicto",
  "conflictos",
  "tension",
  "tensión",
  "tensiones",
  "persona",
  "personas",
  "situacion",
  "situaciones",
  "crisis humana",
  "crisis humanas",
  "situaciones personales",
  "situaciones personales complejas",
];

const CONNECTOR_CUES = [
  "coordinar",
  "coordinando",
  "coordinacion",
  "coordinación",
  "articular",
  "articulando",
  "articulacion",
  "articulación",
  "alinear",
  "alineando",
  "mediar",
  "mediando",
  "negociar",
  "negociando",
  "negociacion",
  "negociación",
  "intereses",
  "sectores",
  "areas",
  "áreas",
  "cruces",
  "actores",
  "vinculo",
  "vínculo",
  "vinculos",
  "vínculos",
  "red",
  "redes",
  "institucional",
  "institucionales",
  "diplomacia",
  "alianza",
  "alianzas",
  "stakeholder",
  "stakeholders",
  "partnership",
  "partnerships",
  "representando",
  "posiciones",
  "bajar tensiones",
  "reputacion",
  "reputación",
];

const EXECUTION_CUES = [
  "resolver fallas",
  "fallas",
  "ajustar procesos",
  "ajusto procesos",
  "operacion",
  "operación",
  "operativo",
  "operativa",
  "priorizar",
  "prioridad",
  "orden operativo",
  "apagar incendios",
  "incendios",
  "crisis",
  "destrabar",
  "hacer que salga",
  "sin trabarse",
  "pasos concretos",
  "ejecucion",
  "ejecución",
  "mejorar procesos",
];

const ANALYTICAL_CUES = [
  "escenarios",
  "comparar",
  "comparando",
  "alternativas",
  "criterio",
  "criterio comparativo",
  "estructura",
  "lectura estructural",
  "modelo",
  "logica",
  "lógica",
  "costo de cada camino",
  "decidir",
  "decision",
  "decisión",
  "estrategia",
  "pensamiento estrategico",
  "pensamiento estratégico",
  "posicionamiento",
  "lectura de oportunidad",
  "analisis",
  "análisis",
];

const CULTURAL_CUES = [
  "historia",
  "cultura",
  "idiomas",
  "lenguas",
  "literatura",
  "arte",
  "filosofia",
  "filosofía",
  "antropologia",
  "antropología",
  "sociologia",
  "sociología",
  "geopolitica",
  "geopolítica",
  "procesos sociales",
  "contextos",
  "contexto",
  "contexto cultural",
  "comparar contextos",
  "relacionar contextos",
  "autores",
  "campos",
  "curiosidad cultural",
  "interes cultural",
  "interés cultural",
  "aprender idiomas",
  "leer historia",
];

const COMMUNITY_CUES = [
  "comunidad",
  "comunidades",
  "pertenencia",
  "circulacion",
  "circulación",
  "grupo",
  "grupos",
  "interaccion",
  "interacción",
  "espacio colectivo",
  "espacios colectivos",
  "colectivo",
  "colectivos",
  "miembros",
  "participacion",
  "participación",
  "clima grupal",
  "sostener comunidad",
  "community",
  "programa",
  "programas",
  "cohorte",
  "cohortes",
];

const STORYTELLER_CUES = [
  "escribir",
  "escribiendo",
  "redactar",
  "redactando",
  "editar",
  "editando",
  "relato",
  "narrativa",
  "narrar",
  "copy",
  "voz",
  "nombrar",
  "verbalizar",
  "dar forma verbal",
  "contenido",
  "editorial",
  "construir relato",
  "construyendo relato",
  "claridad narrativa",
  "construccion de voz",
  "construcción de voz",
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildSignalWeightMap(signals: DetectedSignal[]): Record<string, number> {
  return signals.reduce<Record<string, number>>((acc, signal) => {
    acc[signal.key] = Math.max(acc[signal.key] ?? 0, signal.weight ?? 0);
    return acc;
  }, {});
}

function hasSignal(signalMap: Record<string, number>, key: string): boolean {
  return (signalMap[key] ?? 0) > 0;
}

function getRelevantEvidenceText(signals: DetectedSignal[]): string {
  const text = signals
    .flatMap((signal) =>
      (signal.evidence ?? []).map((item) => item.excerpt ?? "")
    )
    .join(" ");

  return normalizeText(text);
}

function countCueHits(text: string, cues: string[]): number {
  return cues.filter((cue) => text.includes(normalizeText(cue))).length;
}

function passesHardGate(
  template: ProfileTemplate,
  signalMap: Record<string, number>,
  humanCueCount: number,
  connectorCueCount: number,
  executionCueCount: number,
  analyticalCueCount: number,
  culturalCueCount: number,
  communityCueCount: number,
  storytellerCueCount: number
): boolean {
  if (template.id === "diplomatic_social_connector") {
    return hasSignal(signalMap, "social_coordination") && connectorCueCount >= 2;
  }

  if (template.id === "community_builder") {
    return (
      hasSignal(signalMap, "social_coordination") &&
      (communityCueCount >= 2 ||
        (hasSignal(signalMap, "empathic_listening") &&
          hasSignal(signalMap, "narrative_creation")))
    );
  }

  if (template.id === "empathic_guide") {
    return (
      hasSignal(signalMap, "empathic_listening") &&
      humanCueCount >= 2 &&
      humanCueCount >= connectorCueCount
    );
  }

  if (template.id === "technical_builder") {
    return hasSignal(signalMap, "practical_organizing") && executionCueCount >= 2;
  }

  if (template.id === "analytical_strategist") {
    return (
      hasSignal(signalMap, "pattern_analysis") &&
      (hasSignal(signalMap, "system_thinking") ||
        hasSignal(signalMap, "opportunity_detection") ||
        analyticalCueCount >= 2)
    );
  }

  if (template.id === "cultural_explorer") {
    return (
      hasSignal(signalMap, "cultural_curiosity") &&
      culturalCueCount >= 2 &&
      (hasSignal(signalMap, "pattern_analysis") ||
        hasSignal(signalMap, "system_thinking"))
    );
  }

  if (template.id === "creative_storyteller") {
    return hasSignal(signalMap, "narrative_creation") && storytellerCueCount >= 2;
  }

  return true;
}

function scoreTemplate(
  template: ProfileTemplate,
  signals: DetectedSignal[],
  signalMap: Record<string, number>,
  humanCueCount: number,
  connectorCueCount: number,
  executionCueCount: number,
  analyticalCueCount: number,
  culturalCueCount: number,
  communityCueCount: number,
  storytellerCueCount: number
): ScoredProfile | null {
  if (
    !passesHardGate(
      template,
      signalMap,
      humanCueCount,
      connectorCueCount,
      executionCueCount,
      analyticalCueCount,
      culturalCueCount,
      communityCueCount,
      storytellerCueCount
    )
  ) {
    return null;
  }

  const matchedSignals = signals.filter((signal) =>
    template.supportingSignalKeys.includes(signal.key)
  );

  const uniqueMatchedKeys = Array.from(
    new Set(matchedSignals.map((signal) => signal.key))
  );

  const keyCoverage =
    uniqueMatchedKeys.length / Math.max(template.supportingSignalKeys.length, 1);

  const baseSignalScore =
    matchedSignals.reduce((acc, signal) => acc + signal.weight, 0) /
    Math.max(template.supportingSignalKeys.length, 1);

  const hasEnoughEvidence =
    uniqueMatchedKeys.length >= 2 && keyCoverage >= 0.5;

  if (!hasEnoughEvidence) {
    return null;
  }

  let adjustedScore = baseSignalScore;

  if (template.id === "empathic_guide") {
    if (hasSignal(signalMap, "empathic_listening")) {
      adjustedScore += 0.14;
    }

    if (humanCueCount >= 3) {
      adjustedScore += 0.16;
    }

    if (
      hasSignal(signalMap, "empathic_listening") &&
      hasSignal(signalMap, "social_coordination")
    ) {
      adjustedScore += 0.08;
    }

    if (
      hasSignal(signalMap, "empathic_listening") &&
      hasSignal(signalMap, "practical_organizing")
    ) {
      adjustedScore += 0.07;
    }

    if (humanCueCount >= culturalCueCount + 1) {
      adjustedScore += 0.10;
    }

    if (connectorCueCount > humanCueCount) {
      adjustedScore -= 0.22;
    }

    if (communityCueCount >= 3) {
      adjustedScore -= 0.12;
    }

    if (culturalCueCount >= humanCueCount + 2) {
      adjustedScore -= 0.10;
    }
  }

  if (template.id === "diplomatic_social_connector") {
    if (connectorCueCount >= 3) {
      adjustedScore += 0.20;
    }

    if (
      hasSignal(signalMap, "social_coordination") &&
      hasSignal(signalMap, "practical_organizing")
    ) {
      adjustedScore += 0.08;
    }

    if (
      hasSignal(signalMap, "social_coordination") &&
      hasSignal(signalMap, "system_thinking")
    ) {
      adjustedScore += 0.08;
    }

    if (connectorCueCount > humanCueCount) {
      adjustedScore += 0.08;
    }

    if (humanCueCount >= connectorCueCount + 2) {
      adjustedScore -= 0.12;
    }
  }

  if (template.id === "technical_builder") {
    if (
      hasSignal(signalMap, "system_thinking") &&
      hasSignal(signalMap, "practical_organizing")
    ) {
      adjustedScore += 0.08;
    }

    if (
      hasSignal(signalMap, "pattern_analysis") &&
      hasSignal(signalMap, "practical_organizing")
    ) {
      adjustedScore += 0.05;
    }

    if (executionCueCount >= 3) {
      adjustedScore += 0.16;
    }

    if (executionCueCount === 0) {
      adjustedScore -= 0.20;
    }

    if (analyticalCueCount >= 3 && executionCueCount < 2) {
      adjustedScore -= 0.12;
    }
  }

  if (template.id === "analytical_strategist") {
    if (
      hasSignal(signalMap, "pattern_analysis") &&
      hasSignal(signalMap, "system_thinking")
    ) {
      adjustedScore += 0.10;
    }

    if (
      hasSignal(signalMap, "pattern_analysis") &&
      hasSignal(signalMap, "opportunity_detection")
    ) {
      adjustedScore += 0.06;
    }

    if (analyticalCueCount >= 2) {
      adjustedScore += 0.14;
    }

    if (executionCueCount < 2) {
      adjustedScore += 0.08;
    }

    if (analyticalCueCount >= culturalCueCount + 2) {
      adjustedScore += 0.12;
    }
  }

  if (template.id === "creative_storyteller") {
    if (
      hasSignal(signalMap, "narrative_creation") &&
      hasSignal(signalMap, "cultural_curiosity")
    ) {
      adjustedScore += 0.06;
    }

    if (
      hasSignal(signalMap, "narrative_creation") &&
      hasSignal(signalMap, "opportunity_detection")
    ) {
      adjustedScore += 0.12;
    }

    if (storytellerCueCount >= 2) {
      adjustedScore += 0.18;
    }

    if (storytellerCueCount >= 4) {
      adjustedScore += 0.12;
    }

    if (storytellerCueCount >= culturalCueCount + 1) {
      adjustedScore += 0.10;
    }

    if (culturalCueCount >= storytellerCueCount + 2) {
      adjustedScore -= 0.10;
    }
  }

  if (template.id === "cultural_explorer") {
    if (
      hasSignal(signalMap, "cultural_curiosity") &&
      hasSignal(signalMap, "pattern_analysis")
    ) {
      adjustedScore += 0.08;
    }

    if (
      hasSignal(signalMap, "cultural_curiosity") &&
      hasSignal(signalMap, "system_thinking")
    ) {
      adjustedScore += 0.14;
    }

    if (culturalCueCount >= 3) {
      adjustedScore += 0.14;
    }

    if (!hasSignal(signalMap, "narrative_creation")) {
      adjustedScore += 0.06;
    }

    if (analyticalCueCount >= culturalCueCount + 2) {
      adjustedScore -= 0.14;
    }

    if (
      hasSignal(signalMap, "narrative_creation") &&
      storytellerCueCount >= culturalCueCount
    ) {
      adjustedScore -= 0.24;
    } else if (storytellerCueCount >= 3) {
      adjustedScore -= 0.12;
    }

    if (humanCueCount >= culturalCueCount + 2) {
      adjustedScore -= 0.10;
    }
  }

  if (template.id === "community_builder") {
    if (
      hasSignal(signalMap, "social_coordination") &&
      hasSignal(signalMap, "empathic_listening")
    ) {
      adjustedScore += 0.05;
    }

    if (
      hasSignal(signalMap, "social_coordination") &&
      hasSignal(signalMap, "narrative_creation")
    ) {
      adjustedScore += 0.08;
    }

    if (
      hasSignal(signalMap, "social_coordination") &&
      hasSignal(signalMap, "practical_organizing")
    ) {
      adjustedScore += 0.08;
    }

    if (communityCueCount >= 2) {
      adjustedScore += 0.18;
    }

    if (communityCueCount >= 4) {
      adjustedScore += 0.12;
    }

    if (communityCueCount > humanCueCount + 1) {
      adjustedScore += 0.08;
    }
  }

  const rationale = `Se apoya en señales como ${matchedSignals
    .map((signal) => signal.label)
    .join(", ")}.`;

  return {
    id: template.id,
    label: template.label,
    summary: template.summary,
    supportingSignalKeys: template.supportingSignalKeys,
    rationale,
    confidence: normalizeConfidence(adjustedScore),
    rank: 0,
    rawScore: adjustedScore,
  };
}

function resolveGuideVsConnector(
  ranked: ScoredProfile[],
  humanCueCount: number,
  connectorCueCount: number
): void {
  const guide = ranked.find((profile) => profile.id === "empathic_guide");
  const connector = ranked.find(
    (profile) => profile.id === "diplomatic_social_connector"
  );

  if (!guide || !connector) {
    return;
  }

  if (humanCueCount >= connectorCueCount + 1) {
    guide.rawScore += 0.16;
    connector.rawScore -= 0.08;
    guide.confidence = normalizeConfidence(guide.rawScore);
    connector.confidence = normalizeConfidence(connector.rawScore);
    return;
  }

  if (connectorCueCount >= humanCueCount + 1) {
    connector.rawScore += 0.16;
    guide.rawScore -= 0.08;
    connector.confidence = normalizeConfidence(connector.rawScore);
    guide.confidence = normalizeConfidence(guide.rawScore);
  }
}

function resolveTechnicalVsAnalytical(
  ranked: ScoredProfile[],
  executionCueCount: number,
  analyticalCueCount: number
): void {
  const technical = ranked.find((profile) => profile.id === "technical_builder");
  const analytical = ranked.find(
    (profile) => profile.id === "analytical_strategist"
  );

  if (!technical || !analytical) {
    return;
  }

  if (analyticalCueCount >= executionCueCount + 1) {
    analytical.rawScore += 0.16;
    technical.rawScore -= 0.10;
    analytical.confidence = normalizeConfidence(analytical.rawScore);
    technical.confidence = normalizeConfidence(technical.rawScore);
    return;
  }

  if (executionCueCount >= analyticalCueCount + 1) {
    technical.rawScore += 0.16;
    analytical.rawScore -= 0.10;
    technical.confidence = normalizeConfidence(technical.rawScore);
    analytical.confidence = normalizeConfidence(analytical.rawScore);
  }
}

function resolveAnalyticalVsCultural(
  ranked: ScoredProfile[],
  analyticalCueCount: number,
  culturalCueCount: number
): void {
  const analytical = ranked.find(
    (profile) => profile.id === "analytical_strategist"
  );
  const cultural = ranked.find((profile) => profile.id === "cultural_explorer");

  if (!analytical || !cultural) {
    return;
  }

  if (analyticalCueCount >= culturalCueCount + 2) {
    analytical.rawScore += 0.16;
    cultural.rawScore -= 0.12;
    analytical.confidence = normalizeConfidence(analytical.rawScore);
    cultural.confidence = normalizeConfidence(cultural.rawScore);
    return;
  }

  if (culturalCueCount >= analyticalCueCount + 2) {
    cultural.rawScore += 0.16;
    analytical.rawScore -= 0.12;
    cultural.confidence = normalizeConfidence(cultural.rawScore);
    analytical.confidence = normalizeConfidence(analytical.rawScore);
  }
}

function resolveGuideVsCultural(
  ranked: ScoredProfile[],
  humanCueCount: number,
  culturalCueCount: number
): void {
  const guide = ranked.find((profile) => profile.id === "empathic_guide");
  const cultural = ranked.find((profile) => profile.id === "cultural_explorer");

  if (!guide || !cultural) {
    return;
  }

  if (humanCueCount >= culturalCueCount + 1) {
    guide.rawScore += 0.20;
    cultural.rawScore -= 0.12;
    guide.confidence = normalizeConfidence(guide.rawScore);
    cultural.confidence = normalizeConfidence(cultural.rawScore);
    return;
  }

  if (culturalCueCount >= humanCueCount + 2) {
    cultural.rawScore += 0.10;
    guide.rawScore -= 0.08;
    cultural.confidence = normalizeConfidence(cultural.rawScore);
    guide.confidence = normalizeConfidence(guide.rawScore);
  }
}

function resolveCommunityVsGuide(
  ranked: ScoredProfile[],
  communityCueCount: number,
  humanCueCount: number
): void {
  const community = ranked.find((profile) => profile.id === "community_builder");
  const guide = ranked.find((profile) => profile.id === "empathic_guide");

  if (!community || !guide) {
    return;
  }

  if (communityCueCount >= 3) {
    community.rawScore += 0.24;
    guide.rawScore -= 0.14;
    community.confidence = normalizeConfidence(community.rawScore);
    guide.confidence = normalizeConfidence(guide.rawScore);
    return;
  }

  if (humanCueCount >= communityCueCount + 2) {
    guide.rawScore += 0.10;
    community.rawScore -= 0.08;
    guide.confidence = normalizeConfidence(guide.rawScore);
    community.confidence = normalizeConfidence(community.rawScore);
  }
}

function resolveStorytellerVsCultural(
  ranked: ScoredProfile[],
  storytellerCueCount: number,
  culturalCueCount: number
): void {
  const storyteller = ranked.find(
    (profile) => profile.id === "creative_storyteller"
  );
  const cultural = ranked.find((profile) => profile.id === "cultural_explorer");

  if (!storyteller || !cultural) {
    return;
  }

  if (storytellerCueCount >= culturalCueCount + 1) {
    storyteller.rawScore += 0.22;
    cultural.rawScore -= 0.14;
    storyteller.confidence = normalizeConfidence(storyteller.rawScore);
    cultural.confidence = normalizeConfidence(cultural.rawScore);
    return;
  }

  if (storytellerCueCount >= 3 && culturalCueCount >= 1) {
    storyteller.rawScore += 0.14;
    cultural.rawScore -= 0.10;
    storyteller.confidence = normalizeConfidence(storyteller.rawScore);
    cultural.confidence = normalizeConfidence(cultural.rawScore);
    return;
  }

  if (culturalCueCount >= storytellerCueCount + 2) {
    cultural.rawScore += 0.12;
    storyteller.rawScore -= 0.10;
    cultural.confidence = normalizeConfidence(cultural.rawScore);
    storyteller.confidence = normalizeConfidence(storyteller.rawScore);
  }
}

export function runTDM(signals: DetectedSignal[]): ProbableProfile[] {
  const signalMap = buildSignalWeightMap(signals);
  const evidenceText = getRelevantEvidenceText(signals);

  const humanCueCount = countCueHits(evidenceText, HUMAN_GUIDE_CUES);
  const connectorCueCount = countCueHits(evidenceText, CONNECTOR_CUES);
  const executionCueCount = countCueHits(evidenceText, EXECUTION_CUES);
  const analyticalCueCount = countCueHits(evidenceText, ANALYTICAL_CUES);
  const culturalCueCount = countCueHits(evidenceText, CULTURAL_CUES);
  const communityCueCount = countCueHits(evidenceText, COMMUNITY_CUES);
  const storytellerCueCount = countCueHits(evidenceText, STORYTELLER_CUES);

  const ranked = PROFILE_TEMPLATES.map((template) =>
    scoreTemplate(
      template,
      signals,
      signalMap,
      humanCueCount,
      connectorCueCount,
      executionCueCount,
      analyticalCueCount,
      culturalCueCount,
      communityCueCount,
      storytellerCueCount
    )
  ).filter((profile): profile is ScoredProfile => profile !== null);

  resolveGuideVsConnector(ranked, humanCueCount, connectorCueCount);
  resolveTechnicalVsAnalytical(ranked, executionCueCount, analyticalCueCount);
  resolveAnalyticalVsCultural(ranked, analyticalCueCount, culturalCueCount);
  resolveGuideVsCultural(ranked, humanCueCount, culturalCueCount);
  resolveCommunityVsGuide(ranked, communityCueCount, humanCueCount);
  resolveStorytellerVsCultural(ranked, storytellerCueCount, culturalCueCount);

  return ranked
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 3)
    .map((profile, index) => {
      const { rawScore, ...rest } = profile;
      return {
        ...rest,
        rank: index + 1,
      };
    });
}