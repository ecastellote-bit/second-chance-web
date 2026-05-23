"use client";

import {
  compressProfileImage,
  profileImageToBase64,
} from "@/lib/users/compressProfileImage";
import type { ProfileMediaKind } from "@/lib/users/profileMediaValidation";

const UPLOAD_TIMEOUT_MS = 45_000;

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

/** Ruta principal: JPEG en base64 (evita FormData roto en galería móvil + Vercel). */
async function uploadProfileMediaViaBase64(
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

/** Fallback local: FormData clásico. */
async function uploadProfileMediaViaForm(
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
  const upload = isLocalDev()
    ? uploadProfileMediaViaForm(kind, userId, file)
    : uploadProfileMediaViaBase64(kind, userId, file);

  return withTimeout(upload, UPLOAD_TIMEOUT_MS, `${kind}_upload_timeout`);
}
