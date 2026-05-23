import { profileMediaDeliveryUrl } from "@/lib/users/profileMediaDelivery";

/** Token del Blob store **público** solo para fotos de perfil/portada. */
export function getPublicProfileMediaBlobToken(): string | undefined {
  return process.env.BLOB_READ_WRITE_TOKEN_PUBLIC?.trim() || undefined;
}

export function isPublicProfileMediaBlobConfigured(): boolean {
  return Boolean(getPublicProfileMediaBlobToken());
}

/** Flag cliente (NEXT_PUBLIC) — activar cuando exista store público conectado. */
export function profileMediaUsesPublicStoreClient(): boolean {
  return process.env.NEXT_PUBLIC_VU_PROFILE_MEDIA_PUBLIC === "1";
}

export type ProfileMediaBlobAccess = "public" | "private";

export function getProfileMediaBlobAccess(): ProfileMediaBlobAccess {
  return isPublicProfileMediaBlobConfigured() ? "public" : "private";
}

export function getProfileMediaBlobPutOptions(): {
  access: ProfileMediaBlobAccess;
  token?: string;
} {
  const publicToken = getPublicProfileMediaBlobToken();
  if (publicToken) {
    return { access: "public", token: publicToken };
  }
  return { access: "private" };
}

/** URL que guardamos en el perfil tras subir una foto. */
export function resolveUploadedProfileMediaUrl(
  pathname: string,
  blobUrl: string | undefined,
): string {
  if (isPublicProfileMediaBlobConfigured() && blobUrl?.trim()) {
    return blobUrl.trim();
  }
  return profileMediaDeliveryUrl(pathname);
}

export function getProfileMediaUploadToken(): string | undefined {
  return getPublicProfileMediaBlobToken() ?? process.env.BLOB_READ_WRITE_TOKEN?.trim();
}
