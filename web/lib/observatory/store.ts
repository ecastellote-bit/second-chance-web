import { appendFile, mkdir, readFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";
import type { ObservatoryEvent } from "./types";
import type { ObservatoryPeriod } from "./types";

const EVENTS_FILE = "events.jsonl";
const BLOB_PREFIX = "observatory-events";

export type ObservatoryBoundedRead = {
  events: ObservatoryEvent[];
  partial: boolean;
  listedBlobs: number;
  timedOut: boolean;
};

function periodFromDate(period: ObservatoryPeriod): Date | null {
  if (period === "all") return null;
  const days = period === "7d" ? 7 : 30;
  const from = new Date();
  from.setDate(from.getDate() - days);
  return from;
}

async function listObservatoryBlobRefs(): Promise<Array<{ pathname: string; uploadedAt: Date }>> {
  const rows: Array<{ pathname: string; uploadedAt: Date }> = [];
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: `${BLOB_PREFIX}/`, limit: 1000, cursor });
    for (const blob of page.blobs) {
      if (!blob.pathname.endsWith(".json")) continue;
      rows.push({ pathname: blob.pathname, uploadedAt: new Date(blob.uploadedAt) });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return rows;
}

export type ObservatoryStoreMeta = {
  backend: "blob" | "local_jsonl";
  durable: boolean;
  blobConfigured: boolean;
};

export function getObservatoryEventsPath(): string {
  return path.join(process.cwd(), "data", "observatory", EVENTS_FILE);
}

export function getObservatoryStoreMeta(): ObservatoryStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || !requiresVercelBlob(),
    blobConfigured,
  };
}

function blobPath(eventId: string): string {
  return `${BLOB_PREFIX}/${eventId}.json`;
}

function parseEvent(raw: string): ObservatoryEvent | null {
  try {
    const parsed = JSON.parse(raw) as ObservatoryEvent;
    if (parsed?.id && parsed?.at && parsed?.type) {
      return parsed;
    }
  } catch {
    // corrupt line
  }
  return null;
}

async function writeToBlob(event: ObservatoryEvent): Promise<void> {
  await put(blobPath(event.id), JSON.stringify(event), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: false,
  });
}

async function readFromBlob(pathname: string): Promise<ObservatoryEvent | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return parseEvent(await new Response(result.stream).text());
  } catch {
    return null;
  }
}

async function listFromBlob(): Promise<ObservatoryEvent[]> {
  const result = await readObservatoryEventsBounded({
    period: "all",
    timeBudgetMs: 120_000,
    maxEvents: 50_000,
  });
  return result.events;
}

export async function readObservatoryEventsBounded(options: {
  period?: ObservatoryPeriod;
  timeBudgetMs?: number;
  maxEvents?: number;
}): Promise<ObservatoryBoundedRead> {
  const { period = "30d", timeBudgetMs = 6500, maxEvents = 2500 } = options;

  if (!isVercelBlobConfigured()) {
    const events = await readFromLocal();
    return {
      events,
      partial: false,
      listedBlobs: events.length,
      timedOut: false,
    };
  }

  const started = Date.now();
  const from = periodFromDate(period);
  const slackMs = 24 * 60 * 60 * 1000;

  const blobs = await listObservatoryBlobRefs();
  const candidates = blobs
    .filter((blob) => !from || blob.uploadedAt.getTime() >= from.getTime() - slackMs)
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  const events: ObservatoryEvent[] = [];
  let fetchedBlobs = 0;
  let timedOut = false;

  for (const blob of candidates) {
    if (events.length >= maxEvents) break;
    if (Date.now() - started >= timeBudgetMs) {
      timedOut = true;
      break;
    }
    const event = await readFromBlob(blob.pathname);
    fetchedBlobs += 1;
    if (event) events.push(event);
  }

  const partial =
    timedOut || fetchedBlobs < candidates.length || events.length >= maxEvents;

  events.sort((a, b) => a.at.localeCompare(b.at));
  return {
    events,
    partial,
    listedBlobs: candidates.length,
    timedOut,
  };
}

async function appendToLocal(event: ObservatoryEvent): Promise<void> {
  const dir = path.join(process.cwd(), "data", "observatory");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, EVENTS_FILE);
  await appendFile(filePath, `${JSON.stringify(event)}\n`, "utf8");
}

async function readFromLocal(): Promise<ObservatoryEvent[]> {
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
    const parsed = parseEvent(trimmed);
    if (parsed) events.push(parsed);
  }
  return events;
}

export async function appendObservatoryEvent(event: ObservatoryEvent): Promise<void> {
  if (isVercelBlobConfigured()) {
    await writeToBlob(event);
    return;
  }
  await appendToLocal(event);
}

export async function readObservatoryEvents(): Promise<ObservatoryEvent[]> {
  if (isVercelBlobConfigured()) {
    return listFromBlob();
  }
  return readFromLocal();
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
