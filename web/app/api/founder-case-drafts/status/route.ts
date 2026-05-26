import { NextResponse } from "next/server";
import {
  getFounderCaseDraftPublicStatus,
  getFounderCaseDraftStoreStatus,
} from "@/lib/learning/founderCaseDraftStore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const caseId = url.searchParams.get("caseId")?.trim();

  if (!caseId) {
    return NextResponse.json(
      { ok: false, error: "case_id_required" },
      { status: 400 },
    );
  }

  const diagnosticRunId = url.searchParams.get("diagnosticRunId")?.trim();

  const status = await getFounderCaseDraftPublicStatus({
    caseId,
    diagnosticRunId: diagnosticRunId || undefined,
  });

  return NextResponse.json({
    ok: true,
    ...status,
    store: getFounderCaseDraftStoreStatus(),
  });
}
