import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";

export type CircleSignalType =
  | "circle_interest"
  | "circle_receive_updates"
  | "circle_access_request"
  | "circle_idea";

export type CircleSignalStatus = "active" | "reviewed" | "flagged" | "archived";

export type CircleSignal = {
  recordType: "circle_signal";
  signalId: string;
  circleId: string;
  circleTitle: string;
  actorUserId: string;
  signalType: CircleSignalType;
  note?: string;
  status: CircleSignalStatus;
  createdAt: string;
  updatedAt?: string;
  dedupeKey: string;
};

export type CircleSignalStoreMeta = {
  backend: "blob" | "local_jsonl";
  durable: boolean;
  requiresBlob: boolean;
  blobConfigured: boolean;
};

export class CircleSignalStoreError extends Error {
  readonly code: "blob_not_configured" | "store_unavailable";

  constructor(code: CircleSignalStoreError["code"], message?: string) {
    super(message ?? code);
    this.name = "CircleSignalStoreError";
    this.code = code;
  }
}

const BLOB_PREFIX = "circle-signals";
const MAX_NOTE_LENGTH = 500;

function localSignalsPath(): string {
  return path.join(process.cwd(), "data", "circle-signals.jsonl");
}

function signalBlobPath(signalId: string): string {
  return `${BLOB_PREFIX}/${signalId}.json`;
}

function assertCircleSignalDurableStore(operation: string): void {
  try {
    assertVercelBlobForProduction(`circle_signals:${operation}`);
  } catch {
    throw new CircleSignalStoreError(
      "blob_not_configured",
      `blob_not_configured:circle_signals:${operation}`,
    );
  }
}

export function getCircleSignalStoreMeta(): CircleSignalStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  const needsBlob = requiresVercelBlob();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || !needsBlob,
    requiresBlob: needsBlob,
    blobConfigured,
  };
}

function normalizeSignal(raw: CircleSignal): CircleSignal {
  const note =
    typeof raw.note === "string" && raw.note.trim()
      ? raw.note.trim().slice(0, MAX_NOTE_LENGTH)
      : undefined;
  return {
    ...raw,
    recordType: "circle_signal",
    note,
  };
}

function parseSignal(raw: string): CircleSignal | null {
  try {
    const parsed = JSON.parse(raw) as CircleSignal;
    if (!parsed.signalId || !parsed.circleId || !parsed.actorUserId) return null;
    if (parsed.recordType && parsed.recordType !== "circle_signal") return null;
    return normalizeSignal(parsed);
  } catch {
    return null;
  }
}

async function readSignalFromBlobPath(pathname: string): Promise<CircleSignal | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return parseSignal(text);
  } catch {
    return null;
  }
}

async function writeSignalToBlob(record: CircleSignal): Promise<void> {
  await put(signalBlobPath(record.signalId), JSON.stringify(normalizeSignal(record)), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function listSignalsFromBlob(): Promise<CircleSignal[]> {
  const signals: CircleSignal[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({
      prefix: `${BLOB_PREFIX}/`,
      limit: 1000,
      cursor,
    });

    for (const blob of page.blobs) {
      const match = blob.pathname.match(/circle-signals\/(.+)\.json$/);
      if (!match?.[1]) continue;
      const signal = await readSignalFromBlobPath(blob.pathname);
      if (signal) signals.push(signal);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  return signals.sort((a, b) =>
    (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
  );
}

async function readAllSignalsFromLocal(): Promise<CircleSignal[]> {
  const filePath = localSignalsPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const byId = new Map<string, CircleSignal>();
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      const parsed = parseSignal(line);
      if (parsed) byId.set(parsed.signalId, parsed);
    }
    return [...byId.values()].sort((a, b) =>
      (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
    );
  } catch {
    return [];
  }
}

async function writeSignalToLocal(record: CircleSignal): Promise<void> {
  const filePath = localSignalsPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readAllSignalsFromLocal();
  const next = existing.filter((item) => item.signalId !== record.signalId);
  next.push(normalizeSignal(record));
  next.sort((a, b) =>
    (a.updatedAt ?? a.createdAt).localeCompare(b.updatedAt ?? b.createdAt),
  );
  const body = next.map((item) => JSON.stringify(item)).join("\n");
  await writeFile(filePath, body ? `${body}\n` : "", "utf8");
}

export function circleSignalDedupeKey(input: {
  actorUserId: string;
  circleId: string;
  signalType: CircleSignalType;
}): string {
  return `${input.actorUserId}:${input.circleId}:${input.signalType}`;
}

export async function listCircleSignals(options?: {
  circleId?: string;
  actorUserId?: string;
  signalType?: CircleSignalType;
  status?: CircleSignalStatus | CircleSignalStatus[];
  limit?: number;
}): Promise<CircleSignal[]> {
  assertCircleSignalDurableStore("list");

  const signals = isVercelBlobConfigured()
    ? await listSignalsFromBlob()
    : await readAllSignalsFromLocal();

  const limit = Math.min(options?.limit ?? 300, 2000);
  const allowedStatuses = options?.status
    ? Array.isArray(options.status)
      ? options.status
      : [options.status]
    : null;

  return signals
    .filter((item) => (options?.circleId ? item.circleId === options.circleId : true))
    .filter((item) => (options?.actorUserId ? item.actorUserId === options.actorUserId : true))
    .filter((item) => (options?.signalType ? item.signalType === options.signalType : true))
    .filter((item) => (allowedStatuses ? allowedStatuses.includes(item.status) : true))
    .slice(0, limit);
}

export const CIRCLE_SIGNAL_CONFIRMATIONS: Record<CircleSignalType, string> = {
  circle_interest:
    "Guardamos tu interés. Esto ayuda a entender qué círculos empiezan a reunir movimiento.",
  circle_receive_updates:
    "Te tendremos en cuenta si este círculo abre nuevos pasos o convocatorias.",
  circle_access_request:
    "Recibimos tu solicitud. No abre contacto directo automático. Primero revisaremos si hay condiciones para habilitar participación.",
  circle_idea:
    "Tu idea quedó guardada para revisión del equipo. No se publica automáticamente.",
};

export async function upsertCircleSignal(input: {
  circleId: string;
  circleTitle: string;
  actorUserId: string;
  signalType: CircleSignalType;
  note?: string;
}): Promise<{ signal: CircleSignal; deduped: boolean; updated: boolean }> {
  assertCircleSignalDurableStore("upsert");

  if (input.signalType === "circle_idea") {
    const note = input.note?.trim() ?? "";
    if (note.length < 10) {
      throw new Error("circle_idea_note_required");
    }
  }

  const dedupeKey = circleSignalDedupeKey({
    actorUserId: input.actorUserId,
    circleId: input.circleId,
    signalType: input.signalType,
  });

  const all = await listCircleSignals({ limit: 5000 });
  const existing = all.find(
    (item) => item.dedupeKey === dedupeKey && item.status === "active",
  );

  if (existing) {
    if (input.signalType === "circle_idea" && input.note?.trim()) {
      const nextNote = input.note.trim().slice(0, MAX_NOTE_LENGTH);
      if (nextNote !== (existing.note ?? "")) {
        const updated: CircleSignal = {
          ...existing,
          note: nextNote,
          circleTitle: input.circleTitle,
          updatedAt: new Date().toISOString(),
        };
        if (isVercelBlobConfigured()) {
          await writeSignalToBlob(updated);
        } else {
          await writeSignalToLocal(updated);
        }
        return { signal: updated, deduped: true, updated: true };
      }
    }
    return { signal: existing, deduped: true, updated: false };
  }

  const now = new Date().toISOString();
  const record: CircleSignal = {
    recordType: "circle_signal",
    signalId: `cir_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    circleId: input.circleId,
    circleTitle: input.circleTitle,
    actorUserId: input.actorUserId,
    signalType: input.signalType,
    note:
      input.signalType === "circle_idea"
        ? input.note?.trim().slice(0, MAX_NOTE_LENGTH)
        : undefined,
    status: "active",
    createdAt: now,
    updatedAt: now,
    dedupeKey,
  };

  if (isVercelBlobConfigured()) {
    await writeSignalToBlob(record);
  } else {
    await writeSignalToLocal(record);
  }

  return { signal: record, deduped: false, updated: false };
}

export async function updateCircleSignalStatus(
  signalId: string,
  status: CircleSignalStatus,
): Promise<CircleSignal | null> {
  assertCircleSignalDurableStore("update_status");
  const all = await listCircleSignals({ limit: 5000 });
  const existing = all.find((item) => item.signalId === signalId);
  if (!existing) return null;

  const updated: CircleSignal = {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  };

  if (isVercelBlobConfigured()) {
    await writeSignalToBlob(updated);
  } else {
    await writeSignalToLocal(updated);
  }
  return updated;
}
