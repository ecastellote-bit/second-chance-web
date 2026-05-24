import { NextResponse } from "next/server";
import { normalizeHumanCaseImport } from "@/lib/learning/normalizeHumanCaseImport";
import { persistHumanCaseDepot } from "@/lib/learning/humanCaseDepot";
import type { HumanCasePayload } from "@/lib/learning/humanCaseDepot";
import { isHumanCasePersistedAcknowledged } from "@/lib/learning/humanCasePersistence";

export const runtime = "nodejs";
export const maxDuration = 60;

function importKeyOk(req: Request): boolean {
  const expected = process.env.VU_HUMAN_CASE_IMPORT_KEY?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const header = req.headers.get("x-vu-import-key")?.trim();
  const url = new URL(req.url);
  const query = url.searchParams.get("key")?.trim();
  return header === expected || query === expected;
}

export async function POST(req: Request) {
  if (!importKeyOk(req)) {
    return NextResponse.json({ ok: false, error: "import_unauthorized" }, { status: 401 });
  }

  try {
    const raw = (await req.json()) as unknown;
    const { archiveId, payload } = normalizeHumanCaseImport(raw);

    const result = await persistHumanCaseDepot(payload as HumanCasePayload, {
      source: payload.source ?? "manual_human_import_v1",
      forceArchiveId: archiveId,
      alsoWriteLegacy: false,
      legacyObservation: false,
    });

    const persisted = isHumanCasePersistedAcknowledged(result);

    return NextResponse.json({
      ok: true,
      archiveId: result.archiveId,
      persisted,
      durable: result.durable,
      viewUrl: `/full/result/archivo/${encodeURIComponent(result.archiveId)}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "import_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
