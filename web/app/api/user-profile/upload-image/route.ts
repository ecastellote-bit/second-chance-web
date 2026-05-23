import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isVercelBlobConfigured, assertVercelBlobForProduction } from "@/lib/storage/vercelBlobEnv";
import {
  getProfileMediaBlobPutOptions,
  resolveUploadedProfileMediaUrl,
} from "@/lib/storage/profileMediaBlob";
import {
  getProfileMediaBlobPathname,
  PROFILE_MEDIA_MAX_BYTES,
  type ProfileMediaKind,
} from "@/lib/users/profileMediaValidation";

export const runtime = "nodejs";
export const maxDuration = 60;

function isSafeUserId(userId: string): boolean {
  return /^vu_[a-z0-9_]+$/i.test(userId);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      kind?: ProfileMediaKind;
      imageBase64?: string;
    };

    const userId = body.userId?.trim() ?? "";
    const kind = body.kind;
    const rawBase64 = body.imageBase64?.trim() ?? "";

    if (!userId || !isSafeUserId(userId)) {
      return NextResponse.json({ ok: false, error: "userId_required" }, { status: 400 });
    }
    if (kind !== "avatar" && kind !== "cover") {
      return NextResponse.json({ ok: false, error: "kind_invalid" }, { status: 400 });
    }
    if (!rawBase64) {
      return NextResponse.json({ ok: false, error: "image_required" }, { status: 400 });
    }

    const normalized = rawBase64.includes(",")
      ? (rawBase64.split(",").pop() ?? "")
      : rawBase64;

    let bytes: Buffer;
    try {
      bytes = Buffer.from(normalized, "base64");
    } catch {
      return NextResponse.json({ ok: false, error: "image_invalid" }, { status: 400 });
    }

    if (bytes.length === 0) {
      return NextResponse.json({ ok: false, error: "image_empty" }, { status: 400 });
    }
    if (bytes.length > PROFILE_MEDIA_MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "image_too_large" }, { status: 400 });
    }

    if (!isVercelBlobConfigured()) {
      assertVercelBlobForProduction("profile_media");
      return NextResponse.json(
        { ok: false, error: "blob_not_configured:profile_media" },
        { status: 503 },
      );
    }

    const pathname = getProfileMediaBlobPathname(kind, userId, "jpg");

    const blobOptions = getProfileMediaBlobPutOptions();
    const written = await put(pathname, bytes, {
      ...blobOptions,
      contentType: "image/jpeg",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({
      ok: true,
      url: resolveUploadedProfileMediaUrl(pathname, written.url),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
