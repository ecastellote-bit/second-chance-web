import type { ContextualSituationReview } from "@/lib/engines/contextualSituationJudge";
import { saveContextualBridge, type ContextualReviewSnapshot } from "./contextualBridge";

function toSnapshot(review: ContextualSituationReview): ContextualReviewSnapshot {
  return {
    summary: review.summary,
    situationFrame: review.situationFrame,
    themeHints: review.themeHints,
    activationHints: review.activationHints,
    cautions: review.cautions,
    shouldInfluenceGuidedSelection: review.shouldInfluenceGuidedSelection,
  };
}

/** Llamar al terminar /api/analyze en cliente con el reading completo */
export function persistContextualFromFinalReading(finalReading: unknown): void {
  if (!finalReading || typeof finalReading !== "object") return;
  const r = finalReading as Record<string, unknown>;
  const review = (r.contextualSituationReview ??
    r.contextualSituationJudge ??
    r.contextualReview) as ContextualSituationReview | undefined;
  if (review?.themeHints || review?.activationHints) {
    saveContextualBridge(toSnapshot(review));
  }
}
