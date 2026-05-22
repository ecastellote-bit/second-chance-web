import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
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

function seedsPath(): string {
  return path.join(process.cwd(), "data", "founder-project-seeds.jsonl");
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
  const filePath = seedsPath();
  await mkdir(path.dirname(filePath), { recursive: true });

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

  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  return record;
}

export async function listFounderProjectSeeds(limit = 200): Promise<FounderProjectSeed[]> {
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
