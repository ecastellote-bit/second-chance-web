import type { UserIntake } from "../types/intake";
import type { FinalReading } from "../types/result";
import type { FollowupOrchestratorResult } from "./followupOrchestrator";
import { normalizeUserIntake, validateUserIntake } from "./intakeEngine";
import { runCVME } from "./cvmeEngine";
import { runTDM } from "./tdmEngine";
import { runLTE } from "./lteEngine";
import { runSEL } from "./selEngine";
import { runAVE } from "./aveEngine";
import { buildFinalReading } from "./resultOrchestrator";
import { buildFollowupOrchestration } from "./followupOrchestrator";
import { runAffinityPipelineBridge } from "./affinityPipelineBridge";

export type PipelineSuccess = {
  ok: true;
  data: FinalReading;
  warnings: string[];
  followup: FollowupOrchestratorResult | null;
};

export type PipelineFailure = {
  ok: false;
  missingFields: string[];
  warnings: string[];
};

export type PipelineResult = PipelineSuccess | PipelineFailure;

export function runAnalysisPipeline(
  rawInput: Partial<UserIntake>,
): PipelineResult {
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
  const affinityBridge = runAffinityPipelineBridge({ intake });
  const profiles = runTDM(signals, affinityBridge.affinityScores);
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

  const followup =
    finalReading.resultType === "insufficient_evidence"
      ? buildFollowupOrchestration({
          resultType: finalReading.resultType,
          profiles,
          signals,
          transitionAssessment,
        })
      : null;

  return {
    ok: true,
    data: finalReading,
    warnings: validation.warnings,
    followup,
  };
}