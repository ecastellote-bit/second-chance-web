import { NextResponse } from "next/server";
import { getFounderCaseDraft } from "@/lib/learning/founderCaseDraftStore";
import { HumanCaseDurableStoreError } from "@/lib/learning/humanCaseDurableStore";
import { persistMinimalHumanCaseArchive } from "@/lib/learning/humanCaseMinimalArchive";
import type { DiagnosticCaseSource } from "@/lib/learning/founderCaseDraftTypes";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      caseId?: string;
      diagnosticRunId?: string;
      source?: DiagnosticCaseSource;
      questionnaireVersion?: string;
      summary?: {
        resultType?: string | null;
        corePattern?: string | null;
        primaryDirectionLabel?: string | null;
        hasPersonalizedPresentation?: boolean;
        hasAnalysisResultFullInDraft?: boolean;
      };
    };

    const caseId = body.caseId?.trim();
    const diagnosticRunId = body.diagnosticRunId?.trim();

    if (!caseId || !diagnosticRunId) {
      return NextResponse.json(
        { ok: false, error: "case_id_required" },
        { status: 400 },
      );
    }

    const draft = await getFounderCaseDraft(caseId, diagnosticRunId);
    const analysisFull = draft?.analysisResultFull as Record<string, unknown> | undefined;

    const result = await persistMinimalHumanCaseArchive({
      caseId,
      diagnosticRunId,
      source: body.source ?? draft?.source ?? "direct_full_diagnostic",
      questionnaireVersion:
        body.questionnaireVersion ?? draft?.questionnaireVersion ?? "full_copy_v2_integrated",
      summary: body.summary ?? {
        resultType: (analysisFull?.resultType as string) ?? null,
        corePattern: (analysisFull?.corePattern as string) ?? null,
        primaryDirectionLabel:
          (analysisFull?.displayedMainDirection as string) ??
          (analysisFull?.corePattern as string) ??
          null,
        hasPersonalizedPresentation: Boolean(analysisFull?.personalizedPresentation),
        hasAnalysisResultFullInDraft: Boolean(draft?.analysisResultFull),
      },
    });

    return NextResponse.json({
      ok: true,
      archiveId: result.archiveId,
      persisted: result.persisted,
      archiveLevel: "minimal",
      durable: {
        stored: true,
        verified: result.verified,
        verificationStatus: result.verificationStatus,
        storage: "vercel_blob",
      },
    });
  } catch (error) {
    if (error instanceof HumanCaseDurableStoreError) {
      const code = error.code;
      return NextResponse.json(
        { ok: false, error: code ?? "write_failed", message: error.message },
        { status: code === "not_configured" ? 503 : 500 },
      );
    }
    console.error("human-cases/minimal POST failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "write_failed",
        message: error instanceof Error ? error.message : "minimal_archive_failed",
      },
      { status: 500 },
    );
  }
}
