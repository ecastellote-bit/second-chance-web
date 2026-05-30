"use client";

import type { UserProfileClientView } from "./userProfileTypes";
import { isUserProfileComplete } from "./userProfileTypes";

const USER_ID_KEY = "vu_user_id";
const PROFILE_COMPLETE_KEY = "vu_profile_complete";
const PROFILE_CACHE_KEY = "vu_profile_cache";

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(USER_ID_KEY)?.trim();
  if (!id) {
    id = `vu_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function getCachedUserId(): string | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(USER_ID_KEY)?.trim();
  return id || null;
}

export function markProfileComplete(profile: UserProfileClientView): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_COMPLETE_KEY, "1");
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch {
    // ignore quota
  }
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

export type CommunityContactState = {
  hasEmail: boolean;
  notificationConsent: boolean;
};

export async function fetchUserProfile(
  userId?: string,
): Promise<UserProfileClientView | null> {
  const id = userId ?? getOrCreateUserId();
  if (!id) return null;

  const res = await fetch(`/api/user-profile?userId=${encodeURIComponent(id)}`);
  const data = (await res.json()) as {
    ok: boolean;
    profile?: UserProfileClientView | null;
  };

  if (!data.ok || !data.profile) return null;
  if (isUserProfileComplete(data.profile)) {
    markProfileComplete(data.profile);
  }
  return data.profile;
}

export async function fetchCommunityContact(
  userId?: string,
): Promise<CommunityContactState> {
  const id = userId ?? getOrCreateUserId();
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
