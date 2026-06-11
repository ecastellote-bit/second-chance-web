"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetchWithTimeout } from "@/lib/admin/adminFetch";

const FETCH_TIMEOUT_MS = 8000;

type DurableStatus = {
  configured: boolean;
  required: boolean;
  storage: string;
};

type HumanCaseRow = {
  archiveId: string;
  createdAt: string;
  source: string;
  storagePolicy: { reviewStatus: string };
  classification: { displayedMainDirection: string | null };
  learningExtract: {
    humanVerdict: { correctionNote: string; expectedPrimaryFamily: string };
  } | null;
};

function loadErrorMessage(err: unknown): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return "La carga tardó demasiado. Reintentá en unos segundos.";
  }
  if (err instanceof Error) return err.message;
  return "No se pudieron cargar los casos humanos.";
}

export default function CasosHumanosAdminPage() {
  const [cases, setCases] = useState<HumanCaseRow[]>([]);
  const [durable, setDurable] = useState<DurableStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending_human_review");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const casesUrl = filter
        ? `/api/human-cases?status=${encodeURIComponent(filter)}&limit=80`
        : "/api/human-cases?limit=80";

      const [statusRes, casesRes] = await Promise.all([
        adminFetchWithTimeout("/api/human-cases/status", { timeoutMs: FETCH_TIMEOUT_MS }),
        adminFetchWithTimeout(casesUrl, { timeoutMs: FETCH_TIMEOUT_MS }),
      ]);

      if (statusRes.ok) {
        const statusData = (await statusRes.json()) as {
          ok?: boolean;
          durable?: DurableStatus;
          message?: string;
        };
        if (statusData.ok) {
          setDurable(statusData.durable ?? null);
          setStatusMessage(statusData.message ?? "");
        }
      }

      if (!casesRes.ok) {
        if (casesRes.status === 401) {
          throw new Error(
            "Sesión admin requerida. Volvé a entrar por /admin con tu credencial.",
          );
        }
        const errData = (await casesRes.json().catch(() => ({}))) as {
          error?: string;
          message?: string;
        };
        throw new Error(errData.message ?? errData.error ?? `Error ${casesRes.status}`);
      }

      const casesData = (await casesRes.json()) as {
        ok?: boolean;
        cases?: HumanCaseRow[];
        error?: string;
      };
      if (!casesData.ok) {
        throw new Error(casesData.error ?? "Error al cargar casos");
      }
      setCases(casesData.cases ?? []);
    } catch (e) {
      setCases([]);
      setError(loadErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
              Depósito humano · Vercel Blob
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">Casos humanos</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
              Solo lectura — casos confirmados en almacén durable. Si un pionero no ve el
              banner verde con ID en resultado, el caso no está aquí.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <Link href="/admin" className="font-semibold text-[#1A9BB0] underline">
              ← Tablero admin
            </Link>
            <Link
              href="/admin/founder-case-drafts"
              className="font-semibold text-[#1A9BB0] underline"
            >
              Borradores preservados →
            </Link>
            <Link href="/admin/reviews" className="text-[#6B7A8C] underline">
              Cola de revisión →
            </Link>
          </div>
        </div>

        <div
          className={[
            "mb-5 rounded-xl border px-4 py-3 text-sm",
            durable?.configured
              ? "border-[#C6D92D]/50 bg-[#F4F9E0] text-[#243647]"
              : "border-red-300 bg-red-50 text-red-900",
          ].join(" ")}
        >
          <p className="font-semibold">
            {durable?.configured
              ? "Almacén durable activo"
              : "Almacén durable NO configurado"}
          </p>
          <p className="mt-1 text-xs leading-relaxed">{statusMessage}</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { id: "pending_human_review", label: "Pendientes" },
            { id: "", label: "Todos" },
          ].map((item) => (
            <button
              key={item.id || "all"}
              type="button"
              onClick={() => setFilter(item.id)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                filter === item.id
                  ? "bg-[#0B2E59] text-white"
                  : "bg-white border border-[#E8EEF3] text-[#6B7A8C]",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-full border border-[#1A9BB0]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A9BB0] disabled:opacity-50"
          >
            {loading ? "Cargando…" : "Actualizar"}
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="vu-focus mt-2 font-semibold text-red-800 underline"
            >
              Reintentar
            </button>
          </div>
        ) : null}

        {loading && cases.length === 0 && !error ? (
          <p className="text-sm text-[#6B7A8C]">Cargando casos humanos…</p>
        ) : null}

        {!loading && !error && cases.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-6 text-center text-sm text-[#6B7A8C]">
            <p className="font-semibold text-[#0B2E59]">Sin casos en este filtro.</p>
            <p className="mt-2">
              {filter === "pending_human_review"
                ? "No hay casos pendientes de revisión humana en el depósito durable."
                : "Todavía no hay casos archivados visibles para este filtro."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
              <Link href="/admin/reviews" className="font-semibold text-[#1A9BB0] underline">
                Ver cola de revisión
              </Link>
              <Link href="/admin" className="font-semibold text-[#6B7A8C] underline">
                Volver al tablero
              </Link>
            </div>
          </div>
        ) : null}

        {cases.length > 0 ? (
          <ul className="space-y-3">
            {cases.map((item) => (
              <li
                key={item.archiveId}
                className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm"
              >
                <p className="font-mono text-[11px] text-[#6B7A8C]">{item.archiveId}</p>
                <p className="mt-1 text-sm font-bold text-[#0B2E59]">
                  {item.classification.displayedMainDirection ?? "—"}
                </p>
                <p className="mt-1 text-xs text-[#6B7A8C]">
                  {new Date(item.createdAt).toLocaleString("es-AR")} ·{" "}
                  {item.storagePolicy.reviewStatus}
                </p>
                {item.learningExtract?.humanVerdict?.correctionNote ? (
                  <p className="mt-2 text-xs leading-relaxed text-[#243647] line-clamp-3">
                    {item.learningExtract.humanVerdict.correctionNote}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
