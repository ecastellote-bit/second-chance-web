import { NextResponse } from "next/server";
import type { UserIntake } from "@/lib/types/intake";
import {
  normalizeUserIntake,
  validateUserIntake,
} from "@/lib/engines/intakeEngine";
import { runCVME } from "@/lib/engines/cvmeEngine";
import { runTDM } from "@/lib/engines/tdmEngine";
import { runLTE } from "@/lib/engines/lteEngine";
import { runSEL } from "@/lib/engines/selEngine";
import { runAVE } from "@/lib/engines/aveEngine";
import { buildFinalReading } from "@/lib/engines/resultOrchestrator";
import { evaluateResultDecision } from "@/lib/engines/resultDecision";

function asStringArray(value: unknown): string[] {
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

function normalizeLabRequestPayload(body: any): Partial<UserIntake> | null {
  const payload = body?.intake ?? body?.payload ?? body;

  if (!payload) return null;

  return {
    profile: {
      age: payload.profile?.age ?? 42,
      country: payload.profile?.country ?? "Argentina",
      language: payload.profile?.language ?? "es",
      employmentStatus: payload.profile?.employmentStatus ?? "employed",
      educationLevel: payload.profile?.educationLevel ?? "tertiary",
    },
    narrative: {
      childhoodMemories:
        payload.narrative?.childhoodMemories ??
        payload.childhoodMemories ??
        payload.earlyFascinations ??
        "",
      earlyFascinations:
        payload.narrative?.earlyFascinations ??
        payload.earlyFascinations ??
        "",
      meaningfulSchoolSubjects:
        payload.narrative?.meaningfulSchoolSubjects ??
        payload.meaningfulSchoolSubjects ??
        "",
      repeatedWorkPatterns:
        payload.narrative?.repeatedWorkPatterns ??
        payload.repeatedPatterns ??
        "",
      naturalSocialRoles:
        payload.narrative?.naturalSocialRoles ??
        payload.naturalSocialRoles ??
        "",
      lossesOrRenunciations:
        payload.narrative?.lossesOrRenunciations ??
        payload.lossesOrRenunciations ??
        "",
      whatFeelsCompressedNow:
        payload.narrative?.whatFeelsCompressedNow ??
        payload.compressedLife ??
        "",
      additionalContext:
        payload.narrative?.additionalContext ??
        payload.additionalContext ??
        "",
    },
    currentContext: {
      currentSituation:
        payload.currentContext?.currentSituation ??
        payload.currentSituation ??
        "",
      restrictions: asStringArray(
        payload.currentContext?.restrictions ?? payload.restrictions,
      ),
      assets: asStringArray(payload.currentContext?.assets ?? payload.assets),
    },
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawIntake = normalizeLabRequestPayload(body);

    if (!rawIntake) {
      return NextResponse.json(
        {
          ok: false,
          error: "INVALID_REQUEST",
          detail: "Request body vacío o inválido.",
        },
        { status: 400 },
      );
    }

    const intake = normalizeUserIntake(rawIntake);
    const validation = validateUserIntake(intake);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          ok: false,
          error: "INSUFFICIENT_INPUT",
          missingFields: validation.missingFields,
          warnings: validation.warnings,
        },
        { status: 400 },
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
      { status: 400 },
    );
  }
}