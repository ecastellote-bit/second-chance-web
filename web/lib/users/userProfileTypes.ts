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
  /** 0–100 — sube cuando hay diagnóstico archivado */
  caminoProgress: number;
};

export type UserProfilePayload = {
  userId?: string;
  displayName: string;
  headline: string;
  momentoActual: string;
  country?: string;
  buscando: string[];
  aportar: string[];
  diagnosticArchiveId?: string | null;
  cohortBatch?: string | null;
};

export function isUserProfileComplete(
  profile: Pick<
    VuUserProfileRecord,
    "displayName" | "headline" | "momentoActual" | "buscando" | "aportar"
  > | null,
): boolean {
  if (!profile) return false;
  return (
    profile.displayName.trim().length >= 2 &&
    profile.headline.trim().length >= 10 &&
    profile.momentoActual.trim().length >= 20 &&
    profile.buscando.length >= 1 &&
    profile.aportar.length >= 1
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
