/**
 * Semantic Batch Runner
 *
 * Runs REVIEW and FAIL cases through the pipeline WITH semantic layers active.
 * Compares results against the deterministic-only baseline.
 *
 * Usage: npm run diagnostic:semantic-batch
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { resolve } from "path";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { diagnosticCandidateCases } from "../lib/testing/diagnosticCandidateCases";
import { runAnalysisPipeline } from "../lib/engines/analysisPipeline";
import { runAffinityPipelineBridge } from "../lib/engines/affinityPipelineBridge";
import { normalizeUserIntake } from "../lib/engines/intakeEngine";
import { extractSemanticSignals } from "../lib/engines/semanticExtractor";
import { findSemanticallySimilarCases } from "../lib/engines/semanticSimilarityEngine";
import type { DiagnosticCandidateCase } from "../lib/types/diagnosticCandidateCases";

type FamilyScoreEntry = {
  id: string;
  label: string;
  score: number;
  confidence: number;
};

type SemanticCaseResult = {
  caseId: string;
  title: string;
  category: string;
  expectedResultType: string;
  expectedPrimaryFamily: string | undefined;
  deterministicResult: {
    resultType: string | null;
    topFamily: string;
    topFamilyScore: number;
    classification: string;
  };
  semanticResult: {
    resultType: string | null;
    topFamily: string;
    topFamilyScore: number;
    classification: string;
    topFamilies: FamilyScoreEntry[];
  };
  semanticMeta: {
    extractionOk: boolean;
    extractionLatencyMs: number;
    signalsDetected: number;
    similarityOk: boolean;
    similarityLatencyMs: number;
    similarMatchesFound: number;
    topSimilarCase: string | null;
    topSimilarity: number | null;
  };
  improvement: "UPGRADED" | "SAME" | "DOWNGRADED" | "N/A";
};

function candidateToIntakePayload(c: DiagnosticCandidateCase): Record<string, unknown> {
  const ui = c.userInput;
  return {
    profile: {
      age: 35,
      country: c.region === "argentina" || c.region === "rioplatense" ? "Argentina" : "LatAm",
      language: c.language,
      employmentStatus: "employed",
    },
    narrative: {
      currentSituation: ui.currentSituation,
      childhoodMemories: ui.childhoodMemories ?? "",
      earlyFascinations: ui.earlyFascinations ?? "",
      meaningfulSchoolSubjects: ui.meaningfulSubjects ?? "",
      repeatedWorkPatterns: ui.repeatedPatterns,
      naturalSocialRoles: ui.naturalSocialRoles ?? "",
      lossesOrRenunciations: "",
      whatFeelsCompressedNow: ui.compressedLife ?? "",
      additionalContext: ui.additionalNote ?? "",
    },
    currentContext: {
      currentSituation: ui.currentSituation,
      restrictions: ui.restrictions ? [ui.restrictions] : [],
      assets: ui.assets ? [ui.assets] : [],
    },
  };
}

function extractNarrativeText(payload: Record<string, unknown>): string {
  const narrative = payload.narrative as Record<string, unknown> | undefined;
  if (!narrative) return "";

  const parts: string[] = [];
  for (const value of Object.values(narrative)) {
    if (typeof value === "string" && value.trim().length > 0) {
      parts.push(value.trim());
    }
  }
  return parts.join(" ");
}

function extractFamilies(raw: unknown): FamilyScoreEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 5)
    .map((f: any) => ({
      id: f.id ?? f.familyId ?? "",
      label: f.label ?? "",
      score: typeof f.score === "number" ? Number(f.score.toFixed(3)) : 0,
      confidence: typeof f.confidence === "number" ? Number(f.confidence.toFixed(3)) : 0,
    }));
}

function classify(
  c: DiagnosticCandidateCase,
  actualResultType: string | null,
  families: FamilyScoreEntry[],
): string {
  if (c.validation.recommendedInitialUse === "calibration_only") return "CALIBRATION_ONLY";
  if (!actualResultType) return "ERROR";

  const topFamilyId = families[0]?.id ?? "";
  const exp = c.expected;

  const resultTypeMatch = actualResultType === exp.resultType;
  const primaryMatch =
    !exp.primaryFamily ||
    topFamilyId === exp.primaryFamily ||
    (exp.acceptablePrimaryFamilies ?? []).includes(topFamilyId);

  const shouldNotWinViolation = (exp.shouldNotWin ?? []).includes(topFamilyId);

  if (shouldNotWinViolation) return "FAIL";
  if (resultTypeMatch && primaryMatch) return "PASS";
  if (resultTypeMatch || primaryMatch) return "REVIEW";
  return "FAIL";
}

async function runSingleCaseWithSemantic(c: DiagnosticCandidateCase): Promise<SemanticCaseResult> {
  const payload = candidateToIntakePayload(c);
  const narrativeText = extractNarrativeText(payload);

  // Run deterministic baseline
  const deterministicPipeline = runAnalysisPipeline(payload as any);
  const deterministicFamilies = deterministicPipeline.ok
    ? extractFamilies(deterministicPipeline.data.familyScores)
    : [];
  const deterministicClassification = classify(
    c,
    deterministicPipeline.ok ? deterministicPipeline.data.resultType : null,
    deterministicFamilies,
  );

  // Run semantic layers
  const [semanticSignals, semanticSimilarity] = await Promise.all([
    extractSemanticSignals(narrativeText),
    findSemanticallySimilarCases(narrativeText, { minSimilarity: 0.35 }),
  ]);

  // Run pipeline WITH semantic signals
  const semanticPipeline = runAnalysisPipeline({
    ...(payload as any),
    _semanticSignals: semanticSignals,
    _semanticSimilarity: semanticSimilarity,
  });

  const semanticFamilies = semanticPipeline.ok
    ? extractFamilies(semanticPipeline.data.familyScores)
    : [];
  const semanticClassification = classify(
    c,
    semanticPipeline.ok ? semanticPipeline.data.resultType : null,
    semanticFamilies,
  );

  const classOrder = ["ERROR", "FAIL", "REVIEW", "CALIBRATION_ONLY", "PASS"];
  const detIdx = classOrder.indexOf(deterministicClassification);
  const semIdx = classOrder.indexOf(semanticClassification);

  let improvement: "UPGRADED" | "SAME" | "DOWNGRADED" | "N/A" = "SAME";
  if (deterministicClassification === "CALIBRATION_ONLY") {
    improvement = "N/A";
  } else if (semIdx > detIdx) {
    improvement = "UPGRADED";
  } else if (semIdx < detIdx) {
    improvement = "DOWNGRADED";
  }

  return {
    caseId: c.id,
    title: c.title,
    category: c.category,
    expectedResultType: c.expected.resultType,
    expectedPrimaryFamily: c.expected.primaryFamily,
    deterministicResult: {
      resultType: deterministicPipeline.ok ? deterministicPipeline.data.resultType : null,
      topFamily: deterministicFamilies[0]?.id ?? "",
      topFamilyScore: deterministicFamilies[0]?.score ?? 0,
      classification: deterministicClassification,
    },
    semanticResult: {
      resultType: semanticPipeline.ok ? semanticPipeline.data.resultType : null,
      topFamily: semanticFamilies[0]?.id ?? "",
      topFamilyScore: semanticFamilies[0]?.score ?? 0,
      classification: semanticClassification,
      topFamilies: semanticFamilies,
    },
    semanticMeta: {
      extractionOk: semanticSignals.ok,
      extractionLatencyMs: semanticSignals.latencyMs ?? 0,
      signalsDetected: semanticSignals.affinitySignals.length,
      similarityOk: semanticSimilarity.ok,
      similarityLatencyMs: semanticSimilarity.latencyMs,
      similarMatchesFound: semanticSimilarity.matches.length,
      topSimilarCase: semanticSimilarity.matches[0]?.title ?? null,
      topSimilarity: semanticSimilarity.matches[0]?.similarity ?? null,
    },
    improvement,
  };
}

async function main() {
  console.log("=== Semantic Batch Runner ===\n");

  const targetCases = diagnosticCandidateCases.filter((c) => {
    if (c.validation.recommendedInitialUse === "calibration_only") return false;
    return true;
  });

  console.log(`Running ${targetCases.length} evaluable cases with semantic layers...\n`);

  const results: SemanticCaseResult[] = [];
  let upgraded = 0;
  let same = 0;
  let downgraded = 0;

  for (const c of targetCases) {
    process.stdout.write(`  [${c.id}] ...`);
    const result = await runSingleCaseWithSemantic(c);
    results.push(result);

    const tag =
      result.improvement === "UPGRADED" ? " ↑ UPGRADED" :
      result.improvement === "DOWNGRADED" ? " ↓ DOWNGRADED" :
      "";

    console.log(
      ` ${result.deterministicResult.classification} → ${result.semanticResult.classification}${tag}`,
    );

    if (result.improvement === "UPGRADED") upgraded++;
    else if (result.improvement === "DOWNGRADED") downgraded++;
    else same++;
  }

  console.log("\n=== RESUMEN ===");
  console.log(`  Total evaluados: ${results.length}`);
  console.log(`  UPGRADED (mejora):   ${upgraded}`);
  console.log(`  SAME (sin cambio):   ${same}`);
  console.log(`  DOWNGRADED (peor):   ${downgraded}`);

  const avgExtractionLatency =
    results.reduce((sum, r) => sum + r.semanticMeta.extractionLatencyMs, 0) / results.length;
  const avgSimilarityLatency =
    results.reduce((sum, r) => sum + r.semanticMeta.similarityLatencyMs, 0) / results.length;

  console.log(`\n  Avg extraction latency: ${avgExtractionLatency.toFixed(0)}ms`);
  console.log(`  Avg similarity latency: ${avgSimilarityLatency.toFixed(0)}ms`);

  // Write report
  const dir = resolve(__dirname, "../reports/semantic-batch");
  mkdirSync(dir, { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    totalCases: results.length,
    upgraded,
    same,
    downgraded,
    avgExtractionLatencyMs: Math.round(avgExtractionLatency),
    avgSimilarityLatencyMs: Math.round(avgSimilarityLatency),
    results,
  };

  writeFileSync(resolve(dir, "latest.json"), JSON.stringify(report, null, 2), "utf-8");

  // Write markdown summary
  const md: string[] = [];
  md.push("# Semantic Batch Report");
  md.push(`\n**Timestamp:** ${report.timestamp}`);
  md.push(`**Total:** ${report.totalCases} | UPGRADED: ${upgraded} | SAME: ${same} | DOWNGRADED: ${downgraded}`);
  md.push(`\n**Avg Latency:** Extraction ${report.avgExtractionLatencyMs}ms | Similarity ${report.avgSimilarityLatencyMs}ms\n`);

  md.push("## Cases with Changes\n");

  for (const r of results.filter((r) => r.improvement !== "SAME")) {
    md.push(`### ${r.caseId} — ${r.improvement}`);
    md.push(`**${r.title}**\n`);
    md.push(`| | Deterministic | Semantic |`);
    md.push(`|--|--|--|`);
    md.push(`| Classification | ${r.deterministicResult.classification} | ${r.semanticResult.classification} |`);
    md.push(`| Top Family | ${r.deterministicResult.topFamily} | ${r.semanticResult.topFamily} |`);
    md.push(`| Top Score | ${r.deterministicResult.topFamilyScore} | ${r.semanticResult.topFamilyScore} |`);
    md.push(`| Signals Detected | — | ${r.semanticMeta.signalsDetected} |`);
    md.push(`| Similar Cases Found | — | ${r.semanticMeta.similarMatchesFound} |`);
    if (r.semanticMeta.topSimilarCase) {
      md.push(`| Top Similar | — | ${r.semanticMeta.topSimilarCase} (${r.semanticMeta.topSimilarity}) |`);
    }
    md.push("");
  }

  md.push("\n## All Results\n");
  md.push("| Case | Det. | Sem. | Change | Signals | Similarity |");
  md.push("|------|------|------|--------|---------|------------|");
  for (const r of results) {
    md.push(`| ${r.caseId.replace("cand_", "")} | ${r.deterministicResult.classification} | ${r.semanticResult.classification} | ${r.improvement} | ${r.semanticMeta.signalsDetected} | ${r.semanticMeta.similarMatchesFound} matches |`);
  }

  writeFileSync(resolve(dir, "latest.md"), md.join("\n"), "utf-8");

  console.log("\nReportes en web/reports/semantic-batch/");
}

main().catch(console.error);
