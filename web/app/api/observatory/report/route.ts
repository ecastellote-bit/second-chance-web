import { NextResponse } from "next/server";

/** Reporte movido bajo admin — el endpoint público ya no expone métricas internas. */
export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "report_admin_only",
      message: "Usá /api/admin/observatory/report con credencial de admin.",
    },
    { status: 403 },
  );
}
