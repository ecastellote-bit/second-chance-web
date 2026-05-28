import { NextResponse } from "next/server";
import {
  FormationSuggestionStoreError,
  type FormationSuggestionStatus,
  getFormationSuggestionStoreMeta,
  listFormationSuggestions,
} from "@/lib/learning/formationSuggestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<FormationSuggestionStatus>(["new", "reviewed", "archived"]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status")?.trim();
    const userId = url.searchParams.get("userId")?.trim();
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 200), 1000);

    const status =
      statusParam && VALID_STATUSES.has(statusParam as FormationSuggestionStatus)
        ? (statusParam as FormationSuggestionStatus)
        : undefined;

    const suggestions = await listFormationSuggestions({
      status,
      userId: userId || undefined,
      limit,
    });

    return NextResponse.json({
      ok: true,
      total: suggestions.length,
      suggestions,
      store: getFormationSuggestionStoreMeta(),
    });
  } catch (error) {
    if (error instanceof FormationSuggestionStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "list_failed" },
      { status: 500 },
    );
  }
}
