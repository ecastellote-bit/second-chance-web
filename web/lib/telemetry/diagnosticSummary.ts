import type { TelemetryDailyAggregate, TelemetrySampleEvent } from "./types";
import { readTelemetryDailyAggregate } from "./store";

/** Whitelist for recent diagnostic event properties — no attemptId, no PII. */
const SAFE_PROPERTY_KEYS = [
  "phase",
  "errorCode",
  "status",
  "hasAnswers",
  "answerCount",
  "founder",
  "hasResult",
  "resultFamilyCount",
  "attemptSource",
  "route",
  "source",
] as const;

const DIAGNOSTIC_EVENT_NAMES = new Set([
  "diagnostic_processing_started",
  "diagnostic_completed",
  "diagnostic_failed",
]);

export type DiagnosticDailySummary = {
  date: string;
  processingStarted: number;
  diagnosticCompleted: number;
  diagnosticFailed: number;
  processingRouteEvents: number;
  allTelemetryEvents: number;
  completionRate: number | null;
  failureRate: number | null;
};

export type DiagnosticSummaryTotals = Omit<DiagnosticDailySummary, "date">;

export type DiagnosticSummaryRecentEvent = {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  properties: Record<string, string | number | boolean | null>;
};

export type DiagnosticFailureBreakdown = {
  byPhase: Record<string, number>;
  byErrorCode: Record<string, number>;
  byStatus: Record<string, number>;
};

export type DiagnosticSummaryResponse = {
  ok: true;
  source: "internal_telemetry_daily_aggregate";
  scope: "diagnostic_processing";
  days: number;
  range: { from: string; to: string };
  totals: DiagnosticSummaryTotals;
  daily: DiagnosticDailySummary[];
  recentDiagnosticEvents: DiagnosticSummaryRecentEvent[];
  /** Derived only from sampleRecentEvents of daily aggregates — not a full census. */
  recentFailureBreakdown: DiagnosticFailureBreakdown;
  updatedAt: string;
  lastEventAt: string | null;
  missingDays: string[];
};

function parseDaysParam(value: string | null): number {
  const parsed = Number.parseInt(value ?? "7", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 7;
  return Math.min(parsed, 30);
}

function dateRangeInclusive(days: number): string[] {
  const out: string[] = [];
  const end = new Date();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - offset);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function countByName(aggregate: TelemetryDailyAggregate, name: string): number {
  return aggregate.byName[name] ?? 0;
}

function rateOrNull(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 1000;
}

function toDailySummary(aggregate: TelemetryDailyAggregate): DiagnosticDailySummary {
  const processingStarted = countByName(aggregate, "diagnostic_processing_started");
  const diagnosticCompleted = countByName(aggregate, "diagnostic_completed");
  const diagnosticFailed = countByName(aggregate, "diagnostic_failed");

  return {
    date: aggregate.date,
    processingStarted,
    diagnosticCompleted,
    diagnosticFailed,
    processingRouteEvents: aggregate.byPath["/full/processing"] ?? 0,
    allTelemetryEvents: aggregate.totalEvents,
    completionRate: rateOrNull(diagnosticCompleted, processingStarted),
    failureRate: rateOrNull(diagnosticFailed, processingStarted),
  };
}

function isMissingDay(aggregate: TelemetryDailyAggregate): boolean {
  return aggregate.totalEvents === 0 && !aggregate.lastEventAt;
}

function pickSafeProperties(
  properties: Record<string, string | number | boolean | null> | undefined,
): Record<string, string | number | boolean | null> {
  if (!properties) return {};
  const out: Record<string, string | number | boolean | null> = {};
  for (const key of SAFE_PROPERTY_KEYS) {
    const value = properties[key];
    if (value !== undefined && value !== null && value !== "") {
      out[key] = value;
    }
  }
  return out;
}

function toRecentEvent(event: TelemetrySampleEvent): DiagnosticSummaryRecentEvent {
  return {
    id: event.eventId,
    name: event.name,
    path: event.path,
    createdAt: event.timestamp,
    properties: pickSafeProperties(event.properties),
  };
}

function sumTotals(daily: DiagnosticDailySummary[]): DiagnosticSummaryTotals {
  const totals = daily.reduce(
    (acc, row) => ({
      processingStarted: acc.processingStarted + row.processingStarted,
      diagnosticCompleted: acc.diagnosticCompleted + row.diagnosticCompleted,
      diagnosticFailed: acc.diagnosticFailed + row.diagnosticFailed,
      processingRouteEvents: acc.processingRouteEvents + row.processingRouteEvents,
      allTelemetryEvents: acc.allTelemetryEvents + row.allTelemetryEvents,
    }),
    {
      processingStarted: 0,
      diagnosticCompleted: 0,
      diagnosticFailed: 0,
      processingRouteEvents: 0,
      allTelemetryEvents: 0,
    },
  );

  return {
    ...totals,
    completionRate: rateOrNull(totals.diagnosticCompleted, totals.processingStarted),
    failureRate: rateOrNull(totals.diagnosticFailed, totals.processingStarted),
  };
}

function isDiagnosticEvent(event: TelemetrySampleEvent): boolean {
  return (
    DIAGNOSTIC_EVENT_NAMES.has(event.name) ||
    event.path === "/full/processing"
  );
}

function collectRecentDiagnosticEvents(
  aggregates: TelemetryDailyAggregate[],
): DiagnosticSummaryRecentEvent[] {
  const seen = new Set<string>();
  const events: DiagnosticSummaryRecentEvent[] = [];

  for (const aggregate of aggregates) {
    for (const event of aggregate.sampleRecentEvents) {
      if (!isDiagnosticEvent(event)) continue;
      if (seen.has(event.eventId)) continue;
      seen.add(event.eventId);
      events.push(toRecentEvent(event));
    }
  }

  return events
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);
}

/**
 * Failure breakdown from sampleRecentEvents only — not a full count of all failures.
 */
function buildRecentFailureBreakdown(
  recentEvents: DiagnosticSummaryRecentEvent[],
): DiagnosticFailureBreakdown {
  const byPhase: Record<string, number> = {};
  const byErrorCode: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const event of recentEvents) {
    if (event.name !== "diagnostic_failed") continue;
    const phase = event.properties.phase;
    const errorCode = event.properties.errorCode;
    const status = event.properties.status;

    if (typeof phase === "string" && phase) {
      byPhase[phase] = (byPhase[phase] ?? 0) + 1;
    }
    if (typeof errorCode === "string" && errorCode) {
      byErrorCode[errorCode] = (byErrorCode[errorCode] ?? 0) + 1;
    }
    if (typeof status === "number" || typeof status === "string") {
      const key = String(status);
      byStatus[key] = (byStatus[key] ?? 0) + 1;
    }
  }

  return { byPhase, byErrorCode, byStatus };
}

function emptyAggregateFallback(date: string): TelemetryDailyAggregate {
  return {
    date,
    totalEvents: 0,
    byName: {},
    byPath: {},
    bySource: {},
    updatedAt: new Date().toISOString(),
    lastEventAt: null,
    sampleRecentEvents: [],
  };
}

export async function buildDiagnosticSummary(
  daysParam: string | null,
): Promise<DiagnosticSummaryResponse> {
  const days = parseDaysParam(daysParam);
  const dates = dateRangeInclusive(days);

  const aggregates = await Promise.all(
    dates.map(async (date) => {
      const aggregate = await readTelemetryDailyAggregate(date);
      return aggregate ?? { ...emptyAggregateFallback(date) };
    }),
  );

  const daily = aggregates.map(toDailySummary);
  const missingDays = aggregates.filter(isMissingDay).map((a) => a.date);
  const recentDiagnosticEvents = collectRecentDiagnosticEvents(aggregates);

  let updatedAt = new Date(0).toISOString();
  let lastEventAt: string | null = null;

  for (const aggregate of aggregates) {
    if (aggregate.updatedAt > updatedAt) updatedAt = aggregate.updatedAt;
    if (aggregate.lastEventAt) {
      if (!lastEventAt || aggregate.lastEventAt > lastEventAt) {
        lastEventAt = aggregate.lastEventAt;
      }
    }
  }

  if (updatedAt === new Date(0).toISOString()) {
    updatedAt = new Date().toISOString();
  }

  return {
    ok: true,
    source: "internal_telemetry_daily_aggregate",
    scope: "diagnostic_processing",
    days,
    range: { from: dates[0] ?? "", to: dates[dates.length - 1] ?? "" },
    totals: sumTotals(daily),
    daily,
    recentDiagnosticEvents,
    recentFailureBreakdown: buildRecentFailureBreakdown(recentDiagnosticEvents),
    updatedAt,
    lastEventAt,
    missingDays,
  };
}

export { parseDaysParam };
