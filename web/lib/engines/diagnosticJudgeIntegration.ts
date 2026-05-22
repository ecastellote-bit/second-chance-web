/**
 * Integración unificada de jueces en el embudo diagnóstico.
 * Producción (/api/analyze) y lab comparten la misma capa post-pipeline.
 */
import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";
import type { ProfileFamilyScore } from "../types/profileFamilies";
import type { NarrativeCoherenceReview } from "../types/narrativeCoherence";
import {
  attachNarrativeCoherenceReview,
  runNarrativeCoherenceJudge,
} from "./narrativeCoherenceJudge";
import {
  applyNarrativeCoherenceLevers,
  getMotorTopFamilyId,
} from "./narrativeCoherenceAdjudication";
import { isDiscardJudgeProductionEnabled } from "./discardJudgeAdjudication";

export type DiagnosticJudgesStatus = {
  discardJudge: {
    enabled: boolean;
    mode: "production_exclusion" | "audit_only_shadow_preview";
  };
  narrativeCoherenceJudge: {
    enabled: boolean;
    leversEnabled: boolean;
  };
  panelDiagnostic: { enabled: boolean };
  contextualSituationJudge: { enabled: boolean };
  semanticLayer: { enabled: boolean };
};

/** Juez narrativo activo por defecto; desactivar con NARRATIVE_COHERENCE_JUDGE_ENABLED=false */
export function isNarrativeCoherenceJudgeEnabled(): boolean {
  return process.env.NARRATIVE_COHERENCE_JUDGE_ENABLED !== "false";
}

/** Palancas Fase 2 activas por defecto si el juez narrativo está activo. */
export function isNarrativeCoherenceLeversEnabled(): boolean {
  if (!isNarrativeCoherenceJudgeEnabled()) return false;
  return process.env.NARRATIVE_COHERENCE_LEVERS_ENABLED !== "false";
}

export function getDiagnosticJudgesStatus(): DiagnosticJudgesStatus {
  const discardProduction = isDiscardJudgeProductionEnabled();

  return {
    discardJudge: {
      enabled: true,
      mode: discardProduction
        ? "production_exclusion"
        : "audit_only_shadow_preview",
    },
    narrativeCoherenceJudge: {
      enabled: isNarrativeCoherenceJudgeEnabled(),
      leversEnabled: isNarrativeCoherenceLeversEnabled(),
    },
    panelDiagnostic: { enabled: true },
    contextualSituationJudge: { enabled: true },
    semanticLayer: { enabled: true },
  };
}

export type NarrativeIntegrationResult = {
  reading: FinalReading;
  meta: {
    status: "ok" | "skipped" | "error" | "disabled";
    latencyMs?: number;
    review: NarrativeCoherenceReview | null;
    error?: string;
    leversApplied: boolean;
  };
};

/**
 * Capa final del embudo: auditoría narrativa + palancas de sentencia (sin tocar familyScores).
 * Corre después de analysisPipeline (descarte → motores → panel → contextual → adjudicación).
 */
export async function applyNarrativeJudgeToDiagnosticReading(params: {
  intake: UserIntake;
  reading: FinalReading;
  familyScores?: ProfileFamilyScore[];
  /** Lab puede forzar palancas aunque env diga otra cosa. */
  forceLevers?: boolean;
}): Promise<NarrativeIntegrationResult> {
  if (!isNarrativeCoherenceJudgeEnabled()) {
    return {
      reading: params.reading,
      meta: {
        status: "disabled",
        review: null,
        leversApplied: false,
      },
    };
  }

  const narrativeCoherence = await runNarrativeCoherenceJudge({
    intake: params.intake,
    reading: params.reading,
    familyScores: params.familyScores,
  });

  if (!narrativeCoherence.review) {
    return {
      reading: params.reading,
      meta: {
        status: narrativeCoherence.skipped
          ? "skipped"
          : narrativeCoherence.ok
            ? "ok"
            : "error",
        latencyMs: narrativeCoherence.latencyMs,
        review: null,
        error: narrativeCoherence.error,
        leversApplied: false,
      },
    };
  }

  let reading = params.reading;
  const applyLevers =
    params.forceLevers === true || isNarrativeCoherenceLeversEnabled();

  if (applyLevers) {
    const motorTopFamilyId = getMotorTopFamilyId(params.familyScores);
    reading = applyNarrativeCoherenceLevers(
      reading,
      narrativeCoherence.review,
      {
        motorTopFamilyId,
        familyScores: params.familyScores,
      },
    );
  }

  const withReview = attachNarrativeCoherenceReview(
    reading,
    narrativeCoherence.review,
  );

  const trace =
    withReview.trace &&
    typeof withReview.trace === "object" &&
    !Array.isArray(withReview.trace)
      ? (withReview.trace as Record<string, unknown>)
      : {};

  const leversApplied =
    applyLevers &&
    (trace.narrativeAdjudication as { applied?: boolean } | undefined)
      ?.applied === true;

  return {
    reading: withReview,
    meta: {
      status: "ok",
      latencyMs: narrativeCoherence.latencyMs,
      review: narrativeCoherence.review,
      leversApplied,
    },
  };
}
