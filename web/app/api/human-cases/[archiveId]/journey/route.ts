import { NextResponse } from "next/server";
import {
  appendHumanCaseJourneyEvent,
  type HumanCaseJourneyStep,
} from "@/lib/learning/humanCaseJourney";
import { findHumanCompleteCaseById } from "@/lib/learning/humanCaseDepot";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";
import type { ObservatoryEventType } from "@/lib/observatory/types";

type RouteParams = { params: Promise<{ archiveId: string }> };

const ALLOWED_STEPS = new Set<HumanCaseJourneyStep>([
  "theme_selected",
  "activation_chosen",
  "community_door_confirmed",
]);

const STEP_TO_OBSERVATORY: Record<HumanCaseJourneyStep, ObservatoryEventType> = {
  theme_selected: "funnel.tematica_selected",
  activation_chosen: "funnel.activacion_cartel",
  community_door_confirmed: "funnel.barrio_commitment",
};

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { archiveId } = await params;
    const complete = await findHumanCompleteCaseById(archiveId);

    if (!complete) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const body = (await req.json()) as {
      step?: HumanCaseJourneyStep;
      payload?: Record<string, unknown>;
    };

    if (!body.step || !ALLOWED_STEPS.has(body.step)) {
      return NextResponse.json({ ok: false, error: "invalid_step" }, { status: 400 });
    }

    const result = await appendHumanCaseJourneyEvent({
      archiveId,
      step: body.step,
      payload: body.payload,
    });

    const obsPayload: Record<string, string | number | boolean | null> = {
      archiveId,
      step: body.step,
      cohortBatch:
        typeof complete.payload.clientMeta?.cohortBatch === "string"
          ? complete.payload.clientMeta.cohortBatch
          : null,
    };
    for (const [key, value] of Object.entries(body.payload ?? {})) {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
      ) {
        obsPayload[key] = value;
      }
    }

    await appendObservatoryEvent(
      buildObservatoryEvent({
        type: STEP_TO_OBSERVATORY[body.step],
        scenario: "full_flow",
        payload: obsPayload,
      }),
    ).catch(() => {});

    return NextResponse.json({ ok: true, archiveId, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "journey_failed",
      },
      { status: 500 },
    );
  }
}
