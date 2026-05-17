import { NextResponse } from "next/server";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";
import type { ObservatoryEventType } from "@/lib/observatory/types";

const ALLOWED: ObservatoryEventType[] = [
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
];

export async function POST(request: Request) {
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
      scenario: body.scenario ?? "general",
      sessionId: body.sessionId,
      payload: body.payload,
    });

    await appendObservatoryEvent(event);

    return NextResponse.json({ ok: true, id: event.id });
  } catch (error) {
    console.error("observatory/event failed:", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
