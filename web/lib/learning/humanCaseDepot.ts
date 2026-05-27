import { mkdir, readFile, appendFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  getDurableStoreStatus,
  getHumanCaseBundle,
  listHumanCaseBundles,
  putHumanCaseBundle,
} from "./humanCaseDurableStore";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";

export const HUMAN_CASE_ARCHIVE_VERSION = "human_case_depot_v1";
export const BROWSER_HUMAN_SOURCE = "browser_human_case_v1";
export const MANUAL_IMPORT_SOURCE = "manual_human_import_v1";

export type HumanReviewStatus =
  | "pending_human_review"
  | "in_discussion"
  | "approved"
  | "rejected"
  | "needs_rerun";

export type HumanCasePayload = {
  archiveVersion?: string;
  createdAt?: string;
  source?: string;
  sourceInput?: unknown;
  currentResult?: Record<string, unknown>;
  humanReview?: Record<string, unknown>;
  clientMeta?: {
    userAgent?: string;
    sessionId?: string;
    origin?: string;
    syncedFromBrowser?: boolean;
    cohortBatch?: string;
    flow?: string;
    [key: string]: unknown;
  };
};

export type HumanCompleteCaseRecord = {
  recordType: "human_complete_case";
  archiveId: string;
  archiveVersion: string;
  createdAt: string;
  source: string;
  storagePolicy: {
    depot: "human_cases_complete";
    shouldStoreComplete: true;
    shouldStoreLearningExtract: true;
    shouldInfluenceFutureDiagnosis: boolean;
    influenceWeight: number;
    searchWeight: number;
    reviewStatus: HumanReviewStatus;
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
  payload: HumanCasePayload;
};

export type HumanLearningExtractRecord = {
  recordType: "human_learning_extract";
  extractId: string;
  archiveId: string;
  createdAt: string;
  source: string;
  reviewStatus: HumanReviewStatus;
  displayedMainDirection: string | null;
  resultType: string | null;
  primaryFamily: string | null;
  frontierFamilies: string[];
  strongestHistoricalFamily: string | null;
  contextualSummary: string | null;
  contextualVerdict: string | null;
  themeHints: unknown[];
  activationHints: unknown[];
  extractedLessons: unknown[];
  misreadWarnings: string[];
  diagnosticJudgeVerdict: string | null;
  similarCaseIds: string[];
  tags: string[];
  humanVerdict: {
    expectedPrimaryFamily: string;
    acceptableFamilies: string[];
    rivalFamilies: string[];
    verdict: string;
    correctionNote: string;
    shouldBecomeLearnedCase: boolean;
  };
  lessonDraft: string | null;
  links: {
    completeCaseArchiveId: string;
  };
};

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

function getResult(payload: HumanCasePayload): Record<string, unknown> {
  return isRecord(payload.currentResult) ? payload.currentResult : {};
}

function getStats(result: Record<string, unknown>): Record<string, unknown> | null {
  const candidates = [
    result.diagnosticCaseStatistics,
    result.caseStatistics,
    result.statisticalTrace,
  ];
  return candidates.find(isRecord) ?? null;
}

function getDistillation(result: Record<string, unknown>): Record<string, unknown> | null {
  const candidate = result.experienceDistillation;
  return isRecord(candidate) ? candidate : null;
}

/** Señales de que el caso archivado alimenta jueces y aprendizaje. */
export function buildHumanCaseLearningReadiness(
  payload: HumanCasePayload,
  hasLearningExtract: boolean,
) {
  const result = getResult(payload);
  const distillation = getDistillation(result);
  const learningTrace = isRecord(distillation?.learningTrace)
    ? distillation.learningTrace
    : distillation;
  const source = isRecord(payload.sourceInput) ? payload.sourceInput : null;
  const guidedThemes = result._guidedThemes;

  return {
    hasSourceInput: Boolean(source),
    hasNarrativeIntake: Boolean(
      isRecord(source?.narrative) || isRecord(source?.fullAnswersContext),
    ),
    hasCurrentResult: Boolean(payload.currentResult),
    hasNarrativeCoherenceReview: Boolean(result.narrativeCoherenceReview),
    hasPersonalizedPresentation: Boolean(result.personalizedPresentation),
    hasExperienceDistillation: Boolean(distillation),
    hasLearningTrace: Boolean(learningTrace),
    hasGuidedThemes: Array.isArray(guidedThemes) && guidedThemes.length > 0,
    hasLearningExtract,
    readyForHumanCalibration: Boolean(
      payload.currentResult && (payload.sourceInput || distillation),
    ),
  };
}

function getContextualReview(
  result: Record<string, unknown>,
): Record<string, unknown> | null {
  const candidates = [
    result.contextualSituationReview,
    result.contextualSituationJudge,
    result.contextualReview,
  ];
  return candidates.find(isRecord) ?? null;
}

export function resolveHumanReviewStatus(
  humanReview: Record<string, unknown> | undefined,
): HumanReviewStatus {
  const verdict = cleanString(humanReview?.verdict);
  if (verdict === "approved") return "approved";
  if (verdict === "rejected") return "rejected";
  if (verdict === "in_discussion") return "in_discussion";
  if (verdict === "needs_rerun") return "needs_rerun";
  return "pending_human_review";
}

export function buildHumanCompleteCaseRecord(
  payload: HumanCasePayload,
  options?: { source?: string; forceArchiveId?: string },
): HumanCompleteCaseRecord {
  const result = getResult(payload);
  const stats = getStats(result);
  const distillation = getDistillation(result);
  const learningTrace = isRecord(distillation?.learningTrace)
    ? distillation.learningTrace
    : distillation;

  const resultType =
    cleanString(result.resultType) ?? cleanString(stats?.resultType);
  const primaryFamily =
    cleanString(stats?.primaryFamily) ??
    cleanString(result.corePattern);
  const displayedMainDirection =
    cleanString(result.displayedMainDirection) ??
    cleanString(result.corePattern);
  const frontierFamilies = cleanStringArray(stats?.frontierFamilies);

  const reviewStatus = resolveHumanReviewStatus(
    isRecord(payload.humanReview) ? payload.humanReview : undefined,
  );
  const humanApproved = reviewStatus === "approved";

  const shouldInfluenceFutureDiagnosis =
    humanApproved ||
    getBoolean(stats?.shouldInfluenceFutureCases) ||
    getBoolean(learningTrace?.shouldInfluenceFutureCases);

  const influenceWeight = humanApproved
    ? 0.75
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

  const archiveId =
    options?.forceArchiveId ??
    buildHash({
      sourceInput: payload.sourceInput,
      resultType,
      primaryFamily,
      displayedMainDirection,
      createdAt: payload.createdAt,
    });

  return {
    recordType: "human_complete_case",
    archiveId,
    archiveVersion: payload.archiveVersion ?? HUMAN_CASE_ARCHIVE_VERSION,
    createdAt: payload.createdAt ?? new Date().toISOString(),
    source: options?.source ?? payload.source ?? BROWSER_HUMAN_SOURCE,
    storagePolicy: {
      depot: "human_cases_complete",
      shouldStoreComplete: true,
      shouldStoreLearningExtract: true,
      shouldInfluenceFutureDiagnosis,
      influenceWeight,
      searchWeight: humanApproved ? 0.95 : 0.7,
      reviewStatus,
    },
    classification: {
      resultType,
      primaryFamily,
      displayedMainDirection,
      frontierFamilies,
      conflictDetected:
        getBoolean(stats?.conflictDetected) ||
        getBoolean(result.isConflictReading),
      humanReviewSuggested:
        getBoolean(stats?.humanReviewSuggested) ||
        getBoolean(stats?.diagnosticJudgeRequestedHumanReview) ||
        reviewStatus === "pending_human_review",
      compressionSignalsDetected:
        getBoolean(stats?.compressionSignalsDetected) ||
        getBoolean(stats?.compressionDetected),
      learningTier:
        cleanString(stats?.learningTier) ??
        cleanString(learningTrace?.learningTier) ??
        cleanString(distillation?.recommendedLearningUse),
    },
    payload: {
      ...payload,
      archiveVersion: payload.archiveVersion ?? HUMAN_CASE_ARCHIVE_VERSION,
    },
  };
}

export function buildHumanLearningExtract(
  complete: HumanCompleteCaseRecord,
): HumanLearningExtractRecord {
  const result = getResult(complete.payload);
  const stats = getStats(result);
  const distillation = getDistillation(result);
  const contextual = getContextualReview(result);
  const humanReview = isRecord(complete.payload.humanReview)
    ? complete.payload.humanReview
    : {};

  const extractedLessons = Array.isArray(distillation?.extractedLessons)
    ? distillation.extractedLessons
    : [];

  const misreadWarnings = [
    ...cleanStringArray(distillation?.misreadWarnings),
    ...cleanStringArray(distillation?.misreadWarnings),
  ];

  const similarCases = Array.isArray(result.similarCases)
    ? result.similarCases
    : [];
  const similarCaseIds = similarCases
    .map((item) =>
      isRecord(item) ? cleanString(item.caseId) : null,
    )
    .filter((id): id is string => Boolean(id));

  const learningSignal = isRecord(result.learningSignal)
    ? result.learningSignal
    : null;

  const themeHints = Array.isArray(contextual?.themeHints)
    ? contextual.themeHints
    : Array.isArray(contextual?.suggestedThemes)
      ? contextual.suggestedThemes
      : [];

  const activationHints = Array.isArray(contextual?.activationHints)
    ? contextual.activationHints
    : [];

  const tags = cleanStringArray(stats?.statisticalTags);

  const lessonDraft =
    cleanString(humanReview.correctionNote) ??
    cleanString(distillation?.summary) ??
    (extractedLessons[0] && isRecord(extractedLessons[0])
      ? cleanString(extractedLessons[0].lesson)
      : null);

  return {
    recordType: "human_learning_extract",
    extractId: `${complete.archiveId}_extract`,
    archiveId: complete.archiveId,
    createdAt: complete.createdAt,
    source: complete.source,
    reviewStatus: complete.storagePolicy.reviewStatus,
    displayedMainDirection: complete.classification.displayedMainDirection,
    resultType: complete.classification.resultType,
    primaryFamily: complete.classification.primaryFamily,
    frontierFamilies: complete.classification.frontierFamilies,
    strongestHistoricalFamily: cleanString(
      learningSignal?.strongestHistoricalFamily,
    ),
    contextualSummary:
      cleanString(contextual?.summary) ??
      cleanString(contextual?.contextSummary),
    contextualVerdict: cleanString(contextual?.verdict),
    themeHints,
    activationHints,
    extractedLessons,
    misreadWarnings: Array.from(new Set(misreadWarnings)),
    diagnosticJudgeVerdict: cleanString(
      isRecord(result.diagnosticReview)
        ? result.diagnosticReview.finalVerdict
        : null,
    ),
    similarCaseIds,
    tags,
    humanVerdict: {
      expectedPrimaryFamily: cleanString(humanReview.expectedPrimaryFamily) ?? "",
      acceptableFamilies: cleanStringArray(humanReview.acceptableFamilies),
      rivalFamilies: cleanStringArray(humanReview.rivalFamilies),
      verdict: cleanString(humanReview.verdict) ?? "pending_human_review",
      correctionNote: cleanString(humanReview.correctionNote) ?? "",
      shouldBecomeLearnedCase: getBoolean(humanReview.shouldBecomeLearnedCase),
    },
    lessonDraft,
    links: {
      completeCaseArchiveId: complete.archiveId,
    },
  };
}

export type HumanCaseReviewNote = {
  recordType: "human_case_review_note";
  archiveId: string;
  updatedAt: string;
  reviewStatus: HumanReviewStatus;
  humanVerdict: HumanLearningExtractRecord["humanVerdict"];
};

export type HumanCaseDepotPaths = {
  completePath: string;
  extractPath: string;
  reviewsPath: string;
  legacyBroadPath: string;
  legacyObservationsPath: string;
};

export function getHumanCaseDepotPaths(): HumanCaseDepotPaths {
  const learningDir = path.join(process.cwd(), "data", "learning");
  return {
    completePath: path.join(learningDir, "human-cases-complete.jsonl"),
    extractPath: path.join(learningDir, "human-learning-extracts.jsonl"),
    reviewsPath: path.join(learningDir, "human-case-reviews.jsonl"),
    legacyBroadPath: path.join(learningDir, "diagnostic-case-archive.jsonl"),
    legacyObservationsPath: path.join(learningDir, "learning-observations.jsonl"),
  };
}

/** En Vercel con Blob, el filesystem es solo lectura — no escribir JSONL local. */
function shouldWriteFilesystemMirror(): boolean {
  if (process.env.VERCEL === "1" && isVercelBlobConfigured()) return false;
  return true;
}

async function appendJsonlIfNew(
  filePath: string,
  idField: string,
  idValue: string,
  record: unknown,
): Promise<{ appended: boolean; reason?: string }> {
  try {
    const existing = await readFile(filePath, "utf8");
    if (existing.includes(`"${idField}":"${idValue}"`)) {
      return { appended: false, reason: "duplicate" };
    }
  } catch {
    // file missing
  }

  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  return { appended: true };
}

export type PersistHumanCaseResult = {
  ok: true;
  archiveId: string;
  extractId: string;
  durable: {
    stored: boolean;
    verified: boolean;
    verificationStatus?: "verified" | "pending";
    storage: "vercel_blob" | "filesystem_mirror";
    pathname?: string;
    url?: string;
  };
  complete: { appended: boolean; reason?: string };
  extract: { appended: boolean; reason?: string };
  legacy?: {
    broadArchive?: { appended: boolean; reason?: string };
    learningObservation?: { appended: boolean; reason?: string } | null;
  };
  completeRecord: HumanCompleteCaseRecord;
  extractRecord: HumanLearningExtractRecord;
};

/**
 * Escribe caso completo + extracto de aprendizaje.
 * Alcance fundacional: solo cuestionario (sourceInput) + sentencia del diagnóstico (currentResult).
 * Ver web/docs/human-depot-scope.md
 */
export async function persistHumanCaseDepot(
  payload: HumanCasePayload,
  options?: {
    source?: string;
    forceArchiveId?: string;
    alsoWriteLegacy?: boolean;
    legacyObservation?: boolean;
  },
): Promise<PersistHumanCaseResult> {
  const paths = getHumanCaseDepotPaths();
  if (shouldWriteFilesystemMirror()) {
    await mkdir(path.dirname(paths.completePath), { recursive: true });
  }

  const completeRecord = buildHumanCompleteCaseRecord(payload, options);
  const extractRecord = buildHumanLearningExtract(completeRecord);

  const storeStatus = getDurableStoreStatus();
  let durable: PersistHumanCaseResult["durable"] = {
    stored: false,
    verified: false,
    storage: "filesystem_mirror",
  };

  if (storeStatus.configured) {
    const blobResult = await putHumanCaseBundle({
      complete: completeRecord,
      extract: extractRecord,
    });
    durable = {
      stored: true,
      verified: blobResult.verified,
      verificationStatus: blobResult.verificationStatus,
      storage: "vercel_blob",
      pathname: blobResult.pathname,
      url: blobResult.url,
    };
  } else if (storeStatus.required) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN requerido en Vercel para guardar casos humanos.",
    );
  } else {
    durable = {
      stored: false,
      verified: false,
      storage: "filesystem_mirror",
    };
  }

  let complete: { appended: boolean; reason?: string };
  let extract: { appended: boolean; reason?: string };

  if (shouldWriteFilesystemMirror()) {
    complete = await appendJsonlIfNew(
      paths.completePath,
      "archiveId",
      completeRecord.archiveId,
      completeRecord,
    );

    extract = await appendJsonlIfNew(
      paths.extractPath,
      "extractId",
      extractRecord.extractId,
      extractRecord,
    );
  } else if (durable.stored) {
    complete = {
      appended: true,
      reason: durable.verified ? "vercel_blob_primary" : "vercel_blob_pending_verify",
    };
    extract = {
      appended: true,
      reason: durable.verified ? "vercel_blob_primary" : "vercel_blob_pending_verify",
    };
  } else {
    complete = { appended: false, reason: "filesystem_disabled" };
    extract = { appended: false, reason: "filesystem_disabled" };
  }

  if (
    !storeStatus.configured &&
    !storeStatus.required &&
    complete.appended &&
    extract.appended
  ) {
    durable = {
      stored: true,
      verified: true,
      storage: "filesystem_mirror",
    };
  }

  let legacy: PersistHumanCaseResult["legacy"];

  if (options?.alsoWriteLegacy !== false && shouldWriteFilesystemMirror()) {
    const legacyRecord = {
      ...completeRecord,
      storagePolicy: {
        shouldStoreInBroadArchive: true,
        shouldStoreAsLearningObservation:
          options?.legacyObservation ??
          completeRecord.storagePolicy.reviewStatus === "pending_human_review",
        shouldStoreAsValidatedLearningCase:
          completeRecord.storagePolicy.reviewStatus === "approved",
        shouldInfluenceFutureDiagnosis:
          completeRecord.storagePolicy.shouldInfluenceFutureDiagnosis,
        influenceWeight: completeRecord.storagePolicy.influenceWeight,
        searchWeight: completeRecord.storagePolicy.searchWeight,
        reviewStatus:
          completeRecord.storagePolicy.reviewStatus === "approved"
            ? "validated"
            : "partial_observation",
      },
      payload: completeRecord.payload,
    };

    const broadArchive = await appendJsonlIfNew(
      paths.legacyBroadPath,
      "archiveId",
      completeRecord.archiveId,
      legacyRecord,
    );

    let learningObservation: { appended: boolean; reason?: string } | null = null;
    if (legacyRecord.storagePolicy.shouldStoreAsLearningObservation) {
      learningObservation = await appendJsonlIfNew(
        paths.legacyObservationsPath,
        "archiveId",
        completeRecord.archiveId,
        legacyRecord,
      );
    }

    legacy = { broadArchive, learningObservation };
  }

  return {
    ok: true,
    archiveId: completeRecord.archiveId,
    extractId: extractRecord.extractId,
    durable,
    complete,
    extract,
    legacy,
    completeRecord,
    extractRecord,
  };
}

export async function readJsonlFile<T>(filePath: string, limit = 200): Promise<T[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    return lines
      .slice(-limit)
      .map((line) => JSON.parse(line) as T)
      .reverse();
  } catch {
    return [];
  }
}

export async function listHumanCompleteCases(limit = 100) {
  const blobItems = await listHumanCaseBundles(limit);
  if (blobItems.length > 0) {
    const records: HumanCompleteCaseRecord[] = [];
    for (const item of blobItems) {
      const bundle = await getHumanCaseBundle(item.archiveId);
      if (bundle?.complete) records.push(bundle.complete);
    }
    return records;
  }

  const paths = getHumanCaseDepotPaths();
  return readJsonlFile<HumanCompleteCaseRecord>(paths.completePath, limit);
}

export async function listHumanLearningExtracts(limit = 100) {
  const paths = getHumanCaseDepotPaths();
  return readJsonlFile<HumanLearningExtractRecord>(paths.extractPath, limit);
}

export async function findHumanCompleteCaseById(archiveId: string) {
  const bundle = await getHumanCaseBundle(archiveId);
  if (bundle?.complete) return bundle.complete;

  const cases = await listHumanCompleteCases(500);
  return cases.find((item) => item.archiveId === archiveId) ?? null;
}

export async function findHumanLearningExtractByArchiveId(archiveId: string) {
  const bundle = await getHumanCaseBundle(archiveId);
  if (bundle?.extract) return bundle.extract;

  const paths = getHumanCaseDepotPaths();
  const extracts = await readJsonlFile<HumanLearningExtractRecord>(
    paths.extractPath,
    500,
  );
  return extracts.find((item) => item.archiveId === archiveId) ?? null;
}

export async function appendHumanCaseReviewNote(note: HumanCaseReviewNote) {
  const paths = getHumanCaseDepotPaths();
  await mkdir(path.dirname(paths.reviewsPath), { recursive: true });
  await appendFile(paths.reviewsPath, `${JSON.stringify(note)}\n`, "utf8");
}

export async function listHumanCaseReviewNotes(limit = 200) {
  const paths = getHumanCaseDepotPaths();
  return readJsonlFile<HumanCaseReviewNote>(paths.reviewsPath, limit);
}

export async function getLatestReviewNoteForCase(archiveId: string) {
  const notes = await listHumanCaseReviewNotes(500);
  return notes.find((item) => item.archiveId === archiveId) ?? null;
}
