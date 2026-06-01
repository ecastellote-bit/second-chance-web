import { NextResponse } from "next/server";
import { loadUnifiedModerationDashboard } from "@/lib/admin/unifiedModeration/loadDashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dashboard = await loadUnifiedModerationDashboard();
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "dashboard_load_failed",
      },
      { status: 500 },
    );
  }
}
