"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/adminFetch";
import {
  EXIT_TRIGGER_LABEL,
  SURFACE_TYPE_LABEL,
} from "@/lib/admin/userInboxLabels";
import type { FounderExitFeedbackRecord } from "@/lib/learning/founderExitFeedback";
import type { SurfaceInterestLead } from "@/lib/learning/surfaceInterestLeads";

type StoreMeta = {
  backend: string;
  durable: boolean;
  blobConfigured?: boolean;
  requiresBlob?: boolean;
};

type InboxResponse = {
  ok?: boolean;
  surfaceLeads?: SurfaceInterestLead[];
  exitFeedback?: FounderExitFeedbackRecord[];
  totals?: { surfaceLeads: number; exitFeedback: number };
  stores?: {
    surfaceInterest?: StoreMeta;
    exitFeedback?: StoreMeta;
  };
  error?: string;
  message?: string;
};

export default function UserInboxAdminPage() {
  const [surfaceLeads, setSurfaceLeads] = useState<SurfaceInterestLead[]>([]);
  const [exitFeedback, setExitFeedback] = useState<FounderExitFeedbackRecord[]>([]);
  const [stores, setStores] = useState<InboxResponse["stores"]>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/user-inbox/list?limit=500");
      const data = (await res.json()) as InboxResponse;
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? data.error ?? "No se pudo cargar el inbox");
      }
      setSurfaceLeads(data.surfaceLeads ?? []);
      setExitFeedback(data.exitFeedback ?? []);
      setStores(data.stores ?? undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const blobWarning =
    stores?.surfaceInterest?.requiresBlob && !stores.surfaceInterest.blobConfigured;

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
              Operación fundadora
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">Señales recibidas de usuarios</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B7A8C]">
              Intereses con email desde el barrio y feedback de salida desde /fundador. Solo lectura
              — datos privados, no compartir fuera del equipo.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/admin" className="font-semibold text-[#1A9BB0] underline">
              ← Tablero principal
            </Link>
            <button
              type="button"
              onClick={() => void load()}
              className="text-left font-semibold text-[#0B2E59] underline"
            >
              Actualizar
            </button>
          </div>
        </div>

        {blobWarning ? (
          <div className="mb-4 rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-4 text-sm text-red-950">
            <p className="font-bold">Blob no configurado en este entorno</p>
            <p className="mt-1">
              En Vercel producción hace falta <code className="text-xs">BLOB_READ_WRITE_TOKEN</code>.
              Sin eso, las capturas públicas pueden fallar o quedar solo en disco efímero.
            </p>
          </div>
        ) : null}

        {stores ? (
          <p className="mb-4 text-xs text-[#6B7A8C]">
            Storage intereses: {stores.surfaceInterest?.backend ?? "—"}
            {stores.surfaceInterest?.durable ? " · durable" : " · no durable"} · Storage exit
            feedback: {stores.exitFeedback?.backend ?? "—"}
          </p>
        ) : null}

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando señales…</p>
        ) : (
          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-bold text-[#0B2E59]">
                Intereses con email ({surfaceLeads.length})
              </h2>
              <p className="mt-1 text-xs text-[#6B7A8C]">
                QuickInterestCapture → POST /api/surface-interest → Blob{" "}
                <code className="rounded bg-white px-1">surface-interest-leads/</code>
              </p>
              {surfaceLeads.length === 0 ? (
                <p className="mt-4 text-sm text-[#6B7A8C]">No hay intereses guardados todavía.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {surfaceLeads.map((lead) => (
                    <li
                      key={lead.leadId}
                      className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-[10px] font-mono text-[#6B7A8C]">{lead.leadId}</p>
                        <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-semibold text-[#6B7A8C]">
                          {lead.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#6B7A8C]">
                        {new Date(lead.createdAt).toLocaleString("es-AR")} ·{" "}
                        {SURFACE_TYPE_LABEL[lead.surfaceType] ?? lead.surfaceType}
                        {lead.path ? ` · ${lead.path}` : ""}
                        {lead.actionMode ? ` · modo: ${lead.actionMode}` : ""}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[#0B2E59]">{lead.email}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#243647]">
                        {lead.text}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#0B2E59]">
                Feedback de salida /fundador ({exitFeedback.length})
              </h2>
              <p className="mt-1 text-xs text-[#6B7A8C]">
                FounderExitModal → POST /api/founder-exit-feedback → Blob{" "}
                <code className="rounded bg-white px-1">founder-exit-feedback/</code>
              </p>
              {exitFeedback.length === 0 ? (
                <p className="mt-4 text-sm text-[#6B7A8C]">No hay feedback de salida guardado.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {exitFeedback.map((item) => (
                    <li
                      key={item.feedbackId}
                      className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-[10px] font-mono text-[#6B7A8C]">{item.feedbackId}</p>
                        <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-semibold text-[#6B7A8C]">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#6B7A8C]">
                        {new Date(item.createdAt).toLocaleString("es-AR")} ·{" "}
                        {EXIT_TRIGGER_LABEL[item.exitTrigger ?? ""] ??
                          item.exitTrigger ??
                          "sin trigger"}{" "}
                        · {item.submitMode}
                        {item.path ? ` · ${item.path}` : ""}
                      </p>
                      {item.selectedOption ? (
                        <p className="mt-2 text-xs font-semibold text-[#0B2E59]">
                          Opción: {item.selectedOption}
                        </p>
                      ) : null}
                      {item.freeText?.trim() ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#243647]">
                          {item.freeText}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-[#9AA8B8]">Sin texto libre</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
