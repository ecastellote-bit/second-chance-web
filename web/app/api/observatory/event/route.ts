import { NextResponse } from "next/server";
import {
  sanitizeObservatoryPayload,
  sanitizeObservatorySessionId,
} from "@/lib/observatory/sanitizePayload";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";
import type { ObservatoryEventType } from "@/lib/observatory/types";

const ALLOWED: ObservatoryEventType[] = [
  "funnel.fundador_view",
  "funnel.barrio_view",
  "funnel.full_reading_intro",
  "funnel.full_step1_view",
  "funnel.full_step2_view",
  "funnel.full_step3_view",
  "funnel.full_step4_view",
  "funnel.full_step5_view",
  "funnel.analysis_started",
  "funnel.diagnostic_archived",
  "funnel.comenzar_view",
  "funnel.onboarding_door",
  "funnel.tematica_selected",
  "funnel.activacion_cartel",
  "funnel.plaza_post_activacion",
  "funnel.barrio_commitment",
  "diagnostic.full_result_view",
  "diagnostic.case_archived",
  "learning.observation_stored",
  "learning.validated_case_stored",
  "barrio.action_card_click",
  "barrio.start_reading_click",
];

export async function POST(request: Request) {
  let eventId = "";

  try {
    const body = (await request.json()) as {
      type?: string;
      scenario?: string;
      sessionId?: string;
      payload?: Record<string, string | number | boolean | null>;
    };

    if (!body.type || !ALLOWED.includes(body.type as ObservatoryEventType)) {
      return NextResponse.json({ ok: false, error: "invalid_event_type" }, { status: 400 });
    }

    const event = buildObservatoryEvent({
      type: body.type as ObservatoryEventType,
      scenario:
        typeof body.scenario === "string" ? body.scenario.trim().slice(0, 40) : "general",
      sessionId: sanitizeObservatorySessionId(body.sessionId),
      payload: sanitizeObservatoryPayload(body.payload),
    });

    eventId = event.id;

    try {
      await appendObservatoryEvent(event);
      return NextResponse.json({ ok: true, id: event.id, stored: true });
    } catch (appendError) {
      console.error("observatory/event append failed:", appendError);
      return NextResponse.json({ ok: true, id: event.id, stored: false });
    }
  } catch (error) {
    console.error("observatory/event failed:", error);
    return NextResponse.json(
      { ok: true, id: eventId || null, stored: false, error: "accepted_without_store" },
      { status: 200 },
    );
  }
}
