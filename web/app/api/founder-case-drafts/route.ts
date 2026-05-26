import { NextResponse } from "next/server";
import {
  FounderCaseDraftStoreError,
  getFounderCaseDraftStoreStatus,
  upsertFounderCaseDraft,
} from "@/lib/learning/founderCaseDraftStore";
import type { FounderCaseDraftRecord } from "@/lib/learning/founderCaseDraftTypes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<FounderCaseDraftRecord>;

    if (!body.caseId?.trim() || !body.diagnosticRunId?.trim()) {
      return NextResponse.json(
        { ok: false, error: "case_id_required" },
        { status: 400 },
      );
    }

    if (!body.status) {
      return NextResponse.json(
        { ok: false, error: "status_required" },
        { status: 400 },
      );
    }

    const record = await upsertFounderCaseDraft({
      caseId: body.caseId.trim(),
      diagnosticRunId: body.diagnosticRunId.trim(),
      runNumber: typeof body.runNumber === "number" ? body.runNumber : undefined,
      status: body.status,
      rawAnswers: body.rawAnswers ?? null,
      builtUserIntake: body.builtUserIntake,
      submittedAt: body.submittedAt,
      archiveId: body.archiveId,
      analysisResultSummary: body.analysisResultSummary,
      analysisResultFull: body.analysisResultFull,
      errorSummary: body.errorSummary ?? null,
      learningDisposition: body.learningDisposition ?? "raw_human_case",
      humanReviewRequested: body.humanReviewRequested,
      humanReviewRequestedAt: body.humanReviewRequestedAt,
      humanReviewStatus: body.humanReviewStatus,
      source: body.source,
      clientMeta: body.clientMeta,
      createdAt: body.createdAt,
    });

    return NextResponse.json({
      ok: true,
      caseId: record.caseId,
      diagnosticRunId: record.diagnosticRunId,
      status: record.status,
      updatedAt: record.updatedAt,
      persisted: true,
      storage: getFounderCaseDraftStoreStatus().storage,
    });
  } catch (error) {
    if (error instanceof FounderCaseDraftStoreError) {
      const status = error.code === "not_configured" ? 503 : 500;
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status },
      );
    }

    console.error("founder-case-drafts POST failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "persist_failed",
        message: error instanceof Error ? error.message : "unknown",
      },
      { status: 500 },
    );
  }
}
