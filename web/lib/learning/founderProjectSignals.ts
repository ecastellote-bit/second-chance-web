import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";

export type FounderProjectSignalType =
  | "project_follow_close"
  | "project_interest"
  | "project_possible_contribution"
  | "project_join_exploration";

export type FounderProjectSignalStatus =
  | "active"
  | "withdrawn"
  | "updated"
  | "reviewed"
  | "flagged";

export type FounderProjectSignalSource =
  | "project_page"
  | "projects_list"
  | "activation";

export type FounderProjectSignal = {
  recordType: "founder_project_signal";
  signalId: string;
  projectId: string;
  projectTitle: string;
  actorUserId: string;
  signalType: FounderProjectSignalType;
  capabilities?: string[];
  status: FounderProjectSignalStatus;
  createdAt: string;
  updatedAt?: string;
  source: FounderProjectSignalSource;
  dedupeKey: string;
};

export type FounderProjectSignalStoreMeta = {
  backend: "blob" | "local_jsonl";
  durable: boolean;
  requiresBlob: boolean;
  blobConfigured: boolean;
};

export class FounderProjectSignalStoreError extends Error {
  readonly code: "blob_not_configured" | "store_unavailable";

  constructor(code: FounderProjectSignalStoreError["code"], message?: string) {
    super(message ?? code);
    this.name = "FounderProjectSignalStoreError";
    this.code = code;
  }
}

export function getFounderProjectSignalStoreMeta(): FounderProjectSignalStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  const needsBlob = requiresVercelBlob();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || !needsBlob,
    requiresBlob: needsBlob,
    blobConfigured,
  };
}

function assertFounderProjectSignalDurableStore(operation: string): void {
  try {
    assertVercelBlobForProduction(`founder_project_signals:${operation}`);
  } catch {
    throw new FounderProjectSignalStoreError(
      "blob_not_configured",
      `blob_not_configured:founder_project_signals:${operation}`,
    );
  }
}

const BLOB_PREFIX = "founder-project-signals";

function localSignalsPath(): string {
  return path.join(process.cwd(), "data", "founder-project-signals.jsonl");
}

function signalBlobPath(signalId: string): string {
  return `${BLOB_PREFIX}/${signalId}.json`;
}

function normalizeSignal(raw: FounderProjectSignal): FounderProjectSignal {
  return {
    ...raw,
    recordType: "founder_project_signal",
    capabilities: Array.isArray(raw.capabilities)
      ? [...new Set(raw.capabilities.map((c) => c.trim()).filter(Boolean))]
      : [],
  };
}

function parseSignal(raw: string): FounderProjectSignal | null {
  try {
    const parsed = JSON.parse(raw) as FounderProjectSignal;
    if (!parsed.signalId || !parsed.projectId || !parsed.actorUserId) return null;
    if (
      parsed.recordType &&
      parsed.recordType !== "founder_project_signal"
    ) {
      return null;
    }
    return normalizeSignal(parsed);
  } catch {
    return null;
  }
}

async function readSignalFromBlobPath(pathname: string): Promise<FounderProjectSignal | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return parseSignal(raw);
  } catch {
    return null;
  }
}

async function writeSignalToBlob(record: FounderProjectSignal): Promise<void> {
  await put(signalBlobPath(record.signalId), JSON.stringify(normalizeSignal(record)), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function listSignalsFromBlob(): Promise<FounderProjectSignal[]> {
  const signals: FounderProjectSignal[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({
      prefix: `${BLOB_PREFIX}/`,
      limit: 1000,
      cursor,
    });

    for (const blob of page.blobs) {
      const match = blob.pathname.match(/founder-project-signals\/(.+)\.json$/);
      if (!match?.[1]) continue;
      const signal = await readSignalFromBlobPath(blob.pathname);
      if (signal) signals.push(signal);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return signals.sort((a, b) =>
    (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
  );
}

async function readAllSignalsFromLocal(): Promise<FounderProjectSignal[]> {
  const filePath = localSignalsPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const byId = new Map<string, FounderProjectSignal>();
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      const parsed = parseSignal(line);
      if (parsed) byId.set(parsed.signalId, parsed);
    }
    return [...byId.values()].sort((a, b) =>
      (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
    );
  } catch {
    return [];
  }
}

async function writeSignalToLocal(record: FounderProjectSignal): Promise<void> {
  const filePath = localSignalsPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readAllSignalsFromLocal();
  const next = existing.filter((item) => item.signalId !== record.signalId);
  next.push(normalizeSignal(record));
  next.sort((a, b) =>
    (a.updatedAt ?? a.createdAt).localeCompare(b.updatedAt ?? b.createdAt),
  );
  const body = next.map((item) => JSON.stringify(item)).join("\n");
  await writeFile(filePath, body ? `${body}\n` : "", "utf8");
}

function uniqueCapabilities(input?: string[]): string[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map((item) => item.trim()).filter(Boolean))];
}

export function founderProjectSignalDedupeKey(input: {
  actorUserId: string;
  projectId: string;
  signalType: FounderProjectSignalType;
}): string {
  return `${input.actorUserId}:${input.projectId}:${input.signalType}`;
}

export async function listFounderProjectSignals(options?: {
  projectId?: string;
  actorUserId?: string;
  signalType?: FounderProjectSignalType;
  status?: FounderProjectSignalStatus | FounderProjectSignalStatus[];
  limit?: number;
}): Promise<FounderProjectSignal[]> {
  assertFounderProjectSignalDurableStore("list");

  const signals = isVercelBlobConfigured()
    ? await listSignalsFromBlob()
    : await readAllSignalsFromLocal();

  const limit = Math.min(options?.limit ?? 300, 2000);
  const allowedStatuses = options?.status
    ? Array.isArray(options.status)
      ? options.status
      : [options.status]
    : null;

  return signals
    .filter((item) => (options?.projectId ? item.projectId === options.projectId : true))
    .filter((item) => (options?.actorUserId ? item.actorUserId === options.actorUserId : true))
    .filter((item) => (options?.signalType ? item.signalType === options.signalType : true))
    .filter((item) => (allowedStatuses ? allowedStatuses.includes(item.status) : true))
    .slice(0, limit);
}

export async function upsertFounderProjectSignal(input: {
  projectId: string;
  projectTitle: string;
  actorUserId: string;
  signalType: FounderProjectSignalType;
  source: FounderProjectSignalSource;
  capabilities?: string[];
}): Promise<{ signal: FounderProjectSignal; deduped: boolean; updated: boolean }> {
  assertFounderProjectSignalDurableStore("upsert");

  const dedupeKey = founderProjectSignalDedupeKey({
    actorUserId: input.actorUserId,
    projectId: input.projectId,
    signalType: input.signalType,
  });
  const all = await listFounderProjectSignals({ limit: 5000 });
  const existing = all.find(
    (item) => item.dedupeKey === dedupeKey && item.status !== "withdrawn",
  );

  if (existing) {
    if (input.signalType === "project_possible_contribution") {
      const nextCapabilities = uniqueCapabilities(input.capabilities);
      const changed =
        JSON.stringify(nextCapabilities) !==
        JSON.stringify(uniqueCapabilities(existing.capabilities));
      if (changed) {
        const updated: FounderProjectSignal = {
          ...existing,
          capabilities: nextCapabilities,
          status: "updated",
          updatedAt: new Date().toISOString(),
          source: input.source,
          projectTitle: input.projectTitle,
        };
        if (isVercelBlobConfigured()) {
          await writeSignalToBlob(updated);
        } else {
          await writeSignalToLocal(updated);
        }
        return { signal: updated, deduped: true, updated: true };
      }
    }
    return { signal: existing, deduped: true, updated: false };
  }

  const now = new Date().toISOString();
  const record: FounderProjectSignal = {
    recordType: "founder_project_signal",
    signalId: `sig_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    projectId: input.projectId,
    projectTitle: input.projectTitle,
    actorUserId: input.actorUserId,
    signalType: input.signalType,
    capabilities: uniqueCapabilities(input.capabilities),
    status: "active",
    createdAt: now,
    updatedAt: now,
    source: input.source,
    dedupeKey,
  };

  if (isVercelBlobConfigured()) {
    await writeSignalToBlob(record);
  } else {
    await writeSignalToLocal(record);
  }

  return { signal: record, deduped: false, updated: false };
}

export async function updateFounderProjectSignalStatus(
  signalId: string,
  status: FounderProjectSignalStatus,
): Promise<FounderProjectSignal | null> {
  assertFounderProjectSignalDurableStore("update_status");
  const all = await listFounderProjectSignals({ limit: 5000 });
  const existing = all.find((item) => item.signalId === signalId);
  if (!existing) return null;

  const updated: FounderProjectSignal = {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  };

  if (isVercelBlobConfigured()) {
    await writeSignalToBlob(updated);
  } else {
    await writeSignalToLocal(updated);
  }
  return updated;
}
