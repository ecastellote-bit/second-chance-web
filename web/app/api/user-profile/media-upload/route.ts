import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isVercelBlobConfigured } from "@/lib/storage/vercelBlobEnv";
import {
  getProfileMediaBlobPathname,
  type ProfileMediaKind,
} from "@/lib/users/profileMediaValidation";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "application/octet-stream",
];

type ClientPayload = {
  userId?: string;
  kind?: ProfileMediaKind;
};

function parsePayload(raw: string | null | undefined): ClientPayload {
  if (!raw?.trim()) return {};
  try {
    return JSON.parse(raw) as ClientPayload;
  } catch {
    return {};
  }
}

function isSafeUserId(userId: string): boolean {
  return /^vu_[a-z0-9_]+$/i.test(userId);
}

/** Token para subida directa celu → Blob (sin webhook onUploadCompleted). */
export async function POST(request: Request): Promise<NextResponse> {
  if (!isVercelBlobConfigured()) {
    return NextResponse.json(
      { error: "blob_not_configured:profile_media_upload" },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parsePayload(clientPayload);
        const userId = payload.userId?.trim() ?? "";
        const kind = payload.kind;

        if (!userId || !isSafeUserId(userId) || (kind !== "avatar" && kind !== "cover")) {
          throw new Error("invalid_upload_payload");
        }

        const validPath =
          pathname === getProfileMediaBlobPathname(kind, userId, "jpg") ||
          pathname === getProfileMediaBlobPathname(kind, userId, "png") ||
          pathname === getProfileMediaBlobPathname(kind, userId, "webp");

        if (!validPath) {
          throw new Error("invalid_upload_path");
        }

        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: 3 * 1024 * 1024,
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload_token_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
