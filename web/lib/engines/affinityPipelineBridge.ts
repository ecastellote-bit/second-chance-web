import type { UserIntake } from "../types/intake";
import type { EvidenceFragment } from "../types/evidence";
import type {
  HumanAffinityId,
  HumanAffinityScore,
} from "../types/humanAffinity";
import type { ProfileFamilyScore } from "../types/profileFamilies";
import type { SemanticExtractionResult } from "../types/semantic";
import { buildEvidenceFragmentsFromIntake } from "./evidenceBuilder";
import { mapEvidenceToHumanAffinities } from "./humanAffinityMapper";
import { HUMAN_AFFINITY_MAP } from "../registries/humanAffinities";
import { scoreProfileFamiliesFromAffinities } from "./profileFamilyScorer";

export type AffinityPipelineBridgeInput = {
  intake: UserIntake;
  extraEvidence?: EvidenceFragment[];
  topAffinityLimit?: number;
  semanticSignals?: SemanticExtractionResult;
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

function computeDynamicWeights(extractionConfidence: number): {
  phraseWeight: number;
  semanticWeight: number;
  semanticOnlyDiscount: number;
} {
  if (extractionConfidence >= 0.8) {
    return { phraseWeight: 0.35, semanticWeight: 0.65, semanticOnlyDiscount: 0.8 };
  }
  if (extractionConfidence >= 0.6) {
    return { phraseWeight: 0.45, semanticWeight: 0.55, semanticOnlyDiscount: 0.7 };
  }
  if (extractionConfidence >= 0.4) {
    return { phraseWeight: 0.65, semanticWeight: 0.35, semanticOnlyDiscount: 0.5 };
  }
  return { phraseWeight: 0.85, semanticWeight: 0.15, semanticOnlyDiscount: 0.3 };
}

function blendWithSemanticSignals(
  phraseScores: HumanAffinityScore[],
  semantic: SemanticExtractionResult,
): HumanAffinityScore[] {
  if (!semantic.ok || semantic.affinitySignals.length === 0) {
    return phraseScores;
  }

  const { phraseWeight, semanticWeight, semanticOnlyDiscount } =
    computeDynamicWeights(semantic.extractionConfidence);

  const phraseMap = new Map(phraseScores.map((s) => [s.id, s]));
  const semanticMap = new Map(
    semantic.affinitySignals.map((s) => [s.id, s]),
  );

  const blended: HumanAffinityScore[] = phraseScores.map((phraseScore) => {
    const semanticSignal = semanticMap.get(phraseScore.id);

    if (!semanticSignal) {
      return phraseScore;
    }

    const blendedScore =
      phraseScore.score * phraseWeight + semanticSignal.strength * semanticWeight;
    const blendedConfidence =
      phraseScore.confidence * phraseWeight +
      semantic.extractionConfidence * semanticWeight;

    return {
      ...phraseScore,
      score: Math.max(phraseScore.score, blendedScore),
      confidence: Math.max(phraseScore.confidence, blendedConfidence),
    };
  });

  for (const signal of semantic.affinitySignals) {
    if (phraseMap.has(signal.id)) continue;

    const definition = HUMAN_AFFINITY_MAP[signal.id];
    if (!definition) continue;

    const semanticOnlyScore = signal.strength * semanticOnlyDiscount;

    if (semanticOnlyScore < 0.15) continue;

    blended.push({
      id: signal.id,
      score: semanticOnlyScore,
      confidence: semantic.extractionConfidence * 0.8,
      evidenceCount: 1,
      evidenceSources: ["intake"],
      status: semanticOnlyScore >= 0.4 ? "expressed" : "latent",
      rationale: signal.evidence
        ? [`Semantic: ${signal.evidence}`]
        : ["Detected via semantic analysis"],
    });
  }

  return blended;
}

export function runAffinityPipelineBridge(
  input: AffinityPipelineBridgeInput,
): AffinityPipelineBridgeResult {
  const intakeEvidence = buildEvidenceFragmentsFromIntake(input.intake);
  const extraEvidence = input.extraEvidence ?? [];
  const evidence = [...intakeEvidence, ...extraEvidence];

  const rawAffinityScores = mapEvidenceToHumanAffinities({ evidence });

  const affinityScores = input.semanticSignals
    ? blendWithSemanticSignals(rawAffinityScores, input.semanticSignals)
    : rawAffinityScores;

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