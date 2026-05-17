import { NextResponse } from "next/server";
import { buildObservatoryReport } from "@/lib/observatory/aggregate";
import { readObservatoryEvents } from "@/lib/observatory/store";
import type { ObservatoryPeriod } from "@/lib/observatory/types";

function parsePeriod(value: string | null): ObservatoryPeriod {
  if (value === "7d" || value === "30d" || value === "all") return value;
  return "30d";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = parsePeriod(searchParams.get("period"));
    const events = await readObservatoryEvents();
    const report = buildObservatoryReport(events, period);

    return NextResponse.json({ ok: true, report });
  } catch (error) {
    console.error("observatory/report failed:", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
