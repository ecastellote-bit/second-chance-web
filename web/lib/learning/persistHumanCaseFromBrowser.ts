import { backupHumanCaseToBrowser } from "./clientCaseBackup";

export type PersistHumanCaseResponse = {
  ok: boolean;
  archiveId?: string;
  persisted?: boolean;
  durable?: {
    stored: boolean;
    verified: boolean;
    storage: string;
    pathname?: string;
  };
  error?: string;
};

const MAX_ATTEMPTS = 3;

async function postOnce(payload: unknown): Promise<PersistHumanCaseResponse> {
  const res = await fetch("/api/human-cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as PersistHumanCaseResponse;

  if (!res.ok || !data.ok) {
    return {
      ok: false,
      error: data.error ?? `HTTP ${res.status}`,
    };
  }

  return data;
}

/**
 * Guarda caso humano con reintentos.
 * Éxito si persisted === true (Blob verificado o espejo JSONL cuando Blob no es obligatorio).
 */
export async function persistHumanCaseFromBrowserWithRetry(
  payload: unknown,
): Promise<{
  archiveId: string;
  persisted: boolean;
  durable: PersistHumanCaseResponse["durable"];
  attempts: number;
}> {
  const provisionalId = `local_${Date.now().toString(36)}`;
  backupHumanCaseToBrowser(provisionalId, payload, { serverSynced: false });

  let lastError = "unknown";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const data = await postOnce(payload);

      if (data.ok && data.archiveId && data.persisted) {
        backupHumanCaseToBrowser(data.archiveId, payload, {
          serverSynced: true,
          serverArchiveId: data.archiveId,
        });
        return {
          archiveId: data.archiveId,
          persisted: true,
          durable: data.durable,
          attempts: attempt,
        };
      }

      if (data.ok && data.archiveId && !data.persisted) {
        lastError = "Servidor respondió sin persistencia durable verificada.";
      } else {
        lastError = data.error ?? "Error al guardar";
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }

  return {
    archiveId: provisionalId,
    persisted: false,
    durable: undefined,
    attempts: MAX_ATTEMPTS,
  };
}

export function downloadHumanCaseBackup(payload: unknown, archiveId: string) {
  if (typeof window === "undefined") return;

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `vocationup-caso-${archiveId}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
