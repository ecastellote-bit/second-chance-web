import { NextResponse } from "next/server";
import { readTelemetryDailyAggregate } from "@/lib/telemetry/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseDateParam(value: string | null): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = parseDateParam(searchParams.get("date"));
    const aggregate = await readTelemetryDailyAggregate(date);

    if (!aggregate) {
      return NextResponse.json({ ok: false, error: "invalid_date" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      aggregate,
      store: { read: "daily_aggregate_only" },
    });
  } catch (error) {
    console.error("admin/telemetry/daily failed:", error);
    return NextResponse.json({ ok: false, error: "read_failed" }, { status: 500 });
  }
}
