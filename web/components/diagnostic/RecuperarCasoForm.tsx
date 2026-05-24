"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { normalizeHumanCaseImport } from "@/lib/learning/normalizeHumanCaseImport";
import { setActiveHumanArchiveId } from "@/lib/learning/activeHumanArchive";
import { grantFoundingMember } from "@/lib/learning/foundationalMember";

export function RecuperarCasoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [importKey, setImportKey] = useState(searchParams.get("key") ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [message, setMessage] = useState("");
  const importJson = useCallback(
    async (raw: unknown, forceId?: string) => {
      const enriched =
        forceId && typeof raw === "object" && raw !== null
          ? { ...(raw as Record<string, unknown>), forceArchiveId: forceId }
          : raw;
      const { archiveId } = normalizeHumanCaseImport(enriched);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (importKey.trim()) {
        headers["x-vu-import-key"] = importKey.trim();
      }

      const res = await fetch("/api/human-cases/import", {
        method: "POST",
        headers,
        body: JSON.stringify(enriched),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        archiveId?: string;
        viewUrl?: string;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.archiveId) {
        throw new Error(data.error ?? "import_failed");
      }

      setActiveHumanArchiveId(data.archiveId);
      grantFoundingMember(data.archiveId);

      setStatus("done");
      return data.archiveId;
    },
    [importKey],
  );

  const archiveIdFromFilename = (name: string) => {
    const match = name.match(/vocationup-caso-(.+)\.json$/i);
    return match?.[1]?.trim() ?? "";
  };

  const onFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setStatus("loading");
      setMessage("");

      try {
        const text = await file.text();
        const raw = JSON.parse(text) as unknown;
        const fromName = archiveIdFromFilename(file.name);
        const archiveId = await importJson(raw, fromName || undefined);
        setMessage(`Caso importado: ${archiveId}`);
        router.push(`/full/result/archivo/${encodeURIComponent(archiveId)}`);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "No se pudo importar");
      }
    },
    [importJson, router],
  );

  const onPasteSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const textarea = form.elements.namedItem("jsonPaste") as HTMLTextAreaElement;
      setStatus("loading");
      setMessage("");

      try {
        const raw = JSON.parse(textarea.value) as unknown;
        const archiveId = await importJson(raw);
        setMessage(`Caso importado: ${archiveId}`);
        router.push(`/full/result/archivo/${encodeURIComponent(archiveId)}`);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "No se pudo importar");
      }
    },
    [importJson, router],
  );

  return (
    <main className="min-h-[100dvh] bg-[#F8FAFC] px-4 py-10 pb-24">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0B2E59]">Recuperar mi caso</h1>
          <p className="mt-2 text-sm text-[#6B7A8C]">
            Subí el archivo .json que guardaste cuando falló el guardado. No hace falta
            repetir el cuestionario.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7A8C]">
            Clave de importación (si te la pasaron)
          </span>
          <input
            type="password"
            value={importKey}
            onChange={(e) => setImportKey(e.target.value)}
            placeholder="Opcional en local"
            className="w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-sm"
            autoComplete="off"
          />
        </label>

        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#C6D92D] bg-white px-6 py-12 text-center">
          <span className="text-sm font-semibold text-[#0B2E59]">
            Tocá para elegir tu .json
          </span>
          <span className="text-xs text-[#6B7A8C]">vocationup-caso-*.json</span>
          <input
            type="file"
            accept=".json,application/json"
            className="sr-only"
            disabled={status === "loading"}
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <form onSubmit={onPasteSubmit} className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7A8C]">
            O pegá el contenido del JSON
          </p>
          <textarea
            name="jsonPaste"
            rows={6}
            className="w-full rounded-xl border border-[#E8EEF3] px-4 py-3 font-mono text-xs"
            placeholder='{"archiveVersion":"human_case_depot_v1",...}'
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-[#0B2E59] py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {status === "loading" ? "Importando…" : "Importar y ver lectura"}
          </button>
        </form>

        {message ? (
          <p
            className={`text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`}
          >
            {message}
          </p>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const input = form.elements.namedItem("archiveId") as HTMLInputElement;
            const id = input.value.trim();
            if (!id) return;
            setActiveHumanArchiveId(id);
            grantFoundingMember(id);
            router.push(`/full/result/archivo/${encodeURIComponent(id)}`);
          }}
          className="space-y-3 rounded-2xl border border-[#E8EEF3] bg-white p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7A8C]">
            Ya importado — abrir por ID
          </p>
          <input
            name="archiveId"
            type="text"
            placeholder="local_mpj6g0d5"
            className="w-full rounded-xl border border-[#E8EEF3] px-4 py-3 font-mono text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-xl border border-[#0B2E59]/30 py-3 text-sm font-semibold text-[#0B2E59]"
          >
            Ver lectura de este ID
          </button>
        </form>

        <Link
          href="/fundador"
          className="block text-center text-sm text-[#6B7A8C] underline"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
