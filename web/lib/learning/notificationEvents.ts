import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
  requiresVercelBlob,
} from "@/lib/storage/vercelBlobEnv";
import { findUserProfileById } from "@/lib/users/userProfileStore";
import {
  isCommunityEmailReady,
  normalizeCommunityEmail,
} from "@/lib/users/userProfileTypes";

export type NotificationEventType =
  | "project_published"
  | "project_hidden"
  | "project_signal_received"
  | "project_contribution_visible"
  | "circle_idea_visible"
  | "admin_post_published"
  | "formation_suggestion_reviewed";

export type NotificationEventStatus = "pending" | "sent" | "failed" | "skipped";

export type NotificationSkipReason =
  | "no_profile"
  | "no_email"
  | "no_consent"
  | "self_event"
  | "duplicate"
  | "unknown";

export type NotificationEvent = {
  recordType: "notification_event";
  notificationId: string;
  userId: string;
  /** Privado — sólo para bandeja admin cuando existió al crear el evento */
  email: string | null;
  type: NotificationEventType;
  title: string;
  body: string;
  targetType: string;
  targetId: string;
  status: NotificationEventStatus;
  skipReason: NotificationSkipReason | null;
  dedupeKey: string;
  metadata: Record<string, unknown>;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationEventStoreMeta = {
  backend: "blob" | "local_jsonl";
  durable: boolean;
  requiresBlob: boolean;
  blobConfigured: boolean;
};

export class NotificationEventStoreError extends Error {
  readonly code: "blob_not_configured" | "store_unavailable";

  constructor(code: NotificationEventStoreError["code"], message?: string) {
    super(message ?? code);
    this.name = "NotificationEventStoreError";
    this.code = code;
  }
}

const BLOB_PREFIX = "notification-events";

function localPath(): string {
  return path.join(process.cwd(), "data", "notification-events.jsonl");
}

function blobPath(notificationId: string): string {
  return `${BLOB_PREFIX}/${notificationId}.json`;
}

function assertDurableStore(operation: string): void {
  try {
    assertVercelBlobForProduction(`notification_events:${operation}`);
  } catch {
    throw new NotificationEventStoreError(
      "blob_not_configured",
      `blob_not_configured:notification_events:${operation}`,
    );
  }
}

export function getNotificationEventStoreMeta(): NotificationEventStoreMeta {
  const blobConfigured = isVercelBlobConfigured();
  const needsBlob = requiresVercelBlob();
  return {
    backend: blobConfigured ? "blob" : "local_jsonl",
    durable: blobConfigured || !needsBlob,
    requiresBlob: needsBlob,
    blobConfigured,
  };
}

function newNotificationId(): string {
  return `notif_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalize(raw: NotificationEvent): NotificationEvent {
  return {
    ...raw,
    recordType: "notification_event",
    email: raw.email ? normalizeCommunityEmail(raw.email) : null,
    metadata: raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {},
    error: typeof raw.error === "string" && raw.error.trim() ? raw.error.trim() : null,
    skipReason: raw.skipReason ?? null,
  };
}

function parse(raw: string): NotificationEvent | null {
  try {
    const parsed = JSON.parse(raw) as NotificationEvent;
    if (!parsed?.notificationId || !parsed?.userId || !parsed?.dedupeKey) return null;
    if (parsed.recordType && parsed.recordType !== "notification_event") return null;
    return normalize(parsed);
  } catch {
    return null;
  }
}

async function readFromBlob(pathname: string): Promise<NotificationEvent | null> {
  try {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return parse(await new Response(result.stream).text());
  } catch {
    return null;
  }
}

async function writeToBlob(record: NotificationEvent): Promise<void> {
  await put(blobPath(record.notificationId), JSON.stringify(normalize(record)), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function listFromBlob(): Promise<NotificationEvent[]> {
  const items: NotificationEvent[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `${BLOB_PREFIX}/`, limit: 1000, cursor });
    for (const blob of page.blobs) {
      const match = blob.pathname.match(/notification-events\/(.+)\.json$/);
      if (!match?.[1]) continue;
      const item = await readFromBlob(blob.pathname);
      if (item) items.push(item);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function readAllLocal(): Promise<NotificationEvent[]> {
  const filePath = localPath();
  try {
    const raw = await readFile(filePath, "utf8");
    const byId = new Map<string, NotificationEvent>();
    for (const line of raw.trim().split("\n").filter(Boolean)) {
      const parsed = parse(line);
      if (parsed) byId.set(parsed.notificationId, parsed);
    }
    return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

async function writeToLocal(record: NotificationEvent): Promise<void> {
  const filePath = localPath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readAllLocal();
  const next = existing.filter((item) => item.notificationId !== record.notificationId);
  next.push(normalize(record));
  const body = next.map((item) => JSON.stringify(item)).join("\n");
  await writeFile(filePath, body ? `${body}\n` : "", "utf8");
}

async function readAll(): Promise<NotificationEvent[]> {
  assertDurableStore("list");
  return isVercelBlobConfigured() ? listFromBlob() : readAllLocal();
}

async function persist(record: NotificationEvent): Promise<NotificationEvent> {
  assertDurableStore("write");
  const normalized = normalize(record);
  if (isVercelBlobConfigured()) {
    await writeToBlob(normalized);
  } else {
    await writeToLocal(normalized);
  }
  return normalized;
}

export async function findNotificationEventByDedupeKey(
  dedupeKey: string,
): Promise<NotificationEvent | null> {
  const key = dedupeKey.trim();
  if (!key) return null;
  const all = await readAll();
  return all.find((item) => item.dedupeKey === key) ?? null;
}

export async function readNotificationEvent(
  notificationId: string,
): Promise<NotificationEvent | null> {
  const all = await readAll();
  return all.find((item) => item.notificationId === notificationId) ?? null;
}

export async function listNotificationEvents(options?: {
  status?: NotificationEventStatus;
  type?: NotificationEventType;
  userId?: string;
  limit?: number;
}): Promise<NotificationEvent[]> {
  const limit = Math.min(options?.limit ?? 500, 2000);
  const all = await readAll();
  return all
    .filter((item) => (options?.status ? item.status === options.status : true))
    .filter((item) => (options?.type ? item.type === options.type : true))
    .filter((item) => (options?.userId ? item.userId === options.userId : true))
    .slice(0, limit);
}

export async function insertNotificationEvent(
  record: Omit<
    NotificationEvent,
    "recordType" | "notificationId" | "createdAt" | "updatedAt"
  > & { notificationId?: string },
): Promise<NotificationEvent> {
  const now = new Date().toISOString();
  const event: NotificationEvent = normalize({
    recordType: "notification_event",
    notificationId: record.notificationId ?? newNotificationId(),
    userId: record.userId,
    email: record.email,
    type: record.type,
    title: record.title.trim(),
    body: record.body.trim(),
    targetType: record.targetType.trim(),
    targetId: record.targetId.trim(),
    status: record.status,
    skipReason: record.skipReason,
    dedupeKey: record.dedupeKey.trim(),
    metadata: record.metadata ?? {},
    error: record.error,
    createdAt: now,
    updatedAt: now,
  });
  return persist(event);
}

export async function updateNotificationEventStatus(
  notificationId: string,
  status: NotificationEventStatus,
  options?: { error?: string | null },
): Promise<NotificationEvent | null> {
  const existing = await readNotificationEvent(notificationId);
  if (!existing) return null;
  const updated = normalize({
    ...existing,
    status,
    error:
      options?.error === undefined
        ? existing.error
        : options.error
          ? options.error.trim()
          : null,
    updatedAt: new Date().toISOString(),
  });
  return persist(updated);
}

export type CreateNotificationEventInput = {
  userId: string;
  type: NotificationEventType;
  title: string;
  body: string;
  targetType: string;
  targetId: string;
  dedupeKey: string;
  metadata?: Record<string, unknown>;
  /** Si coincide con userId, se registra skipped self_event */
  actorUserId?: string | null;
};

export type CreateNotificationEventResult = {
  created: boolean;
  event: NotificationEvent | null;
  duplicate: boolean;
};

/**
 * Crea evento pending (email + consent) o skipped con razón documentada.
 * Dedupe: si ya existe dedupeKey, no crea otro registro.
 */
export async function createNotificationEventForUser(
  input: CreateNotificationEventInput,
): Promise<CreateNotificationEventResult> {
  const userId = input.userId.trim();
  const dedupeKey = input.dedupeKey.trim();
  if (!userId || !dedupeKey) {
    return { created: false, event: null, duplicate: false };
  }

  const existing = await findNotificationEventByDedupeKey(dedupeKey);
  if (existing) {
    return { created: false, event: existing, duplicate: true };
  }

  const actorId = input.actorUserId?.trim() ?? "";
  if (actorId && actorId === userId) {
    const event = await insertNotificationEvent({
      userId,
      email: null,
      type: input.type,
      title: input.title,
      body: input.body,
      targetType: input.targetType,
      targetId: input.targetId,
      status: "skipped",
      skipReason: "self_event",
      dedupeKey,
      metadata: input.metadata ?? {},
      error: null,
    });
    return { created: true, event, duplicate: false };
  }

  const profile = await findUserProfileById(userId);
  if (!profile) {
    const event = await insertNotificationEvent({
      userId,
      email: null,
      type: input.type,
      title: input.title,
      body: input.body,
      targetType: input.targetType,
      targetId: input.targetId,
      status: "skipped",
      skipReason: "no_profile",
      dedupeKey,
      metadata: input.metadata ?? {},
      error: null,
    });
    return { created: true, event, duplicate: false };
  }

  const email = normalizeCommunityEmail(profile.email ?? null);
  if (!email) {
    const event = await insertNotificationEvent({
      userId,
      email: null,
      type: input.type,
      title: input.title,
      body: input.body,
      targetType: input.targetType,
      targetId: input.targetId,
      status: "skipped",
      skipReason: "no_email",
      dedupeKey,
      metadata: input.metadata ?? {},
      error: null,
    });
    return { created: true, event, duplicate: false };
  }

  if (profile.notificationConsent !== true) {
    const event = await insertNotificationEvent({
      userId,
      email,
      type: input.type,
      title: input.title,
      body: input.body,
      targetType: input.targetType,
      targetId: input.targetId,
      status: "skipped",
      skipReason: "no_consent",
      dedupeKey,
      metadata: input.metadata ?? {},
      error: null,
    });
    return { created: true, event, duplicate: false };
  }

  if (!isCommunityEmailReady(profile)) {
    const event = await insertNotificationEvent({
      userId,
      email: null,
      type: input.type,
      title: input.title,
      body: input.body,
      targetType: input.targetType,
      targetId: input.targetId,
      status: "skipped",
      skipReason: "no_email",
      dedupeKey,
      metadata: input.metadata ?? {},
      error: null,
    });
    return { created: true, event, duplicate: false };
  }

  const event = await insertNotificationEvent({
    userId,
    email,
    type: input.type,
    title: input.title,
    body: input.body,
    targetType: input.targetType,
    targetId: input.targetId,
    status: "pending",
    skipReason: null,
    dedupeKey,
    metadata: input.metadata ?? {},
    error: null,
  });
  return { created: true, event, duplicate: false };
}

/** No rompe la acción principal si el store falla. */
export async function tryCreateNotificationEventForUser(
  input: CreateNotificationEventInput,
): Promise<CreateNotificationEventResult> {
  try {
    return await createNotificationEventForUser(input);
  } catch (error) {
    console.warn(
      "notification_event_failed",
      input.type,
      input.dedupeKey,
      error instanceof Error ? error.message : error,
    );
    return { created: false, event: null, duplicate: false };
  }
}
