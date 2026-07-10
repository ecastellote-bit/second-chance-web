import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { get, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import type {
  TelemetryDailyAggregate,
  TelemetryEventRecord,
  TelemetrySampleEvent,
} from "./types";

const RAW_BLOB_PREFIX = "telemetry-events";
const DAILY_BLOB_PREFIX = "telemetry-daily";
const MAX_SAMPLE_EVENTS = 50;

export type TelemetryStoreMeta = {
  backend: "blob" | "local_jsonl";
  durable: boolean;
};

export function getTelemetryStoreMeta(): TelemetryStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || process.env.VERCEL !== "1",
  };
}

export function telemetryDateFromIso(timestamp: string): string {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

function localTelemetryDir(): string {
  return path.join(process.cwd(), "data", "telemetry");
}

function localEventsPath(date: string): string {
  return path.join(localTelemetryDir(), `events-${date}.jsonl`);
}

function localDailyPath(date: string): string {
  return path.join(localTelemetryDir(), `daily-${date}.json`);
}

function rawEventBlobPath(date: string, eventId: string): string {
  return `${RAW_BLOB_PREFIX}/${date}/${eventId}.json`;
}

function dailyAggregateBlobPath(date: string): string {
  return `${DAILY_BLOB_PREFIX}/${date}.json`;
}

function emptyAggregate(date: string): TelemetryDailyAggregate {
  return {
    date,
    totalEvents: 0,
    byName: {},
    byPath: {},
    bySource: {},
    updatedAt: new Date().toISOString(),
    lastEventAt: null,
    sampleRecentEvents: [],
  };
}

function bump(map: Record<string, number>, key: string): void {
  map[key] = (map[key] ?? 0) + 1;
}

function toSample(event: TelemetryEventRecord): TelemetrySampleEvent {
  return {
    eventId: event.eventId,
    name: event.name,
    path: event.path,
    timestamp: event.timestamp,
    properties: event.properties,
  };
}

function applyEventToAggregate(
  aggregate: TelemetryDailyAggregate,
  event: TelemetryEventRecord,
): TelemetryDailyAggregate {
  const next: TelemetryDailyAggregate = {
    ...aggregate,
    totalEvents: aggregate.totalEvents + 1,
    byName: { ...aggregate.byName },
    byPath: { ...aggregate.byPath },
    bySource: { ...aggregate.bySource },
    updatedAt: new Date().toISOString(),
    lastEventAt: event.timestamp,
    sampleRecentEvents: [...aggregate.sampleRecentEvents],
  };

  bump(next.byName, event.name);
  bump(next.byPath, event.path);
  bump(next.bySource, event.source);

  next.sampleRecentEvents.unshift(toSample(event));
  if (next.sampleRecentEvents.length > MAX_SAMPLE_EVENTS) {
    next.sampleRecentEvents = next.sampleRecentEvents.slice(0, MAX_SAMPLE_EVENTS);
  }

  return next;
}

async function readDailyAggregateLocal(date: string): Promise<TelemetryDailyAggregate> {
  try {
    const raw = await readFile(localDailyPath(date), "utf8");
    const parsed = JSON.parse(raw) as TelemetryDailyAggregate;
    if (parsed?.date === date) return parsed;
  } catch {
    // missing or corrupt
  }
  return emptyAggregate(date);
}

async function writeDailyAggregateLocal(
  aggregate: TelemetryDailyAggregate,
): Promise<void> {
  const dir = localTelemetryDir();
  await mkdir(dir, { recursive: true });
  await writeFile(localDailyPath(aggregate.date), JSON.stringify(aggregate), "utf8");
}

async function appendRawEventLocal(event: TelemetryEventRecord): Promise<void> {
  const date = telemetryDateFromIso(event.timestamp);
  const dir = localTelemetryDir();
  await mkdir(dir, { recursive: true });
  await appendFile(localEventsPath(date), `${JSON.stringify(event)}\n`, "utf8");
}

async function readDailyAggregateBlob(date: string): Promise<TelemetryDailyAggregate> {
  try {
    const result = await get(dailyAggregateBlobPath(date), { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return emptyAggregate(date);
    }
    const parsed = JSON.parse(await new Response(result.stream).text()) as TelemetryDailyAggregate;
    if (parsed?.date === date) return parsed;
  } catch {
    // missing
  }
  return emptyAggregate(date);
}

async function writeDailyAggregateBlob(aggregate: TelemetryDailyAggregate): Promise<void> {
  await put(dailyAggregateBlobPath(aggregate.date), JSON.stringify(aggregate), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function writeRawEventBlob(event: TelemetryEventRecord): Promise<void> {
  const date = telemetryDateFromIso(event.timestamp);
  await put(rawEventBlobPath(date, event.eventId), JSON.stringify(event), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: false,
  });
}

export function buildTelemetryEventId(): string {
  return crypto.randomUUID();
}

export async function persistTelemetryEvent(
  event: TelemetryEventRecord,
): Promise<void> {
  const date = telemetryDateFromIso(event.timestamp);
  const meta = getTelemetryStoreMeta();

  if (meta.backend === "blob") {
    const aggregate = await readDailyAggregateBlob(date);
    const updated = applyEventToAggregate(aggregate, event);
    await writeRawEventBlob(event);
    await writeDailyAggregateBlob(updated);
    return;
  }

  const aggregate = await readDailyAggregateLocal(date);
  const updated = applyEventToAggregate(aggregate, event);
  await appendRawEventLocal(event);
  await writeDailyAggregateLocal(updated);
}

export async function readTelemetryDailyAggregate(
  date: string,
): Promise<TelemetryDailyAggregate | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const meta = getTelemetryStoreMeta();
  if (meta.backend === "blob") {
    const aggregate = await readDailyAggregateBlob(date);
    return aggregate.totalEvents > 0 || aggregate.lastEventAt ? aggregate : aggregate;
  }

  return readDailyAggregateLocal(date);
}
