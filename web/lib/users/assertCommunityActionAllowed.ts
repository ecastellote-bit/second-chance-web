import { NextResponse } from "next/server";
import { findUserProfileById } from "./userProfileStore";
import { isCommunityEmailReady, isUserProfileComplete } from "./userProfileTypes";

export type CommunityActionDenyReason =
  | "user_id_required"
  | "community_profile_required"
  | "community_email_required";

export async function checkCommunityActionAllowed(
  userId: string,
): Promise<{ allowed: true } | { allowed: false; error: CommunityActionDenyReason }> {
  const id = userId.trim();
  if (!id) {
    return { allowed: false, error: "user_id_required" };
  }

  const profile = await findUserProfileById(id);
  if (!profile || !isUserProfileComplete(profile)) {
    return { allowed: false, error: "community_profile_required" };
  }
  if (!isCommunityEmailReady(profile)) {
    return { allowed: false, error: "community_email_required" };
  }

  return { allowed: true };
}

export function communityActionDeniedResponse(
  error: CommunityActionDenyReason,
): NextResponse {
  const status = error === "user_id_required" ? 400 : 403;
  return NextResponse.json({ ok: false, error }, { status });
}
