"use client";

import type {
  FounderCaseDraftErrorSummary,
  FounderCaseDraftLearningDisposition,
  FounderCaseDraftRecord,
  FounderCaseDraftStatus,
} from "./founderCaseDraftTypes";
import {
  FOUNDER_CASE_DRAFT_ROUTE,
  FOUNDER_CASE_DRAFT_SOURCE,
  FOUNDER_CASE_QUESTIONNAIRE_VERSION,
} from "./founderCaseDraftTypes";

export type FounderDraftSyncResult = {
  ok: boolean;
  error?: string;
  record?: FounderCaseDraftRecord;
};

export const FOUNDER_WAVE_SESSION_KEY = "vu_founder_wave_active";
const SYNC_WARNING_KEY = "vu_founder_sync_warning";

export function activateFounderWaveSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FOUNDER_WAVE_SESSION_KEY, "1");
}

export function isFounderWaveSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(FOUNDER_WAVE_SESSION_KEY) === "1";
}

export function setFounderSyncWarning(message: string | null): void {
  if (typeof window === "undefined") return;
  if (!message) {
    sessionStorage.removeItem(SYNC_WARNING_KEY);
    return;
  }
  sessionStorage.setItem(SYNC_WARNING_KEY, message);
}

export function getFounderSyncWarning(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SYNC_WARNING_KEY);
}

function readClientMeta(): FounderCaseDraftRecord["clientMeta"] {
  if (typeof window === "undefined") return {};
  return {
    userAgent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    referrer: document.referrer || undefined,
  };
}

export function summarizeAnalysisResult(result: unknown): Record<string, unknown> | null {
  if (!result || typeof result !== "object") return null;
  const r = result as Record<string, unknown>;
  return {
    resultType: r.resultType ?? null,
    corePattern: r.corePattern ?? null,
    dominantTension: r.dominantTension ?? null,
    summaryForUser:
      typeof r.summaryForUser === "string" ? r.summaryForUser.slice(0, 500) : null,
  };
}

export async function postFounderCaseDraftToServer(input: {
  caseId: string;
  diagnosticRunId: string;
  runNumber?: number;
  status: FounderCaseDraftStatus;
  rawAnswers: unknown;
  builtUserIntake?: unknown;
  submittedAt?: string;
  archiveId?: string | null;
  analysisResultFull?: unknown;
  analysisResultSummary?: unknown;
  errorSummary?: FounderCaseDraftErrorSummary | null;
  learningDisposition?: FounderCaseDraftLearningDisposition;
  createdAt?: string;
}): Promise<FounderDraftSyncResult> {
  try {
    const res = await fetch("/api/founder-case-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: input.caseId,
        diagnosticRunId: input.diagnosticRunId,
        runNumber: input.runNumber ?? 1,
        source: FOUNDER_CASE_DRAFT_SOURCE,
        route: FOUNDER_CASE_DRAFT_ROUTE,
        questionnaireVersion: FOUNDER_CASE_QUESTIONNAIRE_VERSION,
        status: input.status,
        rawAnswers: input.rawAnswers,
        builtUserIntake: input.builtUserIntake,
        submittedAt: input.submittedAt,
        archiveId: input.archiveId,
        analysisResultFull: input.analysisResultFull,
        analysisResultSummary: input.analysisResultSummary,
        errorSummary: input.errorSummary ?? null,
        shouldBecomeLearnedCase: false,
        learningDisposition: input.learningDisposition ?? "raw_human_case",
        privacy: {
          containsPersonalNarrative: true,
          storage: "private_blob",
          publicExposure: false,
        },
        clientMeta: readClientMeta(),
        createdAt: input.createdAt,
      } satisfies Partial<FounderCaseDraftRecord>),
    });

    const json = (await res.json()) as {
      ok: boolean;
      error?: string;
      message?: string;
    };

    if (!res.ok || !json.ok) {
      return {
        ok: false,
        error: json.message ?? json.error ?? "persist_failed",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "network_error",
    };
  }
}

export async function fetchFounderCaseDraftStatus(
  caseId: string,
  diagnosticRunId?: string,
): Promise<{ ok: boolean; exists?: boolean; status?: string | null }> {
  try {
    const params = new URLSearchParams({ caseId });
    if (diagnosticRunId) params.set("diagnosticRunId", diagnosticRunId);
    const res = await fetch(`/api/founder-case-drafts/status?${params.toString()}`);
    const json = (await res.json()) as { ok: boolean; exists?: boolean; status?: string };
    return { ok: res.ok && json.ok, exists: json.exists, status: json.status ?? null };
  } catch {
    return { ok: false };
  }
}
