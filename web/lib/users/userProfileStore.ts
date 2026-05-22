import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  isUserProfileComplete,
  type UserProfilePayload,
  type VuUserProfileRecord,
} from "./userProfileTypes";

function storePath(): string {
  return path.join(process.cwd(), "data", "user-profiles.jsonl");
}

export async function findUserProfileById(
  userId: string,
): Promise<VuUserProfileRecord | null> {
  const profiles = await listUserProfiles(500);
  return profiles.find((p) => p.userId === userId) ?? null;
}

export async function listUserProfiles(limit = 200): Promise<VuUserProfileRecord[]> {
  const filePath = storePath();
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

export async function upsertUserProfile(
  payload: UserProfilePayload,
  options?: { forceUserId?: string },
): Promise<{ profile: VuUserProfileRecord; created: boolean }> {
  const userId =
    options?.forceUserId?.trim() ||
    payload.userId?.trim() ||
    `vu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const existing = await findUserProfileById(userId);
  const now = new Date().toISOString();

  const hasDiagnostic = Boolean(
    payload.diagnosticArchiveId ?? existing?.diagnosticArchiveId,
  );

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
    caminoProgress: hasDiagnostic ? 55 : existing?.caminoProgress ?? 18,
  };

  if (!isUserProfileComplete(profile)) {
    throw new Error("profile_incomplete");
  }

  const filePath = storePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(profile)}\n`, "utf8");

  return { profile, created: !existing };
}
