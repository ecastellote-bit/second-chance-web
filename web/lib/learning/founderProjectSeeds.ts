import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
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

const PUBLIC_STATUSES: FounderProjectSeedStatus[] = ["published"];

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

async function readSeedFromBlob(seedId: string): Promise<FounderProjectSeed | null> {
  try {
    const result = await get(seedBlobPath(seedId), { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    const parsed = JSON.parse(raw) as FounderProjectSeed;
    if (parsed.recordType !== "founder_project_seed") return null;
    return normalizeSeed(parsed);
  } catch {
    return null;
  }
}

async function listSeedsFromBlob(limit: number): Promise<FounderProjectSeed[]> {
  const { blobs } = await list({
    prefix: `${BLOB_PREFIX}/`,
    limit: Math.min(limit, 1000),
  });

  const seeds: FounderProjectSeed[] = [];
  for (const blob of blobs) {
    const match = blob.pathname.match(/founder-project-seeds\/(.+)\.json$/);
    if (!match) continue;
    const seed = await readSeedFromBlob(match[1]!);
    if (seed) seeds.push(seed);
  }

  return seeds.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
    return record;
  }

  await writeSeedToLocal(record);
  return record;
}

export async function updateFounderProjectSeedStatus(
  seedId: string,
  status: FounderProjectSeedStatus,
): Promise<FounderProjectSeed | null> {
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
    return updated;
  }

  await writeSeedToLocal(updated);
  return updated;
}

export async function listFounderProjectSeeds(
  options: ListFounderProjectSeedsOptions = {},
): Promise<FounderProjectSeed[]> {
  const limit = Math.min(options.limit ?? 200, 1000);

  if (isVercelBlobConfigured()) {
    const seeds = await listSeedsFromBlob(limit);
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
