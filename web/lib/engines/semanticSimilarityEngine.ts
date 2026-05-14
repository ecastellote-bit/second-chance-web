import OpenAI from "openai";
import type { LearnedDiagnosticCase } from "../types/learning";
import type { SimilarCaseMatch } from "../types/learning";
import { LEARNED_DIAGNOSTIC_CASES } from "../learning/learnedCases";
import { archivedCasesToLearnedFormat } from "./learningCycleEnricher";

export type SemanticSimilarityResult = {
  ok: boolean;
  matches: SemanticCaseMatch[];
  latencyMs: number;
  error?: string;
};

export type SemanticCaseMatch = {
  caseId: string;
  title: string;
  similarity: number;
  expectedPrimaryFamily: string;
  acceptableFamilies: string[];
  rivalFamilies: string[];
  lesson: string;
  shouldInfluenceFutureCases: boolean;
};

const embeddingCache = new Map<string, number[]>();

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function buildCaseText(c: LearnedDiagnosticCase): string {
  return [c.inputText, c.keyHumanLanguage.join(", ")].join(" ");
}

async function getEmbeddings(
  client: OpenAI,
  texts: string[],
): Promise<number[][]> {
  const truncated = texts.map((t) => t.slice(0, 2000));

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: truncated,
  });

  return response.data.map((d) => d.embedding);
}

async function getOrComputeCaseEmbeddings(
  client: OpenAI,
  cases: LearnedDiagnosticCase[],
): Promise<Map<string, number[]>> {
  const uncached: { index: number; text: string; id: string }[] = [];

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    if (!embeddingCache.has(c.id)) {
      uncached.push({ index: i, text: buildCaseText(c), id: c.id });
    }
  }

  if (uncached.length > 0) {
    const batchSize = 50;
    for (let start = 0; start < uncached.length; start += batchSize) {
      const batch = uncached.slice(start, start + batchSize);
      const embeddings = await getEmbeddings(
        client,
        batch.map((b) => b.text),
      );

      for (let i = 0; i < batch.length; i++) {
        embeddingCache.set(batch[i].id, embeddings[i]);
      }
    }
  }

  const result = new Map<string, number[]>();
  for (const c of cases) {
    const emb = embeddingCache.get(c.id);
    if (emb) result.set(c.id, emb);
  }

  return result;
}

export async function findSemanticallySimilarCases(
  userText: string,
  options?: {
    minSimilarity?: number;
    limit?: number;
    cases?: LearnedDiagnosticCase[];
  },
): Promise<SemanticSimilarityResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { ok: false, matches: [], latencyMs: 0, error: "OPENAI_API_KEY not configured" };
  }

  if (!userText || userText.trim().length < 20) {
    return { ok: false, matches: [], latencyMs: 0, error: "Input text too short" };
  }

  const minSimilarity = options?.minSimilarity ?? 0.45;
  const limit = options?.limit ?? 5;
  const cases = options?.cases ?? [
    ...LEARNED_DIAGNOSTIC_CASES,
    ...archivedCasesToLearnedFormat(),
  ];

  const startTime = Date.now();

  try {
    const client = new OpenAI({ apiKey });

    const [userEmbeddings, caseEmbeddings] = await Promise.all([
      getEmbeddings(client, [userText.slice(0, 2000)]),
      getOrComputeCaseEmbeddings(client, cases),
    ]);

    const userEmbedding = userEmbeddings[0];
    const latencyMs = Date.now() - startTime;

    const scored: SemanticCaseMatch[] = cases
      .map((c) => {
        const caseEmb = caseEmbeddings.get(c.id);
        if (!caseEmb) return null;

        const similarity = cosineSimilarity(userEmbedding, caseEmb);

        return {
          caseId: c.id,
          title: c.title,
          similarity: Math.round(similarity * 1000) / 1000,
          expectedPrimaryFamily: c.expectedPrimaryFamily,
          acceptableFamilies: c.acceptableFamilies,
          rivalFamilies: c.rivalFamilies,
          lesson: c.lesson,
          shouldInfluenceFutureCases: c.shouldInfluenceFutureCases,
        };
      })
      .filter((m): m is SemanticCaseMatch => m !== null && m.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return { ok: true, matches: scored, latencyMs };
  } catch (err: any) {
    return {
      ok: false,
      matches: [],
      latencyMs: Date.now() - startTime,
      error: `Embedding API error: ${err?.message ?? String(err)}`,
    };
  }
}

export function mergeSemanticMatchesIntoLearningSignal(
  semanticMatches: SemanticCaseMatch[],
  existingMatches: SimilarCaseMatch[],
): SimilarCaseMatch[] {
  const merged = [...existingMatches];

  for (const sm of semanticMatches) {
    const existing = merged.find((m) => m.caseId === sm.caseId);

    if (existing) {
      existing.similarityScore = Math.max(existing.similarityScore, sm.similarity);
      continue;
    }

    merged.push({
      caseId: sm.caseId,
      title: sm.title,
      similarityScore: sm.similarity,
      expectedPrimaryFamily: sm.expectedPrimaryFamily,
      acceptableFamilies: sm.acceptableFamilies,
      rivalFamilies: sm.rivalFamilies,
      matchedLanguage: [],
      lesson: sm.lesson,
    });
  }

  return merged.sort((a, b) => b.similarityScore - a.similarityScore);
}
