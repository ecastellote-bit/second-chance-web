/**
 * Caso Estefi — pipeline + juez de coherencia narrativa (lab interno)
 *
 * Usage: npx tsx scripts/runEstefiCase.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { readFileSync } from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { runAnalysisPipeline } from "../lib/engines/analysisPipeline";
import { runAffinityPipelineBridge } from "../lib/engines/affinityPipelineBridge";
import { normalizeUserIntake } from "../lib/engines/intakeEngine";
import { extractSemanticSignals } from "../lib/engines/semanticExtractor";
import { findSemanticallySimilarCases } from "../lib/engines/semanticSimilarityEngine";
import {
  attachNarrativeCoherenceReview,
  runNarrativeCoherenceJudge,
} from "../lib/engines/narrativeCoherenceJudge";
import {
  applyNarrativeCoherenceLevers,
  getMotorTopFamilyId,
} from "../lib/engines/narrativeCoherenceAdjudication";
import type { UserIntake } from "../lib/types/intake";
import { buildEstefiLabPayload } from "../lib/testing/estefiLabPayload";

function buildIntakeFromExport(): UserIntake {
  return normalizeUserIntake(buildEstefiLabPayload());
}

async function main() {
  const exportPath = path.resolve(
    process.cwd(),
    "data/learning/imports/estefi-2026-05-17.json",
  );
  const exportRaw = JSON.parse(readFileSync(exportPath, "utf-8")) as {
    currentResult: { resultType?: string; corePattern?: string };
    humanReview: {
      expectedPrimaryFamily?: string;
      acceptableFamilies?: string[];
      correctionNote?: string;
    };
  };

  const intake = buildIntakeFromExport();
  const narrativeText = [
    intake.narrative.childhoodMemories,
    intake.narrative.earlyFascinations,
    intake.narrative.meaningfulSchoolSubjects,
    intake.narrative.repeatedWorkPatterns,
    intake.narrative.naturalSocialRoles,
    intake.narrative.lossesOrRenunciations,
    intake.narrative.whatFeelsCompressedNow,
    intake.currentContext.currentSituation,
    intake.currentContext.transitionGoal,
  ]
    .filter(Boolean)
    .join("\n");

  console.log("=== Caso Estefi (import estefi-2026-05-17.json) ===\n");
  console.log("Histórico archivado:");
  console.log("  resultType:", exportRaw.currentResult.resultType);
  console.log("  corePattern:", exportRaw.currentResult.corePattern);
  console.log("  esperado (humanReview):", exportRaw.humanReview.expectedPrimaryFamily);
  console.log("");

  const [semanticSignals, semanticSimilarity] = await Promise.all([
    extractSemanticSignals(narrativeText),
    findSemanticallySimilarCases(narrativeText),
  ]);

  console.log("Semántica:", semanticSignals.ok ? "ok" : semanticSignals.error);
  console.log("Similitud:", semanticSimilarity.ok ? `${semanticSimilarity.matches.length} matches` : semanticSimilarity.error);
  console.log("");

  const pipeline = runAnalysisPipeline({
    ...intake,
    _semanticSignals: semanticSignals,
    _semanticSimilarity: semanticSimilarity,
  });

  if (!pipeline.ok) {
    console.error("Pipeline falló:", pipeline.missingFields);
    process.exit(1);
  }

  const affinityBridge = runAffinityPipelineBridge({ intake, semanticSignals });
  const top3 = (affinityBridge.familyScores ?? []).slice(0, 3).map((f) => ({
    id: (f as { id?: string }).id ?? "",
    label: f.label,
    score: f.score,
  }));

  console.log("--- Motor (hoy) ---");
  console.log("  resultType:", pipeline.data.resultType);
  console.log("  corePattern:", pipeline.data.corePattern);
  console.log("  top3 familias:", top3.map((f) => `${f.id} (${(f.score * 100).toFixed(0)}%)`).join(" · "));
  console.log("");

  const narrative = await runNarrativeCoherenceJudge({
    intake,
    reading: pipeline.data,
    familyScores: affinityBridge.familyScores,
  });

  console.log("--- Juez coherencia narrativa (Fase 1) ---");
  if (!narrative.ok || !narrative.review) {
    console.log("  ERROR:", narrative.error ?? "sin review");
    process.exit(narrative.skipped ? 0 : 1);
  }

  const r = narrative.review;
  const motorTopFamilyId = getMotorTopFamilyId(affinityBridge.familyScores);

  console.log("  latencyMs:", narrative.latencyMs);
  console.log("  verdict:", r.verdict);
  console.log("  directionFit:", r.directionFit);
  console.log("  compressionConcern:", r.compressionConcern);
  console.log("  closureRisk:", r.closureRisk);
  console.log("  confidence:", r.confidence);
  console.log("  family sugerida:", r.family ?? "(ninguna)");
  if (r.familyResolution) {
    console.log("  familyResolution:", r.familyResolution);
  }
  console.log("  motor top:", motorTopFamilyId);
  console.log("  corePattern motor:", pipeline.data.corePattern);
  console.log("");
  console.log("  narrativeSummary:", r.narrativeSummary);
  console.log("");
  console.log("  coreTension:", r.coreTension);
  console.log("");
  console.log("  reason:", r.reason);
  console.log("");
  if (r.evidence.length) {
    console.log("  evidence:");
    r.evidence.forEach((e, i) => console.log(`    ${i + 1}. "${e.slice(0, 120)}${e.length > 120 ? "…" : ""}"`));
  }
  if (r.riskFlags.length) {
    console.log("  riskFlags:");
    r.riskFlags.forEach((f) =>
      console.log(`    [${f.severity}] ${f.type}: ${f.description}`),
    );
  }
  if (r.alternativeFamilies.length) {
    console.log("  alternativeFamilies:");
    r.alternativeFamilies.forEach((a) =>
      console.log(`    - ${a.familyId}: ${a.reason}`),
    );
  }

  const withLevers = applyNarrativeCoherenceLevers(
    pipeline.data,
    r,
    {
      motorTopFamilyId,
      familyScores: affinityBridge.familyScores,
    },
  );
  const adjudication = (
    withLevers.trace as { narrativeAdjudication?: { applied?: boolean; levers?: string[] } }
  )?.narrativeAdjudication;

  console.log("");
  console.log("--- Palancas Fase 2 (lab) ---");
  console.log("  aplicadas:", adjudication?.applied ?? false);
  console.log("  levers:", adjudication?.levers?.join(", ") ?? "(ninguna)");
  console.log("  resultType (sin cambiar enum):", withLevers.resultType);
  console.log("  corePattern tras palancas:", withLevers.corePattern);
  console.log(
    "  needsHumanReview:",
    (withLevers.finalDiagnostic as { needsHumanReview?: boolean })?.needsHumanReview,
  );
  console.log("  cierre:", withLevers.summaryForUser?.cierre?.slice(0, 120) + "…");

  const mismatchExpected =
    exportRaw.humanReview.expectedPrimaryFamily &&
    top3[0]?.id &&
    top3[0].id !== exportRaw.humanReview.expectedPrimaryFamily;

  console.log("");
  console.log("--- Lectura rápida ---");
  console.log(
    mismatchExpected
      ? `  Motor top (${top3[0]?.id}) ≠ esperado humano (${exportRaw.humanReview.expectedPrimaryFamily})`
      : `  Motor top alineado con esperado (${exportRaw.humanReview.expectedPrimaryFamily})`,
  );
  console.log(
    r.verdict === "narrative_mismatch"
      ? "  Juez: NARRATIVE_MISMATCH (auditoría detecta desalineación)"
      : `  Juez: ${r.verdict}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
