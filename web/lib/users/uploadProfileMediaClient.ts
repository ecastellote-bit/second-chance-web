"use client";

import { compressProfileImage } from "@/lib/users/compressProfileImage";
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

/** Comprime en el navegador y sube vía API (Blob en servidor). Sin client upload de Vercel. */
export async function uploadProfileMedia(
  kind: ProfileMediaKind,
  userId: string,
  file: File,
): Promise<string> {
  const prepared = await compressProfileImage(file);
  return withTimeout(
    uploadProfileMediaViaApi(kind, userId, prepared),
    UPLOAD_TIMEOUT_MS,
    `${kind}_upload_timeout`,
  );
}
