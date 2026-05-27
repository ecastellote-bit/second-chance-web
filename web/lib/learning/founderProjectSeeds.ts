import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";
import { getFoundationalCohortBatch } from "./foundationalCohort";

export type FounderProjectSeedStatus = "pending_review" | "published" | "hidden";

export type FounderProjectSeed = {
  recordType: "founder_project_seed";
  seedId: string;
  archiveId: string | null;
  userId: string | null;
  cohortBatch: string;
  title: string;
  summary: string;
  visibilityTier: "founding_priority_6mo";
  createdAt: string;
  status: FounderProjectSeedStatus;
  /** ISO timestamp when the project became publicly visible in the barrio. */
  publishedAt?: string | null;
  /** ISO timestamp of the last visibility/status change. */
  statusUpdatedAt?: string | null;
};

export type ListFounderProjectSeedsOptions = {
  limit?: number;
  cohortBatch?: string;
  userId?: string;
  status?: FounderProjectSeedStatus | FounderProjectSeedStatus[];
  /** Only seeds approved for public barrio listing. */
  visibility?: "public";
};

const BLOB_PREFIX = "founder-project-seeds";
const MANIFEST_BLOB_PATH = `${BLOB_PREFIX}/_manifest.json`;

const PUBLIC_STATUSES: FounderProjectSeedStatus[] = ["published"];

type FounderProjectSeedManifest = {
  recordType: "founder_project_seed_manifest";
  seedIds: string[];
  updatedAt: string;
};

export type FounderProjectSeedStoreMeta = {
  backend: "blob" | "local_jsonl";
  /** True when writes are expected to survive cross-device (Blob prod or local dev). */
  durable: boolean;
  requiresBlob: boolean;
  blobConfigured: boolean;
};

export type FounderProjectSeedStoreStatus = FounderProjectSeedStoreMeta & {
  manifestSeedCount: number;
  blobListCount: number;
};

export class FounderProjectSeedStoreError extends Error {
  readonly code: "blob_not_configured" | "store_unavailable";

  constructor(code: FounderProjectSeedStoreError["code"], message?: string) {
    super(message ?? code);
    this.name = "FounderProjectSeedStoreError";
    this.code = code;
  }
}

export function getFounderProjectSeedStoreMeta(): FounderProjectSeedStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  const needsBlob = requiresVercelBlob();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || !needsBlob,
    requiresBlob: needsBlob,
    blobConfigured,
  };
}

function assertFounderProjectSeedDurableStore(operation: string): void {
  try {
    assertVercelBlobForProduction(`founder_project_seeds:${operation}`);
  } catch {
    throw new FounderProjectSeedStoreError(
      "blob_not_configured",
      `blob_not_configured:founder_project_seeds:${operation}`,
    );
  }
}

function seedsPath(): string {
  return path.join(process.cwd(), "data", "founder-project-seeds.jsonl");
}

function seedBlobPath(seedId: string): string {
  return `${BLOB_PREFIX}/${seedId}.json`;
}

function normalizeSeed(raw: FounderProjectSeed): FounderProjectSeed {
  const status =
    raw.status === "published" || raw.status === "hidden" || raw.status === "pending_review"
      ? raw.status
      : "pending_review";
  return {
    ...raw,
    recordType: "founder_project_seed",
    status,
    publishedAt: raw.publishedAt ?? null,
    statusUpdatedAt: raw.statusUpdatedAt ?? raw.createdAt,
  };
}

function parseSeedPayload(raw: string): FounderProjectSeed | null {
  try {
    const parsed = JSON.parse(raw) as FounderProjectSeed;
    if (!parsed?.seedId || typeof parsed.title !== "string") return null;
    if (
      parsed.recordType &&
      parsed.recordType !== "founder_project_seed"
    ) {
      return null;
    }
    return normalizeSeed(parsed);
  } catch {
    return null;
  }
}

async function readSeedFromBlobPath(pathname: string): Promise<FounderProjectSeed | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return parseSeedPayload(raw);
  } catch {
    return null;
  }
}

async function readSeedFromBlob(seedId: string): Promise<FounderProjectSeed | null> {
  return readSeedFromBlobPath(seedBlobPath(seedId));
}

async function readManifestFromBlob(): Promise<string[]> {
  try {
    const result = await get(MANIFEST_BLOB_PATH, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return [];
    const raw = await new Response(result.stream).text();
    const parsed = JSON.parse(raw) as FounderProjectSeedManifest;
    if (parsed.recordType !== "founder_project_seed_manifest") return [];
    return Array.isArray(parsed.seedIds)
      ? parsed.seedIds.filter((id) => typeof id === "string" && id.trim())
      : [];
  } catch {
    return [];
  }
}

async function writeManifestToBlob(seedIds: string[]): Promise<void> {
  const unique = [...new Set(seedIds.filter(Boolean))];
  const manifest: FounderProjectSeedManifest = {
    recordType: "founder_project_seed_manifest",
    seedIds: unique,
    updatedAt: new Date().toISOString(),
  };
  await put(MANIFEST_BLOB_PATH, JSON.stringify(manifest), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function registerSeedInManifest(seedId: string): Promise<void> {
  const existing = await readManifestFromBlob();
  if (existing.includes(seedId)) return;
  await writeManifestToBlob([...existing, seedId]);
}

function extractSeedIdFromBlobPath(pathname: string): string | null {
  const match = pathname.match(/founder-project-seeds\/(.+)\.json$/);
  if (!match?.[1] || match[1] === "_manifest") return null;
  return match[1];
}

async function listSeedIdsFromBlobScan(): Promise<string[]> {
  const ids = new Set<string>();
  let cursor: string | undefined;

  do {
    const page = await list({
      prefix: `${BLOB_PREFIX}/`,
      limit: 1000,
      cursor,
    });

    for (const blob of page.blobs) {
      const seedId = extractSeedIdFromBlobPath(blob.pathname);
      if (seedId) ids.add(seedId);
    }

    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return [...ids];
}

async function listSeedsFromBlob(): Promise<FounderProjectSeed[]> {
  let manifestIds = await readManifestFromBlob();

  if (manifestIds.length === 0) {
    manifestIds = await listSeedIdsFromBlobScan();
    if (manifestIds.length > 0) {
      await writeManifestToBlob(manifestIds).catch(() => {});
    }
  }

  const seeds: FounderProjectSeed[] = [];
  for (const seedId of manifestIds) {
    const seed = await readSeedFromBlob(seedId);
    if (seed) seeds.push(seed);
  }

  if (seeds.length > 0) {
    return seeds.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const scannedIds = await listSeedIdsFromBlobScan();
  for (const seedId of scannedIds) {
    const seed = await readSeedFromBlob(seedId);
    if (seed) seeds.push(seed);
  }

  if (scannedIds.length > 0) {
    await writeManifestToBlob(scannedIds).catch(() => {});
  }

  return seeds.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getFounderProjectSeedStoreStatus(): Promise<FounderProjectSeedStoreStatus> {
  const meta = getFounderProjectSeedStoreMeta();

  if (!meta.blobConfigured) {
    if (meta.requiresBlob) {
      return {
        ...meta,
        manifestSeedCount: 0,
        blobListCount: 0,
      };
    }
    const local = await readAllSeedsFromLocal();
    return {
      ...meta,
      manifestSeedCount: local.length,
      blobListCount: 0,
    };
  }

  const manifestIds = await readManifestFromBlob();
  const scannedIds = await listSeedIdsFromBlobScan();

  return {
    ...meta,
    manifestSeedCount: manifestIds.length,
    blobListCount: scannedIds.length,
  };
}

async function writeSeedToBlob(record: FounderProjectSeed): Promise<void> {
  await put(seedBlobPath(record.seedId), JSON.stringify(normalizeSeed(record)), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function readAllSeedsFromLocal(): Promise<FounderProjectSeed[]> {
  const filePath = seedsPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const byId = new Map<string, FounderProjectSeed>();
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      const parsed = JSON.parse(line) as FounderProjectSeed;
      if (parsed.recordType === "founder_project_seed" && parsed.seedId) {
        byId.set(parsed.seedId, normalizeSeed(parsed));
      }
    }
    return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

async function writeSeedToLocal(record: FounderProjectSeed): Promise<void> {
  const normalized = normalizeSeed(record);
  const filePath = seedsPath();
  await mkdir(path.dirname(filePath), { recursive: true });

  const existing = await readAllSeedsFromLocal();
  const next = existing.filter((s) => s.seedId !== normalized.seedId);
  next.push(normalized);
  next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const body = next.map((s) => JSON.stringify(s)).join("\n");
  await writeFile(filePath, body ? `${body}\n` : "", "utf8");
}

function matchesStatusFilter(
  seed: FounderProjectSeed,
  status?: FounderProjectSeedStatus | FounderProjectSeedStatus[],
): boolean {
  if (!status) return true;
  const allowed = Array.isArray(status) ? status : [status];
  return allowed.includes(seed.status);
}

function filterSeeds(
  seeds: FounderProjectSeed[],
  options: ListFounderProjectSeedsOptions,
): FounderProjectSeed[] {
  const limit = options.limit ?? 200;
  let filtered = seeds;

  if (options.visibility === "public") {
    filtered = filtered.filter((s) => PUBLIC_STATUSES.includes(s.status));
  }

  if (options.cohortBatch) {
    filtered = filtered.filter((s) => s.cohortBatch === options.cohortBatch);
  }

  if (options.userId) {
    filtered = filtered.filter((s) => s.userId === options.userId);
  }

  if (options.status) {
    filtered = filtered.filter((s) => matchesStatusFilter(s, options.status));
  }

  return filtered.slice(0, limit);
}

export async function readFounderProjectSeed(
  seedId: string,
): Promise<FounderProjectSeed | null> {
  const trimmed = seedId.trim();
  if (!trimmed) return null;

  assertFounderProjectSeedDurableStore("read");

  if (isVercelBlobConfigured()) {
    return readSeedFromBlob(trimmed);
  }

  const seeds = await readAllSeedsFromLocal();
  return seeds.find((s) => s.seedId === trimmed) ?? null;
}

export async function appendFounderProjectSeed(
  input: Omit<
    FounderProjectSeed,
    | "recordType"
    | "seedId"
    | "createdAt"
    | "status"
    | "visibilityTier"
    | "cohortBatch"
    | "publishedAt"
    | "statusUpdatedAt"
  > & {
    cohortBatch?: string;
    userId?: string | null;
  },
): Promise<FounderProjectSeed> {
  assertFounderProjectSeedDurableStore("create");

  const now = new Date().toISOString();
  const record: FounderProjectSeed = {
    recordType: "founder_project_seed",
    seedId: `seed_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    archiveId: input.archiveId,
    userId: input.userId ?? null,
    cohortBatch: input.cohortBatch ?? getFoundationalCohortBatch(),
    title: input.title.trim(),
    summary: input.summary.trim(),
    visibilityTier: "founding_priority_6mo",
    createdAt: now,
    status: "pending_review",
    publishedAt: null,
    statusUpdatedAt: now,
  };

  if (isVercelBlobConfigured()) {
    await writeSeedToBlob(record);
    await registerSeedInManifest(record.seedId).catch(() => {});
    return record;
  }

  await writeSeedToLocal(record);
  return record;
}

export async function updateFounderProjectSeedStatus(
  seedId: string,
  status: FounderProjectSeedStatus,
): Promise<FounderProjectSeed | null> {
  assertFounderProjectSeedDurableStore("update");

  const existing = await readFounderProjectSeed(seedId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: FounderProjectSeed = {
    ...existing,
    status,
    statusUpdatedAt: now,
    publishedAt:
      status === "published"
        ? existing.publishedAt ?? now
        : status === "pending_review"
          ? null
          : existing.publishedAt ?? null,
  };

  if (isVercelBlobConfigured()) {
    await writeSeedToBlob(updated);
    await registerSeedInManifest(updated.seedId).catch(() => {});
    return updated;
  }

  await writeSeedToLocal(updated);
  return updated;
}

export async function listFounderProjectSeeds(
  options: ListFounderProjectSeedsOptions = {},
): Promise<FounderProjectSeed[]> {
  assertFounderProjectSeedDurableStore("list");

  const limit = Math.min(options.limit ?? 200, 1000);

  if (isVercelBlobConfigured()) {
    const seeds = await listSeedsFromBlob();
    return filterSeeds(seeds, { ...options, limit });
  }

  const seeds = await readAllSeedsFromLocal();
  return filterSeeds(seeds, { ...options, limit });
}

export function canViewFounderProjectSeed(
  seed: FounderProjectSeed,
  viewerUserId?: string | null,
): boolean {
  if (seed.status === "published") return true;
  const viewer = viewerUserId?.trim();
  if (!viewer || !seed.userId) return false;
  return seed.userId === viewer;
}
