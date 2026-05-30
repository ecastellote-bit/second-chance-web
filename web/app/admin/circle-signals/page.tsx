"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type CircleSignalType =
  | "circle_interest"
  | "circle_receive_updates"
  | "circle_access_request"
  | "circle_idea";

type CircleSignalStatus = "active" | "reviewed" | "flagged" | "archived";

type SignalRow = {
  signalId: string;
  circleId: string;
  circleTitle: string;
  actorUserId: string;
  signalType: CircleSignalType;
  note?: string;
  status: CircleSignalStatus;
  createdAt: string;
  updatedAt?: string;
};

const TYPE_LABEL: Record<CircleSignalType, string> = {
  circle_interest: "Me interesa",
  circle_receive_updates: "Recibir movimiento",
  circle_access_request: "Solicitar acceso",
  circle_idea: "Idea para el círculo",
};

const STATUS_FILTERS: { id: "" | CircleSignalStatus; label: string }[] = [
  { id: "", label: "Todas" },
  { id: "active", label: "Activas" },
  { id: "reviewed", label: "Revisadas" },
  { id: "flagged", label: "Flaggeadas" },
  { id: "archived", label: "Archivadas" },
];

export default function CircleSignalsAdminPage() {
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | CircleSignalStatus>("active");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "400" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/circle-signals/list?${params.toString()}`);
      const data = (await res.json()) as {
        ok?: boolean;
        signals?: SignalRow[];
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? data.error ?? "Error al cargar señales");
      }
      setSignals(data.signals ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(signalId: string, status: "reviewed" | "flagged" | "archived") {
    setUpdatingId(signalId);
    setError("");
    try {
      const res = await fetch(`/api/admin/circle-signals/${encodeURIComponent(signalId)}`, {
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A9BB0]">
              Círculos fundadores · P1-D2
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#0B2E59]">Señales de círculos</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7A8C]">
              Interés, movimiento, acceso e ideas — sin contacto directo automático.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/admin/founder-project-signals" className="font-semibold text-[#1A9BB0] underline">
              Señales de proyectos →
            </Link>
            <Link href="/circulos" className="font-semibold text-[#1A9BB0] underline">
              Ver círculos públicos →
            </Link>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.id || "all"}
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

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#6B7A8C]">Cargando…</p>
        ) : signals.length === 0 ? (
          <p className="rounded-xl border border-[#E8EEF3] bg-white p-6 text-sm text-[#6B7A8C]">
            No hay señales con este filtro.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {signals.map((signal) => (
              <li
                key={signal.signalId}
                className="rounded-xl border border-[#E8EEF3] bg-white p-4 text-sm"
              >
                <p className="font-bold text-[#0B2E59]">
                  {signal.circleTitle}{" "}
                  <span className="font-normal text-[#6B7A8C]">({signal.circleId})</span>
                </p>
                <p className="mt-1 text-[#6B7A8C]">
                  {TYPE_LABEL[signal.signalType]} · {signal.status} ·{" "}
                  {new Date(signal.createdAt).toLocaleString("es-AR")}
                </p>
                {signal.note ? (
                  <p className="mt-2 rounded-lg bg-[#F8FAFC] px-3 py-2 text-[#243647]">{signal.note}</p>
                ) : null}
                <p className="mt-2 font-mono text-xs text-[#6B7A8C]">actor: {signal.actorUserId}</p>
                {signal.status === "active" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={updatingId === signal.signalId}
                      onClick={() => updateStatus(signal.signalId, "reviewed")}
                      className="rounded-lg bg-[#0B2E59] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      Marcar revisada
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === signal.signalId}
                      onClick={() => updateStatus(signal.signalId, "flagged")}
                      className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 disabled:opacity-60"
                    >
                      Flaggear
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === signal.signalId}
                      onClick={() => updateStatus(signal.signalId, "archived")}
                      className="rounded-lg border border-[#E8EEF3] px-3 py-1.5 text-xs font-semibold text-[#6B7A8C] disabled:opacity-60"
                    >
                      Archivar
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
