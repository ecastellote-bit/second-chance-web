import {
  sanitizeTelemetryId,
  sanitizeTelemetryPath,
  sanitizeTelemetryProperties,
  sanitizeTelemetryReferrer,
  sanitizeTelemetryUtm,
} from "./sanitize";
import {
  buildTelemetryEventId,
  persistTelemetryEvent,
  telemetryDateFromIso,
} from "./store";
import {
  TELEMETRY_EVENT_NAMES,
  type TelemetryEventName,
  type TelemetryEventRecord,
  type TelemetryIngestBody,
} from "./types";

function isAllowedEventName(name: string): name is TelemetryEventName {
  return (TELEMETRY_EVENT_NAMES as readonly string[]).includes(name);
}

export function buildTelemetryEventRecord(body: TelemetryIngestBody): TelemetryEventRecord | null {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!isAllowedEventName(name)) return null;

  const timestamp =
    typeof body.timestamp === "string" && !Number.isNaN(Date.parse(body.timestamp))
      ? new Date(body.timestamp).toISOString()
      : new Date().toISOString();

  const sessionId = sanitizeTelemetryId(body.sessionId) || "unknown_session";
  const anonymousId = sanitizeTelemetryId(body.anonymousId) || "unknown_anon";

  return {
    eventId: buildTelemetryEventId(),
    anonymousId,
    sessionId,
    name,
    path: sanitizeTelemetryPath(body.path),
    referrer: sanitizeTelemetryReferrer(body.referrer),
    utmSource: sanitizeTelemetryUtm(body.utmSource),
    utmMedium: sanitizeTelemetryUtm(body.utmMedium),
    utmCampaign: sanitizeTelemetryUtm(body.utmCampaign),
    timestamp,
    properties: sanitizeTelemetryProperties(body.properties),
    pii: false,
    source: "internal",
  };
}

export async function ingestTelemetryEvent(
  body: TelemetryIngestBody,
): Promise<
  | { ok: true; eventId: string; date: string }
  | { ok: false; error: string; eventId?: string }
> {
  const record = buildTelemetryEventRecord(body);
  if (!record) {
    return { ok: false, error: "invalid_event_name" };
  }

  try {
    await persistTelemetryEvent(record);
    return {
      ok: true,
      eventId: record.eventId,
      date: telemetryDateFromIso(record.timestamp),
    };
  } catch {
    return { ok: false, error: "storage_unavailable", eventId: record.eventId };
  }
}
