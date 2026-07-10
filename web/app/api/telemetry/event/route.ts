import { NextResponse } from "next/server";
import { ingestTelemetryEvent } from "@/lib/telemetry/ingest";
import { TELEMETRY_MAX_BODY_BYTES } from "@/lib/telemetry/sanitize";
import type { TelemetryIngestBody } from "@/lib/telemetry/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (rawBody.length > TELEMETRY_MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }

    let body: TelemetryIngestBody;
    try {
      body = JSON.parse(rawBody) as TelemetryIngestBody;
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ ok: false, error: "missing_event_name" }, { status: 400 });
    }

    try {
      const result = await ingestTelemetryEvent(body);
      if (!result.ok) {
        if (result.error === "storage_unavailable") {
          return NextResponse.json(
            { ok: false, error: result.error, eventId: result.eventId ?? null },
            { status: 202 },
          );
        }
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ ok: true, eventId: result.eventId, date: result.date });
    } catch (storageError) {
      console.error("telemetry/event unexpected failure:", storageError);
      return NextResponse.json({ ok: false, error: "ingest_failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("telemetry/event failed:", error);
    return NextResponse.json({ ok: false, error: "ingest_failed" }, { status: 500 });
  }
}
