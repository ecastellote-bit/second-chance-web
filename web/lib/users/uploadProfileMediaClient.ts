"use client";

import { upload } from "@vercel/blob/client";
import {
  profileMediaUsesPublicStoreClient,
} from "@/lib/storage/profileMediaBlob";
import {
  compressProfileImage,
  profileImageToBase64,
} from "@/lib/users/compressProfileImage";
import {
  getProfileMediaBlobPathname,
  validateProfileMediaFile,
  type ProfileMediaKind,
} from "@/lib/users/profileMediaValidation";
import { profileMediaDeliveryUrl } from "@/lib/users/profileMediaDelivery";

const BLOB_CLIENT_TIMEOUT_MS = 25_000;
const BASE64_TIMEOUT_MS = 45_000;

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  code: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(code)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function isLocalDev(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/** Camino A: celu → Blob directo (sin pasar archivo por FormData del servidor). */
async function uploadViaBlobClient(
  kind: ProfileMediaKind,
  userId: string,
  file: File,
): Promise<string> {
  const jpeg = await compressProfileImage(file);
  const { ext } = validateProfileMediaFile(jpeg);
  const pathname = getProfileMediaBlobPathname(kind, userId, ext);

  const access = profileMediaUsesPublicStoreClient() ? "public" : "private";

  const result = await upload(pathname, jpeg, {
    access,
    handleUploadUrl: "/api/user-profile/media-upload",
    clientPayload: JSON.stringify({ userId, kind }),
  });

  if (access === "public" && result.url) return result.url;
  return profileMediaDeliveryUrl(pathname);
}

/** Camino B: JSON base64 (respaldo si Blob client falla). */
async function uploadViaBase64(
  kind: ProfileMediaKind,
  userId: string,
  file: File,
): Promise<string> {
  const imageBase64 = await profileImageToBase64(file);

  const res = await fetch("/api/user-profile/upload-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, kind, imageBase64 }),
  });

  const text = await res.text();
  let data: { ok?: boolean; error?: string; url?: string };
  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    throw new Error(`${kind}_upload_failed:invalid_response`);
  }

  if (!res.ok || !data.ok || !data.url) {
    throw new Error(data.error ?? `${kind}_upload_failed`);
  }
  return data.url;
}

/** Camino C: FormData (solo desarrollo local). */
async function uploadViaForm(
  kind: ProfileMediaKind,
  userId: string,
  file: File,
): Promise<string> {
  const prepared = await compressProfileImage(file);
  const form = new FormData();
  form.set("userId", userId);
  form.set(kind === "avatar" ? "avatar" : "cover", prepared);

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
  if (isLocalDev()) {
    return withTimeout(
      uploadViaForm(kind, userId, file),
      BASE64_TIMEOUT_MS,
      `${kind}_upload_timeout`,
    );
  }

  try {
    return await withTimeout(
      uploadViaBlobClient(kind, userId, file),
      BLOB_CLIENT_TIMEOUT_MS,
      `${kind}_upload_timeout`,
    );
  } catch (blobErr) {
    try {
      return await withTimeout(
        uploadViaBase64(kind, userId, file),
        BASE64_TIMEOUT_MS,
        `${kind}_upload_timeout`,
      );
    } catch (base64Err) {
      const a = blobErr instanceof Error ? blobErr.message : "blob";
      const b = base64Err instanceof Error ? base64Err.message : "base64";
      throw new Error(`${kind}_upload_failed:${a}|${b}`);
    }
  }
}
