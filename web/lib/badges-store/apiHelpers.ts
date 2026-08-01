import { NextResponse } from "next/server";

export function requireUserId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  return id.length > 0 ? id : null;
}

export function missingUserIdResponse() {
  return NextResponse.json({ ok: false, error: "user_id_required" }, { status: 401 });
}

export function mapBadgeError(error: unknown): NextResponse {
  const code = error instanceof Error ? error.message : "badge_error";
  const status =
    code === "user_id_required"
      ? 401
      : code === "badge_not_found"
        ? 404
        : code === "badge_slug_required"
          ? 400
          : 500;
  return NextResponse.json({ ok: false, error: code }, { status });
}
