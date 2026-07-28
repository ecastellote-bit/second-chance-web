import { NextResponse } from "next/server";
import { computeAndCacheEmbedding } from "@/lib/engines/learningCycleEnricher";
import {
  BROWSER_HUMAN_SOURCE,
  persistHumanCaseDepot,
  type HumanCasePayload,
} from "@/lib/learning/humanCaseDepot";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";
import { syncLinkedProfileFamiliesForArchive } from "@/lib/users/userProfileStore";

function extractInputTextForEmbedding(payload: HumanCasePayload): string {
  const parts: string[] = [];
  const sourceInput = payload.sourceInput as Record<string, unknown> | undefined;
  if (!sourceInput) return "";

  const ctx = sourceInput.fullAnswersContext as Record<string, unknown> | undefined;
  const state = ctx?.state as Record<string, unknown> | undefined;
  const narrative = state?.narrative as Record<string, unknown> | undefined;

  if (narrative && typeof narrative === "object") {
    for (const value of Object.values(narrative)) {
      if (typeof value === "string" && value.trim().length > 0) {
        parts.push(value.trim());
      }
    }
  }

  return parts.join(" ");
}

/** Compat: redirige al depósito humano dual (completo + extracto). */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as HumanCasePayload;

    const normalized: HumanCasePayload = {
      ...payload,
      source: payload.source ?? BROWSER_HUMAN_SOURCE,
      createdAt: payload.createdAt ?? new Date().toISOString(),
      humanReview: payload.humanReview ?? {
        verdict: "pending_human_review",
        expectedPrimaryFamily: "",
        acceptableFamilies: [],
        rivalFamilies: [],
        correctionNote: "",
        shouldBecomeLearnedCase: false,
      },
    };

    const result = await persistHumanCaseDepot(normalized, {
      source: normalized.source,
      alsoWriteLegacy: true,
      legacyObservation: true,
    });

    const inputText = extractInputTextForEmbedding(normalized);
    if (inputText.length >= 20) {
      computeAndCacheEmbedding(`archive_${result.archiveId}`, inputText).catch(() => {});
    }

    if (result.complete.appended) {
      await appendObservatoryEvent(
        buildObservatoryEvent({
          type: "diagnostic.case_archived",
          scenario: "diagnostic",
          payload: {
            archiveId: result.archiveId,
            resultType: result.completeRecord.classification.resultType,
            primaryFamily: result.completeRecord.classification.primaryFamily,
            humanReviewSuggested:
              result.completeRecord.classification.humanReviewSuggested,
            compressionSignalsDetected:
              result.completeRecord.classification.compressionSignalsDetected,
            learningTier: result.completeRecord.classification.learningTier,
            depot: "human_cases_complete",
          },
        }),
      ).catch(() => {});

      await syncLinkedProfileFamiliesForArchive(result.archiveId).catch(() => {});
    }

    if (result.legacy?.learningObservation?.appended) {
      await appendObservatoryEvent(
        buildObservatoryEvent({
          type: "learning.observation_stored",
          scenario: "learning",
          payload: { archiveId: result.archiveId },
        }),
      ).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      archiveId: result.archiveId,
      extractId: result.extractId,
      persisted: result.durable.stored && result.durable.verified,
      durable: result.durable,
      stored: {
        broadArchive: result.legacy?.broadArchive ?? result.complete,
        learningObservation: result.legacy?.learningObservation ?? result.extract,
        humanComplete: result.complete,
        humanExtract: result.extract,
      },
      classification: result.completeRecord.classification,
      storagePolicy: result.completeRecord.storagePolicy,
    });
  } catch (error) {
    console.error("diagnostic-case-archive failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown diagnostic archive error",
      },
      { status: 500 },
    );
  }
}
