"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/adminFetch";
import type { DiagnosticSummaryResponse } from "@/lib/telemetry/diagnosticSummary";

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function formatRate(value: number | null): string {
  if (value == null) return "—";
  return `${Math.round(value * 1000) / 10}%`;
}

function hasDiagnosticActivity(totals: DiagnosticSummaryResponse["totals"]): boolean {
  return (
    totals.processingStarted > 0 ||
    totals.diagnosticCompleted > 0 ||
    totals.diagnosticFailed > 0 ||
    totals.processingRouteEvents > 0
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#6B7A8C]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#0B2E59]">{value}</p>
      {hint ? <p className="mt-1 text-[12px] leading-snug text-[#6B7A8C]">{hint}</p> : null}
    </div>
  );
}

function BreakdownList({
  title,
  items,
}: {
  title: string;
  items: Record<string, number>;
}) {
  const entries = Object.entries(items).sort((a, b) => b[1] - a[1]);
  return (
    <div className="rounded-xl border border-[#E8EEF3] bg-[#F8FAFC] p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#6B7A8C]">{title}</p>
      {entries.length === 0 ? (
        <p className="mt-2 text-xs text-[#9AA8B8]">Sin datos en muestra reciente.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {entries.map(([key, count]) => (
            <li key={key} className="flex justify-between text-sm text-[#243647]">
              <span className="font-mono text-xs">{key}</span>
              <span className="font-bold text-[#0B2E59]">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DiagnosticTelemetryAdminPage() {
  const [summary, setSummary] = useState<DiagnosticSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/telemetry/diagnostic-summary?days=7");
      const data = (await res.json()) as DiagnosticSummaryResponse & {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError("No se pudo cargar la telemetría. Reintentá.");
        setSummary(null);
        return;
      }
      setSummary(data);
    } catch {
      setError("No se pudo cargar la telemetría. Reintentá.");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = summary?.totals;
  const empty = totals ? !hasDiagnosticActivity(totals) : false;

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/admin" className="font-semibold text-[#1A9BB0] underline">
            ← Admin
          </Link>
          <Link
            href="/admin/telemetry/fundador"
            className="font-semibold text-[#6B7A8C] underline"
          >
            Ver observabilidad fundador
          </Link>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-[#0B2E59]">Observabilidad diagnóstico</h1>
        <p className="mt-1 text-sm text-[#6B7A8C]">
          Últimos 7 días · telemetría interna /full/processing
        </p>
        <p className="mt-1 text-[10px] font-medium text-[#9AA8B8]">Fuente: telemetría interna</p>

        <section className="mt-6 rounded-2xl border border-[#E8EEF3] bg-white p-4 text-sm text-[#243647]">
          {loading ? (
            <p className="text-[#6B7A8C]">Cargando resumen diagnóstico…</p>
          ) : error ? (
            <p className="text-amber-800">{error}</p>
          ) : summary ? (
            <>
              <p>
                <span className="font-semibold text-[#0B2E59]">Rango:</span> {summary.range.from} →{" "}
                {summary.range.to}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-[#0B2E59]">Actualizado:</span>{" "}
                {formatDateTime(summary.updatedAt)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-[#0B2E59]">Último evento:</span>{" "}
                {formatDateTime(summary.lastEventAt)}
              </p>
            </>
          ) : (
            <p className="text-[#6B7A8C]">Sin datos para este período.</p>
          )}
        </section>

        {!loading && !error && totals ? (
          <>
            {empty ? (
              <p className="mt-6 text-sm text-[#6B7A8C]">
                No hay eventos diagnósticos en este período todavía.
              </p>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Procesamientos iniciados" value={totals.processingStarted} />
              <StatCard label="Diagnósticos completados" value={totals.diagnosticCompleted} />
              <StatCard label="Fallos detectados" value={totals.diagnosticFailed} />
              <StatCard label="Tasa de finalización" value={formatRate(totals.completionRate)} />
              <StatCard label="Tasa de fallo" value={formatRate(totals.failureRate)} />
              <StatCard label="Eventos /full/processing" value={totals.processingRouteEvents} />
              <StatCard label="Total eventos telemetría" value={totals.allTelemetryEvents} />
            </div>

            <section className="mt-8 overflow-x-auto rounded-2xl border border-[#E8EEF3] bg-white p-4">
              <h2 className="text-sm font-bold text-[#0B2E59]">Tabla diaria</h2>
              <table className="mt-3 w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E8EEF3] text-[11px] uppercase tracking-wide text-[#6B7A8C]">
                    <th className="py-2 pr-2 font-bold">Fecha</th>
                    <th className="py-2 pr-2 font-bold">Iniciados</th>
                    <th className="py-2 pr-2 font-bold">Completados</th>
                    <th className="py-2 pr-2 font-bold">Fallos</th>
                    <th className="py-2 pr-2 font-bold">Finalización</th>
                    <th className="py-2 pr-2 font-bold">Fallo</th>
                    <th className="py-2 font-bold">Eventos processing</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.daily.map((row) => (
                    <tr key={row.date} className="border-b border-[#F1F5F9] text-[#243647]">
                      <td className="py-2 pr-2 font-mono text-xs">{row.date}</td>
                      <td className="py-2 pr-2 tabular-nums">{row.processingStarted}</td>
                      <td className="py-2 pr-2 tabular-nums">{row.diagnosticCompleted}</td>
                      <td className="py-2 pr-2 tabular-nums">{row.diagnosticFailed}</td>
                      <td className="py-2 pr-2 tabular-nums">{formatRate(row.completionRate)}</td>
                      <td className="py-2 pr-2 tabular-nums">{formatRate(row.failureRate)}</td>
                      <td className="py-2 tabular-nums">{row.processingRouteEvents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="mt-8 rounded-2xl border border-[#E8EEF3] bg-white p-4">
              <h2 className="text-sm font-bold text-[#0B2E59]">Últimos eventos diagnósticos</h2>
              <p className="mt-1 text-xs text-[#6B7A8C]">
                Máximo 20 · sin PII · sample de aggregates diarios.
              </p>
              {summary.recentDiagnosticEvents.length === 0 ? (
                <p className="mt-4 text-sm text-[#6B7A8C]">
                  No hay eventos diagnósticos en la muestra reciente.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-[#E8EEF3]">
                  {summary.recentDiagnosticEvents.map((event) => (
                    <li key={event.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-mono text-xs text-[#6B7A8C]">
                          {formatDateTime(event.createdAt)}
                        </span>
                        <span className="text-sm font-bold text-[#0B2E59]">{event.name}</span>
                      </div>
                      <p className="mt-1 text-xs text-[#6B7A8C]">{event.path}</p>
                      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        {(
                          [
                            "phase",
                            "errorCode",
                            "status",
                            "answerCount",
                            "hasAnswers",
                            "hasResult",
                            "resultFamilyCount",
                          ] as const
                        ).map((key) => {
                          const value = event.properties[key];
                          if (value === undefined || value === null || value === "") return null;
                          return (
                            <div key={key} className="flex gap-1">
                              <dt className="font-semibold text-[#6B7A8C]">{key}:</dt>
                              <dd className="text-[#243647]">{String(value)}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-8 rounded-2xl border border-[#E8EEF3] bg-white p-4">
              <h2 className="text-sm font-bold text-[#0B2E59]">
                Breakdown de fallos (muestra reciente)
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#6B7A8C]">
                Los totales salen del aggregate diario. El desglose por fase/código se calcula sobre
                la muestra reciente disponible.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <BreakdownList
                  title="Por phase"
                  items={summary.recentFailureBreakdown.byPhase}
                />
                <BreakdownList
                  title="Por errorCode"
                  items={summary.recentFailureBreakdown.byErrorCode}
                />
                <BreakdownList
                  title="Por status"
                  items={summary.recentFailureBreakdown.byStatus}
                />
              </div>
            </section>
          </>
        ) : null}

        {!loading ? (
          <p className="mt-6 text-center">
            <button
              type="button"
              onClick={() => void load()}
              className="text-sm font-semibold text-[#1A9BB0] underline"
            >
              Reintentar
            </button>
          </p>
        ) : null}
      </div>
    </main>
  );
}
