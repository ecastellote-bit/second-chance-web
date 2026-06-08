import { NextResponse } from "next/server";
import {
  FounderExitFeedbackStoreError,
  getFounderExitFeedbackStoreMeta,
  listFounderExitFeedback,
} from "@/lib/learning/founderExitFeedback";
import {
  getSurfaceInterestLeadStoreMeta,
  listSurfaceInterestLeads,
  SurfaceInterestLeadStoreError,
} from "@/lib/learning/surfaceInterestLeads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 300), 1000);

    const [surfaceLeads, exitFeedback] = await Promise.all([
      listSurfaceInterestLeads(),
      listFounderExitFeedback(),
    ]);

    return NextResponse.json({
      ok: true,
      surfaceLeads: surfaceLeads.slice(0, limit),
      exitFeedback: exitFeedback.slice(0, limit),
      totals: {
        surfaceLeads: surfaceLeads.length,
        exitFeedback: exitFeedback.length,
      },
      stores: {
        surfaceInterest: getSurfaceInterestLeadStoreMeta(),
        exitFeedback: getFounderExitFeedbackStoreMeta(),
      },
    });
  } catch (error) {
    if (
      error instanceof SurfaceInterestLeadStoreError ||
      error instanceof FounderExitFeedbackStoreError
    ) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "list_failed" },
      { status: 500 },
    );
  }
}
