import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import { getDurableStoreStatus } from "./humanCaseDurableStore";
import type {
  FounderCaseDraftRecord,
  FounderCaseDraftStatusPublic,
} from "./founderCaseDraftTypes";
import {
  FOUNDER_CASE_DRAFT_ROUTE,
  FOUNDER_CASE_DRAFT_SOURCE,
  FOUNDER_CASE_QUESTIONNAIRE_VERSION,
} from "./founderCaseDraftTypes";

const BLOB_PREFIX = "founder-case-drafts";

function draftsJsonlPath(): string {
  return path.join(process.cwd(), "data", "founder-case-drafts.jsonl");
}

function draftBlobPath(caseId: string, diagnosticRunId: string): string {
  return `${BLOB_PREFIX}/${caseId}/${diagnosticRunId}.json`;
}

function draftKey(caseId: string, diagnosticRunId: string): string {
  return `${caseId}::${diagnosticRunId}`;
}

export class FounderCaseDraftStoreError extends Error {
  code: "not_configured" | "write_failed" | "read_failed" | "invalid_payload";

  constructor(
    code: FounderCaseDraftStoreError["code"],
    message: string,
  ) {
    super(message);
    this.code = code;
    this.name = "FounderCaseDraftStoreError";
  }
}

export function getFounderCaseDraftStoreStatus() {
  const durable = getDurableStoreStatus();
  const blobConfigured = isVercelBlobConfigured();
  return {
    ...durable,
    blobConfigured,
    storage: blobConfigured ? ("vercel_blob" as const) : ("local_jsonl" as const),
    readyForPioneerDrafts: blobConfigured || !durable.required,
  };
}

async function readDraftFromBlob(
  caseId: string,
  diagnosticRunId: string,
): Promise<FounderCaseDraftRecord | null> {
  try {
    const result = await get(draftBlobPath(caseId, diagnosticRunId), {
      access: "private",
    });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as FounderCaseDraftRecord;
  } catch {
    return null;
  }
}

async function readAllDraftsFromJsonl(): Promise<Map<string, FounderCaseDraftRecord>> {
  const map = new Map<string, FounderCaseDraftRecord>();
  try {
    const raw = await readFile(draftsJsonlPath(), "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    for (const line of lines) {
      const record = JSON.parse(line) as FounderCaseDraftRecord;
      map.set(draftKey(record.caseId, record.diagnosticRunId), record);
    }
  } catch {
    // empty
  }
  return map;
}

async function writeDraftToJsonl(record: FounderCaseDraftRecord): Promise<void> {
  const filePath = draftsJsonlPath();
  await mkdir(path.dirname(filePath), { recursive: true });

  const map = await readAllDraftsFromJsonl();
  map.set(draftKey(record.caseId, record.diagnosticRunId), record);

  const lines = [...map.values()]
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
    .map((item) => JSON.stringify(item));

  const { writeFile } = await import("node:fs/promises");
  await writeFile(filePath, `${lines.join("\n")}\n`, "utf8");
}

async function writeDraftToBlob(record: FounderCaseDraftRecord): Promise<void> {
  await put(draftBlobPath(record.caseId, record.diagnosticRunId), JSON.stringify(record), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function getFounderCaseDraft(
  caseId: string,
  diagnosticRunId: string,
): Promise<FounderCaseDraftRecord | null> {
  if (isVercelBlobConfigured()) {
    return readDraftFromBlob(caseId, diagnosticRunId);
  }

  const map = await readAllDraftsFromJsonl();
  return map.get(draftKey(caseId, diagnosticRunId)) ?? null;
}

async function findLatestDraftForCase(
  caseId: string,
): Promise<FounderCaseDraftRecord | null> {
  if (isVercelBlobConfigured()) {
    const { blobs } = await list({
      prefix: `${BLOB_PREFIX}/${caseId}/`,
      limit: 50,
    });

    let latest: FounderCaseDraftRecord | null = null;
    for (const blob of blobs) {
      const match = blob.pathname.match(
        /founder-case-drafts\/[^/]+\/([^/]+)\.json$/,
      );
      if (!match) continue;
      const record = await readDraftFromBlob(caseId, match[1]!);
      if (!record) continue;
      if (
        !latest ||
        new Date(record.updatedAt).getTime() >
          new Date(latest.updatedAt).getTime()
      ) {
        latest = record;
      }
    }
    return latest;
  }

  const map = await readAllDraftsFromJsonl();
  const matches = [...map.values()].filter((item) => item.caseId === caseId);
  return (
    matches.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  );
}

export async function upsertFounderCaseDraft(
  input: Partial<FounderCaseDraftRecord> & {
    caseId: string;
    diagnosticRunId: string;
    status: FounderCaseDraftRecord["status"];
    rawAnswers: unknown;
  },
): Promise<FounderCaseDraftRecord> {
  const storeStatus = getFounderCaseDraftStoreStatus();

  if (!storeStatus.blobConfigured && storeStatus.required) {
    throw new FounderCaseDraftStoreError(
      "not_configured",
      "BLOB_READ_WRITE_TOKEN no configurado. No se pueden preservar casos pioneros en producción.",
    );
  }

  if (!input.caseId?.trim() || !input.diagnosticRunId?.trim()) {
    throw new FounderCaseDraftStoreError(
      "invalid_payload",
      "caseId y diagnosticRunId son obligatorios.",
    );
  }

  const existing = await getFounderCaseDraft(input.caseId, input.diagnosticRunId);
  const now = new Date().toISOString();

  const record: FounderCaseDraftRecord = {
    caseId: input.caseId,
    diagnosticRunId: input.diagnosticRunId,
    runNumber: input.runNumber ?? existing?.runNumber ?? 1,
    source: FOUNDER_CASE_DRAFT_SOURCE,
    route: FOUNDER_CASE_DRAFT_ROUTE,
    questionnaireVersion: FOUNDER_CASE_QUESTIONNAIRE_VERSION,
    status: input.status,
    rawAnswers: input.rawAnswers,
    builtUserIntake: input.builtUserIntake ?? existing?.builtUserIntake,
    createdAt: existing?.createdAt ?? input.createdAt ?? now,
    updatedAt: now,
    submittedAt: input.submittedAt ?? existing?.submittedAt,
    archiveId:
      input.archiveId !== undefined ? input.archiveId : (existing?.archiveId ?? null),
    analysisResultSummary:
      input.analysisResultSummary ?? existing?.analysisResultSummary,
    analysisResultFull: input.analysisResultFull ?? existing?.analysisResultFull,
    errorSummary:
      input.errorSummary !== undefined
        ? input.errorSummary
        : (existing?.errorSummary ?? null),
    shouldBecomeLearnedCase: false,
    learningDisposition:
      input.learningDisposition ??
      existing?.learningDisposition ??
      "raw_human_case",
    privacy: {
      containsPersonalNarrative: true,
      storage: "private_blob",
      publicExposure: false,
    },
    clientMeta: {
      ...existing?.clientMeta,
      ...input.clientMeta,
    },
  };

  try {
    if (isVercelBlobConfigured()) {
      await writeDraftToBlob(record);
    } else {
      await writeDraftToJsonl(record);
    }
  } catch (error) {
    throw new FounderCaseDraftStoreError(
      "write_failed",
      error instanceof Error ? error.message : "Error al guardar draft pionero",
    );
  }

  return record;
}

export async function getFounderCaseDraftPublicStatus(params: {
  caseId: string;
  diagnosticRunId?: string;
}): Promise<FounderCaseDraftStatusPublic> {
  const empty: FounderCaseDraftStatusPublic = {
    exists: false,
    caseId: params.caseId,
    diagnosticRunId: params.diagnosticRunId ?? null,
    status: null,
    updatedAt: null,
    submittedAt: null,
    archiveId: null,
    source: null,
    questionnaireVersion: null,
    runNumber: null,
  };

  const record = params.diagnosticRunId
    ? await getFounderCaseDraft(params.caseId, params.diagnosticRunId)
    : await findLatestDraftForCase(params.caseId);

  if (!record) return empty;

  return {
    exists: true,
    caseId: record.caseId,
    diagnosticRunId: record.diagnosticRunId,
    status: record.status,
    updatedAt: record.updatedAt,
    submittedAt: record.submittedAt ?? null,
    archiveId: record.archiveId ?? null,
    source: record.source,
    questionnaireVersion: record.questionnaireVersion,
    runNumber: record.runNumber ?? null,
  };
}
