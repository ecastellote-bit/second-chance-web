"use client";

export const ACTIVE_HUMAN_ARCHIVE_KEY = "vu_active_human_archive_id";

export function setActiveHumanArchiveId(archiveId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ACTIVE_HUMAN_ARCHIVE_KEY, archiveId);
  } catch {
    // ignore quota / private mode
  }
}

export function getActiveHumanArchiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = sessionStorage.getItem(ACTIVE_HUMAN_ARCHIVE_KEY);
    return id?.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}
