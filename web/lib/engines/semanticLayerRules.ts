/**
 * Reglas universales — Capa Semántica (extracción + similitud).
 * Anti-cebado: arquetipos compartidos; sin ajuste a un solo caso.
 */
import { buildUniversalArchetypeSignals } from "./discardRivalRules";
import {
  buildContextualIntakeText,
  hasExplicitAudienceLanguage,
  hasExplicitCollectiveLanguage,
} from "./contextualPanelRules";
import type { UserIntake } from "../types/intake";
import type { HumanAffinityId } from "../types/humanAffinity";

/** Umbral para que un match embedding influya fuerte en learningSignal. */
export const SEMANTIC_SIMILARITY_INFLUENTIAL = 0.52;
/** Umbral mínimo para conservar match como nota (peso bajo). */
export const SEMANTIC_SIMILARITY_NOTE_MIN = 0.4;
/** Default API search (más estricto que 0.45 legacy). */
export const SEMANTIC_SIMILARITY_SEARCH_MIN = 0.48;

export type SemanticInfluenceTier = "influential" | "note" | "excluded";

export function classifySemanticSimilarity(score: number): SemanticInfluenceTier {
  if (score >= SEMANTIC_SIMILARITY_INFLUENTIAL) return "influential";
  if (score >= SEMANTIC_SIMILARITY_NOTE_MIN) return "note";
  return "excluded";
}

export function semanticInfluenceWeight(score: number): number {
  const tier = classifySemanticSimilarity(score);
  if (tier === "influential") return 1;
  if (tier === "note") return 0.35;
  return 0;
}

/** Afinidades que suben fácil por palabras genéricas — requieren flags de respaldo. */
export const AFFINITY_GUARD_RULES: {
  id: HumanAffinityId;
  requiresFlag?: keyof import("../types/semantic").SemanticNarrativeFlags;
  suppressWhen?: (ctx: ArchetypeContext) => boolean;
  maxStrengthWithoutGuard?: number;
}[] = [
  {
    id: "public_expression",
    requiresFlag: "publicAudienceDesire",
    maxStrengthWithoutGuard: 0.35,
  },
  {
    id: "audience_activation",
    requiresFlag: "publicAudienceDesire",
    maxStrengthWithoutGuard: 0.32,
  },
  {
    id: "editorial_framing",
    requiresFlag: "publicAudienceDesire",
    maxStrengthWithoutGuard: 0.38,
  },
  {
    id: "social_coordination",
    requiresFlag: "collectiveOrientation",
    maxStrengthWithoutGuard: 0.34,
  },
  {
    id: "group_reading",
    requiresFlag: "collectiveOrientation",
    maxStrengthWithoutGuard: 0.34,
  },
  {
    id: "practical_execution",
    suppressWhen: (ctx) => ctx.sostenWithoutCraft,
    maxStrengthWithoutGuard: 0.3,
  },
  {
    id: "technical_assembly",
    suppressWhen: (ctx) => ctx.sostenWithoutCraft,
    maxStrengthWithoutGuard: 0.28,
  },
  {
    id: "operational_rhythm",
    suppressWhen: (ctx) => ctx.sostenWithoutCraft,
    maxStrengthWithoutGuard: 0.3,
  },
];

export type ArchetypeContext = {
  text: string;
  sostenWithoutCraft: boolean;
  hasAudience: boolean;
  hasCollective: boolean;
  oneToOne: boolean;
};

export function buildArchetypeContextFromText(text: string): ArchetypeContext {
  const signals = buildUniversalArchetypeSignals(text);
  return {
    text,
    sostenWithoutCraft:
      signals.sostenEconomico.length >= 2 &&
      signals.craftFormaAdulta.length < 1,
    hasAudience: hasExplicitAudienceLanguage(text),
    hasCollective: hasExplicitCollectiveLanguage(text),
    oneToOne:
      text.includes("uno a uno") ||
      text.includes("una por una") ||
      text.includes("escucha profunda"),
  };
}

export function buildArchetypeContextFromIntake(intake: UserIntake): ArchetypeContext {
  return buildArchetypeContextFromText(buildContextualIntakeText(intake));
}

export function intakeTextForSemanticCalibration(
  intake?: UserIntake,
  fallbackText?: string,
): string {
  if (intake) return buildContextualIntakeText(intake);
  return fallbackText ?? "";
}
