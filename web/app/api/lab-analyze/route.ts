import { NextResponse } from "next/server";
import type { UserIntake } from "@/lib/types/intake";
import { normalizeUserIntake, validateUserIntake } from "@/lib/engines/intakeEngine";
import { runCVME } from "@/lib/engines/cvmeEngine";
import { runTDM } from "@/lib/engines/tdmEngine";
import { runLTE } from "@/lib/engines/lteEngine";
import { runSEL } from "@/lib/engines/selEngine";
import { runAVE } from "@/lib/engines/aveEngine";
import { buildFinalReading } from "@/lib/engines/resultOrchestrator";
import { evaluateResultDecision } from "@/lib/engines/resultDecision";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<UserIntake>;
    const intake = normalizeUserIntake(body);
    const validation = validateUserIntake(intake);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: "INSUFFICIENT_INPUT",
          missingFields: validation.missingFields,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
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

    const decision = evaluateResultDecision({
      intake,
      signals,
      profiles,
      transitionAssessment,
      plausibleDirections,
    });

    return NextResponse.json({
      ok: true,
      data: finalReading,
      warnings: validation.warnings,
      trace: decision.trace,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_REQUEST",
        detail: String(error),
      },
      { status: 400 }
    );
  }
}