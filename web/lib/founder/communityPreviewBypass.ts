"use client";

const PREVIEW_SESSION_KEY = "vu_founder_community_preview";

/** Solo fundador: explorar barrio sin diagnóstico ni perfil (clave en .env.local, no en repo). */
export function isFounderCommunityPreviewActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(PREVIEW_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function activateFounderCommunityPreview(token: string): boolean {
  const expected = process.env.NEXT_PUBLIC_VU_FOUNDER_PREVIEW_KEY?.trim();
  if (!expected || token !== expected) return false;
  try {
    sessionStorage.setItem(PREVIEW_SESSION_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function deactivateFounderCommunityPreview(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PREVIEW_SESSION_KEY);
  } catch {
    // ignore
  }
}
