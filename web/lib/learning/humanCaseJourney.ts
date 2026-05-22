/**
 * Telemetría opcional post-diagnóstico (temáticas, activación, barrio).
 * No forma parte del alcance del Human Depot para entrenamiento de jueces.
 * Ver web/docs/human-depot-scope.md
 */
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getCohortBatchFromPayload, getFoundationalCohortBatch } from "./foundationalCohort";
import { findHumanCompleteCaseById } from "./humanCaseDepot";
import type { HumanCasePayload } from "./humanCaseDepot";

export type HumanCaseJourneyStep =
  | "theme_selected"
  | "activation_chosen"
  | "community_door_confirmed";

export type HumanCaseJourneyEvent = {
  recordType: "human_case_journey_event";
  archiveId: string;
  cohortBatch: string | null;
  step: HumanCaseJourneyStep;
  payload: Record<string, unknown>;
  createdAt: string;
};

function journeyPath(): string {
  return path.join(process.cwd(), "data", "human-case-journey.jsonl");
}

export async function appendHumanCaseJourneyEvent(params: {
  archiveId: string;
  step: HumanCaseJourneyStep;
  payload?: Record<string, unknown>;
  cohortBatch?: string | null;
}): Promise<{ appended: true; step: HumanCaseJourneyStep }> {
  const filePath = journeyPath();
  await mkdir(path.dirname(filePath), { recursive: true });

  let cohortBatch = params.cohortBatch ?? null;
  if (!cohortBatch) {
    const complete = await findHumanCompleteCaseById(params.archiveId);
    cohortBatch =
      getCohortBatchFromPayload(complete?.payload as HumanCasePayload | undefined) ??
      getFoundationalCohortBatch();
  }

  const event: HumanCaseJourneyEvent = {
    recordType: "human_case_journey_event",
    archiveId: params.archiveId,
    cohortBatch,
    step: params.step,
    payload: params.payload ?? {},
    createdAt: new Date().toISOString(),
  };

  await appendFile(filePath, `${JSON.stringify(event)}\n`, "utf8");
  return { appended: true, step: params.step };
}

export async function listHumanCaseJourneyEvents(limit = 200): Promise<HumanCaseJourneyEvent[]> {
  const filePath = journeyPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    return lines
      .slice(-limit)
      .map((line) => JSON.parse(line) as HumanCaseJourneyEvent)
      .reverse();
  } catch {
    return [];
  }
}
