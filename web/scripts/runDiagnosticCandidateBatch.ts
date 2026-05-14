/**
 * Diagnostic Candidate Batch Runner
 *
 * Runs all cases in diagnosticCandidateCases through the analysis pipeline
 * and generates JSON + Markdown reports.
 *
 * This script is READ-ONLY with respect to the diagnostic system:
 * - Does NOT modify engines, scorers, judges, or results
 * - Does NOT modify learnedCases or seedDiagnosticCases
 * - Does NOT promote cases automatically
 * - Only reads cases, runs the existing pipeline, and writes reports
 *
 * Usage: npm run diagnostic:batch
 */

import { resolve, dirname } from "path";
import { mkdirSync, writeFileSync } from "fs";
import { diagnosticCandidateCases } from "../lib/testing/diagnosticCandidateCases";
import { runAnalysisPipeline } from "../lib/engines/analysisPipeline";
import { runAffinityPipelineBridge } from "../lib/engines/affinityPipelineBridge";
import { normalizeUserIntake } from "../lib/engines/intakeEngine";
import { selectGuidedThemes } from "../lib/engines/guidedThemeSelector";
import type { DiagnosticCandidateCase } from "../lib/types/diagnosticCandidateCases";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FamilyScoreEntry = {
  id: string;
  label: string;
  score: number;
  confidence: number;
};

type CaseBatchResult = {
  caseId: string;
  title: string;
  category: string;
  expectedResultType: string;
  expectedPrimaryFamily: string | undefined;
  actualResultType: string | null;
  actualCorePattern: string | null;
  actualTopFamilies: FamilyScoreEntry[];
  topAffinities: { id: string; score: number; status: string }[];
  buriedCapacities: { id: string; score: number; status: string }[];
  finalDiagnosticSummary: string | null;
  followupAvailable: boolean;
  guidedThemes: string[];
  negativeEvidenceReview: unknown | null;
  pipelineOk: boolean;
  error: string | null;
  classification: "PASS" | "REVIEW" | "FAIL" | "CALIBRATION_ONLY" | "ERROR";
};

type BatchReport = {
  timestamp: string;
  totalCases: number;
  byCategory: Record<string, number>;
  byExpectedResultType: Record<string, number>;
  byClassification: Record<string, number>;
  results: CaseBatchResult[];
};

// ---------------------------------------------------------------------------
// Transform candidate userInput → pipeline-compatible Partial<UserIntake>
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Run single case
// ---------------------------------------------------------------------------

function runSingleCase(c: DiagnosticCandidateCase): CaseBatchResult {
  const base: Omit<CaseBatchResult, "actualResultType" | "actualCorePattern" | "actualTopFamilies" | "topAffinities" | "buriedCapacities" | "finalDiagnosticSummary" | "followupAvailable" | "guidedThemes" | "negativeEvidenceReview" | "pipelineOk" | "error" | "classification"> = {
    caseId: c.id,
    title: c.title,
    category: c.category,
    expectedResultType: c.expected.resultType,
    expectedPrimaryFamily: c.expected.primaryFamily,
  };

  try {
    const payload = candidateToIntakePayload(c);
    const pipeline = runAnalysisPipeline(payload as any);

    if (!pipeline.ok) {
      const intake = normalizeUserIntake(payload as any);
      const bridge = runAffinityPipelineBridge({ intake });
      const families = extractFamilies(bridge.familyScores);

      return {
        ...base,
        actualResultType: null,
        actualCorePattern: null,
        actualTopFamilies: families,
        topAffinities: extractAffinities(bridge.topAffinities),
        buriedCapacities: extractAffinities(bridge.buriedCapacities),
        finalDiagnosticSummary: null,
        followupAvailable: false,
        guidedThemes: [],
        negativeEvidenceReview: null,
        pipelineOk: false,
        error: `Pipeline failed: missing fields [${pipeline.missingFields?.join(", ") ?? "unknown"}]`,
        classification: "ERROR",
      };
    }

    const data = pipeline.data;
    const families = extractFamilies(data.familyScores);
    const topAff = extractAffinities(data.topAffinities);
    const buried = extractAffinities(data.buriedCapacities);

    const contextForThemes = {
      resultType: data.resultType,
      corePattern: data.corePattern,
      familyScores: data.familyScores,
      affinityScores: data.affinityScores,
      topAffinities: data.topAffinities,
      buriedCapacities: data.buriedCapacities,
    };
    const themes = selectGuidedThemes(contextForThemes, 5);

    const summaryText =
      data.summaryForUser?.diagnostico ??
      data.summaryForUser?.hilo_conductor ??
      null;

    const negEvReview = (data as any).negativeEvidenceReview ?? null;

    const classification = classifyResult(c, data.resultType, data.corePattern, families);

    return {
      ...base,
      actualResultType: data.resultType,
      actualCorePattern: data.corePattern,
      actualTopFamilies: families,
      topAffinities: topAff,
      buriedCapacities: buried,
      finalDiagnosticSummary: summaryText,
      followupAvailable: !!pipeline.followup?.shouldAskFollowup,
      guidedThemes: themes.map((t) => t.theme.id),
      negativeEvidenceReview: negEvReview,
      pipelineOk: true,
      error: null,
      classification,
    };
  } catch (err) {
    return {
      ...base,
      actualResultType: null,
      actualCorePattern: null,
      actualTopFamilies: [],
      topAffinities: [],
      buriedCapacities: [],
      finalDiagnosticSummary: null,
      followupAvailable: false,
      guidedThemes: [],
      negativeEvidenceReview: null,
      pipelineOk: false,
      error: String(err),
      classification: "ERROR",
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function extractAffinities(raw: unknown): { id: string; score: number; status: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 6).map((a: any) => ({
    id: a.id ?? "",
    score: typeof a.score === "number" ? Number(a.score.toFixed(3)) : 0,
    status: a.status ?? "unknown",
  }));
}

function classifyResult(
  c: DiagnosticCandidateCase,
  actualResultType: string,
  actualCorePattern: string,
  families: FamilyScoreEntry[],
): "PASS" | "REVIEW" | "FAIL" | "CALIBRATION_ONLY" | "ERROR" {
  if (c.validation.recommendedInitialUse === "calibration_only") {
    return "CALIBRATION_ONLY";
  }

  const topFamilyId = families[0]?.id ?? "";
  const exp = c.expected;

  const resultTypeMatch = actualResultType === exp.resultType;

  const primaryMatch =
    !exp.primaryFamily ||
    topFamilyId === exp.primaryFamily ||
    (exp.acceptablePrimaryFamilies ?? []).includes(topFamilyId);

  const shouldNotWinViolation =
    (exp.shouldNotWin ?? []).includes(topFamilyId);

  if (shouldNotWinViolation) return "FAIL";
  if (resultTypeMatch && primaryMatch) return "PASS";
  if (resultTypeMatch || primaryMatch) return "REVIEW";
  return "FAIL";
}

// ---------------------------------------------------------------------------
// Report generation
// ---------------------------------------------------------------------------

function buildMarkdown(report: BatchReport): string {
  const lines: string[] = [];

  lines.push("# Diagnostic Candidate Batch Report");
  lines.push("");
  lines.push(`**Timestamp:** ${report.timestamp}`);
  lines.push(`**Total cases:** ${report.totalCases}`);
  lines.push("");

  lines.push("## Summary by Classification");
  lines.push("");
  for (const [k, v] of Object.entries(report.byClassification)) {
    lines.push(`- **${k}:** ${v}`);
  }
  lines.push("");

  lines.push("## Summary by Category");
  lines.push("");
  for (const [k, v] of Object.entries(report.byCategory)) {
    lines.push(`- ${k}: ${v}`);
  }
  lines.push("");

  lines.push("## Summary by Expected ResultType");
  lines.push("");
  for (const [k, v] of Object.entries(report.byExpectedResultType)) {
    lines.push(`- ${k}: ${v}`);
  }
  lines.push("");

  const grouped: Record<string, CaseBatchResult[]> = {};
  for (const r of report.results) {
    if (!grouped[r.classification]) grouped[r.classification] = [];
    grouped[r.classification].push(r);
  }

  for (const cls of ["PASS", "REVIEW", "FAIL", "CALIBRATION_ONLY", "ERROR"] as const) {
    const items = grouped[cls];
    if (!items || items.length === 0) continue;

    lines.push(`## ${cls} (${items.length})`);
    lines.push("");

    for (const r of items) {
      lines.push(`### ${r.caseId}`);
      lines.push("");
      lines.push(`**${r.title}** | Category: ${r.category}`);
      lines.push("");
      lines.push(`| Field | Expected | Actual |`);
      lines.push(`|-------|----------|--------|`);
      lines.push(`| resultType | ${r.expectedResultType} | ${r.actualResultType ?? "—"} |`);
      lines.push(`| primaryFamily | ${r.expectedPrimaryFamily ?? "—"} | ${r.actualTopFamilies[0]?.id ?? "—"} |`);
      lines.push(`| corePattern | — | ${r.actualCorePattern ?? "—"} |`);
      lines.push("");

      if (r.actualTopFamilies.length > 0) {
        lines.push("**Top Families:**");
        for (const f of r.actualTopFamilies) {
          lines.push(`  - ${f.id}: score=${f.score}, conf=${f.confidence}`);
        }
        lines.push("");
      }

      if (r.error) {
        lines.push(`**Error:** ${r.error}`);
        lines.push("");
      }

      lines.push("---");
      lines.push("");
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log("=== Diagnostic Candidate Batch Runner ===\n");

  if (diagnosticCandidateCases.length === 0) {
    console.log("No hay casos candidatos en diagnosticCandidateCases. Nada que ejecutar.");
    console.log("Pegá casos en web/lib/testing/diagnosticCandidateCases.ts y volvé a correr.");

    const emptyReport: BatchReport = {
      timestamp: new Date().toISOString(),
      totalCases: 0,
      byCategory: {},
      byExpectedResultType: {},
      byClassification: {},
      results: [],
    };

    writeReports(emptyReport);
    return;
  }

  console.log(`Corriendo ${diagnosticCandidateCases.length} caso(s)...\n`);

  const results: CaseBatchResult[] = [];

  for (const c of diagnosticCandidateCases) {
    process.stdout.write(`  [${c.id}] ...`);
    const result = runSingleCase(c);
    results.push(result);
    console.log(` ${result.classification}`);
  }

  const byCategory: Record<string, number> = {};
  const byExpectedResultType: Record<string, number> = {};
  const byClassification: Record<string, number> = {};

  for (const r of results) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    byExpectedResultType[r.expectedResultType] = (byExpectedResultType[r.expectedResultType] ?? 0) + 1;
    byClassification[r.classification] = (byClassification[r.classification] ?? 0) + 1;
  }

  const report: BatchReport = {
    timestamp: new Date().toISOString(),
    totalCases: results.length,
    byCategory,
    byExpectedResultType,
    byClassification,
    results,
  };

  writeReports(report);

  console.log("\n=== Resumen ===");
  console.log(`Total: ${report.totalCases}`);
  for (const [k, v] of Object.entries(byClassification)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log("\nReportes generados en web/reports/diagnostic-batch/");
}

function writeReports(report: BatchReport) {
  const dir = resolve(__dirname, "../reports/diagnostic-batch");
  mkdirSync(dir, { recursive: true });

  const jsonPath = resolve(dir, "latest.json");
  const mdPath = resolve(dir, "latest.md");

  writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf-8");
  writeFileSync(mdPath, buildMarkdown(report), "utf-8");
}

main();
