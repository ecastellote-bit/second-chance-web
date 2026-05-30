import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
} from "@/lib/storage/vercelBlobEnv";
import {
  isUserProfileComplete,
  normalizeCommunityEmail,
  type UserProfilePayload,
  type VuUserProfileRecord,
} from "./userProfileTypes";

const PROFILE_BLOB_PREFIX = "user-profiles";

function localStorePath(): string {
  return path.join(process.cwd(), "data", "user-profiles.jsonl");
}

function profileBlobPath(userId: string): string {
  return `${PROFILE_BLOB_PREFIX}/${userId}.json`;
}

async function readJsonFromPrivateBlob<T>(pathname: string): Promise<T | null> {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  const raw = await new Response(result.stream).text();
  return JSON.parse(raw) as T;
}

async function readProfileFromBlob(userId: string): Promise<VuUserProfileRecord | null> {
  try {
    const record = await readJsonFromPrivateBlob<VuUserProfileRecord>(
      profileBlobPath(userId),
    );
    if (!record) return null;
    if (record.recordType !== "vu_user_profile" || record.userId !== userId) {
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

async function writeProfileToBlob(profile: VuUserProfileRecord): Promise<void> {
  await put(profileBlobPath(profile.userId), JSON.stringify(profile), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

async function listProfilesFromBlob(limit: number): Promise<VuUserProfileRecord[]> {
  const { blobs } = await list({
    prefix: `${PROFILE_BLOB_PREFIX}/`,
    limit: Math.min(limit, 1000),
  });

  const profiles: VuUserProfileRecord[] = [];

  for (const blob of blobs) {
    try {
      const record = await readJsonFromPrivateBlob<VuUserProfileRecord>(blob.pathname);
      if (record?.recordType === "vu_user_profile" && record.userId) {
        profiles.push(record);
      }
    } catch {
      continue;
    }
  }

  return profiles
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, limit);
}

async function listProfilesFromLocal(limit: number): Promise<VuUserProfileRecord[]> {
  const filePath = localStorePath();
  try {
    const raw = await readFile(filePath, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    const byId = new Map<string, VuUserProfileRecord>();
    for (const line of lines) {
      const record = JSON.parse(line) as VuUserProfileRecord;
      if (record.recordType === "vu_user_profile" && record.userId) {
        const prev = byId.get(record.userId);
        if (!prev || record.updatedAt > prev.updatedAt) {
          byId.set(record.userId, record);
        }
      }
    }
    return Array.from(byId.values())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function findUserProfileById(
  userId: string,
): Promise<VuUserProfileRecord | null> {
  if (isVercelBlobConfigured()) {
    return readProfileFromBlob(userId);
  }

  const profiles = await listProfilesFromLocal(500);
  return profiles.find((p) => p.userId === userId) ?? null;
}

export async function listUserProfiles(limit = 200): Promise<VuUserProfileRecord[]> {
  if (isVercelBlobConfigured()) {
    return listProfilesFromBlob(limit);
  }
  return listProfilesFromLocal(limit);
}

export async function upsertUserProfile(
  payload: UserProfilePayload,
  options?: { forceUserId?: string },
): Promise<{ profile: VuUserProfileRecord; created: boolean }> {
  assertVercelBlobForProduction("user_profile");

  const userId =
    options?.forceUserId?.trim() ||
    payload.userId?.trim() ||
    `vu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const existing = await findUserProfileById(userId);
  const now = new Date().toISOString();

  const hasDiagnostic = Boolean(
    payload.diagnosticArchiveId ?? existing?.diagnosticArchiveId,
  );

  let resolvedEmail = existing?.email ?? null;
  if (payload.email !== undefined) {
    const normalized = normalizeCommunityEmail(payload.email);
    if (payload.email !== null && payload.email.trim() && !normalized) {
      throw new Error("email_invalid");
    }
    resolvedEmail = normalized;
  }

  let notificationConsent = existing?.notificationConsent === true;
  if (payload.notificationConsent !== undefined) {
    notificationConsent = payload.notificationConsent === true;
  }
  if (!resolvedEmail) {
    notificationConsent = false;
  }

  const profile: VuUserProfileRecord = {
    recordType: "vu_user_profile",
    userId,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    displayName: payload.displayName.trim(),
    headline: payload.headline.trim(),
    momentoActual: payload.momentoActual.trim(),
    country: payload.country?.trim() || existing?.country || null,
    buscando: payload.buscando,
    aportar: payload.aportar,
    diagnosticArchiveId:
      payload.diagnosticArchiveId ?? existing?.diagnosticArchiveId ?? null,
    cohortBatch: payload.cohortBatch ?? existing?.cohortBatch ?? null,
    avatarUrl:
      payload.avatarUrl?.trim() || existing?.avatarUrl?.trim() || null,
    coverUrl: payload.coverUrl?.trim() || existing?.coverUrl?.trim() || null,
    caminoProgress: hasDiagnostic ? 55 : existing?.caminoProgress ?? 18,
    email: resolvedEmail,
    notificationConsent,
  };

  if (!isUserProfileComplete(profile)) {
    throw new Error("profile_incomplete");
  }

  if (isVercelBlobConfigured()) {
    await writeProfileToBlob(profile);
    return { profile, created: !existing };
  }

  const filePath = localStorePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(profile)}\n`, "utf8");

  return { profile, created: !existing };
}
