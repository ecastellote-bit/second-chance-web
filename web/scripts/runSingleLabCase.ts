/**
 * Correr un caso de lab por id (golden human o refractario)
 * Usage: npx tsx scripts/runSingleLabCase.ts voc_human_01_voz_publica_encerrada
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { runAnalysisPipeline } from "../lib/engines/analysisPipeline";
import { runAffinityPipelineBridge } from "../lib/engines/affinityPipelineBridge";
import { normalizeUserIntake } from "../lib/engines/intakeEngine";
import { extractSemanticSignals } from "../lib/engines/semanticExtractor";
import { runNarrativeCoherenceJudge } from "../lib/engines/narrativeCoherenceJudge";
import {
  applyNarrativeCoherenceLevers,
  getMotorTopFamilyId,
} from "../lib/engines/narrativeCoherenceAdjudication";
import { getClientGoldenRefractoryCases } from "../lib/testing/narrativeGoldenRefractoryLab";
import { HUMAN_LANGUAGE_CASES } from "../lib/testing/humanLanguageCases";

const caseId = process.argv[2];
if (!caseId) {
  console.error("Uso: npx tsx scripts/runSingleLabCase.ts <case_id>");
  process.exit(1);
}

function findCase(id: string) {
  const golden = getClientGoldenRefractoryCases().find((c) => c.id === id);
  if (golden) return { label: golden.label, expectation: golden.expectation, payload: golden.payload };
  const human = HUMAN_LANGUAGE_CASES.find((c) => c.id === id);
  if (human) return { label: human.label, expectation: human.expectation, payload: human.payload };
  return null;
}

async function main() {
  const spec = findCase(caseId);
  if (!spec) {
    console.error("Caso no encontrado:", caseId);
    process.exit(1);
  }

  console.log(`\n=== ${spec.label} (${caseId}) ===\n`);
  console.log("Expectativa:", spec.expectation, "\n");

  const intake = normalizeUserIntake(spec.payload);
  const narrativeText = [
    ...Object.values(intake.narrative),
    intake.currentContext.currentSituation,
  ]
    .filter((v) => typeof v === "string" && v.trim())
    .join("\n");

  const semanticSignals = await extractSemanticSignals(narrativeText);
  const pipeline = runAnalysisPipeline({
    ...spec.payload,
    _semanticSignals: semanticSignals,
  });

  if (!pipeline.ok) {
    console.error("Pipeline FAIL:", pipeline.missingFields);
    process.exit(1);
  }

  const bridge = runAffinityPipelineBridge({ intake, semanticSignals });
  const motorTop = getMotorTopFamilyId(bridge.familyScores);
  const top3 = (bridge.familyScores ?? [])
    .slice()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3)
    .map((f) => {
      const row = f as { id?: string; familyId?: string; label?: string; score?: number };
      return `${row.id ?? row.familyId} (${row.label}) ${((row.score ?? 0) * 100).toFixed(0)}%`;
    });

  const narrative = await runNarrativeCoherenceJudge({
    intake,
    reading: pipeline.data,
    familyScores: bridge.familyScores,
  });

  if (!narrative.ok || !narrative.review) {
    console.error("Juez FAIL:", narrative.error);
    process.exit(1);
  }

  const r = narrative.review;
  const withLevers = applyNarrativeCoherenceLevers(pipeline.data, r, {
    motorTopFamilyId: motorTop,
    familyScores: bridge.familyScores,
  });
  const adj = (
    withLevers.trace as { narrativeAdjudication?: { applied?: boolean; levers?: string[] } }
  )?.narrativeAdjudication;

  console.log("--- Motor ---");
  console.log("  resultType:", pipeline.data.resultType);
  console.log("  corePattern (motor):", pipeline.data.corePattern);
  console.log("  top3:", top3.join(" · "));
  console.log("");
  console.log("--- Juez narrativo ---");
  console.log("  verdict:", r.verdict);
  console.log("  directionFit:", r.directionFit);
  console.log("  compressionConcern:", r.compressionConcern);
  console.log("  closureRisk:", r.closureRisk);
  console.log("  confidence:", r.confidence);
  console.log("  family:", r.family ?? "(ninguna)");
  if (r.familyResolution) console.log("  familyResolution:", r.familyResolution);
  if (r.sostenActual) console.log("  sostenActual:", r.sostenActual);
  console.log("");
  console.log("  narrativeSummary:", r.narrativeSummary);
  console.log("");
  console.log("  coreTension:", r.coreTension);
  console.log("");
  console.log("  reason:", r.reason);
  if (r.evidence.length) {
    console.log("  evidence:");
    r.evidence.forEach((e, i) => console.log(`    ${i + 1}. ${e.slice(0, 150)}${e.length > 150 ? "…" : ""}`));
  }
  if (r.riskFlags.length) {
    console.log("  riskFlags:");
    r.riskFlags.forEach((f) =>
      console.log(`    [${f.severity}] ${f.type}: ${f.description}`),
    );
  }
  if (r.alternativeFamilies.length) {
    console.log("  alternativeFamilies:");
    r.alternativeFamilies.forEach((a) => console.log(`    - ${a.familyId}: ${a.reason}`));
  }
  console.log("");
  console.log("--- Tras palancas (lab) ---");
  console.log("  aplicadas:", adj?.applied ?? false);
  console.log("  levers:", adj?.levers?.join(", ") ?? "(ninguna)");
  console.log("  corePattern público:", withLevers.corePattern);
  console.log("  needsHumanReview:", (withLevers.finalDiagnostic as { needsHumanReview?: boolean })?.needsHumanReview);
  console.log("  cierre:", withLevers.summaryForUser?.cierre?.slice(0, 200) + "…");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
