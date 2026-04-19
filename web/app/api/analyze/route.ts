import { NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/engines/analysisPipeline";
import type { UserIntake } from "@/lib/types/intake";
import type { FollowupRound, AmbiguityType } from "@/lib/types/followup";

type ClarificationMetaPayload = {
  roundsCompleted?: number;
  requestedRound?: FollowupRound;
  lockedAmbiguityType?: AmbiguityType | null;
};

type AnalyzeRouteInput = Partial<UserIntake> & {
  clarificationMeta?: ClarificationMetaPayload;
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "analyze",
    message: "API route is alive",
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalyzeRouteInput;
    const result = runAnalysisPipeline(body);

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "INSUFFICIENT_INPUT",
          missingFields: result.missingFields,
          warnings: result.warnings,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
      warnings: result.warnings,
      followup: result.followup,
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