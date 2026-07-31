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
  if (!gate.allowed) return communityActionDeniedResponse(gate.error);
  return null;
}

export function mapCommunityError(error: unknown): NextResponse {
  const code = error instanceof Error ? error.message : "community_error";
  const statusMap: Record<string, number> = {
    user_id_required: 401,
    profile_not_found: 404,
    post_not_found: 404,
    post_content_required: 400,
    post_content_too_long: 400,
    post_content_moderated: 400,
    post_daily_limit: 429,
    circle_tag_invalid: 400,
    link_url_required: 400,
    comment_content_required: 400,
    comment_content_too_long: 400,
    comment_content_moderated: 400,
  };
  const messages: Record<string, string> = {
    post_daily_limit: "Límite diario alcanzado. Volvé mañana.",
    post_content_moderated:
      "Revisá el tono del mensaje. En el barrio cuidamos cómo nos hablamos.",
    comment_content_moderated:
      "Revisá el tono del comentario. En el barrio cuidamos cómo nos hablamos.",
    circle_tag_invalid: "Elegí un tema (círculo) del catálogo.",
  };
  return NextResponse.json(
    { ok: false, error: code, message: messages[code] ?? code },
    { status: statusMap[code] ?? 500 },
  );
}
