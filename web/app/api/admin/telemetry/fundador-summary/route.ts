import { NextResponse } from "next/server";
import { buildFundadorSummary } from "@/lib/telemetry/fundadorSummary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const summary = await buildFundadorSummary(searchParams.get("days"));

    return NextResponse.json(summary);
  } catch (error) {
    console.error("admin/telemetry/fundador-summary failed:", error);
    return NextResponse.json({ ok: false, error: "read_failed" }, { status: 500 });
  }
}
