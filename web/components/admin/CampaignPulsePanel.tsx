"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CampaignFunnelDropoff } from "@/components/admin/CampaignFunnelDropoff";
import { adminFetch } from "@/lib/admin/adminFetch";
import type { ObservatoryReport } from "@/lib/observatory/types";

function PulseCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B7A8C]">{label}</p>
      <p
        className="mt-1 text-2xl font-extrabold tabular-nums"
        style={{ color: value > 0 ? "#0B2E59" : "#CBD5E1" }}
      >
        {value}
      </p>
    </div>
  );
}

export function CampaignPulsePanel({ compact = false }: { compact?: boolean }) {
  const [report, setReport] = useState<ObservatoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setUnavailable(false);
    try {
      const res = await adminFetch("/api/admin/observatory/report?period=7d");
      const data = (await res.json()) as { ok?: boolean; report?: ObservatoryReport };
      if (!res.ok || !data.ok || !data.report) {
        setUnavailable(true);
        setReport(null);
        return;
      }
      setReport(data.report);
    } catch {
      setUnavailable(true);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const campaign = report?.campaign;

  return (
    <section
      className={[
        "rounded-2xl border border-[#E8EEF3] bg-white shadow-sm",
        compact ? "p-4" : "p-5",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#0B2E59]">Pulso de campaña</h2>
          <p className="mt-0.5 text-xs text-[#6B7A8C]">Últimos 7 días · embudo fundador</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="vu-focus rounded-full border border-[#E8EEF3] bg-white px-3 py-1 text-xs font-semibold text-[#1A9BB0]"
          >
            Actualizar
          </button>
          <Link
            href="/admin/observatorio"
            className="text-xs font-semibold text-[#6B7A8C] underline"
          >
            Observatorio
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-[#6B7A8C]">Cargando pulso…</p>
      ) : unavailable ? (
        <p className="mt-4 text-sm text-[#6B7A8C]">
          Pulso no disponible en este momento. Probá actualizar en unos segundos.
        </p>
      ) : campaign ? (
        <>
          {compact ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <PulseCard label="Visitas fundador" value={campaign.fundadorViews} />
              <PulseCard label="Paso 1" value={campaign.step1Views} />
              <PulseCard label="Paso 5" value={campaign.step5Views} />
              <PulseCard label="Análisis" value={campaign.analysisStarted} />
              <PulseCard label="Archivadas" value={campaign.diagnosticArchived} />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <PulseCard label="Visitas fundador" value={campaign.fundadorViews} />
              <PulseCard label="Inicio lectura" value={campaign.fullReadingIntroViews} />
              <PulseCard label="Paso 1" value={campaign.step1Views} />
              <PulseCard label="Análisis iniciado" value={campaign.analysisStarted} />
              <PulseCard label="Lecturas archivadas" value={campaign.diagnosticArchived} />
            </div>
          )}
          <CampaignFunnelDropoff campaign={campaign} />
          {!compact ? (
            <p className="mt-3 text-xs text-[#6B7A8C]">
              Sesiones únicas: {report?.totals.uniqueSessions ?? 0} · eventos totales:{" "}
              {report?.totals.events ?? 0}
              {report?.store?.durable ? ` · almacén ${report.store.backend}` : ""}
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
