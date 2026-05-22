/**
 * Golden set — Compositor de presentación (narrativo como columna vertebral).
 * Usage: npm run presentation:golden
 */
import * as path from "path";
import * as dotenv from "dotenv";
import { mkdirSync, writeFileSync } from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { runAnalysisPipeline } from "../lib/engines/analysisPipeline";
import { normalizeUserIntake } from "../lib/engines/intakeEngine";
import { applyNarrativeJudgeToDiagnosticReading } from "../lib/engines/diagnosticJudgeIntegration";
import { applyDiagnosticPresentationLayer } from "../lib/engines/diagnosticPresentationIntegration";
import { selectGuidedThemes } from "../lib/engines/guidedThemeSelector";
import {
  containsEnglishFamilyLabel,
  containsClinicalThirdPerson,
  publicPresentationText,
} from "../lib/engines/diagnosticPresentationComposer";
import { buildEstefiLabPayload } from "../lib/testing/estefiLabPayload";
import type { UserIntake } from "../lib/types/intake";
import type { FinalReading } from "../lib/types/result";

type Spec = {
  id: string;
  minReferencias: number;
  requirePorQueMinLen: number;
  requireSentenciaMinLen: number;
  minCitas: number;
  requireTension: boolean;
  requireNoEnglishLabels: boolean;
  forbidClinicalThirdPerson: boolean;
  requireNarrativeSpine: boolean;
};

const SPECS: Spec[] = [
  {
    id: "estefi_pioneer",
    minReferencias: 2,
    requirePorQueMinLen: 80,
    requireSentenciaMinLen: 40,
    minCitas: 3,
    requireTension: true,
    requireNoEnglishLabels: true,
    forbidClinicalThirdPerson: true,
    requireNarrativeSpine: true,
  },
];

function loadPayload(id: string): Partial<UserIntake> | null {
  if (id === "estefi_pioneer") return buildEstefiLabPayload();
  return null;
}

async function runCase(spec: Spec) {
  const payload = loadPayload(spec.id);
  if (!payload) {
    return { id: spec.id, pass: false, error: "missing_payload" };
  }

  const pipeline = runAnalysisPipeline(payload);
  if (!pipeline.ok) {
    return { id: spec.id, pass: false, error: "pipeline_failed", detail: pipeline };
  }

  const intake = normalizeUserIntake(payload);
  const narrative = await applyNarrativeJudgeToDiagnosticReading({
    intake,
    reading: pipeline.data,
    familyScores: pipeline.data.familyScores as FinalReading["familyScores"],
  });

  const guidedThemes = selectGuidedThemes(narrative.reading, 5);
  const reading = applyDiagnosticPresentationLayer({
    reading: narrative.reading,
    guidedThemes: guidedThemes.map((g) => ({ shortLabel: g.theme.shortLabel })),
    intake,
  });

  const presentation = reading.personalizedPresentation;
  if (!presentation) {
    return { id: spec.id, pass: false, error: "no_presentation" };
  }

  const failures: string[] = [];
  const lc = presentation.lecturaCentral;
  const publicBlob = publicPresentationText(presentation);

  if (spec.requireNarrativeSpine && !presentation.meta.sourcesUsed.includes("narrative_coherence_spine")) {
    failures.push("missing_narrative_spine");
  }
  if (lc.porQue.trim().length < spec.requirePorQueMinLen) {
    failures.push("por_que_too_short");
  }
  if (lc.sentenciaRevelacion.trim().length < spec.requireSentenciaMinLen) {
    failures.push("sentencia_too_short");
  }
  if (spec.requireTension && !lc.tensionViva.trim()) {
    failures.push("missing_tension");
  }
  if (presentation.referenciasQueResuenan.length < spec.minReferencias) {
    failures.push(`referencias<${spec.minReferencias}`);
  }
  if (presentation.enTusPalabras.length < spec.minCitas) {
    failures.push(`citas<${spec.minCitas}`);
  }
  if (spec.requireNoEnglishLabels && containsEnglishFamilyLabel(publicBlob)) {
    failures.push("english_family_label");
  }
  if (spec.forbidClinicalThirdPerson && containsClinicalThirdPerson(publicBlob)) {
    failures.push("clinical_third_person");
  }

  return {
    id: spec.id,
    pass: failures.length === 0,
    failures,
    presentation: {
      sentencia: lc.sentenciaRevelacion.slice(0, 160),
      porQueLen: lc.porQue.length,
      tension: lc.tensionViva.slice(0, 100),
      citas: presentation.enTusPalabras.length,
      alertas: presentation.alertasLectura.length,
      referencias: presentation.referenciasQueResuenan.length,
      narrativeVerdict: presentation.meta.narrativeVerdict,
      sourcesUsed: presentation.meta.sourcesUsed,
    },
    corePatternInternal: reading.corePattern,
  };
}

async function main() {
  const results = [];
  for (const spec of SPECS) {
    results.push(await runCase(spec));
  }

  const passCount = results.filter((r) => r.pass).length;
  const report = { at: new Date().toISOString(), pass: passCount, total: results.length, results };

  const reportsDir = path.resolve(process.cwd(), "data/reports");
  mkdirSync(reportsDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(reportsDir, `presentation-golden-${stamp}.json`);
  writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify(report, null, 2));
  console.log(`\nWrote ${outPath}`);

  if (passCount !== results.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
