/**
 * Golden set — Juez de Descarte (exclusiones + reglas rivales universales)
 *
 * Usage: npm run discard:golden
 *
 * Anti-cebado: un caso puede fallar localmente; la regla no se considera válida
 * si rompe human_01/02/03 (familias esperadas NO excluidas).
 */
import * as path from "path";
import * as dotenv from "dotenv";
import { mkdirSync, writeFileSync } from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { runAnalysisPipeline } from "../lib/engines/analysisPipeline";
import { normalizeUserIntake } from "../lib/engines/intakeEngine";
import { buildEstefiLabPayload } from "../lib/testing/estefiLabPayload";
import { HUMAN_LANGUAGE_CASES } from "../lib/testing/humanLanguageCases";
import { FAIL_REF_LAB_CASES } from "../lib/testing/failRefLabPayloads";
import type { UserIntake } from "../lib/types/intake";

type DiscardGoldenSpec = {
  id: string;
  /** Familias que DEBEN quedar elegibles (no excluidas). */
  mustStayEligible: string[];
  /** Familias que DEBEN quedar excluidas si están en top 8 del motor crudo. */
  mustExcludeIfCompeting?: string[];
  /** Mínimo de exclusiones totales (universo reducido). */
  minExcluded?: number;
};

const SPECS: DiscardGoldenSpec[] = [
  {
    id: "estefi_pioneer",
    mustStayEligible: ["empathic_guide", "cultural_explorer", "educator_interpreter"],
    /** Arcos universales: sostén≠builder; curiosidad≠lab; sostén≠operational. */
    mustExcludeIfCompeting: [
      "system_designer",
      "technical_builder",
      "operational_organizer",
      "scientific_investigator",
    ],
    minExcluded: 10,
  },
  {
    id: "voc_human_01_voz_publica_encerrada",
    mustStayEligible: ["public_communicator"],
    mustExcludeIfCompeting: ["creative_storyteller"],
    minExcluded: 8,
  },
  {
    id: "voc_human_02_narrador_sin_puerta",
    mustStayEligible: ["creative_storyteller", "artistic_creator"],
    minExcluded: 6,
  },
  {
    id: "voc_human_03_guia_empatico_sin_cauce",
    mustStayEligible: ["empathic_guide"],
    mustExcludeIfCompeting: ["community_builder"],
    minExcluded: 6,
  },
  {
    id: "fail_ref_creative_storyteller_compressed",
    mustStayEligible: ["creative_storyteller", "artistic_creator"],
    mustExcludeIfCompeting: ["public_communicator", "empathic_guide"],
  },
  {
    id: "fail_ref_system_designer_parches",
    mustStayEligible: ["system_designer", "analytical_strategist"],
    mustExcludeIfCompeting: ["technical_builder"],
  },
  {
    id: "fail_ref_operational_organizer_burnout",
    mustStayEligible: ["operational_organizer", "resource_steward"],
    mustExcludeIfCompeting: ["technical_builder", "system_designer", "empathic_guide"],
  },
  {
    id: "fail_ref_empathic_guide_overload",
    mustStayEligible: ["empathic_guide"],
    mustExcludeIfCompeting: ["diplomatic_social_connector", "community_builder"],
  },
];

function loadPayload(id: string): Partial<UserIntake> | null {
  if (id === "estefi_pioneer") return buildEstefiLabPayload();
  const human = HUMAN_LANGUAGE_CASES.find((c) => c.id === id);
  if (human) return human.payload as Partial<UserIntake>;
  const failRef = FAIL_REF_LAB_CASES.find((c) => c.id === id);
  return failRef?.payload ?? null;
}

type CaseResult = {
  id: string;
  ok: boolean;
  excluded: string[];
  eligible: number;
  top3: string[];
  errors: string[];
};

function runSpec(spec: DiscardGoldenSpec): CaseResult {
  const payload = loadPayload(spec.id);
  const errors: string[] = [];
  if (!payload) {
    return { id: spec.id, ok: false, excluded: [], eligible: 0, top3: [], errors: ["no payload"] };
  }

  const result = runAnalysisPipeline(normalizeUserIntake(payload));
  if (!result.ok) {
    return { id: spec.id, ok: false, excluded: [], eligible: 0, top3: [], errors: ["pipeline fail"] };
  }

  const review = result.data.negativeEvidenceReview;
  const excluded = review?.excludedFamilyIds ?? [];
  const excludedSet = new Set(excluded);
  const top3 = (result.data.familyScores ?? [])
    .slice(0, 3)
    .map((f: { id?: string; familyId?: string }) => f.id ?? f.familyId ?? "");

  for (const id of spec.mustStayEligible) {
    if (excludedSet.has(id)) {
      errors.push(`mustStayEligible violated: ${id} was excluded`);
    }
  }

  if (spec.minExcluded && excluded.length < spec.minExcluded) {
    errors.push(`minExcluded: expected >= ${spec.minExcluded}, got ${excluded.length}`);
  }

  for (const id of spec.mustExcludeIfCompeting ?? []) {
    const finding = review?.evaluatedFamilies.find((f) => f.familyId === id);
    const rank = finding?.originalRank ?? 99;
    if (rank <= 8 && !excludedSet.has(id)) {
      errors.push(`mustExcludeIfCompeting: ${id} rank ${rank} but not excluded`);
    }
  }

  return {
    id: spec.id,
    ok: errors.length === 0,
    excluded,
    eligible: review?.eligibleFamilyCount ?? 0,
    top3,
    errors,
  };
}

const results = SPECS.map(runSpec);
const passCount = results.filter((r) => r.ok).length;

console.log(`\n=== Discard Golden Set: ${passCount}/${results.length} ===\n`);
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"} ${r.id}`);
  console.log(`  top3: ${r.top3.join(" · ")}`);
  console.log(`  excluded: ${r.excluded.length} eligible: ${r.eligible}`);
  if (r.errors.length) console.log(`  errors: ${r.errors.join("; ")}`);
}

const report = {
  timestamp: new Date().toISOString(),
  summary: `${passCount}/${results.length}`,
  results,
};

const outDir = path.join(process.cwd(), "data", "reports");
mkdirSync(outDir, { recursive: true });
const outPath = path.join(
  outDir,
  `discard-golden-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
);
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(`\nReport: ${outPath}`);

process.exit(passCount === results.length ? 0 : 1);
