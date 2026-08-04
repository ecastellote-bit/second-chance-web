"use client";

import type { UserProfileClientView } from "./userProfileTypes";
import { isUserProfileComplete } from "./userProfileTypes";
import type { SessionGateReason } from "./sessionGate";

const USER_ID_KEY = "vu_user_id";
const PROFILE_COMPLETE_KEY = "vu_profile_complete";
const PROFILE_CACHE_KEY = "vu_profile_cache";
/** Solo hint local para prefill de "retomar"; no es auth. */
const EMAIL_HINT_KEY = "vu_email_hint";

export function getCachedUserId(): string | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(USER_ID_KEY)?.trim();
  return id || null;
}

/**
 * Vincula este navegador a un userId existente (p. ej. al retomar por email).
 * No inventa identidad nueva.
 */
export function setActiveUserId(userId: string): void {
  if (typeof window === "undefined") return;
  const id = userId.trim();
  if (!id) return;
  localStorage.setItem(USER_ID_KEY, id);
}

/**
 * Identidad local o creación de una nueva (solo en flujos de alta, p. ej. crear perfil).
 * Los gates de lectura NO deben usarla: preferir getCachedUserId().
 */
export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(USER_ID_KEY)?.trim();
  if (!id) {
    id = `vu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function markProfileComplete(profile: UserProfileClientView): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_COMPLETE_KEY, "1");
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    if (profile.userId?.trim()) {
      setActiveUserId(profile.userId);
    }
  } catch {
    // ignore quota
  }
}

/** Tras crear/guardar/retomar: deja la sesión local alineada al perfil del servidor. */
export function bindLocalSession(profile: UserProfileClientView): void {
  if (typeof window === "undefined") return;
  if (profile.userId?.trim()) {
    setActiveUserId(profile.userId);
  }
  if (isUserProfileComplete(profile)) {
    markProfileComplete(profile);
  } else {
    clearProfileCompleteFlagOnly();
    try {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }
}

function clearProfileCompleteFlagOnly(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_COMPLETE_KEY);
  sessionStorage.removeItem(PROFILE_COMPLETE_KEY);
}

export function clearProfileCache(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PROFILE_COMPLETE_KEY);
  localStorage.removeItem(PROFILE_COMPLETE_KEY);
  localStorage.removeItem(PROFILE_CACHE_KEY);
}

export function isProfileCompleteCached(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PROFILE_COMPLETE_KEY) === "1";
}

export function getCachedProfile(): UserProfileClientView | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw) as UserProfileClientView;
    return isUserProfileComplete(profile) ? profile : null;
  } catch {
    return null;
  }
}

export function setEmailHint(email: string): void {
  if (typeof window === "undefined") return;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;
  try {
    localStorage.setItem(EMAIL_HINT_KEY, normalized);
  } catch {
    // ignore
  }
}

export function getEmailHint(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(EMAIL_HINT_KEY)?.trim() ?? "";
}

export function clearEmailHint(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EMAIL_HINT_KEY);
}

export type CommunityContactState = {
  hasEmail: boolean;
  notificationConsent: boolean;
};

export async function fetchUserProfile(
  userId?: string,
): Promise<UserProfileClientView | null> {
  const id = userId ?? getCachedUserId() ?? "";
  if (!id) return null;

  const res = await fetch(`/api/user-profile?userId=${encodeURIComponent(id)}`);
  const data = (await res.json()) as {
    ok: boolean;
    profile?: UserProfileClientView | null;
    complete?: boolean;
    communityContact?: CommunityContactState;
  };

  if (!data.ok || !data.profile) {
    clearProfileCompleteFlagOnly();
    return null;
  }

  if (isUserProfileComplete(data.profile)) {
    markProfileComplete(data.profile);
  } else {
    clearProfileCompleteFlagOnly();
  }
  return data.profile;
}

export async function fetchCommunityContact(
  userId?: string,
): Promise<CommunityContactState> {
  const id = userId ?? getCachedUserId() ?? "";
  if (!id) return { hasEmail: false, notificationConsent: false };

  const res = await fetch(`/api/user-profile?userId=${encodeURIComponent(id)}`);
  const data = (await res.json()) as {
    ok: boolean;
    communityContact?: CommunityContactState;
  };

  if (!data.ok || !data.communityContact) {
    return { hasEmail: false, notificationConsent: false };
  }
  return data.communityContact;
}

export type ClientSessionGate = {
  reason: SessionGateReason;
  allowed: boolean;
  profile: UserProfileClientView | null;
  hasEmail: boolean;
  userId: string | null;
};

/**
 * Evaluación client-side del gate sin crear userId huérfano.
 */
export async function fetchClientSessionGate(): Promise<ClientSessionGate> {
  const userId = getCachedUserId();
  if (!userId) {
    return {
      reason: "no_local_identity",
      allowed: false,
      profile: null,
      hasEmail: false,
      userId: null,
    };
  }

  const res = await fetch(`/api/user-profile?userId=${encodeURIComponent(userId)}`);
  const data = (await res.json()) as {
    ok?: boolean;
    profile?: UserProfileClientView | null;
    complete?: boolean;
    communityContact?: CommunityContactState;
  };

  if (!res.ok || !data.ok) {
    return {
      reason: "profile_missing",
      allowed: false,
      profile: null,
      hasEmail: false,
      userId,
    };
  }

  const profile = data.profile ?? null;
  const hasEmail = data.communityContact?.hasEmail === true;

  if (!profile) {
    clearProfileCompleteFlagOnly();
    return {
      reason: "profile_missing",
      allowed: false,
      profile: null,
      hasEmail: false,
      userId,
    };
  }

  if (!isUserProfileComplete(profile) || data.complete === false) {
    clearProfileCompleteFlagOnly();
    return {
      reason: "profile_incomplete",
      allowed: false,
      profile,
      hasEmail,
      userId,
    };
  }

  markProfileComplete(profile);

  if (!hasEmail) {
    return {
      reason: "email_missing",
      allowed: false,
      profile,
      hasEmail: false,
      userId,
    };
  }

  return {
    reason: "ready",
    allowed: true,
    profile,
    hasEmail: true,
    userId,
  };
}

/**
 * Retoma sesión local desde un email ya guardado en un perfil del barrio.
 * No es verificación de propiedad del email (MVP sin cuentas verificadas).
 */
export async function resumeSessionByEmail(
  email: string,
): Promise<
  | { ok: true; profile: UserProfileClientView }
  | { ok: false; error: string }
> {
  const res = await fetch("/api/user-profile/retomar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });
  const data = (await res.json()) as {
    ok?: boolean;
    profile?: UserProfileClientView;
    error?: string;
  };

  if (!res.ok || !data.ok || !data.profile) {
    return {
      ok: false,
      error: data.error ?? "resume_failed",
    };
  }

  bindLocalSession(data.profile);
  setEmailHint(email);
  return { ok: true, profile: data.profile };
}
