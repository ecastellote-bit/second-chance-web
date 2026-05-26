"use client";

import type {
  DiagnosticCaseSource,
  FounderCaseDraftErrorSummary,
  FounderCaseDraftLearningDisposition,
  FounderCaseDraftRecord,
  FounderCaseDraftStatus,
} from "./founderCaseDraftTypes";
import {
  FOUNDER_CASE_DRAFT_ROUTE,
  FOUNDER_CASE_QUESTIONNAIRE_VERSION,
} from "./founderCaseDraftTypes";

export type FounderDraftSyncResult = {
  ok: boolean;
  error?: string;
  record?: FounderCaseDraftRecord;
};

export const FULL_FLOW_PRESERVATION_KEY = "vu_full_flow_preservation_active";
export const FOUNDER_WAVE_FLAG_KEY = "vu_founder_wave_active";
const SYNC_WARNING_KEY = "vu_founder_sync_warning";

/** Activa preservación server-side para cualquier recorrido /full. */
export function activateFullFlowPreservation(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FULL_FLOW_PRESERVATION_KEY, "1");
}

export function activateFounderWaveSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(FOUNDER_WAVE_FLAG_KEY, "1");
  activateFullFlowPreservation();
}

export function isFullFlowPreservationActive(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(FULL_FLOW_PRESERVATION_KEY) === "1";
}

/** @deprecated Use isFullFlowPreservationActive */
export function isFounderWaveSession(): boolean {
  return isFullFlowPreservationActive();
}

export function getDiagnosticCaseSource(): DiagnosticCaseSource {
  if (typeof window === "undefined") return "direct_full_diagnostic";
  if (sessionStorage.getItem(FOUNDER_WAVE_FLAG_KEY) === "1") {
    return "founder_wave";
  }
  return "direct_full_diagnostic";
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
    displayedMainDirection: r.displayedMainDirection ?? r.corePattern ?? null,
    hasPersonalizedPresentation: Boolean(r.personalizedPresentation),
    summaryForUser:
      typeof r.summaryForUser === "string" ? r.summaryForUser.slice(0, 500) : null,
  };
}

export async function postFounderCaseDraftToServer(input: {
  caseId: string;
  diagnosticRunId: string;
  runNumber?: number;
  status: FounderCaseDraftStatus;
  source?: DiagnosticCaseSource;
  rawAnswers: unknown;
  builtUserIntake?: unknown;
  submittedAt?: string;
  archiveId?: string | null;
  analysisResultFull?: unknown;
  analysisResultSummary?: unknown;
  errorSummary?: FounderCaseDraftErrorSummary | null;
  learningDisposition?: FounderCaseDraftLearningDisposition;
  humanReviewRequested?: boolean;
  humanReviewRequestedAt?: string | null;
  humanReviewStatus?: "pending" | "none";
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
        source: input.source ?? getDiagnosticCaseSource(),
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
        humanReviewRequested: input.humanReviewRequested,
        humanReviewRequestedAt: input.humanReviewRequestedAt,
        humanReviewStatus: input.humanReviewStatus,
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
): Promise<{
  ok: boolean;
  exists?: boolean;
  status?: string | null;
  serverPreservationConfirmed?: boolean;
  archiveId?: string | null;
}> {
  try {
    const params = new URLSearchParams({ caseId });
    if (diagnosticRunId) params.set("diagnosticRunId", diagnosticRunId);
    const res = await fetch(`/api/founder-case-drafts/status?${params.toString()}`);
    const json = (await res.json()) as {
      ok: boolean;
      exists?: boolean;
      status?: string;
      serverPreservationConfirmed?: boolean;
      archiveId?: string | null;
    };
    return {
      ok: res.ok && json.ok,
      exists: json.exists,
      status: json.status ?? null,
      serverPreservationConfirmed: json.serverPreservationConfirmed,
      archiveId: json.archiveId ?? null,
    };
  } catch {
    return { ok: false };
  }
}
