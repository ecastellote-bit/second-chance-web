"use client";

const QUALIFIED_KEY = "vu_founding_member_qualified";
const GRANTED_AT_KEY = "vu_founding_member_granted_at";
const ARCHIVE_ID_KEY = "vu_founding_member_archive_id";

function writeStorage(
  storage: Storage,
  archiveId: string,
  grantedAt: string,
): void {
  storage.setItem(QUALIFIED_KEY, "1");
  storage.setItem(GRANTED_AT_KEY, grantedAt);
  storage.setItem(ARCHIVE_ID_KEY, archiveId);
}

export function grantFoundingMember(archiveId: string): void {
  if (typeof window === "undefined") return;
  const id = archiveId.trim();
  if (!id) return;

  try {
    const grantedAt = new Date().toISOString();
    writeStorage(sessionStorage, id, grantedAt);
    writeStorage(localStorage, id, grantedAt);
  } catch {
    // ignore quota / private mode
  }
}

export function isFoundingMemberQualified(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      sessionStorage.getItem(QUALIFIED_KEY) === "1" ||
      localStorage.getItem(QUALIFIED_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function getFoundingMemberArchiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id =
      sessionStorage.getItem(ARCHIVE_ID_KEY) ??
      localStorage.getItem(ARCHIVE_ID_KEY);
    return id?.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}
