import { get, put } from "@vercel/blob";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import type { ObservatoryPeriod, ObservatoryReport } from "./types";

const CACHE_PREFIX = "admin-cache";

function cacheBlobPath(period: ObservatoryPeriod): string {
  return `${CACHE_PREFIX}/observatory-report-${period}.json`;
}

export async function readObservatoryReportCache(
  period: ObservatoryPeriod,
): Promise<ObservatoryReport | null> {
  if (!isVercelBlobConfigured()) return null;
  try {
    const result = await get(cacheBlobPath(period), { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const parsed = JSON.parse(await new Response(result.stream).text()) as ObservatoryReport;
    if (!parsed?.generatedAt || !parsed.period) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeObservatoryReportCache(
  period: ObservatoryPeriod,
  report: ObservatoryReport,
): Promise<void> {
  if (!isVercelBlobConfigured()) return;
  await put(cacheBlobPath(period), JSON.stringify(report), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
