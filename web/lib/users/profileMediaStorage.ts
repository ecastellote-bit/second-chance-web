import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
} from "@/lib/storage/vercelBlobEnv";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ProfileMediaKind = "avatar" | "cover";

export function profileMediaPublicPath(
  kind: ProfileMediaKind,
  userId: string,
  ext: "jpg" | "png" | "webp",
): string {
  const folder = kind === "avatar" ? "avatars" : "covers";
  return `/uploads/${folder}/${userId}.${ext}`;
}

export function profileMediaFilePath(
  kind: ProfileMediaKind,
  userId: string,
  ext: "jpg" | "png" | "webp",
): string {
  const folder = kind === "avatar" ? "avatars" : "covers";
  return path.join(process.cwd(), "public", "uploads", folder, `${userId}.${ext}`);
}

function profileMediaBlobPath(
  kind: ProfileMediaKind,
  userId: string,
  ext: "jpg" | "png" | "webp",
): string {
  const folder = kind === "avatar" ? "avatars" : "covers";
  return `profile-media/${folder}/${userId}.${ext}`;
}

export function extFromMime(mime: string): "jpg" | "png" | "webp" | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

export async function saveProfileMedia(
  kind: ProfileMediaKind,
  userId: string,
  file: File,
): Promise<{ url: string }> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("image_invalid_type");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("image_too_large");
  }

  const ext = extFromMime(file.type);
  if (!ext) throw new Error("image_invalid_type");

  const buffer = Buffer.from(await file.arrayBuffer());

  if (isVercelBlobConfigured()) {
    try {
      const written = await put(profileMediaBlobPath(kind, userId, ext), buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return { url: written.url };
    } catch {
      throw new Error(`${kind}_upload_failed`);
    }
  }

  assertVercelBlobForProduction("profile_media");

  const folder = kind === "avatar" ? "avatars" : "covers";
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(profileMediaFilePath(kind, userId, ext), buffer);

  return { url: profileMediaPublicPath(kind, userId, ext) };
}
