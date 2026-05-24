"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { normalizeHumanCaseImport } from "@/lib/learning/normalizeHumanCaseImport";
import { parseHumanCaseJsonText } from "@/lib/learning/parseHumanCaseJsonText";
import { setActiveHumanArchiveId } from "@/lib/learning/activeHumanArchive";
import { grantFoundingMember } from "@/lib/learning/foundationalMember";

function friendlyImportError(err: unknown): string {
  if (!(err instanceof Error)) return "No se pudo importar";
  if (err.message === "import_unauthorized") {
    return "Clave de importación incorrecta. Revisá la clave en Vercel o en ?key= de la URL.";
  }
  if (err.message === "current_result_required") {
    return "El backup no trae la lectura (currentResult). Probá con otro archivo .json.";
  }
  return err.message;
}

export function RecuperarCasoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [importKey, setImportKey] = useState(searchParams.get("key") ?? "");
  const [archiveIdOpen, setArchiveIdOpen] = useState(
    searchParams.get("id") ?? "local_mpj6g0d5",
  );
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [message, setMessage] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

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
      setSelectedFileName(file.name);

      try {
        const text = await file.text();
        if (!text.trim()) {
          throw new Error(
            "El archivo llegó vacío. En el celular, abrilo desde Descargas o Archivos y volvé a elegirlo.",
          );
        }
        const raw = parseHumanCaseJsonText(text);
        const fromName = archiveIdFromFilename(file.name);
        const archiveId = await importJson(raw, fromName || undefined);
        setMessage(`Caso importado: ${archiveId}`);
        router.push(`/full/result/archivo/${encodeURIComponent(archiveId)}`);
      } catch (err) {
        setStatus("error");
        setMessage(friendlyImportError(err));
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
        const raw = parseHumanCaseJsonText(textarea.value);
        const archiveId = await importJson(raw);
        setMessage(`Caso importado: ${archiveId}`);
        router.push(`/full/result/archivo/${encodeURIComponent(archiveId)}`);
      } catch (err) {
        setStatus("error");
        setMessage(friendlyImportError(err));
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
            Clave de importación
          </span>
          <input
            type="password"
            value={importKey}
            onChange={(e) => setImportKey(e.target.value)}
            placeholder="La misma que configuraste en Vercel"
            className="w-full rounded-xl border border-[#E8EEF3] px-4 py-3 text-sm"
            autoComplete="off"
          />
        </label>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#0B2E59]">
            Paso 1 — Elegir archivo (recomendado)
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#C6D92D] bg-white px-6 py-12 text-center">
            <span className="text-sm font-semibold text-[#0B2E59]">
              {status === "loading" && selectedFileName
                ? `Importando ${selectedFileName}…`
                : "Tocá acá para elegir tu .json"}
            </span>
            <span className="text-xs text-[#6B7A8C]">vocationup-caso-local_mpj6g0d5.json</span>
            {selectedFileName && status !== "loading" ? (
              <span className="text-xs font-medium text-emerald-700">{selectedFileName}</span>
            ) : null}
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              disabled={status === "loading"}
              onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="text-xs text-[#6B7A8C]">
            Al elegir el archivo se importa solo. No hace falta tocar el botón azul de abajo.
          </p>
        </div>

        <form onSubmit={onPasteSubmit} className="space-y-3 rounded-2xl border border-[#E8EEF3] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7A8C]">
            Paso 2 — Solo si no podés subir archivo: pegar JSON
          </p>
          <textarea
            name="jsonPaste"
            rows={5}
            className="w-full rounded-xl border border-[#E8EEF3] px-4 py-3 font-mono text-xs"
            placeholder="Pegá acá todo el contenido del archivo (desde { hasta el final)"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-[#0B2E59] py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {status === "loading" ? "Importando…" : "Importar texto pegado"}
          </button>
        </form>

        {message ? (
          <p
            className={`rounded-xl px-4 py-3 text-sm ${
              status === "error"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {message}
          </p>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const id = archiveIdOpen.trim();
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
          <p className="text-xs text-[#6B7A8C]">
            Usá esto solo después de importar el .json. Si no importaste, primero el Paso 1.
          </p>
          <input
            name="archiveId"
            type="text"
            value={archiveIdOpen}
            onChange={(e) => setArchiveIdOpen(e.target.value)}
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
