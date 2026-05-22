"use client";

const QUALIFIED_KEY = "vu_founding_member_qualified";
const GRANTED_AT_KEY = "vu_founding_member_granted_at";
const ARCHIVE_ID_KEY = "vu_founding_member_archive_id";

export function grantFoundingMember(archiveId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUALIFIED_KEY, "1");
    sessionStorage.setItem(GRANTED_AT_KEY, new Date().toISOString());
    sessionStorage.setItem(ARCHIVE_ID_KEY, archiveId);
  } catch {
    // ignore
  }
}

export function isFoundingMemberQualified(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(QUALIFIED_KEY) === "1";
  } catch {
    return false;
  }
}

export function getFoundingMemberArchiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = sessionStorage.getItem(ARCHIVE_ID_KEY);
    return id?.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}
