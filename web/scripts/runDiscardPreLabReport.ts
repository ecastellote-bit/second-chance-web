/**
 * Informe pre-lab: Juez de Descarte (golden + casos clave).
 * Usage: npm run discard:prelab
 */
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { runAnalysisPipeline } from "../lib/engines/analysisPipeline";
import { normalizeUserIntake } from "../lib/engines/intakeEngine";
import { buildEstefiLabPayload } from "../lib/testing/estefiLabPayload";
import { HUMAN_LANGUAGE_CASES } from "../lib/testing/humanLanguageCases";

const CASES = [
  { id: "estefi_pioneer", payload: buildEstefiLabPayload() },
  {
    id: "human_01",
    payload: HUMAN_LANGUAGE_CASES.find((c) => c.id === "voc_human_01_voz_publica_encerrada")?.payload,
  },
  {
    id: "human_03",
    payload: HUMAN_LANGUAGE_CASES.find((c) => c.id === "voc_human_03_guia_empatico_sin_cauce")?.payload,
  },
];

console.log("\n=== Informe pre-lab — Juez de Descarte ===\n");

for (const item of CASES) {
  if (!item.payload) continue;
  const result = runAnalysisPipeline(normalizeUserIntake(item.payload as Parameters<typeof normalizeUserIntake>[0]));
  if (!result.ok) {
    console.log(`## ${item.id}\n  ERROR pipeline\n`);
    continue;
  }
  const review = result.data.negativeEvidenceReview;
  const top5 = (result.data.familyScores ?? []).slice(0, 5).map((f: { id?: string; familyId?: string; score?: number }) => ({
    id: f.id ?? f.familyId,
    score: f.score,
  }));
  const excluded = review?.excludedFamilyIds ?? [];
  const rules = (review?.evaluatedFamilies ?? [])
    .filter((f) => f.excludedFromCandidates && f.rivalRuleId)
    .map((f) => `${f.familyId} ← ${f.rivalRuleId}`);

  console.log(`## ${item.id}`);
  console.log(`  mode: ${review?.mode}`);
  console.log(`  excluded: ${excluded.length} | eligible: ${review?.eligibleFamilyCount}`);
  console.log(`  top5: ${top5.map((t) => `${t.id}(${(Number(t.score) * 100).toFixed(0)}%)`).join(" · ")}`);
  console.log(`  corePattern: ${result.data.corePattern}`);
  if (review?.topFamilyChangedByExclusion) {
    console.log(`  top cambió: ${review.originalTopFamilyId} → ${review.effectiveTopFamilyId}`);
  }
  if (rules.length) {
    console.log("  reglas de exclusión:");
    for (const r of rules.slice(0, 12)) console.log(`    - ${r}`);
    if (rules.length > 12) console.log(`    … +${rules.length - 12} más`);
  }
  console.log("");
}

console.log("Golden completo: npm run discard:golden\n");
