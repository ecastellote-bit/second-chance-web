import { NextResponse } from "next/server";
import {
  FounderCaseDraftStoreError,
  getFounderCaseDraft,
  upsertFounderCaseDraft,
} from "@/lib/learning/founderCaseDraftStore";
import type { DiagnosticCaseSource } from "@/lib/learning/founderCaseDraftTypes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      archiveId?: string;
      caseId?: string;
      diagnosticRunId?: string;
      note?: string;
      reason?: string;
      source?: DiagnosticCaseSource;
    };

    const caseId = body.caseId?.trim();
    const diagnosticRunId = body.diagnosticRunId?.trim();

    if (!caseId || !diagnosticRunId) {
      return NextResponse.json(
        {
          ok: false,
          error: "case_identity_required",
          message: "Primero necesitamos confirmar que tu lectura quedó disponible.",
        },
        { status: 400 },
      );
    }

    const existing = await getFounderCaseDraft(caseId, diagnosticRunId);

    if (!existing) {
      return NextResponse.json(
        {
          ok: false,
          error: "draft_not_found",
          message: "Primero necesitamos confirmar que tu lectura quedó disponible.",
        },
        { status: 404 },
      );
    }

    const serverPreservationConfirmed = [
      "submitted_before_analysis",
      "analysis_started",
      "analysis_succeeded_pending_archive",
      "archived",
      "archived_minimal",
    ].includes(existing.status);

    if (!serverPreservationConfirmed) {
      return NextResponse.json(
        {
          ok: false,
          error: "not_preserved",
          message: "Primero necesitamos confirmar que tu lectura quedó disponible.",
        },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();

    const record = await upsertFounderCaseDraft({
      caseId,
      diagnosticRunId,
      status: existing.status,
      rawAnswers: existing.rawAnswers,
      builtUserIntake: existing.builtUserIntake,
      archiveId: body.archiveId?.trim() ?? existing.archiveId,
      source: body.source ?? existing.source,
      humanReviewRequested: true,
      humanReviewRequestedAt: now,
      humanReviewStatus: "pending",
      learningDisposition: "needs_review",
      clientMeta: {
        ...existing.clientMeta,
        reviewNote: body.note?.trim() || undefined,
        reviewReason: body.reason?.trim() || undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      caseId: record.caseId,
      diagnosticRunId: record.diagnosticRunId,
      archiveId: record.archiveId ?? body.archiveId ?? null,
      humanReviewStatus: "pending",
      message: "Revisión humana solicitada. El equipo puede ubicar tu caso.",
    });
  } catch (error) {
    if (error instanceof FounderCaseDraftStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "not_configured" ? 503 : 500 },
      );
    }
    console.error("founder-case-drafts request-review failed:", error);
    return NextResponse.json(
      { ok: false, error: "write_failed", message: "No se pudo actualizar el draft." },
      { status: 500 },
    );
  }
}
