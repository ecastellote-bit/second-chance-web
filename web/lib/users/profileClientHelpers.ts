import type { UserProfileClientView, VuUserProfileRecord } from "@/lib/users/userProfileTypes";
import {
  emitEarnedBadges,
  readEarnedBadgesFromJson,
} from "@/lib/badges-store/badgeToastClient";

/** Adapta la vista cliente al shape que espera PublicProfileCard (server). */
export function clientViewToProfileRecord(
  profile: UserProfileClientView,
): VuUserProfileRecord {
  const { hasCommunityEmail: _hasEmail, ...rest } = profile;
  return {
    ...rest,
    recordType: "vu_user_profile",
  };
}

/** Campos mínimos para aparecer en el directorio Connect. */
export function canAppearInDirectory(
  profile: Pick<UserProfileClientView, "displayName" | "headline" | "avatarUrl"> | null,
): boolean {
  if (!profile) return false;
  return (
    profile.displayName.trim().length >= 2 &&
    profile.headline.trim().length >= 10 &&
    Boolean(profile.avatarUrl?.trim())
  );
}

export function buildProfileSavePayload(
  profile: UserProfileClientView,
  patch: { visibleEnDirectorio?: boolean } = {},
) {
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    headline: profile.headline,
    momentoActual: profile.momentoActual,
    country: profile.country ?? undefined,
    city: profile.city,
    bio: profile.bio,
    buscando: profile.buscando,
    aportar: profile.aportar,
    diagnosticArchiveId: profile.diagnosticArchiveId,
    cohortBatch: profile.cohortBatch,
    avatarUrl: profile.avatarUrl,
    coverUrl: profile.coverUrl ?? null,
    visibleEnDirectorio: patch.visibleEnDirectorio ?? profile.visibleEnDirectorio,
  };
}

export async function saveUserProfileFromClient(
  profile: UserProfileClientView,
  patch: { visibleEnDirectorio?: boolean } = {},
): Promise<UserProfileClientView> {
  const res = await fetch("/api/user-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildProfileSavePayload(profile, patch)),
  });

  const data = (await res.json()) as {
    ok?: boolean;
    profile?: UserProfileClientView;
    error?: string;
    earnedBadges?: unknown;
  };

  if (!data.ok || !data.profile) {
    throw new Error(data.error ?? "No se pudo guardar el perfil");
  }

  emitEarnedBadges(readEarnedBadgesFromJson(data));

  return data.profile;
}

export function resolvePublicProfileUrl(slug: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://vocationup.com";
  return `${origin.replace(/\/$/, "")}/perfil/${slug}`;
}
