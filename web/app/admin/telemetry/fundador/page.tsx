"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/admin/adminFetch";
import type { TelemetryDailyAggregate, TelemetrySampleEvent } from "@/lib/telemetry/types";

const SAFE_PROPERTY_KEYS = [
  "ctaId",
  "destination",
  "section",
  "choiceId",
  "depth",
  "trigger",
  "hasFreeText",
  "freeTextLength",
  "labelKey",
  "variant",
  "route",
  "source",
] as const;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseDateParam(value: string | null): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return todayIso();
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

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

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function countByName(aggregate: TelemetryDailyAggregate | null, name: string): number {
  return aggregate?.byName?.[name] ?? 0;
}

function pickSafeProperties(
  properties: Record<string, string | number | boolean | null> | undefined,
): Record<string, string | number | boolean | null> {
  if (!properties) return {};
  const out: Record<string, string | number | boolean | null> = {};
  for (const key of SAFE_PROPERTY_KEYS) {
    const value = properties[key];
    if (value !== undefined && value !== null && value !== "") {
      out[key] = value;
    }
  }
  return out;
}

function fundadorRecentEvents(aggregate: TelemetryDailyAggregate | null): TelemetrySampleEvent[] {
  if (!aggregate?.sampleRecentEvents?.length) return [];
  return aggregate.sampleRecentEvents
    .filter((event) => event.path === "/fundador")
    .slice(0, 20);
}

function scrollDepthSampleHint(aggregate: TelemetryDailyAggregate | null): string | undefined {
  const depths = fundadorRecentEvents(aggregate)
    .filter((event) => event.name === "scroll_depth_reached")
    .map((event) => event.properties?.depth)
    .filter((d): d is number => typeof d === "number");
  if (depths.length === 0) return undefined;
  const unique = [...new Set(depths)].sort((a, b) => a - b);
  return `Muestra reciente: ${unique.join(" / ")} (no separa 50 y 90 en el total global)`;
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

function FundadorTelemetryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = useMemo(
    () => parseDateParam(searchParams.get("date")),
    [searchParams],
  );

  const [aggregate, setAggregate] = useState<TelemetryDailyAggregate | null>(null);
  const [storeMeta, setStoreMeta] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    setAggregate(null);
    setStoreMeta(null);

    try {
      const res = await adminFetch(`/api/admin/telemetry/daily?date=${date}`);
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        aggregate?: TelemetryDailyAggregate;
        store?: { read?: string };
      };

      if (!res.ok || !data.ok) {
        if (data.error === "invalid_date" || res.status === 400) {
          setNotFound(true);
          return;
        }
        setError("No se pudo cargar la telemetría. Reintentá.");
        return;
      }

      setAggregate(data.aggregate ?? null);
      setStoreMeta(data.store?.read ?? null);
    } catch {
      setError("No se pudo cargar la telemetría. Reintentá.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const recentEvents = fundadorRecentEvents(aggregate);
  const scrollHint = scrollDepthSampleHint(aggregate);

  function navigateToDate(nextDate: string) {
    router.push(`/admin/telemetry/fundador?date=${nextDate}`);
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin" className="text-sm font-semibold text-[#1A9BB0] underline">
          ← Admin
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-[#0B2E59]">Observabilidad /fundador</h1>
        <p className="mt-1 text-sm text-[#6B7A8C]">
          Eventos internos seguros de la landing fundadora.
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-[#0B2E59]">Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                if (e.target.value) navigateToDate(e.target.value);
              }}
              className="rounded-xl border border-[#E8EEF3] bg-white px-3 py-2 text-[#0B2E59]"
            />
          </label>
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={() => navigateToDate(shiftDate(date, -1))}
              className="rounded-xl border border-[#E8EEF3] bg-white px-3 py-2 font-semibold text-[#0B2E59]"
            >
              ← Ayer
            </button>
            <button
              type="button"
              onClick={() => navigateToDate(todayIso())}
              className="rounded-xl border border-[#E8EEF3] bg-white px-3 py-2 font-semibold text-[#0B2E59]"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => navigateToDate(shiftDate(date, 1))}
              className="rounded-xl border border-[#E8EEF3] bg-white px-3 py-2 font-semibold text-[#0B2E59]"
            >
              Mañana →
            </button>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-[#E8EEF3] bg-white p-4 text-sm text-[#243647]">
          <p>
            <span className="font-semibold text-[#0B2E59]">Fecha consultada:</span> {date}
          </p>
          {loading ? (
            <p className="mt-2 text-[#6B7A8C]">Cargando aggregate diario…</p>
          ) : error ? (
            <p className="mt-2 text-amber-800">{error}</p>
          ) : notFound ? (
            <p className="mt-2 text-[#6B7A8C]">No encontramos aggregate para esta fecha.</p>
          ) : aggregate ? (
            <>
              <p className="mt-2">
                <span className="font-semibold text-[#0B2E59]">Total eventos (día):</span>{" "}
                {aggregate.totalEvents}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-[#0B2E59]">Actualizado:</span>{" "}
                {formatDateTime(aggregate.updatedAt)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-[#0B2E59]">Último evento:</span>{" "}
                {formatDateTime(aggregate.lastEventAt)}
              </p>
              {storeMeta ? (
                <p className="mt-1 text-xs text-[#6B7A8C]">Fuente: {storeMeta}</p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-[#6B7A8C]">Sin datos para esta fecha.</p>
          )}
        </section>

        {!loading && !error && !notFound && aggregate ? (
          <>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatCard
                label="Visitas landing"
                value={countByName(aggregate, "founder_landing_viewed")}
              />
              <StatCard
                label="Clicks CTA primario"
                value={countByName(aggregate, "founder_primary_cta_clicked")}
              />
              <StatCard
                label="Clicks CTA secundario"
                value={countByName(aggregate, "founder_secondary_cta_clicked")}
              />
              <StatCard
                label="Microopciones elegidas"
                value={countByName(aggregate, "founder_microchoice_selected")}
              />
              <StatCard
                label="Scroll 50/90"
                value={countByName(aggregate, "scroll_depth_reached")}
                hint={scrollHint}
              />
              <StatCard
                label="Feedback abierto"
                value={countByName(aggregate, "founder_exit_feedback_opened")}
              />
              <StatCard
                label="Feedback enviado"
                value={countByName(aggregate, "founder_exit_feedback_submitted")}
              />
              <StatCard
                label="Total eventos /fundador"
                value={aggregate.byPath?.["/fundador"] ?? 0}
              />
            </div>

            <section className="mt-8 rounded-2xl border border-[#E8EEF3] bg-white p-4">
              <h2 className="text-sm font-bold text-[#0B2E59]">Últimos eventos /fundador</h2>
              <p className="mt-1 text-xs text-[#6B7A8C]">
                Muestra reciente del aggregate diario (máx. 20). Sin texto libre ni PII.
              </p>

              {recentEvents.length === 0 ? (
                <p className="mt-4 text-sm text-[#6B7A8C]">
                  No hay eventos de /fundador para esta fecha todavía.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-[#E8EEF3]">
                  {recentEvents.map((event) => {
                    const safeProps = pickSafeProperties(event.properties);
                    const propEntries = Object.entries(safeProps);
                    return (
                      <li key={event.eventId} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-mono text-xs text-[#6B7A8C]">
                            {formatTime(event.timestamp)}
                          </span>
                          <span className="text-sm font-bold text-[#0B2E59]">{event.name}</span>
                        </div>
                        <p className="mt-1 text-xs text-[#6B7A8C]">{event.path}</p>
                        {propEntries.length > 0 ? (
                          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            {propEntries.map(([key, value]) => (
                              <div key={key} className="flex gap-1">
                                <dt className="font-semibold text-[#6B7A8C]">{key}:</dt>
                                <dd className="text-[#243647]">{String(value)}</dd>
                              </div>
                            ))}
                          </dl>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        ) : null}

        {!loading && !error ? (
          <p className="mt-6 text-center">
            <button
              type="button"
              onClick={load}
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

export default function FundadorTelemetryAdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8FAFC] px-4 py-10">
          <div className="mx-auto max-w-4xl text-sm text-[#6B7A8C]">Cargando…</div>
        </main>
      }
    >
      <FundadorTelemetryContent />
    </Suspense>
  );
}
