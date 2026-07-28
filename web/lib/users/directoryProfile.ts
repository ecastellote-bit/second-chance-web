import type { ProfileFamilyId } from "@/lib/types/profileFamilies";
import {
  isUserProfileComplete,
  type VuUserProfileRecord,
} from "./userProfileTypes";

/** Entrada sanitizada para el directorio Connect (sin datos privados). */
export type DirectoryProfileEntry = {
  userId: string;
  slug: string;
  displayName: string;
  headline: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  familiaVocacional: ProfileFamilyId | null;
  avatarUrl: string;
  coverUrl: string | null;
  buscando: string[];
  aportar: string[];
};

export type DirectoryFilterOptions = {
  familiaVocacional: ProfileFamilyId[];
  country: string[];
  buscando: string[];
};

export type ListPublicProfilesOptions = {
  familiaVocacional?: ProfileFamilyId | null;
  country?: string | null;
  city?: string | null;
  buscando?: string | null;
  query?: string | null;
  limit?: number;
  offset?: number;
};

export type ListPublicProfilesResult = {
  profiles: VuUserProfileRecord[];
  total: number;
};

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export function isEligibleForPublicDirectory(
  profile: VuUserProfileRecord,
): boolean {
  return (
    profile.visibleEnDirectorio === true &&
    Boolean(profile.slug?.trim()) &&
    isUserProfileComplete(profile)
  );
}

function normalizeFilterText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

function matchesTextQuery(profile: VuUserProfileRecord, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystacks = [
    profile.displayName,
    profile.headline,
    profile.bio ?? "",
  ].map((part) => part.toLowerCase());

  return haystacks.some((part) => part.includes(needle));
}

function matchesBuscando(profile: VuUserProfileRecord, buscando: string): boolean {
  const needle = buscando.trim().toLowerCase();
  if (!needle) return true;

  return profile.buscando.some((item) => item.trim().toLowerCase() === needle);
}

export function filterPublicProfiles(
  profiles: VuUserProfileRecord[],
  options: ListPublicProfilesOptions,
): VuUserProfileRecord[] {
  const familia = options.familiaVocacional ?? null;
  const country = normalizeFilterText(options.country);
  const city = normalizeFilterText(options.city);
  const buscando = normalizeFilterText(options.buscando);
  const query = normalizeFilterText(options.query);

  return profiles.filter((profile) => {
    if (!isEligibleForPublicDirectory(profile)) return false;

    if (familia && profile.familiaVocacional !== familia) return false;

    if (country) {
      const profileCountry = profile.country?.trim().toLowerCase() ?? "";
      if (profileCountry !== country.toLowerCase()) return false;
    }

    if (city) {
      const profileCity = profile.city?.trim().toLowerCase() ?? "";
      if (profileCity !== city.toLowerCase()) return false;
    }

    if (buscando && !matchesBuscando(profile, buscando)) return false;

    if (query && !matchesTextQuery(profile, query)) return false;

    return true;
  });
}

export function paginateProfiles<T>(
  profiles: T[],
  limit = DEFAULT_LIMIT,
  offset = 0,
): { items: T[]; total: number; limit: number; offset: number } {
  const safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const safeOffset = Math.max(offset, 0);
  const total = profiles.length;
  const items = profiles.slice(safeOffset, safeOffset + safeLimit);

  return { items, total, limit: safeLimit, offset: safeOffset };
}

export function toDirectoryProfileEntry(
  profile: VuUserProfileRecord,
): DirectoryProfileEntry | null {
  const slug = profile.slug?.trim();
  const avatarUrl = profile.avatarUrl?.trim();
  if (!slug || !avatarUrl || !isEligibleForPublicDirectory(profile)) return null;

  return {
    userId: profile.userId,
    slug,
    displayName: profile.displayName.trim(),
    headline: profile.headline.trim(),
    bio: profile.bio,
    city: profile.city,
    country: profile.country,
    familiaVocacional: profile.familiaVocacional,
    avatarUrl,
    coverUrl: profile.coverUrl?.trim() || null,
    buscando: profile.buscando,
    aportar: profile.aportar,
  };
}

export function buildDirectoryFilterOptions(
  profiles: VuUserProfileRecord[],
): DirectoryFilterOptions {
  const familias = new Set<ProfileFamilyId>();
  const countries = new Set<string>();
  const buscandoItems = new Set<string>();

  for (const profile of profiles) {
    if (!isEligibleForPublicDirectory(profile)) continue;

    if (profile.familiaVocacional) {
      familias.add(profile.familiaVocacional);
    }

    const country = profile.country?.trim();
    if (country) countries.add(country);

    for (const item of profile.buscando) {
      const trimmed = item.trim();
      if (trimmed) buscandoItems.add(trimmed);
    }
  }

  const sortText = (left: string, right: string) =>
    left.localeCompare(right, "es", { sensitivity: "base" });

  return {
    familiaVocacional: Array.from(familias).sort(sortText),
    country: Array.from(countries).sort(sortText),
    buscando: Array.from(buscandoItems).sort(sortText),
  };
}

export { DEFAULT_LIMIT as DIRECTORY_DEFAULT_LIMIT, MAX_LIMIT as DIRECTORY_MAX_LIMIT };
