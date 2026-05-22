import type {
  SemanticAffinitySignal,
  SemanticExtractionResult,
  SemanticNarrativeFlags,
} from "../types/semantic";
import type { HumanAffinityId } from "../types/humanAffinity";
import {
  AFFINITY_GUARD_RULES,
  buildArchetypeContextFromText,
} from "./semanticLayerRules";

export type SemanticCalibrationMeta = {
  applied: boolean;
  suppressedAffinityIds: string[];
  adjustedFlags: string[];
  notes: string[];
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function applyFlagCorrections(
  flags: SemanticNarrativeFlags,
  ctx: ReturnType<typeof buildArchetypeContextFromText>,
): { flags: SemanticNarrativeFlags; adjusted: string[] } {
  const adjusted: string[] = [];
  const next = { ...flags };

  if (!ctx.hasAudience && next.publicAudienceDesire) {
    next.publicAudienceDesire = false;
    adjusted.push("publicAudienceDesire→false (sin audiencia explícita)");
  }

  if (ctx.oneToOne && !ctx.hasCollective && next.collectiveOrientation) {
    next.collectiveOrientation = false;
    adjusted.push("collectiveOrientation→false (acompañamiento 1:1)");
  }

  if (ctx.sostenWithoutCraft && next.practicalExecution) {
    next.practicalExecution = false;
    adjusted.push("practicalExecution→false (sostén laboral sin oficio técnico)");
  }

  if (ctx.text.includes("comprimid") || ctx.text.includes("tapad")) {
    next.compressionDetected = true;
  }

  return { flags: next, adjusted };
}

function guardAffinitySignal(
  signal: SemanticAffinitySignal,
  flags: SemanticNarrativeFlags,
  ctx: ReturnType<typeof buildArchetypeContextFromText>,
): { signal: SemanticAffinitySignal; suppressed: boolean; note?: string } {
  const rule = AFFINITY_GUARD_RULES.find((r) => r.id === signal.id);
  if (!rule) return { signal, suppressed: false };

  let strength = signal.strength;

  if (rule.requiresFlag && !flags[rule.requiresFlag]) {
    const cap = rule.maxStrengthWithoutGuard ?? 0.35;
    if (strength > cap) {
      return {
        signal: { ...signal, strength: cap },
        suppressed: false,
        note: `${signal.id} capped (${rule.requiresFlag} false)`,
      };
    }
  }

  if (rule.suppressWhen?.(ctx)) {
    const cap = rule.maxStrengthWithoutGuard ?? 0.3;
    if (strength > cap) {
      return {
        signal: { ...signal, strength: cap },
        suppressed: false,
        note: `${signal.id} capped (arquetipo sostén)`,
      };
    }
  }

  return { signal: { ...signal, strength: clamp01(strength) }, suppressed: false };
}

/**
 * Valida y atenúa la salida del LLM semántico antes de mezclar con afinidades/familias.
 * No re-ejecuta el modelo.
 */
export function calibrateSemanticExtraction(
  result: SemanticExtractionResult,
  intakeText: string,
): SemanticExtractionResult & { calibration?: SemanticCalibrationMeta } {
  if (!result.ok || result.affinitySignals.length === 0) {
    return result;
  }

  const ctx = buildArchetypeContextFromText(intakeText);
  const { flags, adjusted } = applyFlagCorrections(result.narrativeFlags, ctx);

  const suppressedAffinityIds: string[] = [];
  const notes: string[] = [];
  const calibratedSignals: SemanticAffinitySignal[] = [];

  for (const raw of result.affinitySignals) {
    const { signal, note } = guardAffinitySignal(raw, flags, ctx);
    if (signal.strength < 0.12) {
      suppressedAffinityIds.push(signal.id);
      continue;
    }
    if (note) notes.push(note);
    calibratedSignals.push(signal);
  }

  const sorted = calibratedSignals
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8);

  const extractionConfidence =
    adjusted.length > 0
      ? clamp01(result.extractionConfidence * 0.92)
      : result.extractionConfidence;

  return {
    ...result,
    affinitySignals: sorted,
    narrativeFlags: flags,
    extractionConfidence,
    calibration: {
      applied: true,
      suppressedAffinityIds,
      adjustedFlags: adjusted,
      notes: [
        "Capa semántica calibrada en TS (Carta Magna: LLM recomienda, TS valida).",
        ...adjusted,
        ...notes,
      ].filter(Boolean),
    },
  };
}
