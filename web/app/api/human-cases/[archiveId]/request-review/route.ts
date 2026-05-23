import { NextResponse } from "next/server";
import { markHumanCaseReviewRequested } from "@/lib/learning/humanCaseDurableStore";
import { findHumanCompleteCaseById } from "@/lib/learning/humanCaseDepot";

type RouteParams = { params: Promise<{ archiveId: string }> };

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { archiveId } = await params;
    const existing = await findHumanCompleteCaseById(archiveId);

    if (!existing) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as { note?: string };
    const updated = await markHumanCaseReviewRequested(archiveId, body.note);

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "review_request_failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      archiveId,
      reviewStatus: "pending_human_review",
      message: "Revisión humana solicitada. El equipo verá tu caso en el depósito.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "review_request_failed",
      },
      { status: 500 },
    );
  }
}
