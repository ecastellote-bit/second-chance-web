import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import OpenAI from "openai";
import type { LearnedDiagnosticCase } from "../types/learning";

type ArchivedEmbedding = {
  caseId: string;
  embedding: number[];
  computedAt: string;
};

type ArchivedCaseForSimilarity = {
  id: string;
  title: string;
  inputText: string;
  expectedPrimaryFamily: string;
  acceptableFamilies: string[];
  rivalFamilies: string[];
  lesson: string;
  shouldInfluenceFutureCases: boolean;
};

const EMBEDDINGS_CACHE_PATH = resolve(
  process.cwd(),
  "data",
  "learning",
  "embeddings-cache.json",
);

const ARCHIVE_PATH = resolve(
  process.cwd(),
  "data",
  "learning",
  "diagnostic-case-archive.jsonl",
);

let cachedEmbeddings: Map<string, number[]> | null = null;

function loadEmbeddingsCache(): Map<string, number[]> {
  if (cachedEmbeddings) return cachedEmbeddings;

  cachedEmbeddings = new Map();

  if (!existsSync(EMBEDDINGS_CACHE_PATH)) return cachedEmbeddings;

  try {
    const raw = readFileSync(EMBEDDINGS_CACHE_PATH, "utf-8");
    const entries: ArchivedEmbedding[] = JSON.parse(raw);

    for (const entry of entries) {
      cachedEmbeddings.set(entry.caseId, entry.embedding);
    }
  } catch {
    cachedEmbeddings = new Map();
  }

  return cachedEmbeddings;
}

function saveEmbeddingsCache(cache: Map<string, number[]>): void {
  const dir = resolve(process.cwd(), "data", "learning");
  mkdirSync(dir, { recursive: true });

  const entries: ArchivedEmbedding[] = [...cache.entries()].map(([caseId, embedding]) => ({
    caseId,
    embedding,
    computedAt: new Date().toISOString(),
  }));

  writeFileSync(EMBEDDINGS_CACHE_PATH, JSON.stringify(entries), "utf-8");
}

export function loadArchivedCasesForSimilarity(): ArchivedCaseForSimilarity[] {
  if (!existsSync(ARCHIVE_PATH)) return [];

  try {
    const raw = readFileSync(ARCHIVE_PATH, "utf-8");
    const lines = raw.split("\n").filter((line) => line.trim().length > 0);

    return lines
      .map((line) => {
        try {
          const record = JSON.parse(line);

          if (!record.payload?.sourceInput) return null;

          const inputParts: string[] = [];
          const sourceInput = record.payload.sourceInput;

          if (sourceInput?.rawInput?.narrative) {
            const narrative = sourceInput.rawInput.narrative;
            for (const value of Object.values(narrative)) {
              if (typeof value === "string" && value.trim().length > 0) {
                inputParts.push(value.trim());
              }
            }
          } else if (sourceInput?.intake?.narrative) {
            const narrative = sourceInput.intake.narrative;
            for (const value of Object.values(narrative)) {
              if (typeof value === "string" && value.trim().length > 0) {
                inputParts.push(value.trim());
              }
            }
          }

          const inputText = inputParts.join(" ");
          if (inputText.length < 20) return null;

          const primaryFamily =
            record.classification?.primaryFamily ?? "unknown";

          return {
            id: `archive_${record.archiveId}`,
            title: `Archived: ${primaryFamily}`,
            inputText,
            expectedPrimaryFamily: primaryFamily,
            acceptableFamilies: [primaryFamily],
            rivalFamilies: record.classification?.frontierFamilies ?? [],
            lesson: "Case learned from user archive",
            shouldInfluenceFutureCases:
              record.storagePolicy?.shouldInfluenceFutureDiagnosis ?? false,
          } as ArchivedCaseForSimilarity;
        } catch {
          return null;
        }
      })
      .filter((c): c is ArchivedCaseForSimilarity => c !== null);
  } catch {
    return [];
  }
}

export async function computeAndCacheEmbedding(
  caseId: string,
  text: string,
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || text.length < 20) return;

  const cache = loadEmbeddingsCache();

  if (cache.has(caseId)) return;

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: [text.slice(0, 2000)],
    });

    const embedding = response.data[0]?.embedding;
    if (embedding) {
      cache.set(caseId, embedding);
      saveEmbeddingsCache(cache);
    }
  } catch {
    // Non-critical: embedding will be computed on next similarity query
  }
}

export function getPrecomputedEmbeddings(): Map<string, number[]> {
  return loadEmbeddingsCache();
}

export function archivedCasesToLearnedFormat(): LearnedDiagnosticCase[] {
  const archived = loadArchivedCasesForSimilarity();

  return archived.map((c) => ({
    id: c.id,
    title: c.title,
    source: "local_archive" as const,
    language: "es" as const,
    region: "Argentina",
    inputText: c.inputText,
    expectedPrimaryFamily: c.expectedPrimaryFamily,
    acceptableFamilies: c.acceptableFamilies,
    rivalFamilies: c.rivalFamilies,
    keyHumanLanguage: [],
    missingCuesDetected: [],
    verdict: "learning_candidate" as const,
    lesson: c.lesson,
    shouldInfluenceFutureCases: c.shouldInfluenceFutureCases,
  }));
}
