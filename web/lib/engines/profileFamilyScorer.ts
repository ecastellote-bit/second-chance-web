import type {
  HumanAffinityId,
  HumanAffinityScore,
  HumanAffinityStatus,
} from "../types/humanAffinity";
import type { ProfileFamilyScore } from "../types/profileFamilies";
import { PROFILE_FAMILIES } from "../registries/profileFamilies";

type WeightedAffinity = {
  id: HumanAffinityId;
  weightedScore: number;
  raw: HumanAffinityScore;
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function statusMultiplier(status: HumanAffinityStatus): number {
  switch (status) {
    case "expressed":
      return 1.15;
    case "buried":
      return 1.05;
    case "latent":
      return 0.9;
    case "blocked":
      return 0.78;
    case "compensatory":
      return 0.45;
    default:
      return 0.75;
  }
}

function evidenceBonus(evidenceCount: number): number {
  if (evidenceCount >= 4) return 0.12;
  if (evidenceCount === 3) return 0.08;
  if (evidenceCount === 2) return 0.05;
  if (evidenceCount === 1) return 0.02;
  return 0;
}

function scoreAffinity(affinity: HumanAffinityScore): number {
  const base = affinity.score;
  const statusFactor = statusMultiplier(affinity.status);
  const confidenceFactor = 0.65 + affinity.confidence * 0.35;
  const weighted =
    base * statusFactor * confidenceFactor + evidenceBonus(affinity.evidenceCount);

  return clamp(weighted);
}

function buildAffinityMap(
  affinityScores: HumanAffinityScore[],
): Map<HumanAffinityId, HumanAffinityScore> {
  return new Map(
    affinityScores.map((affinity) => [affinity.id as HumanAffinityId, affinity]),
  );
}

function collectAffinities(
  ids: HumanAffinityId[],
  affinityMap: Map<HumanAffinityId, HumanAffinityScore>,
  threshold: number,
): WeightedAffinity[] {
  return ids
    .map((id) => {
      const affinity = affinityMap.get(id);
      if (!affinity) return null;

      const weightedScore = scoreAffinity(affinity);
      if (weightedScore < threshold) return null;

      return {
        id,
        weightedScore,
        raw: affinity,
      };
    })
    .filter((item): item is WeightedAffinity => item !== null);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function sortWeightedAffinities(items: WeightedAffinity[]): WeightedAffinity[] {
  return [...items].sort((a, b) => {
    if (b.weightedScore !== a.weightedScore) {
      return b.weightedScore - a.weightedScore;
    }

    if (b.raw.confidence !== a.raw.confidence) {
      return b.raw.confidence - a.raw.confidence;
    }

    return b.raw.evidenceCount - a.raw.evidenceCount;
  });
}

function buildRationale(params: {
  label: string;
  core: WeightedAffinity[];
  supporting: WeightedAffinity[];
  tensions: WeightedAffinity[];
  score: number;
  confidence: number;
  hasEnoughCore: boolean;
}): string[] {
  const lines: string[] = [];

  if (params.core.length > 0) {
    lines.push(
      `Afinidades núcleo detectadas para ${params.label}: ${params.core
        .map((item) => `${item.id} (${item.raw.status})`)
        .join(", ")}.`,
    );
  } else {
    lines.push(`No se detectaron afinidades núcleo claras para ${params.label}.`);
  }

  if (params.supporting.length > 0) {
    lines.push(
      `Afinidades de apoyo: ${params.supporting
        .map((item) => `${item.id} (${item.raw.status})`)
        .join(", ")}.`,
    );
  }

  if (params.tensions.length > 0) {
    lines.push(
      `Tensiones de adjudicación presentes: ${params.tensions
        .map((item) => `${item.id} (${item.raw.status})`)
        .join(", ")}.`,
    );
  }

  if (!params.hasEnoughCore) {
    lines.push(
      "Cobertura núcleo insuficiente para adjudicación fuerte; la familia queda visible solo para auditoría comparativa.",
    );
  }

  lines.push(
    `Puntaje familiar ${params.score.toFixed(2)} con confianza ${params.confidence.toFixed(
      2,
    )}.`,
  );

  return lines;
}

export function scoreProfileFamiliesFromAffinities(
  affinityScores: HumanAffinityScore[],
): ProfileFamilyScore[] {
  const affinityMap = buildAffinityMap(affinityScores);

  const familyScores = PROFILE_FAMILIES.map((family): ProfileFamilyScore => {
    const core = collectAffinities(family.coreAffinities, affinityMap, 0.18);
    const supporting = collectAffinities(
      family.supportingAffinities,
      affinityMap,
      0.14,
    );
    const tensions = collectAffinities(
      family.tensionAffinities ?? [],
      affinityMap,
      0.16,
    );

    const coreCoverage =
      family.coreAffinities.length > 0
        ? core.length / family.coreAffinities.length
        : 0;

    const supportingCoverage =
      family.supportingAffinities.length > 0
        ? supporting.length / family.supportingAffinities.length
        : 0;

    const coreStrength = average(core.map((item) => item.weightedScore));
    const supportingStrength = average(
      supporting.map((item) => item.weightedScore),
    );
    const tensionStrength = average(tensions.map((item) => item.weightedScore));

    const hasEnoughCore =
      core.length >= 1 &&
      (coreCoverage >= 0.33 ||
        coreStrength >= 0.24 ||
        core.some((item) => item.raw.status === "expressed") ||
        core.some((item) => item.raw.status === "buried"));

    console.log("FAMILY DEBUG", {
      family: family.id,
      expectedCore: family.coreAffinities,
      expectedSupporting: family.supportingAffinities,
      matchedCore: core.map((item) => ({
        id: item.id,
        status: item.raw.status,
        weightedScore: Number(item.weightedScore.toFixed(2)),
      })),
      matchedSupporting: supporting.map((item) => ({
        id: item.id,
        status: item.raw.status,
        weightedScore: Number(item.weightedScore.toFixed(2)),
      })),
      tensionHits: tensions.map((item) => ({
        id: item.id,
        status: item.raw.status,
        weightedScore: Number(item.weightedScore.toFixed(2)),
      })),
      coreCoverage: Number(coreCoverage.toFixed(2)),
      supportingCoverage: Number(supportingCoverage.toFixed(2)),
      coreStrength: Number(coreStrength.toFixed(2)),
      supportingStrength: Number(supportingStrength.toFixed(2)),
      tensionStrength: Number(tensionStrength.toFixed(2)),
      hasEnoughCore,
    });

    let score =
      coreStrength * 0.56 +
      coreCoverage * 0.22 +
      supportingStrength * 0.12 +
      supportingCoverage * 0.06 -
      tensionStrength * 0.12;

    if (
      core.some((item) => item.raw.status === "buried") &&
      coreStrength >= 0.28
    ) {
      score += 0.05;
    }

    if (
      core.filter(
        (item) =>
          item.raw.status === "expressed" ||
          item.raw.status === "buried" ||
          item.raw.status === "latent",
      ).length >= 2
    ) {
      score += 0.05;
    }

    score = clamp(score);

    const participatingAffinities = sortWeightedAffinities([
      ...core,
      ...supporting,
    ]);

    const meanAffinityConfidence = average(
      participatingAffinities.map((item) => item.raw.confidence),
    );
    const evidenceDensity = average(
      participatingAffinities.map((item) => clamp(item.raw.evidenceCount / 4)),
    );

    let confidence = clamp(
      meanAffinityConfidence * 0.6 +
        coreCoverage * 0.22 +
        supportingCoverage * 0.08 +
        evidenceDensity * 0.1,
    );

    // No borramos familias débiles: las dejamos visibles para ranking/auditoría.
    // Solo las penalizamos para que no ganen injustamente.
    if (!hasEnoughCore) {
      score = clamp(score - 0.18);
      confidence = clamp(confidence - 0.22);
    }

    const rationale = buildRationale({
      label: family.label,
      core,
      supporting,
      tensions,
      score,
      confidence,
      hasEnoughCore,
    });

    return {
      id: family.id,
      label: family.label,
      summary: family.summary,
      score,
      confidence,
      matchedCoreAffinities: core.map((item) => item.id),
      matchedSupportingAffinities: supporting.map((item) => item.id),
      tensionHits: tensions.map((item) => item.id),
      subtypeCandidates: family.subtypeCandidates,
      misreadAs: family.misreadAs,
      rationale,
    };
  });

  return familyScores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return b.matchedCoreAffinities.length - a.matchedCoreAffinities.length;
  });
}