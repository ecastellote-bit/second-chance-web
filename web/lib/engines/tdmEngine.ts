import type { ProbableProfile } from "../types/profiles";
import type { DetectedSignal } from "../types/signals";
import { normalizeConfidence } from "../utils/scoring";

type ProfileTemplate = {
  id: string;
  label: string;
  summary: string;
  supportingSignalKeys: string[];
};

const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    id: "diplomatic_social_connector",
    label: "Diplomatic Social Connector",
    summary: "Tiende a articular personas, sostener vínculos y mediar entre intereses.",
    supportingSignalKeys: ["social_coordination", "empathic_listening", "practical_organizing"],
  },
  {
    id: "community_builder",
    label: "Community Builder",
    summary: "Tiende a construir espacios de pertenencia, circulación e interacción humana.",
    supportingSignalKeys: ["social_coordination", "empathic_listening", "narrative_creation"],
  },
  {
    id: "analytical_strategist",
    label: "Analytical Strategist",
    summary: "Tiende a detectar patrones, ordenar complejidad y pensar movimientos con lógica.",
    supportingSignalKeys: ["pattern_analysis", "system_thinking", "opportunity_detection"],
  },
  {
    id: "creative_storyteller",
    label: "Creative Storyteller",
    summary: "Tiende a expresar sentido, construir relato y transformar experiencia en lenguaje.",
    supportingSignalKeys: ["narrative_creation", "cultural_curiosity"],
  },
  {
    id: "technical_builder",
    label: "Technical Builder",
    summary: "Tiende a estructurar, ejecutar y mejorar procesos o sistemas concretos.",
    supportingSignalKeys: ["system_thinking", "practical_organizing", "pattern_analysis"],
  },
  {
    id: "cultural_explorer",
    label: "Cultural Explorer",
    summary: "Tiende a orientarse por ideas, contextos, cultura y aprendizaje persistente.",
    supportingSignalKeys: ["cultural_curiosity", "narrative_creation"],
  },
  {
    id: "empathic_guide",
    label: "Empathic Guide",
    summary: "Tiende a leer tensiones humanas y ayudar a otros a ordenar situaciones complejas.",
    supportingSignalKeys: ["empathic_listening", "social_coordination"],
  },
];

export function runTDM(signals: DetectedSignal[]): ProbableProfile[] {
    const ranked = PROFILE_TEMPLATES.map((template) => {
      const matchedSignals = signals.filter((signal) =>
        template.supportingSignalKeys.includes(signal.key)
      );
  
      const uniqueMatchedKeys = Array.from(
        new Set(matchedSignals.map((signal) => signal.key))
      );
  
      const keyCoverage =
        uniqueMatchedKeys.length / Math.max(template.supportingSignalKeys.length, 1);
  
      const rawConfidence =
        matchedSignals.reduce((acc, signal) => acc + signal.weight, 0) /
        Math.max(template.supportingSignalKeys.length, 1);
  
      const hasEnoughEvidence =
        uniqueMatchedKeys.length >= 2 && keyCoverage >= 0.5;
  
      if (!hasEnoughEvidence) {
        return null;
      }
  
      return {
        id: template.id,
        label: template.label,
        summary: template.summary,
        supportingSignalKeys: template.supportingSignalKeys,
        rationale: `Se apoya en señales como ${matchedSignals
          .map((signal) => signal.label)
          .join(", ")}.`,
        confidence: normalizeConfidence(rawConfidence),
        rank: 0,
      };
    })
      .filter((profile): profile is ProbableProfile => profile !== null)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map((profile, index) => ({
        ...profile,
        rank: index + 1,
      }));
  
    return ranked;
  }