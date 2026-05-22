import type { ProfileFamilyScore } from "../types/profileFamilies";
import { PROFILE_FAMILIES } from "../registries/profileFamilies";
import type {
  NegativeEvidenceFinding,
  NegativeEvidenceReview,
  NegativeEvidenceVerdict,
} from "../types/negativeEvidenceJudge";
import { passesAntiTailoringGate } from "./discardRivalRules";

const MIN_ELIGIBLE_FAMILIES = 3;

function scoreOf(family: ProfileFamilyScore): number {
  return typeof family.score === "number" && Number.isFinite(family.score)
    ? family.score
    : 0;
}

function toFamilyId(family: ProfileFamilyScore): string {
  return String((family as { id?: string; familyId?: string }).id ?? (family as { familyId?: string }).familyId ?? "").trim();
}

/** Producción activa por defecto; audit-only con DISCARD_JUDGE_AUDIT_ONLY=true */
export function isDiscardJudgeProductionEnabled(): boolean {
  return process.env.DISCARD_JUDGE_AUDIT_ONLY !== "true";
}

const NON_EXcludable_VERDICTS = new Set<NegativeEvidenceVerdict>([
  "keep_candidate",
  "frontier_candidate",
  "watch_candidate",
  "insufficient_negative_evidence",
]);

/**
 * ¿Hay evidencia negativa suficiente para sacar la familia del universo candidato?
 * No elige ganador: sólo confirma que ESTA familia no puede ser.
 */
export function shouldHardExcludeFinding(finding: NegativeEvidenceFinding): boolean {
  if (NON_EXcludable_VERDICTS.has(finding.verdict)) {
    return false;
  }

  if (!passesAntiTailoringGate(finding)) {
    return false;
  }

  if (finding.verdict === "strong_discard") {
    const hasContradiction = (finding.contradictingEvidence?.length ?? 0) >= 1;
    const hasReason = finding.reasons.some(
      (r) => !r.includes("insuficiente") && !r.includes("Sin reglas"),
    );
    return finding.strength >= 0.32 && (hasContradiction || hasReason);
  }

  if (finding.verdict === "soft_discard") {
    return (
      finding.strength >= 0.58 &&
      (finding.contradictingEvidence?.length ?? 0) >= 2 &&
      typeof finding.originalRank === "number" &&
      finding.originalRank <= 8
    );
  }

  return false;
}

export type DiscardExclusionResult = {
  familyScores: ProfileFamilyScore[];
  excludedFamilyIds: string[];
  eligibleFamilyIds: string[];
  exclusionsApplied: boolean;
  originalTopFamilyId: string | null;
  effectiveTopFamilyId: string | null;
  topFamilyChangedByExclusion: boolean;
};

/**
 * Aplica exclusiones al ranking. No inventa ganador: el siguiente score elegible sube solo.
 */
export function applyDiscardExclusions(
  familyScores: ProfileFamilyScore[],
  review: NegativeEvidenceReview,
): DiscardExclusionResult {
  const sortedOriginal = [...familyScores].sort(
    (a, b) => scoreOf(b) - scoreOf(a) || toFamilyId(a).localeCompare(toFamilyId(b)),
  );
  const originalTopFamilyId = sortedOriginal[0] ? toFamilyId(sortedOriginal[0]) : null;

  if (!isDiscardJudgeProductionEnabled() || !review.exclusionsApplied) {
    return {
      familyScores: sortedOriginal,
      excludedFamilyIds: review.excludedFamilyIds ?? [],
      eligibleFamilyIds: sortedOriginal.map(toFamilyId).filter(Boolean),
      exclusionsApplied: false,
      originalTopFamilyId,
      effectiveTopFamilyId: originalTopFamilyId,
      topFamilyChangedByExclusion: false,
    };
  }

  let excludedIds = [...(review.excludedFamilyIds ?? [])];

  const ensureMinimumEligible = (): string[] => {
    const excludedSet = new Set(excludedIds);
    const eligible = sortedOriginal
      .map(toFamilyId)
      .filter((id) => id && !excludedSet.has(id));
    if (eligible.length >= MIN_ELIGIBLE_FAMILIES) {
      return excludedIds;
    }
    const rescue = sortedOriginal
      .map(toFamilyId)
      .filter(Boolean)
      .slice(0, MIN_ELIGIBLE_FAMILIES);
    excludedIds = excludedIds.filter((id) => !rescue.includes(id));
    return excludedIds;
  };

  excludedIds = ensureMinimumEligible();
  const excludedSet = new Set(excludedIds);

  const adjusted = sortedOriginal.map((family) => {
    const id = toFamilyId(family);
    if (!id || !excludedSet.has(id)) {
      return family;
    }
    return {
      ...family,
      score: 0,
      confidence:
        typeof family.confidence === "number"
          ? Math.min(family.confidence, 0.08)
          : 0.05,
      discardExcluded: true,
    } as ProfileFamilyScore;
  });

  const resorted = [...adjusted].sort(
    (a, b) => scoreOf(b) - scoreOf(a) || toFamilyId(a).localeCompare(toFamilyId(b)),
  );

  const effectiveTopFamilyId = resorted[0] && scoreOf(resorted[0]) > 0
    ? toFamilyId(resorted[0])
    : resorted.find((f) => scoreOf(f) > 0)
      ? toFamilyId(resorted.find((f) => scoreOf(f) > 0)!)
      : originalTopFamilyId;

  return {
    familyScores: resorted,
    excludedFamilyIds: excludedIds,
    eligibleFamilyIds: resorted
      .filter((f) => scoreOf(f) > 0 && !excludedSet.has(toFamilyId(f)))
      .map(toFamilyId)
      .filter(Boolean),
    exclusionsApplied: excludedIds.length > 0,
    originalTopFamilyId,
    effectiveTopFamilyId,
    topFamilyChangedByExclusion: Boolean(
      originalTopFamilyId &&
        effectiveTopFamilyId &&
        originalTopFamilyId !== effectiveTopFamilyId,
    ),
  };
}

/** IDs elegibles para auditoría narrativa (todas las no excluidas por descarte). */
export function buildEligibleFamiliesForNarrativeAudit(
  review: NegativeEvidenceReview,
): string[] {
  const excluded = new Set(review.excludedFamilyIds ?? []);
  return PROFILE_FAMILIES.map((f) => f.id).filter((id) => !excluded.has(id));
}
