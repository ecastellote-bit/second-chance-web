import { NextResponse } from "next/server";
import { getFounderCaseDraft } from "@/lib/learning/founderCaseDraftStore";
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
    });
  } catch (error) {
    console.error("human-cases/minimal POST failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "minimal_archive_failed",
      },
      { status: 500 },
    );
  }
}
