import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import type {
  CommunityActivityItem,
  CommunityMessage,
  CommunityUserInbox,
} from "./types";

const BLOB_PREFIX = "community-inbox";
const RECORD_TYPE = "community_user_inbox" as const;

function localInboxPath(userId: string): string {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(process.cwd(), "data", "community-inbox", `${safe}.json`);
}

function inboxBlobPath(userId: string): string {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${BLOB_PREFIX}/${safe}.json`;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyInbox(userId: string): CommunityUserInbox {
  const now = new Date().toISOString();
  return {
    recordType: RECORD_TYPE,
    userId,
    updatedAt: now,
    activities: [],
    messages: [],
  };
}

async function readInboxFromBlob(userId: string): Promise<CommunityUserInbox | null> {
  try {
    const result = await get(inboxBlobPath(userId), { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    const parsed = JSON.parse(raw) as CommunityUserInbox;
    if (parsed.recordType !== RECORD_TYPE || parsed.userId !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeInboxToBlob(inbox: CommunityUserInbox): Promise<void> {
  await put(inboxBlobPath(inbox.userId), JSON.stringify(inbox), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function readInboxFromLocal(userId: string): Promise<CommunityUserInbox | null> {
  try {
    const raw = await readFile(localInboxPath(userId), "utf8");
    const parsed = JSON.parse(raw) as CommunityUserInbox;
    if (parsed.recordType !== RECORD_TYPE || parsed.userId !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeInboxToLocal(inbox: CommunityUserInbox): Promise<void> {
  const filePath = localInboxPath(inbox.userId);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(inbox, null, 2), "utf8");
}

export async function loadCommunityInbox(userId: string): Promise<CommunityUserInbox> {
  const trimmed = userId.trim();
  if (!trimmed) return emptyInbox("");

  if (isVercelBlobConfigured()) {
    return (await readInboxFromBlob(trimmed)) ?? emptyInbox(trimmed);
  }
  return (await readInboxFromLocal(trimmed)) ?? emptyInbox(trimmed);
}

async function saveCommunityInbox(inbox: CommunityUserInbox): Promise<void> {
  inbox.updatedAt = new Date().toISOString();
  if (isVercelBlobConfigured()) {
    await writeInboxToBlob(inbox);
    return;
  }
  await writeInboxToLocal(inbox);
}

export async function listCommunityActivities(
  userId: string,
  limit = 100,
): Promise<CommunityActivityItem[]> {
  const inbox = await loadCommunityInbox(userId);
  return [...inbox.activities]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function listCommunityMessages(
  userId: string,
  limit = 100,
): Promise<CommunityMessage[]> {
  const inbox = await loadCommunityInbox(userId);
  return [...inbox.messages]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function appendCommunityActivity(
  userId: string,
  input: Omit<CommunityActivityItem, "id" | "createdAt" | "userId"> & {
    userId?: string | null;
    dedupeKey?: string | null;
  },
): Promise<CommunityActivityItem> {
  const trimmed = userId.trim();
  if (!trimmed) throw new Error("user_id_required");

  const inbox = await loadCommunityInbox(trimmed);
  if (input.dedupeKey) {
    const existing = inbox.activities.find((a) => a.dedupeKey === input.dedupeKey);
    if (existing) return existing;
  }

  const item: CommunityActivityItem = {
    id: newId("act"),
    userId: input.userId ?? trimmed,
    archiveId: input.archiveId ?? null,
    createdAt: new Date().toISOString(),
    type: input.type,
    title: input.title,
    body: input.body,
    ctaLabel: input.ctaLabel ?? null,
    ctaHref: input.ctaHref ?? null,
    source: input.source,
    status: input.status,
    dedupeKey: input.dedupeKey ?? null,
    meta: input.meta ?? null,
  };

  inbox.activities.push(item);
  await saveCommunityInbox(inbox);
  return item;
}

export async function appendCommunityMessage(
  userId: string,
  input: Omit<CommunityMessage, "id" | "createdAt" | "userId"> & {
    userId?: string | null;
    dedupeKey?: string | null;
  },
): Promise<CommunityMessage> {
  const trimmed = userId.trim();
  if (!trimmed) throw new Error("user_id_required");

  const inbox = await loadCommunityInbox(trimmed);
  if (input.dedupeKey) {
    const existing = inbox.messages.find((m) => m.dedupeKey === input.dedupeKey);
    if (existing) return existing;
  }

  const item: CommunityMessage = {
    id: newId("msg"),
    userId: input.userId ?? trimmed,
    archiveId: input.archiveId ?? null,
    createdAt: new Date().toISOString(),
    from: input.from,
    subject: input.subject,
    body: input.body,
    ctaLabel: input.ctaLabel ?? null,
    ctaHref: input.ctaHref ?? null,
    status: input.status,
    kind: input.kind,
    dedupeKey: input.dedupeKey ?? null,
    meta: input.meta ?? null,
  };

  inbox.messages.push(item);
  await saveCommunityInbox(inbox);
  return item;
}
