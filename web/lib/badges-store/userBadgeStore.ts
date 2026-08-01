import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import {
  generateUserBadgeId,
  type UserBadgeRecord,
} from "./userBadgeTypes";

const BLOB_PREFIX = "vu-badges/user-badges";

function localPath(): string {
  return path.join(process.cwd(), "data", "vu-user-badges.jsonl");
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

async function persistUserBadge(item: UserBadgeRecord): Promise<void> {
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

export async function listAllUserBadges(): Promise<UserBadgeRecord[]> {
  if (isVercelBlobConfigured()) {
    const { blobs } = await list({
      prefix: `${BLOB_PREFIX}/`,
      limit: 1000,
    });
    const items: UserBadgeRecord[] = [];
    for (const blob of blobs) {
      try {
        const record = await readJsonFromPrivateBlob<UserBadgeRecord>(blob.pathname);
        if (record?.id) items.push(record);
      } catch {
        continue;
      }
    }
    return items;
  }

  const records = await readJsonlFile<UserBadgeRecord>(localPath());
  const byId = new Map<string, UserBadgeRecord>();
  for (const record of records) {
    if (record.id) byId.set(record.id, record);
  }
  return Array.from(byId.values());
}

export async function listByUser(userId: string): Promise<UserBadgeRecord[]> {
  const id = userId.trim();
  if (!id) return [];
  const all = await listAllUserBadges();
  return all
    .filter((b) => b.userId === id)
    .sort((a, b) => b.earnedAt.localeCompare(a.earnedAt));
}

export async function hasBadge(
  userId: string,
  badgeSlug: string,
): Promise<boolean> {
  const id = userId.trim();
  const slug = badgeSlug.trim();
  if (!id || !slug) return false;
  const all = await listAllUserBadges();
  return all.some((b) => b.userId === id && b.badgeSlug === slug);
}

export async function append(input: {
  userId: string;
  badgeSlug: string;
  earnedAt?: string;
  seen?: boolean;
}): Promise<UserBadgeRecord> {
  const userId = input.userId.trim();
  const badgeSlug = input.badgeSlug.trim();
  if (!userId) throw new Error("user_id_required");
  if (!badgeSlug) throw new Error("badge_slug_required");

  const record: UserBadgeRecord = {
    id: generateUserBadgeId(),
    userId,
    badgeSlug,
    earnedAt: input.earnedAt ?? new Date().toISOString(),
    seen: input.seen === true,
  };
  await persistUserBadge(record);
  return record;
}

export async function markAsSeen(input: {
  userId: string;
  badgeSlug: string;
}): Promise<UserBadgeRecord> {
  const userId = input.userId.trim();
  const badgeSlug = input.badgeSlug.trim();
  if (!userId) throw new Error("user_id_required");
  if (!badgeSlug) throw new Error("badge_slug_required");

  const all = await listByUser(userId);
  const found = all.find((b) => b.badgeSlug === badgeSlug);
  if (!found) throw new Error("badge_not_found");

  const updated: UserBadgeRecord = { ...found, seen: true };
  await persistUserBadge(updated);
  return updated;
}

export async function listUnseenByUser(
  userId: string,
): Promise<UserBadgeRecord[]> {
  const mine = await listByUser(userId);
  return mine.filter((b) => !b.seen);
}
