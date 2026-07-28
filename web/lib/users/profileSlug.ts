/** Slugs reservados — no pueden usarse como URL pública de perfil. */
export const RESERVED_PROFILE_SLUGS = new Set([
  "crear",
  "editar",
  "api",
  "admin",
  "perfil",
  "plaza",
  "community",
  "mensajes",
  "proyectos",
  "circulos",
  "fundador",
  "full",
  "lab",
  "design-system",
]);

const SLUG_MAX_LENGTH = 48;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Convierte displayName a base kebab-case (sin garantizar unicidad). */
export function slugifyDisplayName(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH);

  return normalized.replace(/-+$/g, "");
}

/** Normaliza slug manual; null si queda vacío o inválido. */
export function sanitizeProfileSlug(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;

  const normalized = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH);

  if (!normalized || !SLUG_PATTERN.test(normalized)) return null;
  if (isReservedProfileSlug(normalized)) return null;
  return normalized;
}

export function isReservedProfileSlug(slug: string): boolean {
  return RESERVED_PROFILE_SLUGS.has(slug.trim().toLowerCase());
}

/** Devuelve slug único a partir de una base, añadiendo sufijo numérico si hace falta. */
export function pickUniqueProfileSlug(base: string, taken: Set<string>): string {
  const normalizedBase = sanitizeProfileSlug(base) ?? slugifyDisplayName(base);
  if (!normalizedBase) {
    return `mi-perfil-${Date.now().toString(36)}`;
  }

  if (!taken.has(normalizedBase)) return normalizedBase;

  for (let suffix = 2; suffix < 100; suffix += 1) {
    const candidate = `${normalizedBase.slice(0, Math.max(8, SLUG_MAX_LENGTH - 4))}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }

  return `${normalizedBase.slice(0, 32)}-${Date.now().toString(36)}`;
}
