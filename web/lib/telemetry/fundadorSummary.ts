import type { TelemetryDailyAggregate, TelemetrySampleEvent } from "./types";
import { readTelemetryDailyAggregate } from "./store";

const SAFE_PROPERTY_KEYS = [
  "ctaId",
  "destination",
  "section",
  "choiceId",
  "depth",
  "trigger",
  "hasFreeText",
  "freeTextLength",
  "labelKey",
  "variant",
  "route",
  "source",
] as const;

export type FundadorDailySummary = {
  date: string;
  founderLandingViews: number;
  founderPrimaryCtaClicks: number;
  founderSecondaryCtaClicks: number;
  founderMicrochoices: number;
  founderScrollEvents: number;
  founderExitFeedbackOpened: number;
  founderExitFeedbackSubmitted: number;
  founderTotalEvents: number;
  allTelemetryEvents: number;
};

export type FundadorSummaryTotals = Omit<FundadorDailySummary, "date">;

export type FundadorSummaryRecentEvent = {
  eventId: string;
  name: string;
  path: string;
  timestamp: string;
  properties: Record<string, string | number | boolean | null>;
};

export type FundadorSummaryResponse = {
  ok: true;
  source: "internal_telemetry_daily_aggregate";
  days: number;
  range: { from: string; to: string };
  totals: FundadorSummaryTotals;
  daily: FundadorDailySummary[];
  recentFounderEvents: FundadorSummaryRecentEvent[];
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

function toDailySummary(aggregate: TelemetryDailyAggregate): FundadorDailySummary {
  return {
    date: aggregate.date,
    founderLandingViews: countByName(aggregate, "founder_landing_viewed"),
    founderPrimaryCtaClicks: countByName(aggregate, "founder_primary_cta_clicked"),
    founderSecondaryCtaClicks: countByName(aggregate, "founder_secondary_cta_clicked"),
    founderMicrochoices: countByName(aggregate, "founder_microchoice_selected"),
    founderScrollEvents: countByName(aggregate, "scroll_depth_reached"),
    founderExitFeedbackOpened: countByName(aggregate, "founder_exit_feedback_opened"),
    founderExitFeedbackSubmitted: countByName(aggregate, "founder_exit_feedback_submitted"),
    founderTotalEvents: aggregate.byPath["/fundador"] ?? 0,
    allTelemetryEvents: aggregate.totalEvents,
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

function toRecentEvent(event: TelemetrySampleEvent): FundadorSummaryRecentEvent {
  return {
    eventId: event.eventId,
    name: event.name,
    path: event.path,
    timestamp: event.timestamp,
    properties: pickSafeProperties(event.properties),
  };
}

function sumTotals(daily: FundadorDailySummary[]): FundadorSummaryTotals {
  return daily.reduce<FundadorSummaryTotals>(
    (acc, row) => ({
      founderLandingViews: acc.founderLandingViews + row.founderLandingViews,
      founderPrimaryCtaClicks: acc.founderPrimaryCtaClicks + row.founderPrimaryCtaClicks,
      founderSecondaryCtaClicks:
        acc.founderSecondaryCtaClicks + row.founderSecondaryCtaClicks,
      founderMicrochoices: acc.founderMicrochoices + row.founderMicrochoices,
      founderScrollEvents: acc.founderScrollEvents + row.founderScrollEvents,
      founderExitFeedbackOpened:
        acc.founderExitFeedbackOpened + row.founderExitFeedbackOpened,
      founderExitFeedbackSubmitted:
        acc.founderExitFeedbackSubmitted + row.founderExitFeedbackSubmitted,
      founderTotalEvents: acc.founderTotalEvents + row.founderTotalEvents,
      allTelemetryEvents: acc.allTelemetryEvents + row.allTelemetryEvents,
    }),
    {
      founderLandingViews: 0,
      founderPrimaryCtaClicks: 0,
      founderSecondaryCtaClicks: 0,
      founderMicrochoices: 0,
      founderScrollEvents: 0,
      founderExitFeedbackOpened: 0,
      founderExitFeedbackSubmitted: 0,
      founderTotalEvents: 0,
      allTelemetryEvents: 0,
    },
  );
}

function collectRecentFounderEvents(
  aggregates: TelemetryDailyAggregate[],
): FundadorSummaryRecentEvent[] {
  const seen = new Set<string>();
  const events: FundadorSummaryRecentEvent[] = [];

  for (const aggregate of aggregates) {
    for (const event of aggregate.sampleRecentEvents) {
      if (event.path !== "/fundador") continue;
      if (seen.has(event.eventId)) continue;
      seen.add(event.eventId);
      events.push(toRecentEvent(event));
    }
  }

  return events
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 20);
}

export async function buildFundadorSummary(
  daysParam: string | null,
): Promise<FundadorSummaryResponse> {
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
    days,
    range: { from: dates[0] ?? "", to: dates[dates.length - 1] ?? "" },
    totals: sumTotals(daily),
    daily,
    recentFounderEvents: collectRecentFounderEvents(aggregates),
    updatedAt,
    lastEventAt,
    missingDays,
  };
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

export { parseDaysParam };
