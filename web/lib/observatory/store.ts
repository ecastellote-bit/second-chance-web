import { appendFile, mkdir, readFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import type { ObservatoryEvent } from "./types";

const EVENTS_FILE = "events.jsonl";

export function getObservatoryEventsPath(): string {
  return path.join(process.cwd(), "data", "observatory", EVENTS_FILE);
}

export async function appendObservatoryEvent(event: ObservatoryEvent): Promise<void> {
  const dir = path.join(process.cwd(), "data", "observatory");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, EVENTS_FILE);
  await appendFile(filePath, `${JSON.stringify(event)}\n`, "utf8");
}

export async function readObservatoryEvents(): Promise<ObservatoryEvent[]> {
  const filePath = getObservatoryEventsPath();
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch {
    return [];
  }

  const events: ObservatoryEvent[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as ObservatoryEvent;
      if (parsed?.id && parsed?.at && parsed?.type) {
        events.push(parsed);
      }
    } catch {
      // línea corrupta — omitir
    }
  }
  return events;
}

export function buildObservatoryEvent(
  input: Omit<ObservatoryEvent, "id" | "at"> & { at?: string },
): ObservatoryEvent {
  return {
    id: crypto.randomUUID(),
    at: input.at ?? new Date().toISOString(),
    type: input.type,
    scenario: input.scenario,
    sessionId: input.sessionId,
    payload: input.payload,
  };
}
