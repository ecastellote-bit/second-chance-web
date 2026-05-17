"use client";

const INDEX_KEY = "vu_human_cases_index";
const CASE_PREFIX = "vu_human_case_";
const PENDING_SYNC_KEY = "vu_human_cases_pending_sync";

export type ClientHumanCaseBackup = {
  archiveId: string;
  savedAt: string;
  source: string;
  payload: unknown;
  serverSynced: boolean;
  serverArchiveId?: string;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function backupHumanCaseToBrowser(
  archiveId: string,
  payload: unknown,
  meta?: { source?: string; serverSynced?: boolean; serverArchiveId?: string },
): void {
  if (typeof window === "undefined") return;

  const entry: ClientHumanCaseBackup = {
    archiveId,
    savedAt: new Date().toISOString(),
    source: meta?.source ?? "browser_human_case_v1",
    payload,
    serverSynced: meta?.serverSynced ?? false,
    serverArchiveId: meta?.serverArchiveId,
  };

  try {
    localStorage.setItem(`${CASE_PREFIX}${archiveId}`, JSON.stringify(entry));

    const index = safeParse<string[]>(localStorage.getItem(INDEX_KEY)) ?? [];
    if (!index.includes(archiveId)) {
      index.unshift(archiveId);
      localStorage.setItem(INDEX_KEY, JSON.stringify(index.slice(0, 80)));
    }

    if (!entry.serverSynced) {
      const pending =
        safeParse<string[]>(localStorage.getItem(PENDING_SYNC_KEY)) ?? [];
      if (!pending.includes(archiveId)) {
        pending.unshift(archiveId);
        localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending.slice(0, 40)));
      }
    }
  } catch {
    // quota — still attempt server-only path
  }
}

export function listBrowserHumanCaseBackups(): ClientHumanCaseBackup[] {
  if (typeof window === "undefined") return [];

  const index = safeParse<string[]>(localStorage.getItem(INDEX_KEY)) ?? [];
  const items: ClientHumanCaseBackup[] = [];

  for (const id of index) {
    const entry = safeParse<ClientHumanCaseBackup>(
      localStorage.getItem(`${CASE_PREFIX}${id}`),
    );
    if (entry) items.push(entry);
  }

  return items;
}

export function markBrowserCaseSynced(archiveId: string, serverArchiveId: string) {
  if (typeof window === "undefined") return;

  const entry = safeParse<ClientHumanCaseBackup>(
    localStorage.getItem(`${CASE_PREFIX}${archiveId}`),
  );
  if (!entry) return;

  entry.serverSynced = true;
  entry.serverArchiveId = serverArchiveId;
  localStorage.setItem(`${CASE_PREFIX}${archiveId}`, JSON.stringify(entry));

  const pending = safeParse<string[]>(localStorage.getItem(PENDING_SYNC_KEY)) ?? [];
  localStorage.setItem(
    PENDING_SYNC_KEY,
    JSON.stringify(pending.filter((id) => id !== archiveId)),
  );
}

export async function syncPendingBrowserCasesToServer(): Promise<{
  synced: number;
  failed: number;
}> {
  if (typeof window === "undefined") return { synced: 0, failed: 0 };

  const pending = safeParse<string[]>(localStorage.getItem(PENDING_SYNC_KEY)) ?? [];
  let synced = 0;
  let failed = 0;

  for (const archiveId of pending) {
    const entry = safeParse<ClientHumanCaseBackup>(
      localStorage.getItem(`${CASE_PREFIX}${archiveId}`),
    );
    if (!entry?.payload) continue;

    try {
      const res = await fetch("/api/human-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: entry.payload,
          clientMeta: {
            syncedFromBrowser: true,
            origin: window.location.origin,
          },
        }),
      });

      if (!res.ok) {
        failed += 1;
        continue;
      }

      const data = (await res.json()) as { archiveId?: string };
      markBrowserCaseSynced(archiveId, data.archiveId ?? archiveId);
      synced += 1;
    } catch {
      failed += 1;
    }
  }

  return { synced, failed };
}

export async function archiveHumanCaseFromBrowser(
  payload: unknown,
  options?: { clientMeta?: Record<string, unknown> },
): Promise<{ archiveId: string; serverOk: boolean }> {
  const body = {
    ...(typeof payload === "object" && payload !== null ? payload : { payload }),
    clientMeta: {
      ...options?.clientMeta,
      origin: typeof window !== "undefined" ? window.location.origin : undefined,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    },
  };

  const provisionalId = `local_${Date.now().toString(36)}`;
  backupHumanCaseToBrowser(provisionalId, body, { serverSynced: false });

  try {
    const res = await fetch("/api/human-cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { archiveId: provisionalId, serverOk: false };
    }

    const data = (await res.json()) as { archiveId: string };
    backupHumanCaseToBrowser(data.archiveId, body, {
      serverSynced: true,
      serverArchiveId: data.archiveId,
    });
    markBrowserCaseSynced(provisionalId, data.archiveId);

    return { archiveId: data.archiveId, serverOk: true };
  } catch {
    return { archiveId: provisionalId, serverOk: false };
  }
}
