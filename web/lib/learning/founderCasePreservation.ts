"use client";

import { backupHumanCaseToBrowser } from "./clientCaseBackup";
import { buildFoundationalClientMeta } from "./foundationalCohort";
import {
  activateFullFlowPreservation,
  getDiagnosticCaseSource,
  isFullFlowPreservationActive,
  postFounderCaseDraftToServer,
  setFounderSyncWarning,
  summarizeAnalysisResult,
} from "./founderCaseDraftClient";
import type { DiagnosticCaseSource } from "./founderCaseDraftTypes";
import type {
  FounderCaseDraftErrorSummary,
  FounderCaseDraftStatus,
} from "./founderCaseDraftTypes";
import { downloadHumanCaseBackup } from "./persistHumanCaseFromBrowser";

export const FOUNDER_WAVE_SOURCE = "founder_wave" as const;
export const QUESTIONNAIRE_VERSION_INTEGRATED = "full_copy_v2_integrated";

export type PreservationLevel = "full" | "draft" | "local_only";

export const POST_ANALYSIS_SAVE_REQUIRED_MESSAGE =
  "No pudimos confirmar que tu lectura quedó preservada con seguridad. Reintentá el guardado o descargá tu respaldo antes de continuar.";

export type FounderCaseStatus =
  | "draft"
  | "submitted_before_analysis"
  | "analysis_failed"
  | "analysis_succeeded_pending_archive"
  | "archived";

export type LearningDisposition =
  | "raw_human_case"
  | "needs_review"
  | "learning_candidate"
  | "calibration_only"
  | "do_not_influence_yet";

export type FounderCaseIdentity = {
  caseId: string;
  diagnosticRunId: string;
  runNumber: number;
};

export type FounderCaseRecord = {
  identity: FounderCaseIdentity;
  status: FounderCaseStatus;
  source: DiagnosticCaseSource;
  questionnaireVersion: string;
  route: "/full";
  createdAt: string;
  updatedAt: string;
  rawAnswers?: unknown;
  builtUserIntake?: unknown;
  analysisResult?: unknown;
  analysisWarnings?: string[];
  guidedThemes?: unknown[];
  errorSummary?: string;
  archiveId?: string;
  learningDisposition: LearningDisposition;
  serverSyncedAt?: string;
  lastServerStatus?: FounderCaseDraftStatus;
};

const ACTIVE_FOUNDER_CASE_KEY = "vu_founder_case_active";

export const PRESERVATION_SAVE_BLOCKED_MESSAGE =
  "No pudimos guardar tu caso con seguridad todavía. Antes de analizar tu lectura, necesitamos confirmar que tus respuestas quedaron preservadas. Podés reintentar ahora o descargar un respaldo.";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function mapLearningDisposition(
  status: FounderCaseStatus,
): LearningDisposition {
  switch (status) {
    case "draft":
      return "raw_human_case";
    case "submitted_before_analysis":
    case "analysis_failed":
      return "needs_review";
    case "analysis_succeeded_pending_archive":
      return "learning_candidate";
    case "archived":
      return "calibration_only";
    default:
      return "do_not_influence_yet";
  }
}

function mapServerDisposition(
  status: FounderCaseDraftStatus,
): LearningDisposition {
  switch (status) {
    case "draft_started":
    case "draft_updated":
      return "raw_human_case";
    case "submitted_before_analysis":
    case "analysis_failed":
      return "needs_review";
    case "analysis_succeeded_pending_archive":
      return "learning_candidate";
    case "archived":
    case "archived_minimal":
      return "calibration_only";
    default:
      return "do_not_influence_yet";
  }
}

export function getOrCreateFounderCaseIdentity(
  existing?: Partial<FounderCaseIdentity> | null,
): FounderCaseIdentity {
  if (existing?.caseId && existing?.diagnosticRunId) {
    return {
      caseId: existing.caseId,
      diagnosticRunId: existing.diagnosticRunId,
      runNumber: typeof existing.runNumber === "number" ? existing.runNumber : 1,
    };
  }

  const stored = getActiveFounderCaseRecord();
  if (stored?.identity?.caseId && stored.identity.diagnosticRunId) {
    return stored.identity;
  }

  return {
    caseId: newId("case"),
    diagnosticRunId: newId("run"),
    runNumber: 1,
  };
}

export function getActiveFounderCaseRecord(): FounderCaseRecord | null {
  if (typeof window === "undefined") return null;
  return safeParse<FounderCaseRecord>(localStorage.getItem(ACTIVE_FOUNDER_CASE_KEY));
}

function writeFounderCaseRecord(record: FounderCaseRecord): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ACTIVE_FOUNDER_CASE_KEY, JSON.stringify(record));
  } catch {
    // quota — sessionStorage draft may still exist
  }

  const depotPayload = buildDepotPayloadFromRecord(record);
  backupHumanCaseToBrowser(record.identity.caseId, depotPayload, {
    source: getDiagnosticCaseSource(),
    serverSynced: Boolean(record.serverSyncedAt),
    serverArchiveId: record.archiveId,
  });
}

function buildDepotPayloadFromRecord(record: FounderCaseRecord): Record<string, unknown> {
  return {
    archiveVersion: "human_case_depot_v1",
    createdAt: record.createdAt,
    source: "browser_human_case_v1",
    sourceInput: {
      founderCase: record,
      fullAnswersContext: record.rawAnswers,
    },
    currentResult:
      record.analysisResult && typeof record.analysisResult === "object"
        ? (record.analysisResult as Record<string, unknown>)
        : {
            recordStatus: record.status,
            errorSummary: record.errorSummary ?? null,
            builtUserIntake: record.builtUserIntake ?? null,
          },
    humanReview: {
      verdict: "pending_human_review",
      expectedPrimaryFamily: "",
      acceptableFamilies: [],
      rivalFamilies: [],
      correctionNote: "",
      shouldBecomeLearnedCase: false,
    },
    clientMeta: buildFoundationalClientMeta({
      phase: record.status,
      founderWave: true,
      caseId: record.identity.caseId,
      diagnosticRunId: record.identity.diagnosticRunId,
      runNumber: record.identity.runNumber,
      questionnaireVersion: record.questionnaireVersion,
      learningDisposition: record.learningDisposition,
      route: record.route,
      lastServerStatus: record.lastServerStatus,
    }),
  };
}

function upsertRecord(
  patch: Partial<FounderCaseRecord> & {
    identity?: FounderCaseIdentity;
    status: FounderCaseStatus;
  },
): FounderCaseRecord {
  const prev = getActiveFounderCaseRecord();
  const identity = getOrCreateFounderCaseIdentity(patch.identity ?? prev?.identity);
  const now = new Date().toISOString();

  const record: FounderCaseRecord = {
    identity,
    status: patch.status,
    source: getDiagnosticCaseSource(),
    questionnaireVersion:
      patch.questionnaireVersion ??
      prev?.questionnaireVersion ??
      QUESTIONNAIRE_VERSION_INTEGRATED,
    route: "/full",
    createdAt: prev?.createdAt ?? now,
    updatedAt: now,
    rawAnswers: patch.rawAnswers ?? prev?.rawAnswers,
    builtUserIntake: patch.builtUserIntake ?? prev?.builtUserIntake,
    analysisResult: patch.analysisResult ?? prev?.analysisResult,
    analysisWarnings: patch.analysisWarnings ?? prev?.analysisWarnings,
    guidedThemes: patch.guidedThemes ?? prev?.guidedThemes,
    errorSummary: patch.errorSummary ?? prev?.errorSummary,
    archiveId: patch.archiveId ?? prev?.archiveId,
    learningDisposition:
      patch.learningDisposition ??
      prev?.learningDisposition ??
      mapLearningDisposition(patch.status),
    serverSyncedAt: patch.serverSyncedAt ?? prev?.serverSyncedAt,
    lastServerStatus: patch.lastServerStatus ?? prev?.lastServerStatus,
  };

  writeFounderCaseRecord(record);
  return record;
}

async function syncToServer(input: {
  serverStatus: FounderCaseDraftStatus;
  rawAnswers: unknown;
  builtUserIntake?: unknown;
  submittedAt?: string;
  archiveId?: string | null;
  analysisResult?: unknown;
  errorSummary?: FounderCaseDraftErrorSummary | null;
  learningDisposition?: LearningDisposition;
  required: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  activateFullFlowPreservation();

  if (!isFullFlowPreservationActive()) {
    return { ok: false, error: "preservation_not_active" };
  }

  const record = getActiveFounderCaseRecord();
  const identity = getOrCreateFounderCaseIdentity(record?.identity);

  const result = await postFounderCaseDraftToServer({
    caseId: identity.caseId,
    diagnosticRunId: identity.diagnosticRunId,
    runNumber: identity.runNumber,
    source: getDiagnosticCaseSource(),
    status: input.serverStatus,
    rawAnswers: input.rawAnswers,
    builtUserIntake: input.builtUserIntake,
    submittedAt: input.submittedAt,
    archiveId: input.archiveId,
    analysisResultFull: input.analysisResult,
    analysisResultSummary: input.analysisResult
      ? summarizeAnalysisResult(input.analysisResult)
      : undefined,
    errorSummary: input.errorSummary ?? null,
    learningDisposition:
      input.learningDisposition ?? mapServerDisposition(input.serverStatus),
    createdAt: record?.createdAt,
  });

  if (result.ok) {
    setFounderSyncWarning(null);

    const localStatus: FounderCaseStatus =
      input.serverStatus === "archived" || input.serverStatus === "archived_minimal"
        ? "archived"
        : input.serverStatus === "submitted_before_analysis"
          ? "submitted_before_analysis"
          : input.serverStatus === "analysis_failed"
            ? "analysis_failed"
            : input.serverStatus === "analysis_succeeded_pending_archive"
              ? "analysis_succeeded_pending_archive"
              : (record?.status ?? "draft");

    upsertRecord({
      status: localStatus,
      identity,
      rawAnswers: input.rawAnswers,
      builtUserIntake: input.builtUserIntake,
      analysisResult: input.analysisResult,
      archiveId: input.archiveId ?? undefined,
      serverSyncedAt: new Date().toISOString(),
      lastServerStatus: input.serverStatus,
      learningDisposition: input.learningDisposition ?? mapServerDisposition(input.serverStatus),
    });
    return { ok: true };
  }

  const warn =
    "No pudimos sincronizar una copia intermedia. Seguimos guardando en este dispositivo.";
  if (!input.required) {
    setFounderSyncWarning(warn);
    return { ok: false, error: result.error };
  }

  return { ok: false, error: result.error ?? "persist_failed" };
}

export async function ensureFounderDraftStarted(
  rawAnswers?: unknown,
): Promise<void> {
  const payload = rawAnswers ?? getActiveFounderCaseRecord()?.rawAnswers ?? {};
  upsertRecord({ status: "draft", rawAnswers: payload });

  await syncToServer({
    serverStatus: "draft_started",
    rawAnswers: payload,
    learningDisposition: "raw_human_case",
    required: false,
  });
}

export async function syncFounderDraftUpdated(
  rawAnswers: unknown,
): Promise<void> {
  upsertRecord({ status: "draft", rawAnswers });

  await syncToServer({
    serverStatus: "draft_updated",
    rawAnswers,
    required: false,
  });
}

export function saveFounderDraft(rawAnswers: unknown): FounderCaseRecord {
  return upsertRecord({
    status: "draft",
    rawAnswers,
    learningDisposition: "raw_human_case",
  });
}

export function saveSubmittedBeforeAnalysis(input: {
  rawAnswers: unknown;
  builtUserIntake: unknown;
}): FounderCaseRecord {
  return upsertRecord({
    status: "submitted_before_analysis",
    rawAnswers: input.rawAnswers,
    builtUserIntake: input.builtUserIntake,
    learningDisposition: "needs_review",
  });
}

export async function syncSubmittedBeforeAnalysisServer(input: {
  rawAnswers: unknown;
  builtUserIntake: unknown;
}): Promise<{ ok: boolean; error?: string }> {
  saveSubmittedBeforeAnalysis(input);

  return syncToServer({
    serverStatus: "submitted_before_analysis",
    rawAnswers: input.rawAnswers,
    builtUserIntake: input.builtUserIntake,
    submittedAt: new Date().toISOString(),
    learningDisposition: "needs_review",
    required: true,
  });
}

export async function syncAnalysisStarted(input: {
  rawAnswers: unknown;
  builtUserIntake: unknown;
}): Promise<void> {
  await syncToServer({
    serverStatus: "analysis_started",
    rawAnswers: input.rawAnswers,
    builtUserIntake: input.builtUserIntake,
    required: false,
  });
}

export function saveAnalysisFailed(input: {
  rawAnswers: unknown;
  builtUserIntake: unknown;
  errorSummary: string;
}): FounderCaseRecord {
  return upsertRecord({
    status: "analysis_failed",
    rawAnswers: input.rawAnswers,
    builtUserIntake: input.builtUserIntake,
    errorSummary: input.errorSummary,
    learningDisposition: "needs_review",
  });
}

export async function syncAnalysisFailedServer(input: {
  rawAnswers: unknown;
  builtUserIntake: unknown;
  errorSummary: string;
  stage?: string;
}): Promise<void> {
  saveAnalysisFailed(input);

  await syncToServer({
    serverStatus: "analysis_failed",
    rawAnswers: input.rawAnswers,
    builtUserIntake: input.builtUserIntake,
    errorSummary: {
      stage: input.stage ?? "analyze",
      message: input.errorSummary,
      createdAt: new Date().toISOString(),
    },
    learningDisposition: "needs_review",
    required: false,
  });
}

export function saveAnalysisSucceededPendingArchive(input: {
  rawAnswers: unknown;
  builtUserIntake: unknown;
  analysisResult: unknown;
  warnings?: string[];
  guidedThemes?: unknown[];
}): FounderCaseRecord {
  return upsertRecord({
    status: "analysis_succeeded_pending_archive",
    rawAnswers: input.rawAnswers,
    builtUserIntake: input.builtUserIntake,
    analysisResult: input.analysisResult,
    analysisWarnings: input.warnings,
    guidedThemes: input.guidedThemes,
    learningDisposition: "learning_candidate",
  });
}

export async function syncAnalysisSucceededServer(input: {
  rawAnswers: unknown;
  builtUserIntake: unknown;
  analysisResult: unknown;
}): Promise<{ ok: boolean; error?: string }> {
  saveAnalysisSucceededPendingArchive(input);

  return syncToServer({
    serverStatus: "analysis_succeeded_pending_archive",
    rawAnswers: input.rawAnswers,
    builtUserIntake: input.builtUserIntake,
    analysisResult: input.analysisResult,
    learningDisposition: "do_not_influence_yet",
    required: true,
  });
}

export function getPreservationIdentity(): FounderCaseIdentity {
  return getOrCreateFounderCaseIdentity(getActiveFounderCaseRecord()?.identity);
}

export function isDraftServerConfirmed(record?: FounderCaseRecord | null): boolean {
  const status = record?.lastServerStatus ?? record?.status;
  if (!status) return false;
  return [
    "submitted_before_analysis",
    "analysis_started",
    "analysis_succeeded_pending_archive",
    "archived",
    "archived_minimal",
  ].includes(status as string);
}

export function markFounderCaseArchived(archiveId: string): FounderCaseRecord {
  return upsertRecord({
    status: "archived",
    archiveId,
    learningDisposition: "calibration_only",
  });
}

export async function syncFounderCaseArchivedServer(
  archiveId: string,
): Promise<void> {
  const record = markFounderCaseArchived(archiveId);

  await syncToServer({
    serverStatus: "archived",
    rawAnswers: record.rawAnswers ?? {},
    builtUserIntake: record.builtUserIntake,
    archiveId,
    analysisResult: record.analysisResult,
    learningDisposition: "calibration_only",
    required: false,
  });
}

export function downloadFounderCaseBackup(record?: FounderCaseRecord | null): void {
  const active = record ?? getActiveFounderCaseRecord();
  if (!active) return;
  downloadHumanCaseBackup(buildDepotPayloadFromRecord(active), active.identity.caseId);
}

export function humanizeAnalysisError(
  error?: string,
  missingFields?: string[],
): string {
  if (missingFields?.length) {
    return "Faltan algunas respuestas obligatorias. Podés volver al cuestionario sin perder lo que ya escribiste.";
  }
  if (!error) {
    return "No pudimos completar la lectura en este intento. Tus respuestas siguen guardadas en este dispositivo.";
  }
  const lower = error.toLowerCase();
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Se cortó la conexión antes de terminar la lectura. Revisá tu internet e intentá de nuevo.";
  }
  if (lower.includes("timeout")) {
    return "La lectura tardó más de lo esperado. Podés reintentar: tus respuestas no se borraron.";
  }
  return "No pudimos completar la lectura en este intento. Tus respuestas siguen guardadas y podés reintentar.";
}
