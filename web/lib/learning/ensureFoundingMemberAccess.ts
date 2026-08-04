"use client";

import {
  fetchUserProfile,
  getCachedProfile,
  getCachedUserId,
} from "@/lib/users/activeUserSession";
import {
  grantFoundingMember,
  isFoundingMemberQualified,
} from "@/lib/learning/foundationalMember";

/** Restaura acceso fundador desde perfil guardado (diagnosticArchiveId). */
export async function ensureFoundingMemberAccess(): Promise<boolean> {
  if (isFoundingMemberQualified()) return true;

  const cached = getCachedProfile();
  const cachedArchiveId = cached?.diagnosticArchiveId?.trim();
  if (cachedArchiveId) {
    grantFoundingMember(cachedArchiveId);
    return true;
  }

  const userId = getCachedUserId();
  if (!userId) return false;

  const profile = await fetchUserProfile(userId);
  const archiveId = profile?.diagnosticArchiveId?.trim();
  if (archiveId) {
    grantFoundingMember(archiveId);
    return true;
  }

  return false;
}
