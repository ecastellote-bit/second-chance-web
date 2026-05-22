/**
 * Smoke del Juez de Descarte en producción (exclusiones).
 * Usage: npx tsx scripts/runDiscardJudgeSmoke.ts
 */
import { runAnalysisPipeline } from "../lib/engines/analysisPipeline";
import { normalizeUserIntake } from "../lib/engines/intakeEngine";
import { buildEstefiLabPayload } from "../lib/testing/estefiLabPayload";
import { HUMAN_LANGUAGE_CASES } from "../lib/testing/humanLanguageCases";

function runCase(label: string, payload: unknown) {
  const intake = normalizeUserIntake(payload as Parameters<typeof normalizeUserIntake>[0]);
  const result = runAnalysisPipeline(intake);
  if (!result.ok) {
    console.log(`\n=== ${label} === FAIL`, result.missingFields);
    return;
  }
  const review = result.data.negativeEvidenceReview;
  const top3 = (result.data.familyScores ?? []).slice(0, 3).map((f: { id?: string; familyId?: string; score?: number }) => ({
    id: f.id ?? f.familyId,
    score: f.score,
  }));
  console.log(`\n=== ${label} ===`);
  console.log("  mode:", review?.mode);
  console.log("  excluded:", review?.excludedFamilyIds?.length ?? 0);
  console.log("  eligible:", review?.eligibleFamilyCount);
  console.log("  top changed:", review?.topFamilyChangedByExclusion);
  console.log("  corePattern:", result.data.corePattern);
  console.log("  top3 after discard:", top3.map((t) => `${t.id}(${((t.score ?? 0) * 100).toFixed(0)}%)`).join(" · "));
  if (review?.excludedFamilyIds?.length) {
    console.log("  excluded ids:", review.excludedFamilyIds.slice(0, 12).join(", "), review.excludedFamilyIds.length > 12 ? "…" : "");
  }
}

runCase("Estefi", buildEstefiLabPayload());
const human01 = HUMAN_LANGUAGE_CASES.find((c) => c.id === "voc_human_01_voz_publica_encerrada");
if (human01) runCase("human_01", human01.payload);
