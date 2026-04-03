import { NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/engines/analysisPipeline";
import type { UserIntake } from "@/lib/types/intake";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<UserIntake>;
    const result = runAnalysisPipeline(body);

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "INSUFFICIENT_INPUT",
          missingFields: result.missingFields,
          warnings: result.warnings,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: result.data,
      warnings: result.warnings,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_REQUEST",
      },
      { status: 400 }
    );
  }
}