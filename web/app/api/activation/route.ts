import { NextRequest, NextResponse } from "next/server";
import { buildActivationDecision, recordActivationChoice } from "@/lib/engines/activationEngine";
import { guidedThemesMvpV02 } from "@/lib/registries/guidedThemesMvpV02";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "get_activations") {
      return handleGetActivations(body);
    }

    if (action === "choose_activation") {
      return handleChooseActivation(body);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function handleGetActivations(body: {
  themeId: string;
  matchedFamilies?: string[];
  matchedAffinities?: string[];
}) {
  const { themeId, matchedFamilies = [], matchedAffinities = [] } = body;

  const theme = guidedThemesMvpV02.find((t) => t.id === themeId);
  if (!theme) {
    return NextResponse.json({ error: `Theme "${themeId}" not found` }, { status: 404 });
  }

  const decision = buildActivationDecision({
    selectedThemeId: theme.id,
    selectedThemeLabel: theme.shortLabel,
    suggestedActivationPaths: theme.suggestedActivationPaths,
    communitySpaceHints: theme.communitySpaceHints,
    matchedFamilies,
    matchedAffinities,
  });

  return NextResponse.json({ ok: true, decision });
}

function handleChooseActivation(body: {
  themeId: string;
  activationPathId: string;
  userId?: string;
}) {
  const { themeId, activationPathId, userId } = body;

  if (!themeId || !activationPathId) {
    return NextResponse.json(
      { error: "themeId and activationPathId are required" },
      { status: 400 },
    );
  }

  const result = recordActivationChoice({
    themeId,
    activationPathId,
    userId,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, ...result });
}
