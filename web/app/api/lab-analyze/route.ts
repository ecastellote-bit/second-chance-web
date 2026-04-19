import { NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/engines/analysisPipeline";
import { normalizeUserIntake } from "@/lib/engines/intakeEngine";
import { runAffinityPipelineBridge } from "@/lib/engines/affinityPipelineBridge";
import type { UserIntake } from "@/lib/types/intake";

function resolveRawInput(body: unknown): Partial<UserIntake> {
  if (!body || typeof body !== "object") {
    return {};
  }

  const candidate = body as {
    payload?: Partial<UserIntake>;
    intake?: Partial<UserIntake>;
  };

  return candidate.payload ?? candidate.intake ?? (body as Partial<UserIntake>);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawInput = resolveRawInput(body);

    const intake = normalizeUserIntake(rawInput);
    const pipeline = runAnalysisPipeline(rawInput);
    const affinityBridge = runAffinityPipelineBridge({ intake });

    if (!pipeline.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "INSUFFICIENT_INPUT",
          missingFields: pipeline.missingFields,
          warnings: pipeline.warnings,
          affinityBridge,
          familyScores: affinityBridge.familyScores,
          evidence: affinityBridge.evidence,
          affinityScores: affinityBridge.affinityScores,
          topAffinities: affinityBridge.topAffinities,
          buriedCapacities: affinityBridge.buriedCapacities,
          likelyContributionModes: affinityBridge.likelyContributionModes,
          likelyFlourishingConditions:
            affinityBridge.likelyFlourishingConditions,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: pipeline.data,
      warnings: pipeline.warnings,
      followup: pipeline.followup,

      affinityBridge,
      familyScores: affinityBridge.familyScores,
      evidence: affinityBridge.evidence,
      affinityScores: affinityBridge.affinityScores,
      topAffinities: affinityBridge.topAffinities,
      buriedCapacities: affinityBridge.buriedCapacities,
      likelyContributionModes: affinityBridge.likelyContributionModes,
      likelyFlourishingConditions:
        affinityBridge.likelyFlourishingConditions,
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