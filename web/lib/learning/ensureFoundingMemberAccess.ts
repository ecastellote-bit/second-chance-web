"use client";

import {
  fetchUserProfile,
  getCachedProfile,
  getOrCreateUserId,
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

  const profile = await fetchUserProfile(getOrCreateUserId());
  const archiveId = profile?.diagnosticArchiveId?.trim();
  if (archiveId) {
    grantFoundingMember(archiveId);
    return true;
  }

  return false;
}
