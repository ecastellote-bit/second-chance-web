import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import {
  assertVercelBlobForProduction,
  isVercelBlobConfigured,
} from "@/lib/storage/vercelBlobEnv";
import {
  getProfileMediaBlobPathname,
  resolveProfileMediaForUpload,
  type ProfileMediaKind,
} from "@/lib/users/profileMediaValidation";
import { profileMediaDeliveryUrl } from "@/lib/users/profileMediaDelivery";

export type { ProfileMediaKind } from "@/lib/users/profileMediaValidation";
export {
  PROFILE_MEDIA_MAX_BYTES,
  getProfileMediaBlobPathname,
  resolveProfileMediaForUpload,
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
  const { mime, ext } = resolveProfileMediaForUpload(file);
  const pathname = getProfileMediaBlobPathname(kind, userId, ext);
  const bytes = Buffer.from(await file.arrayBuffer());

  if (bytes.length === 0) {
    throw new Error("image_empty");
  }

  if (isVercelBlobConfigured()) {
    try {
      await put(pathname, bytes, {
        access: "private",
        contentType: mime,
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return { url: profileMediaDeliveryUrl(pathname) };
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown";
      throw new Error(`${kind}_upload_failed:${detail}`);
    }
  }

  assertVercelBlobForProduction("profile_media");

  const folder = kind === "avatar" ? "avatars" : "covers";
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(profileMediaFilePath(kind, userId, ext), bytes);

  return { url: profileMediaPublicPath(kind, userId, ext) };
}
