import { NextResponse } from "next/server";
import { resolveSessionGate } from "./sessionGate";

export type CommunityActionDenyReason =
  | "user_id_required"
  | "community_profile_required"
  | "community_email_required";

export async function checkCommunityActionAllowed(
  userId: string,
): Promise<{ allowed: true } | { allowed: false; error: CommunityActionDenyReason }> {
  const gate = await resolveSessionGate(userId);
  if (gate.allowed) return { allowed: true };
  return {
    allowed: false,
    error: gate.apiError ?? "community_profile_required",
  };
}

export function communityActionDeniedResponse(
  error: CommunityActionDenyReason,
): NextResponse {
  const status = error === "user_id_required" ? 400 : 403;
  return NextResponse.json({ ok: false, error }, { status });
}
