"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type DraftRow = {
  caseId: string;
  diagnosticRunId: string;
  status: string;
  source: string;
  updatedAt: string;
  submittedAt: string | null;
  archiveId: string | null;
  humanReviewRequested: boolean;
  humanReviewStatus: string;
  resultType: string | null;
  corePattern: string | null;
  learningDisposition: string;
};

const STATUS_FILTERS = [
  { id: "", label: "Todos" },
  { id: "analysis_succeeded_pending_archive", label: "Pendiente archivo" },
  { id: "submitted_before_analysis", label: "Pre-análisis" },
  { id: "archived_minimal", label: "Archivo mínimo" },
  { id: "archived", label: "Archivado" },
];

export default function FounderCaseDraftsAdminPage() {
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewOnly, setReviewOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "80" });
      if (statusFilter) params.set("status", statusFilter);
      if (reviewOnly) params.set("humanReviewRequested", "true");

      const res = await fetch(`/api/founder-case-drafts/list?${params.toString()}`);
      const data = (await res.json()) as {
        ok: boolean;
        drafts?: DraftRow[];
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Error al cargar drafts");
      }

      setDrafts(data.drafts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, reviewOnly]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
              Preservación · Borradores server-side
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">
              Casos preservados (drafts)
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
              Listado operativo sin narrativa completa. Usá caseId + diagnosticRunId
              para ubicar un caso sin el dispositivo del usuario.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/admin/casos-humanos" className="font-semibold text-[#1A9BB0] underline">
              Depósito humano →
            </Link>
            <Link href="/" className="text-[#6B7A8C] underline">
              ← Inicio
            </Link>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.id || "all"}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                statusFilter === item.id
                  ? "bg-[#0B2E59] text-white"
                  : "bg-white border border-[#E8EEF3] text-[#6B7A8C]",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setReviewOnly((v) => !v)}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              reviewOnly
                ? "bg-amber-700 text-white"
                : "bg-white border border-[#E8EEF3] text-[#6B7A8C]",
            ].join(" ")}
          >
            Revisión pedida
          </button>
          <button
            type="button"
            onClick={load}
            className="rounded-full border border-[#1A9BB0]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#1A9BB0]"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando…</p>
        ) : error ? (
          <p className="text-sm text-red-700">{error}</p>
        ) : drafts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-6 text-sm text-[#6B7A8C]">
            Sin drafts en este filtro.
          </p>
        ) : (
          <ul className="space-y-3">
            {drafts.map((item) => {
              const statusUrl = `/api/founder-case-drafts/status?caseId=${encodeURIComponent(item.caseId)}&diagnosticRunId=${encodeURIComponent(item.diagnosticRunId)}`;
              return (
                <li
                  key={`${item.caseId}::${item.diagnosticRunId}`}
                  className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-mono text-[11px] text-[#6B7A8C]">
                      {item.caseId} · {item.diagnosticRunId}
                    </p>
                    <span className="rounded-full bg-[#F4F9E0] px-2 py-0.5 text-[10px] font-bold uppercase text-[#0B2E59]">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-[#0B2E59]">
                    {item.corePattern ?? item.resultType ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-[#6B7A8C]">
                    {new Date(item.updatedAt).toLocaleString("es-AR")}
                    {item.submittedAt
                      ? ` · enviado ${new Date(item.submittedAt).toLocaleString("es-AR")}`
                      : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                    {item.humanReviewRequested ? (
                      <span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">
                        Revisión humana pedida
                      </span>
                    ) : null}
                    {item.archiveId ? (
                      <span className="font-mono text-[#6B7A8C]">archive: {item.archiveId}</span>
                    ) : (
                      <span className="text-amber-800">sin archiveId</span>
                    )}
                  </div>
                  <a
                    href={statusUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs font-semibold text-[#1A9BB0] underline"
                  >
                    Ver status JSON →
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
