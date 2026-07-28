/** Genera slug base desde displayName. Fallback: "usuario". */
export function generateSlugFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "usuario";
}

/** Trim, lowercase y colapsa guiones repetidos. */
export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Devuelve slug libre; agrega sufijo numérico (-2, -3, …) si hace falta. */
export function ensureUniqueSlug(candidate: string, existingSlugs: string[]): string {
  const normalized = normalizeSlug(candidate);
  const base = normalized || "usuario";
  const taken = new Set(existingSlugs.map((slug) => slug.toLowerCase()));

  if (!taken.has(base)) return base;

  for (let suffix = 2; suffix < 100; suffix += 1) {
    const withSuffix = `${base}-${suffix}`;
    if (!taken.has(withSuffix)) return withSuffix;
  }

  return `${base}-${Date.now().toString(36)}`;
}
