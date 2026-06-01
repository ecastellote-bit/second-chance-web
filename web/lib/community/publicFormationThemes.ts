import { listFormationSuggestions } from "@/lib/learning/formationSuggestions";

const MAX_EXCERPT = 140;

function sanitizeExcerpt(text: string): string {
  let out = text.replace(/\s+/g, " ").trim();
  out = out.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[correo omitido]");
  if (out.length > MAX_EXCERPT) {
    return `${out.slice(0, MAX_EXCERPT - 1).trim()}…`;
  }
  return out;
}

export type PublicFormationTheme = {
  themeId: string;
  excerpt: string;
};

/** Anonymized learning themes for public formation surfaces — no userId or email. */
export async function listPublicFormationThemes(options?: {
  limit?: number;
}): Promise<PublicFormationTheme[]> {
  const limit = Math.min(Math.max(options?.limit ?? 6, 1), 12);
  const suggestions = await listFormationSuggestions({ limit: 80 });

  return suggestions
    .filter((s) => s.status !== "archived" && s.text.trim().length >= 12)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((s) => ({
      themeId: s.suggestionId,
      excerpt: sanitizeExcerpt(s.text),
    }));
}
