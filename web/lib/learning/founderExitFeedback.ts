import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";
import type { FounderExitFeedbackOptionId } from "@/lib/content/fundadorExitCopy";

export type FounderExitFeedbackRecord = {
  recordType: "founder_exit_feedback";
  feedbackId: string;
  selectedOption: FounderExitFeedbackOptionId;
  freeText?: string | null;
  freeTextLength: number;
  sessionId?: string | null;
  path?: string | null;
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
    if (!parsed?.feedbackId || !parsed?.selectedOption) return null;
    if (parsed.recordType && parsed.recordType !== "founder_exit_feedback") return null;
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
  selectedOption: FounderExitFeedbackOptionId;
  freeText?: string | null;
  sessionId?: string | null;
  path?: string | null;
}): Promise<FounderExitFeedbackRecord> {
  assertStore("create");
  const freeText = input.freeText?.trim().slice(0, 500) ?? null;
  const record: FounderExitFeedbackRecord = {
    recordType: "founder_exit_feedback",
    feedbackId: `fef_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    selectedOption: input.selectedOption,
    freeText: freeText || null,
    freeTextLength: freeText?.length ?? 0,
    sessionId: input.sessionId ?? null,
    path: input.path ?? null,
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
