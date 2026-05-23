import { NextResponse } from "next/server";
import { saveProfileMedia } from "@/lib/users/profileMediaStorage";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const userId = String(form.get("userId") ?? "").trim();
    const file = form.get("avatar");

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId_required" }, { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "avatar_required" }, { status: 400 });
    }

    const { url: avatarUrl } = await saveProfileMedia("avatar", userId, file);

    return NextResponse.json({ ok: true, avatarUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "avatar_upload_failed";
    const status =
      message === "image_invalid_type" || message === "image_too_large" ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
