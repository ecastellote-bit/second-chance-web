const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+/gi;

export const COMMUNITY_TEXT_MIN_LENGTH = 20;
export const COMMUNITY_TEXT_MAX_LENGTH = 1200;

/** Plain text only: strip tags, collapse whitespace, remove obvious external links. */
export function sanitizeCommunityPlainText(input: string, maxLength = COMMUNITY_TEXT_MAX_LENGTH): string {
  const withoutTags = input.replace(/<[^>]*>/g, " ");
  const withoutLinks = withoutTags.replace(URL_PATTERN, "[enlace omitido]");
  return withoutLinks.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function isValidCommunityPlainText(
  input: string,
  minLength = COMMUNITY_TEXT_MIN_LENGTH,
): boolean {
  const cleaned = sanitizeCommunityPlainText(input);
  return cleaned.length >= minLength;
}
