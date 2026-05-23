import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
} from "@/lib/storage/vercelBlobEnv";
import {
  getProfileMediaBlobPathname,
  validateProfileMediaFile,
  type ProfileMediaKind,
} from "@/lib/users/profileMediaValidation";

export type { ProfileMediaKind } from "@/lib/users/profileMediaValidation";
export {
  PROFILE_MEDIA_MAX_BYTES,
  getProfileMediaBlobPathname,
  validateProfileMediaFile,
} from "@/lib/users/profileMediaValidation";

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

export async function saveProfileMedia(
  kind: ProfileMediaKind,
  userId: string,
  file: File,
): Promise<{ url: string }> {
  const { mime, ext } = validateProfileMediaFile(file);
  const pathname = getProfileMediaBlobPathname(kind, userId, ext);

  if (isVercelBlobConfigured()) {
    try {
      const written = await put(pathname, file, {
        access: "public",
        contentType: mime,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return { url: written.url };
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown";
      throw new Error(`${kind}_upload_failed:${detail}`);
    }
  }

  assertVercelBlobForProduction("profile_media");

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = kind === "avatar" ? "avatars" : "covers";
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(profileMediaFilePath(kind, userId, ext), buffer);

  return { url: profileMediaPublicPath(kind, userId, ext) };
}
