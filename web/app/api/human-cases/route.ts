import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

import { computeAndCacheEmbedding } from "@/lib/engines/learningCycleEnricher";
import {
  BROWSER_HUMAN_SOURCE,
  findHumanLearningExtractByArchiveId,
  listHumanCompleteCases,
  persistHumanCaseDepot,
  type HumanCasePayload,
} from "@/lib/learning/humanCaseDepot";
import { getDurableStoreStatus } from "@/lib/learning/humanCaseDurableStore";
import { getCohortBatchFromPayload } from "@/lib/learning/foundationalCohort";
import { isHumanCasePersistedAcknowledged } from "@/lib/learning/humanCasePersistence";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";

function extractInputText(payload: HumanCasePayload): string {
  const parts: string[] = [];
  const sourceInput = payload.sourceInput as Record<string, unknown> | undefined;
  if (!sourceInput) return "";

  const ctx = sourceInput.fullAnswersContext as Record<string, unknown> | undefined;
  const state = ctx?.state as Record<string, unknown> | undefined;
  const narrative = state?.narrative as Record<string, unknown> | undefined;

  if (narrative && typeof narrative === "object") {
    for (const value of Object.values(narrative)) {
      if (typeof value === "string" && value.trim()) parts.push(value.trim());
    }
  }

  const currentContext = state?.currentContext as Record<string, unknown> | undefined;
  if (currentContext?.currentSituation && typeof currentContext.currentSituation === "string") {
    parts.push(currentContext.currentSituation.trim());
  }

  return parts.join(" ");
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const cohortBatch = url.searchParams.get("cohortBatch")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);

    const complete = await listHumanCompleteCases(limit);

    let merged = await Promise.all(
      complete.map(async (item) => ({
        ...item,
        learningExtract: await findHumanLearningExtractByArchiveId(item.archiveId),
      })),
    );

    if (status) {
      merged = merged.filter((item) => item.storagePolicy.reviewStatus === status);
    }

    if (cohortBatch) {
      merged = merged.filter(
        (item) => getCohortBatchFromPayload(item.payload) === cohortBatch,
      );
    }

    return NextResponse.json({
      ok: true,
      total: merged.length,
      cases: merged,
      durable: getDurableStoreStatus(),
      cohortBatch: cohortBatch ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "list_failed",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as HumanCasePayload & {
      clientMeta?: Record<string, unknown>;
      forceArchiveId?: string;
    };

    const payload: HumanCasePayload = {
      archiveVersion: body.archiveVersion,
      createdAt: body.createdAt ?? new Date().toISOString(),
      source: body.source ?? BROWSER_HUMAN_SOURCE,
      sourceInput: body.sourceInput,
      currentResult: body.currentResult,
      humanReview: body.humanReview ?? {
        verdict: "pending_human_review",
        expectedPrimaryFamily: "",
        acceptableFamilies: [],
        rivalFamilies: [],
        correctionNote: "",
        shouldBecomeLearnedCase: false,
      },
      clientMeta: body.clientMeta,
    };

    const result = await persistHumanCaseDepot(payload, {
      source: payload.source,
      forceArchiveId:
        typeof body.forceArchiveId === "string" ? body.forceArchiveId : undefined,
      alsoWriteLegacy: true,
      legacyObservation: true,
    });

    const inputText = extractInputText(payload);
    if (inputText.length >= 20) {
      computeAndCacheEmbedding(`archive_${result.archiveId}`, inputText).catch(() => {});
    }

    const persisted = isHumanCasePersistedAcknowledged(result);

    if (persisted) {
      await appendObservatoryEvent(
        buildObservatoryEvent({
          type: "human_case.persisted",
          scenario: "diagnostic",
          payload: {
            archiveId: result.archiveId,
            storage: result.durable.storage,
            verified: result.durable.verified,
            cohortBatch: getCohortBatchFromPayload(payload),
            reviewStatus: result.completeRecord.storagePolicy.reviewStatus,
          },
        }),
      ).catch(() => {});
    }

    if (result.complete.appended || result.durable.stored) {
      await appendObservatoryEvent(
        buildObservatoryEvent({
          type: "diagnostic.case_archived",
          scenario: "diagnostic",
          payload: {
            archiveId: result.archiveId,
            depot: result.durable.storage,
            durable: persisted,
            verified: result.durable.verified,
            cohortBatch: getCohortBatchFromPayload(payload),
            reviewStatus: result.completeRecord.storagePolicy.reviewStatus,
            primaryFamily: result.completeRecord.classification.primaryFamily,
          },
        }),
      ).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      archiveId: result.archiveId,
      extractId: result.extractId,
      persisted,
      durable: result.durable,
      stored: {
        complete: result.complete,
        extract: result.extract,
        legacy: result.legacy,
      },
      classification: result.completeRecord.classification,
      reviewStatus: result.completeRecord.storagePolicy.reviewStatus,
    });
  } catch (error) {
    console.error("human-cases POST failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "persist_failed",
      },
      { status: 500 },
    );
  }
}
