import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
} from "@/lib/storage/vercelBlobEnv";
import type { FounderExitFeedbackOptionId, FounderExitSubmitMode } from "@/lib/content/fundadorExitCopy";
import { resolveFounderExitSubmitMode } from "@/lib/content/fundadorExitCopy";

export type { FounderExitSubmitMode };

export type FounderExitFeedbackRecord = {
  recordType: "founder_exit_feedback";
  feedbackId: string;
  selectedOption: FounderExitFeedbackOptionId | null;
  submitMode: FounderExitSubmitMode;
  freeText?: string | null;
  freeTextLength: number;
  sessionId?: string | null;
  path?: string | null;
  exitTrigger?: string | null;
  createdAt: string;
  status: "new" | "reviewed" | "archived";
};

export class FounderExitFeedbackStoreError extends Error {
  readonly code: "blob_not_configured" | "store_unavailable";

  constructor(code: FounderExitFeedbackStoreError["code"], message?: string) {
    super(message ?? code);
    this.name = "FounderExitFeedbackStoreError";
    this.code = code;
  }
}

const BLOB_PREFIX = "founder-exit-feedback";

function localPath(): string {
  return path.join(process.cwd(), "data", "founder-exit-feedback.jsonl");
}

function blobPath(id: string): string {
  return `${BLOB_PREFIX}/${id}.json`;
}

function assertStore(operation: string): void {
  try {
    assertVercelBlobForProduction(`founder_exit_feedback:${operation}`);
  } catch {
    throw new FounderExitFeedbackStoreError(
      "blob_not_configured",
      `blob_not_configured:founder_exit_feedback:${operation}`,
    );
  }
}

function parseLine(raw: string): FounderExitFeedbackRecord | null {
  try {
    const parsed = JSON.parse(raw) as FounderExitFeedbackRecord;
    if (!parsed?.feedbackId) return null;
    if (parsed.recordType && parsed.recordType !== "founder_exit_feedback") return null;
    const hasOption = Boolean(parsed.selectedOption);
    const hasText = (parsed.freeTextLength ?? 0) > 0 || Boolean(parsed.freeText?.trim());
    if (!hasOption && !hasText) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeBlob(record: FounderExitFeedbackRecord): Promise<void> {
  await put(blobPath(record.feedbackId), JSON.stringify(record), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function readRecordFromBlobPath(pathname: string): Promise<FounderExitFeedbackRecord | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return parseLine(raw);
  } catch {
    return null;
  }
}

async function readAllFromLocal(): Promise<FounderExitFeedbackRecord[]> {
  const filePath = localPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const byId = new Map<string, FounderExitFeedbackRecord>();
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      const parsed = parseLine(line);
      if (parsed) byId.set(parsed.feedbackId, parsed);
    }
    return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

async function writeLocal(record: FounderExitFeedbackRecord): Promise<void> {
  const filePath = localPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  let existing: FounderExitFeedbackRecord[] = [];
  try {
    const raw = await readFile(filePath, "utf8");
    existing = raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map(parseLine)
      .filter(Boolean) as FounderExitFeedbackRecord[];
  } catch {
    existing = [];
  }
  const next = existing.filter((r) => r.feedbackId !== record.feedbackId);
  next.push(record);
  await writeFile(
    filePath,
    `${next.map((r) => JSON.stringify(r)).join("\n")}\n`,
    "utf8",
  );
}

export async function createFounderExitFeedback(input: {
  selectedOption?: FounderExitFeedbackOptionId | null;
  freeText?: string | null;
  sessionId?: string | null;
  path?: string | null;
  exitTrigger?: string | null;
}): Promise<FounderExitFeedbackRecord> {
  assertStore("create");
  const freeText = input.freeText?.trim().slice(0, 500) ?? null;
  const selectedOption = input.selectedOption ?? null;
  const record: FounderExitFeedbackRecord = {
    recordType: "founder_exit_feedback",
    feedbackId: `fef_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    selectedOption,
    submitMode: resolveFounderExitSubmitMode(selectedOption, freeText),
    freeText: freeText || null,
    freeTextLength: freeText?.length ?? 0,
    sessionId: input.sessionId ?? null,
    path: input.path ?? null,
    exitTrigger: input.exitTrigger ?? null,
    createdAt: new Date().toISOString(),
    status: "new",
  };

  if (isVercelBlobConfigured()) {
    await writeBlob(record);
  } else {
    await writeLocal(record);
  }

  return record;
}

export function getFounderExitFeedbackStoreMeta(): {
  backend: "blob" | "local_jsonl";
  durable: boolean;
  blobConfigured: boolean;
} {
  const blobConfigured = isVercelBlobConfigured();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured,
    blobConfigured,
  };
}

export async function listFounderExitFeedback(): Promise<FounderExitFeedbackRecord[]> {
  if (isVercelBlobConfigured()) {
    const records: FounderExitFeedbackRecord[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: `${BLOB_PREFIX}/`, limit: 1000, cursor });
      for (const blob of page.blobs) {
        const match = blob.pathname.match(/founder-exit-feedback\/(.+)\.json$/);
        if (!match?.[1]) continue;
        const record = await readRecordFromBlobPath(blob.pathname);
        if (record) records.push(record);
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return readAllFromLocal();
}
