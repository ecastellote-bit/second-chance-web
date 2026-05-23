/** URL pública en nuestra app para un blob privado de foto de perfil. */
export function profileMediaDeliveryUrl(pathname: string): string {
  return `/api/user-profile/media?pathname=${encodeURIComponent(pathname)}`;
}

const SAFE_PATH =
  /^profile-media\/(avatars|covers)\/vu_[a-z0-9_]+\.(jpg|png|webp)$/i;

export function isSafeProfileMediaPathname(pathname: string): boolean {
  return SAFE_PATH.test(pathname.trim());
}

/** Convierte rutas legacy `/uploads/...` al pathname en Blob. */
export function legacyUploadPathToBlobPathname(url: string): string | null {
  const match = url.match(/^\/uploads\/(avatars|covers)\/(vu_[a-z0-9_]+)\.(jpg|png|webp)$/i);
  if (!match) return null;
  const folder = match[1]!.toLowerCase();
  return `profile-media/${folder}/${match[2]!.toLowerCase()}.${match[3]!.toLowerCase()}`;
}

export function resolveProfileMediaPathname(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/api/user-profile/media")) {
    try {
      const parsed = new URL(trimmed, "https://vocationup.com");
      const pathname = parsed.searchParams.get("pathname")?.trim() ?? "";
      return isSafeProfileMediaPathname(pathname) ? pathname : null;
    } catch {
      return null;
    }
  }

  return legacyUploadPathToBlobPathname(trimmed);
}
