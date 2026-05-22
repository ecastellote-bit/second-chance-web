/**
 * Golden set — Panel de Juez Diagnóstico (5 sub-jueces + calibrador).
 *
 * Usage: npm run diagnostic:golden
 *
 * Anti-cebado: reglas universales; Estefi es caso refractario, no único criterio.
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
import type { DiagnosticJudgeFinding } from "../lib/types/diagnosticJudges";

type PanelGoldenSpec = {
  id: string;
  /** Veredicto agregado esperado (o uno de los aceptados). */
  finalVerdictOneOf: string[];
  /** Sub-jueces que NO deben emitir conflict. */
  forbidConflictFrom?: string[];
  /** Sub-jueces que NO deben emitir red_flag. */
  forbidRedFlagFrom?: string[];
  /** shouldRequestHumanReview esperado. */
  expectHumanReview?: boolean;
  /** Si true, similar_case no debe ser conflict. */
  similarCaseNotConflict?: boolean;
};

const SPECS: PanelGoldenSpec[] = [
  {
    id: "estefi_pioneer",
    finalVerdictOneOf: ["frontier", "aligned", "aligned_with_caution"],
    forbidConflictFrom: ["similar_case_judge"],
    similarCaseNotConflict: true,
    expectHumanReview: false,
  },
  {
    id: "voc_human_01_voz_publica_encerrada",
    finalVerdictOneOf: ["aligned", "frontier", "aligned_with_caution"],
    forbidRedFlagFrom: ["anti_overfit_judge"],
    expectHumanReview: false,
  },
  {
    id: "voc_human_02_narrador_sin_puerta",
    finalVerdictOneOf: ["frontier", "aligned"],
    expectHumanReview: false,
  },
  {
    id: "voc_human_03_guia_empatico_sin_cauce",
    finalVerdictOneOf: ["frontier", "aligned", "aligned_with_caution"],
    forbidRedFlagFrom: ["anti_overfit_judge"],
    expectHumanReview: false,
  },
  {
    id: "fail_ref_creative_storyteller_compressed",
    finalVerdictOneOf: ["aligned", "frontier", "red_flag"],
    forbidConflictFrom: ["similar_case_judge"],
    similarCaseNotConflict: true,
    expectHumanReview: false,
  },
  {
    id: "fail_ref_system_designer_parches",
    finalVerdictOneOf: ["frontier", "conflict", "aligned_with_caution", "aligned"],
    forbidConflictFrom: ["similar_case_judge"],
    similarCaseNotConflict: true,
    expectHumanReview: false,
  },
  {
    id: "fail_ref_operational_organizer_burnout",
    finalVerdictOneOf: ["aligned", "frontier", "red_flag", "aligned_with_caution"],
    expectHumanReview: false,
  },
  {
    id: "fail_ref_empathic_guide_overload",
    finalVerdictOneOf: ["aligned", "frontier", "aligned_with_caution"],
    forbidRedFlagFrom: ["anti_overfit_judge"],
    expectHumanReview: false,
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
  finalVerdict: string;
  shouldRequestHumanReview: boolean;
  findings: { judgeId: string; verdict: string }[];
  errors: string[];
};

function runSpec(spec: PanelGoldenSpec): CaseResult {
  const payload = loadPayload(spec.id);
  const errors: string[] = [];

  if (!payload) {
    return {
      id: spec.id,
      ok: false,
      finalVerdict: "",
      shouldRequestHumanReview: false,
      findings: [],
      errors: ["no payload"],
    };
  }

  const result = runAnalysisPipeline(normalizeUserIntake(payload));
  if (!result.ok) {
    return {
      id: spec.id,
      ok: false,
      finalVerdict: "",
      shouldRequestHumanReview: false,
      findings: [],
      errors: ["pipeline fail"],
    };
  }

  const review = result.data.diagnosticReview ?? result.data.diagnosticJudgeReview;
  const finalVerdict = String(
    (review as { finalVerdict?: string })?.finalVerdict ?? "",
  );
  const shouldRequestHumanReview =
    (review as { shouldRequestHumanReview?: boolean })?.shouldRequestHumanReview ===
    true;

  const findings: DiagnosticJudgeFinding[] =
    (review as { findings?: DiagnosticJudgeFinding[] })?.findings ?? [];

  const findingSummary = findings.map((f) => ({
    judgeId: f.judgeId,
    verdict: f.verdict,
  }));

  if (!spec.finalVerdictOneOf.includes(finalVerdict)) {
    errors.push(
      `finalVerdict=${finalVerdict} not in [${spec.finalVerdictOneOf.join(", ")}]`,
    );
  }

  if (spec.expectHumanReview === false && shouldRequestHumanReview) {
    errors.push("shouldRequestHumanReview=true but expected false");
  }

  for (const judgeId of spec.forbidConflictFrom ?? []) {
    const f = findings.find((x) => x.judgeId === judgeId);
    if (f?.verdict === "conflict") {
      errors.push(`${judgeId} emitted conflict`);
    }
  }

  for (const judgeId of spec.forbidRedFlagFrom ?? []) {
    const f = findings.find((x) => x.judgeId === judgeId);
    if (f?.verdict === "red_flag") {
      errors.push(`${judgeId} emitted red_flag`);
    }
  }

  if (spec.similarCaseNotConflict) {
    const sc = findings.find((x) => x.judgeId === "similar_case_judge");
    if (sc?.verdict === "conflict") {
      errors.push("similar_case_judge conflict on weak/mismatched memory");
    }
  }

  return {
    id: spec.id,
    ok: errors.length === 0,
    finalVerdict,
    shouldRequestHumanReview,
    findings: findingSummary,
    errors,
  };
}

const results = SPECS.map(runSpec);
const passed = results.filter((r) => r.ok).length;
const total = results.length;

console.log("\n=== Diagnostic Panel Golden Set ===\n");
for (const r of results) {
  console.log(r.ok ? "PASS" : "FAIL", r.id);
  console.log("  finalVerdict:", r.finalVerdict, "humanReview:", r.shouldRequestHumanReview);
  for (const f of r.findings) {
    console.log(`    ${f.judgeId}: ${f.verdict}`);
  }
  if (r.errors.length) {
    for (const e of r.errors) console.log("  !", e);
  }
}

console.log(`\n${passed}/${total} PASS\n`);

const reportDir = path.resolve(process.cwd(), "data/reports");
mkdirSync(reportDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
writeFileSync(
  path.join(reportDir, `diagnostic-panel-golden-${stamp}.json`),
  JSON.stringify({ passed, total, results }, null, 2),
);

process.exit(passed === total ? 0 : 1);
