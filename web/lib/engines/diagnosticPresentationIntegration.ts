/**
 * Capa de presentación (Opción C): corre después del juez narrativo en analyze/lab.
 * No modifica scores, resultType ni adjudicación — solo el entregable humano.
 */
import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";
import { buildEvidenceFragmentsFromIntake } from "./evidenceBuilder";
import { applyPersonalizedPresentationToReading } from "./diagnosticPresentationComposer";

export type GuidedThemeTeaserInput = {
  shortLabel: string;
};

export function applyDiagnosticPresentationLayer(params: {
  reading: FinalReading;
  guidedThemes?: GuidedThemeTeaserInput[];
  intake?: UserIntake;
}): FinalReading {
  const evidenceFromIntake = params.intake
    ? buildEvidenceFragmentsFromIntake(params.intake)
    : [];
  const mergedEvidence =
    evidenceFromIntake.length > 0
      ? evidenceFromIntake
      : Array.isArray(params.reading.evidence)
        ? params.reading.evidence
        : [];

  const readingWithEvidence =
    mergedEvidence.length > 0
      ? { ...params.reading, evidence: mergedEvidence }
      : params.reading;

  return applyPersonalizedPresentationToReading({
    reading: readingWithEvidence,
    guidedThemes: params.guidedThemes,
    intake: params.intake,
  });
}
