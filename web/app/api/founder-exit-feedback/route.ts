import { NextResponse } from "next/server";
import {
  FOUNDER_EXIT_BODY_MAX_BYTES,
  FOUNDER_EXIT_TEXT_MAX,
  FUNDADOR_EXIT_COPY,
  type FounderExitFeedbackOptionId,
} from "@/lib/content/fundadorExitCopy";
import {
  resolveFounderExitSubmitMode,
} from "@/lib/content/fundadorExitCopy";
import {
  createFounderExitFeedback,
  FounderExitFeedbackStoreError,
  getFounderExitFeedbackStoreMeta,
} from "@/lib/learning/founderExitFeedback";

export const dynamic = "force-dynamic";

const VALID_OPTIONS = new Set<FounderExitFeedbackOptionId>(
  FUNDADOR_EXIT_COPY.options.map((o) => o.id),
);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    if (rawBody.length > FOUNDER_EXIT_BODY_MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }

    let body: {
      selectedOption?: string | null;
      freeText?: string;
      sessionId?: string;
      path?: string;
      exitTrigger?: string;
    };
    try {
      body = JSON.parse(rawBody) as typeof body;
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const rawOption =
      typeof body.selectedOption === "string" ? body.selectedOption.trim() : null;
    const selectedOption =
      rawOption && VALID_OPTIONS.has(rawOption as FounderExitFeedbackOptionId)
        ? (rawOption as FounderExitFeedbackOptionId)
        : null;
    const freeText =
      typeof body.freeText === "string" ? body.freeText.trim().slice(0, FOUNDER_EXIT_TEXT_MAX) : "";

    if (!selectedOption && !freeText) {
      return NextResponse.json({ ok: false, error: "empty_feedback" }, { status: 400 });
    }

    const record = await createFounderExitFeedback({
      selectedOption,
      freeText: freeText || null,
      sessionId: typeof body.sessionId === "string" ? body.sessionId.trim().slice(0, 64) : null,
      path: typeof body.path === "string" ? body.path.trim().slice(0, 120) : null,
      exitTrigger:
        typeof body.exitTrigger === "string" ? body.exitTrigger.trim().slice(0, 40) : null,
    });

    return NextResponse.json({
      ok: true,
      feedbackId: record.feedbackId,
      submitMode: resolveFounderExitSubmitMode(selectedOption, freeText || null),
      store: getFounderExitFeedbackStoreMeta(),
    });
  } catch (error) {
    if (error instanceof FounderExitFeedbackStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json({ ok: false, error: "create_failed" }, { status: 500 });
  }
}
