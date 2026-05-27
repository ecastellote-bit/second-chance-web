import { backupHumanCaseToBrowser } from "./clientCaseBackup";
import {
  getDiagnosticCaseSource,
  summarizeAnalysisResult,
} from "./founderCaseDraftClient";
import {
  getActiveFounderCaseRecord,
  getOrCreateFounderCaseIdentity,
  QUESTIONNAIRE_VERSION_INTEGRATED,
} from "./founderCasePreservation";

export type ArchiveVerificationStatus = "verified" | "pending" | "none";

export type PersistHumanCaseResponse = {
  ok: boolean;
  archiveId?: string;
  persisted?: boolean;
  durable?: {
    stored: boolean;
    verified: boolean;
    verificationStatus?: ArchiveVerificationStatus;
    storage: string;
    pathname?: string;
  };
  error?: string;
  archiveLevel?: "full" | "minimal";
};

export type PersistHumanCaseOutcome = {
  archiveId: string;
  persisted: boolean;
  verificationStatus: ArchiveVerificationStatus;
  durable: PersistHumanCaseResponse["durable"];
  attempts: number;
  archiveLevel: "full" | "minimal" | "none";
  draftServerConfirmed: boolean;
  caseId: string | null;
  diagnosticRunId: string | null;
};

const MAX_ATTEMPTS = 3;

function resolveVerificationStatus(
  durable?: PersistHumanCaseResponse["durable"],
): ArchiveVerificationStatus {
  if (!durable?.stored) return "none";
  if (durable.verificationStatus === "pending" || durable.verified === false) {
    return "pending";
  }
  return "verified";
}

function buildLeanArchivePayload(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const p = payload as Record<string, unknown>;
  const current = (p.currentResult ?? {}) as Record<string, unknown>;

  return {
    ...p,
    currentResult: {
      resultType: current.resultType,
      corePattern: current.corePattern,
      displayedMainDirection: current.displayedMainDirection,
      dominantTension: current.dominantTension,
      currentCost: current.currentCost,
      summaryForUser: current.summaryForUser,
      personalizedPresentation: current.personalizedPresentation,
      familyScores: Array.isArray(current.familyScores)
        ? (current.familyScores as unknown[]).slice(0, 8)
        : [],
      learningSignal: current.learningSignal ?? null,
      _guidedThemes: current._guidedThemes ?? [],
    },
    sourceInput: p.sourceInput,
    humanReview: p.humanReview,
    clientMeta: p.clientMeta,
  };
}

async function postOnce(payload: unknown): Promise<PersistHumanCaseResponse> {
  const res = await fetch("/api/human-cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as PersistHumanCaseResponse;

  if (!res.ok || !data.ok) {
    return {
      ok: false,
      error: data.error ?? `HTTP ${res.status}`,
    };
  }

  return data;
}

async function postMinimalArchive(summary: Record<string, unknown>): Promise<{
  ok: boolean;
  archiveId?: string;
  persisted?: boolean;
  durable?: PersistHumanCaseResponse["durable"];
}> {
  const identity = getOrCreateFounderCaseIdentity(
    getActiveFounderCaseRecord()?.identity,
  );

  const res = await fetch("/api/human-cases/minimal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      caseId: identity.caseId,
      diagnosticRunId: identity.diagnosticRunId,
      source: getDiagnosticCaseSource(),
      questionnaireVersion: QUESTIONNAIRE_VERSION_INTEGRATED,
      summary,
    }),
  });

  const data = (await res.json()) as PersistHumanCaseResponse & {
    archiveLevel?: string;
  };

  if (!res.ok || !data.ok || !data.archiveId) {
    return { ok: false };
  }

  return {
    ok: true,
    archiveId: data.archiveId,
    persisted: data.persisted ?? true,
    durable: data.durable,
  };
}

/**
 * Guarda caso humano: bundle completo (lean) → minimal → backup local.
 * persisted = write aceptado en Blob; verificationStatus indica lectura confirmada.
 */
export async function persistHumanCaseFromBrowserWithRetry(
  payload: unknown,
): Promise<PersistHumanCaseOutcome> {
  const identity = getOrCreateFounderCaseIdentity(
    getActiveFounderCaseRecord()?.identity,
  );
  const draftRecord = getActiveFounderCaseRecord();
  const draftServerConfirmed = Boolean(draftRecord?.serverSyncedAt);

  const leanPayload = buildLeanArchivePayload(payload);
  const analysisSummary = summarizeAnalysisResult(
    (leanPayload as Record<string, unknown>)?.currentResult,
  );

  backupHumanCaseToBrowser(identity.caseId, leanPayload, { serverSynced: false });

  let lastError = "unknown";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const data = await postOnce(leanPayload);

      if (data.ok && data.archiveId && data.persisted) {
        const verificationStatus = resolveVerificationStatus(data.durable);
        backupHumanCaseToBrowser(data.archiveId, leanPayload, {
          serverSynced: true,
          serverArchiveId: data.archiveId,
        });
        return {
          archiveId: data.archiveId,
          persisted: true,
          verificationStatus,
          durable: data.durable,
          attempts: attempt,
          archiveLevel: "full",
          draftServerConfirmed,
          caseId: identity.caseId,
          diagnosticRunId: identity.diagnosticRunId,
        };
      }

      if (data.ok && data.archiveId && !data.persisted) {
        lastError = "Servidor respondió sin persistencia durable.";
      } else {
        lastError = data.error ?? "Error al guardar";
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }

  if (draftServerConfirmed && analysisSummary) {
    try {
      const minimal = await postMinimalArchive({
        ...analysisSummary,
        hasAnalysisResultFullInDraft: true,
      });

      if (minimal.ok && minimal.archiveId && minimal.persisted) {
        const verificationStatus = resolveVerificationStatus(minimal.durable);
        backupHumanCaseToBrowser(minimal.archiveId, leanPayload, {
          serverSynced: true,
          serverArchiveId: minimal.archiveId,
        });
        return {
          archiveId: minimal.archiveId,
          persisted: true,
          verificationStatus,
          durable: minimal.durable,
          attempts: MAX_ATTEMPTS,
          archiveLevel: "minimal",
          draftServerConfirmed: true,
          caseId: identity.caseId,
          diagnosticRunId: identity.diagnosticRunId,
        };
      }
    } catch {
      // fall through
    }
  }

  return {
    archiveId: identity.caseId,
    persisted: false,
    verificationStatus: "none",
    durable: undefined,
    attempts: MAX_ATTEMPTS,
    archiveLevel: "none",
    draftServerConfirmed,
    caseId: identity.caseId,
    diagnosticRunId: identity.diagnosticRunId,
  };
}

export function downloadHumanCaseBackup(payload: unknown, archiveId: string) {
  if (typeof window === "undefined") return;

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `vocationup-caso-${archiveId}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
