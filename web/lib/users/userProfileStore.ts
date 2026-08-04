import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { get, list, put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
} from "@/lib/storage/vercelBlobEnv";
import {
  applyVuUserProfileDefaults,
  isUserProfileComplete,
  normalizeCommunityEmail,
  PROFILE_BIO_MAX_LENGTH,
  type UserProfilePayload,
  type VuUserProfileRecord,
} from "./userProfileTypes";
import { extractPrimaryFamilyFromArchive } from "./extractDiagnosticFamily";
import {
  ensureUniqueSlug,
  generateSlugFromName,
  normalizeSlug,
} from "./slugUtils";
import {
  buildDirectoryFilterOptions,
  filterPublicProfiles,
  isEligibleForPublicDirectory,
  paginateProfiles,
  type DirectoryFilterOptions,
  type ListPublicProfilesOptions,
  type ListPublicProfilesResult,
} from "./directoryProfile";

const PROFILE_BLOB_PREFIX = "user-profiles";

function localStorePath(): string {
  return path.join(process.cwd(), "data", "user-profiles.jsonl");
}

function profileBlobPath(userId: string): string {
  return `${PROFILE_BLOB_PREFIX}/${userId}.json`;
}

function normalizeStoredProfile(record: VuUserProfileRecord): VuUserProfileRecord {
  return applyVuUserProfileDefaults(record);
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

function normalizeBio(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  return trimmed.slice(0, PROFILE_BIO_MAX_LENGTH);
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
    return normalizeStoredProfile(record);
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

async function persistProfileRecord(profile: VuUserProfileRecord): Promise<void> {
  if (isVercelBlobConfigured()) {
    await writeProfileToBlob(profile);
    return;
  }

  const filePath = localStorePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(profile)}\n`, "utf8");
}

function diagnosticArchiveIdChanged(
  payload: UserProfilePayload,
  existing: VuUserProfileRecord | null,
): boolean {
  if (payload.diagnosticArchiveId === undefined) return false;
  return payload.diagnosticArchiveId !== (existing?.diagnosticArchiveId ?? null);
}

async function resolveFamiliaVocacionalForUpsert(
  payload: UserProfilePayload,
  existing: VuUserProfileRecord | null,
  nextDiagnosticArchiveId: string | null,
): Promise<VuUserProfileRecord["familiaVocacional"]> {
  if (payload.familiaVocacional !== undefined) {
    return payload.familiaVocacional;
  }

  const archiveChanged = diagnosticArchiveIdChanged(payload, existing);
  const shouldExtract =
    archiveChanged ||
    (nextDiagnosticArchiveId !== null &&
      existing?.familiaVocacional == null &&
      payload.diagnosticArchiveId !== undefined);

  if (shouldExtract && nextDiagnosticArchiveId) {
    const extracted = await extractPrimaryFamilyFromArchive(nextDiagnosticArchiveId);
    if (extracted) return extracted;
  }

  return existing?.familiaVocacional ?? null;
}

async function listExistingProfileSlugs(excludeUserId?: string): Promise<string[]> {
  const profiles = await listUserProfiles(500);
  return profiles
    .filter((profile) => profile.userId !== excludeUserId && profile.slug)
    .map((profile) => profile.slug!);
}

async function resolveSlugForUpsert(
  payload: UserProfilePayload,
  existing: VuUserProfileRecord | null,
  displayName: string,
  userId: string,
): Promise<string | null> {
  const existingSlugs = await listExistingProfileSlugs(userId);

  const explicitSlug =
    payload.slug !== undefined && payload.slug !== null
      ? payload.slug.trim()
      : null;

  if (explicitSlug) {
    const normalized = normalizeSlug(explicitSlug);
    if (!normalized) throw new Error("slug_invalid");
    return ensureUniqueSlug(normalized, existingSlugs);
  }

  if (existing?.slug) return existing.slug;

  const base = generateSlugFromName(displayName);
  return ensureUniqueSlug(base, existingSlugs);
}

/** Lazy backfill: enriquece familiaVocacional desde el diagnóstico vinculado. */
export async function enrichProfileFamilyIfMissing(
  profile: VuUserProfileRecord,
): Promise<VuUserProfileRecord> {
  if (profile.familiaVocacional !== null || !profile.diagnosticArchiveId) {
    return profile;
  }

  const extracted = await extractPrimaryFamilyFromArchive(profile.diagnosticArchiveId);
  if (!extracted) return profile;

  const enriched = normalizeStoredProfile({
    ...profile,
    familiaVocacional: extracted,
    updatedAt: new Date().toISOString(),
  });

  await persistProfileRecord(enriched);
  return enriched;
}

/** Lazy backfill: asigna slug desde displayName si falta. */
export async function enrichProfileSlugIfMissing(
  profile: VuUserProfileRecord,
): Promise<VuUserProfileRecord> {
  if (profile.slug) return profile;

  const existingSlugs = await listExistingProfileSlugs(profile.userId);
  const base = generateSlugFromName(profile.displayName);
  const slug = ensureUniqueSlug(base, existingSlugs);
  const enriched = normalizeStoredProfile({
    ...profile,
    slug,
    updatedAt: new Date().toISOString(),
  });

  await persistProfileRecord(enriched);
  return enriched;
}

async function enrichProfileOnRead(
  profile: VuUserProfileRecord,
): Promise<VuUserProfileRecord> {
  const withFamily = await enrichProfileFamilyIfMissing(profile);
  return enrichProfileSlugIfMissing(withFamily);
}

/**
 * Tras archivar un diagnóstico, actualiza perfiles que ya lo tienen vinculado.
 * Opcionalmente acota por userId cuando está disponible en el request.
 */
export async function syncLinkedProfileFamiliesForArchive(
  archiveId: string,
  userId?: string | null,
): Promise<void> {
  try {
    const trimmedArchiveId = archiveId?.trim();
    if (!trimmedArchiveId) return;

    const familia = await extractPrimaryFamilyFromArchive(trimmedArchiveId);
    if (!familia) return;

    const trimmedUserId = userId?.trim();
    if (trimmedUserId) {
      const profile = await findUserProfileById(trimmedUserId);
      if (
        profile?.diagnosticArchiveId === trimmedArchiveId &&
        profile.familiaVocacional !== familia
      ) {
        await persistProfileRecord(
          normalizeStoredProfile({
            ...profile,
            familiaVocacional: familia,
            updatedAt: new Date().toISOString(),
          }),
        );
      }
      return;
    }

    const profiles = await listUserProfiles(500);
    await Promise.all(
      profiles
        .filter((profile) => profile.diagnosticArchiveId === trimmedArchiveId)
        .filter((profile) => profile.familiaVocacional !== familia)
        .map((profile) =>
          persistProfileRecord(
            normalizeStoredProfile({
              ...profile,
              familiaVocacional: familia,
              updatedAt: new Date().toISOString(),
            }),
          ),
        ),
    );
  } catch {
    // No interrumpir el archivado del caso humano.
  }
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
        profiles.push(normalizeStoredProfile(record));
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
          byId.set(record.userId, normalizeStoredProfile(record));
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
  let profile: VuUserProfileRecord | null;

  if (isVercelBlobConfigured()) {
    profile = await readProfileFromBlob(userId);
  } else {
    const profiles = await listProfilesFromLocal(500);
    profile = profiles.find((p) => p.userId === userId) ?? null;
  }

  if (!profile) return null;
  return enrichProfileOnRead(profile);
}

export async function listUserProfiles(limit = 200): Promise<VuUserProfileRecord[]> {
  if (isVercelBlobConfigured()) {
    return listProfilesFromBlob(limit);
  }
  return listProfilesFromLocal(limit);
}

export async function findUserProfileBySlug(
  slug: string,
): Promise<VuUserProfileRecord | null> {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;

  const profiles = await listUserProfiles(500);
  const profile =
    profiles.find((item) => item.slug?.trim().toLowerCase() === normalized) ?? null;

  if (!profile) return null;
  return enrichProfileOnRead(profile);
}

/**
 * Busca perfil por email normalizado (contacto privado).
 * Escala con listado de perfiles — mismo patrón que el directorio.
 */
export async function findUserProfileByEmail(
  email: string,
): Promise<VuUserProfileRecord | null> {
  const normalized = normalizeCommunityEmail(email);
  if (!normalized) return null;

  const profiles = await listUserProfiles(1000);
  const profile =
    profiles.find(
      (item) => normalizeCommunityEmail(item.email ?? null) === normalized,
    ) ?? null;

  if (!profile) return null;
  return enrichProfileOnRead(profile);
}

/**
 * Actualiza email (y consentimiento) de un perfil ya completo sin reescribir todo.
 */
export async function updateProfileEmail(input: {
  userId: string;
  email: string;
  notificationConsent?: boolean;
}): Promise<VuUserProfileRecord> {
  assertVercelBlobForProduction("user_profile");

  const userId = input.userId.trim();
  if (!userId) throw new Error("user_id_required");

  const existing = await findUserProfileById(userId);
  if (!existing) throw new Error("profile_not_found");
  if (!isUserProfileComplete(existing)) throw new Error("profile_incomplete");

  const normalized = normalizeCommunityEmail(input.email);
  if (!normalized) throw new Error("email_invalid");

  const now = new Date().toISOString();
  const notificationConsent =
    input.notificationConsent === undefined
      ? existing.notificationConsent === true
      : input.notificationConsent === true;

  const profile = normalizeStoredProfile({
    ...existing,
    email: normalized,
    notificationConsent,
    updatedAt: now,
  });

  await persistProfileRecord(profile);
  return profile;
}

async function loadPublicDirectoryCandidates(): Promise<VuUserProfileRecord[]> {
  const profiles = await listUserProfiles(500);
  return profiles
    .filter(isEligibleForPublicDirectory)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function listPublicProfiles(
  options: ListPublicProfilesOptions = {},
): Promise<ListPublicProfilesResult> {
  const candidates = await loadPublicDirectoryCandidates();
  const filtered = filterPublicProfiles(candidates, options);
  const { items, total } = paginateProfiles(
    filtered,
    options.limit,
    options.offset,
  );

  return { profiles: items, total };
}

export async function getDirectoryFilterOptions(): Promise<DirectoryFilterOptions> {
  const candidates = await loadPublicDirectoryCandidates();
  return buildDirectoryFilterOptions(candidates);
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

  const normalizedExisting = existing ? normalizeStoredProfile(existing) : null;

  const nextDiagnosticArchiveId =
    payload.diagnosticArchiveId !== undefined
      ? payload.diagnosticArchiveId
      : normalizedExisting?.diagnosticArchiveId ?? null;

  const resolvedFamiliaVocacional = await resolveFamiliaVocacionalForUpsert(
    payload,
    normalizedExisting,
    nextDiagnosticArchiveId,
  );

  const resolvedSlug = await resolveSlugForUpsert(
    payload,
    normalizedExisting,
    payload.displayName.trim(),
    userId,
  );

  const profile: VuUserProfileRecord = normalizeStoredProfile({
    recordType: "vu_user_profile",
    userId,
    createdAt: normalizedExisting?.createdAt ?? now,
    updatedAt: now,
    displayName: payload.displayName.trim(),
    headline: payload.headline.trim(),
    momentoActual: payload.momentoActual.trim(),
    country: payload.country?.trim() || normalizedExisting?.country || null,
    buscando: payload.buscando,
    aportar: payload.aportar,
    diagnosticArchiveId: nextDiagnosticArchiveId,
    cohortBatch: payload.cohortBatch ?? normalizedExisting?.cohortBatch ?? null,
    familiaVocacional: resolvedFamiliaVocacional,
    slug: resolvedSlug,
    visibleEnDirectorio:
      payload.visibleEnDirectorio !== undefined
        ? payload.visibleEnDirectorio === true
        : normalizedExisting?.visibleEnDirectorio ?? false,
    city:
      payload.city !== undefined
        ? normalizeOptionalText(payload.city)
        : normalizedExisting?.city ?? null,
    bio:
      payload.bio !== undefined
        ? normalizeBio(payload.bio)
        : normalizedExisting?.bio ?? null,
    avatarUrl:
      payload.avatarUrl?.trim() || normalizedExisting?.avatarUrl?.trim() || null,
    coverUrl:
      payload.coverUrl?.trim() || normalizedExisting?.coverUrl?.trim() || null,
    caminoProgress: hasDiagnostic ? 55 : normalizedExisting?.caminoProgress ?? 18,
    email: resolvedEmail,
    notificationConsent,
  });

  if (!isUserProfileComplete(profile)) {
    throw new Error("profile_incomplete");
  }

  await persistProfileRecord(profile);
  return { profile, created: !existing };
}
