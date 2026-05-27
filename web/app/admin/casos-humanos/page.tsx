"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
      const [statusRes, casesRes] = await Promise.all([
        fetch("/api/human-cases/status"),
        fetch(
          filter
            ? `/api/human-cases?status=${encodeURIComponent(filter)}&limit=80`
            : "/api/human-cases?limit=80",
        ),
      ]);

      const statusData = await statusRes.json();
      const casesData = await casesRes.json();

      if (statusData.ok) {
        setDurable(statusData.durable);
        setStatusMessage(statusData.message ?? "");
      }

      if (!casesData.ok) throw new Error(casesData.error ?? "Error al cargar");
      setCases(casesData.cases ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
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
              Solo aparecen casos confirmados en almacén durable. Si un pionero no ve el
              banner verde con ID en resultado, el caso no está aquí.
            </p>
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <Link
              href="/admin/founder-case-drafts"
              className="font-semibold text-[#1A9BB0] underline"
            >
              Borradores preservados →
            </Link>
            <Link href="/" className="text-[#6B7A8C] underline">
              ← Inicio
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
            />
          ))}
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
        ) : cases.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-6 text-sm text-[#6B7A8C]">
            Sin casos en este filtro.
          </p>
        ) : (
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
                  {new Date(item.createdAt).toLocaleString("es-AR")}
                </p>
                {item.learningExtract?.humanVerdict?.correctionNote ? (
                  <p className="mt-2 text-xs leading-relaxed text-[#243647] line-clamp-3">
                    {item.learningExtract.humanVerdict.correctionNote}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
