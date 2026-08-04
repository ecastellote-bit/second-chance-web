import { NextResponse } from "next/server";
import { updateProfileEmail } from "@/lib/users/userProfileStore";
import {
  isCommunityEmailReady,
  toUserProfileClientView,
} from "@/lib/users/userProfileTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Completa solo el email de un perfil ya válido (gate email_missing).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      email?: string;
      notificationConsent?: boolean;
    };

    const userId = body.userId?.trim() ?? "";
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "user_id_required" },
        { status: 401 },
      );
    }

    const profile = await updateProfileEmail({
      userId,
      email: body.email ?? "",
      notificationConsent: body.notificationConsent,
    });

    return NextResponse.json({
      ok: true,
      profile: toUserProfileClientView(profile),
      communityContact: {
        hasEmail: isCommunityEmailReady(profile),
        notificationConsent: profile.notificationConsent === true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "email_update_failed";
    const status =
      message === "user_id_required"
        ? 401
        : message === "profile_not_found"
          ? 404
          : message === "email_invalid" || message === "profile_incomplete"
            ? 400
            : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
