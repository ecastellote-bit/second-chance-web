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
    supportingSignalKeys: ["narrative_creation", "cultural_curiosity"],
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
    supportingSignalKeys: ["cultural_curiosity", "pattern_analysis"],
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
  "entender",
  "ayudar",
  "conflicto",
  "conflictos",
  "tension",
  "tensión",
  "tensiones",
  "persona",
  "personas",
  "contener",
  "contencion",
  "contención",
  "situacion",
  "situaciones",
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
  "mediar",
  "mediando",
  "equipo",
  "equipos",
  "grupo",
  "grupos",
  "alianza",
  "alianzas",
  "actores",
  "red",
  "redes",
  "institucional",
  "stakeholder",
  "stakeholders",
  "partnership",
  "partnerships",
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
  connectorCueCount: number
): boolean {
  if (template.id === "diplomatic_social_connector") {
    return hasSignal(signalMap, "social_coordination") && connectorCueCount >= 2;
  }

  if (template.id === "community_builder") {
    return hasSignal(signalMap, "social_coordination");
  }

  if (template.id === "empathic_guide") {
    return hasSignal(signalMap, "empathic_listening") && humanCueCount >= 2;
  }

  return true;
}

function scoreTemplate(
  template: ProfileTemplate,
  signals: DetectedSignal[],
  signalMap: Record<string, number>,
  humanCueCount: number,
  connectorCueCount: number
): ScoredProfile | null {
  if (!passesHardGate(template, signalMap, humanCueCount, connectorCueCount)) {
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

    if (connectorCueCount === 0 && humanCueCount >= 3) {
      adjustedScore += 0.08;
    }
  }

  if (template.id === "diplomatic_social_connector") {
    if (connectorCueCount >= 2) {
      adjustedScore += 0.12;
    }

    if (
      hasSignal(signalMap, "social_coordination") &&
      hasSignal(signalMap, "practical_organizing")
    ) {
      adjustedScore += 0.06;
    }

    if (
      hasSignal(signalMap, "social_coordination") &&
      hasSignal(signalMap, "system_thinking")
    ) {
      adjustedScore += 0.06;
    }

    if (humanCueCount >= 3 && connectorCueCount < 2) {
      adjustedScore -= 0.18;
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

    if (
      hasSignal(signalMap, "pattern_analysis") &&
      hasSignal(signalMap, "system_thinking")
    ) {
      adjustedScore += 0.04;
    }
  }

  if (template.id === "analytical_strategist") {
    if (
      hasSignal(signalMap, "pattern_analysis") &&
      hasSignal(signalMap, "system_thinking")
    ) {
      adjustedScore += 0.08;
    }

    if (
      hasSignal(signalMap, "pattern_analysis") &&
      hasSignal(signalMap, "opportunity_detection")
    ) {
      adjustedScore += 0.04;
    }
  }

  if (template.id === "creative_storyteller") {
    if (
      hasSignal(signalMap, "narrative_creation") &&
      hasSignal(signalMap, "cultural_curiosity")
    ) {
      adjustedScore += 0.05;
    }
  }

  if (template.id === "cultural_explorer") {
    if (
      hasSignal(signalMap, "cultural_curiosity") &&
      hasSignal(signalMap, "pattern_analysis")
    ) {
      adjustedScore += 0.06;
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
      adjustedScore += 0.04;
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

export function runTDM(signals: DetectedSignal[]): ProbableProfile[] {
  const signalMap = buildSignalWeightMap(signals);
  const evidenceText = getRelevantEvidenceText(signals);

  const humanCueCount = countCueHits(evidenceText, HUMAN_GUIDE_CUES);
  const connectorCueCount = countCueHits(evidenceText, CONNECTOR_CUES);

  const ranked = PROFILE_TEMPLATES.map((template) =>
    scoreTemplate(
      template,
      signals,
      signalMap,
      humanCueCount,
      connectorCueCount
    )
  ).filter((profile): profile is ScoredProfile => profile !== null);

  resolveGuideVsConnector(ranked, humanCueCount, connectorCueCount);

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