import { NextResponse } from "next/server";
import { findUserProfileByEmail } from "@/lib/users/userProfileStore";
import {
  isUserProfileComplete,
  normalizeCommunityEmail,
  toUserProfileClientView,
} from "@/lib/users/userProfileTypes";
import { appendObservatoryEvent, buildObservatoryEvent } from "@/lib/observatory/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Retoma la identidad vinculada a un email de contacto privado.
 * MVP sin verificación de inbox: quien conoce el email reclama la sesión local.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = normalizeCommunityEmail(body.email);

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "email_invalid" },
        { status: 400 },
      );
    }

    const profile = await findUserProfileByEmail(email);
    if (!profile) {
      return NextResponse.json(
        { ok: false, error: "profile_not_found" },
        { status: 404 },
      );
    }

    if (!isUserProfileComplete(profile)) {
      return NextResponse.json(
        {
          ok: false,
          error: "profile_incomplete",
          userId: profile.userId,
        },
        { status: 409 },
      );
    }

    await appendObservatoryEvent(
      buildObservatoryEvent({
        type: "funnel.profile_resumed",
        scenario: "user_profile",
        payload: {
          userId: profile.userId,
          hasEmail: true,
        },
      }),
    ).catch(() => {});

    return NextResponse.json({
      ok: true,
      userId: profile.userId,
      profile: toUserProfileClientView(profile),
      complete: true,
      communityContact: {
        hasEmail: true,
        notificationConsent: profile.notificationConsent === true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "resume_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
