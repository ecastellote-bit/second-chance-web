import { NextResponse } from "next/server";
import { saveProfileMedia } from "@/lib/users/profileMediaStorage";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const userId = String(form.get("userId") ?? "").trim();
    const file = form.get("cover");

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId_required" }, { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "cover_required" }, { status: 400 });
    }

    const { url: coverUrl } = await saveProfileMedia("cover", userId, file);

    return NextResponse.json({ ok: true, coverUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "cover_upload_failed";
    const status =
      message === "image_invalid_type" || message === "image_too_large" ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
