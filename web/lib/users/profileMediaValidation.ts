export const PROFILE_MEDIA_MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ProfileMediaKind = "avatar" | "cover";

export function getProfileMediaBlobPathname(
  kind: ProfileMediaKind,
  userId: string,
  ext: "jpg" | "png" | "webp",
): string {
  const folder = kind === "avatar" ? "avatars" : "covers";
  return `profile-media/${folder}/${userId}.${ext}`;
}

export function extFromMime(mime: string): "jpg" | "png" | "webp" | null {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

export function resolveProfileFileMime(file: Pick<File, "type" | "name">): string | null {
  const type = file.type?.toLowerCase().trim() ?? "";
  if (ALLOWED.has(type)) return type;
  if (type === "image/jpg") return "image/jpeg";
  if (type === "image/heic" || type === "image/heif") return null;

  const name = file.name.toLowerCase();
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";

  if (type === "application/octet-stream") {
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
    if (name.endsWith(".png")) return "image/png";
    if (name.endsWith(".webp")) return "image/webp";
  }

  return null;
}

export function validateProfileMediaFile(
  file: File,
): { mime: string; ext: "jpg" | "png" | "webp" } {
  const mime = resolveProfileFileMime(file);
  if (!mime) throw new Error("image_invalid_type");
  if (file.size > PROFILE_MEDIA_MAX_BYTES) throw new Error("image_too_large");
  const ext = extFromMime(mime);
  if (!ext) throw new Error("image_invalid_type");
  return { mime, ext };
}
