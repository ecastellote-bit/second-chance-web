"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type SignalType =
  | "project_follow_close"
  | "project_interest"
  | "project_possible_contribution"
  | "project_join_exploration";

type SignalStatus = "active" | "withdrawn" | "updated" | "reviewed" | "flagged";

type SignalRow = {
  signalId: string;
  projectId: string;
  projectTitle: string;
  actorUserId: string;
  signalType: SignalType;
  capabilities?: string[];
  status: SignalStatus;
  createdAt: string;
  updatedAt?: string;
  source: "project_page" | "projects_list" | "activation";
};

type ProjectSummary = {
  projectId: string;
  projectTitle: string;
  projectStatus: "published";
  totals: Record<SignalType, number>;
};

const SIGNAL_TYPE_LABEL: Record<SignalType, string> = {
  project_follow_close: "Seguir de cerca",
  project_interest: "Me interesa",
  project_possible_contribution: "Tal vez podría aportar",
  project_join_exploration: "Quiero explorar si puedo sumarme",
};

const STATUS_FILTERS: { id: "" | SignalStatus; label: string }[] = [
  { id: "", label: "Todos" },
  { id: "active", label: "Activas" },
  { id: "updated", label: "Actualizadas" },
  { id: "reviewed", label: "Revisadas" },
  { id: "flagged", label: "Flaggeadas" },
];

const TYPE_FILTERS: { id: "" | SignalType; label: string }[] = [
  { id: "", label: "Todas" },
  { id: "project_follow_close", label: "Seguir de cerca" },
  { id: "project_interest", label: "Me interesa" },
  { id: "project_possible_contribution", label: "Tal vez podría aportar" },
  { id: "project_join_exploration", label: "Explorar sumarme" },
];

export default function FounderProjectSignalsAdminPage() {
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [summary, setSummary] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | SignalStatus>("");
  const [typeFilter, setTypeFilter] = useState<"" | SignalType>("");
  const [projectFilter, setProjectFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "400" });
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("signalType", typeFilter);
      if (projectFilter.trim()) params.set("projectId", projectFilter.trim());

      const res = await fetch(`/api/admin/founder-project-signals/list?${params.toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        signals?: SignalRow[];
        summaryByProject?: ProjectSummary[];
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? data.error ?? "Error al cargar señales");
      }
      setSignals(data.signals ?? []);
      setSummary(data.summaryByProject ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, projectFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const summaryRows = useMemo(() => summary.slice(0, 12), [summary]);

  async function updateStatus(signalId: string, status: "reviewed" | "flagged") {
    setUpdatingId(signalId);
    setError("");
    try {
      const res = await fetch(`/api/admin/founder-project-signals/${encodeURIComponent(signalId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "No se pudo actualizar");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 font-[family-name:var(--font-inter)]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
              Comunidad Viva · P1-C1
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">
              Señales sobre proyectos fundadores
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
              Registro operativo de señales graduales. No habilita contacto directo entre usuarios.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/admin/founder-project-seeds" className="font-semibold text-[#1A9BB0] underline">
              Proyectos fundadores →
            </Link>
            <Link href="/admin/observatorio" className="font-semibold text-[#1A9BB0] underline">
              Observatorio →
            </Link>
          </div>
        </div>

        <div className="mb-4 space-y-3 rounded-2xl border border-[#E8EEF3] bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.id || "status_all"}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  statusFilter === item.id
                    ? "bg-[#0B2E59] text-white"
                    : "border border-[#E8EEF3] bg-white text-[#6B7A8C]",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((item) => (
              <button
                key={item.id || "type_all"}
                type="button"
                onClick={() => setTypeFilter(item.id)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  typeFilter === item.id
                    ? "bg-[#1A9BB0] text-white"
                    : "border border-[#E8EEF3] bg-white text-[#6B7A8C]",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              placeholder="Filtrar por projectId (seed_...)"
              className="min-w-[280px] flex-1 rounded-xl border border-[#E8EEF3] px-3 py-2 text-sm text-[#243647]"
            />
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-xl border border-[#E8EEF3] px-3 py-2 text-xs font-semibold text-[#6B7A8C]"
            >
              Actualizar
            </button>
          </div>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {summaryRows.length > 0 ? (
          <section className="mb-5 rounded-2xl border border-[#E8EEF3] bg-white p-4">
            <h2 className="text-sm font-bold text-[#0B2E59]">Resumen por proyecto</h2>
            <ul className="mt-3 space-y-2 text-xs text-[#6B7A8C]">
              {summaryRows.map((item) => (
                <li key={item.projectId} className="rounded-xl border border-[#E8EEF3] p-3">
                  <p className="font-semibold text-[#0B2E59]">{item.projectTitle}</p>
                  <p className="mt-1 font-mono">{item.projectId}</p>
                  <p className="mt-1">
                    Seguir: {item.totals.project_follow_close} · Interés: {item.totals.project_interest}
                    {" · "}Aportar: {item.totals.project_possible_contribution} · Explorar:{" "}
                    {item.totals.project_join_exploration}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando señales…</p>
        ) : signals.length === 0 ? (
          <p className="text-sm text-[#6B7A8C]">No hay señales para estos filtros.</p>
        ) : (
          <ul className="space-y-3">
            {signals.map((signal) => (
              <li key={signal.signalId} className="rounded-2xl border border-[#E8EEF3] bg-white p-4">
                <p className="text-[10px] font-mono text-[#6B7A8C]">{signal.signalId}</p>
                <h3 className="mt-1 text-base font-bold text-[#0B2E59]">{signal.projectTitle}</h3>
                <p className="mt-1 text-xs text-[#6B7A8C]">
                  {SIGNAL_TYPE_LABEL[signal.signalType]} · estado: {signal.status}
                </p>
                <p className="mt-1 text-xs text-[#6B7A8C]">
                  actorUserId: <span className="font-mono">{signal.actorUserId}</span>
                </p>
                <p className="mt-1 text-xs text-[#6B7A8C]">
                  {new Date(signal.updatedAt ?? signal.createdAt).toLocaleString("es-AR")} · {signal.source}
                </p>
                {Array.isArray(signal.capabilities) && signal.capabilities.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {signal.capabilities.map((cap) => (
                      <span
                        key={`${signal.signalId}:${cap}`}
                        className="rounded-full bg-[#E6F6FA] px-2 py-1 text-[11px] text-[#0B2E59]"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {signal.status !== "reviewed" ? (
                    <button
                      type="button"
                      disabled={updatingId === signal.signalId}
                      onClick={() => void updateStatus(signal.signalId, "reviewed")}
                      className="rounded-xl bg-[#0B2E59] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Marcar revisada
                    </button>
                  ) : null}
                  {signal.status !== "flagged" ? (
                    <button
                      type="button"
                      disabled={updatingId === signal.signalId}
                      onClick={() => void updateStatus(signal.signalId, "flagged")}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-60"
                    >
                      Flagear sospechosa
                    </button>
                  ) : null}
                  <Link
                    href={`/proyectos/semilla/${signal.projectId}`}
                    className="rounded-xl border border-[#1A9BB0]/35 px-3 py-2 text-xs font-semibold text-[#1A9BB0]"
                  >
                    Ver ficha del proyecto
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
