import { buildObservatoryReport } from "./aggregate";
import { readObservatoryReportCache, writeObservatoryReportCache } from "./reportCache";
import { readObservatoryEventsBounded } from "./store";
import type { ObservatoryPeriod, ObservatoryReport } from "./types";

const SERVER_BUDGET_MS = 6500;

export async function loadObservatoryReportForAdmin(
  period: ObservatoryPeriod,
  options?: { skipCache?: boolean },
): Promise<ObservatoryReport> {
  try {
    const bounded = await readObservatoryEventsBounded({
      period,
      timeBudgetMs: SERVER_BUDGET_MS,
      maxEvents: 2500,
    });
    const report = buildObservatoryReport(bounded.events, period);
    report.readMeta = {
      partial: bounded.partial,
      stale: false,
      fetchedEvents: bounded.events.length,
      listedBlobs: bounded.listedBlobs,
      timedOut: bounded.timedOut,
      cachedAt: new Date().toISOString(),
    };
    await writeObservatoryReportCache(period, report);
    return report;
  } catch (error) {
    if (!options?.skipCache) {
      const cached = await readObservatoryReportCache(period);
      if (cached) {
        return {
          ...cached,
          readMeta: {
            ...cached.readMeta,
            stale: true,
            cachedAt: cached.readMeta?.cachedAt ?? cached.generatedAt,
          },
        };
      }
    }
    throw error;
  }
}
