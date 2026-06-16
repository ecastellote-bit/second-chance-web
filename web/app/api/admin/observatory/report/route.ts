import { NextResponse } from "next/server";
import { loadObservatoryReportForAdmin } from "@/lib/observatory/loadReport";
import type { ObservatoryPeriod } from "@/lib/observatory/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function parsePeriod(value: string | null): ObservatoryPeriod {
  if (value === "7d" || value === "30d" || value === "all") return value;
  return "30d";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parsePeriod(searchParams.get("period"));
    const skipCache = searchParams.get("refresh") === "1";
    const report = await loadObservatoryReportForAdmin(period, { skipCache });

    return NextResponse.json({ ok: true, report });
  } catch (error) {
    console.error("admin/observatory/report failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "internal_error",
        message: error instanceof Error ? error.message : "report_failed",
      },
      { status: 500 },
    );
  }
}
