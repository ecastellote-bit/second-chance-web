import type { ProfileFamilyId } from "@/lib/types/profileFamilies";

export type VuUserProfileRecord = {
  recordType: "vu_user_profile";
  userId: string;
  createdAt: string;
  updatedAt: string;
  displayName: string;
  headline: string;
  momentoActual: string;
  country: string | null;
  buscando: string[];
  aportar: string[];
  diagnosticArchiveId: string | null;
  cohortBatch: string | null;
  /** Familia vocacional extraída del diagnóstico (Paso 3) */
  familiaVocacional: ProfileFamilyId | null;
  /** Identificador único para URL pública — ej. "santiago-lopez" */
  slug: string | null;
  /** Opt-in para aparecer en el directorio Connect */
  visibleEnDirectorio: boolean;
  /** Ciudad (complementa country) */
  city: string | null;
  /** Biografía pública (max 280 chars); distinta de headline/momentoActual */
  bio: string | null;
  /** URL pública — obligatoria para perfil completo (seguridad del barrio) */
  avatarUrl: string | null;
  /** Portada; si falta, la UI usa avatar o imagen del barrio */
  coverUrl?: string | null;
  /** 0–100 — sube cuando hay diagnóstico archivado */
  caminoProgress: number;
  /** Privado — nunca exponer en APIs públicas ni perfiles ajenos */
  email?: string | null;
  /** Opt-in para futuras notificaciones por email (P1-F no envía emails) */
  notificationConsent?: boolean;
};

export type UserProfilePayload = {
  userId?: string;
  displayName: string;
  headline: string;
  momentoActual: string;
  country?: string;
  buscando: string[];
  aportar: string[];
  avatarUrl?: string | null;
  coverUrl?: string | null;
  diagnosticArchiveId?: string | null;
  cohortBatch?: string | null;
  familiaVocacional?: ProfileFamilyId | null;
  slug?: string | null;
  visibleEnDirectorio?: boolean;
  city?: string | null;
  bio?: string | null;
  email?: string | null;
  notificationConsent?: boolean;
};

export const PROFILE_BIO_MAX_LENGTH = 280;

/** Valores seguros para perfiles persistidos antes de Connect. */
export function applyVuUserProfileDefaults(
  record: VuUserProfileRecord,
): VuUserProfileRecord {
  return {
    ...record,
    familiaVocacional: record.familiaVocacional ?? null,
    slug: record.slug?.trim() || null,
    visibleEnDirectorio: record.visibleEnDirectorio === true,
    city: record.city?.trim() || null,
    bio: record.bio?.trim().slice(0, PROFILE_BIO_MAX_LENGTH) || null,
  };
}

/** Vista segura para cliente: sin email en claro */
export type UserProfileClientView = Omit<VuUserProfileRecord, "email"> & {
  hasCommunityEmail: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeCommunityEmail(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim().toLowerCase() ?? "";
  if (!trimmed) return null;
  if (!EMAIL_RE.test(trimmed) || trimmed.length > 254) return null;
  return trimmed;
}

export function isCommunityEmailReady(
  profile: Pick<VuUserProfileRecord, "email"> | null | undefined,
): boolean {
  return Boolean(normalizeCommunityEmail(profile?.email ?? null));
}

export function toUserProfileClientView(profile: VuUserProfileRecord): UserProfileClientView {
  const { email, ...rest } = profile;
  return {
    ...rest,
    hasCommunityEmail: isCommunityEmailReady(profile),
    notificationConsent: profile.notificationConsent === true,
  };
}

/** Vista pública de perfil — sin datos privados ni identificadores internos. */
export type PublicProfileView = {
  slug: string;
  displayName: string;
  headline: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  familiaVocacional: ProfileFamilyId | null;
  familiaLabel: string | null;
  avatarUrl: string;
  coverUrl: string | null;
  buscando: string[];
  aportar: string[];
  momentoActual: string;
  caminoProgress: number;
};

export function toPublicProfileView(
  profile: VuUserProfileRecord,
  familiaLabel: string | null,
): PublicProfileView | null {
  const slug = profile.slug?.trim();
  const avatarUrl = profile.avatarUrl?.trim();
  if (!slug || !avatarUrl || !isUserProfileComplete(profile)) return null;

  return {
    slug,
    displayName: profile.displayName.trim(),
    headline: profile.headline.trim(),
    bio: profile.bio,
    city: profile.city,
    country: profile.country,
    familiaVocacional: profile.familiaVocacional,
    familiaLabel,
    avatarUrl,
    coverUrl: profile.coverUrl?.trim() || null,
    buscando: profile.buscando,
    aportar: profile.aportar,
    momentoActual: profile.momentoActual.trim(),
    caminoProgress: profile.caminoProgress,
  };
}

export function clientViewToPublicProfileView(
  profile: UserProfileClientView,
  familiaLabel: string | null,
): PublicProfileView | null {
  const slug = profile.slug?.trim();
  const avatarUrl = profile.avatarUrl?.trim();
  if (!slug || !avatarUrl || !isUserProfileComplete(profile)) return null;

  return {
    slug,
    displayName: profile.displayName.trim(),
    headline: profile.headline.trim(),
    bio: profile.bio,
    city: profile.city,
    country: profile.country,
    familiaVocacional: profile.familiaVocacional,
    familiaLabel,
    avatarUrl,
    coverUrl: profile.coverUrl?.trim() || null,
    buscando: profile.buscando,
    aportar: profile.aportar,
    momentoActual: profile.momentoActual.trim(),
    caminoProgress: profile.caminoProgress,
  };
}

export function isUserProfileComplete(
  profile: Pick<
    VuUserProfileRecord,
    | "displayName"
    | "headline"
    | "momentoActual"
    | "buscando"
    | "aportar"
    | "avatarUrl"
  > | null,
): boolean {
  if (!profile) return false;
  return (
    profile.displayName.trim().length >= 2 &&
    profile.headline.trim().length >= 10 &&
    profile.momentoActual.trim().length >= 20 &&
    profile.buscando.length >= 1 &&
    profile.aportar.length >= 1 &&
    Boolean(profile.avatarUrl?.trim())
  );
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function parseChipInput(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2),
    ),
  ).slice(0, 12);
}
