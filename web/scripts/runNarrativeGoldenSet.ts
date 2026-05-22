/**
 * Golden set — Juez de coherencia narrativa + palancas Fase 2 (lab)
 *
 * Usage: npx tsx scripts/runNarrativeGoldenSet.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { readFileSync, mkdirSync, writeFileSync } from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { runAnalysisPipeline } from "../lib/engines/analysisPipeline";
import { runAffinityPipelineBridge } from "../lib/engines/affinityPipelineBridge";
import { normalizeUserIntake } from "../lib/engines/intakeEngine";
import { extractSemanticSignals } from "../lib/engines/semanticExtractor";
import { findSemanticallySimilarCases } from "../lib/engines/semanticSimilarityEngine";
import { runNarrativeCoherenceJudge } from "../lib/engines/narrativeCoherenceJudge";
import {
  applyNarrativeCoherenceLevers,
  getMotorTopFamilyId,
} from "../lib/engines/narrativeCoherenceAdjudication";
import { HUMAN_LANGUAGE_CASES } from "../lib/testing/humanLanguageCases";
import { buildEstefiLabPayload } from "../lib/testing/estefiLabPayload";
import { FAIL_REF_LAB_CASES } from "../lib/testing/failRefLabPayloads";
import type { UserIntake } from "../lib/types/intake";
import type { NarrativeCoherenceVerdict } from "../lib/types/narrativeCoherence";

type GoldenSpec = {
  id: string;
  group: "obligatorio" | "alineado";
  expectedVerdict: NarrativeCoherenceVerdict | "mismatch_if_rival_top";
  expectCompressionFlag?: boolean;
  expectLevers?: boolean;
  expectedPrimaryFamily?: string;
  acceptableFamilies?: string[];
  rivalFamilies?: string[];
  rivalTriggersMismatch?: boolean;
};

const GOLDEN_SPECS: GoldenSpec[] = [
  {
    id: "estefi_pioneer",
    group: "obligatorio",
    expectedVerdict: "narrative_mismatch",
    expectCompressionFlag: true,
    expectLevers: true,
    expectedPrimaryFamily: "empathic_guide",
    acceptableFamilies: [
      "empathic_guide",
      "scientific_investigator",
      "diplomatic_social_connector",
    ],
    rivalFamilies: ["artistic_creator", "technical_builder"],
  },
  {
    id: "voc_human_01_voz_publica_encerrada",
    group: "obligatorio",
    expectedVerdict: "mismatch_if_rival_top",
    expectLevers: true,
    expectedPrimaryFamily: "public_communicator",
    rivalFamilies: ["creative_storyteller"],
    rivalTriggersMismatch: true,
  },
  {
    id: "voc_human_02_narrador_sin_puerta",
    group: "obligatorio",
    expectedVerdict: "mismatch_if_rival_top",
    expectLevers: true,
    expectedPrimaryFamily: "creative_storyteller",
    rivalFamilies: ["public_communicator"],
    rivalTriggersMismatch: true,
  },
  {
    id: "voc_human_03_guia_empatico_sin_cauce",
    group: "obligatorio",
    expectedVerdict: "mismatch_if_rival_top",
    expectedPrimaryFamily: "empathic_guide",
    rivalFamilies: ["community_builder", "diplomatic_social_connector"],
    rivalTriggersMismatch: true,
  },
  {
    id: "fail_ref_creative_storyteller_compressed",
    group: "obligatorio",
    expectedVerdict: "narrative_mismatch",
    expectCompressionFlag: true,
    expectLevers: true,
    expectedPrimaryFamily: "creative_storyteller",
    acceptableFamilies: ["creative_storyteller", "artistic_creator"],
    rivalFamilies: ["public_communicator", "empathic_guide"],
  },
  {
    id: "fail_ref_system_designer_parches",
    group: "obligatorio",
    expectedVerdict: "narrative_mismatch",
    expectLevers: false,
    expectedPrimaryFamily: "system_designer",
    acceptableFamilies: ["system_designer", "analytical_strategist"],
    rivalFamilies: ["technical_builder"],
  },
  {
    id: "fail_ref_operational_organizer_burnout",
    group: "obligatorio",
    expectedVerdict: "narrative_mismatch",
    expectCompressionFlag: true,
    expectLevers: false,
    expectedPrimaryFamily: "operational_organizer",
    acceptableFamilies: ["operational_organizer", "resource_steward"],
    rivalFamilies: ["empathic_guide", "technical_builder"],
  },
  {
    id: "fail_ref_empathic_guide_overload",
    group: "obligatorio",
    expectedVerdict: "narrative_mismatch",
    expectCompressionFlag: true,
    expectLevers: false,
    expectedPrimaryFamily: "empathic_guide",
    acceptableFamilies: ["empathic_guide"],
    rivalFamilies: ["diplomatic_social_connector"],
  },
  {
    id: "voc_t12_conector_claro",
    group: "alineado",
    expectedVerdict: "aligned",
    expectedPrimaryFamily: "diplomatic_social_connector",
  },
  {
    id: "voc_t1_escucha_uno_a_uno",
    group: "alineado",
    expectedVerdict: "aligned",
    expectedPrimaryFamily: "empathic_guide",
  },
  {
    id: "voc_t9_publico_con_postura",
    group: "alineado",
    expectedVerdict: "aligned",
    acceptableFamilies: ["public_communicator"],
  },
];

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeLabPayload(payload: Record<string, unknown>): Partial<UserIntake> {
  if (payload.narrative && payload.currentContext) {
    const n = payload.narrative as Record<string, unknown>;
    const c = payload.currentContext as Record<string, unknown>;
    return {
      profile: {
        age: (payload.profile as { age?: number })?.age ?? 42,
        country: (payload.profile as { country?: string })?.country ?? "Argentina",
        language: (payload.profile as { language?: string })?.language ?? "es",
        employmentStatus:
          ((payload.profile as { employmentStatus?: string })?.employmentStatus as UserIntake["profile"]["employmentStatus"]) ??
          "employed",
        educationLevel:
          (payload.profile as { educationLevel?: string })?.educationLevel ?? "tertiary",
      },
      narrative: {
        childhoodMemories: String(n.childhoodMemories ?? n.earlyFascinations ?? ""),
        earlyFascinations: String(n.earlyFascinations ?? ""),
        meaningfulSchoolSubjects: String(n.meaningfulSchoolSubjects ?? ""),
        repeatedWorkPatterns: String(n.repeatedWorkPatterns ?? ""),
        naturalSocialRoles: String(n.naturalSocialRoles ?? ""),
        lossesOrRenunciations: String(n.lossesOrRenunciations ?? ""),
        whatFeelsCompressedNow: String(n.whatFeelsCompressedNow ?? ""),
        additionalContext: String(n.additionalContext ?? ""),
      },
      currentContext: {
        currentSituation: String(c.currentSituation ?? ""),
        transitionGoal: String(c.transitionGoal ?? ""),
        restrictions: toArray(c.restrictions),
        assets: toArray(c.assets),
      },
    };
  }

  if (payload.narrative && typeof payload.narrative === "object") {
    const n = payload.narrative as Record<string, unknown>;
    return {
      profile: {
        age: (payload.profile as { age?: number })?.age ?? 42,
        country: (payload.profile as { country?: string })?.country ?? "Argentina",
        language: (payload.profile as { language?: string })?.language ?? "es",
        employmentStatus: "employed",
        educationLevel: "tertiary",
      },
      narrative: {
        childhoodMemories: String(n.childhoodMemories ?? n.earlyFascinations ?? ""),
        earlyFascinations: String(n.earlyFascinations ?? ""),
        meaningfulSchoolSubjects: String(n.meaningfulSchoolSubjects ?? ""),
        repeatedWorkPatterns: String(n.repeatedWorkPatterns ?? ""),
        naturalSocialRoles: String(n.naturalSocialRoles ?? ""),
        lossesOrRenunciations: String(n.lossesOrRenunciations ?? ""),
        whatFeelsCompressedNow: String(n.whatFeelsCompressedNow ?? ""),
        additionalContext: String(n.additionalContext ?? ""),
      },
      currentContext: {
        currentSituation: String(n.currentSituation ?? ""),
        restrictions: toArray(n.restrictions),
        assets: toArray(n.assets),
      },
    };
  }

  return payload as Partial<UserIntake>;
}

function resolvePayload(specId: string): Partial<UserIntake> | null {
  if (specId === "estefi_pioneer") {
    return buildEstefiLabPayload();
  }

  const human = HUMAN_LANGUAGE_CASES.find((c) => c.id === specId);
  if (human) {
    return normalizeLabPayload(human.payload as Record<string, unknown>);
  }

  const failRef = FAIL_REF_LAB_CASES.find((c) => c.id === specId);
  if (failRef) {
    return failRef.payload;
  }

  return null;
}

function extractNarrativeText(intake: UserIntake): string {
  return [
    ...Object.values(intake.narrative),
    intake.currentContext.currentSituation,
    intake.currentContext.transitionGoal,
  ]
    .filter((v) => typeof v === "string" && v.trim())
    .join("\n");
}

type RowResult = {
  id: string;
  group: string;
  ok: boolean;
  error?: string;
  motorTop?: string;
  motorResultType?: string;
  motorCorePattern?: string;
  verdict?: NarrativeCoherenceVerdict;
  confidence?: number;
  narrativeFamily?: string;
  compressionFlag?: boolean;
  directionFit?: string;
  compressionConcern?: string;
  closureRisk?: string;
  leversApplied?: boolean;
  levers?: string[];
  corePatternAfter?: string;
  verdictPass?: boolean;
  familyPass?: boolean;
  compressionPass?: boolean;
  leversPass?: boolean;
  diffNote?: string;
};

function evaluateRow(spec: GoldenSpec, row: RowResult): RowResult {
  if (!row.ok || !row.verdict) return row;

  let expectedVerdict = spec.expectedVerdict;
  if (spec.expectedVerdict === "mismatch_if_rival_top" && spec.rivalTriggersMismatch) {
    const rivalOnTop =
      Boolean(row.motorTop) &&
      Boolean(spec.rivalFamilies?.includes(row.motorTop!));
    const motorMatchesExpected =
      Boolean(row.motorTop) && row.motorTop === spec.expectedPrimaryFamily;
    expectedVerdict = rivalOnTop
      ? "narrative_mismatch"
      : motorMatchesExpected
        ? "aligned"
        : "aligned";
  }

  const verdictPass =
    expectedVerdict === "aligned"
      ? row.verdict === "aligned" || row.verdict === "frontier"
      : row.verdict === expectedVerdict ||
        (expectedVerdict === "narrative_mismatch" &&
          (row.verdict === "narrative_mismatch" ||
            row.verdict === "red_flag" ||
            row.verdict === "frontier"));

  const motorMatchesExpected =
    Boolean(spec.expectedPrimaryFamily) &&
    row.motorTop === spec.expectedPrimaryFamily;

  const familyPass = spec.expectedPrimaryFamily
    ? row.narrativeFamily === spec.expectedPrimaryFamily ||
      spec.acceptableFamilies?.includes(row.narrativeFamily ?? "") === true ||
      (motorMatchesExpected && !row.narrativeFamily)
    : spec.acceptableFamilies
      ? spec.acceptableFamilies.includes(row.narrativeFamily ?? "")
      : true;

  const compressionPass = spec.expectCompressionFlag
    ? row.compressionFlag === true
    : true;

  const leversPass =
    spec.expectLevers && !motorMatchesExpected
      ? row.leversApplied === true
      : spec.group === "alineado" || motorMatchesExpected
        ? row.leversApplied !== true
        : true;

  let diffNote = "";
  if (row.leversApplied && row.motorCorePattern !== row.corePatternAfter) {
    diffNote = `cierre: ${row.motorCorePattern} → ${row.corePatternAfter}`;
  } else if (row.leversApplied) {
    diffNote = "palancas (copy/review)";
  }

  return {
    ...row,
    verdictPass,
    familyPass,
    compressionPass,
    leversPass,
    diffNote,
  };
}

async function runCase(spec: GoldenSpec): Promise<RowResult> {
  const raw = resolvePayload(spec.id);
  if (!raw) {
    return {
      id: spec.id,
      group: spec.group,
      ok: false,
      error: "payload_not_found",
    };
  }

  const intake = normalizeUserIntake(raw);
  const narrativeText = extractNarrativeText(intake);

  const [semanticSignals, semanticSimilarity] = await Promise.all([
    extractSemanticSignals(narrativeText),
    findSemanticallySimilarCases(narrativeText),
  ]);

  const pipeline = runAnalysisPipeline({
    ...raw,
    _semanticSignals: semanticSignals,
    _semanticSimilarity: semanticSimilarity,
  });

  if (!pipeline.ok) {
    return {
      id: spec.id,
      group: spec.group,
      ok: false,
      error: `pipeline:${pipeline.missingFields?.join(",")}`,
    };
  }

  const affinityBridge = runAffinityPipelineBridge({ intake, semanticSignals });
  const motorTop = getMotorTopFamilyId(affinityBridge.familyScores);

  const narrative = await runNarrativeCoherenceJudge({
    intake,
    reading: pipeline.data,
    familyScores: affinityBridge.familyScores,
  });

  if (!narrative.ok || !narrative.review) {
    return {
      id: spec.id,
      group: spec.group,
      ok: false,
      error: narrative.error ?? "no_review",
      motorTop,
      motorResultType: pipeline.data.resultType,
      motorCorePattern: pipeline.data.corePattern ?? undefined,
    };
  }

  const r = narrative.review;
  const withLevers = applyNarrativeCoherenceLevers(pipeline.data, r, {
    motorTopFamilyId: motorTop,
    familyScores: affinityBridge.familyScores,
  });
  const adjudication = (
    withLevers.trace as { narrativeAdjudication?: { applied?: boolean; levers?: string[] } }
  )?.narrativeAdjudication;

  const base: RowResult = {
    id: spec.id,
    group: spec.group,
    ok: true,
    motorTop,
    motorResultType: pipeline.data.resultType,
    motorCorePattern: pipeline.data.corePattern ?? undefined,
    verdict: r.verdict,
    confidence: r.confidence,
    narrativeFamily: r.family,
    compressionFlag:
      r.compressionConcern === "high" ||
      r.compressionConcern === "moderate" ||
      r.riskFlags.some((f) => f.type === "compressed_life_undetected"),
    directionFit: r.directionFit,
    compressionConcern: r.compressionConcern,
    closureRisk: r.closureRisk,
    leversApplied: adjudication?.applied === true,
    levers: adjudication?.levers,
    corePatternAfter: withLevers.corePattern ?? undefined,
  };

  return evaluateRow(spec, base);
}

function pad(s: string, n: number): string {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

async function main() {
  console.log("=== Golden set — Juez de coherencia narrativa ===\n");

  const results: RowResult[] = [];
  for (const spec of GOLDEN_SPECS) {
    process.stdout.write(`Corriendo ${spec.id}... `);
    const row = await runCase(spec);
    results.push(row);
    console.log(row.ok ? row.verdict : `ERROR ${row.error}`);
  }

  const obligatory = results.filter((r) => r.group === "obligatorio");
  const aligned = results.filter((r) => r.group === "alineado");

  const oblVerdict = obligatory.filter((r) => r.verdictPass).length;
  const oblFamily = obligatory.filter((r) => r.familyPass).length;
  const oblComp = obligatory.filter((r) => r.compressionPass).length;
  const oblLevers = obligatory.filter((r) => r.leversPass).length;
  const aliNoLevers = aligned.filter((r) => r.leversPass).length;

  console.log("\n--- Tabla ---\n");
  console.log(
    [
      pad("ID", 42),
      pad("motorTop", 22),
      pad("verdict", 18),
      pad("conf", 5),
      pad("family", 22),
      pad("dir", 8),
      pad("comp", 5),
      pad("lev", 4),
      pad("PASS", 5),
      "nota",
    ].join(" "),
  );
  console.log("-".repeat(130));

  for (const r of results) {
    const pass =
      r.ok &&
      r.verdictPass &&
      r.familyPass &&
      r.compressionPass &&
      r.leversPass;
    console.log(
      [
        pad(r.id, 42),
        pad(r.motorTop ?? "-", 22),
        pad(r.verdict ?? r.error ?? "-", 18),
        pad(r.confidence?.toFixed(2) ?? "-", 5),
        pad(r.narrativeFamily ?? "-", 22),
        pad(r.directionFit ?? "-", 8),
        pad(r.compressionConcern ?? "-", 5),
        pad(r.leversApplied ? "Y" : "n", 4),
        pad(pass ? "OK" : "NO", 5),
        r.diffNote ?? "",
      ].join(" "),
    );
  }

  console.log("\n--- Gate ---");
  console.log(`Obligatorios veredicto: ${oblVerdict}/${obligatory.length} (meta ≥7/8)`);
  console.log(`Obligatorios family útil: ${oblFamily}/${obligatory.length}`);
  console.log(`Obligatorios compresión: ${oblComp}/${obligatory.length}`);
  console.log(`Obligatorios palancas esperadas: ${oblLevers}/${obligatory.length}`);
  console.log(`Alineados sin palanca indebida: ${aliNoLevers}/${aligned.length} (meta ≥2/3)`);

  const outDir = path.resolve(process.cwd(), "data/reports");
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(outDir, `narrative-golden-${stamp}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          obligatoryVerdict: `${oblVerdict}/${obligatory.length}`,
          obligatoryFamily: `${oblFamily}/${obligatory.length}`,
          obligatoryCompression: `${oblComp}/${obligatory.length}`,
          obligatoryLevers: `${oblLevers}/${obligatory.length}`,
          alignedNoFalseLevers: `${aliNoLevers}/${aligned.length}`,
        },
        results,
      },
      null,
      2,
    ),
  );
  console.log(`\nJSON: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
