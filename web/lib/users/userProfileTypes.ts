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
  email?: string | null;
  notificationConsent?: boolean;
};

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
