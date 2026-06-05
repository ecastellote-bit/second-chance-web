"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CampaignPulsePanel } from "@/components/admin/CampaignPulsePanel";
import { adminFetch } from "@/lib/admin/adminFetch";
import type { ObservatoryPeriod, ObservatoryReport } from "@/lib/observatory/types";

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#6B7A8C]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#0B2E59]">{value}</p>
      {hint ? <p className="mt-1 text-[12px] text-[#6B7A8C]">{hint}</p> : null}
    </div>
  );
}

function RecordList({ title, items }: { title: string; items: Record<string, number> }) {
  const entries = Object.entries(items).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-[#E8EEF3] bg-white p-4">
        <h2 className="text-sm font-bold text-[#0B2E59]">{title}</h2>
        <p className="mt-2 text-sm text-[#6B7A8C]">Sin datos en este período.</p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-[#E8EEF3] bg-white p-4">
      <h2 className="text-sm font-bold text-[#0B2E59]">{title}</h2>
      <ul className="mt-3 space-y-2">
        {entries.map(([key, count]) => (
          <li key={key} className="flex items-center justify-between text-sm">
            <span className="text-[#243647]">{key}</span>
            <span className="font-bold text-[#0B2E59]">{count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ObservatorioPage() {
  const [period, setPeriod] = useState<ObservatoryPeriod>("30d");
  const [report, setReport] = useState<ObservatoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/observatory/report?period=${period}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "No se pudo cargar el reporte");
      }
      setReport(data.report as ObservatoryReport);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const campaign = report?.campaign;

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin" className="text-sm font-semibold text-[#1A9BB0] underline">
          ← Admin
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-[#0B2E59]">Observatorio estadístico</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6B7A8C]">
          Embudo fundador, diagnóstico y aprendizaje. Eventos durable en producción (Vercel Blob).
        </p>

        <div className="mt-6">
          <CampaignPulsePanel />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["7d", "30d", "all"] as ObservatoryPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={[
                "vu-focus rounded-full px-4 py-2 text-sm font-semibold",
                period === p
                  ? "bg-[#0B2E59] text-white"
                  : "bg-white text-[#0B2E59] border border-[#E8EEF3]",
              ].join(" ")}
            >
              {p === "7d" ? "7 días" : p === "30d" ? "30 días" : "Todo"}
            </button>
          ))}
          <button
            type="button"
            onClick={load}
            className="vu-focus rounded-full border border-[#1A9BB0] bg-[#E6F6FA] px-4 py-2 text-sm font-semibold text-[#0B2E59]"
          >
            Actualizar
          </button>
        </div>

        {loading ? <p className="mt-10 text-[#6B7A8C]">Generando reporte…</p> : null}
        {error ? <p className="mt-10 text-red-600">{error}</p> : null}

        {report && !loading ? (
          <div className="mt-8 space-y-8">
            <p className="text-xs text-[#6B7A8C]">
              {report.period.label} · generado {new Date(report.generatedAt).toLocaleString("es-AR")}
              {report.store?.durable
                ? ` · almacén ${report.store.backend}`
                : " · almacén local (dev)"}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Eventos" value={report.totals.events} />
              <StatCard label="Sesiones únicas" value={report.totals.uniqueSessions} />
              <StatCard
                label="Fundador → paso 1"
                value={
                  campaign?.fundadorToStep1Rate != null
                    ? `${campaign.fundadorToStep1Rate}%`
                    : "—"
                }
              />
              <StatCard
                label="Fundador → análisis"
                value={
                  campaign?.fundadorToAnalysisRate != null
                    ? `${campaign.fundadorToAnalysisRate}%`
                    : "—"
                }
              />
            </div>

            {campaign ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard label="Visitas fundador" value={campaign.fundadorViews} />
                <StatCard label="Inicio lectura" value={campaign.fullReadingIntroViews} />
                <StatCard label="Paso 1" value={campaign.step1Views} />
                <StatCard label="Análisis iniciado" value={campaign.analysisStarted} />
                <StatCard label="Lecturas archivadas" value={campaign.diagnosticArchived} />
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Comenzar" value={report.funnel.comenzarViews} />
              <StatCard label="Puertas onboarding" value={report.funnel.onboardingDoors} />
              <StatCard label="Temáticas" value={report.funnel.tematicasSelected} />
              <StatCard label="Carteles activación" value={report.funnel.activacionCarteles} />
              <StatCard label="Plaza post-activación" value={report.funnel.plazaPostActivacion} />
              <StatCard label="Compromisos barrio" value={report.funnel.barrioCommitments} />
              <StatCard label="Diagnósticos archivados" value={report.diagnostic.archived} />
              <StatCard
                label="Revisión humana sugerida"
                value={report.diagnostic.humanReviewSuggested}
              />
              <StatCard label="Señales compresión" value={report.diagnostic.compressionSignals} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <RecordList title="Por tipo de evento" items={report.byType} />
              <RecordList title="Por escenario" items={report.byScenario} />
              <RecordList title="Carteles de activación" items={report.activacionCarteles} />
              <RecordList title="Compromisos con el barrio" items={report.commitments} />
              <RecordList title="Puertas de onboarding" items={report.onboardingDoors} />
              <RecordList title="Temáticas elegidas" items={report.tematicas} />
              <RecordList title="Resultado diagnóstico" items={report.diagnostic.byResultType} />
              <RecordList title="Familia principal" items={report.diagnostic.byPrimaryFamily} />
            </div>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-sm font-bold text-amber-900">Notas del observatorio</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900/90">
                {report.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
