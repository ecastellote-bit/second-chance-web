"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminEntityCard } from "@/components/admin/AdminEntityCard";
import { AdminSummaryCards } from "@/components/admin/AdminSummaryCards";
import { CampaignPulsePanel } from "@/components/admin/CampaignPulsePanel";
import { filterInboxItems } from "@/lib/admin/unifiedModeration/filterInbox";
import { adminFetch } from "@/lib/admin/adminFetch";
import type { UnifiedModerationDashboard } from "@/lib/admin/unifiedModeration/types";

const FILTERS: { id: string; label: string }[] = [
  { id: "attention", label: "Requiere atención" },
  { id: "all", label: "Todo" },
  { id: "reports", label: "Reportes" },
  { id: "projects", label: "Proyectos" },
  { id: "contributions", label: "Aportes" },
  { id: "circles", label: "Círculos" },
  { id: "announcements", label: "Anuncios" },
  { id: "signals", label: "Señales" },
  { id: "formation", label: "Formación" },
  { id: "notifications", label: "Notificaciones" },
];

export function UnifiedAdminDashboard() {
  const [dashboard, setDashboard] = useState<UnifiedModerationDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("attention");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/unified-moderation/dashboard");
      const data = (await res.json()) as {
        ok?: boolean;
        dashboard?: UnifiedModerationDashboard;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.dashboard) {
        throw new Error(data.error ?? "No se pudo cargar el tablero");
      }
      setDashboard(data.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = useMemo(() => {
    if (!dashboard) return [];
    return filterInboxItems(dashboard.items, filter);
  }, [dashboard, filter]);

  return (
    <main className="min-h-[100dvh] bg-[#F8FAFC] font-[family-name:var(--font-inter)] text-[#243647]">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1A9BB0] via-[#C6D92D] to-[#0B2E59]" />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
            VocationUp · Operación
          </p>
          <h1 className="text-[1.75rem] font-bold leading-tight text-[#0B2E59] sm:text-2xl">
            Admin VocationUp — Moderación diaria
          </h1>
          <p className="max-w-3xl text-[14px] leading-relaxed text-[#6B7A8C]">
            Mesa central del barrio. Las rutas profundas siguen disponibles como respaldo técnico.
          </p>
        </header>

        <div className="mb-6 space-y-3 rounded-2xl border border-[#E8EEF3] bg-white p-4 shadow-sm">
          <ul className="space-y-1.5 text-[13px] leading-relaxed text-[#243647]">
            <li>
              <strong>Producción:</strong> moderá en{" "}
              <span className="font-semibold text-[#0B2E59]">www.vocationup.com</span>, no en
              localhost.
            </li>
            <li>
              <strong>Privacidad:</strong> no compartas URLs <code className="text-xs">/admin</code>{" "}
              con fundadores.
            </li>
            <li>
              <strong>Email:</strong> la cola de notificaciones no envía correo real (gestión manual).
            </li>
            <li>
              <strong>Regla:</strong> nada se publica sin moderación (proyectos, aportes, ideas).
            </li>
          </ul>
        </div>

        {dashboard?.storeAlert.show ? (
          <div className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-4 text-sm text-red-950">
            <p className="font-bold">Alerta de entorno</p>
            <p className="mt-1">{dashboard.storeAlert.message}</p>
          </div>
        ) : null}

        <div className="mb-6">
          <CampaignPulsePanel compact />
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {loading || !dashboard ? (
          <p className="text-sm text-[#6B7A8C]">Cargando colas de moderación…</p>
        ) : (
          <>
            <AdminSummaryCards counts={dashboard.counts} />

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={[
                    "vu-focus rounded-full px-3 py-1.5 text-xs font-semibold",
                    filter === f.id
                      ? "bg-[#0B2E59] text-white"
                      : "border border-[#E8EEF3] bg-white text-[#6B7A8C]",
                  ].join(" ")}
                >
                  {f.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => void load()}
                className="vu-focus rounded-full border border-[#E8EEF3] bg-white px-3 py-1.5 text-xs font-semibold text-[#1A9BB0]"
              >
                Actualizar
              </button>
            </div>

            <section className="mt-6">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#6B7A8C]">
                Cola operativa
                {filter === "attention" ? " · requiere atención" : ""}
                <span className="ml-2 font-normal normal-case text-[#9AA8B8]">
                  ({filteredItems.length} ítems)
                </span>
              </h2>

              {filteredItems.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-[#E8EEF3] bg-white p-6 text-center text-sm text-[#6B7A8C]">
                  No hay ítems en esta vista. Probá otro filtro o actualizá.
                </p>
              ) : (
                <ul className="mt-4 flex flex-col gap-3">
                  {filteredItems.map((item) => (
                    <li key={`${item.kind}-${item.id}`}>
                      <AdminEntityCard item={item} onActionDone={load} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-10 rounded-2xl border border-[#E8EEF3] bg-white p-4">
              <h2 className="text-sm font-bold text-[#0B2E59]">Paneles profundos (fallback)</h2>
              <p className="mt-1 text-xs text-[#6B7A8C]">
                Rutas originales preservadas — uso diario desde este tablero, detalle allí si hace
                falta.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {dashboard.deepLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-semibold text-[#1A9BB0] underline"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/admin/casos-humanos" className="text-[#6B7A8C] underline">
                  Casos humanos (diagnóstico)
                </Link>
                <Link href="/admin/observatorio" className="text-[#6B7A8C] underline">
                  Observatorio
                </Link>
              </div>
            </section>

            <p className="mt-6 text-center text-[10px] text-[#9AA8B8]">
              Actualizado {new Date(dashboard.generatedAt).toLocaleString("es-AR")}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
