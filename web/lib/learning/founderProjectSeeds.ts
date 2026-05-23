import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import { getFoundationalCohortBatch } from "./foundationalCohort";

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
  status: "pending_review" | "published";
};

const BLOB_PREFIX = "founder-project-seeds";

function seedsPath(): string {
  return path.join(process.cwd(), "data", "founder-project-seeds.jsonl");
}

function seedBlobPath(seedId: string): string {
  return `${BLOB_PREFIX}/${seedId}.json`;
}

async function readSeedFromBlob(seedId: string): Promise<FounderProjectSeed | null> {
  try {
    const result = await get(seedBlobPath(seedId), { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as FounderProjectSeed;
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
    if (seed?.recordType === "founder_project_seed") seeds.push(seed);
  }

  return seeds
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

async function writeSeedToBlob(record: FounderProjectSeed): Promise<void> {
  await put(seedBlobPath(record.seedId), JSON.stringify(record), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
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
  > & {
    cohortBatch?: string;
    userId?: string | null;
  },
): Promise<FounderProjectSeed> {
  const record: FounderProjectSeed = {
    recordType: "founder_project_seed",
    seedId: `seed_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    archiveId: input.archiveId,
    userId: input.userId ?? null,
    cohortBatch: input.cohortBatch ?? getFoundationalCohortBatch(),
    title: input.title.trim(),
    summary: input.summary.trim(),
    visibilityTier: "founding_priority_6mo",
    createdAt: new Date().toISOString(),
    status: "pending_review",
  };

  if (isVercelBlobConfigured()) {
    await writeSeedToBlob(record);
    return record;
  }

  const filePath = seedsPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  return record;
}

export async function listFounderProjectSeeds(limit = 200): Promise<FounderProjectSeed[]> {
  if (isVercelBlobConfigured()) {
    return listSeedsFromBlob(limit);
  }

  const filePath = seedsPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    return lines
      .slice(-limit)
      .map((line) => JSON.parse(line) as FounderProjectSeed)
      .reverse();
  } catch {
    return [];
  }
}
