import { NextResponse } from "next/server";
import { listPublicFormationThemes } from "@/lib/community/publicFormationThemes";
import { FormationSuggestionStoreError } from "@/lib/learning/formationSuggestions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const limit = Math.min(Number(new URL(req.url).searchParams.get("limit") ?? 6), 12);
    const themes = await listPublicFormationThemes({ limit });
    return NextResponse.json({ ok: true, themes, total: themes.length });
  } catch (error) {
    if (error instanceof FormationSuggestionStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, themes: [], total: 0 },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "public_themes_failed", themes: [], total: 0 },
      { status: 500 },
    );
  }
}
