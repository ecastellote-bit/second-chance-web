import type { EmployabilityDirection, ProbableProfile } from "../types/profiles";
import {
  getDirectionsForFamily,
  getDirectionsForProfile,
} from "./profileDirectionMatrix";

type FamilyScoreLike = {
  familyId?: string;
  id?: string;
  score?: number;
  confidence?: number;
};

function resolveFamilyId(score: FamilyScoreLike | null | undefined): string | null {
  if (!score) return null;

  if (typeof score.familyId === "string" && score.familyId.trim().length > 0) {
    return score.familyId;
  }

  if (typeof score.id === "string" && score.id.trim().length > 0) {
    return score.id;
  }

  return null;
}

function getTopFamilyId(familyScores?: FamilyScoreLike[]): string | null {
  if (!familyScores || familyScores.length === 0) return null;

  const sorted = [...familyScores].sort((a, b) => {
    const scoreDelta = (b.score ?? -1) - (a.score ?? -1);
    if (scoreDelta !== 0) return scoreDelta;
    return (b.confidence ?? -1) - (a.confidence ?? -1);
  });

  return resolveFamilyId(sorted[0]);
}

export function runSEL(
  profiles: ProbableProfile[],
  familyScores?: FamilyScoreLike[],
): EmployabilityDirection[] {
  const topFamilyId = getTopFamilyId(familyScores);

  if (topFamilyId) {
    const familyDirections = getDirectionsForFamily(topFamilyId);
    if (familyDirections.length > 0) {
      return familyDirections;
    }
  }

  const topProfile = profiles[0];
  if (!topProfile) return [];

  return getDirectionsForProfile(topProfile.id);
}