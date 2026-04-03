import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";
import { normalizeUserIntake, validateUserIntake } from "./intakeEngine";
import { runCVME } from "./cvmeEngine";
import { runTDM } from "./tdmEngine";
import { runLTE } from "./lteEngine";
import { runSEL } from "./selEngine";
import { runAVE } from "./aveEngine";
import { buildFinalReading } from "./resultOrchestrator";

export type PipelineSuccess = {
  ok: true;
  data: FinalReading;
  warnings: string[];
};

export type PipelineFailure = {
  ok: false;
  missingFields: string[];
  warnings: string[];
};

export type PipelineResult = PipelineSuccess | PipelineFailure;

export function runAnalysisPipeline(rawInput: Partial<UserIntake>): PipelineResult {
  const intake = normalizeUserIntake(rawInput);
  const validation = validateUserIntake(intake);

  if (!validation.isValid) {
    return {
      ok: false,
      missingFields: validation.missingFields,
      warnings: validation.warnings,
    };
  }

  const signals = runCVME(intake);
  const profiles = runTDM(signals);
  const transitionAssessment = runLTE(intake);
  const plausibleDirections = runSEL(profiles);
  const actionVectors = runAVE(plausibleDirections, transitionAssessment);

  const finalReading = buildFinalReading({
    intake,
    signals,
    profiles,
    transitionAssessment,
    plausibleDirections,
    actionVectors,
  });

  return {
    ok: true,
    data: finalReading,
    warnings: validation.warnings,
  };
}