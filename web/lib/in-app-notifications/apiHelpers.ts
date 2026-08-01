import { NextResponse } from "next/server";

export function requireUserId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  return id.length > 0 ? id : null;
}

export function missingUserIdResponse() {
  return NextResponse.json({ ok: false, error: "user_id_required" }, { status: 401 });
}

export function mapInAppError(error: unknown): NextResponse {
  const code = error instanceof Error ? error.message : "notification_error";
  const status =
    code === "user_id_required"
      ? 401
      : code === "forbidden"
        ? 403
        : code === "notification_not_found"
          ? 404
          : 500;
  return NextResponse.json({ ok: false, error: code }, { status });
}
