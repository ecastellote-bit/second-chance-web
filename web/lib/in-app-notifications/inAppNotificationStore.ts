import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import {
  generateInAppNotificationId,
  type InAppNotification,
  type InAppNotificationData,
  type InAppNotificationType,
} from "./inAppNotificationTypes";

const BLOB_PREFIX = "vu-in-app-notifications/notifications";

function localPath(): string {
  return path.join(process.cwd(), "data", "vu-in-app-notifications.jsonl");
}

async function readJsonFromPrivateBlob<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const raw = await new Response(result.stream).text();
  return JSON.parse(raw) as T;
}

async function readJsonlFile<T>(filePath: string, limit = 8000): Promise<T[]> {
  try {
    const raw = await readFile(filePath, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    return lines.slice(-limit).map((line) => JSON.parse(line) as T);
  } catch {
    return [];
  }
}

async function appendJsonlLine(filePath: string, record: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
}

async function persistNotification(item: InAppNotification): Promise<void> {
  if (isVercelBlobConfigured()) {
    await put(`${BLOB_PREFIX}/${item.id}.json`, JSON.stringify(item), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return;
  }
  await appendJsonlLine(localPath(), item);
}

export async function listAllInAppNotifications(): Promise<InAppNotification[]> {
  if (isVercelBlobConfigured()) {
    const { blobs } = await list({
      prefix: `${BLOB_PREFIX}/`,
      limit: 1000,
    });
    const items: InAppNotification[] = [];
    for (const blob of blobs) {
      try {
        const record = await readJsonFromPrivateBlob<InAppNotification>(blob.pathname);
        if (record?.id) items.push(record);
      } catch {
        continue;
      }
    }
    return items;
  }

  const records = await readJsonlFile<InAppNotification>(localPath());
  const byId = new Map<string, InAppNotification>();
  for (const record of records) {
    if (record.id) byId.set(record.id, record);
  }
  return Array.from(byId.values());
}

function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}::${id}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const [createdAt, id] = raw.split("::");
    if (!createdAt || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

export async function listByUser(input: {
  userId: string;
  limit?: number;
  cursor?: string | null;
}): Promise<{
  notifications: InAppNotification[];
  unreadCount: number;
  nextCursor: string | null;
}> {
  const userId = input.userId.trim();
  const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
  const all = await listAllInAppNotifications();

  const mine = all
    .filter((n) => n.userId === userId && !n.deletedAt)
    .sort((a, b) => {
      const byDate = b.createdAt.localeCompare(a.createdAt);
      if (byDate !== 0) return byDate;
      return b.id.localeCompare(a.id);
    });

  const unreadCount = mine.filter((n) => !n.read).length;

  let pageSource = mine;
  const cursor = input.cursor ? decodeCursor(input.cursor) : null;
  if (cursor) {
    pageSource = mine.filter((n) => {
      if (n.createdAt < cursor.createdAt) return true;
      if (n.createdAt > cursor.createdAt) return false;
      return n.id < cursor.id;
    });
  }

  const notifications = pageSource.slice(0, limit);
  const last = notifications[notifications.length - 1];
  const nextCursor =
    notifications.length === limit && last
      ? encodeCursor(last.createdAt, last.id)
      : null;

  return { notifications, unreadCount, nextCursor };
}

export async function countUnread(userId: string): Promise<number> {
  const all = await listAllInAppNotifications();
  return all.filter((n) => n.userId === userId && !n.deletedAt && !n.read).length;
}

export async function findUnreadThreadNotification(
  userId: string,
  threadId: string,
): Promise<InAppNotification | null> {
  const all = await listAllInAppNotifications();
  return (
    all.find(
      (n) =>
        n.userId === userId &&
        !n.deletedAt &&
        !n.read &&
        n.type === "mensaje_nuevo_hilo" &&
        n.data.threadId === threadId,
    ) ?? null
  );
}

export async function appendInAppNotification(
  input: Omit<InAppNotification, "id" | "read" | "readAt" | "deletedAt" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  },
): Promise<InAppNotification> {
  const item: InAppNotification = {
    id: input.id ?? generateInAppNotificationId(),
    userId: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data,
    read: false,
    readAt: null,
    deletedAt: null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  await persistNotification(item);
  return item;
}

export async function markAsRead(input: {
  userId: string;
  notificationId: string;
}): Promise<InAppNotification> {
  const all = await listAllInAppNotifications();
  const item = all.find((n) => n.id === input.notificationId);
  if (!item || item.deletedAt) throw new Error("notification_not_found");
  if (item.userId !== input.userId.trim()) throw new Error("forbidden");

  const updated: InAppNotification = {
    ...item,
    read: true,
    readAt: new Date().toISOString(),
  };
  await persistNotification(updated);
  return updated;
}

export async function markAllAsRead(userId: string): Promise<number> {
  const id = userId.trim();
  const all = await listAllInAppNotifications();
  const pending = all.filter((n) => n.userId === id && !n.deletedAt && !n.read);
  const now = new Date().toISOString();
  for (const item of pending) {
    await persistNotification({ ...item, read: true, readAt: now });
  }
  return pending.length;
}

export async function softDeleteNotification(input: {
  userId: string;
  notificationId: string;
}): Promise<void> {
  const all = await listAllInAppNotifications();
  const item = all.find((n) => n.id === input.notificationId);
  if (!item || item.deletedAt) throw new Error("notification_not_found");
  if (item.userId !== input.userId.trim()) throw new Error("forbidden");
  await persistNotification({
    ...item,
    deletedAt: new Date().toISOString(),
  });
}

export async function markThreadNotificationsRead(input: {
  userId: string;
  threadId: string;
}): Promise<number> {
  const all = await listAllInAppNotifications();
  const pending = all.filter(
    (n) =>
      n.userId === input.userId &&
      !n.deletedAt &&
      !n.read &&
      n.type === "mensaje_nuevo_hilo" &&
      n.data.threadId === input.threadId,
  );
  const now = new Date().toISOString();
  for (const item of pending) {
    await persistNotification({ ...item, read: true, readAt: now });
  }
  return pending.length;
}

export type CreateInAppNotificationInput = {
  userId: string;
  type: InAppNotificationType;
  title: string;
  body: string;
  data: InAppNotificationData;
};

/**
 * Crea notificación in-app. Para mensaje_nuevo_hilo: 1 por hilo no leído (dedupe).
 */
export async function createInAppNotification(
  input: CreateInAppNotificationInput,
): Promise<InAppNotification | null> {
  const userId = input.userId.trim();
  if (!userId) return null;

  if (input.type === "mensaje_nuevo_hilo" && input.data.threadId) {
    const existing = await findUnreadThreadNotification(userId, input.data.threadId);
    if (existing) {
      const updated: InAppNotification = {
        ...existing,
        body: input.body,
        title: input.title,
        createdAt: new Date().toISOString(),
      };
      await persistNotification(updated);
      return updated;
    }
  }

  return appendInAppNotification({
    userId,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data,
  });
}
