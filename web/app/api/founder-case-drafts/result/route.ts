import { NextResponse } from "next/server";
import { getFounderCaseDraft } from "@/lib/learning/founderCaseDraftStore";

export const runtime = "nodejs";

/** Lectura mínima desde draft para Temáticas (sin narrativa cruda completa). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const caseId = url.searchParams.get("caseId")?.trim();
  const diagnosticRunId = url.searchParams.get("diagnosticRunId")?.trim();

  if (!caseId || !diagnosticRunId) {
    return NextResponse.json(
      { ok: false, error: "case_id_required" },
      { status: 400 },
    );
  }

  const draft = await getFounderCaseDraft(caseId, diagnosticRunId);

  if (!draft) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const full =
    (draft.analysisResultFull as Record<string, unknown> | undefined) ??
    (draft.analysisResultSummary as Record<string, unknown> | undefined);

  if (!full) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    caseId: draft.caseId,
    diagnosticRunId: draft.diagnosticRunId,
    status: draft.status,
    archiveId: draft.archiveId ?? null,
    currentResult: {
      resultType: full.resultType ?? null,
      corePattern: full.corePattern ?? null,
      dominantTension: full.dominantTension ?? null,
      summaryForUser: full.summaryForUser ?? null,
      personalizedPresentation: full.personalizedPresentation ?? null,
      _guidedThemes: full._guidedThemes ?? [],
      familyScores: Array.isArray(full.familyScores)
        ? (full.familyScores as unknown[]).slice(0, 12)
        : [],
    },
  });
}
