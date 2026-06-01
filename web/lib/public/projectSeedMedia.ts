/** Public-safe media fields for founder project seeds. */

export type ProjectSeedMediaFields = {
  coverImageUrl?: string | null;
  galleryImageUrls?: string[] | null;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
};

export type ProjectSeedMediaPublic = {
  coverImageUrl: string | null;
  galleryImageUrls: string[];
  videoUrl: string | null;
  videoPosterUrl: string | null;
};

const FALLBACK_COVERS = [
  "/vu/proyecto-manos-transforman.png",
  "/vu/proyecto-huerta-compartida.png",
  "/vu/proyecto-radio-barrial.png",
  "/vu/mesa-ideas-compartidas.jpeg",
  "/vu/patio-vivo-escena-coral.jpeg",
] as const;

const MAX_GALLERY = 6;

function hashSeedId(seedId: string): number {
  let h = 0;
  for (let i = 0; i < seedId.length; i += 1) {
    h = (h * 31 + seedId.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Stable fallback cover per seed — never leaves the project “pelado”. */
export function getProjectCoverFallback(seedId: string): string {
  const idx = hashSeedId(seedId.trim() || "seed") % FALLBACK_COVERS.length;
  return FALLBACK_COVERS[idx] ?? FALLBACK_COVERS[0];
}

/**
 * Allows same-origin paths (/vu/...) or https URLs.
 * Rejects javascript:, data:, and bare relative paths outside /vu.
 */
export function sanitizeProjectMediaUrl(
  value: string | null | undefined,
): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return null;
  if (trimmed.startsWith("/vu/") && !trimmed.includes("..")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:") return trimmed;
  } catch {
    return null;
  }
  return null;
}

function sanitizeGallery(urls: string[] | null | undefined): string[] {
  if (!Array.isArray(urls)) return [];
  const out: string[] = [];
  for (const raw of urls) {
    const safe = sanitizeProjectMediaUrl(raw);
    if (safe) out.push(safe);
    if (out.length >= MAX_GALLERY) break;
  }
  return out;
}

export function normalizeProjectSeedMediaFields(
  raw: ProjectSeedMediaFields | null | undefined,
): ProjectSeedMediaPublic {
  const coverImageUrl = sanitizeProjectMediaUrl(raw?.coverImageUrl ?? null);
  const galleryImageUrls = sanitizeGallery(raw?.galleryImageUrls ?? null);
  const videoUrl = sanitizeProjectMediaUrl(raw?.videoUrl ?? null);
  const videoPosterUrl = sanitizeProjectMediaUrl(raw?.videoPosterUrl ?? null);
  return {
    coverImageUrl,
    galleryImageUrls,
    videoUrl,
    videoPosterUrl,
  };
}

export function resolveProjectCoverSrc(
  seedId: string,
  coverImageUrl: string | null | undefined,
): string {
  return sanitizeProjectMediaUrl(coverImageUrl) ?? getProjectCoverFallback(seedId);
}

export function toPublicProjectMedia(
  seedId: string,
  fields: ProjectSeedMediaFields | null | undefined,
): ProjectSeedMediaPublic & { coverSrc: string } {
  const media = normalizeProjectSeedMediaFields(fields);
  return {
    ...media,
    coverSrc: resolveProjectCoverSrc(seedId, media.coverImageUrl),
  };
}
