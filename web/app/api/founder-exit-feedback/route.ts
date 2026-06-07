import { NextResponse } from "next/server";
import {
  FOUNDER_EXIT_BODY_MAX_BYTES,
  FOUNDER_EXIT_TEXT_MAX,
  FUNDADOR_EXIT_COPY,
  type FounderExitFeedbackOptionId,
} from "@/lib/content/fundadorExitCopy";
import {
  createFounderExitFeedback,
  FounderExitFeedbackStoreError,
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
      selectedOption?: string;
      freeText?: string;
      sessionId?: string;
      path?: string;
    };
    try {
      body = JSON.parse(rawBody) as typeof body;
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const selectedOption = body.selectedOption?.trim() as FounderExitFeedbackOptionId;
    const freeText =
      typeof body.freeText === "string" ? body.freeText.trim().slice(0, FOUNDER_EXIT_TEXT_MAX) : "";

    if (!selectedOption || !VALID_OPTIONS.has(selectedOption)) {
      return NextResponse.json({ ok: false, error: "invalid_option" }, { status: 400 });
    }

    const record = await createFounderExitFeedback({
      selectedOption,
      freeText: freeText || null,
      sessionId: typeof body.sessionId === "string" ? body.sessionId.trim().slice(0, 64) : null,
      path: typeof body.path === "string" ? body.path.trim().slice(0, 120) : null,
    });

    return NextResponse.json({ ok: true, feedbackId: record.feedbackId });
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
