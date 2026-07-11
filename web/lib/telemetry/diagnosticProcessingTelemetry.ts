"use client";

import { isFounderWaveSession } from "@/lib/learning/founderCaseDraftClient";
import { trackEvent, trackEventOnce } from "./client";

const ROUTE = "/full/processing";
const ATTEMPT_STORAGE_KEY = "vu_diagnostic_attempt_id";

const KNOWN_ERROR_CODES = new Set([
  "network_error",
  "api_non_ok",
  "invalid_json",
  "missing_result",
  "timeout",
  "client_exception",
  "preservation_blocked",
  "preservation_post_failed",
  "api_error",
  "unknown",
]);

export type DiagnosticFailPhase =
  | "fetch"
  | "response"
  | "parse"
  | "validation"
  | "client_exception"
  | "unknown";

export type DiagnosticAnswerMeta = {
  hasAnswers: boolean;
  answerCount: number;
};

type StringRecord = Record<string, string>;

type AnswerBuckets = {
  profile: StringRecord;
  currentContext: StringRecord;
  narrative: StringRecord;
  followupAnswers: Record<string, string | string[]>;
};

export function beginDiagnosticAttemptId(): string {
  if (typeof window === "undefined") return "server";
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  try {
    sessionStorage.setItem(ATTEMPT_STORAGE_KEY, id);
  } catch {
    // ignore
  }
  return id;
}

function readDiagnosticAttemptId(): string {
  if (typeof window === "undefined") return "server";
  try {
    return sessionStorage.getItem(ATTEMPT_STORAGE_KEY) ?? beginDiagnosticAttemptId();
  } catch {
    return beginDiagnosticAttemptId();
  }
}

function countNonEmptyStrings(values: StringRecord): number {
  return Object.values(values).filter((value) => typeof value === "string" && value.trim()).length;
}

export function buildDiagnosticAnswerMeta(buckets: AnswerBuckets): DiagnosticAnswerMeta {
  let answerCount = 0;
  answerCount += countNonEmptyStrings(buckets.profile);
  answerCount += countNonEmptyStrings(buckets.currentContext);
  answerCount += countNonEmptyStrings(buckets.narrative);

  for (const value of Object.values(buckets.followupAnswers)) {
    if (typeof value === "string" && value.trim()) answerCount += 1;
    if (Array.isArray(value) && value.length > 0) answerCount += 1;
  }

  return {
    answerCount,
    hasAnswers: answerCount > 0,
  };
}

export function sanitizeDiagnosticErrorCode(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "unknown";
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 40);
  if (KNOWN_ERROR_CODES.has(normalized)) return normalized;
  if (/^[a-z][a-z0-9_]{0,23}$/.test(normalized)) return normalized;
  return "api_error";
}

function baseProperties(
  answerMeta: DiagnosticAnswerMeta,
  founder = isFounderWaveSession(),
): Record<string, string | number | boolean | null> {
  return {
    route: ROUTE,
    attemptSource: "client",
    attemptId: readDiagnosticAttemptId(),
    founder,
    hasAnswers: answerMeta.hasAnswers,
    answerCount: answerMeta.answerCount,
  };
}

export function trackDiagnosticProcessingStarted(answerMeta: DiagnosticAnswerMeta): void {
  const attemptId = readDiagnosticAttemptId();
  trackEventOnce(`diagnostic_processing_started_${attemptId}`, {
    name: "diagnostic_processing_started",
    path: ROUTE,
    properties: {
      ...baseProperties(answerMeta),
      source: "full_processing",
    },
  });
}

export function trackDiagnosticFailed(
  answerMeta: DiagnosticAnswerMeta,
  props: {
    phase: DiagnosticFailPhase;
    errorCode: string;
    status?: number;
  },
): void {
  trackEvent({
    name: "diagnostic_failed",
    path: ROUTE,
    properties: {
      ...baseProperties(answerMeta),
      phase: props.phase,
      errorCode: sanitizeDiagnosticErrorCode(props.errorCode),
      ...(props.status != null ? { status: props.status } : {}),
    },
  });
}

export function trackDiagnosticCompleted(
  answerMeta: DiagnosticAnswerMeta,
  props?: { resultFamilyCount?: number },
): void {
  const attemptId = readDiagnosticAttemptId();
  trackEventOnce(`diagnostic_completed_${attemptId}`, {
    name: "diagnostic_completed",
    path: ROUTE,
    properties: {
      ...baseProperties(answerMeta),
      source: "full_processing",
      hasResult: true,
      ...(props?.resultFamilyCount != null
        ? { resultFamilyCount: props.resultFamilyCount }
        : {}),
    },
  });
}
