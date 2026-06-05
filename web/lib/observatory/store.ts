import { appendFile, mkdir, readFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";
import type { ObservatoryEvent } from "./types";

const EVENTS_FILE = "events.jsonl";
const BLOB_PREFIX = "observatory-events";

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
  const items: ObservatoryEvent[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({ prefix: `${BLOB_PREFIX}/`, limit: 1000, cursor });
    for (const blob of page.blobs) {
      if (!blob.pathname.endsWith(".json")) continue;
      const event = await readFromBlob(blob.pathname);
      if (event) items.push(event);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return items.sort((a, b) => a.at.localeCompare(b.at));
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
