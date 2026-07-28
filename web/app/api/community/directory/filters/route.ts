import { NextResponse } from "next/server";
import { toPublicFamilyLabel } from "@/lib/public/humanFamilyLabel";
import { getDirectoryFilterOptions } from "@/lib/users/userProfileStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filters = await getDirectoryFilterOptions();

    return NextResponse.json({
      ok: true,
      filters: {
        familiaVocacional: filters.familiaVocacional.map((id) => ({
          id,
          label: toPublicFamilyLabel(id) ?? id,
        })),
        country: filters.country,
        buscando: filters.buscando,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "directory_filters_failed",
      },
      { status: 500 },
    );
  }
}
