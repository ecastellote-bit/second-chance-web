"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CampaignFunnelDropoff } from "@/components/admin/CampaignFunnelDropoff";
import { adminFetchWithTimeout } from "@/lib/admin/adminFetch";
import {
  clearAdminSessionCache,
  readAdminSessionCache,
  writeAdminSessionCache,
} from "@/lib/admin/adminSessionCache";
import type { ObservatoryReport } from "@/lib/observatory/types";

const PULSE_CACHE_KEY = "vu_admin_pulse_7d";
const PULSE_TIMEOUT_MS = 8000;

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
  const [report, setReport] = useState<ObservatoryReport | null>(() => {
    return readAdminSessionCache<ObservatoryReport>(PULSE_CACHE_KEY)?.data ?? null;
  });
  const [loading, setLoading] = useState(() => !report);
  const [unavailable, setUnavailable] = useState(false);
  const [stale, setStale] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");

  const load = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) clearAdminSessionCache(PULSE_CACHE_KEY);

    const cached = forceRefresh ? null : readAdminSessionCache<ObservatoryReport>(PULSE_CACHE_KEY);
    if (cached?.data) {
      setReport(cached.data);
      setStale(Boolean(cached.data.readMeta?.stale));
      setLoading(false);
    } else {
      setLoading(true);
    }
    setUnavailable(false);
    setErrorDetail("");

    const url = `/api/admin/observatory/report?period=7d${forceRefresh ? "&refresh=1" : ""}`;

    try {
      const res = await adminFetchWithTimeout(url, { timeoutMs: PULSE_TIMEOUT_MS });
      const data = (await res.json()) as {
        ok?: boolean;
        report?: ObservatoryReport;
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.report) {
        const detail = data.message ?? data.error ?? `HTTP ${res.status}`;
        setErrorDetail(detail);
        setUnavailable(true);
        if (!cached?.data) setReport(null);
        else setStale(true);
        return;
      }
      setReport(data.report);
      setStale(Boolean(data.report.readMeta?.stale));
      setUnavailable(false);
      writeAdminSessionCache(PULSE_CACHE_KEY, data.report);
    } catch (err) {
      const detail =
        err instanceof DOMException && err.name === "AbortError"
          ? "timeout_cliente"
          : err instanceof Error
            ? err.message
            : "fetch_failed";
      setErrorDetail(detail);
      setUnavailable(true);
      if (!cached?.data) setReport(null);
      else setStale(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const campaign = report?.campaign;
  const readMeta = report?.readMeta;
  const showPartial = Boolean(readMeta?.partial && campaign);
  const showStaleBanner = Boolean((stale || readMeta?.stale) && campaign);

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
            onClick={() => void load(true)}
            className="vu-focus rounded-full border border-[#E8EEF3] bg-white px-3 py-1 text-xs font-semibold text-[#1A9BB0]"
          >
            Reintentar
          </button>
          <Link
            href="/admin/observatorio"
            className="text-xs font-semibold text-[#6B7A8C] underline"
          >
            Observatorio
          </Link>
        </div>
      </div>

      {showStaleBanner ? (
        <p className="mt-3 text-[11px] font-medium text-amber-800">
          Última lectura disponible
          {readMeta?.cachedAt
            ? ` (${new Date(readMeta.cachedAt).toLocaleString("es-AR")})`
            : ""}
          · no pudimos refrescar el pulso ahora.
        </p>
      ) : null}

      {showPartial ? (
        <p className="mt-2 text-[11px] font-medium text-[#1A9BB0]">
          Lectura parcial · {readMeta?.fetchedEvents ?? 0} eventos de {readMeta?.listedBlobs ?? "?"}{" "}
          en el período.
        </p>
      ) : null}

      {loading && !campaign ? (
        <p className="mt-4 text-sm text-[#6B7A8C]">Cargando pulso…</p>
      ) : unavailable && !campaign ? (
        <div className="mt-4 space-y-2 text-sm text-[#6B7A8C]">
          <p>No pudimos cargar el pulso ahora. Podés seguir moderando.</p>
          {errorDetail ? (
            <p className="text-[11px] text-[#9AA8B8]">Causa: {errorDetail}</p>
          ) : null}
          <p>
            <button
              type="button"
              onClick={() => void load(true)}
              className="vu-focus font-semibold text-[#1A9BB0] underline"
            >
              Reintentar
            </button>
            {" · "}
            <Link href="/admin/observatorio" className="font-semibold text-[#1A9BB0] underline">
              Ir al observatorio
            </Link>
          </p>
        </div>
      ) : campaign ? (
        <>
          {loading ? (
            <p className="mt-3 text-[11px] text-[#9AA8B8]">Actualizando pulso…</p>
          ) : null}
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
