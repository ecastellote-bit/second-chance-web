/**
 * Golden set — Capa Semántica (calibrador TS + reglas de similitud).
 * No requiere OpenAI: prueba validación post-LLM y pesos de embedding.
 *
 * Usage: npm run semantic:golden
 */
import * as path from "path";
import { mkdirSync, writeFileSync } from "fs";

import { calibrateSemanticExtraction } from "../lib/engines/semanticExtractionCalibrator";
import { semanticInfluenceWeight } from "../lib/engines/semanticLayerRules";
import {
  prepareSemanticMatchesForLearning,
  shouldMergeSemanticSimilarityIntoLearning,
} from "../lib/engines/semanticSimilarityEngine";
import type { SemanticExtractionResult } from "../lib/types/semantic";
import { EMPTY_SEMANTIC_RESULT } from "../lib/types/semantic";

type CalibratorSpec = {
  id: string;
  intakeSnippet: string;
  mock: Partial<SemanticExtractionResult>;
  expectCapped?: string[];
  expectFlagFalse?: string[];
  expectKeptStrong?: string[];
};

const CALIBRATOR_SPECS: CalibratorSpec[] = [
  {
    id: "estefi_sosten_no_public",
    intakeSnippet:
      "office manager administrativa nómina escribir historias escenas imaginación " +
      "escucha profunda uno a uno acompañar sin audiencia",
    mock: {
      ok: true,
      affinitySignals: [
        { id: "public_expression", strength: 0.85, evidence: "escribir" },
        { id: "narrative_creation", strength: 0.8, evidence: "historias" },
        { id: "empathic_attunement", strength: 0.75, evidence: "escucha" },
        { id: "practical_execution", strength: 0.7, evidence: "administrativa" },
      ],
      narrativeFlags: {
        ...EMPTY_SEMANTIC_RESULT.narrativeFlags,
        publicAudienceDesire: true,
        practicalExecution: true,
        oneToOneOrientation: true,
        collectiveOrientation: true,
      },
      extractionConfidence: 0.75,
    },
    expectCapped: ["public_expression", "practical_execution"],
    expectFlagFalse: ["publicAudienceDesire", "collectiveOrientation", "practicalExecution"],
    expectKeptStrong: ["narrative_creation"],
  },
  {
    id: "human_01_public_with_audience",
    intakeSnippet:
      "voz publica hablar en publico audiencia prensa microfono mensaje para mucha gente",
    mock: {
      ok: true,
      affinitySignals: [
        { id: "public_expression", strength: 0.82, evidence: "voz publica" },
        { id: "audience_activation", strength: 0.78, evidence: "audiencia" },
      ],
      narrativeFlags: {
        ...EMPTY_SEMANTIC_RESULT.narrativeFlags,
        publicAudienceDesire: true,
      },
      extractionConfidence: 0.8,
    },
    expectKeptStrong: ["public_expression"],
  },
  {
    id: "human_03_one_to_one",
    intakeSnippet:
      "escucha profunda uno a uno acompañar personas emociones sin comunidad ni grupo",
    mock: {
      ok: true,
      affinitySignals: [
        { id: "empathic_attunement", strength: 0.8, evidence: "escucha" },
        { id: "social_coordination", strength: 0.75, evidence: "personas" },
      ],
      narrativeFlags: {
        ...EMPTY_SEMANTIC_RESULT.narrativeFlags,
        oneToOneOrientation: true,
        collectiveOrientation: true,
      },
      extractionConfidence: 0.7,
    },
    expectCapped: ["social_coordination"],
    expectFlagFalse: ["collectiveOrientation"],
    expectKeptStrong: ["empathic_attunement"],
  },
];

type SimilaritySpec = {
  id: string;
  scores: number[];
  expectMerge: boolean;
  expectInfluentialCount: number;
};

const SIMILARITY_SPECS: SimilaritySpec[] = [
  {
    id: "weak_matches_no_merge",
    scores: [0.39, 0.38],
    expectMerge: false,
    expectInfluentialCount: 0,
  },
  {
    id: "note_tier_merge_light",
    scores: [0.49],
    expectMerge: true,
    expectInfluentialCount: 0,
  },
  {
    id: "strong_match_merge",
    scores: [0.58, 0.44],
    expectMerge: true,
    expectInfluentialCount: 1,
  },
];

function runCalibratorSpec(spec: CalibratorSpec) {
  const errors: string[] = [];
  const base = { ...EMPTY_SEMANTIC_RESULT, ...spec.mock } as SemanticExtractionResult;
  const out = calibrateSemanticExtraction(base, spec.intakeSnippet);

  for (const id of spec.expectCapped ?? []) {
    const sig = out.affinitySignals.find((s) => s.id === id);
    if (!sig || sig.strength > 0.4) {
      errors.push(`${id} should be capped (got ${sig?.strength})`);
    }
  }

  for (const flag of spec.expectFlagFalse ?? []) {
    const key = flag as keyof typeof out.narrativeFlags;
    if (out.narrativeFlags[key]) {
      errors.push(`flag ${flag} should be false`);
    }
  }

  for (const id of spec.expectKeptStrong ?? []) {
    const sig = out.affinitySignals.find((s) => s.id === id);
    if (!sig || sig.strength < 0.5) {
      errors.push(`${id} should stay strong (got ${sig?.strength})`);
    }
  }

  return { id: spec.id, ok: errors.length === 0, errors };
}

function runSimilaritySpec(spec: SimilaritySpec) {
  const errors: string[] = [];
  const matches = spec.scores.map((similarity, i) => ({
    caseId: `case_${i}`,
    title: "t",
    similarity,
    expectedPrimaryFamily: "empathic_guide",
    acceptableFamilies: [],
    rivalFamilies: [],
    lesson: "",
    shouldInfluenceFutureCases: true,
  }));

  const prepared = prepareSemanticMatchesForLearning(matches);
  const merge = shouldMergeSemanticSimilarityIntoLearning(prepared);
  const influential = prepared.filter(
    (m) => semanticInfluenceWeight(m.similarity) >= 1,
  ).length;

  if (merge !== spec.expectMerge) {
    errors.push(`merge=${merge} expected ${spec.expectMerge}`);
  }
  if (influential !== spec.expectInfluentialCount) {
    errors.push(`influential=${influential} expected ${spec.expectInfluentialCount}`);
  }

  return { id: spec.id, ok: errors.length === 0, errors };
}

const calibratorResults = CALIBRATOR_SPECS.map(runCalibratorSpec);
const similarityResults = SIMILARITY_SPECS.map(runSimilaritySpec);
const results = [...calibratorResults, ...similarityResults];
const passed = results.filter((r) => r.ok).length;

console.log("\n=== Semantic Layer Golden (deterministic) ===\n");
for (const r of results) {
  console.log(r.ok ? "PASS" : "FAIL", r.id);
  r.errors.forEach((e) => console.log("  !", e));
}
console.log(`\n${passed}/${results.length} PASS\n`);

const reportDir = path.resolve(process.cwd(), "data/reports");
mkdirSync(reportDir, { recursive: true });
writeFileSync(
  path.join(reportDir, `semantic-golden-${new Date().toISOString().replace(/[:.]/g, "-")}.json`),
  JSON.stringify({ passed, total: results.length, results }, null, 2),
);

process.exit(passed === results.length ? 0 : 1);
