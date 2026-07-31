import { NextResponse } from "next/server";
import {
  checkCommunityActionAllowed,
  communityActionDeniedResponse,
} from "@/lib/users/assertCommunityActionAllowed";

export function requireUserId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  return id.length > 0 ? id : null;
}

export function missingUserIdResponse() {
  return NextResponse.json({ ok: false, error: "user_id_required" }, { status: 401 });
}

export async function requireCommunityUser(userId: string) {
  const gate = await checkCommunityActionAllowed(userId);
  if (!gate.allowed) {
    return communityActionDeniedResponse(gate.error);
  }
  return null;
}

export function mapProjectError(error: unknown): NextResponse {
  const code = error instanceof Error ? error.message : "project_error";
  const statusMap: Record<string, number> = {
    user_id_required: 401,
    profile_not_found: 404,
    project_not_found: 404,
    role_not_found: 404,
    member_not_found: 404,
    milestone_not_found: 404,
    forbidden_not_creator: 403,
    application_self_not_allowed: 403,
    project_creator_limit: 400,
    application_pending_limit: 400,
    application_already_exists: 409,
    role_already_filled: 409,
    application_not_pending: 409,
    milestone_already_completed: 409,
    project_title_required: 400,
    project_description_too_short: 400,
    project_description_too_long: 400,
    project_roles_required: 400,
    project_roles_too_many: 400,
    application_message_required: 400,
    application_message_too_long: 400,
    milestone_title_required: 400,
    role_id_required: 400,
  };
  return NextResponse.json(
    { ok: false, error: code },
    { status: statusMap[code] ?? 500 },
  );
}
