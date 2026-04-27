import type { UserIntake } from "../types/intake";
import type { EvidenceFragment } from "../types/evidence";
import type {
  HumanAffinityId,
  HumanAffinityScore,
} from "../types/humanAffinity";
import type { ProfileFamilyScore } from "../types/profileFamilies";
import { buildEvidenceFragmentsFromIntake } from "./evidenceBuilder";
import { mapEvidenceToHumanAffinities } from "./humanAffinityMapper";
import { HUMAN_AFFINITY_MAP } from "../registries/humanAffinities";
import { scoreProfileFamiliesFromAffinities } from "./profileFamilyScorer";

export type AffinityPipelineBridgeInput = {
  intake: UserIntake;
  extraEvidence?: EvidenceFragment[];
  topAffinityLimit?: number;
};

export type AffinityPipelineBridgeResult = {
  evidence: EvidenceFragment[];
  affinityScores: HumanAffinityScore[];
  familyScores: ProfileFamilyScore[];
  topAffinities: HumanAffinityScore[];
  buriedCapacities: HumanAffinityScore[];
  likelyContributionModes: string[];
  likelyFlourishingConditions: string[];
};

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  );
}

function sortByScore(scores: HumanAffinityScore[]): HumanAffinityScore[] {
  return [...scores].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return b.evidenceCount - a.evidenceCount;
  });
}

function selectTopAffinities(
  scores: HumanAffinityScore[],
  limit: number,
): HumanAffinityScore[] {
  return sortByScore(scores)
    .filter((score) => {
      if (score.status === "expressed" && score.score >= 0.34) return true;
      if (score.status === "buried" && score.score >= 0.32) return true;

      if (
        score.status === "latent" &&
        score.score >= 0.3 &&
        score.confidence >= 0.5
      ) {
        return true;
      }

      /**
       * Caso importante:
       * si una afinidad aparece con score fuerte aunque su status todavía
       * no haya quedado perfectamente clasificado, no la escondemos.
       * Esto ayuda a detectar señales técnicas/prácticas o de aprendizaje
       * sin inflar artificialmente ninguna familia.
       */
      if (score.score >= 0.42 && score.confidence >= 0.45) return true;

      return false;
    })
    .slice(0, limit);
}

function selectBuriedCapacities(
  scores: HumanAffinityScore[],
): HumanAffinityScore[] {
  return sortByScore(scores).filter(
    (score) =>
      (score.status === "buried" || score.status === "blocked") &&
      score.score >= 0.3,
  );
}

function collectContributionModes(
  topAffinities: HumanAffinityScore[],
  buriedCapacities: HumanAffinityScore[],
): string[] {
  const source = [...topAffinities, ...buriedCapacities];

  const modes = source.flatMap((score) => {
    const definition = HUMAN_AFFINITY_MAP[score.id as HumanAffinityId];
    return definition?.relatedContributionModes ?? [];
  });

  return uniqueStrings(modes).slice(0, 6);
}

function collectFlourishingConditions(
  topAffinities: HumanAffinityScore[],
  buriedCapacities: HumanAffinityScore[],
): string[] {
  const source = [...topAffinities, ...buriedCapacities];

  const conditions = source.flatMap((score) => {
    const definition = HUMAN_AFFINITY_MAP[score.id as HumanAffinityId];
    return definition?.relatedFlourishingConditions ?? [];
  });

  return uniqueStrings(conditions).slice(0, 8);
}

function sanitizeFamilyScores(
  familyScores: ProfileFamilyScore[],
): ProfileFamilyScore[] {
  return [...familyScores].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    return a.label.localeCompare(b.label);
  });
}

export function runAffinityPipelineBridge(
  input: AffinityPipelineBridgeInput,
): AffinityPipelineBridgeResult {
  const intakeEvidence = buildEvidenceFragmentsFromIntake(input.intake);
  const extraEvidence = input.extraEvidence ?? [];
  const evidence = [...intakeEvidence, ...extraEvidence];

  const affinityScores = mapEvidenceToHumanAffinities({ evidence });
  const familyScores = sanitizeFamilyScores(
    scoreProfileFamiliesFromAffinities(affinityScores),
  );

  const topAffinities = selectTopAffinities(
    affinityScores,
    input.topAffinityLimit ?? 6,
  );

  const buriedCapacities = selectBuriedCapacities(affinityScores);

  const likelyContributionModes = collectContributionModes(
    topAffinities,
    buriedCapacities,
  );

  const likelyFlourishingConditions = collectFlourishingConditions(
    topAffinities,
    buriedCapacities,
  );

  return {
    evidence,
    affinityScores,
    familyScores,
    topAffinities,
    buriedCapacities,
    likelyContributionModes,
    likelyFlourishingConditions,
  };
}