import { NextResponse } from "next/server";
import {
  FormationSuggestionStoreError,
  type FormationSuggestionStatus,
  updateFormationSuggestionStatus,
} from "@/lib/learning/formationSuggestions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<FormationSuggestionStatus>(["reviewed", "archived"]);

type RouteContext = { params: Promise<{ suggestionId: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { suggestionId } = await context.params;
    const body = (await req.json()) as { status?: string };
    const status = typeof body.status === "string" ? body.status.trim() : "";
    if (!VALID_STATUSES.has(status as FormationSuggestionStatus)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 400 });
    }

    const suggestion = await updateFormationSuggestionStatus(
      suggestionId,
      status as FormationSuggestionStatus,
    );
    if (!suggestion) {
      return NextResponse.json({ ok: false, error: "suggestion_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, suggestion });
  } catch (error) {
    if (error instanceof FormationSuggestionStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "update_failed" },
      { status: 500 },
    );
  }
}
