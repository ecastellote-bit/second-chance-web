"use client";

import { upload } from "@vercel/blob/client";
import {
  getProfileMediaBlobPathname,
  validateProfileMediaFile,
  type ProfileMediaKind,
} from "@/lib/users/profileMediaValidation";

export function shouldUseClientProfileUpload(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1";
}

/** Sube directo del celu/navegador a Vercel Blob (evita límite de FormData en el servidor). */
export async function uploadProfileMediaFromBrowser(
  kind: ProfileMediaKind,
  userId: string,
  file: File,
): Promise<string> {
  const { ext } = validateProfileMediaFile(file);
  const pathname = getProfileMediaBlobPathname(kind, userId, ext);

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/user-profile/media-upload",
    clientPayload: JSON.stringify({ userId, kind }),
  });

  return blob.url;
}

export async function uploadProfileMediaViaApi(
  kind: ProfileMediaKind,
  userId: string,
  file: File,
): Promise<string> {
  const form = new FormData();
  form.set("userId", userId);
  form.set(kind === "avatar" ? "avatar" : "cover", file);

  const endpoint =
    kind === "avatar" ? "/api/user-profile/avatar" : "/api/user-profile/cover";
  const res = await fetch(endpoint, { method: "POST", body: form });
  const text = await res.text();
  let data: { ok?: boolean; error?: string; avatarUrl?: string; coverUrl?: string };
  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    throw new Error(`${kind}_upload_failed:invalid_response`);
  }

  const url = kind === "avatar" ? data.avatarUrl : data.coverUrl;
  if (!res.ok || !data.ok || !url) {
    throw new Error(data.error ?? `${kind}_upload_failed`);
  }
  return url;
}

export async function uploadProfileMedia(
  kind: ProfileMediaKind,
  userId: string,
  file: File,
): Promise<string> {
  if (shouldUseClientProfileUpload()) {
    try {
      return await uploadProfileMediaFromBrowser(kind, userId, file);
    } catch {
      // Fallback si el token exchange falla
    }
  }
  return uploadProfileMediaViaApi(kind, userId, file);
}
