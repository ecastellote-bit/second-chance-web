"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetchWithTimeout } from "@/lib/admin/adminFetch";
import {
  clearAdminSessionCache,
  readAdminSessionCache,
  writeAdminSessionCache,
} from "@/lib/admin/adminSessionCache";
import type { FundadorSummaryResponse } from "@/lib/telemetry/fundadorSummary";

const PULSE_CACHE_KEY = "vu_admin_fundador_pulse_7d";
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

function hasFounderActivity(totals: FundadorSummaryResponse["totals"]): boolean {
  return (
    totals.founderLandingViews > 0 ||
    totals.founderPrimaryCtaClicks > 0 ||
    totals.founderSecondaryCtaClicks > 0 ||
    totals.founderMicrochoices > 0 ||
    totals.founderScrollEvents > 0 ||
    totals.founderExitFeedbackOpened > 0 ||
    totals.founderExitFeedbackSubmitted > 0 ||
    totals.founderTotalEvents > 0
  );
}

export function CampaignPulsePanel({ compact = false }: { compact?: boolean }) {
  const [summary, setSummary] = useState<FundadorSummaryResponse | null>(() => {
    return readAdminSessionCache<FundadorSummaryResponse>(PULSE_CACHE_KEY)?.data ?? null;
  });
  const [loading, setLoading] = useState(() => !summary);
  const [unavailable, setUnavailable] = useState(false);
  const [stale, setStale] = useState(false);

  const load = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) clearAdminSessionCache(PULSE_CACHE_KEY);

    const cached = forceRefresh
      ? null
      : readAdminSessionCache<FundadorSummaryResponse>(PULSE_CACHE_KEY);
    if (cached?.data) {
      setSummary(cached.data);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setUnavailable(false);
    setStale(false);

    try {
      const res = await adminFetchWithTimeout(
        "/api/admin/telemetry/fundador-summary?days=7",
        { timeoutMs: PULSE_TIMEOUT_MS },
      );
      const data = (await res.json()) as FundadorSummaryResponse & {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setUnavailable(true);
        if (!cached?.data) setSummary(null);
        else setStale(true);
        return;
      }
      setSummary(data);
      setStale(false);
      setUnavailable(false);
      writeAdminSessionCache(PULSE_CACHE_KEY, data);
    } catch {
      setUnavailable(true);
      if (!cached?.data) setSummary(null);
      else setStale(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = summary?.totals;
  const showData = Boolean(totals);
  const emptyPeriod = showData && totals && !hasFounderActivity(totals);

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
          <p className="mt-0.5 text-xs text-[#6B7A8C]">
            Últimos 7 días · telemetría interna /fundador
          </p>
          <p className="mt-1 text-[10px] font-medium text-[#9AA8B8]">Fuente: telemetría interna</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void load(true)}
            className="vu-focus rounded-full border border-[#E8EEF3] bg-white px-3 py-1 text-xs font-semibold text-[#1A9BB0]"
          >
            Reintentar
          </button>
          <Link
            href="/admin/telemetry/fundador"
            className="text-xs font-semibold text-[#1A9BB0] underline"
          >
            Ver observabilidad fundador
          </Link>
          <Link
            href="/admin/observatorio"
            className="text-xs font-semibold text-[#6B7A8C] underline"
          >
            Observatorio legacy
          </Link>
        </div>
      </div>

      {stale && showData ? (
        <p className="mt-3 text-[11px] font-medium text-amber-800">
          Mostrando última lectura disponible · no pudimos refrescar ahora.
        </p>
      ) : null}

      {loading && !showData ? (
        <p className="mt-4 text-sm text-[#6B7A8C]">Cargando pulso…</p>
      ) : unavailable && !showData ? (
        <div className="mt-4 space-y-2 text-sm text-[#6B7A8C]">
          <p>No pudimos cargar la telemetría interna del fundador ahora.</p>
          <p>
            <button
              type="button"
              onClick={() => void load(true)}
              className="vu-focus font-semibold text-[#1A9BB0] underline"
            >
              Reintentar
            </button>
            {" · "}
            <Link href="/admin/telemetry/fundador" className="font-semibold text-[#1A9BB0] underline">
              Ver observabilidad fundador
            </Link>
          </p>
        </div>
      ) : totals ? (
        <>
          {loading ? (
            <p className="mt-3 text-[11px] text-[#9AA8B8]">Actualizando pulso…</p>
          ) : null}

          {emptyPeriod ? (
            <p className="mt-4 text-sm text-[#6B7A8C]">
              No hay eventos de /fundador en este período todavía.
            </p>
          ) : null}

          <div
            className={[
              "mt-4 grid gap-2",
              compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
            ].join(" ")}
          >
            <PulseCard label="Visitas landing" value={totals.founderLandingViews} />
            <PulseCard label="Clicks CTA primario" value={totals.founderPrimaryCtaClicks} />
            <PulseCard label="Clicks CTA secundario" value={totals.founderSecondaryCtaClicks} />
            <PulseCard label="Microopciones" value={totals.founderMicrochoices} />
            <PulseCard label="Scroll" value={totals.founderScrollEvents} />
            <PulseCard label="Feedback enviado" value={totals.founderExitFeedbackSubmitted} />
            <PulseCard label="Total eventos /fundador" value={totals.founderTotalEvents} />
          </div>

          {!compact && summary?.lastEventAt ? (
            <p className="mt-3 text-xs text-[#6B7A8C]">
              Último evento: {new Date(summary.lastEventAt).toLocaleString("es-AR")}
              {summary.updatedAt
                ? ` · actualizado ${new Date(summary.updatedAt).toLocaleString("es-AR")}`
                : ""}
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
