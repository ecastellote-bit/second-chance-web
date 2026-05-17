import { NextResponse } from "next/server";
import { mkdir, readFile, appendFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { computeAndCacheEmbedding } from "@/lib/engines/learningCycleEnricher";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";

type ArchivePayload = {
  archiveVersion?: string;
  createdAt?: string;
  source?: string;
  sourceInput?: unknown;
  currentResult?: Record<string, unknown>;
  humanReview?: Record<string, unknown>;
};

type ArchiveRecord = {
  archiveId: string;
  archiveVersion: string;
  createdAt: string;
  source: string;

  storagePolicy: {
    shouldStoreInBroadArchive: true;
    shouldStoreAsLearningObservation: boolean;
    shouldStoreAsValidatedLearningCase: boolean;
    shouldInfluenceFutureDiagnosis: boolean;
    influenceWeight: number;
    searchWeight: number;
    reviewStatus:
      | "raw"
      | "partial_observation"
      | "reviewed"
      | "validated"
      | "rejected_for_influence";
  };

  classification: {
    resultType: string | null;
    primaryFamily: string | null;
    displayedMainDirection: string | null;
    frontierFamilies: string[];
    conflictDetected: boolean;
    humanReviewSuggested: boolean;
    compressionSignalsDetected: boolean;
    learningTier: string | null;
  };

  payload: ArchivePayload;
};

function extractInputTextForEmbedding(payload: ArchivePayload): string {
  const parts: string[] = [];
  const sourceInput = payload.sourceInput as any;

  if (!sourceInput) return "";

  const narrative =
    sourceInput?.rawInput?.narrative ??
    sourceInput?.intake?.narrative ??
    sourceInput?.narrative;

  if (narrative && typeof narrative === "object") {
    for (const value of Object.values(narrative)) {
      if (typeof value === "string" && value.trim().length > 0) {
        parts.push(value.trim());
      }
    }
  }

  return parts.join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : null;
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => cleanString(item))
        .filter((item): item is string => Boolean(item)),
    ),
  );
}

function getResult(payload: ArchivePayload): Record<string, unknown> {
  return isRecord(payload.currentResult) ? payload.currentResult : {};
}

function getDiagnosticCaseStatistics(
  result: Record<string, unknown>,
): Record<string, unknown> | null {
  const candidates = [
    result.diagnosticCaseStatistics,
    result.caseStatistics,
    result.statisticalTrace,
  ];

  return candidates.find(isRecord) ?? null;
}

function getExperienceDistillation(
  result: Record<string, unknown>,
): Record<string, unknown> | null {
  const candidate = result.experienceDistillation;
  return isRecord(candidate) ? candidate : null;
}

function getLearningTrace(
  experienceDistillation: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!experienceDistillation) return null;

  if (isRecord(experienceDistillation.learningTrace)) {
    return experienceDistillation.learningTrace;
  }

  return experienceDistillation;
}

function getBoolean(value: unknown): boolean {
  return value === true;
}

function getNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function buildHash(input: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex")
    .slice(0, 20);
}

function buildArchiveRecord(payload: ArchivePayload): ArchiveRecord {
  const result = getResult(payload);
  const stats = getDiagnosticCaseStatistics(result);
  const experienceDistillation = getExperienceDistillation(result);
  const learningTrace = getLearningTrace(experienceDistillation);

  const resultType =
    cleanString(result.resultType) ?? cleanString(stats?.resultType);

  const primaryFamily =
    cleanString(stats?.primaryFamily) ??
    cleanString(stats?.dominantFamily) ??
    cleanString(stats?.suggestedPrimaryFamily) ??
    cleanString(result.corePattern);

  const displayedMainDirection =
    cleanString(result.displayedMainDirection) ??
    cleanString(result.corePattern);

  const frontierFamilies = cleanStringArray(stats?.frontierFamilies);

  const conflictDetected =
    getBoolean(stats?.conflictDetected) ||
    getBoolean(result.isConflictReading);

  const humanReviewSuggested =
    getBoolean(stats?.humanReviewSuggested) ||
    getBoolean(stats?.diagnosticJudgeRequestedHumanReview);

  const compressionSignalsDetected =
    getBoolean(stats?.compressionSignalsDetected) ||
    getBoolean(stats?.compressionDetected);

  const learningTier =
    cleanString(stats?.learningTier) ??
    cleanString(learningTrace?.learningTier) ??
    cleanString(experienceDistillation?.recommendedLearningUse);

  const shouldStoreLearningTrace =
    getBoolean(stats?.shouldStoreLearningTrace) ||
    getBoolean(learningTrace?.shouldStoreTrace) ||
    getBoolean(experienceDistillation?.shouldStoreTrace);

  const shouldCreateObservation =
    getBoolean(experienceDistillation?.shouldCreateObservation) ||
    learningTier === "partial_observation" ||
    learningTier === "frontier_support" ||
    learningTier === "calibration_only" ||
    shouldStoreLearningTrace;

  const humanApproved = payload.humanReview?.verdict === "approved";

  const shouldInfluenceFutureDiagnosis =
    humanApproved ||
    getBoolean(stats?.shouldInfluenceFutureCases) ||
    getBoolean(learningTrace?.shouldInfluenceFutureCases) ||
    getBoolean(experienceDistillation?.shouldInfluenceFutureCases);

  const influenceWeight = humanApproved
    ? 0.7
    : shouldInfluenceFutureDiagnosis
      ? Math.min(
          0.35,
          Math.max(
            getNumber(stats?.influenceStrength),
            getNumber(learningTrace?.influenceStrength),
            0.12,
          ),
        )
      : 0;

  const searchWeight = humanApproved
    ? 0.95
    : shouldCreateObservation
      ? 0.75
      : 0.55;

  const reviewStatus = humanApproved
    ? "validated"
    : shouldCreateObservation
      ? "partial_observation"
      : "raw";

  return {
    archiveId: buildHash({
      sourceInput: payload.sourceInput,
      resultType,
      primaryFamily,
      displayedMainDirection,
      createdAt: payload.createdAt,
    }),
    archiveVersion: payload.archiveVersion ?? "diagnostic_case_archive_v0.1",
    createdAt: payload.createdAt ?? new Date().toISOString(),
    source: payload.source ?? "full_result_auto_archive",

    storagePolicy: {
      shouldStoreInBroadArchive: true,
      shouldStoreAsLearningObservation: shouldCreateObservation,
      shouldStoreAsValidatedLearningCase: humanApproved,
      shouldInfluenceFutureDiagnosis,
      influenceWeight,
      searchWeight,
      reviewStatus,
    },

    classification: {
      resultType,
      primaryFamily,
      displayedMainDirection,
      frontierFamilies,
      conflictDetected,
      humanReviewSuggested,
      compressionSignalsDetected,
      learningTier,
    },

    payload,
  };
}

async function appendJsonlIfNew(filePath: string, record: ArchiveRecord) {
  try {
    const existing = await readFile(filePath, "utf8");

    if (existing.includes(`"archiveId":"${record.archiveId}"`)) {
      return { appended: false, reason: "duplicate" };
    }
  } catch {
    // File does not exist yet.
  }

  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  return { appended: true };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ArchivePayload;

    const record = buildArchiveRecord(payload);

    const learningDir = path.join(
      process.cwd(),
      "data",
      "learning",
    );

    await mkdir(learningDir, { recursive: true });

    const broadArchivePath = path.join(
      learningDir,
      "diagnostic-case-archive.jsonl",
    );

    const observationsPath = path.join(
      learningDir,
      "learning-observations.jsonl",
    );

    const validatedPath = path.join(
      learningDir,
      "validated-learning-cases.jsonl",
    );

    const broadArchiveResult = await appendJsonlIfNew(
      broadArchivePath,
      record,
    );

    let observationResult: { appended?: boolean; reason?: string } | null = null;
    let validatedResult: { appended?: boolean; reason?: string } | null = null;

    if (record.storagePolicy.shouldStoreAsLearningObservation) {
      observationResult = await appendJsonlIfNew(observationsPath, record);
    }

    if (record.storagePolicy.shouldStoreAsValidatedLearningCase) {
      validatedResult = await appendJsonlIfNew(validatedPath, record);
    }

    const inputText = extractInputTextForEmbedding(payload);
    if (inputText.length >= 20) {
      computeAndCacheEmbedding(`archive_${record.archiveId}`, inputText).catch(() => {});
    }

    if (broadArchiveResult.appended) {
      await appendObservatoryEvent(
        buildObservatoryEvent({
          type: "diagnostic.case_archived",
          scenario: "diagnostic",
          payload: {
            archiveId: record.archiveId,
            resultType: record.classification.resultType,
            primaryFamily: record.classification.primaryFamily,
            humanReviewSuggested: record.classification.humanReviewSuggested,
            compressionSignalsDetected: record.classification.compressionSignalsDetected,
            learningTier: record.classification.learningTier,
          },
        }),
      ).catch(() => {});
    }

    if (observationResult?.appended) {
      await appendObservatoryEvent(
        buildObservatoryEvent({
          type: "learning.observation_stored",
          scenario: "learning",
          payload: { archiveId: record.archiveId },
        }),
      ).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      archiveId: record.archiveId,
      stored: {
        broadArchive: broadArchiveResult,
        learningObservation: observationResult,
        validatedLearningCase: validatedResult,
      },
      classification: record.classification,
      storagePolicy: record.storagePolicy,
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