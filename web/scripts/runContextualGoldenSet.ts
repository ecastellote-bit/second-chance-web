/**
 * Golden set — Juez Contextual (fuerzas + influencia en sentencia + post-embudo).
 * Usage: npm run contextual:golden
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
import type { ContextualSituationReview } from "../lib/engines/contextualSituationJudge";

type Spec = {
  id: string;
  expectInfluenceSentence?: boolean;
  expectThemeHints?: boolean;
  forbidCommunityRaise?: boolean;
  expectContributionApplied?: boolean;
  expectVerdictOneOf?: string[];
  expectForceKinds?: string[];
  forbidForceKinds?: string[];
};

const SPECS: Spec[] = [
  {
    id: "estefi_pioneer",
    expectInfluenceSentence: true,
    expectContributionApplied: true,
    expectVerdictOneOf: [
      "context_supports_current_reading",
      "context_suggests_frontier",
    ],
    expectForceKinds: ["creative_narrative_expression", "compressed_capacity"],
    forbidForceKinds: ["technical_practical_construction"],
    forbidCommunityRaise: true,
  },
  {
    id: "voc_human_01_voz_publica_encerrada",
    expectThemeHints: true,
    expectForceKinds: ["public_voice_or_communication"],
    forbidCommunityRaise: true,
  },
  {
    id: "voc_human_03_guia_empatico_sin_cauce",
    expectInfluenceSentence: true,
    expectForceKinds: ["care_listening_or_emotional_support"],
    forbidCommunityRaise: true,
  },
  {
    id: "voc_human_02_narrador_sin_puerta",
    expectInfluenceSentence: true,
    expectForceKinds: ["creative_narrative_expression"],
  },
  {
    id: "fail_ref_creative_storyteller_compressed",
    expectInfluenceSentence: true,
    expectForceKinds: ["compressed_capacity"],
    expectContributionApplied: true,
  },
  {
    id: "fail_ref_empathic_guide_overload",
    expectInfluenceSentence: true,
    forbidCommunityRaise: true,
  },
];

function loadPayload(id: string): Partial<UserIntake> | null {
  if (id === "estefi_pioneer") return buildEstefiLabPayload();
  const human = HUMAN_LANGUAGE_CASES.find((c) => c.id === id);
  if (human) return human.payload as Partial<UserIntake>;
  const failRef = FAIL_REF_LAB_CASES.find((c) => c.id === id);
  return failRef?.payload ?? null;
}

function runSpec(spec: Spec) {
  const errors: string[] = [];
  const payload = loadPayload(spec.id);
  if (!payload) return { id: spec.id, ok: false, errors: ["no payload"] };

  const result = runAnalysisPipeline(normalizeUserIntake(payload));
  if (!result.ok) return { id: spec.id, ok: false, errors: ["pipeline fail"] };

  const pipelineData = result.data as typeof result.data & {
    contextualSituationReview?: ContextualSituationReview;
    contextualReview?: ContextualSituationReview;
    trace?: Record<string, unknown>;
  };
  const ctx =
    pipelineData.contextualSituationReview ?? pipelineData.contextualReview;

  const trace = pipelineData.trace;
  const contribution = trace?.contextualDiagnosticContribution as
    | { applied?: boolean }
    | undefined;

  if (!ctx) {
    errors.push("missing contextualSituationReview");
    return { id: spec.id, ok: false, errors };
  }

  if (spec.expectVerdictOneOf && !spec.expectVerdictOneOf.includes(ctx.verdict)) {
    errors.push(`verdict=${ctx.verdict}`);
  }

  if (spec.expectInfluenceSentence && !ctx.diagnosticContributionPlan?.influenceSentence) {
    errors.push("diagnosticContributionPlan.influenceSentence false");
  }

  if (spec.expectThemeHints && (ctx.themeHints?.length ?? 0) < 1) {
    errors.push("expected themeHints");
  }

  if (spec.expectContributionApplied && contribution?.applied !== true) {
    errors.push("contextualDiagnosticContribution not applied");
  }

  const forceKinds = (ctx.forces ?? []).map((f) => f.kind);

  for (const kind of spec.expectForceKinds ?? []) {
    if (!forceKinds.includes(kind as typeof forceKinds[number])) {
      errors.push(`missing force ${kind}`);
    }
  }

  for (const kind of spec.forbidForceKinds ?? []) {
    if (forceKinds.includes(kind as typeof forceKinds[number])) {
      errors.push(`forbidden force ${kind}`);
    }
  }

  if (spec.forbidCommunityRaise) {
    const cb = (ctx.familyAdjustments ?? []).find(
      (a) => a.family === "community_builder" && a.direction === "raise",
    );
    if (cb) errors.push("community_builder raised");
  }

  const summary = result.data.summaryForUser;
  if (spec.expectContributionApplied && summary?.tensiones) {
    const hasContext =
      summary.tensiones.length > 80 || (summary.cierre?.length ?? 0) > 120;
    if (!hasContext) errors.push("summary lacks contextual enrichment");
  }

  return {
    id: spec.id,
    ok: errors.length === 0,
    errors,
    verdict: ctx.verdict,
    shouldInfluence: ctx.shouldInfluenceDiagnostic,
    forces: forceKinds,
    applied: contribution?.applied,
  };
}

const results = SPECS.map(runSpec);
const passed = results.filter((r) => r.ok).length;

console.log("\n=== Contextual Judge Golden ===\n");
for (const r of results) {
  console.log(r.ok ? "PASS" : "FAIL", r.id, r.verdict, "influence", r.shouldInfluence);
  if (!r.ok) r.errors.forEach((e) => console.log("  !", e));
}
console.log(`\n${passed}/${results.length} PASS\n`);

const reportDir = path.resolve(process.cwd(), "data/reports");
mkdirSync(reportDir, { recursive: true });
writeFileSync(
  path.join(
    reportDir,
    `contextual-golden-${new Date().toISOString().replace(/[:.]/g, "-")}.json`,
  ),
  JSON.stringify({ passed, total: results.length, results }, null, 2),
);

process.exit(passed === results.length ? 0 : 1);
