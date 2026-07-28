import { findHumanCompleteCaseById } from "@/lib/learning/humanCaseDepot";
import { PROFILE_FAMILIES } from "@/lib/registries/profileFamilies";
import type { ProfileFamilyId } from "@/lib/types/profileFamilies";

const FAMILY_IDS = new Set<ProfileFamilyId>(PROFILE_FAMILIES.map((family) => family.id));

const LABEL_TO_ID = new Map<string, ProfileFamilyId>(
  PROFILE_FAMILIES.flatMap((family) => [
    [family.label.toLowerCase(), family.id],
    [family.id.replace(/_/g, " ").toLowerCase(), family.id],
  ]),
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function coerceProfileFamilyId(
  raw: string | null | undefined,
): ProfileFamilyId | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();

  if (FAMILY_IDS.has(value as ProfileFamilyId)) {
    return value as ProfileFamilyId;
  }

  const byLabel = LABEL_TO_ID.get(value.toLowerCase());
  if (byLabel) return byLabel;

  const slug = value.toLowerCase().replace(/\s+/g, "_");
  if (FAMILY_IDS.has(slug as ProfileFamilyId)) {
    return slug as ProfileFamilyId;
  }

  return null;
}

function topFamilyFromScores(result: Record<string, unknown>): ProfileFamilyId | null {
  const scores = result.familyScores;
  if (!Array.isArray(scores) || scores.length === 0) return null;

  const ranked = [...scores].sort((left, right) => {
    const leftScore = isRecord(left) ? Number(left.score) || 0 : 0;
    const rightScore = isRecord(right) ? Number(right.score) || 0 : 0;
    return rightScore - leftScore;
  });

  for (const entry of ranked) {
    if (!isRecord(entry)) continue;
    const fromId = coerceProfileFamilyId(
      typeof entry.id === "string"
        ? entry.id
        : typeof entry.familyId === "string"
          ? entry.familyId
          : null,
    );
    if (fromId) return fromId;
  }

  return null;
}

/**
 * Lee un caso humano archivado y devuelve la familia vocacional principal.
 * Falla en silencio (null) si el caso no existe o no se puede interpretar.
 */
export async function extractPrimaryFamilyFromArchive(
  archiveId: string,
): Promise<ProfileFamilyId | null> {
  try {
    const trimmed = archiveId?.trim();
    if (!trimmed) return null;

    const completeCase = await findHumanCompleteCaseById(trimmed);
    if (!completeCase) return null;

    const fromPrimary = coerceProfileFamilyId(
      completeCase.classification.primaryFamily,
    );
    if (fromPrimary) return fromPrimary;

    const currentResult = completeCase.payload?.currentResult;
    if (isRecord(currentResult)) {
      const fromCorePattern = coerceProfileFamilyId(
        typeof currentResult.corePattern === "string"
          ? currentResult.corePattern
          : null,
      );
      if (fromCorePattern) return fromCorePattern;

      const fromScores = topFamilyFromScores(currentResult);
      if (fromScores) return fromScores;

      const fromResultType = coerceProfileFamilyId(
        typeof currentResult.resultType === "string"
          ? currentResult.resultType
          : null,
      );
      if (fromResultType) return fromResultType;
    }

    return coerceProfileFamilyId(completeCase.classification.resultType);
  } catch {
    return null;
  }
}
