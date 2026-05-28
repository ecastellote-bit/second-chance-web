import { NextResponse } from "next/server";
import { recordFormationSuggestionSubmitted } from "@/lib/community/formationSuggestionRecords";
import {
  FormationSuggestionStoreError,
  createFormationSuggestion,
  getFormationSuggestionStoreMeta,
} from "@/lib/learning/formationSuggestions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      archiveId?: string | null;
      source?: string;
      text?: string;
      selectedThemeId?: string | null;
      activationPath?: string | null;
      userProfileId?: string | null;
      diagnosticArchiveId?: string | null;
    };

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const source = body.source === "activation_path" ? "activation_path" : "formation_page";

    if (!userId || text.length < 10) {
      return NextResponse.json(
        { ok: false, error: "invalid_formation_suggestion_payload" },
        { status: 400 },
      );
    }

    const suggestion = await createFormationSuggestion({
      userId,
      archiveId:
        typeof body.archiveId === "string" ? body.archiveId.trim() : body.archiveId ?? null,
      source,
      text,
      selectedThemeId:
        typeof body.selectedThemeId === "string" ? body.selectedThemeId.trim() : null,
      activationPath:
        typeof body.activationPath === "string" ? body.activationPath.trim() : null,
      userProfileId:
        typeof body.userProfileId === "string" ? body.userProfileId.trim() : null,
      diagnosticArchiveId:
        typeof body.diagnosticArchiveId === "string" ? body.diagnosticArchiveId.trim() : null,
    });

    await recordFormationSuggestionSubmitted({
      userId,
      archiveId: suggestion.archiveId ?? null,
      suggestionId: suggestion.suggestionId,
    });

    return NextResponse.json({
      ok: true,
      suggestion,
      store: getFormationSuggestionStoreMeta(),
      confirmation:
        "Tu sugerencia quedó guardada. Esto nos ayuda a buscar propuestas formativas más conectadas con lo que la comunidad necesita.",
    });
  } catch (error) {
    if (error instanceof FormationSuggestionStoreError) {
      return NextResponse.json(
        { ok: false, error: error.code, message: error.message },
        { status: error.code === "blob_not_configured" ? 503 : 500 },
      );
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "create_failed" },
      { status: 500 },
    );
  }
}
