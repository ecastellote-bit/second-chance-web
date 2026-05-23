import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;
import { getFoundationalCohortBatch } from "@/lib/learning/foundationalCohort";
import { findUserProfileById, upsertUserProfile } from "@/lib/users/userProfileStore";
import { parseChipInput } from "@/lib/users/userProfileTypes";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId")?.trim();

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "userId_required" },
      { status: 400 },
    );
  }

  const profile = await findUserProfileById(userId);
  return NextResponse.json({
    ok: true,
    profile,
    complete: Boolean(profile),
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      displayName?: string;
      headline?: string;
      momentoActual?: string;
      country?: string;
      buscando?: string | string[];
      aportar?: string | string[];
      diagnosticArchiveId?: string | null;
      cohortBatch?: string | null;
      avatarUrl?: string | null;
      coverUrl?: string | null;
    };

    const buscando = Array.isArray(body.buscando)
      ? body.buscando.map((s) => String(s).trim()).filter(Boolean)
      : parseChipInput(String(body.buscando ?? ""));

    const aportar = Array.isArray(body.aportar)
      ? body.aportar.map((s) => String(s).trim()).filter(Boolean)
      : parseChipInput(String(body.aportar ?? ""));

    const result = await upsertUserProfile(
      {
        userId: body.userId,
        displayName: String(body.displayName ?? ""),
        headline: String(body.headline ?? ""),
        momentoActual: String(body.momentoActual ?? ""),
        country: body.country,
        buscando,
        aportar,
        diagnosticArchiveId: body.diagnosticArchiveId ?? null,
        cohortBatch: body.cohortBatch ?? getFoundationalCohortBatch(),
        avatarUrl: body.avatarUrl ?? null,
        coverUrl: body.coverUrl ?? null,
      },
      { forceUserId: body.userId?.trim() },
    );

    await appendObservatoryEvent(
      buildObservatoryEvent({
        type: "funnel.barrio_commitment",
        scenario: "user_profile",
        payload: {
          userId: result.profile.userId,
          created: result.created,
          hasDiagnostic: Boolean(result.profile.diagnosticArchiveId),
        },
      }),
    ).catch(() => {});

    return NextResponse.json({
      ok: true,
      profile: result.profile,
      created: result.created,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "save_failed";
    const status =
      message === "profile_incomplete" ||
      message === "avatar_required" ||
      message.startsWith("blob_not_configured")
        ? 400
        : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
