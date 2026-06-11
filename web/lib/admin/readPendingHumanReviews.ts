import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type PendingHumanReviewRow = {
  caseId?: string;
  queuedAt: string;
  status?: string;
  triggerResult?: {
    urgency?: string;
    reasons?: string[];
  };
};

const QUEUE_FILE = path.join(process.cwd(), "data", "human-review", "pending-reviews.jsonl");

/** Lectura de cola pendiente — misma fuente que GET /api/human-review-queue, sin mutar lógica. */
export async function readPendingHumanReviews(): Promise<PendingHumanReviewRow[]> {
  if (!existsSync(QUEUE_FILE)) return [];

  const raw = await readFile(QUEUE_FILE, "utf8");
  const rows: PendingHumanReviewRow[] = [];

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as PendingHumanReviewRow;
      if (parsed?.queuedAt && (parsed.status ?? "pending") === "pending") {
        rows.push(parsed);
      }
    } catch {
      // línea corrupta
    }
  }

  return rows;
}
